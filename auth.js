'use strict';

/* =====================================================================
   AUTH — Đăng nhập Google (demo) / Số điện thoại + OTP (demo).
   Frontend-only: phiên đăng nhập lưu localStorage. Để dùng Google thật,
   thay signInGoogle() bằng Google Identity Services với OAuth Client ID.
   Phụ thuộc: I18N (nạp trước); store, $, refreshIcons, GROW (gọi lúc chạy).
   ===================================================================== */
const AUTH = (() => {
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const UKEY = 'study:user';

  const user = () => {
    try {
      const u = JSON.parse(localStorage.getItem(UKEY)) || null;
      if (u && u.provider === 'demo') u.name = t('auth.guest'); // đổi theo ngôn ngữ đang chọn
      return u;
    } catch { return null; }
  };
  const initials = (name) => String(name || '').trim().split(/\s+/).filter(Boolean).slice(-2).map((w) => w[0].toUpperCase()).join('') || '?';

  let onDone = null, otpTimer = null, otpState = null, curTab = 'google';

  const G_SVG = `<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>`;

  /* ---------- Màn hình đăng nhập ---------- */
  function showLogin(done) {
    onDone = done;
    hideLogin();
    const el = document.createElement('div');
    el.id = 'authScreen';
    el.className = 'auth-screen';
    el.innerHTML = `
      <div class="auth-brand">
        <div class="auth-blob b1"></div><div class="auth-blob b2"></div><div class="auth-blob b3"></div>
        <div class="auth-brand-inner">
          <div class="flex items-center gap-3 mb-10">
            <span class="auth-logo"><i data-lucide="brain-circuit"></i></span>
            <span class="text-2xl font-bold tracking-tight text-white">${t('app.name')}</span>
          </div>
          <h1 class="auth-headline">${t('auth.headline')}</h1>
          <p class="auth-headline-sub">${t('auth.headlineSub')}</p>
          <ul class="auth-feats">
            ${[['file-search', 'auth.f1'], ['list-checks', 'auth.f2'], ['map', 'auth.f3'], ['bot', 'auth.f4']]
              .map(([ic, k]) => `<li><span class="auth-feat-ic"><i data-lucide="${ic}"></i></span>${t(k)}</li>`).join('')}
          </ul>
        </div>
      </div>
      <div class="auth-side">
        <button type="button" id="authLang" class="auth-lang" aria-label="${t('lang.toggle')}">
          <i data-lucide="languages" class="w-4 h-4"></i><span>${I18N.lang === 'vi' ? 'Tiếng Việt' : 'English'}</span>
        </button>
        <div class="auth-card" id="authCard"></div>
        <p class="auth-demo"><i data-lucide="shield-check"></i>${t('auth.demo')}</p>
      </div>`;
    document.body.appendChild(el);
    $('#authLang').addEventListener('click', () => {
      I18N.setLang(I18N.lang === 'vi' ? 'en' : 'vi');
      window.dispatchEvent(new CustomEvent('lang:change'));
    });
    renderMain(curTab);
    refreshIcons();
  }

  function hideLogin() {
    clearInterval(otpTimer); otpTimer = null; otpState = null;
    $('#authScreen')?.remove();
  }

  function renderMain(tab) {
    curTab = tab;
    const card = $('#authCard');
    card.innerHTML = `
      <h2 class="text-2xl font-bold tracking-tight">${t('auth.signin')}</h2>
      <p class="text-sm text-muted mt-1 mb-5">${t('auth.signinSub')}</p>
      <button type="button" id="demoBtn" class="btn btn-primary w-full justify-center"><i data-lucide="zap" class="w-4 h-4"></i>${t('auth.tryNow')}</button>
      <p class="text-xs text-muted mt-2 text-center">${t('auth.tryNowSub')}</p>
      <div class="auth-or"><span>${t('auth.or')}</span></div>
      <div class="auth-tabs" role="tablist">
        <button type="button" role="tab" aria-selected="${tab === 'google'}" class="auth-tab ${tab === 'google' ? 'on' : ''}" data-atab="google">
          <i data-lucide="chrome" class="w-4 h-4"></i>${t('auth.googleTab')}</button>
        <button type="button" role="tab" aria-selected="${tab === 'phone'}" class="auth-tab ${tab === 'phone' ? 'on' : ''}" data-atab="phone">
          <i data-lucide="smartphone" class="w-4 h-4"></i>${t('auth.phoneTab')}</button>
      </div>
      <div id="authBody" class="mt-6"></div>`;
    card.querySelectorAll('[data-atab]').forEach((b) => b.addEventListener('click', () => renderMain(b.dataset.atab)));
    $('#demoBtn').addEventListener('click', () => signIn({ provider: 'demo', name: t('auth.guest'), hue: 200 }));
    if (tab === 'google') renderGoogle(); else renderPhone();
    refreshIcons();
  }

  /* ---------- Google (demo account chooser) ---------- */
  function renderGoogle() {
    $('#authBody').innerHTML = `
      <button type="button" id="gBtn" class="g-btn">${G_SVG}<span>${t('auth.google')}</span></button>
      <div id="gPick" class="hidden mt-4"></div>`;
    $('#gBtn').addEventListener('click', renderPicker);
  }

  const DEMO_ACCOUNTS = [
    { name: 'Jenny Tran', email: 'jenny.tran@gmail.com', hue: 258 },
    { name: 'Minh Le', email: 'minh.le@gmail.com', hue: 190 },
  ];

  function renderPicker() {
    const pick = $('#gPick');
    pick.classList.remove('hidden');
    pick.innerHTML = `
      <p class="text-xs font-semibold uppercase tracking-wider text-muted mb-2">${t('auth.pickAccount')}</p>
      <div class="acct-list">
        ${DEMO_ACCOUNTS.map((a, i) => `
          <button type="button" class="acct-item" data-acct="${i}">
            <span class="acct-ava" style="--hue:${a.hue}">${initials(a.name)}</span>
            <span class="min-w-0"><span class="block font-semibold text-sm truncate">${esc(a.name)}</span>
            <span class="block text-xs text-muted truncate">${esc(a.email)}</span></span>
            <i data-lucide="chevron-right" class="w-4 h-4 text-muted ml-auto flex-none"></i>
          </button>`).join('')}
        <button type="button" class="acct-item" data-acct="custom">
          <span class="acct-ava" style="--hue:330"><i data-lucide="user-round-plus" class="w-4 h-4"></i></span>
          <span class="font-semibold text-sm">${t('auth.useOther')}</span>
        </button>
      </div>
      <form id="gCustom" class="hidden mt-3 space-y-3">
        <input id="gName" class="field" placeholder="${t('auth.namePh')}" aria-label="${t('auth.name')}" maxlength="40">
        <input id="gEmail" type="email" class="field" placeholder="${t('auth.emailPh')}" aria-label="${t('auth.email')}" maxlength="80">
        <p id="gErr" class="text-xs font-medium hidden" style="color:var(--bad)"></p>
        <button type="submit" class="btn btn-primary w-full justify-center"><i data-lucide="arrow-right" class="w-4 h-4"></i>${t('auth.continue')}</button>
      </form>`;
    pick.querySelectorAll('[data-acct]').forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.acct;
      if (k === 'custom') { $('#gCustom').classList.remove('hidden'); $('#gName').focus(); return; }
      const a = DEMO_ACCOUNTS[+k];
      signIn({ provider: 'google', name: a.name, email: a.email, hue: a.hue });
    }));
    $('#gCustom').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#gName').value.trim(), email = $('#gEmail').value.trim();
      const err = $('#gErr');
      const fail = (m) => { err.textContent = m; err.classList.remove('hidden'); };
      if (!name) return fail(t('auth.badName'));
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(t('auth.badEmail'));
      signIn({ provider: 'google', name, email, hue: 258 });
    });
    refreshIcons();
  }

  /* ---------- Số điện thoại + OTP (demo) ---------- */
  function renderPhone() {
    $('#authBody').innerHTML = `
      <form id="pForm" class="space-y-4">
        <label class="block text-sm font-medium">${t('auth.phoneLabel')}
          <div class="phone-wrap mt-1.5">
            <span class="phone-prefix"><i data-lucide="phone" class="w-4 h-4"></i>+84</span>
            <input id="pNum" type="tel" inputmode="tel" class="field" placeholder="912 345 678" autocomplete="tel">
          </div>
        </label>
        <label class="block text-sm font-medium">${t('auth.name')}
          <input id="pName" class="field mt-1.5" placeholder="${t('auth.namePh')}" maxlength="40">
        </label>
        <p id="pErr" class="text-xs font-medium hidden" style="color:var(--bad)"></p>
        <button type="submit" class="btn btn-primary w-full justify-center"><i data-lucide="message-square" class="w-4 h-4"></i>${t('auth.sendOtp')}</button>
      </form>
      <div id="otpStep" class="hidden"></div>`;
    $('#pForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const raw = $('#pNum').value.replace(/[\s.-]/g, '').replace(/^(\+84|0)/, '');
      const err = $('#pErr');
      if (!/^\d{8,14}$/.test(raw)) { err.textContent = t('auth.badPhone'); err.classList.remove('hidden'); return; }
      err.classList.add('hidden');
      const phone = '+84' + raw;
      const name = $('#pName').value.trim() || `${t('auth.learner')} ${raw.slice(-4)}`;
      sendOtp(phone, name);
    });
    refreshIcons();
  }

  function sendOtp(phone, name) {
    otpState = { phone, name, code: String(Math.floor(100000 + Math.random() * 900000)), tries: 0 };
    $('#pForm').classList.add('hidden');
    const step = $('#otpStep');
    step.classList.remove('hidden');
    step.innerHTML = `
      <div class="otp-head">
        <span class="tier-badge"><i data-lucide="shield-check"></i></span>
        <div><p class="font-semibold text-sm">${t('auth.otpSent', { p: esc(phone) })}</p>
        <p class="text-xs text-muted mt-0.5">${t('auth.otpLabel')}</p></div>
      </div>
      <div class="otp-demo"><i data-lucide="info" class="w-4 h-4 flex-none"></i><span>${t('auth.demoOtp', { c: `<strong class="otp-code">${otpState.code}</strong>` })}</span></div>
      <input id="otpInput" class="field otp-input" inputmode="numeric" maxlength="6" placeholder="••••••" aria-label="${t('auth.otpLabel')}" autocomplete="one-time-code">
      <p id="otpErr" class="text-xs font-medium hidden mt-2" style="color:var(--bad)"></p>
      <div class="flex gap-2.5 mt-4">
        <button type="button" id="otpBack" class="btn"><i data-lucide="arrow-left" class="w-4 h-4"></i>${t('auth.back')}</button>
        <button type="button" id="otpVerify" class="btn btn-primary flex-1 justify-center"><i data-lucide="check" class="w-4 h-4"></i>${t('auth.verify')}</button>
      </div>
      <button type="button" id="otpResend" class="otp-resend" disabled></button>`;
    $('#otpBack').addEventListener('click', () => { clearInterval(otpTimer); renderPhone(); });
    $('#otpVerify').addEventListener('click', verifyOtp);
    $('#otpInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') verifyOtp(); });
    $('#otpInput').addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6); });
    $('#otpResend').addEventListener('click', () => sendOtp(phone, name));
    startResendTimer();
    $('#otpInput').focus();
    refreshIcons();
  }

  function startResendTimer() {
    clearInterval(otpTimer);
    let left = 30;
    const btn = $('#otpResend');
    const paint = () => {
      if (!btn.isConnected) return clearInterval(otpTimer);
      btn.disabled = left > 0;
      btn.textContent = left > 0 ? t('auth.resendIn', { n: left }) : t('auth.resend');
    };
    paint();
    otpTimer = setInterval(() => { left--; paint(); if (left <= 0) clearInterval(otpTimer); }, 1000);
  }

  function verifyOtp() {
    const val = $('#otpInput').value.trim();
    const err = $('#otpErr');
    if (val !== otpState.code) {
      err.textContent = t('auth.badOtp'); err.classList.remove('hidden');
      $('#otpInput').classList.add('otp-shake');
      setTimeout(() => $('#otpInput')?.classList.remove('otp-shake'), 450);
      return;
    }
    signIn({ provider: 'phone', name: otpState.name, phone: otpState.phone, hue: 150 });
  }

  /* ---------- Phiên đăng nhập ---------- */
  function signIn(u) {
    try { localStorage.setItem(UKEY, JSON.stringify({ ...u, ts: Date.now() })); } catch {}
    hideLogin();
    renderUser();
    onDone?.(true);
  }

  function logout() {
    try { localStorage.removeItem(UKEY); } catch {}
    $('#userMenu')?.remove();
    $('#userSlot').innerHTML = '';
  }

  /* ---------- Chip người dùng trên header ---------- */
  function renderUser() {
    const slot = $('#userSlot');
    const u = user();
    if (!slot || !u) return;
    slot.innerHTML = `
      <button type="button" id="userBtn" class="user-btn" aria-haspopup="menu" aria-label="${t('auth.account')}">
        <span class="user-ava" style="--hue:${u.hue ?? 258}">${esc(initials(u.name))}</span>
        <span class="hidden lg:block text-sm font-semibold max-w-28 truncate">${esc(u.name)}</span>
        <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-muted hidden lg:block"></i>
      </button>`;
    $('#userBtn').addEventListener('click', (e) => { e.stopPropagation(); toggleMenu(); });
    refreshIcons();
  }

  function toggleMenu() {
    const old = $('#userMenu');
    if (old) { old.remove(); return; }
    const u = user();
    const m = document.createElement('div');
    m.id = 'userMenu'; m.className = 'user-menu'; m.setAttribute('role', 'menu');
    m.innerHTML = `
      <div class="px-4 py-3 border-b border-line">
        <p class="font-semibold text-sm truncate">${esc(u.name)}</p>
        <p class="text-xs text-muted truncate mt-0.5">${esc(u.email || u.phone || (u.provider === 'demo' ? t('auth.demoNote') : ''))}</p>
        <p class="text-xs text-muted mt-1.5 flex items-center gap-1.5">
          <i data-lucide="${({ google: 'chrome', phone: 'smartphone', demo: 'zap' })[u.provider] || 'user'}" class="w-3.5 h-3.5"></i>
          ${u.provider === 'demo' ? '' : t('auth.signedInAs') + ' '}${t(({ google: 'auth.googleProvider', phone: 'auth.phoneProvider', demo: 'auth.demoProvider' })[u.provider] || 'auth.phoneProvider')}</p>
      </div>
      <button type="button" id="logoutBtn" class="user-menu-item" role="menuitem">
        <i data-lucide="log-out" class="w-4 h-4"></i>${t('auth.logout')}</button>`;
    document.body.appendChild(m);
    const r = $('#userBtn').getBoundingClientRect();
    m.style.top = r.bottom + 8 + 'px';
    m.style.right = Math.max(8, innerWidth - r.right) + 'px';
    $('#logoutBtn').addEventListener('click', () => { m.remove(); logout(); window.dispatchEvent(new CustomEvent('auth:logout')); });
    setTimeout(() => document.addEventListener('click', function close(ev) {
      if (!m.contains(ev.target)) { m.remove(); document.removeEventListener('click', close); }
    }), 0);
    refreshIcons();
  }

  /* Vẽ lại màn đăng nhập khi đổi ngôn ngữ (giữ callback và tab hiện tại) */
  function refresh() {
    if ($('#authScreen')) showLogin(onDone);
  }

  return { user, showLogin, hideLogin, renderUser, logout, initials, refresh };
})();