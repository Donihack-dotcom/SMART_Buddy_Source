// Buddy News — әкімші панелі: кіру, жаңалықтар тізімі, жазу/өңдеу (алдын ала көрінісімен), сурет, жариялау, бекіту.
(function () {
  const { render: md, esc, CATEGORIES } = window.BuddyNewsFormat;
  const BUDDY_URL = location.protocol + '//' + location.hostname + ':8000/';
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const app = $('#app');
  const st = { name: '', news: [], filter: 'all', search: '', draft: null, dirty: false, pv: 'card' };

  // ---------- Көмекші ----------
  const ERR = {
    wrong_password: 'Құпиясөз қате', weak_password: 'Құпиясөз кемінде 8 таңба болуы керек', name_required: 'Атыңызды жазыңыз',
    title_required: 'Тақырыпты жазыңыз (кемінде 3 таңба)', too_many: 'Тым көп әрекет. 15 минуттан кейін қайталаңыз.',
    bad_image: 'Тек JPG, PNG немесе WebP суреті болуы керек', too_large: 'Файл тым үлкен (ең көбі 6 МБ)',
    local_only: 'Алғашқы баптауды тек осы компьютерден жасауға болады', server_error: 'Сервер қатесі. Қайталап көріңіз.'
  };
  const errText = e => ERR[e] || ERR.server_error;
  async function api(path, method = 'GET', body) {
    const r = await fetch(path, { method, credentials: 'same-origin', headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined });
    let j = {}; try { j = await r.json(); } catch {}
    if (r.status === 401 && !path.includes('/login') && !path.includes('/state')) { boot(); throw new Error('unauthorized'); }
    if (!r.ok) throw new Error(j.error || 'server_error');
    return j;
  }
  let toastTimer;
  function toast(text) { const t = $('#toast'); t.textContent = text; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600); }
  // Браузерлерде қазақша ай атаулары жиі жоқ («M11» шығады) — сондықтан өзіміз жазамыз (Астана уақыты).
  const MONTHS = ['қаңтар', 'ақпан', 'наурыз', 'сәуір', 'мамыр', 'маусым', 'шілде', 'тамыз', 'қыркүйек', 'қазан', 'қараша', 'желтоқсан'];
  function fmtDate(iso, time = true) {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Almaty', year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(iso)).map(x => [x.type, x.value]));
    return `${+p.day} ${MONTHS[p.month - 1]} ${p.year}${time ? ', ' + p.hour + ':' + p.minute : ''}`;
  }
  const cat = k => CATEGORIES[k] || CATEGORIES.general;
  const grad = k => `linear-gradient(135deg, ${cat(k).color}, color-mix(in srgb, ${cat(k).color} 55%, #1d1640))`;
  const statusOf = n => n.status !== 'published' ? 'draft' : new Date(n.publishedAt) > new Date() ? 'scheduled' : 'published';
  const STATUS = { published: ['pub', 'Жарияланды'], scheduled: ['sch', 'Жоспарланды'], draft: ['draft', 'Жоба'] };
  const badge = k => `<span class="badge" style="background:color-mix(in srgb, ${cat(k).color} 12%, #fff);color:${cat(k).color}">${cat(k).icon} ${cat(k).kk}</span>`;
  const localInput = iso => { const d = new Date(iso || Date.now()); const p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; };
  const ICON = {
    edit: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
    pin: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 10.76V6h6v4.76a2 2 0 0 0 1.1 1.79l1.8.9A2 2 0 0 1 19 15.24V17H5v-1.76a2 2 0 0 1 1.1-1.79l1.8-.9A2 2 0 0 0 9 10.76Z"/><path d="M8 2h8"/></svg>',
    del: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6"/></svg>'
  };

  function confirmDialog(title, text, okText, danger) {
    return new Promise(res => {
      const bg = document.createElement('div'); bg.className = 'dialog-bg';
      bg.innerHTML = `<div class="dialog" role="dialog" aria-modal="true"><h3>${esc(title)}</h3><p>${esc(text)}</p><div class="row-btns"><button class="btn ghost" data-no>Болдырмау</button><button class="btn ${danger ? 'danger' : 'primary'}" data-yes>${esc(okText)}</button></div></div>`;
      document.body.appendChild(bg);
      const done = v => { bg.remove(); document.removeEventListener('keydown', key); res(v); };
      const key = e => { if (e.key === 'Escape') done(false); };
      document.addEventListener('keydown', key);
      bg.querySelector('[data-no]').onclick = () => done(false);
      bg.querySelector('[data-yes]').onclick = () => done(true);
      bg.onclick = e => { if (e.target === bg) done(false); };
      bg.querySelector('[data-yes]').focus();
    });
  }

  // ---------- Кіру / алғашқы баптау ----------
  async function boot() {
    let s;
    try { s = await api('/api/admin/state'); } catch { app.innerHTML = '<div class="auth"><div class="auth-card"><h1>Сервер жауап бермейді</h1><p>Жаңалықтар сервері іске қосылғанын тексеріңіз.</p></div></div>'; return; }
    st.name = s.name;
    if (s.setup) return renderAuth('setup', s.localSetup);
    if (!s.loggedIn) return renderAuth('login');
    await loadNews(); renderList();
  }
  function renderAuth(mode, local) {
    const setup = mode === 'setup';
    app.innerHTML = `<div class="auth"><form class="auth-card" id="authForm">
      <div class="auth-brand"><span class="logo-mark">✦</span><div><strong>Buddy News</strong><small>Әкімші панелі</small></div></div>
      <h1>${setup ? 'Қош келдіңіз! 👋' : 'Кіру'}</h1>
      <p>${setup ? 'Алдымен әкімші атын және құпиясөзді орнатыңыз. Бұл бір рет қана жасалады.' : 'Жаңалықтарды басқару үшін әкімші құпиясөзін енгізіңіз.'}</p>
      ${setup && !local ? '<p class="msg err">Алғашқы баптауды тек сервер тұрған компьютерден жасауға болады.</p>' : ''}
      <p class="msg err" id="authMsg" hidden></p>
      ${setup ? '<label class="field">Атыңыз (жаңалық авторы ретінде көрінеді)<input name="name" required maxlength="60" autocomplete="name" placeholder="Мысалы, Данияр"></label>' : ''}
      <label class="field">Құпиясөз<input name="password" type="password" required minlength="${setup ? 8 : 1}" autocomplete="${setup ? 'new-password' : 'current-password'}"></label>
      ${setup ? '<label class="field">Құпиясөзді қайталаңыз<input name="confirm" type="password" required autocomplete="new-password"></label>' : ''}
      <button class="btn primary block">${setup ? 'Бастау' : 'Кіру'}</button></form></div>`;
    const f = $('#authForm'); f.querySelector('input').focus();
    f.onsubmit = async e => {
      e.preventDefault(); const d = Object.fromEntries(new FormData(f)), msg = $('#authMsg');
      if (setup && d.password !== d.confirm) { msg.textContent = 'Құпиясөздер сәйкес емес'; msg.hidden = false; return; }
      try { await api(setup ? '/api/admin/setup' : '/api/admin/login', 'POST', setup ? { name: d.name, password: d.password } : { password: d.password }); boot(); }
      catch (err) { msg.textContent = errText(err.message); msg.hidden = false; }
    };
  }

  // ---------- Тізім ----------
  async function loadNews() { st.news = (await api('/api/admin/news')).news; }
  function topBar() {
    return `<header class="top"><div class="brand"><span class="logo-mark">✦</span><div><strong>Buddy News</strong><small>Әкімші панелі · ${esc(st.name)}</small></div></div>
      <div class="top-actions"><a class="link-btn" href="${BUDDY_URL}" target="_blank" rel="noopener"><span class="live-dot"></span> Buddy-ді ашу ↗</a>
      <button class="link-btn" id="pwBtn">🔑 Құпиясөз</button><button class="link-btn" id="logoutBtn">↪ Шығу</button></div></header>`;
  }
  function bindTop() {
    $('#logoutBtn').onclick = async () => { await api('/api/admin/logout', 'POST', {}).catch(() => {}); boot(); };
    $('#pwBtn').onclick = changePassword;
  }
  function filtered() {
    const s = st.search.trim().toLowerCase();
    return st.news.filter(n => (st.filter === 'all' || statusOf(n) === st.filter) && (!s || (n.title + ' ' + n.summary + ' ' + n.body).toLowerCase().includes(s)));
  }
  function rowHTML(n) {
    const s = statusOf(n), [cls, label] = STATUS[s];
    const cover = n.cover ? `<img class="thumb" src="${esc(n.cover)}" alt="">` : `<div class="thumb ph" style="background:${grad(n.category)}">${cat(n.category).icon}</div>`;
    return `<article class="row">${cover}<div><h3>${esc(n.title)}</h3>${n.summary ? `<p>${esc(n.summary)}</p>` : ''}
      <div class="meta">${badge(n.category)}<span class="pill ${cls}">${label}${s === 'scheduled' ? ' · ' + fmtDate(n.publishedAt) : ''}</span>${n.pinned ? '<span class="pin">📌 Бекітілген</span>' : ''}<span>${s === 'published' ? fmtDate(n.publishedAt) : 'Өзгертілді: ' + fmtDate(n.updatedAt)}</span></div></div>
      <div class="actions"><button class="icon-btn" data-edit="${n.id}" title="Өңдеу" aria-label="Өңдеу: ${esc(n.title)}">${ICON.edit}</button>
      <button class="icon-btn ${n.pinned ? 'on' : ''}" data-pin="${n.id}" title="${n.pinned ? 'Бекітуді алу' : 'Жоғарыға бекіту'}" aria-label="Бекіту">${ICON.pin}</button>
      <button class="icon-btn del" data-del="${n.id}" title="Өшіру" aria-label="Өшіру: ${esc(n.title)}">${ICON.del}</button></div></article>`;
  }
  function renderList() {
    st.draft = null; st.dirty = false;
    const count = k => st.news.filter(n => statusOf(n) === k).length;
    const list = filtered();
    app.innerHTML = `<div class="shell">${topBar()}
      <section class="hero"><div><h1>Жаңалықтар</h1><p>Мұнда жариялағаныңыз студенттердің Buddy қолданбасындағы «Жаңалықтар» бөлімінде бірден көрінеді.</p></div>
      <button class="btn primary" id="newBtn">＋ Жаңа жаңалық</button></section>
      <section class="stats"><div class="stat s1"><small>Барлығы</small><b>${st.news.length}</b></div><div class="stat s2"><small>Жарияланған</small><b>${count('published')}</b></div><div class="stat s3"><small>Жоспарланған</small><b>${count('scheduled')}</b></div><div class="stat s4"><small>Жоба</small><b>${count('draft')}</b></div></section>
      <div class="toolbar"><label class="search"><span>⌕</span><input id="search" placeholder="Жаңалықтан іздеу…" value="${esc(st.search)}" aria-label="Іздеу"></label>
      <div class="tabs" role="tablist">${[['all', 'Барлығы'], ['published', 'Жарияланған'], ['scheduled', 'Жоспарланған'], ['draft', 'Жоба']].map(([k, l]) => `<button role="tab" class="${st.filter === k ? 'on' : ''}" data-filter="${k}">${l}</button>`).join('')}</div></div>
      ${list.length ? `<div class="list">${list.map(rowHTML).join('')}</div>`
        : `<div class="empty"><div class="big">📰</div><h3>${st.news.length ? 'Ештеңе табылмады' : 'Әзірге жаңалық жоқ'}</h3><p>${st.news.length ? 'Іздеуді немесе сүзгіні өзгертіп көріңіз.' : 'Алғашқы жаңалықты жазыңыз — ол студенттерге бірден көрінеді.'}</p>${st.news.length ? '' : '<button class="btn primary" id="newBtn2">＋ Жаңалық жазу</button>'}</div>`}
      </div>`;
    bindTop();
    $('#newBtn').onclick = () => openEditor(null);
    if ($('#newBtn2')) $('#newBtn2').onclick = () => openEditor(null);
    const s = $('#search'); s.oninput = () => { st.search = s.value; const pos = s.selectionStart; renderList(); const n = $('#search'); n.focus(); n.setSelectionRange(pos, pos); };
    $$('[data-filter]').forEach(b => b.onclick = () => { st.filter = b.dataset.filter; renderList(); });
    $$('[data-edit]').forEach(b => b.onclick = () => openEditor(st.news.find(n => n.id === +b.dataset.edit)));
    $$('[data-pin]').forEach(b => b.onclick = async () => {
      const n = st.news.find(x => x.id === +b.dataset.pin);
      try { await api('/api/admin/news/' + n.id, 'PUT', { pinned: !n.pinned }); await loadNews(); renderList(); toast(n.pinned ? 'Бекіту алынды' : '📌 Жоғарыға бекітілді'); } catch (e) { toast(errText(e.message)); }
    });
    $$('[data-del]').forEach(b => b.onclick = async () => {
      const n = st.news.find(x => x.id === +b.dataset.del);
      if (!(await confirmDialog('Жаңалықты өшіру керек пе?', `«${n.title}» біржола өшіріледі және Buddy-ден жоғалады.`, 'Өшіру', true))) return;
      try { await api('/api/admin/news/' + n.id, 'DELETE'); await loadNews(); renderList(); toast('Жаңалық өшірілді'); } catch (e) { toast(errText(e.message)); }
    });
  }

  // ---------- Редактор ----------
  function openEditor(n) {
    st.draft = n ? { id: n.id, title: n.title, summary: n.summary, body: n.body, category: n.category, cover: n.coverFile, coverUrl: n.cover, author: n.author || st.name, pinned: n.pinned, when: statusOf(n) === 'draft' ? 'draft' : statusOf(n) === 'scheduled' ? 'schedule' : 'now', publishAt: n.publishedAt, wasPublished: n.status === 'published' }
      : { title: '', summary: '', body: '', category: 'general', cover: '', coverUrl: '', author: st.name, pinned: false, when: 'now', publishAt: new Date(Date.now() + 3600e3).toISOString() };
    st.dirty = false; renderEditor(); window.scrollTo(0, 0);
  }
  function previewHTML() {
    const d = st.draft, c = cat(d.category), mins = Math.max(1, Math.round(d.body.length / 900));
    const cover = `<div class="ncover" style="--g:${grad(d.category)}">${d.coverUrl ? `<img src="${esc(d.coverUrl)}" alt="">` : c.icon}</div>`;
    const date = fmtDate(d.when === 'schedule' ? d.publishAt : (d.wasPublished && d.publishAt ? d.publishAt : new Date().toISOString()), false);
    if (st.pv === 'card') return `<div class="ncard">${cover}<div class="nbody">${badge(d.category)}${d.pinned ? ' <span class="pin">📌</span>' : ''}<h3>${esc(d.title || 'Жаңалық тақырыбы')}</h3><p>${esc(d.summary || 'Қысқаша сипаттама осы жерде көрінеді.')}</p><div class="nmeta">${date} · ${mins} мин оқу</div></div></div>`;
    return `<article class="article">${cover}<div class="inner">${badge(d.category)}<h1>${esc(d.title || 'Жаңалық тақырыбы')}</h1><div class="nmeta">${esc(d.author || '')}${d.author ? ' · ' : ''}${date} · ${mins} мин оқу</div>${d.summary ? `<p class="lead" style="margin-top:12px">${esc(d.summary)}</p>` : ''}<div class="prose">${md(d.body) || '<p style="color:#a39cb5">Мәтін осы жерде көрінеді…</p>'}</div></div></article>`;
  }
  const refreshPreview = () => { $('#pv').innerHTML = previewHTML(); };
  function renderEditor() {
    const d = st.draft;
    app.innerHTML = `<div class="shell">${topBar()}
      <button class="back" id="backBtn">← Жаңалықтар тізіміне</button>
      <div class="editor"><form class="panel" id="edForm" autocomplete="off">
        <h2>${d.id ? 'Жаңалықты өңдеу' : 'Жаңа жаңалық'}</h2>
        <label class="field">Тақырып<input name="title" maxlength="160" required value="${esc(d.title)}" placeholder="Мысалы, Қысқы сессия кестесі жарияланды"><span class="hint"><span></span><span id="cTitle">${d.title.length}/160</span></span></label>
        <label class="field">Қысқаша сипаттама<textarea name="summary" rows="2" maxlength="300" placeholder="Карточкада көрінетін 1–2 сөйлем">${esc(d.summary)}</textarea><span class="hint"><span>Тізімдегі карточкада көрінеді</span><span id="cSum">${d.summary.length}/300</span></span></label>
        <div class="field">Санат<div class="cats">${Object.entries(CATEGORIES).map(([k, c]) => `<label class="cat" style="--c:${c.color}"><input type="radio" name="category" value="${k}" ${d.category === k ? 'checked' : ''}><span>${c.icon} ${c.kk}</span></label>`).join('')}</div></div>
        <div class="field">Мұқаба суреті<div id="coverBox"></div></div>
        <label class="field" for="bodyTa">Мәтін</label>
        <div class="md-bar" role="toolbar" aria-label="Пішімдеу">
          <button type="button" data-md="bold" title="Қалың"><b>B</b></button><button type="button" data-md="italic" title="Көлбеу"><i>I</i></button>
          <button type="button" data-md="h" title="Тақырыпша">H</button><button type="button" data-md="list" title="Тізім">• Тізім</button>
          <button type="button" data-md="quote" title="Дәйексөз">❝</button><button type="button" data-md="link" title="Сілтеме">🔗</button></div>
        <label class="field"><textarea class="body" id="bodyTa" name="body" maxlength="20000" placeholder="Жаңалықтың толық мәтіні. Абзацтарды бос жолмен бөліңіз.">${esc(d.body)}</textarea>
          <span class="hint"><span>**қалың**, *көлбеу*, ## тақырыпша, - тізім, [мәтін](https://…)</span><span id="cBody">${d.body.length}</span></span></label>
        <label class="field">Автор<input name="author" maxlength="60" value="${esc(d.author)}"></label>
        <div class="field">Жариялау<div class="when">${[['now', '⚡ Қазір жариялау'], ['schedule', '🕒 Уақытын белгілеу'], ['draft', '📝 Жоба ретінде']].map(([k, l]) => `<label><input type="radio" name="when" value="${k}" ${d.when === k ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div></div>
        <label class="field" id="whenAt" ${d.when === 'schedule' ? '' : 'hidden'}>Жариялану уақыты (Астана)<input type="datetime-local" name="publishAt" value="${localInput(d.publishAt)}"></label>
        <div class="toggle-row"><div><strong>📌 Жоғарыға бекіту</strong><small>Buddy-де ең басында, үлкен карточкамен көрінеді</small></div><span class="switch"><input type="checkbox" name="pinned" ${d.pinned ? 'checked' : ''} aria-label="Жоғарыға бекіту"><i></i></span></div>
        <p class="msg err" id="edMsg" hidden></p>
        <div class="save-bar"><span class="dirty" id="dirty" hidden>● Сақталмаған өзгерістер</span>
          ${d.id ? '<button type="button" class="btn danger" id="delBtn">Өшіру</button>' : ''}
          <button class="btn primary" id="saveBtn">${saveLabel()}</button></div>
      </form>
      <aside class="preview"><div class="tabs" role="tablist"><button type="button" data-pv="card" class="${st.pv === 'card' ? 'on' : ''}">Карточка</button><button type="button" data-pv="article" class="${st.pv === 'article' ? 'on' : ''}">Толық мақала</button></div>
        <div class="phone" id="pv">${previewHTML()}</div><p class="pv-note">Студенттер Buddy-де дәл осылай көреді.</p></aside></div></div>`;
    bindTop(); renderCover(); bindEditor();
  }
  function saveLabel() { const w = st.draft.when; return w === 'draft' ? '📝 Жобаны сақтау' : w === 'schedule' ? '🕒 Жоспарлау' : st.draft.wasPublished ? '✓ Өзгерістерді сақтау' : '🚀 Жариялау'; }
  function renderCover() {
    const d = st.draft, box = $('#coverBox');
    box.innerHTML = d.coverUrl ? `<div class="cover-wrap"><img src="${esc(d.coverUrl)}" alt="Мұқаба"><button type="button" class="btn ghost" id="rmCover">✕ Алып тастау</button></div>`
      : `<label class="drop" id="drop"><input type="file" accept="image/jpeg,image/png,image/webp" hidden id="coverFile"><b>📷 Суретті таңдаңыз немесе осында сүйреп әкеліңіз</b>JPG, PNG, WebP · Ctrl+V арқылы қоюға да болады</label>`;
    if (d.coverUrl) { $('#rmCover').onclick = () => { d.cover = ''; d.coverUrl = ''; markDirty(); renderCover(); refreshPreview(); }; return; }
    const drop = $('#drop');
    $('#coverFile').onchange = e => uploadCover(e.target.files[0]);
    drop.ondragover = e => { e.preventDefault(); drop.classList.add('over'); };
    drop.ondragleave = () => drop.classList.remove('over');
    drop.ondrop = e => { e.preventDefault(); drop.classList.remove('over'); uploadCover(e.dataTransfer.files[0]); };
  }
  // Сурет браузерде кішірейтіледі (ең көбі 1600 px, JPEG) — сервер мен студенттің интернеті үнемделеді.
  function resize(file) {
    return new Promise((ok, no) => {
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => { const k = Math.min(1, 1600 / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); ok(c.toDataURL('image/jpeg', 0.86)); };
      img.onerror = () => { URL.revokeObjectURL(url); no(new Error('bad_image')); };
      img.src = url;
    });
  }
  async function uploadCover(file) {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return toast(ERR.bad_image);
    const box = $('#coverBox'); box.innerHTML = '<div class="drop"><b>⏳ Сурет жүктелуде…</b></div>';
    try { const r = await api('/api/admin/upload', 'POST', { data: await resize(file) }); st.draft.cover = r.file; st.draft.coverUrl = r.url; markDirty(); toast('Сурет қосылды'); }
    catch (e) { toast(errText(e.message)); }
    renderCover(); refreshPreview();
  }
  function markDirty() { st.dirty = true; const d = $('#dirty'); if (d) d.hidden = false; }
  function bindEditor() {
    const f = $('#edForm'), E = f.elements, d = st.draft;
    const sync = () => {
      d.title = E.title.value; d.summary = E.summary.value; d.body = E.body.value; d.author = E.author.value;
      d.category = E.category.value; d.pinned = E.pinned.checked; d.when = E.when.value;
      if (E.publishAt.value) d.publishAt = new Date(E.publishAt.value).toISOString();
      $('#cTitle').textContent = d.title.length + '/160'; $('#cSum').textContent = d.summary.length + '/300'; $('#cBody').textContent = d.body.length;
      $('#whenAt').hidden = d.when !== 'schedule'; $('#saveBtn').textContent = saveLabel();
      markDirty(); refreshPreview();
    };
    f.addEventListener('input', sync); f.addEventListener('change', sync);
    $$('[data-pv]').forEach(b => b.onclick = () => { st.pv = b.dataset.pv; $$('[data-pv]').forEach(x => x.classList.toggle('on', x === b)); refreshPreview(); });
    $('#backBtn').onclick = async () => { if (st.dirty && !(await confirmDialog('Сақталмаған өзгерістер бар', 'Шыққан соң өзгерістер жоғалады.', 'Сақтамай шығу', true))) return; renderList(); };
    if ($('#delBtn')) $('#delBtn').onclick = async () => {
      if (!(await confirmDialog('Жаңалықты өшіру керек пе?', `«${d.title}» біржола өшіріледі және Buddy-ден жоғалады.`, 'Өшіру', true))) return;
      await api('/api/admin/news/' + d.id, 'DELETE'); await loadNews(); renderList(); toast('Жаңалық өшірілді');
    };
    // Мәтін пішімдеу батырмалары
    const ta = $('#bodyTa');
    $$('[data-md]').forEach(b => b.onclick = () => {
      const s = ta.selectionStart, e = ta.selectionEnd, sel = ta.value.slice(s, e) || 'мәтін';
      const wrap = { bold: `**${sel}**`, italic: `*${sel}*`, h: `\n\n## ${sel}\n\n`, list: `\n\n- ${sel.split('\n').join('\n- ')}\n\n`, quote: `\n\n> ${sel}\n\n`, link: `[${sel}](https://)` }[b.dataset.md];
      ta.setRangeText(wrap, s, e, 'end'); ta.focus(); sync();
    });
    // Ctrl+V арқылы суретті қою
    f.addEventListener('paste', e => { const file = [...(e.clipboardData && e.clipboardData.files || [])].find(x => /^image\//.test(x.type)); if (file && !d.coverUrl) { e.preventDefault(); uploadCover(file); } });
    f.onsubmit = async e => {
      e.preventDefault(); sync();
      const msg = $('#edMsg'); msg.hidden = true;
      if (d.title.trim().length < 3) { msg.textContent = ERR.title_required; msg.hidden = false; E.title.focus(); return; }
      if (d.when === 'schedule' && new Date(d.publishAt) <= new Date()) { msg.textContent = 'Жоспарланған уақыт болашақта болуы керек'; msg.hidden = false; return; }
      const payload = { title: d.title, summary: d.summary, body: d.body, category: d.category, cover: d.cover, author: d.author, pinned: d.pinned,
        status: d.when === 'draft' ? 'draft' : 'published',
        publishAt: d.when === 'schedule' ? d.publishAt : d.when === 'now' && d.wasPublished && new Date(d.publishAt) <= new Date() ? d.publishAt : new Date().toISOString() };
      const btn = $('#saveBtn'); btn.disabled = true;
      try {
        await api(d.id ? '/api/admin/news/' + d.id : '/api/admin/news', d.id ? 'PUT' : 'POST', payload);
        st.dirty = false; await loadNews(); renderList();
        toast(d.when === 'draft' ? '📝 Жоба сақталды' : d.when === 'schedule' ? '🕒 Жоспарланды: ' + fmtDate(d.publishAt) : '🚀 Жарияланды — Buddy-де көрінеді');
      } catch (err) { msg.textContent = errText(err.message); msg.hidden = false; btn.disabled = false; }
    };
  }
  window.addEventListener('beforeunload', e => { if (st.dirty) { e.preventDefault(); e.returnValue = ''; } });

  // ---------- Құпиясөзді ауыстыру ----------
  function changePassword() {
    const bg = document.createElement('div'); bg.className = 'dialog-bg';
    bg.innerHTML = `<form class="dialog" id="pwForm"><h3>Құпиясөзді ауыстыру</h3><p class="msg err" id="pwMsg" hidden></p>
      <label class="field">Қазіргі құпиясөз<input name="current" type="password" required autocomplete="current-password"></label>
      <label class="field">Жаңа құпиясөз (кемінде 8 таңба)<input name="next" type="password" required minlength="8" autocomplete="new-password"></label>
      <div class="row-btns"><button type="button" class="btn ghost" data-no>Болдырмау</button><button class="btn primary">Сақтау</button></div></form>`;
    document.body.appendChild(bg);
    bg.querySelector('[data-no]').onclick = () => bg.remove();
    bg.querySelector('input').focus();
    bg.querySelector('#pwForm').onsubmit = async e => {
      e.preventDefault(); const d = Object.fromEntries(new FormData(e.target));
      try { await api('/api/admin/password', 'POST', d); bg.remove(); toast('Құпиясөз ауыстырылды'); }
      catch (err) { const m = bg.querySelector('#pwMsg'); m.textContent = errText(err.message); m.hidden = false; }
    };
  }

  boot();
})();
