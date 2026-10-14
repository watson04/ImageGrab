document.getElementById('extract').onclick = async () => {
  const button = document.getElementById('extract'), status = document.getElementById('status');
  button.disabled = true; status.textContent = '正在扫描与加载懒加载图片…';
  try {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    const result = await chrome.tabs.sendMessage(tab.id, {type: 'EXTRACT'});
    status.textContent = result.ok ? '已提取 ' + result.count + ' 张图片' : result.error;
  } catch { status.textContent = '请打开支持的平台商品详情页，安装后需刷新页面。'; }
  finally { button.disabled = false; }
};
document.getElementById('latest').onclick = async () => {
  const values = await chrome.storage.local.get(null);
  const key = Object.keys(values).filter(k => k.startsWith('session_')).sort((a,b) => values[b].createdAt - values[a].createdAt)[0];
  if (key) chrome.tabs.create({url: chrome.runtime.getURL('gallery.html') + '?session=' + key.slice(8)});
  else document.getElementById('status').textContent = '还没有提取记录，请先获取图片。';
};
