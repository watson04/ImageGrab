(() => {
  if (globalThis.__imageGrabInjected) return;
  globalThis.__imageGrabInjected = true;
  let busy = false;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  function updateButton() {
    const existing = document.getElementById('imagegrab-button');
    if (!ImageGrabCore.detailPage(location.href)) { existing?.remove(); return; }
    if (existing) return;
    const button = document.createElement('button');
    button.id = 'imagegrab-button'; button.textContent = '获取图片';
    button.addEventListener('click', () => extract().catch(showError));
    document.body.append(button);
  }
  function showError(error) { alert('图提取：' + error.message); }
  async function extract() {
    if (busy) throw new Error('正在提取，请稍候');
    if (!ImageGrabCore.detailPage(location.href)) throw new Error('请先打开商品详情页');
    busy = true;
    const button = document.getElementById('imagegrab-button');
    const originalY = window.scrollY;
    try {
      if (button) { button.disabled = true; button.textContent = '正在加载图片…'; }
      // 有限滚动触发懒加载；结束后恢复浏览位置，避免无限滚动。
      const limit = Math.min(document.documentElement.scrollHeight, 24000);
      for (let y = 0; y < limit; y += Math.max(600, innerHeight * .85)) {
        window.scrollTo(0, y); await sleep(140);
      }
      await sleep(300);
      const candidates = new Map();
      function add(raw, element, kind) {
        const url = ImageGrabCore.normalize(raw, location.href);
        if (!url || /(?:spacer|placeholder|loading|favicon|sprite)(?:[._/-]|$)/i.test(url)) return;
        const w = element.naturalWidth || 0, h = element.naturalHeight || 0;
        if (w && h && (w < 100 || h < 100)) return;
        if (!candidates.has(url)) candidates.set(url, {url, width: w, height: h, kind});
      }
      // 扫描开放的 Shadow DOM；跨域 iframe 受浏览器隔离限制。
      function scan(scope) {
        for (const el of scope.querySelectorAll('*')) {
          if (el.tagName === 'IMG') {
            [el.currentSrc, el.getAttribute('src'), ...['data-src','data-lazy-src','data-original','data-ks-lazyload','data-lazyload','data-url'].map(a => el.getAttribute(a))].forEach(u => add(u, el, '商品图片'));
            ImageGrabCore.srcset(el.getAttribute('srcset')).forEach(u => add(u, el, '响应式图片'));
          }
          if (el.tagName === 'SOURCE') ImageGrabCore.srcset(el.getAttribute('srcset')).forEach(u => add(u, el, '响应式图片'));
          ImageGrabCore.backgrounds(getComputedStyle(el).backgroundImage).forEach(u => add(u, el, '背景图片'));
          if (el.shadowRoot) scan(el.shadowRoot);
        }
      }
      scan(document);
      const images = [...candidates.values()].slice(0, 600);
      if (!images.length) throw new Error('未找到图片，请确认商品已加载后重试');
      const response = await chrome.runtime.sendMessage({type: 'CREATE_GALLERY', data: {title: document.title, source: location.href, images, createdAt: Date.now()}});
      if (!response?.ok) throw new Error(response?.error || '无法打开图片工作台');
      return {count: images.length};
    } finally {
      window.scrollTo(0, originalY); busy = false;
      if (button) { button.disabled = false; button.textContent = '获取图片'; }
    }
  }
  chrome.runtime.onMessage.addListener((message, sender, reply) => {
    if (message.type !== 'EXTRACT') return;
    extract().then(x => reply({ok: true, ...x})).catch(e => reply({ok: false, error: e.message})); return true;
  });
  updateButton();
  // 兼容平台单页应用中的商品路由切换。
  setInterval(updateButton, 1500);
})();
