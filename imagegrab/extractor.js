/* 共享纯函数，可同时用于浏览器提取与 Node 测试。 */
(function (root) {
  const normalize = (value, base) => {
    try {
      if (!value || /^(data:|blob:|javascript:)/i.test(value.trim())) return null;
      const url = new URL(value.trim(), base);
      return /^https?:$/.test(url.protocol) ? url.href.split('#')[0] : null;
    } catch { return null; }
  };
  const srcset = value => (value || '').split(',').map(x => x.trim().split(/\s+/)[0]).filter(Boolean);
  const backgrounds = value => [...(value || '').matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)].map(x => x[1]);
  function detailPage(input) {
    const u = new URL(input), h = u.hostname, p = u.pathname;
    if (['localhost', '127.0.0.1'].includes(h)) return ['/demo/product.html', '/docs/demo/product.html'].includes(p);
    if (/(^|\.)jd\.com$/.test(h)) return /\/\d+\.html$/.test(p) || /product|item|detail/.test(p);
    if (/(^|\.)(taobao|tmall)\.com$/.test(h)) return /item|detail/.test(p) && (u.searchParams.has('id') || /detail/.test(p));
    if (/(^|\.)(pinduoduo|yangkeduo)\.com$/.test(h)) return /goods|product|detail/.test(p + u.hash);
    return false;
  }
  const api = { normalize, srcset, backgrounds, detailPage };
  root.ImageGrabCore = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);
