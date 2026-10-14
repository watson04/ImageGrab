document.documentElement.classList.add('js-ready');
const menu = document.getElementById('menu'), links = document.getElementById('links');
menu.onclick = () => { const open = links.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); };
links.querySelectorAll('a').forEach(a => a.onclick = () => { links.classList.remove('open'); menu.setAttribute('aria-expanded','false'); });
const observer = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } }), {threshold:.08});
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
const nav = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { links.querySelectorAll('a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id)); } }), {rootMargin:'-15% 0px -55% 0px'});
document.querySelectorAll('main>section[id]').forEach(el => nav.observe(el));
document.getElementById('copy').onclick = async function () {
  try { await navigator.clipboard.writeText('chrome://extensions'); this.querySelector('span').textContent = '已复制'; }
  catch { this.querySelector('span').textContent = '请手动复制'; }
};
