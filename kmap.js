'use strict';

/* =====================================================================
   KMAP — Sơ đồ phả hệ kiến thức + cấu trúc tài liệu (SVG thuần).
   Hai chế độ: "rel" (khái niệm & quan hệ) và "doc" (các phần của tài liệu).
   Bấm vào một nút → tô sáng toàn bộ tổ tiên (nền tảng) và hậu duệ (nhánh mở ra).
   Kéo để di chuyển, Ctrl+cuộn để phóng to, hoặc dùng nút điều khiển.
   Phụ thuộc: I18N, refreshIcons (gọi lúc chạy).
   ===================================================================== */
const KMAP = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  const NH = 46, GX = 26, GY = 58, PAD = 24;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const L = (vi, en) => (I18N.lang === 'vi' ? vi : en);
  const plain = (h) => new DOMParser().parseFromString(String(h ?? ''), 'text/html').body.textContent.trim();
  const short = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
  const nodeW = (name) => Math.max(104, Math.min(214, short(name, 26).length * 8.2 + 34));
  let seq = 0;

  /* ---------- Dựng mô hình từ dữ liệu ---------- */
  function finish(nodes, edges) {
    const m = { nodes, edges, byId: new Map(nodes.map((n) => [n.id, n])), out: new Map(), inn: new Map() };
    nodes.forEach((n) => { m.out.set(n.id, []); m.inn.set(n.id, []); });
    m.edges = edges.filter((e) => m.byId.has(e.from) && m.byId.has(e.to) && e.from !== e.to);
    m.edges.forEach((e) => { m.out.get(e.from).push(e.to); m.inn.get(e.to).push(e.from); });
    nodes.forEach((n) => {
      if (n.kind) return;
      n.kind = !m.inn.get(n.id).length ? 'root' : !m.out.get(n.id).length ? 'leaf' : 'branch';
    });
    return m;
  }

  function relModel(g) {
    if (!g?.concepts?.length) return null;
    const nodes = g.concepts.map((c) => ({
      id: String(c.id), name: plain(c.name), summary: plain(c.summary), example: plain(c.example),
      kind: c.level === 1 ? 'root' : c.level === 3 ? 'leaf' : c.level === 2 ? 'branch' : null,
    }));
    return finish(nodes, (g.relations || []).map((r) => ({ from: String(r.from), to: String(r.to), label: plain(r.label) })));
  }

  // Cấu trúc tài liệu: tiêu đề → các mục (h2) → thuật ngữ in đậm trong mục
  function docModel(lesson) {
    if (!lesson?.html) return null;
    const doc = new DOMParser().parseFromString(lesson.html, 'text/html');
    const nodes = [{ id: 'r', name: plain(lesson.title), kind: 'root', summary: plain(lesson.summary) }], edges = [];
    let cur = null, terms = 0, sec = -1;
    if (doc.body.firstElementChild && doc.body.firstElementChild.tagName !== 'H2') {
      cur = { id: 'intro', name: L('Mở đầu', 'Introduction'), kind: 'branch', sec: -1, summary: '' };
      nodes.push(cur); edges.push({ from: 'r', to: 'intro', label: '' });
    }
    [...doc.body.children].forEach((el) => {
      if (el.tagName === 'H2') {
        sec++; terms = 0;
        cur = { id: 's' + sec, name: el.textContent.trim(), kind: 'branch', sec, summary: '' };
        nodes.push(cur); edges.push({ from: 'r', to: cur.id, label: '' });
        return;
      }
      if (!cur) return;
      if (!cur.summary && el.tagName === 'P') cur.summary = short(el.textContent.trim(), 220);
      el.querySelectorAll('strong').forEach((s) => {
        const name = s.textContent.replace(/[:：]\s*$/, '').trim();
        if (s.closest('.concept-ex') || !name || name.length > 44 || terms >= 7) return;
        const leaf = { id: `${cur.id}-t${terms++}`, name, kind: 'leaf', sec: cur.sec,
          summary: short((s.closest('li') || s.parentElement).textContent.trim(), 200) };
        nodes.push(leaf); edges.push({ from: cur.id, to: leaf.id, label: '' });
      });
    });
    return nodes.length > 2 ? finish(nodes, edges) : null;
  }

  /* ---------- Bố cục phân tầng (longest-path + barycenter) ---------- */
  function layout(m) {
    const layer = new Map(), busy = new Set();
    const depth = (id) => {
      if (layer.has(id)) return layer.get(id);
      if (busy.has(id)) return 0; // chu trình: bỏ qua cạnh ngược
      busy.add(id);
      let d = 0;
      m.inn.get(id).forEach((p) => { d = Math.max(d, depth(p) + 1); });
      busy.delete(id); layer.set(id, d);
      return d;
    };
    m.nodes.forEach((n) => depth(n.id));
    const rows = [];
    m.nodes.forEach((n) => { (rows[layer.get(n.id)] ||= []).push(n); });
    const pos = new Map();
    const reindex = () => rows.forEach((r) => r.forEach((n, i) => pos.set(n.id, i)));
    const bary = (ids, n) => (ids.length ? ids.reduce((s, id) => s + pos.get(id), 0) / ids.length : pos.get(n.id));
    reindex();
    for (let pass = 0; pass < 4; pass++) {
      for (let i = 1; i < rows.length; i++) { rows[i].sort((a, b) => bary(m.inn.get(a.id), a) - bary(m.inn.get(b.id), b)); reindex(); }
      for (let i = rows.length - 2; i >= 0; i--) { rows[i].sort((a, b) => bary(m.out.get(a.id), a) - bary(m.out.get(b.id), b)); reindex(); }
    }
    rows.forEach((r) => r.forEach((n) => { n.w = nodeW(n.name); }));
    const widths = rows.map((r) => r.reduce((s, n) => s + n.w, 0) + GX * (r.length - 1));
    const W = Math.max(...widths);
    rows.forEach((r, i) => {
      let x = (W - widths[i]) / 2;
      r.forEach((n) => { n.x = x + n.w / 2; n.y = i * (NH + GY) + NH / 2; n.layer = i; x += n.w + GX; });
    });
    m.W = W; m.H = (rows.length - 1) * (NH + GY) + NH;
  }

  /* ---------- Vẽ SVG ---------- */
  const el = (tag, attrs = {}, html) => {
    const e = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
    if (html !== undefined) e.innerHTML = html;
    return e;
  };

  function draw(shell, m) {
    const canvas = shell.querySelector('.km-canvas');
    if (!m.W) layout(m);
    const id = 'km' + ++seq;
    const svg = el('svg', { role: 'group', 'aria-label': L('Sơ đồ phả hệ kiến thức', 'Knowledge map') });
    svg.innerHTML = `
      <defs>
        <linearGradient id="kmgrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--g1)"/><stop offset="1" stop-color="var(--g2)"/></linearGradient>
        <marker id="${id}a" class="km-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z"/></marker>
        <marker id="${id}h" class="km-arr-hi" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z"/></marker>
      </defs><g class="km-vp"></g>`;
    const vp = svg.querySelector('.km-vp');
    const gE = el('g'), gL = el('g'), gN = el('g');
    vp.append(gE, gL, gN);

    m.edges.forEach((e) => {
      const a = m.byId.get(e.from), b = m.byId.get(e.to);
      const x1 = a.x, y1 = a.y + NH / 2, x2 = b.x, y2 = b.y - NH / 2, ym = (y1 + y2) / 2;
      const p = el('path', { class: 'km-e', d: `M${x1} ${y1}C${x1} ${ym} ${x2} ${ym} ${x2} ${y2}`, 'marker-end': `url(#${id}a)`, 'data-f': e.from, 'data-t': e.to });
      p._m = [`url(#${id}a)`, `url(#${id}h)`];
      gE.append(p);
      if (e.label) {
        const w = short(e.label, 22).length * 6.4 + 14;
        const g = el('g', { class: 'km-el', 'data-f': e.from, 'data-t': e.to, transform: `translate(${(x1 + x2) / 2} ${ym})` },
          `<rect x="${-w / 2}" y="-10" width="${w}" height="20" rx="10"/><text text-anchor="middle" dominant-baseline="central">${esc(short(e.label, 22))}</text>`);
        gL.append(g);
      }
    });

    m.nodes.forEach((n) => {
      const g = el('g', { class: `km-n ${n.kind}`, 'data-id': n.id, tabindex: 0, role: 'button', 'aria-label': n.name,
        transform: `translate(${n.x - n.w / 2} ${n.y - NH / 2})`, style: `--d:${n.layer * 90}ms` },
        `<rect width="${n.w}" height="${NH}" rx="14"/>
         <text x="${n.w / 2}" y="${NH / 2}" text-anchor="middle" dominant-baseline="central">${esc(short(n.name, 26))}</text>
         <title>${esc(n.name)}</title>`);
      gN.append(g);
    });

    canvas.replaceChildren(svg);
    shell._svg = svg; shell._vp = vp; shell._m = m;
    shell.classList.remove('has-sel');
    info(shell, null);
    fit(shell);
  }

  /* ---------- Phóng to / thu nhỏ / kéo ---------- */
  const view = (shell) => (shell._v ||= { k: 1, x: 0, y: 0 });
  function apply(shell) {
    const v = view(shell);
    shell._vp.setAttribute('transform', `translate(${v.x} ${v.y}) scale(${v.k})`);
    shell.querySelector('[data-km-lbl]').textContent = Math.round(v.k * 100) + '%';
  }
  function fit(shell) {
    const c = shell.querySelector('.km-canvas'), m = shell._m, v = view(shell);
    const w = c.clientWidth || 600, h = c.clientHeight || 440;
    v.k = Math.max(0.25, Math.min(1.1, (w - PAD * 2) / m.W, (h - PAD * 2) / m.H));
    v.x = (w - m.W * v.k) / 2; v.y = Math.max(PAD, (h - m.H * v.k) / 2);
    apply(shell);
  }
  function zoom(shell, f, px, py) {
    const c = shell.querySelector('.km-canvas'), v = view(shell);
    px ??= c.clientWidth / 2; py ??= c.clientHeight / 2;
    const k = Math.max(0.25, Math.min(2.6, v.k * f));
    v.x = px - (px - v.x) * (k / v.k); v.y = py - (py - v.y) * (k / v.k); v.k = k;
    apply(shell);
  }

  /* ---------- Chọn nút: tô sáng dòng phả hệ ---------- */
  const reach = (start, adj) => {
    const seen = new Set(), q = [start];
    while (q.length) adj.get(q.pop()).forEach((id) => { if (!seen.has(id) && id !== start) { seen.add(id); q.push(id); } });
    return seen;
  };

  function select(shell, id) {
    const m = shell._m, svg = shell._svg;
    if (!id || !m.byId.has(id)) {
      shell.classList.remove('has-sel');
      svg.querySelectorAll('.hl,.sel,.anc,.des').forEach((e) => e.classList.remove('hl', 'sel', 'anc', 'des'));
      svg.querySelectorAll('.km-e').forEach((p) => p.setAttribute('marker-end', p._m[0]));
      return info(shell, null);
    }
    const anc = reach(id, m.inn), des = reach(id, m.out);
    const inA = (x) => x === id || anc.has(x), inD = (x) => x === id || des.has(x);
    shell.classList.add('has-sel');
    svg.querySelectorAll('.km-n').forEach((g) => {
      const x = g.dataset.id;
      g.classList.toggle('sel', x === id);
      g.classList.toggle('anc', anc.has(x));
      g.classList.toggle('des', des.has(x));
      g.classList.toggle('hl', inA(x) || inD(x));
    });
    const onPath = (f, t) => (inA(f) && inA(t)) || (inD(f) && inD(t));
    svg.querySelectorAll('.km-e').forEach((p) => {
      const on = onPath(p.dataset.f, p.dataset.t);
      p.classList.toggle('hl', on); p.setAttribute('marker-end', p._m[on ? 1 : 0]);
    });
    svg.querySelectorAll('.km-el').forEach((g) => g.classList.toggle('hl', onPath(g.dataset.f, g.dataset.t)));
    info(shell, m.byId.get(id), anc.size, des.size);
  }

  function info(shell, n, nAnc = 0, nDes = 0) {
    const box = shell.querySelector('.km-info'), m = shell._m;
    if (!n) {
      box.innerHTML = `
        <p class="km-hint"><i data-lucide="mouse-pointer-click"></i>${L('Bấm vào một nút để thấy dòng chảy kiến thức: những gì nó dựa trên và những gì nó mở ra.', 'Click a node to trace its lineage: what it builds on and what it unlocks.')}</p>
        <p class="km-stat"><strong>${m.nodes.length}</strong> ${L('nút', 'nodes')} · <strong>${m.edges.length}</strong> ${L('liên kết', 'links')}</p>`;
      return refreshIcons();
    }
    const chips = (ids) => ids.map((x) => `<button type="button" class="km-chip" data-km-go="${esc(x)}">${esc(m.byId.get(x).name)}</button>`).join('');
    const par = m.inn.get(n.id), chi = m.out.get(n.id);
    const kind = { root: L('Nền tảng gốc', 'Core foundation'), branch: L('Khái niệm nhánh', 'Branch concept'), leaf: L('Ứng dụng sâu', 'Deep application') }[n.kind];
    box.innerHTML = `
      <p class="km-kind ${n.kind}">${kind}</p>
      <h4 class="font-bold text-base mt-1.5 leading-snug">${esc(n.name)}</h4>
      <p class="km-stat mt-1"><strong>${nAnc}</strong> ${L('nền tảng', 'foundations')} · <strong>${nDes}</strong> ${L('nhánh mở ra', 'descendants')}</p>
      ${n.summary ? `<p class="mt-3 text-muted leading-relaxed">${esc(n.summary)}</p>` : ''}
      ${n.example ? `<div class="concept-ex mt-3"><strong>${L('Ví dụ: ', 'Example: ')}</strong>${esc(n.example)}</div>` : ''}
      ${par.length ? `<p class="km-sub">${L('Dựa trên', 'Builds on')}</p><div class="km-chips">${chips(par)}</div>` : ''}
      ${chi.length ? `<p class="km-sub">${L('Mở ra', 'Leads to')}</p><div class="km-chips">${chips(chi)}</div>` : ''}
      ${n.sec !== undefined ? `<button type="button" class="btn btn-primary mt-4 w-full justify-center" data-km-jump="${n.sec}"><i data-lucide="arrow-down-to-line" class="w-4 h-4"></i>${L('Đến đoạn này trong bài', 'Jump to this section')}</button>` : ''}`;
    refreshIcons();
  }

  function jump(sec) {
    const target = sec < 0 ? document.querySelector('#prose') : document.querySelectorAll('#prose h2')[sec];
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    target.classList.remove('km-flash'); void target.offsetWidth; target.classList.add('km-flash');
  }

  /* ---------- Khung hiển thị & điều khiển ---------- */
  function shellHTML(id = 'kmap') {
    const b = (act, icon, title) => `<button type="button" class="km-btn" data-km-z="${act}" title="${title}" aria-label="${title}"><i data-lucide="${icon}" class="w-4 h-4"></i></button>`;
    return `
      <div class="km" data-km>
        <div class="km-bar">
          <div class="km-tabs" role="tablist">
            <button type="button" role="tab" class="km-tab on" data-km-tab="rel"><i data-lucide="git-fork" class="w-4 h-4"></i>${L('Phả hệ khái niệm', 'Concept lineage')}</button>
            <button type="button" role="tab" class="km-tab" data-km-tab="doc"><i data-lucide="list-tree" class="w-4 h-4"></i>${L('Cấu trúc tài liệu', 'Document structure')}</button>
          </div>
          <div class="km-ctrls">
            ${b('out', 'zoom-out', L('Thu nhỏ', 'Zoom out'))}<span class="km-zoom" data-km-lbl>100%</span>${b('in', 'zoom-in', L('Phóng to', 'Zoom in'))}
            ${b('fit', 'scan', L('Vừa khung', 'Fit'))}${b('full', 'maximize-2', L('Toàn màn hình', 'Fullscreen'))}
          </div>
        </div>
        <div class="km-legend">
          <span class="km-dot root"></span>${L('Nền tảng gốc', 'Core foundation')}
          <span class="km-dot branch"></span>${L('Khái niệm nhánh', 'Branch concept')}
          <span class="km-dot leaf"></span>${L('Ứng dụng sâu', 'Deep application')}
          <span class="km-lg-note">${L('Ctrl + cuộn để phóng to · kéo để di chuyển', 'Ctrl + scroll to zoom · drag to pan')}</span>
        </div>
        <div class="km-body"><div id="${id}" class="km-canvas" data-ph="${L('Đang vẽ sơ đồ…', 'Drawing map…')}"></div><aside class="km-info" aria-live="polite"></aside></div>
      </div>`;
  }

  function show(shell, tab) {
    shell.querySelectorAll('[data-km-tab]').forEach((b) => b.classList.toggle('on', b.dataset.kmTab === tab));
    shell._tab = tab; shell._v = null;
    draw(shell, shell._models[tab]);
  }

  function bindShell(shell) {
    shell._bound = true;
    const canvas = shell.querySelector('.km-canvas');
    let drag = null, moved = false;

    shell.addEventListener('click', (e) => {
      const tab = e.target.closest('[data-km-tab]');
      if (tab) return show(shell, tab.dataset.kmTab);
      const z = e.target.closest('[data-km-z]')?.dataset.kmZ;
      if (z) {
        if (z === 'in') zoom(shell, 1.2); else if (z === 'out') zoom(shell, 1 / 1.2); else if (z === 'fit') fit(shell);
        else { shell.classList.toggle('km-full'); document.body.classList.toggle('km-lock', shell.classList.contains('km-full')); requestAnimationFrame(() => fit(shell)); }
        return;
      }
      const go = e.target.closest('[data-km-go]');
      if (go) return select(shell, go.dataset.kmGo);
      const j = e.target.closest('[data-km-jump]');
      if (j) { if (shell.classList.contains('km-full')) { shell.classList.remove('km-full'); document.body.classList.remove('km-lock'); } return jump(+j.dataset.kmJump); }
      if (moved) return;
      if (canvas.contains(e.target)) select(shell, e.target.closest('.km-n')?.dataset.id);
    });
    shell.addEventListener('keydown', (e) => {
      const n = e.target.closest?.('.km-n');
      if (n && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); select(shell, n.dataset.id); }
      if (e.key === 'Escape' && shell.classList.contains('km-full')) { shell.classList.remove('km-full'); document.body.classList.remove('km-lock'); fit(shell); }
    });
    canvas.addEventListener('wheel', (e) => {
      if (!(shell.classList.contains('km-full') || e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const r = canvas.getBoundingClientRect();
      zoom(shell, e.deltaY < 0 ? 1.1 : 1 / 1.1, e.clientX - r.left, e.clientY - r.top);
    }, { passive: false });
    canvas.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      const v = view(shell); drag = { x: e.clientX, y: e.clientY, vx: v.x, vy: v.y }; moved = false;
      const mv = (ev) => {
        const dx = ev.clientX - drag.x, dy = ev.clientY - drag.y;
        if (!moved && Math.hypot(dx, dy) < 5) return;
        moved = true; canvas.classList.add('grabbing');
        v.x = drag.vx + dx; v.y = drag.vy + dy; apply(shell);
      };
      const up = () => {
        removeEventListener('pointermove', mv); removeEventListener('pointerup', up);
        canvas.classList.remove('grabbing'); setTimeout(() => { moved = false; }, 0);
      };
      addEventListener('pointermove', mv); addEventListener('pointerup', up);
    });
    addEventListener('resize', () => { if (shell.isConnected) fit(shell); });
  }

  function render(target, graph, lesson) {
    if (!target) return;
    const shell = target.closest('[data-km]');
    shell._models = { rel: relModel(graph), doc: docModel(lesson) };
    const tabs = shell.querySelectorAll('[data-km-tab]');
    tabs.forEach((b) => b.classList.toggle('hidden', !shell._models[b.dataset.kmTab]));
    const first = shell._models.rel ? 'rel' : shell._models.doc ? 'doc' : null;
    if (!first) { target.textContent = L('Chưa có dữ liệu để vẽ sơ đồ.', 'No data to draw a map yet.'); return; }
    if (!shell._bound) bindShell(shell);
    show(shell, first);
    refreshIcons();
  }

  return { shellHTML, render };
})();
