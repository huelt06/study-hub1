'use strict';

/* =====================================================================
   GIAI ĐOẠN 3: Lộ trình (Roadmap) · XP & chúc mừng · Video · Ghi chú
   Phụ thuộc (từ script.js): store, $, $$, LESSONS, readMinutes, refreshIcons, pad, clamp
   ===================================================================== */
const GROW = (() => {
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const plain = (html) => new DOMParser().parseFromString(html, 'text/html').body.textContent;
  const fmtDate = (d) => d.toLocaleDateString(I18N.locale(), { day: '2-digit', month: '2-digit' });
  const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const dayDate = (iso, n) => { const d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate() + n); return d; };

  /* ---------------------------------------------------------------
     1. XP, CẤP ĐỘ, HIỆU ỨNG CHÚC MỪNG
     --------------------------------------------------------------- */
  const XP_PER_LEVEL = 200;
  const getRm = () => { const r = store.get('roadmap', null); return r && Array.isArray(r.milestones) && r.milestones.length && r.days ? r : null; };
  const xp = () => store.get('xp', 0);
  const levelOf = (x) => Math.floor(x / XP_PER_LEVEL) + 1;

  function renderChip() {
    const el = $('#xpChip');
    if (!el) return;
    const x = xp(), into = x % XP_PER_LEVEL;
    el.innerHTML = `<i data-lucide="zap"></i><strong>Lv ${levelOf(x)}</strong>
      <span class="hidden md:inline text-muted">${x} XP</span>
      <span class="xp-bar" aria-hidden="true"><span style="width:${(into / XP_PER_LEVEL) * 100}%"></span></span>`;
    el.title = t('grow.xpToNext', { a: into, b: XP_PER_LEVEL, n: levelOf(x) + 1 });
  }

  // Trả về cấp mới nếu vừa lên cấp, ngược lại trả về 0
  function addXP(n) {
    const before = xp(), after = before + n;
    store.set('xp', after);
    renderChip();
    refreshIcons();
    return levelOf(after) > levelOf(before) ? levelOf(after) : 0;
  }

  function toast(title, lines = []) {
    let el = $('#gxToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'gxToast'; el.className = 'gx-toast';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.innerHTML = `<p class="font-bold text-lg">${esc(title)}</p>` +
      lines.filter(Boolean).map((l) => `<p class="text-sm text-muted mt-0.5">${esc(l)}</p>`).join('');
    el.classList.add('show');
    clearTimeout(el._h);
    el._h = setTimeout(() => el.classList.remove('show'), 4200);
  }

  function confetti() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; // tôn trọng người dùng giảm chuyển động
    const cv = document.createElement('canvas');
    cv.className = 'gx-confetti'; cv.width = innerWidth; cv.height = innerHeight;
    document.body.appendChild(cv);
    const ctx = cv.getContext('2d');
    if (!ctx) { cv.remove(); return; } // trình duyệt chặn canvas: bỏ qua hiệu ứng
    const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    const colors = [css('--accent'), css('--ok'), '#F59E0B', '#EC4899', '#6366F1'];
    const ps = Array.from({ length: 150 }, () => ({
      x: innerWidth / 2, y: innerHeight * 0.4,
      vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 14 - 4,
      s: 5 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
      c: colors[(Math.random() * colors.length) | 0],
    }));
    const t0 = performance.now(), DURATION = 2600;
    (function frame(now) {
      const age = now - t0;
      ctx.clearRect(0, 0, cv.width, cv.height);
      ps.forEach((p) => {
        p.vy += 0.3; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.globalAlpha = Math.max(0, 1 - age / DURATION);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
        ctx.restore();
      });
      age < DURATION ? requestAnimationFrame(frame) : cv.remove();
    })(t0);
  }

  function celebrate(title, lines) {
    try { confetti(); } catch { $$('.gx-confetti').forEach((c) => c.remove()); } // hiệu ứng lỗi không được chặn thông báo
    toast(title, lines);
  }

  /* ---------------------------------------------------------------
     2. LỘ TRÌNH: chia thời gian thành các chặng (milestone)
     --------------------------------------------------------------- */
  // Nhiệm vụ: với mỗi bài là "đọc" rồi "kiểm tra", cuối cùng là "ôn tập tổng kết".
  // Nếu số ngày ít hơn số nhiệm vụ thì gộp nhiệm vụ liên tiếp vào cùng một chặng.
  // Số ngày của mỗi chặng tỉ lệ với khối lượng (phút đọc) và tối thiểu 1 ngày.
  function buildPlan(days, startISO) {
    const tasks = [];
    LESSONS.forEach((l) => {
      tasks.push({ type: 'read', id: l.id, w: readMinutes(l) });
      tasks.push({ type: 'quiz', id: l.id, w: Math.max(3, Math.ceil(l.quiz.length / 2)) });
    });
    tasks.push({ type: 'review', w: 5 });

    const n = Math.min(days, tasks.length);
    const groups = Array.from({ length: n }, (_, i) =>
      tasks.slice(Math.round((i * tasks.length) / n), Math.round(((i + 1) * tasks.length) / n)));

    const weights = groups.map((g) => g.reduce((s, task) => s + task.w, 0));
    const total = weights.reduce((a, b) => a + b, 0), extra = days - n;
    const raw = weights.map((w) => (w / total) * extra);
    const alloc = raw.map(Math.floor);
    const left = extra - alloc.reduce((a, b) => a + b, 0);
    raw.map((r, i) => [r - Math.floor(r), i]).sort((a, b) => b[0] - a[0]).slice(0, left).forEach(([, i]) => alloc[i]++);

    let day = 0;
    const milestones = groups.map((g, i) => {
      const d = 1 + alloc[i];
      const m = { id: 'm' + i, tasks: g.map(({ type, id }) => ({ type, id })), from: day + 1, to: day + d, done: false };
      day += d;
      return m;
    });
    return { days, start: startISO, milestones, createdAt: Date.now() };
  }

  function taskRow(task) {
    if (task.type === 'review') return { href: '#/review', icon: 'repeat', text: t('grow.review'), ok: reviewSet().length === 0, review: true };
    const l = LESSONS.find((x) => x.id === task.id);
    if (!l) return null; // bài đã bị xóa
    return task.type === 'read'
      ? { href: `#/read/${l.id}`, icon: 'book-open', text: t('grow.readTask', { t: l.title }), ok: store.get('prog:' + l.id, 0) >= 0.9 }
      : { href: `#/quiz/${l.id}`, icon: 'list-checks', text: t('grow.quizTask', { t: l.title }), ok: !!store.get('quiz:' + l.id, null) };
  }

  // Một chặng chỉ hoàn thành được khi mọi nhiệm vụ (đọc, trắc nghiệm, ôn tập hết câu sai) đã xong
  function stageProgress(m) {
    const rows = m.tasks.map(taskRow).filter(Boolean);
    const done = rows.filter((r) => r.ok).length;
    return { done, total: rows.length, ready: done === rows.length };
  }

  function viewRoadmap() {
    const rm = getRm();
    const form = `
      <form id="rmForm" class="grid gap-4 sm:grid-cols-[1fr_1fr_auto] items-end">
        <label class="block text-sm font-medium">${t('grow.days')}
          <input id="rmDays" type="number" min="1" max="60" value="${rm?.days || 10}" class="field mt-1.5">
        </label>
        <label class="block text-sm font-medium">${t('grow.start')}
          <input id="rmStart" type="date" value="${rm?.start || todayISO()}" class="field mt-1.5">
        </label>
        <button type="submit" class="btn btn-primary"><i data-lucide="map" class="w-4 h-4"></i>${rm ? t('grow.rebuild') : t('grow.create')}</button>
      </form>
      <p class="text-xs text-muted mt-3">${t('grow.rmNote', { n: LESSONS.length })}</p>`;

    // Đúng luồng: đăng nhập → tải tài liệu cho AI phân tích → mới lập lộ trình riêng
    const docHint = LESSONS.some((l) => l.ai) ? '' : `
      <section class="card card-static p-5 mb-6 flex items-center gap-4 flex-wrap border-accent/40 bg-accent-soft/20">
        <span class="tier-badge flex-none"><i data-lucide="file-up"></i></span>
        <div class="flex-1 min-w-48">
          <p class="font-semibold">${t('grow.needDoc')}</p>
          <p class="text-sm text-muted mt-0.5">${t('grow.needDocSub')}</p>
        </div>
        <a href="#/ai" class="btn btn-primary flex-none"><i data-lucide="sparkles" class="w-4 h-4"></i>${t('grow.goUpload')}</a>
      </section>`;

    let body = '';
    if (rm) {
      const n = rm.milestones.length, doneN = rm.milestones.filter((m) => m.done).length;
      const pct = Math.round((doneN / n) * 100);
      const dayNo = Math.round((new Date(todayISO() + 'T00:00:00') - new Date(rm.start + 'T00:00:00')) / 864e5) + 1;
      const when = dayNo < 1 ? t('grow.startsIn', { n: 1 - dayNo })
        : dayNo > rm.days ? (doneN < n ? t('grow.overdue', { n: dayNo - rm.days }) : t('grow.finished'))
        : t('grow.today', { d: dayNo, n: rm.days });

      const items = rm.milestones.map((m, i) => {
        const prevDone = i === 0 || rm.milestones[i - 1].done;
        const state = m.done ? 'done' : prevDone ? 'current' : 'locked';
        const last = i === n - 1;
        const icon = m.done ? 'check' : last ? 'trophy' : state === 'current' ? 'flag' : 'lock';
        const rows = m.tasks.map(taskRow).filter(Boolean);
        const range = `${t('grow.day')} ${m.from}${m.to > m.from ? '–' + m.to : ''} · ${fmtDate(dayDate(rm.start, m.from - 1))}${m.to > m.from ? ' – ' + fmtDate(dayDate(rm.start, m.to - 1)) : ''}`;
        const late = state === 'current' && dayNo > m.to;
        const gain = last ? 200 : 100;
        const sp = stageProgress(m);
        const action = state === 'current'
          ? `<button type="button" class="btn btn-primary" data-complete="${i}" ${sp.ready ? '' : 'disabled aria-disabled="true"'}><i data-lucide="party-popper" class="w-4 h-4"></i>${t('grow.complete', { n: gain })}</button>${sp.ready ? '' : `<p class="text-xs text-muted mt-2" data-need>${t('grow.needTasks', { d: sp.done, n: sp.total })}</p>`}`
          : state === 'done'
            ? `<span class="badge-ai"><i data-lucide="check"></i>${t('grow.completedOn', { d: fmtDate(new Date(m.doneAt)) })}</span>`
            : `<p class="text-xs text-muted flex items-center gap-1.5"><i data-lucide="lock" class="w-3.5 h-3.5"></i>${t('grow.locked', { n: i })}</p>`;
        return `
          <li class="rm-item ${state}">
            <span class="rm-node"><i data-lucide="${icon}"></i></span>
            <div class="rm-card">
              <div class="flex items-center justify-between gap-2 flex-wrap">
                <h3 class="font-bold">${t('grow.stage', { n: i + 1 })}${last ? t('grow.goal') : ''}</h3>
                ${late ? `<span class="badge-ai badge-late">${t('grow.late')}</span>` : ''}
              </div>
              <p class="text-xs text-muted mt-0.5">${range}</p>
              <div class="mt-3 space-y-0.5">
                ${rows.length ? rows.map((r) => `<a class="rm-task" href="${r.href}"><i data-lucide="${r.ok ? 'check-circle-2' : r.icon}" class="${r.ok ? 'text-ok' : ''}"></i><span>${r.text}</span></a>`).join('')
                  : `<p class="text-xs text-muted">${t('grow.deleted')}</p>`}
              </div>
              <div class="mt-4">${action}</div>
            </div>
          </li>`;
      }).join('');

      body = `
        <section class="card card-static p-6 mb-8">
          <div class="flex items-center justify-between gap-3 flex-wrap">
            <div><h2 class="font-bold text-lg">${t('grow.progress')}</h2>
              <p class="text-sm text-muted">${t('grow.stages', { d: doneN, n, days: rm.days, date: fmtDate(dayDate(rm.start, rm.days - 1)) })}</p></div>
            <span class="badge-ai"><i data-lucide="calendar-days"></i>${when}</span>
          </div>
          <div class="meter mt-4" aria-hidden="true"><div style="width:${pct}%"></div></div>
        </section>
        <ol class="rm" style="--p:${Math.min(100, ((doneN + 0.5) / n) * 100)}%">${items}</ol>`;
    }

    return `
      <div class="mx-auto" style="max-width:56rem">
        <div class="mb-8">
          <a href="#/" class="text-sm font-medium text-muted hover:text-ink inline-flex items-center gap-1.5 mb-3 transition-colors"><i data-lucide="arrow-left" class="w-4 h-4"></i>${t('back.dash')}</a>
          <h1 class="text-3xl font-bold tracking-tight flex items-center gap-3"><span class="page-ic page-ic-cyan"><i data-lucide="map"></i></span>${t('grow.roadmap')}</h1>
          <p class="text-muted mt-1">${t('grow.rmSub')}</p>
        </div>
        ${docHint}
        ${rm ? `<details class="card card-static p-5 mb-6"><summary class="cursor-pointer font-semibold">${t('grow.change')}</summary><div class="mt-4">${form}</div></details>`
             : `<section class="card card-static p-6 mb-8">${form}</section>`}
        ${body}
      </div>`;
  }

  function rerenderRoadmap() {
    $('#app').innerHTML = viewRoadmap();
    bindRoadmap();
    refreshIcons();
  }

  function completeMilestone(i) {
    const rm = getRm();
    const m = rm?.milestones[i];
    if (!m || m.done || (i > 0 && !rm.milestones[i - 1].done)) return; // phải mở khóa theo thứ tự
    if (!stageProgress(m).ready) return; // chưa học xong thì không nhận thưởng
    m.done = true; m.doneAt = Date.now();
    store.set('roadmap', rm);

    const last = i === rm.milestones.length - 1, gain = last ? 200 : 100;
    const lv = addXP(gain);
    rerenderRoadmap();
    celebrate(last ? t('grow.finishTitle') : t('grow.stageDone', { n: i + 1 }), [
      t('grow.xpGain', { n: gain }),
      last ? t('grow.allDone') : t('grow.unlocked', { n: i + 2 }),
      lv ? t('grow.levelUp', { n: lv }) : '',
    ]);
  }

  function bindRoadmap() {
    $('#rmForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const rm = getRm();
      if (rm?.milestones.some((m) => m.done) && !confirm(t('grow.rebuildConfirm'))) return;
      const days = clamp(parseInt($('#rmDays').value, 10) || 10, 1, 60);
      store.set('roadmap', buildPlan(days, $('#rmStart').value || todayISO()));
      rerenderRoadmap();
    });
    $$('[data-complete]').forEach((b) => b.addEventListener('click', () => completeMilestone(+b.dataset.complete)));
  }

  // Dải gợi ý ở Dashboard
  function reviewStrip() {
    const n = reviewSet().length;
    return n ? `<a href="#/review" class="card card-static p-5 mb-4 flex items-center gap-4">
      <span class="tier-badge"><i data-lucide="repeat"></i></span>
      <div class="flex-1"><p class="font-semibold">${t('review.cta', { n })}</p><p class="text-sm text-muted">${t('review.stripSub')}</p></div>
      <i data-lucide="chevron-right" class="text-muted"></i></a>` : '';
  }

  function dashStrip() {
    return reviewStrip() + roadmapStrip();
  }

  function roadmapStrip() {
    const rm = getRm();
    if (!rm) {
      return `<a href="#/roadmap" class="card card-static p-5 mb-10 flex items-center gap-4">
        <span class="tier-badge"><i data-lucide="map"></i></span>
        <div class="flex-1"><p class="font-semibold">${t('grow.rmPlan')}</p><p class="text-sm text-muted">${t('grow.rmPlanSub')}</p></div>
        <i data-lucide="chevron-right" class="text-muted"></i></a>`;
    }
    const doneN = rm.milestones.filter((m) => m.done).length, n = rm.milestones.length;
    return `<a href="#/roadmap" class="card card-static p-5 mb-10 flex items-center gap-4">
      <span class="tier-badge"><i data-lucide="${doneN === n ? 'trophy' : 'map'}"></i></span>
      <div class="flex-1"><p class="font-semibold">${t('grow.rmStatus', { d: doneN, n })}</p>
        <p class="text-sm text-muted">${doneN === n ? t('grow.allDone') : t('grow.nextStage', { n: doneN + 1 })}</p></div>
      <i data-lucide="chevron-right" class="text-muted"></i></a>`;
  }

  /* ---------------------------------------------------------------
     3. VIDEO BÀI GIẢNG (YouTube / Vimeo)
     --------------------------------------------------------------- */
  function parseVideo(input) {
    let url;
    try { url = new URL(input.trim()); } catch { return null; }
    const host = url.hostname.replace(/^(www|m)\./, '');
    let id = null;
    if (host === 'youtu.be') id = url.pathname.slice(1, 12);
    else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      if (url.pathname === '/watch') id = url.searchParams.get('v');
      else id = url.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{11})/)?.[1];
    }
    if (id && /^[\w-]{11}$/.test(id)) return { key: 'yt:' + id, src: `https://www.youtube-nocookie.com/embed/${id}` };
    if (host === 'vimeo.com') {
      const m = url.pathname.match(/^\/(\d+)/);
      if (m) return { key: 'vm:' + m[1], src: `https://player.vimeo.com/video/${m[1]}` };
    }
    return null; // chỉ cho phép nguồn đã biết để tránh nhúng trang tùy ý
  }

  function renderVideos(el, l) {
    const list = store.get('videos:' + l.id, []);
    const search = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(plain(l.title) + ' ' + t('video.searchQ'));
    el.innerHTML = `
      <h2 class="text-xl font-bold mb-4 flex items-center gap-2"><i data-lucide="play-circle" class="text-accent w-5 h-5"></i>${t('video.title')}</h2>
      ${list.length ? `<div class="grid gap-5">${list.map((v, i) => `
        <div>
          <div class="gx-video"><iframe src="${v.src}" title="${esc(v.title || t('video.lecture'))}" loading="lazy"
            allow="accelerometer; encrypted-media; picture-in-picture; fullscreen"
            referrerpolicy="strict-origin-when-cross-origin"></iframe></div>
          <div class="flex items-center justify-between gap-3 mt-2 text-sm">
            <span class="font-medium">${esc(v.title || t('video.lecture'))}</span>
            <button type="button" class="btn" data-vdel="${i}"><i data-lucide="x" class="w-4 h-4"></i>${t('video.remove')}</button>
          </div>
        </div>`).join('')}</div>`
        : `<p class="text-sm text-muted">${t('video.none')}</p>`}
      <div class="card card-static p-4 mt-4 grid gap-3 sm:grid-cols-[1fr_12rem_auto]">
        <input id="vUrl" class="field" placeholder="https://www.youtube.com/watch?v=..." aria-label="Link video">
        <input id="vTitle" class="field" placeholder="${t('video.titlePh')}" maxlength="80" aria-label="${t('video.titlePh')}">
        <button id="vAdd" type="button" class="btn btn-primary"><i data-lucide="plus" class="w-4 h-4"></i>${t('video.add')}</button>
      </div>
      <p id="vMsg" class="text-xs text-muted mt-2">${t('video.hint')} <a class="underline" target="_blank" rel="noopener noreferrer" href="${search}">${t('video.search')}</a></p>`;
  }

  function bindVideos(el, l) {
    el.addEventListener('click', (e) => {
      const msg = (m) => { const el2 = $('#vMsg', el); el2.textContent = m; el2.style.color = 'var(--bad)'; };
      const list = store.get('videos:' + l.id, []);
      if (e.target.closest('#vAdd')) {
        const p = parseVideo($('#vUrl', el).value);
        if (!p) return msg(t('video.badLink'));
        if (list.some((v) => v.key === p.key)) return msg(t('video.dup'));
        list.push({ ...p, title: $('#vTitle', el).value.trim().slice(0, 80) });
        store.set('videos:' + l.id, list);
      } else {
        const d = e.target.closest('[data-vdel]');
        if (!d) return;
        list.splice(+d.dataset.vdel, 1);
        store.set('videos:' + l.id, list);
      }
      renderVideos(el, l);
      refreshIcons();
    });
  }

  /* ---------------------------------------------------------------
     4. BÌNH LUẬN & ĐÓNG GÓP KIẾN THỨC (CSDL nhẹ bằng localStorage)
     --------------------------------------------------------------- */
  const NOTE_XP = 5, NOTE_XP_CAP = 5; // mỗi bài chỉ tính XP cho 5 đóng góp đầu để tránh "cày" điểm

  function noteItem(n) {
    const tip = n.type === 'tip';
    return `
      <li class="card card-static p-4">
        <div class="flex items-start gap-3">
          <span class="tier-badge flex-none" style="width:2rem;height:2rem"><i data-lucide="${tip ? 'lightbulb' : 'sticky-note'}"></i></span>
          <div class="min-w-0 flex-1">
            <p class="text-xs text-muted font-medium">${tip ? t('notes.tip') : t('notes.note')} · ${new Date(n.ts).toLocaleString(I18N.locale(), { dateStyle: 'short', timeStyle: 'short' })}</p>
            <p class="mt-1 text-sm leading-relaxed whitespace-pre-wrap break-words">${esc(n.text)}</p>
          </div>
          <button type="button" class="icon-btn flex-none" data-ndel="${n.id}" aria-label="${t('notes.delete')}"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
        </div>
      </li>`;
  }

  function renderNotes(el, l) {
    const list = store.get('notes:' + l.id, []);
    el.innerHTML = `
      <h2 class="text-xl font-bold mb-1 flex items-center gap-2"><i data-lucide="message-square-plus" class="text-accent w-5 h-5"></i>${t('notes.title')}</h2>
      <p class="text-sm text-muted mb-4">${t('notes.sub')}</p>
      <div class="card card-static p-4 space-y-3">
        <div class="flex gap-2" role="radiogroup" aria-label="${t('notes.kind')}">
          <button type="button" class="chip chip-on" role="radio" aria-checked="true" data-ntype="note">${t('notes.note')}</button>
          <button type="button" class="chip" role="radio" aria-checked="false" data-ntype="tip">${t('notes.tip')}</button>
        </div>
        <textarea id="nText" class="field" rows="3" maxlength="600" aria-label="${t('notes.ph')}" placeholder="${t('notes.ph')}"></textarea>
        <div class="flex items-center justify-between gap-3">
          <span class="text-xs text-muted"><span id="nCount">0</span>/600</span>
          <button id="nAdd" type="button" class="btn btn-primary"><i data-lucide="send" class="w-4 h-4"></i>${t('notes.post')}</button>
        </div>
      </div>
      <ul class="mt-5 space-y-3">${list.length ? list.map(noteItem).join('') : `<li class="text-sm text-muted">${t('notes.empty')}</li>`}</ul>`;
  }

  function bindNotes(el, l) {
    let type = 'note';
    el.addEventListener('input', (e) => { if (e.target.id === 'nText') $('#nCount', el).textContent = e.target.value.length; });
    el.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-ntype]');
      if (chip) {
        type = chip.dataset.ntype;
        $$('[data-ntype]', el).forEach((c) => {
          c.classList.toggle('chip-on', c === chip);
          c.setAttribute('aria-checked', c === chip);
        });
        return;
      }
      const list = store.get('notes:' + l.id, []);
      if (e.target.closest('#nAdd')) {
        const text = $('#nText', el).value.trim();
        if (!text) return $('#nText', el).focus();
        list.unshift({ id: uid(), type, text: text.slice(0, 600), ts: Date.now() });
        store.set('notes:' + l.id, list);
        const given = store.get('notexp:' + l.id, 0);
        let lv = 0;
        if (given < NOTE_XP_CAP) { store.set('notexp:' + l.id, given + 1); lv = addXP(NOTE_XP); }
        type = 'note'; // renderNotes vẽ lại nút mặc định là "Ghi chú", giữ trạng thái đồng bộ
        renderNotes(el, l);
        refreshIcons();
        if (lv) celebrate(t('grow.levelUpTitle', { n: lv }), [t('grow.xpForNote', { n: NOTE_XP })]);
        else if (given < NOTE_XP_CAP) toast(t('grow.posted'), [t('grow.xpGain', { n: NOTE_XP })]);
        else toast(t('grow.posted'));
        return;
      }
      const d = e.target.closest('[data-ndel]');
      if (d) {
        store.set('notes:' + l.id, list.filter((n) => n.id !== d.dataset.ndel));
        renderNotes(el, l);
        refreshIcons();
      }
    });
  }

  // Gọi sau khi trang đọc đã được vẽ
  function mountReader(l) {
    const v = $('#gx-video'), n = $('#gx-notes');
    if (v) { renderVideos(v, l); bindVideos(v, l); }
    if (n) { renderNotes(n, l); bindNotes(n, l); }
    refreshIcons();
  }

  return { viewRoadmap, bindRoadmap, dashStrip, mountReader, renderChip, toast, celebrate, addXP };
})();