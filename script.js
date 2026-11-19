'use strict';

/* =====================================================================
   1. DỮ LIỆU BÀI HỌC
   ===================================================================== */
const TIERS = [
  { key: 'nho',  icon: 'bookmark'  },
  { key: 'hieu', icon: 'lightbulb' },
  { key: 'vd',   icon: 'wrench'    },
];

const LESSONS = [
  {
    id: 'osi',
    title: 'Mô hình OSI và TCP/IP',
    summary: 'Bảy tầng của OSI, cách dữ liệu được đóng gói và cách dùng mô hình để khoanh vùng sự cố.',
    html: `
      <p>Mô hình OSI (Open Systems Interconnection) chia quá trình truyền dữ liệu giữa hai thiết bị thành 7 tầng. Mỗi tầng chỉ làm một việc và chỉ “nói chuyện” trực tiếp với tầng liền kề, nhờ đó ta có thể thay đổi công nghệ ở một tầng mà không phải thiết kế lại toàn bộ hệ thống.</p>
      <h2>Bảy tầng của OSI</h2>
      <ol reversed>
        <li><strong>Ứng dụng (Application):</strong> giao diện cho ứng dụng, ví dụ HTTP, DNS, SMTP.</li>
        <li><strong>Trình bày (Presentation):</strong> mã hóa, nén, chuyển đổi định dạng dữ liệu.</li>
        <li><strong>Phiên (Session):</strong> mở, duy trì và đóng phiên làm việc giữa hai bên.</li>
        <li><strong>Giao vận (Transport):</strong> TCP/UDP, số cổng, kiểm soát lỗi và luồng.</li>
        <li><strong>Mạng (Network):</strong> địa chỉ IP và định tuyến gói tin giữa các mạng.</li>
        <li><strong>Liên kết dữ liệu (Data Link):</strong> địa chỉ MAC, frame, hoạt động của switch.</li>
        <li><strong>Vật lý (Physical):</strong> truyền bit qua cáp, sóng vô tuyến, quang.</li>
      </ol>
      <h2>Đóng gói dữ liệu</h2>
      <p>Khi gửi, dữ liệu đi từ tầng trên xuống và mỗi tầng thêm phần đầu (header) của mình. Đơn vị dữ liệu đổi tên theo từng tầng: dữ liệu, rồi segment (tầng 4), packet (tầng 3), frame (tầng 2) và cuối cùng là các bit (tầng 1). Bên nhận gỡ các lớp này theo thứ tự ngược lại.</p>
      <h2>OSI và TCP/IP</h2>
      <p>Internet thực tế chạy theo mô hình TCP/IP gồm 4 tầng: Ứng dụng (gộp tầng 5–7 của OSI), Giao vận, Internet và Truy cập mạng (gộp tầng 1–2). OSI chủ yếu được dùng như một “ngôn ngữ chung” khi phân tích và xử lý sự cố.</p>
      <h2>Dùng OSI để khoanh vùng sự cố</h2>
      <p>Hãy đi từ dưới lên: kiểm tra cáp và đèn cổng (tầng 1), rồi địa chỉ MAC và VLAN (tầng 2), rồi IP và định tuyến (tầng 3), cuối cùng là cổng và ứng dụng (tầng 4–7). Cách này giúp loại trừ nguyên nhân có hệ thống thay vì đoán mò.</p>`,
    graph: {
      concepts: [
        { id: 'c1', name: 'Tầng Vật lý' },
        { id: 'c2', name: 'Liên kết dữ liệu' },
        { id: 'c3', name: 'Tầng Mạng (IP)' },
        { id: 'c4', name: 'Tầng Giao vận' },
        { id: 'c5', name: 'Tầng Phiên' },
        { id: 'c6', name: 'Tầng Trình bày' },
        { id: 'c7', name: 'Tầng Ứng dụng' },
        { id: 'c8', name: 'Đóng gói dữ liệu' },
        { id: 'c9', name: 'Mô hình TCP/IP' },
      ],
      relations: [
        { from: 'c1', to: 'c2', label: 'nền tảng của' },
        { from: 'c2', to: 'c3', label: 'nền tảng của' },
        { from: 'c3', to: 'c4', label: 'nền tảng của' },
        { from: 'c4', to: 'c5', label: 'nền tảng của' },
        { from: 'c5', to: 'c6', label: 'nền tảng của' },
        { from: 'c6', to: 'c7', label: 'nền tảng của' },
        { from: 'c4', to: 'c8', label: 'segment' },
        { from: 'c3', to: 'c8', label: 'packet' },
        { from: 'c2', to: 'c8', label: 'frame' },
        { from: 'c7', to: 'c9', label: 'gộp tầng 5-7' },
        { from: 'c3', to: 'c9', label: 'tầng Internet' },
        { from: 'c1', to: 'c9', label: 'gộp tầng 1-2' },
      ],
    },
    quiz: [
      { tier: 'nho',  q: 'Mô hình OSI gồm bao nhiêu tầng?', opts: ['4', '5', '7', '9'], a: 2, why: 'OSI có 7 tầng, từ Vật lý đến Ứng dụng. TCP/IP mới là mô hình 4 tầng.' },
      { tier: 'nho',  q: 'Tầng nào chịu trách nhiệm định tuyến gói tin bằng địa chỉ IP?', opts: ['Liên kết dữ liệu', 'Mạng', 'Giao vận', 'Phiên'], a: 1, why: 'Tầng Mạng (tầng 3) dùng địa chỉ IP để chọn đường đi giữa các mạng.' },
      { tier: 'hieu', q: 'Vì sao người ta chia quá trình truyền thông thành nhiều tầng?', opts: ['Để dữ liệu đi nhanh hơn', 'Để mỗi tầng độc lập, đổi giao thức ở một tầng không ảnh hưởng các tầng khác', 'Để mọi thiết bị đều phải hỗ trợ cả 7 tầng', 'Để không cần dùng địa chỉ IP'], a: 1, why: 'Phân tầng giúp chuẩn hóa và thay thế từng phần mà không phải thiết kế lại cả hệ thống.' },
      { tier: 'hieu', q: 'Điểm khác nhau chính giữa frame và packet là gì?', opts: ['Frame ở tầng 2 và chứa địa chỉ MAC; packet ở tầng 3 và chứa địa chỉ IP', 'Frame lớn hơn packet ở mọi trường hợp', 'Frame chỉ dùng cho Wi-Fi, packet chỉ dùng cho cáp', 'Hai thuật ngữ này hoàn toàn đồng nghĩa'], a: 0, why: 'Mỗi tầng có đơn vị dữ liệu riêng: frame thuộc tầng Liên kết dữ liệu, packet thuộc tầng Mạng.' },
      { tier: 'vd',   q: 'Máy A ping được 127.0.0.1 nhưng không ping được gateway, và đèn cổng mạng không sáng. Nên kiểm tra tầng nào trước?', opts: ['Ứng dụng', 'Giao vận', 'Mạng', 'Vật lý'], a: 3, why: 'Đèn cổng không sáng là dấu hiệu lỗi cáp hoặc cổng. Khoanh vùng từ dưới lên nên bắt đầu ở tầng Vật lý.' },
      { tier: 'vd',   q: 'Bạn cần chặn toàn bộ lưu lượng tới cổng 23 (Telnet) trên một server. Số cổng là thông tin của tầng nào?', opts: ['Giao vận', 'Mạng', 'Liên kết dữ liệu', 'Vật lý'], a: 0, why: 'Số cổng (port) thuộc header của TCP/UDP ở tầng Giao vận.' },
    ],
  },
  {
    id: 'tcp-udp',
    title: 'TCP và UDP',
    summary: 'Hai giao thức tầng giao vận: khi nào dùng, và vì sao chúng có điểm yếu khác nhau về bảo mật.',
    html: `
      <p>Tầng giao vận quyết định dữ liệu được vận chuyển như thế nào giữa hai tiến trình. Mỗi tiến trình được phân biệt bằng một số cổng (port).</p>
      <h2>TCP: tin cậy, có kết nối</h2>
      <p>TCP thiết lập kết nối bằng bắt tay ba bước (SYN, SYN-ACK, ACK), đánh số thứ tự gói, xác nhận và gửi lại gói bị mất. Đổi lại, nó tốn thêm thời gian và tài nguyên. Web (HTTP/HTTPS), email và SSH đều dùng TCP.</p>
      <h2>UDP: nhanh, không đảm bảo</h2>
      <p>UDP gửi thẳng từng gói (datagram) mà không bắt tay, không xác nhận, không gửi lại. Nhờ độ trễ thấp, nó phù hợp với DNS, gọi thoại, game trực tuyến và streaming, nơi mất vài gói còn chấp nhận được hơn là phải chờ.</p>
      <h2>Góc nhìn bảo mật</h2>
      <p>Vì TCP phải giữ trạng thái cho mỗi kết nối đang mở dở, kẻ tấn công có thể gửi hàng loạt gói SYN để làm cạn tài nguyên máy chủ (SYN flood). UDP không có trạng thái nên dễ bị giả mạo địa chỉ nguồn và bị lợi dụng để khuếch đại tấn công.</p>`,
    graph: {
      concepts: [
        { id: 'p', name: 'Số cổng (port)' },
        { id: 't', name: 'TCP' },
        { id: 'u', name: 'UDP' },
        { id: 'h', name: 'Bắt tay ba bước' },
        { id: 'r', name: 'Tin cậy, gửi lại' },
        { id: 'l', name: 'Độ trễ thấp' },
        { id: 's', name: 'SYN flood' },
        { id: 'g', name: 'Giả mạo, khuếch đại' },
      ],
      relations: [
        { from: 'p', to: 't', label: 'định danh tiến trình' },
        { from: 'p', to: 'u', label: 'định danh tiến trình' },
        { from: 't', to: 'h', label: 'thiết lập kết nối' },
        { from: 'h', to: 'r', label: 'đảm bảo' },
        { from: 'u', to: 'l', label: 'không bắt tay' },
        { from: 'r', to: 's', label: 'giữ trạng thái' },
        { from: 'u', to: 'g', label: 'không trạng thái' },
      ],
    },
    quiz: [
      { tier: 'nho',  q: 'Giao thức nào sử dụng bắt tay ba bước để thiết lập kết nối?', opts: ['UDP', 'TCP', 'ICMP', 'ARP'], a: 1, why: 'Bắt tay ba bước SYN, SYN-ACK, ACK là đặc trưng của TCP.' },
      { tier: 'hieu', q: 'Vì sao gọi thoại và streaming thường chọn UDP thay vì TCP?', opts: ['UDP mã hóa dữ liệu tốt hơn', 'UDP đảm bảo không mất gói', 'UDP có độ trễ thấp, chấp nhận mất vài gói thay vì chờ gửi lại', 'UDP không cần số cổng'], a: 2, why: 'Với dữ liệu thời gian thực, gói đến muộn gần như vô dụng nên việc gửi lại của TCP không giúp ích.' },
      { tier: 'vd',   q: 'Máy chủ web bị quá tải vì nhận rất nhiều gói SYN mà không có ACK hoàn tất. Đây là kiểu tấn công nào và nó lợi dụng điều gì?', opts: ['UDP flood, lợi dụng việc UDP không có xác nhận', 'SYN flood, lợi dụng việc TCP phải giữ trạng thái cho các kết nối đang mở dở', 'ARP spoofing, lợi dụng bảng MAC của switch', 'DNS poisoning, lợi dụng bộ nhớ đệm của DNS'], a: 1, why: 'Mỗi SYN khiến máy chủ cấp tài nguyên chờ ACK. Gửi số lượng lớn sẽ làm đầy hàng đợi kết nối.' },
    ],
  },
];

/* =====================================================================
   2. TIỆN ÍCH & LƯU TRỮ
   ===================================================================== */
const $  = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const store = {
  get(k, d) {
    try {
      const raw = localStorage.getItem('study:' + k);
      if (raw === null) return d;
      const v = JSON.parse(raw);
      // Dữ liệu sai kiểu (bị sửa tay / lỗi phiên bản cũ) → dùng giá trị mặc định thay vì làm sập app
      if (Array.isArray(d) !== Array.isArray(v)) return d;
      if (typeof d === 'number' && (typeof v !== 'number' || !Number.isFinite(v))) return d;
      if (typeof d === 'string' && typeof v !== 'string') return d;
      return v;
    } catch { return d; }
  },
  set(k, v) { try { localStorage.setItem('study:' + k, JSON.stringify(v)); } catch {} },
};

const pad = (n) => String(n).padStart(2, '0');
const fmt = (s) => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const refreshIcons = () => window.lucide && lucide.createIcons();

function readMinutes(l) {
  l.mins ??= Math.max(1, Math.ceil(l.html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length / 180));
  return l.mins;
}
const lastLesson = () => LESSONS.find((l) => l.id === store.get('last')) || LESSONS[0];

/* =====================================================================
   3. DARK / LIGHT MODE TOGGLE
   ===================================================================== */
$('#themeToggle').addEventListener('click', () => {
  const dark = document.documentElement.classList.toggle('dark');
  try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch {}
});

/* ---------- Ôn tập: gom các câu đã làm sai ở mọi bài ---------- */
const REVIEW_BATCH = 10;
function wrongOf(l) {
  const w = store.get('wrong:' + l.id, []);
  return [...new Set(w)].filter((i) => Number.isInteger(i) && i >= 0 && i < l.quiz.length);
}
function reviewSet() {
  return LESSONS.flatMap((l) => wrongOf(l).map((i) => ({ ...l.quiz[i], lid: l.id, qi: i })));
}

/* =====================================================================
   4. VIEW: DASHBOARD
   ===================================================================== */
function viewDashboard() {
  const totalSec = LESSONS.reduce((s, l) => s + store.get('time:' + l.id, 0), 0);
  const done = LESSONS.filter((l) => store.get('prog:' + l.id, 0) >= 0.95).length;
  const lastQuiz = store.get('quizlast', null);
  const last = lastLesson();
  const name = AUTH.user()?.name || t('dash.friend');
  const xpNow = store.get('xp', 0);

  const stat = (icon, label, value, tone = '') => `
    <div class="card p-5 flex items-center gap-4">
      <div class="tier-badge ${tone}"><i data-lucide="${icon}"></i></div>
      <div><div class="text-xs font-medium text-muted uppercase tracking-wider">${label}</div><div class="font-bold text-xl mt-0.5">${value}</div></div>
    </div>`;

  const card = (l) => {
    const pct = Math.round(store.get('prog:' + l.id, 0) * 100);
    const q = store.get('quiz:' + l.id, null);
    const hue = ([...l.id].reduce((a, c) => a + c.charCodeAt(0), 0) * 47) % 360;
    return `
      <div class="card lesson-card p-6 flex flex-col gap-4" style="--hue:${hue}">
        <div>
          <div class="flex items-start justify-between gap-3">
            <h3 class="font-bold text-lg">${l.title}</h3>
            ${l.ai ? `<button type="button" class="icon-btn flex-none" data-del="${l.id}" aria-label="${t('card.delete')}" title="${t('card.delete')}"><i data-lucide="trash-2" class="w-4 h-4"></i></button>` : ''}
          </div>
          ${l.ai ? `<span class="badge-ai mt-1.5"><i data-lucide="sparkles"></i>${t(l.sample ? 'card.sample' : 'card.ai')}</span>` : ''}
          <p class="text-sm text-muted mt-1.5 leading-relaxed">${l.summary}</p>
        </div>
        <div class="space-y-1.5">
          <div class="flex justify-between text-xs font-medium text-muted">
            <span>${t('card.progress')}</span>
            <span>${pct}%</span>
          </div>
          <div class="meter" aria-hidden="true"><div style="width:${pct}%"></div></div>
        </div>
        <div class="flex items-center justify-between text-xs text-muted pt-1">
          <span><i data-lucide="clock" class="inline w-3.5 h-3.5 mr-1"></i>${t('card.readmin', { n: readMinutes(l) })}</span>
          <span>${q ? t('card.score', { s: q.score, t: q.total }) : t('card.noquiz')}</span>
        </div>
        <div class="flex gap-2.5 mt-2 pt-3 border-t border-line">
          <a class="btn btn-primary flex-1 justify-center" href="#/read/${l.id}"><i data-lucide="book-open" class="w-4 h-4"></i>${t('card.read')}</a>
          <a class="btn flex-1 justify-center" href="#/quiz/${l.id}"><i data-lucide="list-checks" class="w-4 h-4"></i>${t('card.quiz')}</a>
        </div>
      </div>`;
  };

  return `
    <div class="animate-fade-in">
      <section class="hero mb-10">
        <div class="hero-main">
          <span class="hero-badge"><i data-lucide="flame" class="w-4 h-4"></i>${t('dash.badge')}</span>
          <h1>${t('dash.hello', { name: esc(name) })}</h1>
          <p>${t('dash.sub')}</p>
          <a href="#/read/${last.id}" class="btn hero-cta"><i data-lucide="play" class="w-4 h-4"></i>${t('dash.continue', { title: last.title })}</a>
        </div>
        <a href="#/roadmap" class="hero-ring" style="--p:${(xpNow % 200) / 2}%" title="${t('grow.xpToNext', { a: xpNow % 200, b: 200, n: Math.floor(xpNow / 200) + 2 })}">
          <span class="hero-ring-in"><small>Lv</small><strong>${Math.floor(xpNow / 200) + 1}</strong></span>
        </a>
      </section>

      ${QS.card()}

      ${GROW.dashStrip()}

      <section class="grid gap-4 sm:grid-cols-3 mb-10">
        ${stat('timer', t('dash.time'), t('dash.minutes', { n: Math.floor(totalSec / 60) }), 'tone-cyan')}
        ${stat('check-circle', t('dash.done'), `${done}/${LESSONS.length}`, 'tone-ok')}
        ${stat('target', t('dash.score'), lastQuiz ? `${lastQuiz.score}/${lastQuiz.total}` : '—', 'tone-gold')}
      </section>

      <div class="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <h2 class="text-xl font-bold flex items-center gap-2"><i data-lucide="book-marked" class="text-accent w-5 h-5"></i>${t('dash.lessons')}</h2>
        <a href="#/ai" class="btn"><i data-lucide="sparkles" class="w-4 h-4"></i>${t('dash.addAI')}</a>
      </div>
      <div class="grid gap-5 sm:grid-cols-2">${LESSONS.map(card).join('')}</div>
    </div>`;
}

/* =====================================================================
   5. VIEW: TRÌNH ĐỌC LÝ THUYẾT
   ===================================================================== */
let cur = null, secs = 0, idle = 0, pct = 0, timer = null, fontSizeScale = 1.15;
const IDLE_LIMIT = 60;

function viewReader(l) {
  return `
    <div class="animate-fade-in">
      <article class="mx-auto bg-surface p-5 sm:p-12 rounded-2xl border border-line shadow-sm" style="max-width:72ch">
        <div class="flex items-center justify-between flex-wrap gap-3 mb-8 pb-4 border-b border-line">
          <a href="#/" class="text-sm font-medium text-muted hover:text-ink inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"><i data-lucide="arrow-left" class="w-4 h-4"></i>${t('back.dash')}</a>

          <div class="flex items-center gap-2 bg-bg px-3 py-1.5 rounded-lg border border-line text-xs font-medium text-muted whitespace-nowrap">
            <span>${t('reader.font')}:</span>
            <button id="fontMinus" class="hover:text-ink px-1 font-bold">A-</button>
            <button id="fontReset" class="hover:text-ink px-1">${t('reader.fontDefault')}</button>
            <button id="fontPlus" class="hover:text-ink px-1 font-bold">A+</button>
          </div>
        </div>

        <h1 class="text-3xl sm:text-4xl font-bold tracking-tight mb-3">${l.title}</h1>
        <p class="text-muted flex items-center gap-2 text-sm mb-10"><i data-lucide="clock" class="w-4 h-4"></i>${t('reader.est', { n: readMinutes(l) })}</p>

        <div id="prose" class="prose-reader mt-6" style="font-size: ${fontSizeScale}rem">${l.html}</div>

        <div id="gx-video" class="mt-14"></div>

        ${l.graph || l.html ? `
        <h2 class="text-xl font-bold mt-14 mb-4 flex items-center gap-2"><i data-lucide="git-fork" class="text-accent w-5 h-5"></i>${t('reader.map')}</h2>
        ${AI.mapWrapperHTML('kmap')}` : ''}

        <div id="gx-notes" class="mt-14"></div>

        <div class="card mt-16 p-6 bg-accent-soft/20 border-accent/30 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h4 class="font-semibold text-base">${t('reader.ready')}</h4>
            <p class="text-sm text-muted mt-0.5">${t('reader.readySub')}</p>
          </div>
          <a class="btn btn-primary" href="#/quiz/${l.id}"><i data-lucide="list-checks" class="w-4 h-4"></i>${t('reader.takeQuiz')}</a>
        </div>
      </article>
      <div class="tracker" role="status"><i data-lucide="timer" class="w-4 h-4 text-accent"></i><span id="trackerText"></span></div>
    </div>`;
}

function renderTracker() {
  const el = $('#trackerText');
  if (!el) return;
  const left = Math.ceil(readMinutes(cur) * (1 - pct));
  el.textContent = `${fmt(secs)} · ${Math.round(pct * 100)}%` + (left > 0 ? ` · ${t('reader.left', { n: left })}` : ` · ${t('reader.done')}`);
}

function updateProgress() {
  const el = $('#prose');
  if (!el) return;
  const r = el.getBoundingClientRect();
  pct = clamp((innerHeight * 0.7 - r.top) / r.height, 0, 1);
  $('#progressBar').style.width = pct * 100 + '%';
  $('#progress').setAttribute('aria-valuenow', Math.round(pct * 100));
  if (Math.round(pct * 100) > Math.round(store.get('prog:' + cur.id, 0) * 100)) store.set('prog:' + cur.id, pct);
  renderTracker();
}

const markActive = () => { idle = 0; };
const ACTIVITY = ['mousemove', 'keydown', 'touchstart', 'scroll'];

function startReader(l) {
  cur = l; secs = store.get('time:' + l.id, 0); idle = 0;
  $('#progress').classList.remove('hidden');
  addEventListener('scroll', updateProgress, { passive: true });
  ACTIVITY.forEach((e) => addEventListener(e, markActive, { passive: true }));

  setTimeout(() => {
    const proseEl = $('#prose');
    if ($('#fontPlus')) {
      $('#fontPlus').onclick = () => { fontSizeScale = Math.min(fontSizeScale + 0.1, 1.5); if (proseEl) proseEl.style.fontSize = fontSizeScale + 'rem'; };
      $('#fontMinus').onclick = () => { fontSizeScale = Math.max(fontSizeScale - 0.1, 0.95); if (proseEl) proseEl.style.fontSize = fontSizeScale + 'rem'; };
      $('#fontReset').onclick = () => { fontSizeScale = 1.15; if (proseEl) proseEl.style.fontSize = fontSizeScale + 'rem'; };
    }
  }, 50);

  timer = setInterval(() => {
    if (document.hidden || ++idle > IDLE_LIMIT) return;
    secs++;
    if (secs % 5 === 0) store.set('time:' + cur.id, secs);
    renderTracker();
  }, 1000);
  updateProgress();
}

function stopReader() {
  if (!timer) return;
  clearInterval(timer); timer = null;
  store.set('time:' + cur.id, secs);
  removeEventListener('scroll', updateProgress);
  ACTIVITY.forEach((e) => removeEventListener(e, markActive));
  $('#progress').classList.add('hidden');
  $('#progressBar').style.width = '0';
}

/* =====================================================================
   6. VIEW: TRẮC NGHIỆM PHÂN TẦNG
   ===================================================================== */
function viewQuiz(l) {
  let n = 0;
  const question = (q) => `
    <div class="card p-6" data-q="${q.i}" role="group" aria-label="${t('quiz.q')} ${++n}">
      <p class="font-semibold text-base mb-4 flex items-start gap-2.5">
        <span class="flex-none w-7 h-7 rounded-lg bg-accent-soft text-accent text-xs font-bold flex items-center justify-center mt-0.5">${n}</span>
        <span>${q.q}</span>
      </p>
      <div class="grid gap-2.5 pl-9" role="radiogroup">
        ${q.opts.map((o, k) => `
          <button type="button" role="radio" aria-checked="false" class="opt" data-k="${k}">
            <span class="opt-key">${'ABCD'[k]}</span><span>${o}</span>
          </button>`).join('')}
      </div>
      <p class="why hidden mt-4 ml-9 p-3.5 rounded-xl bg-bg border border-line text-sm text-muted font-medium"></p>
    </div>`;

  const sections = TIERS.map((tier) => {
    const items = l.quiz.map((q, i) => ({ ...q, i })).filter((q) => q.tier === tier.key);
    if (!items.length) return '';
    return `
      <section class="mb-10">
        <header class="flex items-center gap-3.5 mb-5">
          <span class="tier-badge"><i data-lucide="${tier.icon}"></i></span>
          <div><h2 class="font-bold text-lg">${t('tier.' + tier.key)}</h2><p class="text-sm text-muted">${t('tier.' + tier.key + '.hint')}</p></div>
        </header>
        <div class="space-y-4">${items.map(question).join('')}</div>
      </section>`;
  }).join('');

  return `
    <div class="mx-auto animate-fade-in" style="max-width:72ch">
      <div class="mb-8">
        <a href="#/" class="text-sm font-medium text-muted hover:text-ink inline-flex items-center gap-1.5 mb-3 transition-colors"><i data-lucide="arrow-left" class="w-4 h-4"></i>${t('back.dash')}</a>
        <h1 class="text-3xl font-bold tracking-tight">${l.review ? t('review.title') : t('quiz.title')}</h1>
        <p class="text-muted mt-1">${l.review ? t('review.sub', { n: l.quiz.length }) : t('quiz.sub')}</p>
      </div>

      ${l.review ? '' : `<div class="flex flex-wrap gap-2 mb-8 p-1.5 bg-surface rounded-xl border border-line">
        ${LESSONS.map((x) => `<a href="#/quiz/${x.id}" class="chip ${x.id === l.id ? 'chip-on' : ''} flex-1 text-center py-2">${x.title}</a>`).join('')}
      </div>`}

      <div id="quiz">${sections}</div>

      <div id="result" class="card p-6 mb-6 hidden bg-accent-soft/30 border-accent/40"></div>

      <div class="card p-5 flex items-center justify-between gap-4 sticky bottom-4 z-10 backdrop-blur-md bg-surface/90 shadow-lg">
        <div class="text-sm font-medium text-muted">${t('quiz.chosen')}: <span id="count" class="font-bold text-ink">0</span>/${l.quiz.length} ${t('quiz.questions')}</div>
        <div class="flex items-center gap-3">
          <button id="submit" type="button" class="btn btn-primary"><i data-lucide="check" class="w-4 h-4"></i>${t('quiz.submit')}</button>
          <button id="retry" type="button" class="btn hidden"><i data-lucide="rotate-ccw" class="w-4 h-4"></i>${t('quiz.retry')}</button>
        </div>
      </div>
    </div>`;
}

function viewReviewEmpty() {
  return `
    <div class="mx-auto animate-fade-in" style="max-width:72ch">
      <a href="#/" class="text-sm font-medium text-muted hover:text-ink inline-flex items-center gap-1.5 mb-3 transition-colors"><i data-lucide="arrow-left" class="w-4 h-4"></i>${t('back.dash')}</a>
      <div class="card card-static p-8 text-center">
        <span class="tier-badge mx-auto mb-4"><i data-lucide="party-popper"></i></span>
        <h1 class="text-2xl font-bold tracking-tight">${t('review.emptyTitle')}</h1>
        <p class="text-muted mt-2">${t('review.emptySub')}</p>
        <a class="btn btn-primary mt-6" href="#/quiz/${lastLesson().id}"><i data-lucide="list-checks" class="w-4 h-4"></i>${t('reader.takeQuiz')}</a>
      </div>
    </div>`;
}

function bindQuiz(l) {
  const ans = {};
  let submitted = false;

  $('#quiz').addEventListener('click', (e) => {
    const o = e.target.closest('.opt');
    if (!o || submitted) return;
    const box = o.closest('[data-q]');
    ans[box.dataset.q] = +o.dataset.k;
    $$('.opt', box).forEach((b) => b.setAttribute('aria-checked', b === o));
    $('#count').textContent = Object.keys(ans).length;
  });

  $('#retry').addEventListener('click', route);

  $('#submit').addEventListener('click', () => {
    if (Object.keys(ans).length === 0) {
      alert(t('quiz.pickOne'));
      return;
    }
    submitted = true;
    const by = {};
    let score = 0;

    l.quiz.forEach((q, i) => {
      const box = $(`[data-q="${i}"]`), opts = $$('.opt', box), ok = ans[i] === q.a;
      opts.forEach((b) => { b.disabled = true; });
      opts[q.a].classList.add('ok');
      if (!ok && ans[i] !== undefined) opts[ans[i]].classList.add('bad');
      const why = $('.why', box);
      why.innerHTML = esc(ok ? t('quiz.correct') : t('quiz.wrong')) + q.why; // q.why đã escape sẵn ở AI.normalize
      why.classList.remove('hidden');
      by[q.tier] ??= [0, 0];
      by[q.tier][1]++;
      if (ok) { by[q.tier][0]++; score++; }
    });

    let gain = 0;
    const wrongIdx = l.quiz.map((q, i) => i).filter((i) => ans[i] !== l.quiz[i].a);
    if (l.review) {
      // Ôn tập: câu làm đúng được gỡ khỏi danh sách sai; mỗi câu chỉ thưởng XP một lần (chống cày điểm)
      const fixed = {};
      l.quiz.forEach((q, i) => { if (ans[i] === q.a) (fixed[q.lid] ??= []).push(q.qi); });
      for (const [lid, list] of Object.entries(fixed)) {
        store.set('wrong:' + lid, store.get('wrong:' + lid, []).filter((x) => !list.includes(x)));
        const paid = store.get('rxp:' + lid, []);
        const fresh = list.filter((x) => !paid.includes(x));
        if (fresh.length) { store.set('rxp:' + lid, [...paid, ...fresh]); gain += fresh.length * 5; }
      }
    } else {
      store.set('wrong:' + l.id, wrongIdx);
      const best = store.get('qbest:' + l.id, 0);
      gain = Math.max(0, score - best) * 10;
      if (gain) store.set('qbest:' + l.id, score);
      store.set('quiz:' + l.id, { score, total: l.quiz.length });
      store.set('quizlast', { id: l.id, score, total: l.quiz.length });
    }

    const rows = TIERS.filter((tier) => by[tier.key]).map((tier) => ({ ...tier, s: by[tier.key][0], n: by[tier.key][1] }));
    const weakest = rows.reduce((a, b) => (b.s / b.n < a.s / a.n ? b : a), rows[0]);
    const advice = l.review
      ? (score === l.quiz.length ? t('review.allClear') : t('review.keep', { n: wrongIdx.length }))
      : score === l.quiz.length
        ? t('quiz.perfect')
        : t('quiz.advice', { w: t('tier.' + weakest.key) });
    const remaining = reviewSet().length;
    const reviewBtn = remaining
      ? `<a class="btn btn-primary mt-4" href="#/review"><i data-lucide="repeat" class="w-4 h-4"></i>${t('review.cta', { n: remaining })}</a>` : '';

    const res = $('#result');
    res.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-accent text-accent-ink flex items-center justify-center font-bold text-lg"><i data-lucide="award"></i></div>
        <div>
          <p class="font-bold text-lg">${t('quiz.result', { s: score, t: l.quiz.length })}</p>
          <p class="text-sm text-muted mt-0.5">${rows.map((r) => `${t('tier.' + r.key)}: ${r.s}/${r.n}`).join(' · ')}</p>
        </div>
      </div>
      <p class="mt-4 pt-3 border-t border-line/50 text-sm font-medium">${advice}</p>${reviewBtn}`;
    res.classList.remove('hidden');
    res.scrollIntoView({ behavior: 'smooth', block: 'center' });
    $('#submit').classList.add('hidden');
    $('#retry').classList.remove('hidden');
    refreshIcons();
    if (gain) {
      const lv = GROW.addXP(gain), head = t('quiz.result', { s: score, t: l.quiz.length });
      const lines = [t('grow.xpGain', { n: gain }), lv ? t('grow.levelUp', { n: lv }) : ''];
      score === l.quiz.length ? GROW.celebrate(head, lines) : GROW.toast(head, lines);
    }
  });
}

/* =====================================================================
   7. ROUTER
   ===================================================================== */
let booted = false;

function route() {
  if (!booted) return;
  stopReader();
  const [, view = '', id] = location.hash.slice(1).split('/');
  const mode = ['read', 'quiz', 'ai', 'roadmap', 'review'].includes(view) ? view : 'dash';
  const rv = mode === 'review' ? { id: '__review', review: true, quiz: reviewSet().slice(0, REVIEW_BATCH) } : null;
  const l = rv?.quiz.length ? rv : LESSONS.find((x) => x.id === id) || lastLesson();
  if ((mode === 'read' || mode === 'quiz') && !l.review) store.set('last', l.id);

  $('#app.animate-fade-in')?.classList.remove('animate-fade-in');
  $('#app').innerHTML = mode === 'read' ? viewReader(l) : mode === 'quiz' ? viewQuiz(l)
    : mode === 'review' ? (rv.quiz.length ? viewQuiz(rv) : viewReviewEmpty())
    : mode === 'ai' ? AI.view() : mode === 'roadmap' ? GROW.viewRoadmap() : viewDashboard();

  void $('#app').offsetWidth;
  $('#app').classList.add('animate-fade-in');

  $$('[data-nav]').forEach((a) => {
    a.classList.toggle('active', a.dataset.nav === mode);
    if (a.dataset.nav === 'read' || a.dataset.nav === 'quiz') a.href = `#/${a.dataset.nav}/${lastLesson().id}`;
  });

  GROW.renderChip();
  refreshIcons();
  if (mode === 'read') startReader(l);
  if (mode === 'quiz' || (mode === 'review' && rv.quiz.length)) bindQuiz(l);
  if (mode === 'ai') AI.bind();
  if (mode === 'roadmap') GROW.bindRoadmap();
  if (mode === 'dash') QS.afterRender();
  if (mode === 'read') GROW.mountReader(l);
  if (mode === 'read' && (l.graph || l.html)) AI.renderMap($('#kmap'), l.graph, l);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

LESSONS.push(...store.get('custom', []).filter((l) => l && l.id && l.title && typeof l.html === 'string' && Array.isArray(l.quiz) && l.quiz.length));

$('#app').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-del]');
  if (!btn || !confirm(t('card.deleteConfirm'))) return;
  AI.remove(btn.dataset.del);
  route();
});

addEventListener('hashchange', route);
addEventListener('beforeunload', stopReader);

/* =====================================================================
   8. ĐĂNG NHẬP · NGÔN NGỮ · KHỞI ĐỘNG
   ===================================================================== */
function enterApp(welcome) {
  booted = true;
  I18N.applyStatic();
  AUTH.renderUser();
  CHAT.setVisible(true);
  route();
  if (welcome) GROW.toast(t('auth.hi', { n: AUTH.user()?.name || '' }), [t('auth.welcomeToast')]);
}

function applyLanguage() {
  I18N.applyStatic();
  paintLangBtn();
  AUTH.renderUser();
  AUTH.refresh();
  CHAT.refresh();
  if (booted) route();
}

$('#langToggle').addEventListener('click', () => {
  I18N.setLang(I18N.lang === 'vi' ? 'en' : 'vi');
  applyLanguage();
});
addEventListener('lang:change', applyLanguage);

addEventListener('auth:logout', () => {
  CHAT.setVisible(false);
  AUTH.showLogin(() => enterApp(true));
});

function paintLangBtn() {
  const code = I18N.lang === 'vi' ? 'VI' : 'EN';
  const lbl = $('#langLabel');
  if (lbl) lbl.textContent = code;
  else { const b = $('#langToggle'); if (b) b.textContent = code; }
}

I18N.applyStatic();
paintLangBtn();
if (AUTH.user()) enterApp(false);
else AUTH.showLogin(() => enterApp(true));