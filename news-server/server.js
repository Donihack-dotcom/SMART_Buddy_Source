// Buddy News — жаңалықтар сервері (бөлек қызмет, тәуелділіксіз, Node.js 22.5+).
//   Әкімші панелі:  http://localhost:8100      (жаңалық жазу, сурет қосу, жариялау, бекіту, өшіру)
//   Ашық API:       GET /api/public/news, GET /api/public/news/<id>, GET /uploads/<файл>
// Buddy сервері (../server.js) осы ашық API-ден жаңалықтарды алып, студенттерге «Жаңалықтар» бөлімінде көрсетеді.
// Қауіпсіздік: әдепкіде тек 127.0.0.1-де тыңдайды — әкімші панелі тек осы компьютерден ашылады,
// ал студенттер жаңалықтарды Buddy арқылы көреді. Басқа адрес керек болса: NEWS_HOST=0.0.0.0.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const PORT = Number(process.env.NEWS_PORT) || 8100;
const HOST = process.env.NEWS_HOST || '127.0.0.1';
const DATA = process.env.NEWS_DATA || path.join(__dirname, 'data');
const UPLOADS = path.join(DATA, 'uploads');
const PUBLIC = path.join(__dirname, 'public');
fs.mkdirSync(UPLOADS, { recursive: true });

const db = new DatabaseSync(path.join(DATA, 'news.db'));
db.exec(`
PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS admin (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, expires_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS news (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'general',
  cover TEXT NOT NULL DEFAULT '',
  author TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',      -- draft | published
  pinned INTEGER NOT NULL DEFAULT 0,
  publish_at TEXT NOT NULL,                   -- ISO; болашақ уақыт болса — жоспарланған
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS news_pub ON news(status, publish_at);
`);

const CATEGORIES = ['general', 'study', 'event', 'scholarship', 'sport', 'announcement', 'career'];

// ---------- Көмекші ----------
const SCRYPT = { N: 16384, r: 8, p: 1 };
const scrypt = (pw, salt) => new Promise((ok, no) => crypto.scrypt(pw, salt, 64, SCRYPT, (e, k) => e ? no(e) : ok(k)));
async function hashPassword(pw) { const salt = crypto.randomBytes(16); return 'scrypt$' + salt.toString('base64') + '$' + (await scrypt(pw, salt)).toString('base64'); }
async function verifyPassword(pw, stored) {
  const [kind, salt, hash] = String(stored).split('$');
  if (kind !== 'scrypt') return false;
  const a = Buffer.from(hash, 'base64'), b = await scrypt(pw, Buffer.from(salt, 'base64'));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
const tokenHash = t => crypto.createHash('sha256').update(String(t)).digest('hex');
const now = () => new Date().toISOString();
const clean = (s, max) => String(s || '').replace(/\r\n/g, '\n').trim().slice(0, max);
const isLocal = req => ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress);

function sendJSON(res, status, obj, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
  res.end(JSON.stringify(obj));
}
function readBody(req, limit) {
  return new Promise((ok, no) => {
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > limit) { no(new Error('too_large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => ok(Buffer.concat(chunks).toString('utf8')));
    req.on('error', no);
  });
}
function cookie(req, name) {
  for (const part of String(req.headers.cookie || '').split(';')) {
    const i = part.indexOf('='); if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return '';
}
const setCookie = (token, maxAge) => `news_admin=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}`;

// ---------- Әкімші және сессия ----------
const q = {
  admin: db.prepare('SELECT * FROM admin WHERE id = 1'),
  addAdmin: db.prepare('INSERT INTO admin (id, name, password_hash, created_at) VALUES (1, ?, ?, ?)'),
  setPassword: db.prepare('UPDATE admin SET password_hash = ? WHERE id = 1'),
  addSession: db.prepare('INSERT INTO sessions (token_hash, expires_at) VALUES (?, ?)'),
  session: db.prepare('SELECT 1 FROM sessions WHERE token_hash = ? AND expires_at > ?'),
  dropSession: db.prepare('DELETE FROM sessions WHERE token_hash = ?'),
  purge: db.prepare('DELETE FROM sessions WHERE expires_at <= ?'),
  publicList: db.prepare(`SELECT id, title, summary, category, cover, author, pinned, publish_at, updated_at, length(body) AS body_len
    FROM news WHERE status = 'published' AND publish_at <= ? ORDER BY pinned DESC, publish_at DESC LIMIT ?`),
  publicOne: db.prepare(`SELECT * FROM news WHERE id = ? AND status = 'published' AND publish_at <= ?`),
  all: db.prepare('SELECT * FROM news ORDER BY pinned DESC, publish_at DESC'),
  one: db.prepare('SELECT * FROM news WHERE id = ?'),
  insert: db.prepare(`INSERT INTO news (title, summary, body, category, cover, author, status, pinned, publish_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),
  update: db.prepare(`UPDATE news SET title = ?, summary = ?, body = ?, category = ?, cover = ?, author = ?, status = ?, pinned = ?, publish_at = ?, updated_at = ? WHERE id = ?`),
  remove: db.prepare('DELETE FROM news WHERE id = ?'),
  coverUsed: db.prepare('SELECT COUNT(*) AS n FROM news WHERE cover = ?')
};
const SESSION_DAYS = 14;
function newSession() {
  const token = crypto.randomBytes(32).toString('base64url');
  q.purge.run(Date.now());
  q.addSession.run(tokenHash(token), Date.now() + SESSION_DAYS * 864e5);
  return token;
}
const loggedIn = req => { const t = cookie(req, 'news_admin'); return !!(t && q.session.get(tokenHash(t), Date.now())); };

// Кіру әрекеттерін шектеу: 15 минутта 10 әрекет.
const attempts = new Map();
function limited(req) {
  const ip = req.socket.remoteAddress, t = Date.now(), a = attempts.get(ip);
  if (!a || a.reset < t) { attempts.set(ip, { n: 1, reset: t + 15 * 60e3 }); return false; }
  return ++a.n > 10;
}

// ---------- Жаңалық ----------
function readMinutes(len) { return Math.max(1, Math.round((Number(len) || 0) / 900)); }
const toPublic = r => ({
  id: r.id, title: r.title, summary: r.summary, category: r.category, author: r.author,
  cover: r.cover ? '/uploads/' + r.cover : '', pinned: !!r.pinned, publishedAt: r.publish_at, updatedAt: r.updated_at,
  readMin: readMinutes(r.body_len ?? (r.body || '').length), ...(r.body !== undefined ? { body: r.body } : {})
});
const toAdmin = r => ({ ...toPublic(r), body: r.body, status: r.status, coverFile: r.cover, createdAt: r.created_at });

function validate(b) {
  const title = clean(b.title, 160);
  if (title.length < 3) return { error: 'title_required' };
  const category = CATEGORIES.includes(b.category) ? b.category : 'general';
  const status = b.status === 'published' ? 'published' : 'draft';
  const cover = /^[a-f0-9]{24}\.(jpg|png|webp)$/.test(String(b.cover || '')) && fs.existsSync(path.join(UPLOADS, b.cover)) ? b.cover : '';
  let publishAt = b.publishAt ? new Date(b.publishAt) : new Date();
  if (!Number.isFinite(publishAt.getTime())) publishAt = new Date();
  return { title, summary: clean(b.summary, 300), body: clean(b.body, 20000), category, cover, author: clean(b.author, 60), status, pinned: b.pinned ? 1 : 0, publishAt: publishAt.toISOString() };
}
function removeCoverIfUnused(file) {
  if (file && q.coverUsed.get(file).n === 0) fs.rm(path.join(UPLOADS, file), { force: true }, () => {});
}

// Сурет: тек JPEG/PNG/WebP, файл басындағы «сиқырлы байттар» бойынша тексеріледі.
function saveImage(dataUrl) {
  const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl || ''));
  if (!m) return { error: 'bad_image' };
  const buf = Buffer.from(m[2], 'base64');
  const kind = buf[0] === 0xff && buf[1] === 0xd8 ? 'jpg' : buf.slice(0, 4).toString('hex') === '89504e47' ? 'png'
    : buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP' ? 'webp' : null;
  if (!kind) return { error: 'bad_image' };
  if (buf.length > 6 * 1024 * 1024) return { error: 'too_large' };
  const file = crypto.randomBytes(12).toString('hex') + '.' + kind;
  fs.writeFileSync(path.join(UPLOADS, file), buf);
  return { file, url: '/uploads/' + file };
}

// ---------- Статикалық файлдар ----------
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon' };
function serveFile(res, root, rel, cache) {
  const file = path.normalize(path.join(root, rel));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': cache, 'X-Content-Type-Options': 'nosniff' });
    res.end(data);
  });
}

// ---------- Маршруттар ----------
http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost'), p = url.pathname, method = req.method;
  try {
    // Ашық API (Buddy осыдан оқиды)
    if (p === '/api/public/news' && method === 'GET') {
      const limit = Math.max(1, Math.min(100, Number(url.searchParams.get('limit')) || 50));
      return sendJSON(res, 200, { news: q.publicList.all(now(), limit).map(toPublic), categories: CATEGORIES, at: now() });
    }
    let m = /^\/api\/public\/news\/(\d+)$/.exec(p);
    if (m && method === 'GET') {
      const r = q.publicOne.get(Number(m[1]), now());
      return r ? sendJSON(res, 200, { news: toPublic(r) }) : sendJSON(res, 404, { error: 'not_found' });
    }
    if (p.startsWith('/uploads/') && method === 'GET') return serveFile(res, UPLOADS, p.slice(9), 'public, max-age=86400');
    if (p === '/api/health') return sendJSON(res, 200, { ok: true, service: 'buddy-news' });

    // Әкімші API
    if (p.startsWith('/api/admin/')) {
      // Браузерден басқа сайттың атынан сұрау жіберілмеуі үшін: тек JSON және өз адресіміз.
      if (method !== 'GET' && !String(req.headers['content-type'] || '').startsWith('application/json')) return sendJSON(res, 415, { error: 'json_only' });
      let body = {};
      if (method !== 'GET') { try { body = JSON.parse((await readBody(req, 9 * 1024 * 1024)) || '{}'); } catch (e) { return sendJSON(res, e.message === 'too_large' ? 413 : 400, { error: e.message === 'too_large' ? 'too_large' : 'bad_json' }); } }
      const admin = q.admin.get();
      if (p === '/api/admin/state' && method === 'GET') return sendJSON(res, 200, { setup: !admin, loggedIn: loggedIn(req), name: admin ? admin.name : '', localSetup: isLocal(req) });
      if (p === '/api/admin/setup' && method === 'POST') {
        if (admin) return sendJSON(res, 409, { error: 'already_setup' });
        if (!isLocal(req)) return sendJSON(res, 403, { error: 'local_only' });
        const name = clean(body.name, 60), pw = String(body.password || '');
        if (name.length < 2) return sendJSON(res, 400, { error: 'name_required' });
        if (pw.length < 8) return sendJSON(res, 400, { error: 'weak_password' });
        q.addAdmin.run(name, await hashPassword(pw), now());
        return sendJSON(res, 200, { ok: true }, { 'Set-Cookie': setCookie(newSession(), SESSION_DAYS * 86400) });
      }
      if (p === '/api/admin/login' && method === 'POST') {
        if (limited(req)) return sendJSON(res, 429, { error: 'too_many' });
        if (!admin || !(await verifyPassword(String(body.password || ''), admin.password_hash))) return sendJSON(res, 401, { error: 'wrong_password' });
        return sendJSON(res, 200, { ok: true, name: admin.name }, { 'Set-Cookie': setCookie(newSession(), SESSION_DAYS * 86400) });
      }
      if (p === '/api/admin/logout' && method === 'POST') {
        q.dropSession.run(tokenHash(cookie(req, 'news_admin')));
        return sendJSON(res, 200, { ok: true }, { 'Set-Cookie': setCookie('', 0) });
      }
      if (!loggedIn(req)) return sendJSON(res, 401, { error: 'unauthorized' });

      if (p === '/api/admin/password' && method === 'POST') {
        if (!(await verifyPassword(String(body.current || ''), admin.password_hash))) return sendJSON(res, 400, { error: 'wrong_password' });
        if (String(body.next || '').length < 8) return sendJSON(res, 400, { error: 'weak_password' });
        q.setPassword.run(await hashPassword(String(body.next)));
        return sendJSON(res, 200, { ok: true });
      }
      if (p === '/api/admin/news' && method === 'GET') return sendJSON(res, 200, { news: q.all.all().map(toAdmin), now: now() });
      if (p === '/api/admin/upload' && method === 'POST') { const r = saveImage(body.data); return sendJSON(res, r.error ? 400 : 200, r); }
      if (p === '/api/admin/news' && method === 'POST') {
        const v = validate(body); if (v.error) return sendJSON(res, 400, v);
        const t = now(), r = q.insert.run(v.title, v.summary, v.body, v.category, v.cover, v.author, v.status, v.pinned, v.publishAt, t, t);
        return sendJSON(res, 200, { news: toAdmin(q.one.get(Number(r.lastInsertRowid))) });
      }
      m = /^\/api\/admin\/news\/(\d+)$/.exec(p);
      if (m) {
        const id = Number(m[1]), old = q.one.get(id);
        if (!old) return sendJSON(res, 404, { error: 'not_found' });
        if (method === 'PUT') {
          // Жіберілмеген өріс бұрынғы мәнімен қалады (мысалы, тек «бекіту» ауыстырылса, жариялану уақыты өзгермейді).
          const v = validate({ title: old.title, summary: old.summary, body: old.body, category: old.category, cover: old.cover,
            author: old.author, status: old.status, pinned: old.pinned, publishAt: old.publish_at, ...body });
          if (v.error) return sendJSON(res, 400, v);
          q.update.run(v.title, v.summary, v.body, v.category, v.cover, v.author, v.status, v.pinned, v.publishAt, now(), id);
          if (old.cover !== v.cover) removeCoverIfUnused(old.cover);
          return sendJSON(res, 200, { news: toAdmin(q.one.get(id)) });
        }
        if (method === 'DELETE') { q.remove.run(id); removeCoverIfUnused(old.cover); return sendJSON(res, 200, { ok: true }); }
      }
      return sendJSON(res, 404, { error: 'not_found' });
    }

    // Әкімші панелінің беттері
    if (method === 'GET') return serveFile(res, PUBLIC, p === '/' ? 'index.html' : p.slice(1), 'no-cache');
    res.writeHead(405).end();
  } catch (e) {
    console.error('[news]', e);
    if (!res.headersSent) sendJSON(res, 500, { error: 'server_error' });
  }
}).listen(PORT, HOST, () => console.log(`Buddy News: http://localhost:${PORT}  (әкімші панелі; дерекқор: ${path.join(DATA, 'news.db')})`));
