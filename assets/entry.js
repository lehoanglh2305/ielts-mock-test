/* The Standard · Kiểm tra đầu vào. Đáp án và chấm điểm nằm ở máy chủ Apps Script riêng (CONFIG.entry). */
(function () {
  'use strict';
  var CFG = window.CONFIG || {}, E = window.ENTRY;
  var TOTAL_MIN = 60, PART_A_MIN = 30, MAX_VIO = 3;
  var $ = function (id) { return document.getElementById(id); };
  var S = null, info = null, lastVio = 0, tick = null, unloading = false, curSec = null, submitting = false;
  var fsOK = !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen);
  var FLAG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 21V4h11l-1.5 4L16 12H7v9z"/></svg>';
  var PART = {
    A: { name: 'Phần A · Ngữ pháp và Từ vựng', short: 'Phần A', total: 40, next: 'Sang Listening' },
    L: { name: 'Phần B · Listening', short: 'Listening', total: 20, next: 'Sang Reading' },
    R: { name: 'Phần B · Reading', short: 'Reading', total: 13, next: 'Nộp bài' }
  };
  var ERR = {
    network: 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.',
    no_code: 'Không tìm thấy mã này. Kiểm tra lại mã giáo viên gửi.',
    done: 'Mã này đã nộp bài.',
    started_elsewhere: 'Bài làm đã được mở trên một thiết bị khác. Hãy làm tiếp trên thiết bị đó, hoặc nhắn giáo viên để mở lại.',
    not_started: 'Bài làm chưa được bắt đầu hoặc đã được giáo viên mở lại. Hãy nhập lại mã.',
    busy: 'Máy chủ đang bận. Vui lòng thử lại sau vài giây.',
    no_endpoint: 'Trang chưa được kết nối với máy chủ chấm điểm. Hãy báo giáo viên.',
    server: 'Máy chủ gặp lỗi. Vui lòng thử lại.'
  };
  var err = function (r) { return (r && ERR[r.error]) || 'Có lỗi xảy ra' + (r && r.error ? ' (' + r.error + ')' : '') + '.'; };
  var RULES = '<ol class="rules"><li><b>Phần A</b>, Ngữ pháp và Từ vựng: 40 câu, tối đa ' + PART_A_MIN + ' phút.</li>' +
    '<li><b>Phần B</b>, Listening: 2 section, 20 câu. Audio <b>chỉ phát một lần</b>, không tua lại.</li>' +
    '<li><b>Phần B</b>, Reading: 1 bài đọc, 13 câu, làm trong thời gian còn lại.</li></ol>' +
    '<p>Khi đã chuyển sang phần sau, bạn không quay lại phần trước được.</p>' +
    '<h3>Quy định làm bài</h3><ul class="rules">' +
    '<li>Bài làm ở chế độ toàn màn hình. Thoát toàn màn hình, chuyển tab hoặc chuyển sang ứng dụng khác đều bị ghi nhận là vi phạm.</li>' +
    '<li>Vi phạm <b>' + MAX_VIO + '</b> lần, hệ thống <b>tự động nộp bài</b>.</li>' +
    '<li>Không sao chép, dán, chuột phải hay in trang.</li>' +
    '<li>Tải lại trang cũng bị tính là một lần vi phạm. Đồng hồ vẫn chạy.</li>' +
    '<li>Làm trên một thiết bị duy nhất. Hãy dùng tai nghe và mạng ổn định.</li></ul>';
  var HELP = '<h3>Màn hình làm bài</h3><ul class="rules">' +
    '<li><b>Bên trái</b>: đề bài, bài đọc hoặc audio.</li>' +
    '<li><b>Bên phải</b>: nơi bạn chọn đáp án hoặc gõ câu trả lời.</li>' +
    '<li><b>Thanh dưới cùng</b>: danh sách câu hỏi. Ô màu xanh là câu đã làm. Bấm vào số để đến câu đó.</li>' +
    '<li>Bấm biểu tượng lá cờ để <b>gắn cờ</b> câu cần xem lại. Câu gắn cờ có góc đỏ ở thanh dưới.</li>' +
    '<li>Biểu tượng con mắt cạnh đồng hồ dùng để ẩn hoặc hiện thời gian. Khi còn dưới 5 phút, đồng hồ luôn hiện.</li>' +
    '<li>Nút ở góc phải trên cùng dùng để nộp phần hiện tại và chuyển sang phần sau.</li></ul>' + RULES;

  /* ---------- storage & api ---------- */
  function ls(k, v) {
    try {
      if (v === undefined) { var s = localStorage.getItem(k); return s ? JSON.parse(s) : null; }
      if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v));
    } catch (e) { return null; }
  }
  function dev() { var d = ls('ts-ielts-dev'); if (!d) { d = 'D' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); ls('ts-ielts-dev', d); } return d; }
  function skey(code) { return 'ts-entry-' + code; }
  function save() { if (S) ls(skey(S.code), S); }
  function api(action, payload, ms) {
    if (!CFG.entry) return Promise.resolve({ ok: false, error: 'no_endpoint' });
    var ctrl = window.AbortController ? new AbortController() : null, t = setTimeout(function () { ctrl && ctrl.abort(); }, ms || 30000);
    return fetch(CFG.entry, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ action: action }, payload || {})), signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { return r.json(); }).catch(function () { return { ok: false, error: 'network' }; }).finally(function () { clearTimeout(t); });
  }
  function temporary(r) { return r && (r.error === 'network' || r.error === 'busy' || r.error === 'server'); }

  /* ---------- helpers ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function show(id) {
    ['sc-login', 'sc-rules', 'sc-resume', 'sc-result'].forEach(function (x) { $(x).classList.toggle('hidden', x !== id); });
    var exam = id === 'work';
    ['work', 'xnav', 'xbar'].forEach(function (x) { $(x).classList.toggle('hidden', !exam); });
    $('wmk').classList.toggle('hidden', !exam);
    window.scrollTo(0, 0);
  }
  function toast(m, ms) { var t = $('toast'); t.textContent = m; t.classList.remove('hidden'); clearTimeout(t._h); t._h = setTimeout(function () { t.classList.add('hidden'); }, ms || 3500); }
  function fmt(sec) { sec = Math.max(0, Math.floor(sec)); var m = Math.floor(sec / 60), s = sec % 60; return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s; }
  function shuffle(n) { var a = [], i, j, t; for (i = 0; i < n; i++) a.push(i); for (i = n - 1; i > 0; i--) { j = Math.floor(Math.random() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function ask(title, msg, yes) {
    $('cfTitle').textContent = title; $('cfMsg').textContent = msg; $('confirm').classList.remove('hidden');
    $('cfYes').onclick = function () { $('confirm').classList.add('hidden'); yes(); };
    $('cfNo').onclick = function () { $('confirm').classList.add('hidden'); };
  }
  function goFS() {
    var el = document.documentElement;
    try { if (el.requestFullscreen) return el.requestFullscreen().catch(function () {}); if (el.webkitRequestFullscreen) el.webkitRequestFullscreen(); } catch (e) {}
    return Promise.resolve();
  }
  function inFS() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
  function active() { return S && S.t0 && !S.submitted; }
  function elapsed() { return (Date.now() - S.t0) / 1000; }
  function has(v) { return v !== undefined && v !== null && v !== ''; }
  function beep() {
    try {
      var C = new (window.AudioContext || window.webkitAudioContext)(), o = C.createOscillator(), g = C.createGain();
      o.frequency.value = 660; o.connect(g); g.connect(C.destination); g.gain.setValueAtTime(0.25, C.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, C.currentTime + 0.8); o.start(); o.stop(C.currentTime + 0.8);
    } catch (e) {}
  }
  function newState(r, offset) {
    return { code: r.code, name: r.name, cls: r.cls, t0: r.t0 + offset, aStartedAt: r.t0 + offset, section: 'A', ans: {}, flags: {}, cur: { A: 0, L: 0, R: 0 },
      vlog: [], hideTimer: false, audio: {}, perm: { g: E.partA.grammar.map(function (q) { return shuffle(q.o.length); }), v: E.partA.vocab.map(function (q) { return shuffle(q.o.length); }) } };
  }

  /* ---------- login ---------- */
  function initLogin(prefill) {
    show('sc-login');
    if (prefill) $('code').value = prefill;
    $('go').onclick = function () {
      var c = $('code').value.trim().toUpperCase();
      if (c.length < 6) { $('lerr').textContent = 'Mã gồm 6 ký tự.'; $('lerr').hidden = false; return; }
      login(c);
    };
    $('code').onkeydown = function (e) { if (e.key === 'Enter') $('go').click(); };
  }
  function login(code) {
    $('lerr').hidden = true; $('go').disabled = true; $('go').textContent = 'Đang kiểm tra...';
    api('eInfo', { code: code }).then(function (r) {
      $('go').disabled = false; $('go').textContent = 'Vào thi';
      if (!r.ok) { $('lerr').textContent = err(r); $('lerr').hidden = false; if (r.error === 'no_code') ls('ts-entry-session', null); return; }
      ls('ts-entry-session', r.code); info = r;
      var local = ls(skey(r.code));
      if (r.status === 'done') { ls(skey(r.code), null); showResult(r.result, r.name); return; }
      if (r.status === 'open') { ls(skey(r.code), null); goRules(r); return; }
      /* started */
      var offset = Date.now() - r.now;
      if (local && local.t0 && local.submitted) { S = local; finish(S.reason || 'Nộp lại bài'); return; }
      showResume(r, offset, !!(local && local.t0));
    });
  }
  function goRules(r) {
    show('sc-rules');
    $('rName').textContent = r.name; $('rCls').textContent = (r.cls ? r.cls + ' · ' : '') + 'Mã ' + r.code;
    $('rulesText').innerHTML = RULES;
    $('agree').checked = false; $('startBtn').disabled = true;
    $('agree').onchange = function () { $('startBtn').disabled = !this.checked; };
    $('testSound').onclick = beep;
    $('outBtn').onclick = function () { ls('ts-entry-session', null); location.reload(); };
    $('startBtn').onclick = function () {
      $('rerr').hidden = true; $('startBtn').disabled = true; $('startBtn').textContent = 'Đang bắt đầu...';
      goFS().then(function () { return api('eStart', { code: r.code, dev: dev() }, 45000); }).then(function (x) {
        $('startBtn').disabled = false; $('startBtn').textContent = 'Bắt đầu làm bài';
        if (!x.ok) { $('rerr').textContent = err(x); $('rerr').hidden = false; return; }
        S = newState(x, Date.now() - x.now); save(); enterTest();
      });
    };
  }
  function showResume(r, offset, wasHere) {
    show('sc-resume');
    $('resumeMsg').textContent = wasHere
      ? 'Trang vừa được tải lại. Việc này được tính là một lần vi phạm và đồng hồ vẫn tiếp tục chạy.'
      : 'Bài làm của mã này đã bắt đầu lúc ' + new Date(r.t0 + offset).toLocaleTimeString('vi-VN') + '. Đồng hồ vẫn đang chạy. Bài làm chưa lưu trên thiết bị này sẽ bắt đầu lại từ câu đầu tiên.';
    $('resumeBtn').onclick = function () {
      $('resErr').hidden = true; $('resumeBtn').disabled = true;
      goFS().then(function () { return api('eStart', { code: r.code, dev: dev() }, 45000); }).then(function (x) {
        $('resumeBtn').disabled = false;
        if (!x.ok && !temporary(x)) { $('resErr').textContent = err(x); $('resErr').hidden = false; return; }
        var local = ls(skey(r.code));
        if (local && local.t0) { S = local; } else { S = newState(Object.assign({}, r, x.ok ? x : {}), offset); }
        if (x.ok) S.t0 = x.t0 + (Date.now() - x.now);
        if (wasHere) S.vlog.push({ t: Math.round(elapsed()), r: 'Tải lại trang', sec: S.section });
        save(); enterTest();
        if (S.vlog.length >= MAX_VIO) { finish('Tự động nộp do vi phạm ' + S.vlog.length + ' lần'); return; }
        if (elapsed() >= TOTAL_MIN * 60) { finish('Hết giờ'); return; }
        if (wasHere) toast('Cảnh báo ' + S.vlog.length + '/' + MAX_VIO + ': tải lại trang.');
      });
    };
  }

  /* ---------- exam shell ---------- */
  function enterTest() {
    $('whoName').textContent = S.name; $('vioMax').textContent = MAX_VIO; $('vioN').textContent = S.vlog.length;
    var w = $('wmk'), label = S.name + ' · ' + S.code, h = '';
    for (var i = 0; i < 60; i++) h += '<span>' + esc(label) + '</span>';
    w.innerHTML = h;
    $('helpText').innerHTML = HELP;
    $('helpBtn').onclick = function () { $('help').classList.remove('hidden'); };
    $('helpClose').onclick = function () { $('help').classList.add('hidden'); };
    $('timerToggle').onclick = function () { S.hideTimer = !S.hideTimer; save(); onTick(); };
    $('nextPart').onclick = nextPart;
    show('work');
    goSection(S.section);
    clearInterval(tick); tick = setInterval(onTick, 500); onTick();
  }
  function goSection(sec) {
    S.section = sec; save();
    if (sec === 'R') stopAudio();
    $('whoPart').textContent = PART[sec].name;
    $('fPartName').textContent = PART[sec].short;
    $('nextPartT').textContent = PART[sec].next;
    $('nextPart').classList.toggle('red', sec === 'R');
    $('paneL').scrollTop = 0; $('paneR').scrollTop = 0;
    if (sec === 'A') renderA(); else if (sec === 'L') renderL(); else renderR();
    buildNav();
  }
  function nextPart() {
    var sec = S.section, miss = PART[sec].total - countDone(sec), fl = flaggedCount(sec);
    var extra = (miss ? 'Bạn còn ' + miss + ' câu chưa làm. ' : '') + (fl ? 'Có ' + fl + ' câu đang gắn cờ. ' : '');
    if (sec === 'A') ask('Nộp phần A?', extra + 'Sau khi chuyển sang Listening, bạn không quay lại phần A được.', function () { goSection('L'); });
    else if (sec === 'L') {
      var allDone = E.listening.every(function (s) { return (S.audio[s.id] || {}).done; });
      ask('Nộp phần Listening?', extra + (allDone ? '' : 'Audio chưa phát hết, nếu chuyển bây giờ bạn sẽ không nghe tiếp được. ') + 'Sau khi chuyển sang Reading, bạn không quay lại Listening được.', function () { goSection('R'); });
    } else ask('Nộp bài?', extra + 'Sau khi nộp, bạn không sửa bài được nữa.', function () { finish('Học viên nộp bài'); });
  }
  function onTick() {
    if (!active()) return;
    var left = TOTAL_MIN * 60 - elapsed(), shown = left;
    if (S.section === 'A') {
      var aLeft = Math.min(PART_A_MIN * 60 - (Date.now() - S.aStartedAt) / 1000, left);
      shown = aLeft;
      if (aLeft <= 0 && left > 0) { toast('Hết thời gian phần A. Chuyển sang Listening.'); $('confirm').classList.add('hidden'); goSection('L'); return; }
    }
    var t = $('timer');
    if (S.hideTimer && shown > 300) { t.textContent = 'Đã ẩn'; t.className = 'timer off'; }
    else { t.textContent = fmt(shown); t.className = 'timer' + (shown <= 300 ? ' low' : ''); }
    t.title = S.section === 'A' ? 'Thời gian còn lại của phần A' : 'Thời gian còn lại của bài';
    if (left <= 0) finish('Hết giờ');
  }

  /* ---------- navigator & flags ---------- */
  function keysOf(sec) {
    var k = [], i;
    if (sec === 'A') { for (i = 0; i < 20; i++) k.push('Ag' + i); for (i = 0; i < 20; i++) k.push('Av' + i); }
    else for (i = 1; i <= PART[sec].total; i++) k.push(sec + i);
    return k;
  }
  function countDone(sec) { return keysOf(sec).filter(function (k) { return has(S.ans[k]); }).length; }
  function flaggedCount(sec) { return keysOf(sec).filter(function (k) { return S.flags[k]; }).length; }
  function buildNav() {
    var sec = S.section, keys = keysOf(sec), h = '';
    keys.forEach(function (k, i) {
      h += '<button type="button" data-i="' + i + '" class="' + (has(S.ans[k]) ? 'ans ' : '') + (S.flags[k] ? 'flag ' : '') + (S.cur[sec] === i ? 'cur' : '') + '" aria-label="Câu ' + (i + 1) + '">' + (i + 1) + '</button>';
    });
    $('qnav').innerHTML = h;
    $('fPartDone').textContent = countDone(sec) + '/' + keys.length + ' câu đã làm';
    var c = $('qnav').querySelector('.cur'); if (c && c.scrollIntoView) c.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  $('qnav').onclick = function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var i = +b.getAttribute('data-i');
    if (S.section === 'A') { S.cur.A = i; save(); renderA(); buildNav(); } else focusItem(S.section + (i + 1));
  };
  function toggleFlag(k) { S.flags[k] = !S.flags[k]; save(); buildNav(); }
  function setCur(k) {
    var sec = S.section, idx = keysOf(sec).indexOf(k);
    if (idx < 0 || S.cur[sec] === idx) return;
    S.cur[sec] = idx; save();
    Array.prototype.forEach.call(document.querySelectorAll('.q.cur'), function (x) { x.classList.remove('cur'); });
    var el = $('item-' + k); if (el) el.classList.add('cur');
    buildNav();
  }
  function focusItem(k) {
    var el = $('item-' + k); if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' }); setCur(k);
    var inp = el.querySelector('input[type=text],select'); if (inp) setTimeout(function () { inp.focus({ preventScroll: true }); }, 350);
  }

  /* ---------- Part A ---------- */
  function renderA() {
    var i = S.cur.A, isG = i < 20, list = isG ? E.partA.grammar : E.partA.vocab, li = isG ? i : i - 20;
    var q = list[li], key = (isG ? 'Ag' : 'Av') + li, perm = S.perm[isG ? 'g' : 'v'][li];
    $('paneL').innerHTML = '<div class="stemwrap"><p class="ptitle">' + (isG ? 'Ngữ pháp' : 'Từ vựng') + ' · Chọn đáp án đúng nhất</p>' +
      '<div class="qhead"><span class="qbig">' + (i + 1) + '</span><span class="tagl">Câu ' + (i + 1) + ' / 40</span><span class="tagl">' + esc(q.level) + '</span></div>' +
      '<div class="stem" lang="en">' + esc(q.q).replace('___', '<u>&nbsp;</u>') + '</div></div>';
    var h = '<div class="ansA"><p class="ptitle">Câu trả lời của bạn</p>';
    perm.forEach(function (oi, pos) {
      var sel = S.ans[key] === oi;
      h += '<button type="button" class="optA' + (sel ? ' sel' : '') + '" data-oi="' + oi + '" lang="en"><span class="L">' + 'ABCD'[pos] + '</span><span>' + esc(q.o[oi]) + '</span></button>';
    });
    h += '<div class="qctl"><button class="btn ghost" id="prevQ"' + (i === 0 ? ' disabled' : '') + '>Câu trước</button>' +
      '<button class="flagbtn' + (S.flags[key] ? ' on' : '') + '" id="flagQ">' + FLAG + (S.flags[key] ? 'Bỏ cờ' : 'Gắn cờ xem lại') + '</button>' +
      '<button class="btn blue" id="nextQ">' + (i < 39 ? 'Câu sau' : 'Sang Listening') + '</button></div></div>';
    $('paneR').innerHTML = h;
    Array.prototype.forEach.call($('paneR').querySelectorAll('.optA'), function (b) {
      b.onclick = function () { S.ans[key] = +b.getAttribute('data-oi'); save(); renderA(); buildNav(); };
    });
    $('flagQ').onclick = function () { toggleFlag(key); renderA(); };
    if (i > 0) $('prevQ').onclick = function () { S.cur.A = i - 1; save(); renderA(); buildNav(); };
    $('nextQ').onclick = function () { if (i < 39) { S.cur.A = i + 1; save(); renderA(); buildNav(); } else nextPart(); };
  }

  /* ---------- Listening & Reading items ---------- */
  function wrapItem(key, n, inner) {
    var cur = keysOf(S.section)[S.cur[S.section]] === key;
    return '<div class="q' + (cur ? ' cur' : '') + '" id="item-' + key + '"><div class="qtop"><span class="qn">' + n + '</span>' + inner +
      '<button type="button" class="mini' + (S.flags[key] ? ' on' : '') + '" data-flag="' + key + '" title="Gắn cờ xem lại" aria-label="Gắn cờ câu ' + n + '">' + FLAG + '</button></div>';
  }
  function itemHTML(pre, it, letters) {
    var key = pre + it.n, v = S.ans[key];
    if (it.type === 'gap') return wrapItem(key, it.n, '<div class="gapline" lang="en"><span>' + esc(it.before) + '</span><input class="input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" data-k="' + key + '" value="' + esc(v || '') + '" maxlength="40" aria-label="Câu ' + it.n + '"><span>' + esc(it.after || '') + '</span></div>') + '</div>';
    if (it.type === 'match') {
      var o = '<option value="">?</option>'; letters.forEach(function (L) { o += '<option' + (v === L ? ' selected' : '') + '>' + L + '</option>'; });
      return wrapItem(key, it.n, '<div class="matchrow"><select class="input" data-k="' + key + '" aria-label="Câu ' + it.n + '">' + o + '</select><span lang="en">' + esc(it.q) + '</span></div>') + '</div>';
    }
    var tf = it.type === 'tfng', choices = tf ? ['TRUE', 'FALSE', 'NOT GIVEN'] : it.o, h = '<div class="opts' + (tf ? ' three' : '') + '" lang="en">';
    choices.forEach(function (c, i) {
      var val = tf ? c : 'ABCD'[i], sel = v === val;
      h += '<label class="opt' + (sel ? ' sel' : '') + '"><input type="radio" name="' + key + '" value="' + val + '"' + (sel ? ' checked' : '') + '>' + (tf ? esc(c) : val + '. ' + esc(c)) + '</label>';
    });
    return wrapItem(key, it.n, '<span class="qt" lang="en">' + esc(it.q) + '</span>') + h + '</div></div>';
  }
  function bindItems(root) {
    root.oninput = root.onchange = function (e) {
      var t = e.target, k = null;
      if (t.getAttribute('data-k')) { k = t.getAttribute('data-k'); S.ans[k] = t.value; }
      else if (t.type === 'radio') {
        k = t.name; S.ans[k] = t.value;
        Array.prototype.forEach.call(t.closest('.opts').querySelectorAll('.opt'), function (l) { l.classList.toggle('sel', l.contains(t)); });
      }
      if (k) { save(); setCur(k); buildNav(); }
    };
    root.onclick = function (e) {
      var f = e.target.closest('[data-flag]');
      if (f) { var k = f.getAttribute('data-flag'); toggleFlag(k); f.classList.toggle('on', !!S.flags[k]); return; }
      var q = e.target.closest('.q'); if (q) setCur(q.id.replace('item-', ''));
    };
    root.addEventListener('focusin', function (e) { var q = e.target.closest('.q'); if (q) setCur(q.id.replace('item-', '')); });
  }

  var aud = $('aud');
  function renderL() {
    var left = '<p class="ptitle">Audio và hướng dẫn</p>', right = '<p class="ptitle">Câu trả lời của bạn</p>';
    E.listening.forEach(function (sec, si) {
      var st = S.audio[sec.id] || {}, ready = si === 0 || (S.audio[E.listening[si - 1].id] || {}).done;
      left += '<div class="lsec" id="L-' + sec.id + '"><h3>' + esc(sec.title) + '</h3>' +
        '<div class="player' + (ready ? '' : ' locked') + '" id="pl-' + sec.id + '">' +
        '<button class="btn" type="button" data-play="' + si + '"' + (st.done ? ' disabled' : '') + '>' + (st.done ? 'Đã nghe xong' : (st.t ? 'Tiếp tục nghe' : 'Bắt đầu nghe')) + '</button>' +
        '<div class="prog"><i id="pg-' + sec.id + '" style="width:' + (st.done ? 100 : 0) + '%"></i></div><small id="tm-' + sec.id + '">' + (st.done ? 'Hoàn thành' : 'Chỉ phát 1 lần') + '</small>' +
        '<input type="range" min="0" max="1" step="0.05" value="' + (S.vol != null ? S.vol : 1) + '" aria-label="Âm lượng" data-vol="1"></div>';
      right += '<div class="secHead">' + esc(sec.title) + '</div>';
      if (sec.items) {
        left += '<p class="ins" lang="en">' + esc(sec.instructions) + '</p>';
        if (sec.formTitle) right += '<div class="formtitle" lang="en">' + esc(sec.formTitle) + '</div>';
        sec.items.forEach(function (it) { right += itemHTML('L', it); });
      }
      (sec.groups || []).forEach(function (g) {
        left += '<p class="ins" lang="en">' + esc(g.instructions) + '</p>';
        if (g.box) left += '<div class="box" lang="en">' + g.box.map(function (b) { return '<div>' + esc(b) + '</div>'; }).join('') + '</div>';
        g.items.forEach(function (it) { right += itemHTML('L', it, g.letters); });
      });
      left += '</div>';
    });
    $('paneL').innerHTML = left; $('paneR').innerHTML = right;
    bindItems($('paneR'));
    $('paneL').onclick = function (e) { var b = e.target.closest('[data-play]'); if (b && !b.disabled) playSec(+b.getAttribute('data-play'), b); };
    $('paneL').oninput = function (e) { if (e.target.getAttribute('data-vol')) { S.vol = +e.target.value; aud.volume = S.vol; save(); } };
  }
  function playSec(si, btn) {
    var sec = E.listening[si], st = S.audio[sec.id] = S.audio[sec.id] || {}, startAt = st.t || 0;
    curSec = sec; aud.src = sec.audio; aud.volume = S.vol != null ? S.vol : 1;
    btn.disabled = true; btn.textContent = 'Đang phát';
    aud.onloadedmetadata = function () { try { aud.currentTime = startAt; } catch (e) {} };
    aud.ontimeupdate = function () {
      if (!aud.duration) return;
      st.t = aud.currentTime;
      var pg = $('pg-' + sec.id), tm = $('tm-' + sec.id);
      if (pg) pg.style.width = (aud.currentTime / aud.duration * 100) + '%';
      if (tm) tm.textContent = fmt(aud.currentTime) + ' / ' + fmt(aud.duration);
      if (Math.floor(aud.currentTime) % 3 === 0) save();
    };
    aud.onended = function () {
      st.done = true; st.t = 0; save(); btn.textContent = 'Đã nghe xong';
      var tm = $('tm-' + sec.id); if (tm) tm.textContent = 'Hoàn thành';
      var next = E.listening[si + 1];
      if (next) { $('pl-' + next.id).classList.remove('locked'); toast('Section tiếp theo đã mở. Nhấn Bắt đầu nghe khi sẵn sàng.'); $('L-' + next.id).scrollIntoView({ behavior: 'smooth' }); }
      else toast('Đã hết phần Listening. Kiểm tra lại đáp án rồi chuyển sang Reading.');
    };
    aud.onerror = function () { btn.disabled = false; btn.textContent = 'Thử phát lại'; toast('Không tải được audio. Kiểm tra mạng rồi thử lại.'); };
    aud.onpause = function () { if (active() && !aud.ended && S.section === 'L' && !document.hidden) aud.play().catch(function () {}); };
    aud.play().catch(function () { btn.disabled = false; btn.textContent = 'Bắt đầu nghe'; });
  }
  function stopAudio() { aud.onpause = null; try { aud.pause(); } catch (e) {} }

  function renderR() {
    var R = E.reading;
    $('paneL').innerHTML = '<article class="passage" lang="en"><p class="ptitle" lang="vi">Bài đọc</p><h2>' + esc(R.title) + '</h2>' +
      R.paragraphs.map(function (p) { return '<p><span class="pl">' + esc(p[0]) + '</span>' + esc(p[1]) + '</p>'; }).join('') + '</article>';
    var h = '<p class="ptitle">Câu trả lời của bạn</p>';
    R.groups.forEach(function (g) { h += '<p class="ins" lang="en">' + esc(g.instructions) + '</p>'; g.items.forEach(function (it) { h += itemHTML('R', it); }); });
    $('paneR').innerHTML = h; bindItems($('paneR'));
    $('paneL').onclick = $('paneL').oninput = null;
  }

  /* ---------- anti cheating ---------- */
  function violate(reason) {
    if (!active() || unloading) return;
    var now = Date.now(); if (now - lastVio < 2500) return; lastVio = now;
    S.vlog.push({ t: Math.round(elapsed()), r: reason, sec: S.section }); save();
    var n = S.vlog.length; $('vioN').textContent = n;
    if (n >= MAX_VIO) { finish('Tự động nộp do vi phạm ' + n + ' lần'); return; }
    $('ovTitle').textContent = 'Cảnh báo vi phạm lần ' + n + '/' + MAX_VIO;
    $('ovMsg').textContent = reason + '. Thêm ' + (MAX_VIO - n) + ' lần nữa, bài sẽ tự động nộp.';
    $('ov').classList.remove('hidden');
  }
  $('ovBtn').onclick = function () { goFS().then(function () { $('ov').classList.add('hidden'); if (S && S.section === 'L' && curSec && aud.paused && !aud.ended && aud.currentTime > 0) aud.play().catch(function () {}); }); };
  document.addEventListener('visibilitychange', function () { if (document.hidden) violate('Bạn đã rời khỏi trang làm bài'); });
  window.addEventListener('blur', function () { setTimeout(function () { if (!document.hasFocus()) violate('Bạn đã chuyển sang cửa sổ hoặc ứng dụng khác'); }, 300); });
  function onFS() { if (fsOK && !inFS()) violate('Bạn đã thoát chế độ toàn màn hình'); }
  document.addEventListener('fullscreenchange', onFS);
  document.addEventListener('webkitfullscreenchange', onFS);
  ['contextmenu', 'copy', 'cut', 'paste', 'dragstart', 'drop'].forEach(function (ev) { document.addEventListener(ev, function (e) { if (active() || ev === 'contextmenu') e.preventDefault(); }); });
  document.addEventListener('selectstart', function (e) { var t = e.target; if (!(t.tagName === 'INPUT' || t.tagName === 'SELECT')) e.preventDefault(); });
  document.addEventListener('keydown', function (e) {
    var k = (e.key || '').toLowerCase(), c = e.ctrlKey || e.metaKey;
    if (!active()) return;
    if (k === 'f12' || (c && e.shiftKey && ['i', 'j', 'c', 'k'].indexOf(k) > -1) || (c && ['u', 's', 'p', 'c', 'x', 'v', 'a', 'f', 'g'].indexOf(k) > -1)) { e.preventDefault(); toast('Thao tác này bị chặn trong khi làm bài.'); }
    if (k === 'printscreen') { e.preventDefault(); violate('Bạn đã nhấn phím chụp màn hình'); }
  });
  document.addEventListener('keyup', function (e) { if ((e.key || '').toLowerCase() === 'printscreen' && active()) violate('Bạn đã nhấn phím chụp màn hình'); });
  window.addEventListener('beforeunload', function (e) {
    if (!active()) return;
    unloading = true; setTimeout(function () { unloading = false; }, 1500);   // reloading is counted separately
    e.preventDefault(); e.returnValue = '';
  });

  /* ---------- submit & result ---------- */
  function finish(reason) {
    if (!S || submitting) return;
    submitting = true;
    stopAudio(); clearInterval(tick);
    S.submitted = true; S.reason = S.reason || reason; save();
    ['ov', 'confirm', 'help'].forEach(function (x) { $(x).classList.add('hidden'); });
    try { if (inFS()) (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) {}
    $('sending').classList.remove('hidden'); $('sendMsg').textContent = 'Hệ thống đang chấm điểm, vui lòng chờ trong giây lát.';
    var tries = 0;
    (function go() {
      api('eSubmit', { code: S.code, dev: dev(), ans: S.ans, flags: S.flags, vlog: S.vlog, reason: S.reason }, 45000).then(function (r) {
        if (r.ok || (r.error === 'done' && r.result)) { $('sending').classList.add('hidden'); var nm = S.name; ls(skey(S.code), null); S = null; showResult(r.result, nm); return; }
        if (temporary(r)) { tries++; $('sendMsg').textContent = 'Chưa gửi được bài (lần ' + tries + '). Hệ thống đang thử lại, vui lòng không đóng trang.'; setTimeout(go, Math.min(15000, 3000 * tries)); return; }
        $('sendMsg').innerHTML = esc(err(r)) + '<br><br>Bài làm vẫn được lưu trên thiết bị này. Hãy chụp màn hình thông báo này và nhắn giáo viên.';
        submitting = false;
      });
    })();
  }
  function showResult(r, name) {
    show('sc-result');
    if (!r) { $('resultCard').innerHTML = '<h2>Đã nộp bài</h2><p>Kết quả đang được cập nhật. Vui lòng nhập lại mã sau ít phút.</p>'; return; }
    var lv = r.levels || {};
    var rows = ['A1', 'A2', 'B1', 'B2', 'C1'].map(function (l) { var x = lv[l] || { g: 0, v: 0 }; return '<tr><td>' + l + '</td><td class="c">' + x.g + '/4</td><td class="c">' + x.v + '/4</td></tr>'; }).join('');
    $('resultCard').innerHTML =
      '<span class="stamp">Kết quả kiểm tra đầu vào</span><h2 style="margin-top:10px">' + esc(name || '') + '</h2>' +
      '<p class="small">' + (r.submittedAt ? 'Nộp lúc ' + new Date(r.submittedAt).toLocaleString('vi-VN') : '') + (r.endReason ? ' · ' + esc(r.endReason) : '') + '</p>' +
      '<div class="res-top"><div class="big"><b>' + esc(r.cefr) + '</b><span>Trình độ ngữ pháp và từ vựng (CEFR)</span></div>' +
      '<div class="big"><b>' + r.partB + '/33</b><span>Listening và Reading</span></div>' +
      '<div class="big"><b>' + r.percent + '%</b><span>Tổng điểm (50% phần A, 50% phần B)</span></div></div>' +
      '<h3>Phần A · Ngữ pháp và Từ vựng: ' + r.partA + '/40</h3>' +
      '<table><thead><tr><th>Cấp độ</th><th class="c">Ngữ pháp</th><th class="c">Từ vựng</th></tr></thead><tbody>' + rows +
      '<tr><th>Tổng</th><th class="c">' + r.grammar + '/20</th><th class="c">' + r.vocab + '/20</th></tr></tbody></table>' +
      '<h3>Phần B · Listening và Reading: ' + r.partB + '/33</h3>' +
      '<table><thead><tr><th>Kỹ năng</th><th class="c">Số câu đúng</th></tr></thead><tbody><tr><td>Listening</td><td class="c">' + r.listening + '/20</td></tr><tr><td>Reading</td><td class="c">' + r.reading + '/13</td></tr></tbody></table>' +
      '<div class="rec"><b>Khóa học gợi ý: ' + esc(r.course) + '</b><br>' + esc(r.advice || '') + '</div>' +
      '<p class="small">Giáo viên sẽ liên hệ bạn qua Zalo để tư vấn lộ trình cụ thể. Đáp án không được hiển thị để giữ đề cho các bạn khác.</p>' +
      '<div class="row" style="margin-top:14px"><a class="btn ghost" href="index.html">Về trang chính</a><button class="btn ghost" id="outR">Đổi mã khác</button></div>';
    $('outR').onclick = function () { ls('ts-entry-session', null); location.href = 'entry.html'; };
  }

  /* ---------- boot ---------- */
  var q = null; try { q = new URLSearchParams(location.search).get('code'); } catch (e) {}
  var code = (q || ls('ts-entry-session') || '').toString().toUpperCase();
  initLogin(code);
  if (code.length === 6) login(code);
  if (CFG.entry && window.fetch) fetch(CFG.entry, { mode: 'no-cors', cache: 'no-store' }).catch(function () {});   // wake the server
})();
