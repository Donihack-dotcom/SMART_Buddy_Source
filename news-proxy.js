// Buddy ↔ Buddy News байланысы.
// Студенттің браузері жаңалықтарды Buddy-дің өз адресінен алады (/api/news, /news-media/…), ал Buddy сервері
// оларды жаңалықтар серверінен (NEWS_URL, әдепкі http://127.0.0.1:8100) әкеледі. Артықшылығы:
//  • бір ғана сілтеме/туннель жеткілікті, әкімші панелі сыртқа ашылмайды;
//  • жаңалықтар сервері уақытша өшсе, соңғы алынған жаңалықтар көрсетіле береді (кэш).
const fs = require('node:fs');
const path = require('node:path');

const NEWS_URL = (process.env.NEWS_URL || 'http://127.0.0.1:8100').replace(/\/+$/, '');
const FORMAT_JS = path.join(__dirname, 'news-server', 'public', 'format.js');
const TTL = 20e3;                         // жаңалықтар тізімі 20 секунд кэште тұрады
const cache = { list: null, at: 0, items: new Map() };

const media = n => ({ ...n, cover: n.cover ? n.cover.replace(/^\/uploads\//, '/news-media/') : '' });
function send(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
}
async function getJSON(p) {
  const r = await fetch(NEWS_URL + p, { signal: AbortSignal.timeout(4000) });
  if (r.status === 404) { const e = new Error('not_found'); e.status = 404; throw e; }
  if (!r.ok) throw new Error('news ' + r.status);
  return r.json();
}

async function list(res) {
  if (cache.list && Date.now() - cache.at < TTL) return send(res, 200, { ...cache.list, live: true });
  try {
    const j = await getJSON('/api/public/news?limit=60');
    cache.list = { news: (j.news || []).map(media), categories: j.categories || [], at: j.at };
    cache.at = Date.now();
    return send(res, 200, { ...cache.list, live: true });
  } catch (e) {
    console.error('[news]', e.message);
    if (cache.list) return send(res, 200, { ...cache.list, live: false });   // сервер өшсе — соңғы нұсқа
    return send(res, 503, { error: 'news_offline', news: [] });
  }
}
async function one(res, id) {
  try {
    const j = await getJSON('/api/public/news/' + id);
    const item = media(j.news); cache.items.set(id, item);
    return send(res, 200, { news: item, live: true });
  } catch (e) {
    if (e.status === 404) { cache.items.delete(id); return send(res, 404, { error: 'not_found' }); }
    if (cache.items.has(id)) return send(res, 200, { news: cache.items.get(id), live: false });
    return send(res, 503, { error: 'news_offline' });
  }
}
async function image(res, file) {
  try {
    const r = await fetch(NEWS_URL + '/uploads/' + file, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) { res.writeHead(404).end(); return; }
    const type = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }[file.split('.').pop()];
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'public, max-age=86400', 'X-Content-Type-Options': 'nosniff' });
    res.end(Buffer.from(await r.arrayBuffer()));
  } catch { res.writeHead(504).end(); }
}

// true қайтарса — сұрау өңделді.
function handle(req, res, pathname) {
  if (req.method !== 'GET') return false;
  if (pathname === '/api/news') { list(res); return true; }
  const m = /^\/api\/news\/(\d{1,9})$/.exec(pathname);
  if (m) { one(res, m[1]); return true; }
  const f = /^\/news-media\/([a-f0-9]{24}\.(?:jpg|png|webp))$/.exec(pathname);
  if (f) { image(res, f[1]); return true; }
  if (pathname === '/news-format.js') {   // мәтінді пішімдеу — әкімші панелімен бірдей (бір файл)
    fs.readFile(FORMAT_JS, (err, data) => {
      if (err) { res.writeHead(404).end(); return; }
      res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-cache' }).end(data);
    });
    return true;
  }
  return false;
}

module.exports = { handle, NEWS_URL };
