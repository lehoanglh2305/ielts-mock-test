/* Bảng giáo viên · tab Kiểm tra đầu vào. Dùng máy chủ riêng CONFIG.entry, cùng mã giáo viên. */
(function () {
  var T = window.TS, CFG = window.CONFIG || {}, E = window.ENTRY, $ = function (s) { return document.querySelector(s); };
  var KEY = '', rows = [], pick = null, loaded = false;
  var STV = { open: '<span class="small">chưa làm</span>', started: '<span class="chip run">đang làm</span>', done: '<span class="chip ok">đã nộp</span>' };

  function api(action, p) {
    if (!CFG.entry) return Promise.resolve({ ok: false, error: 'no_endpoint' });
    return fetch(CFG.entry, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ action: action, key: KEY }, p || {})) })
      .then(function (r) { return r.json(); }).catch(function () { return { ok: false, error: 'network' }; });
  }
  function errMsg(r) {
    if (r && r.error === 'no_endpoint') return 'Chưa có địa chỉ máy chủ kiểm tra đầu vào. Dán URL Apps Script vào dòng entry trong config.js.';
    if (r && r.error === 'bad_key') return 'Mã giáo viên không khớp với TEACHER_KEY của máy chủ kiểm tra đầu vào. Kiểm tra Script Properties trong Apps Script.';
    return T.err(r);
  }
  function note(m, ok) { var x = $('#emsg'); x.hidden = !m; x.className = 'msg ' + (ok ? 'ok' : 'err'); x.textContent = m || ''; }

  function load() {
    $('#eerr').hidden = true;
    api('tEList').then(function (r) {
      if (!r.ok) { $('#eerr').textContent = errMsg(r); $('#eerr').hidden = false; return; }
      rows = r.rows.sort(function (a, b) { return (b.at || b.created) - (a.at || a.created); }); loaded = true; draw();
      if (pick) detail(pick);
    });
  }
  function draw() {
    var h = '';
    rows.forEach(function (x) {
      var d = x.st === 'done';
      h += '<tr data-code="' + x.code + '"' + (x.code === pick ? ' class="pick"' : '') + '><td><b>' + T.esc(x.name) + '</b></td><td class="small">' + T.esc(x.cls) + '</td><td class="num">' + x.code + '</td><td>' + (STV[x.st] || x.st) + (x.late ? ' <span class="chip wait">muộn</span>' : '') + '</td>' +
        '<td><b>' + (d ? T.esc(x.cefr) : '') + '</b></td><td>' + (d ? x.A + '/40' : '') + '</td><td>' + (d ? x.L + '/20' : '') + '</td><td>' + (d ? x.R + '/13' : '') + '</td><td>' + (d ? '<b>' + x.pct + '%</b>' : '') + '</td><td class="small">' + (d ? T.esc(x.course) : '') + '</td><td>' + (x.vio ? x.vio + ' lần' : '') + '</td></tr>';
    });
    $('#etbl tbody').innerHTML = h || '<tr><td colspan="11" class="small">Chưa có mã nào. Tạo mã ở ô phía trên.</td></tr>';
  }
  function rowOf(code) { return rows.filter(function (x) { return x.code === code; })[0]; }

  function ansCell(label, val, ok) { label = String(label); var f = label.indexOf(' ⚑') > -1; label = label.replace(' ⚑', '') + '.' + (f ? ' ⚑' : ''); return '<span class="' + (ok ? 'y' : '') + '"><b>' + label + '</b> ' + T.esc(val === undefined || val === '' ? '(trống)' : val) + '</span>'; }
  function detail(code) {
    var x = rowOf(code); if (!x) { $('#edetail').innerHTML = ''; return; }
    var h = '<section class="card" style="display:grid;gap:10px"><h2>' + T.esc(x.name) + ' <span class="small">' + T.esc(x.cls) + ' · ' + x.code + '</span></h2>';
    if (x.st !== 'done') {
      h += '<p class="small">' + (x.st === 'started' ? 'Đang làm bài, bắt đầu lúc ' + new Date(x.t0).toLocaleString('vi-VN') + '.' : 'Chưa làm bài.') + '</p>';
    } else {
      var lv = x.levels || {}, dt = x.detail || {}, an = x.ans || {}, fl = x.flags || {};
      h += '<p><b>CEFR ' + T.esc(x.cefr) + '</b> · Phần A ' + x.A + '/40 (Ngữ pháp ' + x.g + '/20, Từ vựng ' + x.v + '/20) · Nghe ' + x.L + '/20 · Đọc ' + x.R + '/13 · Tổng ' + x.pct + '% · ' + x.min + ' phút</p>';
      h += '<p class="small">Nộp lúc ' + new Date(x.at).toLocaleString('vi-VN') + ' · ' + T.esc(x.reason || '') + (x.late ? ' · nộp muộn' : '') + ' · Khóa gợi ý: ' + T.esc(x.course) + '</p>';
      h += '<table class="tbl" style="min-width:0;max-width:420px"><thead><tr><th>Cấp độ</th><th>Ngữ pháp</th><th>Từ vựng</th></tr></thead><tbody>' +
        ['A1', 'A2', 'B1', 'B2', 'C1'].map(function (l) { var v = lv[l] || { g: 0, v: 0 }; return '<tr><td>' + l + '</td><td>' + v.g + '/4</td><td>' + v.v + '/4</td></tr>'; }).join('') + '</tbody></table>';
      if (x.vlog) h += '<details class="small"><summary>Chi tiết vi phạm (' + x.vio + ')</summary><pre style="white-space:pre-wrap;margin:6px 0 0">' + T.esc(x.vlog) + '</pre></details>';
      var a = '';
      E.partA.grammar.forEach(function (q, i) { var k = 'Ag' + i; a += ansCell((i + 1) + (fl[k] ? ' ⚑' : ''), an[k] !== undefined ? q.o[an[k]] : '', dt[k]); });
      E.partA.vocab.forEach(function (q, i) { var k = 'Av' + i; a += ansCell((i + 21) + (fl[k] ? ' ⚑' : ''), an[k] !== undefined ? q.o[an[k]] : '', dt[k]); });
      h += '<h3 style="font:700 20px var(--display)">Phần A</h3><div class="ans">' + a + '</div>';
      var l = ''; for (var n = 1; n <= 20; n++) l += ansCell(n + (fl['L' + n] ? ' ⚑' : ''), an['L' + n], dt['L' + n]);
      h += '<h3 style="font:700 20px var(--display)">Listening</h3><div class="ans">' + l + '</div>';
      var r = ''; for (var m = 1; m <= 13; m++) r += ansCell(m + (fl['R' + m] ? ' ⚑' : ''), an['R' + m], dt['R' + m]);
      h += '<h3 style="font:700 20px var(--display)">Reading</h3><div class="ans">' + r + '</div>';
      h += '<p class="small">Ô xanh là câu đúng, ô hồng là câu sai. ⚑ là câu học viên gắn cờ.</p>';
    }
    h += '<div class="row"><button class="btn ghost" style="min-height:36px;padding:0 12px" data-ereset="' + x.code + '">Mở lại bài làm</button><button class="btn ghost" style="min-height:36px;padding:0 12px" data-elink="' + x.code + '">Copy link làm bài</button><button class="btn ghost" style="min-height:36px;padding:0 12px" data-edel="' + x.code + '">Xóa mã</button></div></section>';
    $('#edetail').innerHTML = h;
  }
  function link(code) { return new URL('entry.html?code=' + encodeURIComponent(code), location.href).href; }
  function copy(t) {
    var legacy = function () { var a = document.createElement('textarea'); a.value = t; a.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(a); a.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (e) {} a.remove(); return ok; };
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(t).then(function () { return true; }, function () { return legacy(); });
    return Promise.resolve(legacy());
  }

  function bind() {
    $('#etbl').onclick = function (e) {
      var tr = e.target.closest('tr[data-code]'); if (!tr) return;
      pick = tr.getAttribute('data-code');
      T.$$('#etbl tr').forEach(function (x) { x.classList.toggle('pick', x === tr); });
      detail(pick);
    };
    $('#edetail').onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var rs = b.getAttribute('data-ereset'), dl = b.getAttribute('data-edel'), lk = b.getAttribute('data-elink');
      if (lk) copy(link(lk)).then(function (ok) { if (ok) { b.textContent = 'Đã copy'; setTimeout(function () { b.textContent = 'Copy link làm bài'; }, 1800); } else window.prompt('Sao chép link:', link(lk)); });
      if (rs) T.confirm('Mở lại bài làm?', 'Học viên sẽ làm lại từ đầu bằng cùng mã. Kết quả cũ sẽ bị xóa.', 'Mở lại').then(function (y) { if (y) api('tEReset', { code: rs }).then(function (r) { if (!r.ok) return note(errMsg(r)); note('Đã mở lại mã ' + rs, true); load(); }); });
      if (dl) T.confirm('Xóa mã ' + dl + '?', 'Mã và toàn bộ kết quả của học viên này sẽ bị xóa khỏi bảng tính.', 'Xóa').then(function (y) { if (y) api('tEDelete', { code: dl }).then(function (r) { if (!r.ok) return note(errMsg(r)); pick = null; $('#edetail').innerHTML = ''; load(); }); });
    };
    $('#ecreate').onclick = function () {
      var list = $('#enames').value.split('\n').map(function (l) { var p = l.split(','); return { name: (p[0] || '').trim(), cls: p.slice(1).join(',').trim() }; }).filter(function (x) { return x.name; });
      if (!list.length) return;
      $('#ecreate').disabled = true;
      api('tECreate', { list: list }).then(function (r) {
        $('#ecreate').disabled = false;
        if (!r.ok) return note(errMsg(r));
        note('Đã tạo ' + r.made.length + ' mã: ' + r.made.map(function (x) { return x.name + ' ' + x.code; }).join(', '), true);
        $('#enames').value = ''; load();
      });
    };
    $('#ecopy').onclick = function () {
      var open = rows.filter(function (x) { return x.st !== 'done'; });
      var t = open.map(function (x) { return x.name + ': mã ' + x.code + ', link ' + link(x.code); }).join('\n');
      if (!t) return note('Không có mã nào chưa làm.');
      copy(t).then(function (ok) { if (ok) note('Đã sao chép ' + open.length + ' mã chưa làm.', true); else { $('#enames').value = t; $('#enames').select(); } });
    };
    $('#ecsv').onclick = function () {
      var q = function (s) { return '"' + String(s == null ? '' : s).replace(/"/g, '""') + '"'; };
      var csv = '﻿Họ tên,Ghi chú,Mã,Trạng thái,CEFR,Ngữ pháp,Từ vựng,Phần A,Listening,Reading,Tổng %,Khóa gợi ý,Vi phạm,Nộp lúc\n' + rows.map(function (x) {
        return [q(x.name), q(x.cls), x.code, x.st, x.cefr || '', x.g, x.v, x.A, x.L, x.R, x.pct, q(x.course), x.vio, x.at ? q(new Date(x.at).toLocaleString('vi-VN')) : ''].join(',');
      }).join('\n');
      var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'kiem-tra-dau-vao.csv'; a.click();
    };
    $('#ereload').onclick = load;
  }

  var bound = false;
  window.TSEntry = {
    open: function (key) {
      KEY = key || (function () { try { return sessionStorage.getItem('ts-ielts-key') || ''; } catch (e) { return ''; } })();
      if (!bound) { bind(); bound = true; }
      if (!loaded) { $('#etbl tbody').innerHTML = '<tr><td colspan="11" class="small">Đang tải...</td></tr>'; }
      load();
    }
  };
})();
