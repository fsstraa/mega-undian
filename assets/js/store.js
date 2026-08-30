/* ============================================================
   MEGA UNDIAN // FUTURE-DRAW SYSTEM
   store.js — penyimpanan data + helper global (localStorage)
   ============================================================ */
(function () {
  'use strict';

  var STORE = {
    PARTICIPANTS: 'megaUndian:participants',
    SETTINGS: 'megaUndian:settings',
    HISTORY: 'megaUndian:history'
  };

  var DEFAULT_SETTINGS = {
    title: 'MEGA UNDIAN',
    subtitle: 'FUTURE-DRAW SYSTEM // V2.0',
    backgroundType: 'none',
    backgroundValue: '',
    overlayOpacity: 0.28,
    matrixRain: false,
    matrixColor: '#6d7cff',
    accentColor: '#6d7cff',
    accent2: '#f472b6',
    removeWinner: true,
    showNames: false,
    sound: true,
    labelNumber: 'NO',
    labelName: 'NAMA',
    logoUrl: '',
    tickerText: 'SELAMAT DATANG DI UNDIAN MEGA • TEKAN [ MULAI UNDIAN ] UNTUK MEMUTAR • SEMOGA BERUNTUNG',
    idleText: 'SIAP UNTUK UNDIAN',
    modalTitle: 'PEMENANG TERPILIH'
  };

  function safeParse(raw, fallback) {
    if (!raw) return fallback;
    try { var v = JSON.parse(raw); return v == null ? fallback : v; }
    catch (e) { return fallback; }
  }

  function getJSON(key, fallback) {
    return safeParse(window.localStorage.getItem(key), fallback);
  }

  function setJSON(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      if (window.MEGA && window.MEGA.toast) window.MEGA.toast('DATA TERLALU BESAR UNTUK DISIMPAN', 'error');
      return false;
    }
  }

  /* ---------- DATA ACCESS ---------- */

  function getParticipants() {
    var list = getJSON(STORE.PARTICIPANTS, []);
    return Array.isArray(list) ? list : [];
  }
  function saveParticipants(list) { setJSON(STORE.PARTICIPANTS, list); }

  function getSettings() {
    var s = getJSON(STORE.SETTINGS, {});
    if (s && s.themeVersion !== 2) {
      s.themeVersion = 2;
      if (s.accentColor === '#00ff9f') s.accentColor = '#6d7cff';
      if (s.accent2 === '#ff2bd6') s.accent2 = '#f472b6';
      s.matrixRain = false;
      s.overlayOpacity = 0.28;
      setJSON(STORE.SETTINGS, s);
    }
    var merged = {};
    for (var k in DEFAULT_SETTINGS) {
      merged[k] = s[k] === undefined ? DEFAULT_SETTINGS[k] : s[k];
    }
    return merged;
  }
  function saveSettings(s) { setJSON(STORE.SETTINGS, s); }

  function getHistory() {
    var h = getJSON(STORE.HISTORY, []);
    return Array.isArray(h) ? h : [];
  }
  function saveHistory(h) { setJSON(STORE.HISTORY, h); }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function nextNumber(list) {
    var max = 0;
    (list || []).forEach(function (p) {
      if (p && typeof p.number === 'number' && p.number > max) max = p.number;
    });
    return max + 1;
  }

  /* ---------- SEED SAMPLE (hanya saat pertama kali) ---------- */

  function seedIfEmpty() {
    try {
      if (window.localStorage.getItem(STORE.PARTICIPANTS) !== null) return;
    } catch (e) { return; }
    var sample = [];
    for (var i = 1; i <= 5; i++) {
      sample.push({ id: uid(), number: i, name: '', won: false });
    }
    setJSON(STORE.PARTICIPANTS, sample);
  }

  /* ---------- INDEXEDDB (penyimpanan gambar latar yang besar) ---------- */

  var DB_NAME = 'mega-undian';
  var DB_VERSION = 1;
  var DB_STORE = 'bg';
  var dbPromise = null;

  function openDB() {
    if (!window.indexedDB) return Promise.reject(new Error('IndexedDB tidak didukung'));
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      var req = window.indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function (e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE);
      };
      req.onsuccess = function (e) { resolve(e.target.result); };
      req.onerror = function (e) { reject(e.target.error || new Error('IndexedDB gagal dibuka')); };
    });
    return dbPromise;
  }

  function dbPut(key, dataUrl) {
    if (!window.indexedDB) {
      return new Promise(function (resolve) { resolve(setJSON('megaUndian:' + key, dataUrl)); });
    }
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(DB_STORE, 'readwrite');
        tx.objectStore(DB_STORE).put(dataUrl, key);
        tx.oncomplete = function () { resolve(true); };
        tx.onerror = function (e) { reject(e.target.error || new Error('Gagal simpan')); };
      });
    });
  }

  function dbRead(key) {
    if (!window.indexedDB) {
      return new Promise(function (resolve) { resolve(getJSON('megaUndian:' + key, null)); });
    }
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(DB_STORE, 'readonly');
        var req = tx.objectStore(DB_STORE).get(key);
        req.onsuccess = function () { resolve(req.result || null); };
        req.onerror = function (e) { reject(e.target.error || new Error('Gagal baca')); };
      });
    }).catch(function () {
      return Promise.resolve(null);
    });
  }

  function dbDel(key) {
    if (!window.indexedDB) {
      window.localStorage.removeItem('megaUndian:' + key);
      return Promise.resolve(true);
    }
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(DB_STORE, 'readwrite');
        tx.objectStore(DB_STORE).delete(key);
        tx.oncomplete = function () { resolve(true); };
        tx.onerror = function (e) { reject(e.target.error || new Error('Gagal hapus')); };
      });
    }).catch(function () {
      return Promise.resolve(true);
    });
  }

  function dbSetBackground(d) { return dbPut('bg', d); }
  function dbGetBackground() { return dbRead('bg'); }
  function dbDeleteBackground() { return dbDel('bg'); }
  function dbSetLogo(d) { return dbPut('logo', d); }
  function dbGetLogo() { return dbRead('logo'); }
  function dbDeleteLogo() { return dbDel('logo'); }

  /* ---------- BACKGROUND + THEME APPLY ---------- */

  function applyBackground(settings) {
    var s = settings || getSettings();
    var root = document.documentElement.style;
    root.setProperty('--accent', s.accentColor || DEFAULT_SETTINGS.accentColor);
    root.setProperty('--accent2', s.accent2 || DEFAULT_SETTINGS.accent2);

    var el = document.getElementById('bgElement') || document.body;

    if (s.backgroundType === 'color') {
      el.style.opacity = '1';
      el.style.backgroundImage = 'none';
      el.style.backgroundColor = s.backgroundValue || '#0a0f1e';
    } else if (s.backgroundType === 'gradient') {
      el.style.opacity = '1';
      el.style.backgroundImage = s.backgroundValue || 'linear-gradient(135deg,#0a0f1e,#142048,#0a3a2f)';
      el.style.backgroundColor = 'transparent';
    } else if (s.backgroundType === 'url') {
      el.style.opacity = '1';
      el.style.backgroundColor = 'transparent';
      var val = s.backgroundValue || '';
      if (val && (val.indexOf('data:') === 0 || val.indexOf('http') === 0)) {
        el.style.backgroundImage = 'url("' + val + '")';
      } else {
        // gambar disimpan di IndexedDB, ambil secara async
        el.style.backgroundImage = '';
        dbGetBackground().then(function (d) {
          if (d) el.style.backgroundImage = 'url("' + d + '")';
        }).catch(function () {});
      }
    } else {
      el.style.opacity = '0';
      el.style.backgroundImage = 'none';
      el.style.backgroundColor = 'transparent';
    }
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center';
    el.style.backgroundRepeat = 'no-repeat';

    var ov = document.getElementById('overlay');
    if (ov) ov.style.background = 'rgba(4,5,10,' + (Number(s.overlayOpacity) || 0) + ')';

    var matrix = document.getElementById('matrixBG');
    if (matrix) matrix.style.opacity = s.matrixRain ? '1' : '0';
    if (s.matrixColor) window.__matrixColor = s.matrixColor;

    var t = document.getElementById('siteTitle');
    if (t) {
      t.textContent = s.title || DEFAULT_SETTINGS.title;
      document.title = (s.title || DEFAULT_SETTINGS.title) + ' // DRAW SYSTEM';
    }
    var st = document.getElementById('siteSubtitle');
    if (st) st.textContent = s.subtitle || DEFAULT_SETTINGS.subtitle;

    applyLogo(s);
  }

  function applyLogo(settings) {
    var s = settings || getSettings();
    var img = document.getElementById('brandLogo');
    var mark = document.getElementById('brandMark');
    if (!img) return;
    var v = s.logoUrl || '';
    function hide() {
      img.style.display = 'none';
      if (mark) mark.style.display = '';
    }
    if (!v) { hide(); return; }
    if (v.indexOf('data:') === 0 || v.indexOf('http') === 0) {
      img.src = v;
      img.style.display = 'inline-block';
      if (mark) mark.style.display = 'none';
      return;
    }
    hide();
    dbGetLogo().then(function (d) {
      if (d) {
        img.src = d;
        img.style.display = 'inline-block';
        if (mark) mark.style.display = 'none';
      } else {
        hide();
      }
    }).catch(hide);
  }

  /* ---------- MATRIX RAIN ---------- */

  function initMatrix() {
    var canvas = document.getElementById('matrixBG');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789アイウエオカキクケコサシスセソタチツテトナニヌネノ<>/{}[]$#@%&*+=_';
    var fontSize = 14;
    var columns = 0;
    var drops = [];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops = [];
      for (var i = 0; i < columns; i++) drops[i] = Math.random() * (-canvas.height / fontSize);
    }
    window.addEventListener('resize', resize);
    resize();

    function loop() {
      requestAnimationFrame(loop);
      var s = getSettings();
      var color = window.__matrixColor || s.matrixColor || '#00ff9f';
      if (!s.matrixRain) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      ctx.fillStyle = 'rgba(5,6,10,0.07)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;
      ctx.font = fontSize + 'px "Share Tech Mono", monospace';
      for (var i = 0; i < columns; i++) {
        var ch = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(ch, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.976) drops[i] = 0;
        drops[i]++;
      }
    }
    requestAnimationFrame(loop);
  }

  /* ---------- CONFETTI ---------- */

  function confetti(duration) {
    var canvas = document.getElementById('confetti');
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var ctx = canvas.getContext('2d');
    var colors = ['#00ff9f', '#ff2bd6', '#00d4ff', '#ffe600', '#ffffff', '#7c4dff'];
    var parts = [];
    for (var i = 0; i < 180; i++) {
      parts.push({
        x: Math.random() * canvas.width,
        y: -10 - Math.random() * canvas.height * 0.6,
        w: 4 + Math.random() * 6,
        h: 6 + Math.random() * 10,
        vy: 1.5 + Math.random() * 2.5,
        vx: -0.6 + Math.random() * 1.2,
        rot: Math.random() * Math.PI * 2,
        vr: -0.08 + Math.random() * 0.16,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    var start = performance.now();
    (function loop(now) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var alive = false;
      for (var j = 0; j < parts.length; j++) {
        var p = parts[j];
        p.x += p.vx; p.y += p.vy; p.vy += 0.03; p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
        if (p.y < canvas.height + 40) alive = true;
      }
      if ((now - start) < (duration || 4500) && alive) requestAnimationFrame(loop);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    })(start);
  }

  /* ---------- TOAST ---------- */

  function toast(msg, type) {
    var wrap = document.getElementById('toastWrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'toastWrap';
      document.body.appendChild(wrap);
    }
    var t = document.createElement('div');
    t.className = 'toast ' + (type || 'info');
    t.textContent = msg;
    wrap.appendChild(t);
    setTimeout(function () { t.classList.add('show'); }, 10);
    setTimeout(function () {
      t.classList.remove('show');
      setTimeout(function () { t.remove(); }, 400);
    }, 2600);
  }

  /* ---------- SOUND ---------- */

  function beep(freq, dur, type, vol) {
    try {
      var settings = getSettings();
      if (!settings.sound) return;
      var ctx = window.__ac || (window.__ac = new (window.AudioContext || window.webkitAudioContext)());
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = type || 'sine';
      o.frequency.value = freq || 440;
      g.gain.setValueAtTime(vol || 0.12, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (dur || 0.15));
      o.connect(g); g.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + (dur || 0.15) + 0.02);
    } catch (e) {}
  }

  function resetAll() {
    window.localStorage.removeItem(STORE.PARTICIPANTS);
    window.localStorage.removeItem(STORE.SETTINGS);
    window.localStorage.removeItem(STORE.HISTORY);
    return dbDeleteBackground();
  }

  /* ---------- EXPORT ---------- */

  window.MEGA = {
    STORE: STORE,
    DEFAULT_SETTINGS: DEFAULT_SETTINGS,
    getParticipants: getParticipants,
    saveParticipants: saveParticipants,
    getSettings: getSettings,
    saveSettings: saveSettings,
    getHistory: getHistory,
    saveHistory: saveHistory,
    uid: uid,
    nextNumber: nextNumber,
    seedIfEmpty: seedIfEmpty,
    applyBackground: applyBackground,
    initMatrix: initMatrix,
    confetti: confetti,
    toast: toast,
    beep: beep,
    resetAll: resetAll,
    dbSetBackground: dbSetBackground,
    dbGetBackground: dbGetBackground,
    dbDeleteBackground: dbDeleteBackground,
    dbSetLogo: dbSetLogo,
    dbGetLogo: dbGetLogo,
    dbDeleteLogo: dbDeleteLogo
  };
})();