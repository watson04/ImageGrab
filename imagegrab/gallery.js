let items = [], selected = new Set(), running = false;
const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
function visible() {
  let list = items.filter(x => !x.failed && x.width >= Number($('size').value) && x.height >= Number($('size').value));
  if ($('sort').value === 'size') list.sort((a,b) => b.width*b.height - a.width*a.height);
  return list;
}
function count() {
  const chosen = visible().filter(x => selected.has(x.id)).length;
  $('count').textContent = '已选 ' + chosen + ' 张';
  $('summary').textContent = visible().length + ' 张可用 / ' + items.length + ' 张候选';
  $('download').disabled = running || !chosen;
}
function render() {
  $('grid').replaceChildren();
  const list = visible(); $('empty').hidden = list.length > 0;
  for (const item of list) {
    const card = document.createElement('article'); card.className = 'card' + (selected.has(item.id) ? ' selected' : '');
    const picture = document.createElement('div'); picture.className = 'picture';
    const img = document.createElement('img'); img.src = item.url; img.alt = '商品图片 ' + (item.id + 1); img.loading = 'lazy';
    img.onclick = () => { $('preview').querySelector('img').src = item.url; $('preview').querySelector('p').textContent = item.width + ' × ' + item.height + ' px'; $('preview').showModal(); };
    const check = document.createElement('input'); check.type = 'checkbox'; check.checked = selected.has(item.id); check.disabled = running; check.setAttribute('aria-label', '选择图片 ' + (item.id + 1));
    check.onchange = () => { check.checked ? selected.add(item.id) : selected.delete(item.id); card.classList.toggle('selected', check.checked); count(); };
    const index = document.createElement('span'); index.className = 'index'; index.textContent = String(item.id + 1).padStart(3, '0');
    picture.append(img, check, index);
    const meta = document.createElement('div'); meta.className = 'meta';
    const title = document.createElement('strong'); title.textContent = '商品图 ' + String(item.id + 1).padStart(3, '0');
    const link = document.createElement('a'); link.textContent = '原图 ↗'; link.href = item.url; link.target = '_blank'; link.rel = 'noopener';
    const desc = document.createElement('p'); desc.textContent = item.width + ' × ' + item.height + ' px · ' + item.kind;
    meta.append(link, title, desc); card.append(picture, meta); $('grid').append(card);
  }
  count();
}
async function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image(); const timer = setTimeout(() => { img.src = ''; reject(new Error('图片加载超时')); }, 15000);
    img.onload = () => { clearTimeout(timer); resolve(img); };
    img.onerror = () => { clearTimeout(timer); reject(new Error('图片无法访问')); }; img.src = url;
  });
}
async function readBytes(url) {
  const result = await chrome.runtime.sendMessage({type:'FETCH_IMAGE', url});
  if (!result?.ok) throw new Error(result?.error || '读取图片失败'); return result.data;
}
async function toPNG(item) {
  const image = await loadImage(await readBytes(item.url));
  if (image.naturalWidth * image.naturalHeight > 40000000) throw new Error('图片超过 4000 万像素');
  const canvas = document.createElement('canvas'); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
  canvas.getContext('2d').drawImage(image,0,0);
  const result = canvas.toDataURL('image/png'); canvas.width = canvas.height = 0;
  if (!result.startsWith('data:image/png;')) throw new Error('PNG 转换失败'); return result;
}
// 查询当前状态再监听，避免小图片在监听前已经下载完成。
function completion(id) {
  return new Promise((resolve, reject) => {
    const finish = (error) => { chrome.downloads.onChanged.removeListener(listener); clearTimeout(timer); error ? reject(new Error(error)) : resolve(); };
    const listener = delta => { if (delta.id !== id) return; if (delta.state?.current === 'complete') finish(); if (delta.state?.current === 'interrupted') finish(delta.error?.current || '下载被中断'); };
    const timer = setTimeout(() => finish('下载等待超时，请查看浏览器下载记录'), 60000);
    chrome.downloads.onChanged.addListener(listener);
    chrome.downloads.search({id}).then(([entry]) => { if (entry?.state === 'complete') finish(); else if (entry?.state === 'interrupted') finish(entry.error || '下载被中断'); }).catch(e => finish(e.message));
  });
}
$('all').onclick = () => { const list = visible(); const every = list.every(x => selected.has(x.id)); list.forEach(x => every ? selected.delete(x.id) : selected.add(x.id)); render(); };
$('invert').onclick = () => { visible().forEach(x => selected.has(x.id) ? selected.delete(x.id) : selected.add(x.id)); render(); };
$('size').onchange = render; $('sort').onchange = render;
$('close').onclick = () => $('preview').close();
$('download').onclick = async () => {
  const list = visible().filter(x => selected.has(x.id)); if (!list.length || running) return;
  // 只对本次选择的额外图片源申请权限；已配置的电商 CDN 不重复申请。
  const origins = [...new Set(list.map(x => { const u = new URL(x.url); return u.protocol + '//' + u.hostname + '/*'; }))];
  try {
    if (!await chrome.permissions.request({origins})) throw new Error('未授予图片来源访问权限');
  } catch (e) { $('status').textContent = e.message; return; }
  running = true; ['all','invert','size','sort'].forEach(id => $(id).disabled = true); render();
  $('progress').max = list.length; $('progress').value = 0; $('errors').querySelector('ul').replaceChildren(); $('errors').hidden = true;
  let success = 0, fail = 0;
  for (let i = 0; i < list.length; i++) {
    $('status').textContent = '正在转换并下载 ' + (i+1) + ' / ' + list.length + '…';
    try {
      const data = await toPNG(list[i]);
      const result = await chrome.runtime.sendMessage({type:'DOWNLOAD', data, index:list[i].id+1});
      if (!result?.ok) throw new Error(result?.error || '下载失败');
      await completion(result.id); success++;
    } catch (e) {
      fail++; $('errors').hidden = false;
      const li = document.createElement('li'); li.textContent = '商品图 ' + (list[i].id+1) + '：' + e.message; $('errors').querySelector('ul').append(li);
    }
    $('progress').value = i+1;
  }
  running = false; ['all','invert','size','sort'].forEach(id => $(id).disabled = false); render();
  $('status').textContent = '下载完成：成功 ' + success + ' 张，失败 ' + fail + ' 张。文件位于下载目录 / ImageGrab。';
};
(async () => {
  if (!globalThis.chrome?.runtime?.id) { $('source').textContent = '请加载扩展后，从商品页打开工作台；此页面需要 Chrome 扩展环境。'; return; }
  const id = params.get('session'); const value = await chrome.storage.local.get('session_' + id); const session = value['session_' + id];
  if (!session) { $('source').textContent = '提取记录不存在或已过期，请返回商品页重新获取图片。'; return; }
  $('source').textContent = session.title + ' · ' + new URL(session.source).hostname;
  items = session.images.map((x,id) => ({...x,id})); $('status').textContent = '正在校验图片尺寸…';
  let cursor = 0;
  // 六路并发校验；DOM 中的未知尺寸不能直接判断为小图。
  await Promise.all(Array.from({length: Math.min(6,items.length)}, async () => {
    while (cursor < items.length) {
      const item = items[cursor++];
      try { const img = await loadImage(item.url); item.width = img.naturalWidth; item.height = img.naturalHeight; if (item.width >= 100 && item.height >= 100) selected.add(item.id); }
      catch { item.failed = true; }
    }
  }));
  $('status').textContent = '已排除小图和无法加载的图片。点击缩略图可预览原图。'; render();
})().catch(e => { $('status').textContent = '读取失败：' + e.message; });
