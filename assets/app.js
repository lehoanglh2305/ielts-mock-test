/* The Standard · IELTS Mock Test: shared helpers */
(function () {
  var A = window.TS = {};
  var CFG = window.CONFIG || {};
  A.SK = { L: 'Listening', R: 'Reading', W: 'Writing', S: 'Speaking' };
  A.SKVI = { L: 'Nghe', R: 'Đọc', W: 'Viết', S: 'Nói' };
  A.PAGE = { L: 'listening.html', R: 'reading.html', W: 'writing.html', S: 'speaking.html' };
  A.ORDER = ['L', 'R', 'W', 'S'];

  A.ERR = {
    network: 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.',
    no_code: 'Không tìm thấy mã này. Kiểm tra lại mã giáo viên gửi.',
    done: 'Bạn đã nộp phần này rồi. Nếu cần làm lại, hãy nhắn giáo viên.',
    started_elsewhere: 'Phần này đã được mở trên một thiết bị khác. Hãy làm tiếp trên thiết bị đó, hoặc nhắn giáo viên để mở lại.',
    not_started: 'Phần này chưa được bắt đầu. Hãy quay lại trang chính.',
    busy: 'Máy chủ đang bận. Vui lòng thử lại sau vài giây.',
    no_endpoint: 'Trang chưa được kết nối với máy chủ chấm điểm. Hãy báo giáo viên.',
    server: 'Máy chủ gặp lỗi. Vui lòng thử lại.',
    bad_key: 'Mã giáo viên không đúng.'
  };
  A.err = function (r) { return (r && A.ERR[r.error]) || ('Có lỗi xảy ra' + (r && r.error ? ' (' + r.error + ')' : '') + '.'); };

  A.api = function (action, payload, timeoutMs) {
    if (!CFG.endpoint) return Promise.resolve({ ok: false, error: 'no_endpoint' });
    var body = Object.assign({ action: action }, payload || {});
    var ctrl = window.AbortController ? new AbortController() : null;
    var t = setTimeout(function () { ctrl && ctrl.abort(); }, timeoutMs || 30000);
    return fetch(CFG.endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body), signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { return r.json(); })
      .catch(function () { return { ok: false, error: 'network' }; })
      .finally(function () { clearTimeout(t); });
  };

  /* storage */
  function ls(k, v) {
    try {
      if (v === undefined) { var s = localStorage.getItem(k); return s ? JSON.parse(s) : null; }
      if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v));
    } catch (e) { return null; }
  }
  A.ls = ls;
  A.dev = function () {
    var d = ls('ts-ielts-dev');
    if (!d) { d = 'D' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); ls('ts-ielts-dev', d); }
    return d;
  };
  A.session = function (v) { return v === undefined ? ls('ts-ielts-session') : ls('ts-ielts-session', v); };
  A.draftKey = function (code, sk) { return 'ts-ielts-' + code + '-' + sk; };

  /* Last info reply from the server, so pages can open without waiting for it. */
  A.info = function (v) {
    if (v === undefined) { var i = ls('ts-ielts-info'), s = A.session(); return i && s && i.code === s.code ? i : null; }
    ls('ts-ielts-info', v);
  };
  A.markInfo = function (sk, st, res) {
    var i = A.info(); if (!i) return;
    i.st = i.st || {}; i.st[sk] = st;
    if (res) { i.res = i.res || {}; i.res[sk] = res; }
    A.info(i);
  };

  /* Wake the Apps Script server early: the first request after a quiet period is the slowest. */
  A.warm = function () {
    if (!CFG.endpoint || !window.fetch) return;
    var now = Date.now(), last = 0;
    try { last = +sessionStorage.getItem('ts-ielts-warm') || 0; sessionStorage.setItem('ts-ielts-warm', now); } catch (e) {}
    if (now - last < 120000) return;
    fetch(CFG.endpoint, { mode: 'no-cors', cache: 'no-store' }).catch(function () {});
  };

  /* Open a skill at once from the stored assignment, and confirm with the server in the background.
     h.ready(r) runs once with { ids, t0, files, fast }, h.sync(r) when the server confirms,
     h.fail(r) if the server refuses (done, other device, wrong code). */
  A.begin = function (sk, h) {
    var s = A.session(), info = A.info(), key = A.draftKey(s.code, sk), tk = key + '-t0', d = ls(key) || {};
    var ids = info && info.asg && info.asg[sk], st = info && info.st && info.st[sk];
    var fast = !!(ids && ids.length && st !== 'done'), readied = false;
    if (fast) {
      var t0 = d.started && ls(tk) ? ls(tk) : Date.now();   // a fresh attempt always starts a fresh clock
      ls(tk, t0);
      readied = true; h.ready({ ids: ids, t0: t0, files: {}, fast: true });
    }
    var tries = 0;
    (function go() {
      A.api('start', { code: s.code, skill: sk, dev: A.dev() }, 45000).then(function (r) {
        if (r.ok) {
          A.markInfo(sk, 'started');
          ls(tk, r.t0);
          if (!readied) { readied = true; h.ready(r); } else h.sync && h.sync(r);
          return;
        }
        var temporary = r.error === 'network' || r.error === 'busy' || r.error === 'server';
        if (temporary && tries++ < 4) { setTimeout(go, 2000 * tries); if (!readied) h.wait && h.wait(tries); return; }
        if (temporary && readied) { h.offline && h.offline(r); return; }   // keep working; submit will retry
        if (r.error === 'done') { ls(key, null); A.markInfo(sk, 'done'); }
        h.fail(r);
      });
    })();
  };
  A.flow = function (v) { try { if (v === undefined) return sessionStorage.getItem('ts-ielts-flow') === 'full'; if (v) sessionStorage.setItem('ts-ielts-flow', 'full'); else sessionStorage.removeItem('ts-ielts-flow'); } catch (e) { return false; } };

  /* dom */
  A.$ = function (s, r) { return (r || document).querySelector(s); };
  A.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  A.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  A.fmt = function (sec) { sec = Math.max(0, Math.round(sec)); var m = Math.floor(sec / 60), s = sec % 60; return m + ':' + (s < 10 ? '0' : '') + s; };
  A.letters = 'ABCDEFGHIJ';
  A.roman = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii'];
  A.bandText = function (b) { return b === 0 ? 'dưới 2.5' : (typeof b === 'number' ? b.toFixed(1) : '...'); };

  A.confirm = function (title, text, okLabel) {
    return new Promise(function (res) {
      var ov = document.createElement('div'); ov.className = 'ov';
      ov.innerHTML = '<div class="card" role="dialog" aria-modal="true"><h2>' + A.esc(title) + '</h2><p>' + A.esc(text) + '</p><div class="row"><button class="btn" data-a="1">' + A.esc(okLabel || 'Đồng ý') + '</button><button class="btn ghost" data-a="0">Quay lại</button></div></div>';
      document.body.appendChild(ov);
      ov.querySelector('[data-a="1"]').focus();
      ov.addEventListener('click', function (e) { var a = e.target.getAttribute('data-a'); if (a !== null) { ov.remove(); res(a === '1'); } });
    });
  };

  /* top bar */
  A.bar = function (title) {
    var s = A.session() || {};
    var h = document.createElement('header'); h.className = 'bar';
    h.innerHTML = '<div class="in"><a href="index.html" aria-label="Trang chính"><img class="wm" src="assets/logo-black.png" alt="The Standard." width="760" height="96"></a>' +
      '<div class="row" style="gap:12px;flex-wrap:nowrap;min-width:0"><div class="who"><span class="t">' + A.esc(title || '') + '</span>' + (s.name ? '<b>' + A.esc(s.name) + '</b>' : '') + '</div><div class="timer idle num" id="timer">--:--</div></div></div>';
    document.body.insertBefore(h, document.body.firstChild);
  };

  /* countdown */
  A.Timer = function (el, endAt, onEnd, warnAt) {
    var done = false;
    function tick() {
      var left = (endAt - Date.now()) / 1000;
      el.textContent = A.fmt(left);
      el.classList.remove('idle');
      el.classList.toggle('warn', left <= (warnAt || 300));
      if (left <= 0 && !done) { done = true; clearInterval(iv); onEnd && onEnd(); }
    }
    var iv = setInterval(tick, 500); tick();
    return { stop: function () { done = true; clearInterval(iv); }, set: function (t) { endAt = t; tick(); } };
  };

  /* leaving the page or switching tabs during an exam */
  A.watchBlur = function (meta) {
    meta.blur = meta.blur || 0;
    document.addEventListener('visibilitychange', function () { if (document.hidden) meta.blur++; });
  };

  /* ---------- question renderers (Listening and Reading) ---------- */
  function rowHTML(text) {
    return A.esc(text).replace(/\[\[(\d+)\]\]/g, function (_, n) {
      return '<span class="gap"><b>' + n + '</b><input id="q' + n + '" data-q="' + n + '" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Câu ' + n + '"></span>';
    });
  }
  function selHTML(n, opts, labelFn) {
    var h = '<select class="sel" id="q' + n + '" data-q="' + n + '" aria-label="Câu ' + n + '"><option value="">Chọn</option>';
    opts.forEach(function (o) { h += '<option value="' + o + '">' + (labelFn ? labelFn(o) : o) + '</option>'; });
    return h + '</select>';
  }
  A.renderGroups = function (groups, opts) {
    var h = '';
    groups.forEach(function (g) {
      var a = g.range[0], b = g.range[1];
      h += '<div class="grp"><p class="gi">Questions ' + a + (b > a ? ' to ' + b : '') + '</p><p class="small">' + A.esc(g.instr) + '</p>';
      if (g.type === 'gap') {
        if (g.title) h += '<p class="gt">' + A.esc(g.title) + '</p>';
        g.rows.forEach(function (r) {
          if (r.indexOf('## ') === 0) h += '<p class="grow h">' + A.esc(r.slice(3)) + '</p>';
          else if (r.indexOf('EX ') === 0) h += '<p class="grow ex">Example: ' + A.esc(r.slice(3)) + '</p>';
          else h += '<p class="grow">' + rowHTML(r) + '</p>';
        });
      } else if (g.type === 'mcq') {
        g.items.forEach(function (it) {
          h += '<div class="mcq" id="w' + it.q + '"><p class="stem"><span class="qn">' + it.q + '</span><span>' + A.esc(it.stem) + '</span></p>';
          it.opts.forEach(function (o, i) {
            var L = A.letters[i];
            h += '<label class="opt"><input type="radio" name="q' + it.q + '" value="' + L + '" data-q="' + it.q + '"><span class="L">' + L + '</span><span>' + A.esc(o) + '</span></label>';
          });
          h += '</div>';
        });
      } else if (g.type === 'mcq2') {
        h += '<div class="mcq" id="w' + a + '" data-pair="' + a + '-' + b + '"><p class="stem"><span class="qn">' + a + ' and ' + b + '</span><span>' + A.esc(g.stem) + '</span></p>';
        g.opts.forEach(function (o, i) {
          var L = A.letters[i];
          h += '<label class="opt"><input type="checkbox" name="p' + a + '" value="' + L + '" data-pair="' + a + '-' + b + '"><span class="L">' + L + '</span><span>' + A.esc(o) + '</span></label>';
        });
        h += '</div>';
      } else if (g.type === 'tfng' || g.type === 'ynng') {
        var vals = g.type === 'tfng' ? ['TRUE', 'FALSE', 'NOT GIVEN'] : ['YES', 'NO', 'NOT GIVEN'];
        g.items.forEach(function (it) {
          h += '<div class="mcq" id="w' + it.q + '"><p class="stem"><span class="qn">' + it.q + '</span><span>' + A.esc(it.stem) + '</span></p><div class="tf">';
          vals.forEach(function (v) { h += '<label><input type="radio" name="q' + it.q + '" value="' + v + '" data-q="' + it.q + '">' + v + '</label>'; });
          h += '</div></div>';
        });
      } else if (g.type === 'heading') {
        h += '<div class="box"><b>' + A.esc(g.box.title) + '</b>';
        g.box.opts.forEach(function (o, i) { h += '<span><b>' + A.roman[i] + '</b>&nbsp; ' + A.esc(o) + '</span>'; });
        h += '</div>';
        var rs = A.roman.slice(0, g.box.opts.length);
        g.items.forEach(function (it) { h += '<div class="mrow" id="w' + it.q + '"><span class="qn">' + it.q + '</span><span class="stem">' + A.esc(it.stem) + '</span>' + selHTML(it.q, rs) + '</div>'; });
      } else if (g.type === 'match') {
        var letters;
        if (g.box) {
          letters = A.letters.slice(0, g.box.opts.length).split('');
          h += '<div class="box">' + (g.box.title ? '<b>' + A.esc(g.box.title) + '</b>' : '');
          g.box.opts.forEach(function (o, i) { h += '<span><b>' + letters[i] + '</b>&nbsp; ' + A.esc(o) + '</span>'; });
          h += '</div>';
        } else letters = (g.letters || 'ABCDEFG').split('');
        if (g.map) h += A.maps[g.map]();
        if (g.summary) {
          g.summary.forEach(function (p) {
            h += '<p class="grow">' + A.esc(p).replace(/\[\[(\d+)\]\]/g, function (_, n) { return '<span class="gap"><b>' + n + '</b>' + selHTML(n, letters) + '</span>'; }) + '</p>';
          });
        } else {
          g.items.forEach(function (it) { h += '<div class="mrow" id="w' + it.q + '"><span class="qn">' + it.q + '</span><span class="stem">' + A.esc(it.stem) + '</span>' + selHTML(it.q, letters) + '</div>'; });
        }
      }
      h += '</div>';
    });
    return h;
  };

  /* collect and restore answers; mcq2 pairs map to two question numbers */
  A.bindAnswers = function (root, answers, onChange) {
    root.addEventListener('input', handle); root.addEventListener('change', handle);
    function handle(e) {
      var t = e.target;
      if (t.dataset.pair) {
        var p = t.dataset.pair.split('-'), boxes = A.$$('input[data-pair="' + t.dataset.pair + '"]', root);
        var on = boxes.filter(function (x) { return x.checked; });
        if (on.length > 2) { t.checked = false; on = on.filter(function (x) { return x !== t; }); }
        var v = on.map(function (x) { return x.value; }).sort();
        answers[p[0]] = v[0] || ''; answers[p[1]] = v[1] || '';
      } else if (t.dataset.q) {
        answers[t.dataset.q] = t.type === 'radio' ? (t.checked ? t.value : answers[t.dataset.q]) : t.value;
      } else return;
      onChange && onChange();
    }
  };
  A.restoreAnswers = function (root, answers) {
    Object.keys(answers).forEach(function (q) {
      var v = answers[q]; if (!v) return;
      var el = A.$('#q' + q, root);
      if (el && (el.tagName === 'INPUT' || el.tagName === 'SELECT')) el.value = v;
      A.$$('input[type=radio][name="q' + q + '"]', root).forEach(function (r) { r.checked = r.value === v; });
      A.$$('input[type=checkbox][data-pair]', root).forEach(function (c) {
        var p = c.dataset.pair.split('-');
        if ((p[0] === q || p[1] === q) && c.value === v) c.checked = true;
      });
    });
  };
  A.answered = function (answers, q) { return !!(answers[q] && String(answers[q]).trim()); };

  A.qnav = function (holder, answers, from, to, onJump) {
    var h = '';
    for (var i = from; i <= to; i++) h += '<a href="#w' + i + '" data-n="' + i + '">' + i + '</a>';
    holder.innerHTML = h;
    holder.addEventListener('click', function (e) {
      var n = e.target.getAttribute('data-n'); if (!n) return;
      e.preventDefault(); onJump && onJump(+n);
    });
    return function update() { A.$$('a', holder).forEach(function (a) { a.classList.toggle('on', A.answered(answers, a.getAttribute('data-n'))); }); };
  };

  A.resultCard = function (sk, r, total) {
    var ticks = '';
    for (var i = 1; i <= (total || 40); i++) ticks += '<span class="' + (r.detail && r.detail[i] ? 'y' : 'n') + '">' + i + (r.detail && r.detail[i] ? ' ✓' : ' ✗') + '</span>';
    return '<section class="result"><span class="stamp">Kết quả ' + A.SKVI[sk] + '</span><p class="big num">Band ' + A.bandText(r.band) + '</p><p>Số câu đúng: <b>' + r.raw + ' trên ' + (total || 40) + '</b></p></section>' +
      '<section class="card"><h2>Câu đúng và câu sai</h2><p class="small" style="margin:6px 0 12px">Đáp án đúng không được hiển thị để giữ đề cho các bạn khác. Giáo viên sẽ chữa bài với bạn.</p><div class="ticks">' + ticks + '</div></section>';
  };

  A.nextStep = function (sk) {
    var i = A.ORDER.indexOf(sk), next = A.ORDER[i + 1];
    var h = '<div class="row">';
    if (A.flow() && next) h += '<a class="btn blue" href="' + A.PAGE[next] + '">Sang phần ' + A.SKVI[next] + '</a>';
    h += '<a class="btn ghost" href="index.html">Về trang chính</a></div>';
    return h;
  };

  /* ---------- maps and charts ---------- */
  A.maps = {
    ashby: function () {
      var pts = { A: [118, 250], B: [272, 150], C: [182, 38], D: [330, 40], E: [92, 150], F: [330, 255], G: [182, 220], H: [120, 46] };
      var s = '<svg class="map" viewBox="0 0 380 310" role="img" aria-label="Map of Ashby Park with letters A to H">';
      s += '<rect x="8" y="8" width="364" height="270" rx="18" fill="#eef5e1" stroke="#4b2a22" stroke-width="2"/>';
      s += '<rect x="22" y="22" width="70" height="52" rx="8" fill="#ffd23a" stroke="#4b2a22"/><text x="57" y="52" font-size="11" text-anchor="middle" fill="#4b2a22" font-family="Barlow,Arial" font-weight="600">Playground</text>';
      s += '<ellipse cx="182" cy="140" rx="70" ry="44" fill="#9cc7ea" stroke="#1f5bb5" stroke-width="2"/><text x="182" y="145" font-size="14" text-anchor="middle" fill="#1f3a73" font-family="Barlow,Arial" font-weight="600">Lake</text>';
      [[290, 92], [306, 104], [322, 90], [296, 116], [316, 120], [334, 106]].forEach(function (t) { s += '<circle cx="' + t[0] + '" cy="' + t[1] + '" r="9" fill="#6aa84f" stroke="#2f5d22"/>'; });
      s += '<text x="312" y="140" font-size="11" text-anchor="middle" fill="#2f5d22" font-family="Barlow,Arial" font-weight="600">Woods</text>';
      s += '<rect x="22" y="222" width="72" height="44" rx="6" fill="#d9d4cc" stroke="#4b2a22"/><text x="58" y="248" font-size="11" text-anchor="middle" fill="#4b2a22" font-family="Barlow,Arial" font-weight="600">Car park</text>';
      s += '<path d="M182 278 L182 188" stroke="#c9b48c" stroke-width="6" stroke-linecap="round"/>';
      s += '<rect x="158" y="272" width="48" height="14" rx="4" fill="#4b2a22"/><text x="182" y="302" font-size="12" text-anchor="middle" fill="#4b2a22" font-family="Barlow,Arial" font-weight="700">Main gate</text>';
      Object.keys(pts).forEach(function (L) {
        var p = pts[L];
        s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="12" fill="#fffaf2" stroke="#4b2a22" stroke-width="2"/><text x="' + p[0] + '" y="' + (p[1] + 5) + '" font-size="14" text-anchor="middle" fill="#4b2a22" font-family="Barlow,Arial" font-weight="700">' + L + '</text>';
      });
      return s + '<text x="360" y="300" font-size="11" text-anchor="end" fill="#7a5648" font-family="Barlow,Arial">N ↑</text></svg>';
    }
  };

  A.chart = function (w) {
    if (w.chart === 'museums') {
      var d = w.data, W = 560, H = 340, L = 56, R = 150, T = 20, B = 46, max = 600;
      var x = function (i) { return L + i * (W - L - R) / (d.years.length - 1); };
      var y = function (v) { return T + (H - T - B) * (1 - v / max); };
      var cols = ['#4b2a22', '#1f5bb5', '#c4561d'], dash = ['', '8 5', '2 5'], mk = ['circle', 'square', 'tri'];
      var s = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + A.esc(w.prompt) + '">';
      for (var v = 0; v <= max; v += 100) s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(v) + '" y2="' + y(v) + '" stroke="#e7dccb"/><text x="' + (L - 8) + '" y="' + (y(v) + 4) + '" font-size="12" text-anchor="end" fill="#4b2a22" font-family="Barlow,Arial">' + v + '</text>';
      d.years.forEach(function (yr, i) { s += '<text x="' + x(i) + '" y="' + (H - B + 20) + '" font-size="12" text-anchor="middle" fill="#4b2a22" font-family="Barlow,Arial">' + yr + '</text>'; });
      s += '<text transform="translate(16 ' + ((H - B + T) / 2) + ') rotate(-90)" font-size="12" text-anchor="middle" fill="#4b2a22" font-family="Barlow,Arial">' + A.esc(d.unit) + '</text>';
      s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(0) + '" y2="' + y(0) + '" stroke="#4b2a22"/><line x1="' + L + '" x2="' + L + '" y1="' + T + '" y2="' + y(0) + '" stroke="#4b2a22"/>';
      d.series.forEach(function (sr, k) {
        var pts = sr[1].map(function (v, i) { return x(i) + ',' + y(v); }).join(' ');
        s += '<polyline points="' + pts + '" fill="none" stroke="' + cols[k] + '" stroke-width="2.5" stroke-dasharray="' + dash[k] + '"/>';
        sr[1].forEach(function (v, i) {
          var cx = x(i), cy = y(v);
          if (mk[k] === 'circle') s += '<circle cx="' + cx + '" cy="' + cy + '" r="4.5" fill="' + cols[k] + '"/>';
          else if (mk[k] === 'square') s += '<rect x="' + (cx - 4) + '" y="' + (cy - 4) + '" width="8" height="8" fill="' + cols[k] + '"/>';
          else s += '<path d="M' + cx + ' ' + (cy - 5) + ' L' + (cx + 5) + ' ' + (cy + 4) + ' L' + (cx - 5) + ' ' + (cy + 4) + 'Z" fill="' + cols[k] + '"/>';
        });
        var ly = T + 30 + k * 26;
        s += '<line x1="' + (W - R + 14) + '" x2="' + (W - R + 40) + '" y1="' + ly + '" y2="' + ly + '" stroke="' + cols[k] + '" stroke-width="2.5" stroke-dasharray="' + dash[k] + '"/><text x="' + (W - R + 46) + '" y="' + (ly + 4) + '" font-size="12" fill="#4b2a22" font-family="Barlow,Arial">' + A.esc(sr[0]) + '</text>';
      });
      return s + '</svg>';
    }
    if (w.chart === 'glass') {
      var st = w.steps, Wd = 560, Hd = 330, bw = 118, bh = 74, gx = 18, s2 = '<svg class="chart" viewBox="0 0 ' + Wd + ' ' + Hd + '" role="img" aria-label="' + A.esc(w.prompt) + '">';
      s2 += '<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#4b2a22"/></marker></defs>';
      var pos = [];
      for (var i = 0; i < 4; i++) pos.push([gx + i * (bw + 20), 40]);
      for (var j = 0; j < 4; j++) pos.push([gx + (3 - j) * (bw + 20), 230]);
      st.forEach(function (t, i) {
        var p = pos[i];
        s2 += '<rect x="' + p[0] + '" y="' + p[1] + '" width="' + bw + '" height="' + bh + '" rx="12" fill="' + (i === 5 ? '#fbe1dc' : '#fffaf2') + '" stroke="#4b2a22" stroke-width="1.5"/>';
        s2 += '<circle cx="' + (p[0] + 16) + '" cy="' + (p[1] + 16) + '" r="11" fill="#1f5bb5"/><text x="' + (p[0] + 16) + '" y="' + (p[1] + 20) + '" font-size="12" text-anchor="middle" fill="#fff" font-family="Barlow,Arial" font-weight="700">' + (i + 1) + '</text>';
        var words = t.split(' '), lines = [''], k = 0;
        words.forEach(function (wd) { if ((lines[k] + ' ' + wd).trim().length > 17) { k++; lines[k] = wd; } else lines[k] = (lines[k] + ' ' + wd).trim(); });
        lines.forEach(function (ln, n) { s2 += '<text x="' + (p[0] + bw / 2) + '" y="' + (p[1] + 36 + n * 14) + '" font-size="11.5" text-anchor="middle" fill="#4b2a22" font-family="Barlow,Arial">' + A.esc(ln) + '</text>'; });
        if (i < st.length - 1) {
          var q = pos[i + 1];
          if (i === 3) s2 += '<line x1="' + (p[0] + bw / 2) + '" y1="' + (p[1] + bh) + '" x2="' + (q[0] + bw / 2) + '" y2="' + (q[1] - 4) + '" stroke="#4b2a22" stroke-width="2" marker-end="url(#ar)"/>';
          else if (i < 3) s2 += '<line x1="' + (p[0] + bw) + '" y1="' + (p[1] + bh / 2) + '" x2="' + (q[0] - 4) + '" y2="' + (q[1] + bh / 2) + '" stroke="#4b2a22" stroke-width="2" marker-end="url(#ar)"/>';
          else s2 += '<line x1="' + p[0] + '" y1="' + (p[1] + bh / 2) + '" x2="' + (q[0] + bw + 4) + '" y2="' + (q[1] + bh / 2) + '" stroke="#4b2a22" stroke-width="2" marker-end="url(#ar)"/>';
        }
      });
      return s2 + '</svg>';
    }
    return '';
  };

  A.warm();
})();
