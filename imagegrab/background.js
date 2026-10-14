/* Service Worker 负责会话、跨域读取和浏览器下载，不依赖 DOM。 */
chrome.runtime.onMessage.addListener((message, sender, reply) => {
  (async () => {
    if (sender.id !== chrome.runtime.id) throw new Error('非法请求来源');
    if (message.type === 'CREATE_GALLERY') {
      if (!sender.tab || !Array.isArray(message.data?.images)) throw new Error('无效图片会话');
      const id = crypto.randomUUID();
      await chrome.storage.local.set({['session_' + id]: message.data});
      // 保留最近十次提取，避免扩展存储无限增长。
      const values = await chrome.storage.local.get(null);
      const old = Object.keys(values).filter(k => k.startsWith('session_')).sort((a,b) => values[b].createdAt - values[a].createdAt).slice(10);
      if (old.length) await chrome.storage.local.remove(old);
      await chrome.tabs.create({url: chrome.runtime.getURL('gallery.html') + '?session=' + id});
      return {ok: true};
    }
    // 仅扩展页允许读取图片和触发下载。
    if (!sender.url?.startsWith(chrome.runtime.getURL(''))) throw new Error('请在扩展工作台操作');
    if (message.type === 'FETCH_IMAGE') {
      const u = new URL(message.url);
      if (!['http:', 'https:'].includes(u.protocol)) throw new Error('不支持的图片地址');
      const response = await fetch(u.href, {credentials: 'omit', signal: AbortSignal.timeout(20000)});
      if (!response.ok) throw new Error('图片服务器返回 HTTP ' + response.status);
      const blob = await response.blob();
      if (blob.size > 25 * 1024 * 1024) throw new Error('单张图片超过 25 MB');
      if (blob.type && !blob.type.startsWith('image/')) throw new Error('地址返回的不是图片');
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let binary = '';
      for (let i = 0; i < bytes.length; i += 16384) binary += String.fromCharCode(...bytes.subarray(i, i + 16384));
      return {ok: true, data: 'data:' + (blob.type || 'image/png') + ';base64,' + btoa(binary)};
    }
    if (message.type === 'DOWNLOAD') {
      if (!/^data:image\/png;base64,/.test(message.data)) throw new Error('仅接受已转换的 PNG');
      const number = String(message.index).padStart(3, '0');
      const id = await chrome.downloads.download({url: message.data, filename: 'ImageGrab/商品图_' + number + '.png', saveAs: false, conflictAction: 'uniquify'});
      return {ok: true, id};
    }
    throw new Error('未知操作');
  })().then(reply).catch(e => reply({ok: false, error: e.message}));
  return true;
});
