// SMART.Buddy дерекқоры: SQLite (Node.js-тің кірістірілген node:sqlite модулі, тәуелділік жоқ).
// Файл: data/buddy.db (BUDDY_DATA айнымалысымен басқа папкаға ауыстыруға болады).
const { DatabaseSync } = require('node:sqlite');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const DIR = process.env.BUDDY_DATA || path.join(__dirname, 'data');
fs.mkdirSync(DIR, { recursive: true });
const db = new DatabaseSync(path.join(DIR, 'buddy.db'));

db.exec(`
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name          TEXT NOT NULL,
  group_name    TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS user_data (
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key        TEXT NOT NULL,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (user_id, key)
);
`);

// Профильдің қосымша өрістері (ескі дерекқорға да автоматты қосылады).
const PROFILE_COLUMNS = { nickname: 30, university: 100, major: 100, course: 20 };
const existingColumns = new Set(db.prepare('PRAGMA table_info(users)').all().map(c => c.name));
for (const col of Object.keys(PROFILE_COLUMNS))
  if (!existingColumns.has(col)) db.exec(`ALTER TABLE users ADD COLUMN ${col} TEXT NOT NULL DEFAULT ''`);

// Браузер сақтайтын кілттер — тек осылар серверге жазылады.
const DATA_KEYS = new Set([
  'buddy_lang', 'buddy_repeat', 'buddy_tasks', 'buddy_courses', 'buddy_sessions', 'buddy_active_chat',
  'buddy_alert_preferences', 'buddy_dismissed_alerts', 'buddy_last_deleted_task', 'buddy_certificate', 'buddy_schedule', 'buddy_news_seen'
]);
const SESSION_DAYS = 30;

// ---------- Құпиясөз ----------
const SCRYPT = { N: 16384, r: 8, p: 1 };
function scrypt(password, salt) {
  return new Promise((resolve, reject) =>
    crypto.scrypt(password, salt, 64, SCRYPT, (err, key) => err ? reject(err) : resolve(key)));
}
async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  return 'scrypt$' + salt.toString('base64') + '$' + (await scrypt(password, salt)).toString('base64');
}
async function verifyPassword(password, stored) {
  const [kind, salt, hash] = String(stored).split('$');
  if (kind !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64');
  const actual = await scrypt(password, Buffer.from(salt, 'base64'));
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

// ---------- Тексеру ----------
const cleanName = s => String(s || '').trim().replace(/\s+/g, ' ');
function validate({ name, email, password }) {
  if (name !== undefined && (cleanName(name).length < 2 || cleanName(name).length > 60)) return 'invalid_name';
  if (email !== undefined && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim()) || String(email).length > 120)) return 'invalid_email';
  if (password !== undefined && (String(password).length < 6 || String(password).length > 200)) return 'weak_password';
  return null;
}

// ---------- Пайдаланушылар ----------
const q = {
  userByEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
  userById: db.prepare('SELECT * FROM users WHERE id = ?'),
  insertUser: db.prepare('INSERT INTO users (email, name, password_hash, created_at) VALUES (?, ?, ?, ?)'),
  updateProfile: db.prepare('UPDATE users SET name = ?, group_name = ?, nickname = ?, university = ?, major = ?, course = ? WHERE id = ?'),
  updatePassword: db.prepare('UPDATE users SET password_hash = ? WHERE id = ?'),
  deleteUser: db.prepare('DELETE FROM users WHERE id = ?'),
  insertSession: db.prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)'),
  sessionUser: db.prepare('SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?'),
  deleteSession: db.prepare('DELETE FROM sessions WHERE token_hash = ?'),
  deleteOtherSessions: db.prepare('DELETE FROM sessions WHERE user_id = ? AND token_hash <> ?'),
  purgeSessions: db.prepare('DELETE FROM sessions WHERE expires_at <= ?'),
  getData: db.prepare('SELECT key, value FROM user_data WHERE user_id = ?'),
  putData: db.prepare(`INSERT INTO user_data (user_id, key, value, updated_at) VALUES (?, ?, ?, ?)
                       ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`),
  deleteData: db.prepare('DELETE FROM user_data WHERE user_id = ? AND key = ?')
};

const publicUser = u => u && {
  id: u.id, name: u.name, email: u.email, group: u.group_name, nickname: u.nickname || '',
  university: u.university || '', major: u.major || '', course: u.course || '', createdAt: u.created_at
};
const tokenHash = token => crypto.createHash('sha256').update(String(token)).digest('hex');

async function register({ name, email, password }) {
  const error = validate({ name, email, password });
  if (error) return { error };
  email = String(email).trim().toLowerCase();
  if (q.userByEmail.get(email)) return { error: 'email_taken' };
  const { lastInsertRowid } = q.insertUser.run(email, cleanName(name), await hashPassword(password), new Date().toISOString());
  return { user: q.userById.get(Number(lastInsertRowid)) };
}

async function login({ email, password }) {
  const user = q.userByEmail.get(String(email || '').trim().toLowerCase());
  // Пайдаланушы болмаса да хэш есептейміз — жауап уақыты бойынша email бар-жоғын білу қиын болсын.
  const ok = await verifyPassword(String(password || ''), user ? user.password_hash : 'scrypt$AAAAAAAAAAAAAAAAAAAAAA==$AAAA');
  return user && ok ? { user } : { error: 'invalid_credentials' };
}

function createSession(userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  q.purgeSessions.run(Date.now());
  q.insertSession.run(tokenHash(token), userId, new Date().toISOString(), Date.now() + SESSION_DAYS * 864e5);
  return { token, maxAge: SESSION_DAYS * 86400 };
}
const userBySession = token => token ? q.sessionUser.get(tokenHash(token), Date.now()) || null : null;
const deleteSession = token => { if (token) q.deleteSession.run(tokenHash(token)); };

// Жіберілмеген өріс бұрынғы мәнімен қалады.
function updateProfile(user, body = {}) {
  const name = body.name === undefined ? user.name : body.name;
  const error = validate({ name });
  if (error) return { error };
  const pick = (key, column, max) => cleanName(body[key] === undefined ? user[column] : body[key]).slice(0, max);
  const nickname = pick('nickname', 'nickname', PROFILE_COLUMNS.nickname);
  if (/[<>{}\\]/.test(nickname)) return { error: 'invalid_nickname' };
  q.updateProfile.run(cleanName(name), pick('group', 'group_name', 60), nickname,
    pick('university', 'university', PROFILE_COLUMNS.university), pick('major', 'major', PROFILE_COLUMNS.major),
    pick('course', 'course', PROFILE_COLUMNS.course), user.id);
  return { user: q.userById.get(user.id) };
}

async function changePassword(user, token, { current, next }) {
  if (!(await verifyPassword(String(current || ''), user.password_hash))) return { error: 'wrong_password' };
  const error = validate({ password: next });
  if (error) return { error };
  q.updatePassword.run(await hashPassword(String(next)), user.id);
  q.deleteOtherSessions.run(user.id, tokenHash(token)); // басқа құрылғылардан шығару
  return { ok: true };
}

async function deleteAccount(user, { password }) {
  if (!(await verifyPassword(String(password || ''), user.password_hash))) return { error: 'wrong_password' };
  q.deleteUser.run(user.id); // sessions және user_data CASCADE арқылы өшеді
  return { ok: true };
}

function getState(userId) {
  const state = {};
  for (const row of q.getData.all(userId)) { try { state[row.key] = JSON.parse(row.value); } catch {} }
  return state;
}
function putState(userId, key, value) {
  if (!DATA_KEYS.has(key)) return { error: 'unknown_key' };
  if (value === null || value === undefined) q.deleteData.run(userId, key);
  else q.putData.run(userId, key, JSON.stringify(value), new Date().toISOString());
  return { ok: true };
}

module.exports = {
  register, login, createSession, userBySession, deleteSession, updateProfile, changePassword,
  deleteAccount, getState, putState, publicUser, file: path.join(DIR, 'buddy.db')
};
