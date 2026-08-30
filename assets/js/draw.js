/* ============================================================
   MEGA UNDIAN // FUTURE-DRAW SYSTEM
   draw.js — logika animasi & pengundian (halaman index)
   ============================================================ */
(function () {
  'use strict';
  var M = window.MEGA;
  if (!M) return;

  var RUNNING = false;
  var intervalId = null;
  var stopTimer = null;
  var lastWinner = null;

  function $(id) { return document.getElementById(id); }
  var els = {
    slotWrap: $('slotWrap'), slotNumber: $('slotNumber'), slotName: $('slotName'),
    statusText: $('statusText'), statusLine: $('statusLine'),
    btnStart: $('btnStart'), btnStop: $('btnStop'), btnResetRound: $('btnResetRound'), btnFull: $('btnFull'),
    statTotal: $('statTotal'), statAvail: $('statAvail'), statWon: $('statWon'), statRounds: $('statRounds'),
    pList: $('pList'), searchBox: $('searchBox'), historyList: $('historyList'),
    modal: $('winnerModal'), modalNumber: $('modalNumber'), modalName: $('modalName'),
    modalLabel: $('modalLabel'), modalHeading: document.querySelector('#winnerModal .modal-card h2'),
    btnAgain: $('btnAgain'), btnClose: $('btnClose'),
    tickerTrack: $('tickerTrack'), modalMarquee: $('modalMarquee')
  };

  /* ---------------- POOL ---------------- */

  function sortedList() {
    return M.getParticipants().slice().sort(function (a, b) { return a.number - b.number; });
  }

  function getPool() {
    var s = M.getSettings();
    return sortedList().filter(function (p) {
      return !s.removeWinner || !p.won;
    });
  }

  function wonCount() {
    return sortedList().filter(function (p) { return p.won; }).length;
  }

  /* ---------------- DISPLAY ---------------- */

  function display(p) {
    if (!p) return;
    var s = M.getSettings();
    els.slotNumber.textContent = String(p.number);
    els.slotNumber.classList.remove('idle');
    els.slotName.textContent = (s.showNames && p.name) ? p.name : (s.showNames ? 'TANPA NAMA' : '');
  }

  function idleDisplay() {
    els.slotWrap.classList.remove('winner-mode');
    els.slotNumber.textContent = '---';
    els.slotNumber.classList.add('idle');
    els.slotName.textContent = M.getSettings().idleText || 'SIAP UNTUK UNDIAN';
  }

  function setStatus(msg, cls) {
    els.statusText.textContent = msg;
    els.statusText.className = cls || '';
  }

  function updateStats() {
    var list = sortedList();
    var pool = getPool();
    var s = M.getSettings();
    els.statTotal.textContent = list.length;
    els.statAvail.textContent = pool.length;
    els.statWon.textContent = wonCount();
    if (els.statRounds) els.statRounds.textContent = M.getHistory().length;
    if (els.slotWrap && !els.slotWrap.classList.contains('winner-mode') && !RUNNING) {
      els.slotName.textContent = s.idleText || 'SIAP UNTUK UNDIAN';
    }
  }

  /* ---------------- START / STOP ---------------- */

  function startDraw() {
    if (RUNNING) return;
    var pool = getPool();
    if (!pool.length) {
      setStatus('TIDAK ADA PESERTA TERSEDIA. CEK ADMIN.', 'err');
      M.toast('Tidak ada peserta tersedia', 'error');
      M.beep(180, 0.25, 'square', 0.15);
      return;
    }
    RUNNING = true;
    lastWinner = null;
    els.slotWrap.classList.remove('winner-mode');
    els.btnStart.disabled = true;
    els.btnStop.disabled = false;
    els.slotWrap.classList.add('running');
    setStatus('MENGACAK...', '');
    M.beep(520, 0.08, 'square', 0.1);
    intervalId = setInterval(function () {
      var p = pool[Math.floor(Math.random() * pool.length)];
      display(p);
    }, 26);
  }

  function stopDraw() {
    if (!RUNNING) return;
    RUNNING = false;
    clearInterval(intervalId);
    intervalId = null;
    els.btnStart.disabled = true;
    els.btnStop.disabled = true;
    els.slotWrap.classList.remove('running');

    var pool = getPool();
    if (!pool.length) {
      setStatus('POOL KOSONG DI TENGAH UNDIAN.', 'err');
      els.btnStart.disabled = false;
      return;
    }
    var winner = pool[Math.floor(Math.random() * pool.length)];
    landTo(winner, pool);
  }

  /* ---------------- LANDING ANIMATION (efek mesin slot) ---------------- */

  function landTo(winner, pool) {
    var idx = pool.indexOf(winner);
    var steps = 22;
    var i = 0;
    var delay = 28;
    setStatus('MENETAPKAN PEMENANG...', '');

    function step() {
      var k = steps - i;
      var show = winner;
      if (k > 0) {
        if (k <= 6) {
          show = pool[((idx - k) % pool.length + pool.length) % pool.length];
        } else {
          show = pool[Math.floor(Math.random() * pool.length)];
        }
      }
      display(show);
      i++;
      if (i <= steps) {
        delay = Math.round(28 + Math.pow(i, 1.9) * 1.1);
        stopTimer = setTimeout(step, delay);
      } else {
        announce(winner);
      }
    }
    stopTimer = setTimeout(step, delay);
  }

  /* ---------------- ANNOUNCE WINNER ---------------- */

  function announce(p) {
    p.won = true;
    p.wonAt = Date.now();
    var list = M.getParticipants();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === p.id) list[i] = p;
    }
    M.saveParticipants(list);

    var hist = M.getHistory();
    hist.unshift({ number: p.number, name: p.name || '', ts: Date.now() });
    if (hist.length > 200) hist.length = 200;
    M.saveHistory(hist);

    lastWinner = p;
    els.slotWrap.classList.add('winner-mode');
    els.slotNumber.classList.add('winner');
    els.slotNumber.textContent = String(p.number);
    if (M.getSettings().showNames) {
      els.slotName.textContent = p.name || 'TANPA NAMA';
    } else {
      els.slotName.textContent = '';
    }

    els.modalNumber.textContent = String(p.number);
    var showNames = M.getSettings().showNames;
    if (showNames && p.name) {
      els.modalName.textContent = p.name;
      els.modalName.style.display = '';
    } else {
      els.modalName.textContent = '';
      els.modalName.style.display = 'none';
    }
    fillModalMarquee(p.number, p.name);
    els.modal.classList.add('show');
    M.confetti(5000);
    M.beep(880, 0.12, 'triangle', 0.14);
    setTimeout(function () { M.beep(1175, 0.18, 'triangle', 0.14); }, 130);
    setTimeout(function () { M.beep(1568, 0.3, 'triangle', 0.14); }, 280);

    setStatus('PEMENANG: #' + p.number + ' — SELAMAT!', '');
    updateStats();
    renderList();
    renderHistory();
    els.btnStart.disabled = false;
  }

  /* ---------------- RESET ROUND ---------------- */

  function resetRound() {
    if (RUNNING) {
      clearInterval(intervalId);
      RUNNING = false;
      els.slotWrap.classList.remove('running');
    }
    if (stopTimer) clearTimeout(stopTimer);

    var list = M.getParticipants();
    list.forEach(function (p) { p.won = false; delete p.wonAt; });
    M.saveParticipants(list);
    M.saveHistory([]);

    idleDisplay();
    setStatus('ROUND DI-RESET. SEMUA PESERTA KEMBALI AKTIF.', '');
    els.btnStart.disabled = false;
    els.btnStop.disabled = true;
    updateStats();
    renderList();
    renderHistory();
    M.toast('Round direset', 'ok');
    M.beep(440, 0.15, 'sine', 0.1);
  }

  /* ---------------- LIST PESERTA ---------------- */

  function updateLabels() {
    var s = M.getSettings();
    var show = s.showNames;
    var labNo = s.labelNumber || 'NO';
    var labName = s.labelName || 'NAMA';
    var no = document.getElementById('labelNo');
    var nm = document.getElementById('labelName');
    var sep = document.querySelector('.slot-label .sep');
    if (no) no.textContent = labNo;
    if (nm) { nm.textContent = labName; nm.style.display = show ? '' : 'none'; }
    if (sep) sep.style.display = show ? '' : 'none';
    if (els.modalLabel) els.modalLabel.textContent = labNo;
    if (els.modalHeading) els.modalHeading.textContent = s.modalTitle || 'PEMENANG TERPILIH';
  }

  function renderList() {
    updateLabels();
    var showNames = M.getSettings().showNames;
    var kw = (els.searchBox.value || '').toLowerCase().trim();
    var list = sortedList().filter(function (p) {
      if (!kw) return true;
      return String(p.number).indexOf(kw) >= 0 || (p.name || '').toLowerCase().indexOf(kw) >= 0;
    });

    els.pList.innerHTML = '';
    if (!list.length) {
      var empty = document.createElement('div');
      empty.className = 'empty-box';
      empty.textContent = '> tidak ada peserta ditemukan...';
      els.pList.appendChild(empty);
      return;
    }
    list.forEach(function (p, i) {
      var row = document.createElement('div');
      row.className = 'p-row';
      var no = document.createElement('span');
      no.className = 'p-no';
      no.textContent = String(p.number).padStart(2, '0');
      row.appendChild(no);
      if (showNames) {
        var nm = document.createElement('span');
        nm.className = 'p-name';
        nm.textContent = p.name || 'TANPA NAMA';
        row.appendChild(nm);
      }
      if (p.won) {
        var b = document.createElement('span');
        b.className = 'p-badge won';
        b.textContent = 'WINNER';
        row.appendChild(b);
      }
      row.style.animationDelay = Math.min(i * 15, 400) + 'ms';
      els.pList.appendChild(row);
    });
  }

  /* ---------------- HISTORY ---------------- */

  function fmtTime(ts) {
    var d = new Date(ts);
    function p(n) { return String(n).padStart(2, '0'); }
    return p(d.getDate()) + ' ' + ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGT', 'SEP', 'OKT', 'NOV', 'DES'][d.getMonth()] + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function renderHistory() {
    var hist = M.getHistory();
    els.historyList.innerHTML = '';
    if (!hist.length) {
      var empty = document.createElement('div');
      empty.className = 'empty-box';
      empty.textContent = '> belum ada pemenang tercatat...';
      els.historyList.appendChild(empty);
    } else {
      hist.slice(0, 30).forEach(function (h) {
        var chip = document.createElement('div');
        chip.className = 'h-chip';
        var b = document.createElement('b');
        b.textContent = '#' + h.number;
        var nm = document.createElement('span');
        nm.textContent = h.name ? ' • ' + h.name : '';
        var tm = document.createElement('span');
        tm.className = 'h-time';
        tm.textContent = fmtTime(h.ts);
        chip.appendChild(b);
        chip.appendChild(nm);
        chip.appendChild(tm);
        els.historyList.appendChild(chip);
      });
    }
    renderTicker();
  }

  /* ---------------- TICKER BERJALAN & MARQUEE ---------------- */

  function renderTicker() {
    if (!els.tickerTrack) return;
    var parts = [];
    var list = sortedList();
    var pool = getPool();
    var hist = M.getHistory();
    var s = M.getSettings();
    if (s.tickerText) {
      s.tickerText.split(/[•]|\n/).forEach(function (t) {
        var x = t.trim();
        if (x) parts.push(x);
      });
    } else {
      parts.push('MEGA UNDIAN // ONLINE');
    }
    parts.push('TOTAL PESERTA: ' + list.length);
    parts.push('POOL AKTIF: ' + pool.length);
    if (hist.length) {
      parts.push('PEMENANG TERBARU: #' + hist[0].number + (hist[0].name ? ' ' + hist[0].name : ''));
      hist.slice(0, 5).forEach(function (h) {
        parts.push('WINNER: #' + h.number + (h.name ? ' ' + h.name : ''));
      });
    } else {
      parts.push('BELUM ADA PEMENANG // TEKAN MULAI UNDIAN');
    }
    var one = '[ ' + parts.join(' ] [ ') + ' ]';
    els.tickerTrack.textContent = one + ' ' + one;
  }

  function fillModalMarquee(num, name) {
    if (!els.modalMarquee) return;
    var s = M.getSettings();
    var nm = (s.showNames && name) ? ' — ' + name : '';
    var parts = [
      '✔ SELAMAT KEPADA PEMENANG: #' + num + nm,
      '✔ NOMOR ' + num + ' RESMI TERPILIH',
      '✔ MEGA UNDIAN ONLINE LIVE'
    ];
    var one = parts.join('   ');
    els.modalMarquee.textContent = one + '   ' + one;
  }

  /* ---------------- POPUP BOLEH DIGESER (DRAG) ---------------- */

  function initDrag() {
    var card = els.modal.querySelector('.modal-card');
    if (!card) return;
    var drag = false, dx = 0, dy = 0;
    card.addEventListener('pointerdown', function (e) {
      if (e.target.closest('button')) return;
      drag = true;
      var r = card.getBoundingClientRect();
      card.style.position = 'absolute';
      card.style.left = r.left + 'px';
      card.style.top = r.top + 'px';
      card.style.margin = '0';
      card.style.transform = 'none';
      card.style.transition = 'none';
      card.classList.add('dragging');
      dx = e.clientX - r.left;
      dy = e.clientY - r.top;
      try { card.setPointerCapture(e.pointerId); } catch (err) {}
    });
    card.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var x = Math.min(Math.max(e.clientX - dx, 0), window.innerWidth - 60);
      var y = Math.min(Math.max(e.clientY - dy, 0), window.innerHeight - 60);
      card.style.left = x + 'px';
      card.style.top = y + 'px';
    });
    function stopDrag() {
      drag = false;
      card.classList.remove('dragging');
    }
    card.addEventListener('pointerup', stopDrag);
    card.addEventListener('pointercancel', stopDrag);
  }

  /* ---------------- CLOSE / AGAIN ---------------- */

  function closeModal() {
    els.modal.classList.remove('show');
    if (!RUNNING) idleDisplayIfIdle();
  }

  function idleDisplayIfIdle() {
    // jika tidak sedang melakukan undian & belum ada winner terbaru di layar
    if (!RUNNING && !lastWinner) idleDisplay();
  }

  function again() {
    els.modal.classList.remove('show');
    // bisa langsung putar lagi
    startDraw();
  }

  /* ---------------- MODE PROYEKTOR / FULLSCREEN ---------------- */

  function toggleFullscreen() {
    var body = document.body;
    body.classList.toggle('projector');
    document.documentElement.classList.toggle('projector', body.classList.contains('projector'));
    if (body.classList.contains('projector')) {
      var de = document.documentElement;
      if (de.requestFullscreen) de.requestFullscreen().catch(function () {});
      M.toast('Mode proyektor aktif', 'ok');
    } else {
      if (document.exitFullscreen) document.exitFullscreen().catch(function () {});
    }
  }

  /* ---------------- EVENTS ---------------- */

  function wire() {
    els.btnStart.addEventListener('click', startDraw);
    els.btnStop.addEventListener('click', stopDraw);
    els.btnResetRound.addEventListener('click', resetRound);
    if (els.btnFull) els.btnFull.addEventListener('click', toggleFullscreen);
    els.btnClose.addEventListener('click', closeModal);
    els.btnAgain.addEventListener('click', again);
    els.searchBox.addEventListener('input', renderList);
    els.modal.addEventListener('click', function (e) { if (e.target === els.modal) closeModal(); });

    document.addEventListener('megacfg', function () {
      updateLabels();
      renderTicker();
      if (!RUNNING) { if (!lastWinner) idleDisplay(); else idleDisplayIfIdle(); }
    });

    document.addEventListener('keydown', function (e) {
      var apop = document.getElementById('adminModal');
      if (apop && apop.classList.contains('open')) return;
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (!RUNNING && els.btnStart.disabled) return;
        RUNNING ? stopDraw() : startDraw();
      }
    });

    setInterval(function () {
      if (!RUNNING) { updateStats(); renderList(); renderTicker(); }
    }, 4000);

    initDrag();
  }

  /* ---------------- INIT ---------------- */

  function init() {
    M.seedIfEmpty();
    M.initMatrix();
    M.applyBackground(M.getSettings());
    updateStats();
    renderList();
    renderHistory();
    wire();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();