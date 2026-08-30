/* ============================================================
   MEGA UNDIAN // FUTURE-DRAW SYSTEM
   admin.js — panel admin: tampilan, peserta, data (halaman admin)
   ============================================================ */
(function () {
  'use strict';
  var M = window.MEGA;
  if (!M) return;

  var GRADIENTS = [
    "linear-gradient(135deg, #0b1020 0%, #18254a 45%, #0f2b3a 100%)",
    "linear-gradient(135deg, #0c0f2e 0%, #3a1d5f 50%, #10203f 100%)",
    "linear-gradient(135deg, #0a1428 0%, #1c3d5e 60%, #0f2830 100%)",
    "linear-gradient(135deg, #150f2e 0%, #3c1f4d 50%, #2a1040 100%)",
    "linear-gradient(180deg, #071018 0%, #0e3a4a 50%, #17575c 100%)",
    "radial-gradient(circle at 30% 20%, #1b2240 0%, #0a0f1e 70%)"
  ];

  function $(id) { return document.getElementById(id); }

  var els = {
    setTitle: $('setTitle'), setSubtitle: $('setSubtitle'),
    setLabelNumber: $('setLabelNumber'), setLabelName: $('setLabelName'),
    setTicker: $('setTicker'), setIdle: $('setIdle'), setModalTitle: $('setModalTitle'),
    setPrize: $('setPrize'), setConfirm: $('setConfirm'), btnTest: $('btnTest'),
    setAccent: $('setAccent'), setAccent2: $('setAccent2'),
    bgType: $('bgType'), bgColor: $('bgColor'), bgUrl: $('bgUrl'),
    lblColor: $('lblColor'), gradWrap: $('gradWrap'), urlWrap: $('urlWrap'),
    gradChips: $('gradChips'),
    setOverlay: $('setOverlay'), setMatrix: $('setMatrix'), setSound: $('setSound'),
    setNames: $('setNames'), setRemove: $('setRemove'),
    addName: $('addName'), addNumber: $('addNumber'), btnAdd: $('btnAdd'),
    bulkArea: $('bulkArea'), btnImport: $('btnImport'), btnSample: $('btnSample'),
    adminSearch: $('adminSearch'), pTable: $('pTable'),
    pStatTotal: $('pStatTotal'), pStatWon: $('pStatWon'),
    btnExport: $('btnExport'), btnImportJson: $('btnImportJson'), fileImport: $('fileImport'),
    btnCsv: $('btnCsv'),
    btnResetWins: $('btnResetWins'), btnClearParts: $('btnClearParts'), btnFactory: $('btnFactory'),
    fileUpload: $('fileUpload'), btnUpload: $('btnUpload'), btnSetUrl: $('btnSetUrl'), btnClearBg: $('btnClearBg'),
    genCount: $('genCount'), btnGen: $('btnGen'), genInfo: $('genInfo'),
    btnSheet: $('btnSheet'), fileSheet: $('fileSheet'),
    logoUrl: $('logoUrl'), btnLogoUrl: $('btnLogoUrl'), btnLogoUpload: $('btnLogoUpload'),
    btnLogoClear: $('btnLogoClear'), fileLogo: $('fileLogo')
  };

  /* ---------------- SETTINGS ---------------- */

  function readSettings() {
    var s = M.getSettings();
    s.title = els.setTitle.value || M.DEFAULT_SETTINGS.title;
    s.subtitle = els.setSubtitle.value;
    s.labelNumber = els.setLabelNumber.value || M.DEFAULT_SETTINGS.labelNumber;
    s.labelName = els.setLabelName.value || M.DEFAULT_SETTINGS.labelName;
    s.tickerText = els.setTicker.value || M.DEFAULT_SETTINGS.tickerText;
    s.idleText = els.setIdle.value || M.DEFAULT_SETTINGS.idleText;
    s.modalTitle = els.setModalTitle.value || M.DEFAULT_SETTINGS.modalTitle;
    s.prizeLabel = els.setPrize.value || M.DEFAULT_SETTINGS.prizeLabel;
    s.accentColor = els.setAccent.value;
    s.accent2 = els.setAccent2.value;
    s.backgroundType = els.bgType.value;
    if (s.backgroundType === 'color') s.backgroundValue = els.bgColor.value;
    if (s.backgroundType === 'url') s.backgroundValue = els.bgUrl.value || s.backgroundValue;
    if (s.backgroundType === 'gradient' && GRADIENTS.indexOf(s.backgroundValue) < 0) s.backgroundValue = GRADIENTS[0];
    s.overlayOpacity = parseFloat(els.setOverlay.value) || 0;
    s.matrixRain = els.setMatrix.checked;
    s.sound = els.setSound.checked;
    s.showNames = els.setNames.checked;
    s.removeWinner = els.setRemove.checked;
    s.confirmWinner = els.setConfirm.checked;
    return s;
  }

  function commit() {
    M.saveSettings(readSettings());
    M.applyBackground(M.getSettings());
    syncBgSections();
    renderGradChips();
    cfgChanged();
  }

  function cfgChanged() {
    document.dispatchEvent(new CustomEvent('megacfg'));
  }

  function syncBgSections() {
    var t = els.bgType.value;
    els.lblColor.style.display = t === 'color' ? 'flex' : 'none';
    els.gradWrap.style.display = t === 'gradient' ? 'block' : 'none';
    els.urlWrap.style.display = t === 'url' ? 'block' : 'none';
  }

  function renderGradChips() {
    els.gradChips.innerHTML = '';
    var cur = M.getSettings().backgroundValue;
    GRADIENTS.forEach(function (g) {
      var chip = document.createElement('div');
      chip.className = 'grad-chip' + (cur === g ? ' active' : '');
      chip.style.background = g;
      chip.title = 'Terapkan gradient ini';
      chip.addEventListener('click', function () {
        var s = M.getSettings();
        s.backgroundType = 'gradient';
        s.backgroundValue = g;
        M.saveSettings(s);
        els.bgType.value = 'gradient';
        syncBgSections();
        M.applyBackground(s);
        renderGradChips();
        M.toast('Gradient diterapkan', 'ok');
      });
      els.gradChips.appendChild(chip);
    });
  }

  function initSettings() {
    var s = M.getSettings();
    els.setTitle.value = s.title;
    els.setSubtitle.value = s.subtitle;
    els.setLabelNumber.value = s.labelNumber;
    els.setLabelName.value = s.labelName;
    els.setTicker.value = s.tickerText;
    els.setIdle.value = s.idleText;
    els.setModalTitle.value = s.modalTitle;
    els.setPrize.value = s.prizeLabel;
    els.setAccent.value = s.accentColor;
    els.setAccent2.value = s.accent2;
    els.bgType.value = s.backgroundType;
    els.bgColor.value = (s.backgroundType === 'color' && s.backgroundValue) ? s.backgroundValue : '#0a0f1e';
    els.bgUrl.value = (s.backgroundType === 'url' && s.backgroundValue && s.backgroundValue.indexOf('data:') !== 0) ? s.backgroundValue : '';
    els.setOverlay.value = s.overlayOpacity;
    els.setMatrix.checked = !!s.matrixRain;
    els.setSound.checked = !!s.sound;
    els.setNames.checked = !!s.showNames;
    els.setRemove.checked = !!s.removeWinner;
    els.setConfirm.checked = !!s.confirmWinner;
    syncBgSections();
    renderGradChips();
  }

  /* ---------------- PARTICIPANTS CRUD ---------------- */

  function sortedList() {
    return M.getParticipants().slice().sort(function (a, b) { return a.number - b.number; });
  }

  function numberTaken(list, num, exceptId) {
    return list.some(function (p) { return p.number === num && p.id !== exceptId; });
  }

  function renderTable() {
    var kw = (els.adminSearch.value || '').toLowerCase().trim();
    var list = sortedList().filter(function (p) {
      if (!kw) return true;
      return String(p.number).indexOf(kw) >= 0 || (p.name || '').toLowerCase().indexOf(kw) >= 0;
    });

    els.pTable.innerHTML = '';
    var all = sortedList();
    els.pStatTotal.textContent = all.length;
    els.pStatWon.textContent = all.filter(function (p) { return p.won; }).length;

    if (!list.length) {
      var empty = document.createElement('div');
      empty.className = 'empty-box';
      empty.textContent = '> tidak ada peserta. tambahkan di atas...';
      els.pTable.appendChild(empty);
      return;
    }

    list.forEach(function (p) {
      var row = document.createElement('div');
      row.className = 'p-row';
      row.dataset.id = p.id;

      var no = document.createElement('span');
      no.className = 'p-no';
      no.textContent = String(p.number).padStart(2, '0');
      var nm = document.createElement('span');
      nm.className = 'p-name';
      nm.textContent = p.name || 'TANPA NAMA';
      if (p.won) {
        var b = document.createElement('span');
        b.className = 'p-badge won';
        b.textContent = 'WINNER';
        row.appendChild(no); row.appendChild(nm); row.appendChild(b);
      } else {
        row.appendChild(no); row.appendChild(nm);
      }

      var acts = document.createElement('div');
      acts.className = 'row-actions';

      var btnEdit = document.createElement('button');
      btnEdit.className = 'icobtn';
      btnEdit.textContent = 'EDIT';
      btnEdit.addEventListener('click', function () { enableEditRow(p, row); });

      var btnDel = document.createElement('button');
      btnDel.className = 'icobtn danger';
      btnDel.textContent = 'DEL';
      btnDel.addEventListener('click', function () { deleteParticipant(p.id); });

      acts.appendChild(btnEdit);
      acts.appendChild(btnDel);
      row.appendChild(acts);
      els.pTable.appendChild(row);
    });
  }

  function enableEditRow(p, row) {
    row.classList.add('editing');
    row.innerHTML = '';

    var wrap = document.createElement('div');
    wrap.className = 'edit-inputs';

    var inNo = document.createElement('input');
    inNo.type = 'number'; inNo.min = '1';
    inNo.className = 'edit-num';
    inNo.value = p.number;

    var inName = document.createElement('input');
    inName.type = 'text';
    inName.className = 'edit-name';
    inName.value = p.name || '';

    wrap.appendChild(inName);
    wrap.appendChild(inNo);
    row.appendChild(wrap);

    var acts = document.createElement('div');
    acts.className = 'row-actions';

    var btnSave = document.createElement('button');
    btnSave.className = 'icobtn ok';
    btnSave.textContent = 'SAVE';
    btnSave.addEventListener('click', function () {
      var num = parseInt(inNo.value, 10);
      var name = inName.value.trim();
      if (!num || num < 1) { M.toast('Nomor tidak valid', 'error'); return; }
      var list = M.getParticipants();
      if (numberTaken(list, num, p.id)) { M.toast('Nomor ' + num + ' sudah dipakai', 'error'); return; }
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === p.id) {
          list[i].number = num;
          list[i].name = name;
        }
      }
      M.saveParticipants(list);
      row.classList.remove('editing');
      M.toast('Peserta diperbarui', 'ok');
      renderTable();
    });

    var btnCancel = document.createElement('button');
    btnCancel.className = 'icobtn';
    btnCancel.textContent = 'X';
    btnCancel.addEventListener('click', function () { row.classList.remove('editing'); renderTable(); });

    acts.appendChild(btnSave);
    acts.appendChild(btnCancel);
    row.appendChild(acts);
  }

  function addParticipant(name, number) {
    var list = M.getParticipants();
    var num;
    if (number !== null && number !== undefined && number !== '') {
      num = parseInt(number, 10);
      if (!num || num < 1) { M.toast('Nomor tidak valid', 'error'); return false; }
      if (numberTaken(list, num, null)) { M.toast('Nomor ' + num + ' sudah dipakai', 'error'); return false; }
    } else {
      num = M.nextNumber(list);
    }
    list.push({ id: M.uid(), number: num, name: (name || '').trim(), won: false });
    M.saveParticipants(list);
    return true;
  }

  function deleteParticipant(id) {
    var list = M.getParticipants().filter(function (p) { return p.id !== id; });
    M.saveParticipants(list);
    M.toast('Peserta dihapus', 'ok');
    renderTable();
    cfgChanged();
  }

  /* ---------------- BULK IMPORT ---------------- */

  function parseBulk(text) {
    var lines = text.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
    var out = [];
    lines.forEach(function (line) {
      if (/^(no|nomor|number|num|nrp|id|nama|name|peserta)$/i.test(line)) return;
      var name = line, number = null;
      var parts = line.replace(/\s*[|:#\t,]\s*/g, '|').split('|');
      if (parts.length >= 2) {
        var first = parts[0].trim();
        var second = parts[1].trim();
        if (!/^\d+$/.test(first) && !/^\d+$/.test(second) && /^(no|nomor|number|num|nrp|id)$/i.test(first)) return;
        if (/^\d+$/.test(second)) { name = first; number = second; }
        else if (/^\d+$/.test(first)) { name = second; number = first; }
        else { name = line; number = null; }
      }
      out.push({ name: name, number: number });
    });
    return out;
  }

  /* ---------------- CSV / SHEET PARSING ---------------- */

  function parseCSV(text) {
    text = text.replace(/^\uFEFF/, '');
    var rows = [], row = [], field = '', inQ = false;
    var src = text.split('');
    for (var i = 0; i < src.length; i++) {
      var c = src[i];
      if (inQ) {
        if (c === '"') {
          if (src[i + 1] === '"') { field += '"'; i++; }
          else inQ = false;
        } else {
          field += c;
        }
      } else {
        if (c === '"') inQ = true;
        else if (c === ',' || c === '\t' || c === ';') { row.push(field); field = ''; }
        else if (c === '\n' || c === '\r') {
          if (c === '\r' && src[i + 1] === '\n') i++;
          row.push(field); field = '';
          if (row.length) rows.push(row);
          row = [];
        } else {
          field += c;
        }
      }
    }
    if (field !== '' || row.length) { row.push(field); rows.push(row); }
    return rows.filter(function (r) { return r.some(function (f) { return String(f).trim() !== ''; }); });
  }

  function detectCols(rows) {
    var n = Math.max.apply(null, rows.map(function (r) { return r.length; }));
    var numCnt = Array(n).fill(0), nameCnt = Array(n).fill(0);
    rows.forEach(function (r) {
      for (var c = 0; c < n; c++) {
        var v = String(r[c] == null ? '' : r[c]).trim();
        if (/^\d+$/.test(v)) numCnt[c]++;
        else if (v) nameCnt[c]++;
      }
    });
    var h = rows[0].map(function (x) { return String(x).trim().toLowerCase(); });
    var pk = function (a) { var m = -1, mi = -1; for (var i = 0; i < a.length; i++) if (a[i] > m) { m = a[i]; mi = i; } return mi; };
    var numCol = pk(numCnt);
    var nameCol = pk(nameCnt);
    var hasHeader = false;
    for (var c = 0; c < n; c++) {
      if (/^\d+$/.test(h[c])) continue;
      var base = h[c];
      if (base === 'nama' || base === 'name' || base === 'peserta' || base === 'no' || base === 'nomor' || base === 'number' || base === 'num' || base === 'nrp' || base === 'id') hasHeader = true;
      if (base === 'no' || base === 'nomor' || base === 'number' || base === 'num' || base === 'nrp' || base === 'id') numCol = c;
      if (base === 'nama' || base === 'name' || base === 'peserta') nameCol = c;
    }
    if (numCol >= 0 && numCnt[numCol] === 0) {
      var alt = -1;
      for (var c2 = 0; c2 < n; c2++) if (numCnt[c2] > 0) { alt = c2; break; }
      numCol = alt;
    }
    if (numCol === nameCol) {
      if (numCol >= 0 && numCnt[numCol] > 0) nameCol = -1;
      else numCol = -1;
    }
    return { numCol: numCol, nameCol: nameCol, hasHeader: hasHeader };
  }

  function sheetRowsToItems(rows) {
    if (!rows || !rows.length) return [];
    var cols = detectCols(rows);
    var items = [];
    rows.forEach(function (r, ri) {
      if (cols.hasHeader && ri === 0) return;
      var numText = cols.numCol >= 0 ? String(r[cols.numCol] == null ? '' : r[cols.numCol]).trim() : '';
      var name = cols.nameCol >= 0 ? String(r[cols.nameCol] == null ? '' : r[cols.nameCol]).trim() : '';
      var number = /^\d+$/.test(numText) ? parseInt(numText, 10) : null;
      items.push({ name: name, number: number });
    });
    return items;
  }

  /* ---------------- IMPORT (MERGE: nama terdata ke nomor) ---------------- */

  function importItems(items, sourceName) {
    if (!items.length) { M.toast('Tidak ada data valid untuk diimport', 'error'); return; }
    var list = M.getParticipants();
    var byNum = {};
    list.forEach(function (p) { if (p && p.number) byNum[p.number] = p; });
    var taken = {};
    var added = 0, named = 0, skipped = 0;

    items.forEach(function (it) {
      var name = (it.name || '').trim();
      var num;
      if (it.number != null) {
        num = parseInt(it.number, 10);
        if (!num || num < 1) { skipped++; return; }
      } else {
        var sorted = list.slice().sort(function (a, b) { return a.number - b.number; });
        var slot = null;
        for (var i = 0; i < sorted.length; i++) {
          if (!sorted[i].name && !sorted[i].won && !taken[sorted[i].id]) { slot = sorted[i]; break; }
        }
        if (slot) {
          if (name) { taken[slot.id] = true; slot.name = name; named++; }
          else skipped++;
          return;
        }
        num = M.nextNumber(list);
      }
      var existing = byNum[num];
      if (existing) {
        if (!taken[existing.id] && name) {
          existing.name = name;
          taken[existing.id] = true;
          named++;
        } else {
          skipped++;
        }
        return;
      }
      var p = { id: M.uid(), number: num, name: name, won: false };
      byNum[num] = p;
      list.push(p);
      added++;
      if (name) named++;
    });

    M.saveParticipants(list);
    M.toast((sourceName || 'Import') + ': ' + added + ' baru, ' + named + ' nama terdata, ' + skipped + ' dilewati', 'ok');
    renderTable();
    renderGenInfo();
    cfgChanged();
  }

  /* ---------------- AUTO GENERATE NOMOR ---------------- */

  function renderGenInfo() {
    var total = M.getParticipants().length;
    var target = els.genCount.value;
    els.genInfo.textContent = target
      ? 'total saat ini: ' + total + ' peserta -> target: ' + target
      : 'total saat ini: ' + total + ' peserta';
  }

  function generateCount() {
    var count = parseInt(els.genCount.value, 10);
    if (!count || count < 1) { M.toast('Masukkan jumlah peserta yang valid', 'error'); return; }
    var list = M.getParticipants();
    var byNum = {};
    list.forEach(function (p) { if (p && p.number) byNum[p.number] = p; });

    var removed = list.filter(function (p) { return p.number > count; });
    if (removed.length && !confirm('Total akan menjadi ' + count + '. ' + removed.length + ' peserta dengan nomor > ' + count + ' akan dihapus. Lanjut?')) return;

    var newList = [];
    for (var i = 1; i <= count; i++) {
      if (byNum[i]) {
        var e = byNum[i];
        e.number = i;
        newList.push(e);
      } else {
        newList.push({ id: M.uid(), number: i, name: '', won: false });
      }
    }
    M.saveParticipants(newList);
    M.toast('Total peserta: ' + count + ' (nomor 1 s/d ' + count + ')', 'ok');
    renderTable();
    renderGenInfo();
    cfgChanged();
  }

  /* ---------------- EVENTS ---------------- */

  function wire() {
    [els.setTitle, els.setSubtitle, els.setLabelNumber, els.setLabelName, els.setTicker, els.setIdle, els.setModalTitle, els.setPrize,
     els.setAccent, els.setAccent2, els.bgType, els.bgColor,
     els.setOverlay, els.setMatrix, els.setSound, els.setNames, els.setRemove, els.setConfirm]
      .forEach(function (el) {
        el.addEventListener('input', commit);
        el.addEventListener('change', commit);
      });

    els.btnSetUrl.addEventListener('click', function () {
      var url = els.bgUrl.value.trim();
      if (!url) { M.toast('Masukkan URL gambar dulu', 'error'); return; }
      var s = M.getSettings();
      s.backgroundType = 'url';
      s.backgroundValue = url;
      M.saveSettings(s);
      M.applyBackground(s);
      M.toast('URL latar diterapkan', 'ok');
    });

    els.btnUpload.addEventListener('click', function () { els.fileUpload.click(); });
    els.fileUpload.addEventListener('change', function () {
      var f = els.fileUpload.files[0];
      if (!f) return;
      var rd = new FileReader();
      rd.onload = function (e) {
        var img = new Image();
        img.onload = function () {
          var maxW = 2000;
          var scale = Math.min(1, maxW / img.width);
          var c = document.createElement('canvas');
          c.width = Math.round(img.width * scale);
          c.height = Math.round(img.height * scale);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          var outType = /png|webp/i.test(f.type || '') ? 'image/png' : 'image/jpeg';
          var dataURL = c.toDataURL(outType, 0.85);
          M.dbSetBackground(dataURL).then(function () {
            var s = M.getSettings();
            s.backgroundType = 'url';
            s.backgroundValue = '';
            M.saveSettings(s);
            M.applyBackground(s);
            els.bgType.value = 'url';
            els.bgUrl.value = '';
            syncBgSections();
            M.toast('Gambar latar terpasang (' + Math.round(dataURL.length / 1024) + ' KB)', 'ok');
          }).catch(function () {
            M.toast('Gagal menyimpan gambar latar', 'error');
          });
        };
        img.onerror = function () { M.toast('File bukan gambar yang valid', 'error'); };
        img.src = e.target.result;
      };
      rd.onerror = function () { M.toast('Gagal membaca file', 'error'); };
      rd.readAsDataURL(f);
    });

    els.btnClearBg.addEventListener('click', function () {
      M.dbDeleteBackground().then(function () {
        var s = M.getSettings();
        s.backgroundType = 'none';
        s.backgroundValue = '';
        M.saveSettings(s);
        M.applyBackground(s);
        els.bgType.value = 'none';
        els.bgUrl.value = '';
        syncBgSections();
        M.toast('Latar belakang dihapus', 'ok');
      });
    });

    els.btnLogoUrl.addEventListener('click', function () {
      var url = els.logoUrl.value.trim();
      if (!url) { M.toast('Masukkan URL logo dulu', 'error'); return; }
      var s = M.getSettings();
      s.logoUrl = url;
      M.saveSettings(s);
      M.applyLogo(s);
      M.toast('Logo URL diterapkan', 'ok');
    });

    els.btnLogoUpload.addEventListener('click', function () { els.fileLogo.click(); });
    els.fileLogo.addEventListener('change', function () {
      var f = els.fileLogo.files[0];
      if (!f) return;
      var rd = new FileReader();
      rd.onload = function (e) {
        var img = new Image();
        img.onload = function () {
          var maxW = 400;
          var scale = Math.min(1, maxW / img.width);
          var c = document.createElement('canvas');
          c.width = Math.round(img.width * scale);
          c.height = Math.round(img.height * scale);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          var outType = /png|webp/i.test(f.type || '') ? 'image/png' : 'image/jpeg';
          var dataURL = c.toDataURL(outType, 0.9);
          M.dbSetLogo(dataURL).then(function () {
            var s = M.getSettings();
            s.logoUrl = '';
            M.saveSettings(s);
            M.applyLogo(s);
            els.logoUrl.value = '';
            M.toast('Logo terpasang (' + Math.round(dataURL.length / 1024) + ' KB)', 'ok');
          }).catch(function () {
            M.toast('Gagal menyimpan logo', 'error');
          });
        };
        img.onerror = function () { M.toast('File bukan gambar yang valid', 'error'); };
        img.src = e.target.result;
      };
      rd.onerror = function () { M.toast('Gagal membaca file', 'error'); };
      rd.readAsDataURL(f);
    });

    els.btnLogoClear.addEventListener('click', function () {
      M.dbDeleteLogo().then(function () {
        var s = M.getSettings();
        s.logoUrl = '';
        M.saveSettings(s);
        M.applyLogo(s);
        els.logoUrl.value = '';
        M.toast('Logo dihapus', 'ok');
      });
    });

    els.btnTest.addEventListener('click', function () {
      M.beep(660, 0.12, 'triangle', 0.14);
      setTimeout(function () { M.beep(880, 0.12, 'triangle', 0.14); }, 130);
      setTimeout(function () { M.beep(1320, 0.2, 'triangle', 0.14); }, 270);
    });

    els.btnCsv.addEventListener('click', function () {
      var rows = M.getParticipants().slice().sort(function (a, b) { return a.number - b.number; });
      function esc(v) {
        v = String(v == null ? '' : v);
        return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
      }
      var lines = ['NO,NAMA,STATUS'];
      rows.forEach(function (p) {
        lines.push([p.number, p.name || '', p.won ? 'PEMENANG' : 'AKTIF'].map(esc).join(','));
      });
      var blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'mega-undian-peserta-' + new Date().toISOString().slice(0, 10) + '.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      M.toast('Daftar peserta diexport (CSV)', 'ok');
    });

    els.btnAdd.addEventListener('click', function () {
      if (addParticipant(els.addName.value, els.addNumber.value)) {
        els.addName.value = '';
        els.addNumber.value = '';
        M.toast('Peserta ditambahkan', 'ok');
        renderTable();
        cfgChanged();
      }
    });
    els.addName.addEventListener('keydown', function (e) { if (e.key === 'Enter') els.btnAdd.click(); });
    els.addNumber.addEventListener('keydown', function (e) { if (e.key === 'Enter') els.btnAdd.click(); });

    els.genCount.addEventListener('input', renderGenInfo);
    els.genCount.addEventListener('keydown', function (e) { if (e.key === 'Enter') generateCount(); });
    els.btnGen.addEventListener('click', generateCount);

    els.btnSheet.addEventListener('click', function () { els.fileSheet.click(); });
    els.fileSheet.addEventListener('change', function () {
      var f = els.fileSheet.files[0];
      if (!f) return;
      var rd = new FileReader();
      rd.onload = function (e) {
        var rows = parseCSV(e.target.result);
        var items = sheetRowsToItems(rows);
        importItems(items, 'Sheet');
      };
      rd.onerror = function () { M.toast('Gagal membaca file sheet', 'error'); };
      rd.readAsText(f);
      els.fileSheet.value = '';
    });

    els.btnImport.addEventListener('click', function () {
      var items = parseBulk(els.bulkArea.value.replace(/\s*[|:#\t,]\s*/g, '|'));
      els.bulkArea.value = '';
      importItems(items, 'Import');
    });

    var SAMPLE = [
      'ANDI|1', 'BUDI|2', 'CITRA|3', 'DEDE|4', 'EKA|5',
      'FARAH|6', 'GALIH|7', 'HANA|8'
    ];
    els.btnSample.addEventListener('click', function () {
      els.bulkArea.value = SAMPLE.join('\n');
      M.toast('Contoh dimasukkan, klik IMPORT', 'ok');
    });

    els.adminSearch.addEventListener('input', renderTable);

    /* ---------------- EXIM / RESET ---------------- */

    els.btnExport.addEventListener('click', function () {
      var s = M.getSettings();
      M.dbGetBackground().then(function (d) {
        if (s.backgroundType === 'url' && d && (s.backgroundValue || '').indexOf('data:') !== 0) {
          s.backgroundValue = d;
        }
        return M.dbGetLogo();
      }).then(function (lg) {
        if (lg && (s.logoUrl || '').indexOf('http') !== 0 && (s.logoUrl || '').indexOf('data:') !== 0) {
          s.logoUrl = lg;
        }
        var payload = {
          app: 'mega-undian', version: 1, exported: new Date().toISOString(),
          settings: s,
          participants: M.getParticipants(),
          history: M.getHistory()
        };
        var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'mega-undian-backup-' + new Date().toISOString().slice(0, 10) + '.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        M.toast('Data diexport (JSON)', 'ok');
      });
    });

    els.btnImportJson.addEventListener('click', function () { els.fileImport.click(); });
    els.fileImport.addEventListener('change', function () {
      var f = els.fileImport.files[0];
      if (!f) return;
      var rd = new FileReader();
      rd.onload = function (e) {
        try {
          var data = JSON.parse(e.target.result);
          if (data && Array.isArray(data.participants)) {
            if (data.settings && typeof data.settings === 'object') {
              if ((data.settings.backgroundValue || '').indexOf('data:') === 0 && data.settings.backgroundValue.length > 50000) {
                var bigUrl = data.settings.backgroundValue;
                data.settings.backgroundValue = '';
                M.dbSetBackground(bigUrl);
              }
              if ((data.settings.logoUrl || '').indexOf('data:') === 0 && data.settings.logoUrl.length > 5000) {
                var bigLogo = data.settings.logoUrl;
                data.settings.logoUrl = '';
                M.dbSetLogo(bigLogo);
              }
              M.saveSettings(data.settings);
            }
            M.saveParticipants(data.participants);
            M.saveHistory(Array.isArray(data.history) ? data.history : []);
            initSettings();
            M.applyBackground(M.getSettings());
            renderTable();
            cfgChanged();
            M.toast('Data berhasil diimport', 'ok');
          } else {
            M.toast('Format JSON tidak valid', 'error');
          }
        } catch (err) {
          M.toast('Gagal membaca file JSON', 'error');
        }
      };
      rd.readAsText(f);
    });

    els.btnResetWins.addEventListener('click', function () {
      if (!confirm('Reset SEMUA kemenangan? Semua peserta kembali aktif.')) return;
      var list = M.getParticipants();
      list.forEach(function (p) { p.won = false; delete p.wonAt; });
      M.saveParticipants(list);
      M.saveHistory([]);
      renderTable();
      cfgChanged();
      M.toast('Semua kemenangan direset', 'ok');
    });

    els.btnClearParts.addEventListener('click', function () {
      if (!confirm('Hapus SEMUA peserta? Data tidak bisa dikembalikan.')) return;
      M.saveParticipants([]);
      M.saveHistory([]);
      renderTable();
      cfgChanged();
      M.toast('Semua peserta dihapus', 'ok');
    });

    els.btnFactory.addEventListener('click', function () {
      if (!confirm('FACTORY RESET: hapus seluruh data (peserta, pengaturan, riwayat, gambar latar)?')) return;
      M.resetAll().then(function () {
        location.reload();
      });
    });
  }

  /* ---------------- POPUP ADMIN (tombol pensil) ---------------- */

  function wirePopup() {
    var apop = document.getElementById('adminModal');
    if (!apop) return;
    function open() { apop.classList.add('open'); }
    function close() { apop.classList.remove('open'); }
    var opener = document.getElementById('btnOpenAdmin');
    if (opener) opener.addEventListener('click', open);
    var closer = document.getElementById('btnCloseAdmin');
    if (closer) closer.addEventListener('click', close);
    apop.addEventListener('click', function (e) { if (e.target === apop) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  /* ---------------- INIT ---------------- */

  function init() {
    M.seedIfEmpty();
    M.initMatrix();
    M.applyBackground(M.getSettings());
    initSettings();
    renderTable();
    renderGenInfo();
    wire();
    wirePopup();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();