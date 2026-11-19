'use strict';

/* =====================================================================
   QS — Checklist "Bắt đầu nhanh" trên Tổng quan. Tự tích theo dữ liệu thật
   (tiến độ đọc, điểm trắc nghiệm, bài AI, lộ trình, API key). Hoàn thành
   4 bước chính được thưởng 30 XP một lần. Phụ thuộc (gọi lúc chạy):
   store, LESSONS, lastLesson, AI, GROW, t, $, esc.
   ===================================================================== */
const QS = (() => {
  const HIDE = 'qs:hidden', PAID = 'qs:paid', REWARD = 30;
  const hasRoadmap = () => { const r = store.get('roadmap', null); return !!(r && Array.isArray(r.milestones) && r.milestones.length); };

  const steps = () => [
    { id: 'read', icon: 'book-open', href: `#/read/${lastLesson().id}`, ok: LESSONS.some((l) => store.get('prog:' + l.id, 0) >= 0.5) },
    { id: 'quiz', icon: 'list-checks', href: `#/quiz/${lastLesson().id}`, ok: !!store.get('quizlast', null) },
    { id: 'sample', icon: 'sparkles', href: '#/ai', ok: LESSONS.some((l) => l.ai) },
    { id: 'roadmap', icon: 'map', href: '#/roadmap', ok: hasRoadmap() },
    { id: 'key', icon: 'key-round', href: '#/ai', ok: !!AI.getKey(), opt: true },
  ];

  function card() {
    if (store.get(HIDE, false)) return '';
    const all = steps(), main = all.filter((s) => !s.opt);
    const d = main.filter((s) => s.ok).length, n = main.length, finished = d === n;
    const row = (s) => `
      <a href="${s.href}" class="qs-row ${s.ok ? 'done' : ''}">
        <span class="qs-check"><i data-lucide="check"></i></span>
        <span class="min-w-0 flex-1">
          <span class="qs-title block font-semibold text-sm">${t('qs.' + s.id)}${s.opt ? ` <em class="text-xs font-medium text-muted not-italic">(${t('qs.optional')})</em>` : ''}</span>
          <span class="block text-xs text-muted mt-0.5">${t('qs.' + s.id + 'Sub')}</span>
        </span>
        <i data-lucide="${s.icon}" class="w-4 h-4 text-muted flex-none"></i>
      </a>`;
    return `
      <section id="qsCard" class="card card-static p-6 mb-10">
        <div class="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 class="font-bold text-lg flex items-center gap-2"><i data-lucide="rocket" class="text-accent w-5 h-5"></i>${t('qs.title')}</h2>
            <p class="text-sm text-muted mt-1">${finished ? t('qs.allDone') : t('qs.sub')}</p>
          </div>
          <button type="button" id="qsHide" class="btn text-xs"><i data-lucide="eye-off" class="w-4 h-4"></i>${t('qs.hide')}</button>
        </div>
        <div class="flex items-center gap-3 mt-4 mb-4">
          <div class="meter flex-1" aria-hidden="true"><div style="width:${Math.round(d / n * 100)}%"></div></div>
          <span class="text-xs font-semibold text-muted">${t('qs.progress', { d, n })}</span>
        </div>
        <div class="grid gap-2.5 sm:grid-cols-2">${all.map(row).join('')}</div>
      </section>`;
  }

  /* Gọi sau khi Tổng quan đã vẽ xong: gắn nút Ẩn và trao thưởng một lần */
  function afterRender() {
    $('#qsHide')?.addEventListener('click', () => { store.set(HIDE, true); $('#qsCard')?.remove(); });
    if (steps().filter((s) => !s.opt).every((s) => s.ok) && !store.get(PAID, false)) {
      store.set(PAID, true);
      const lv = GROW.addXP(REWARD);
      GROW.celebrate(t('qs.reward'), [t('grow.xpGain', { n: REWARD }), lv ? t('grow.levelUp', { n: lv }) : '']);
      GROW.renderChip();
    }
  }

  return { card, afterRender };
})();
