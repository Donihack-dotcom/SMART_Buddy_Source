// Жаңалық мәтінін қауіпсіз HTML-ге айналдыру (әкімші алдын ала көрінісі мен Buddy бірдей көрсетуі үшін).
// Қолдайды: бос жолмен бөлінген абзацтар, «## Тақырып», «- тізім», «1. тізім», «> дәйексөз», **қалың**, *көлбеу*, [сілтеме](https://…).
// Алдымен бәрі экрандалады, сондықтан мәтіндегі HTML/скрипт ешқашан орындалмайды.
(function (root) {
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const inline = s => esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])\*(?!\s)([^*]+?)\*(?=[\s).,!?:;]|$)/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  function render(src) {
    return String(src || '').replace(/\r\n/g, '\n').split(/\n\s*\n/).map(block => {
      const lines = block.split('\n').filter(l => l.trim());
      if (!lines.length) return '';
      if (lines.length === 1 && /^#{2,3}\s+/.test(lines[0])) return `<h3>${inline(lines[0].replace(/^#{2,3}\s+/, ''))}</h3>`;
      if (lines.every(l => /^\s*[-•]\s+/.test(l))) return `<ul>${lines.map(l => `<li>${inline(l.replace(/^\s*[-•]\s+/, ''))}</li>`).join('')}</ul>`;
      if (lines.every(l => /^\s*\d+[.)]\s+/.test(l))) return `<ol>${lines.map(l => `<li>${inline(l.replace(/^\s*\d+[.)]\s+/, ''))}</li>`).join('')}</ol>`;
      if (lines.every(l => /^\s*>\s?/.test(l))) return `<blockquote>${lines.map(l => inline(l.replace(/^\s*>\s?/, ''))).join('<br>')}</blockquote>`;
      return `<p>${lines.map(inline).join('<br>')}</p>`;
    }).join('');
  }
  const CATEGORIES = {
    general: { kk: 'Жалпы', ru: 'Общее', en: 'General', color: '#7764e8', icon: '✦' },
    study: { kk: 'Оқу', ru: 'Учёба', en: 'Study', color: '#3b82f6', icon: '📘' },
    event: { kk: 'Іс-шара', ru: 'Мероприятие', en: 'Event', color: '#ec4899', icon: '🎉' },
    scholarship: { kk: 'Стипендия', ru: 'Стипендия', en: 'Scholarship', color: '#10b981', icon: '🎓' },
    sport: { kk: 'Спорт', ru: 'Спорт', en: 'Sport', color: '#f59e0b', icon: '🏆' },
    announcement: { kk: 'Хабарландыру', ru: 'Объявление', en: 'Announcement', color: '#ef4444', icon: '📢' },
    career: { kk: 'Мансап', ru: 'Карьера', en: 'Career', color: '#0ea5e9', icon: '💼' }
  };
  root.BuddyNewsFormat = { render, esc, CATEGORIES };
})(typeof window !== 'undefined' ? window : globalThis);
