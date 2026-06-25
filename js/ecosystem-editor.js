/* ════════════════════════════════════════════════════════════════
   ECOSYSTEM MAP — POSITION EDITOR (dev placement tool)
   Extracted from sample-slide-10.html. Operates on the inline #mapSvg.
   Talks to the production map controller via window.EcoMap.
   ════════════════════════════════════════════════════════════════ */
(function () {
  const svg  = document.getElementById("mapSvg");
  if (!svg || !window.EcoMap) return;
  const LOCS = ["coastal","desert","defender","wadi"];
  const setState = (n,o) => window.EcoMap._setState(n,o);
  const collapseLines = sel => svg.querySelectorAll(sel).forEach(l => { l.style.strokeDashoffset = l.getTotalLength(); });
  // ── EDIT MODE ─────────────────────────────────────────────────────────
  const GROUPS = {
    /* Node positions — base coords baked into SVG; drag uses transform offset */
    'Nodes': [
      {id:'node-jj',       label:'Jebel Jais',  base:{x:754, y:188}},
      {id:'node-coastal',  label:'Coastal',     base:{x:118, y:428}},
      {id:'node-desert',   label:'Desert',      base:{x:348, y:408}},
      {id:'node-defender', label:'Defender',    base:{x:530, y:295}},
      {id:'node-wadi',     label:'Wadi Showka', base:{x:626, y:490}},
    ],
    /* Sub-line editor (location chosen via mini-tabs) */
    'Sub Lines': [],
    /* Line bezier control points */
    'Lines': [
      {id:'coastal-cp1',  label:'Coastal CP1'  }, {id:'coastal-cp2',  label:'Coastal CP2'  },
      {id:'desert-cp1',   label:'Desert CP1'   }, {id:'desert-cp2',   label:'Desert CP2'   },
      {id:'defender-cp1', label:'Defender CP1' }, {id:'defender-cp2', label:'Defender CP2' },
      {id:'wadi-cp1',     label:'Wadi CP1'     }, {id:'wadi-cp2',     label:'Wadi CP2'     },
    ],
    /* Icon popups — drag updates x/y attributes */
    'Icons': [
      {id:'icon-jj',       label:'Jebel Jais icon'},
      {id:'icon-coastal',  label:'Coastal icon'   },
      {id:'icon-desert',   label:'Desert icon'    },
      {id:'icon-defender', label:'Defender icon'  },
      {id:'icon-wadi',     label:'Wadi icon'      },
    ],
    /* Card groups — drag updates x/y attributes */
    'L1': [
      {id:'lcard-coastal',  label:'Coastal card' },
      {id:'lcard-desert',   label:'Desert card'  },
      {id:'lcard-defender', label:'Defender card'},
      {id:'lcard-wadi',     label:'Wadi card'    },
    ],
    'coastal':  [
      {id:'sc-c1',label:'Coastal Events'   }, {id:'sc-c2',label:'Island Exploration'},
      {id:'sc-c3',label:'Marine Adventure' }, {id:'sc-c4',label:'Coastal Discovery' },
    ],
    'desert': [
      {id:'sc-d1',label:'Heritage Exp.'   }, {id:'sc-d2',label:'Desert Exploration'},
      {id:'sc-d3',label:'Stargazing'      }, {id:'sc-d4',label:'Conservation Tour.'  },
    ],
    'defender': [
      {id:'sc-df1',label:'Defender Driving'}, {id:'sc-df2',label:'Corporate Exp.'   },
      {id:'sc-df3',label:'Training & Cert.'}, {id:'sc-df4',label:'Vehicle Launch'   },
    ],
    'wadi': [
      {id:'sc-w1',label:'Heritage Camp'  }, {id:'sc-w2',label:'Hiking & Trails'},
      {id:'sc-w3',label:'School Progs.'  }, {id:'sc-w4',label:'Wellness Retreats'},
    ],
  };

  // Snapshot original card + icon positions for reset
  const origPos = {};
  document.querySelectorAll('.loc-card, .act-card, .loc-icon').forEach(el => {
    if (el.id) origPos[el.id] = { x: el.getAttribute('x'), y: el.getAttribute('y') };
  });

  // Node transform offsets (dx, dy relative to baked-in base).
  // Initialised to the transforms already applied in the SVG so the
  // editor reports the true visual position of each node.
  const nodeOffsets = {
    'node-jj':       {dx:-117, dy:-8 },
    'node-coastal':  {dx: 228, dy:-345},
    'node-desert':   {dx:-50,  dy:-194},
    'node-defender': {dx:-355, dy:220},
    'node-wadi':     {dx:-462, dy: 82},
  };

  let editMode   = false;
  let editGroup  = 'Nodes';   // start on Nodes tab
  let dragging   = null;
  let dragId     = null;
  let dragOffset = {x:0, y:0};

  const editToggle = document.getElementById('editToggle');
  const editPanel  = document.getElementById('editPanel');
  const epList     = document.getElementById('epList');
  const epHelp     = document.getElementById('epHelp');

  const HELP = {
    'Nodes':    'Drag a node dot. Branch lines update live.',
    'Lines':     'Drag handle 1 (near JJ) or 2 (near location) to reshape each main curve.',
    'Sub Lines': 'Pick a location above, then drag numbered handles to reshape sub-curves.',
    'Icons':     'Drag an icon popup to reposition it.',
    'L1':        'Drag a Level-1 card. Use T/B/L/R to set which edge its sub-line connects to.',
    'coastal':   'Drag a sub-card. Use T/B/L/R to snap the sub-line to that card edge.',
    'desert':    'Drag a sub-card. Use T/B/L/R to snap the sub-line to that card edge.',
    'defender':  'Drag a sub-card. Use T/B/L/R to snap the sub-line to that card edge.',
    'wadi':      'Drag a sub-card. Use T/B/L/R to snap the sub-line to that card edge.',
  };

  /* Convert mouse event → SVG coordinate space */
  function svgPt(e) {
    const r = svg.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) / r.width  * 1000,
      y: (e.clientY - r.top)  / r.height * 620,
    };
  }

  /* Actual node position (base + current offset) */
  function getNodePos(id) {
    const item = GROUPS['Nodes'].find(i => i.id === id);
    const off  = nodeOffsets[id] || {dx:0, dy:0};
    return { x: item.base.x + off.dx, y: item.base.y + off.dy };
  }

  /* Line control points — match the baked-in SVG path values */
  const lineControls = {
    'coastal':  { cp1:{x:499,y: 69}, cp2:{x:432,y: 20} },
    'desert':   { cp1:{x:499,y:121}, cp2:{x:403,y:243} },
    'defender': { cp1:{x:378,y:248}, cp2:{x:392,y:510} },
    'wadi':     { cp1:{x:568,y:300}, cp2:{x:569,y:591} },
  };
  const origLineControls = JSON.parse(JSON.stringify(lineControls));

  function updateLinePath(loc) {
    const jj = getNodePos('node-jj');
    const n  = getNodePos('node-' + loc);
    const lc = lineControls[loc];
    const ln = document.getElementById('line-' + loc);
    if (!ln) return;
    ln.setAttribute('d', `M ${jj.x},${jj.y} C ${lc.cp1.x},${lc.cp1.y} ${lc.cp2.x},${lc.cp2.y} ${n.x},${n.y}`);
    const len = ln.getTotalLength();
    ln.style.strokeDasharray  = len;
    ln.style.strokeDashoffset = 0;
  }

  /* Redraw all main branch lines using current node + control-point positions */
  function updateBranchLines() { LOCS.forEach(loc => updateLinePath(loc)); }

  /* ── Line-handle overlay (Lines edit tab) ─────────────────────────── */
  const lineHandlesG = document.getElementById('lineHandles');
  const LC_COLORS = { coastal:'#4A9EC4', desert:'#B8903E', defender:'#9A7038', wadi:'#529052' };

  function svgNS(tag, attrs) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k,v));
    return el;
  }

  function renderLineHandles() {
    lineHandlesG.innerHTML = '';
    lineHandlesG.removeAttribute('style');
    LOCS.forEach(loc => {
      const jj  = getNodePos('node-jj');
      const n   = getNodePos('node-' + loc);
      const lc  = lineControls[loc];
      const col = LC_COLORS[loc];
      // Tangent guide lines: node → control point
      lineHandlesG.appendChild(svgNS('line', {
        id:'gl-'+loc+'-1', x1:jj.x, y1:jj.y, x2:lc.cp1.x, y2:lc.cp1.y,
        stroke:col, 'stroke-width':'.6', 'stroke-dasharray':'3 3', opacity:'.45',
      }));
      lineHandlesG.appendChild(svgNS('line', {
        id:'gl-'+loc+'-2', x1:n.x, y1:n.y, x2:lc.cp2.x, y2:lc.cp2.y,
        stroke:col, 'stroke-width':'.6', 'stroke-dasharray':'3 3', opacity:'.45',
      }));
      // Draggable control-point handles (cp1 solid border, cp2 dashed)
      [[lc.cp1,'cp1',false],[lc.cp2,'cp2',true]].forEach(([pt,cp,dashed]) => {
        const g = svgNS('g', {'data-loc':loc, 'data-cp':cp});
        g.classList.add('lh-handle');
        const ca = {cx:pt.x, cy:pt.y, r:8, fill:col, 'fill-opacity':'.22', stroke:col, 'stroke-width':'1.8'};
        if (dashed) ca['stroke-dasharray'] = '3 2';
        const circ = svgNS('circle', ca);
        const lbl  = svgNS('text', {
          x:pt.x, y:pt.y+3.5, 'text-anchor':'middle',
          'font-family':"'Inter',sans-serif", 'font-size':'7', 'font-weight':'600',
          fill:col, 'pointer-events':'none',
        });
        lbl.textContent = cp === 'cp1' ? '1' : '2';
        g.appendChild(circ); g.appendChild(lbl);
        lineHandlesG.appendChild(g);
      });
    });
  }

  function hideLineHandles() {
    lineHandlesG.innerHTML = '';
    lineHandlesG.style.display = 'none';
  }

  /* ── Sub-line control points (4 lines × 4 locations) ────────────── */
  const subLineControls = {
    coastal: [
      { cp1:{x:259,y:127}, cp2:{x:228,y: 97}, end:{x:177,y: 99} },
      { cp1:{x:383,y: 64}, cp2:{x:404,y:132}, end:{x:434,y:131} },
      { cp1:{x:293,y:162}, cp2:{x:372,y:290}, end:{x:287,y:323} },
      { cp1:{x:377,y:156}, cp2:{x:363,y:328}, end:{x:447,y:353} },
    ],
    desert: [
      { cp1:{x:263,y:142}, cp2:{x:208,y:117}, end:{x:169,y:106} },
      { cp1:{x:351,y:227}, cp2:{x:393,y:177}, end:{x:433,y:173} },
      { cp1:{x:281,y:285}, cp2:{x:292,y:336}, end:{x:358,y:344} },
      { cp1:{x:258,y:230}, cp2:{x:203,y:358}, end:{x:162,y:374} },
    ],
    defender: [
      { cp1:{x:176,y:450}, cp2:{x:175,y:400}, end:{x:152,y:366} },
      { cp1:{x:277,y:363}, cp2:{x:222,y:164}, end:{x:435,y:129} },
      { cp1:{x:220,y:515}, cp2:{x:265,y:515}, end:{x:303,y:510} },
      { cp1:{x:272,y:450}, cp2:{x:342,y:177}, end:{x:551,y:414} },
    ],
    wadi: [
      { cp1:{x:137,y:558}, cp2:{x:102,y:445}, end:{x: 75,y:431} },
      { cp1:{x:175,y:539}, cp2:{x:189,y:274}, end:{x:199,y:241} },
      { cp1:{x:212,y:564}, cp2:{x:194,y:404}, end:{x:253,y:403} },
      { cp1:{x:236,y:568}, cp2:{x:331,y:532}, end:{x:403,y:528} },
    ],
  };
  const origSubLineControls = JSON.parse(JSON.stringify(subLineControls));

  /* ── Connector-side snap ─────────────────────────────────────────── */
  let subLoc = 'coastal'; // active location in Sub Lines tab

  const SUB_CARD_MAP = {
    coastal:  ['sc-c1', 'sc-c2', 'sc-c3', 'sc-c4'],
    desert:   ['sc-d1', 'sc-d2', 'sc-d3', 'sc-d4'],
    defender: ['sc-df1','sc-df2','sc-df3','sc-df4'],
    wadi:     ['sc-w1', 'sc-w2', 'sc-w3', 'sc-w4'],
  };

  function getCardEdgeCenter(cardId, side) {
    const el = document.getElementById(cardId);
    if (!el) return null;
    const x = parseFloat(el.getAttribute('x')), y = parseFloat(el.getAttribute('y'));
    const w = parseFloat(el.getAttribute('width')), h = parseFloat(el.getAttribute('height'));
    if (side === 'top')    return {x: Math.round(x + w/2), y: Math.round(y)};
    if (side === 'bottom') return {x: Math.round(x + w/2), y: Math.round(y + h)};
    if (side === 'left')   return {x: Math.round(x),       y: Math.round(y + h/2)};
    if (side === 'right')  return {x: Math.round(x + w),   y: Math.round(y + h/2)};
    return null;
  }

  function detectSide(cardId, endPt) {
    const el = document.getElementById(cardId);
    if (!el) return 'top';
    const x = parseFloat(el.getAttribute('x')), y = parseFloat(el.getAttribute('y'));
    const w = parseFloat(el.getAttribute('width')), h = parseFloat(el.getAttribute('height'));
    return [
      {side:'top',    px:x+w/2, py:y},
      {side:'bottom', px:x+w/2, py:y+h},
      {side:'left',   px:x,     py:y+h/2},
      {side:'right',  px:x+w,   py:y+h/2},
    ].reduce((best, c) => {
      const d = Math.hypot(endPt.x - c.px, endPt.y - c.py);
      return d < best.d ? {side:c.side, d} : best;
    }, {side:'top', d:Infinity}).side;
  }

  // Auto-detect initial connector sides from current end points
  const connectorSides = {};
  LOCS.forEach(loc => {
    connectorSides[loc] = SUB_CARD_MAP[loc].map((cardId, idx) =>
      detectSide(cardId, subLineControls[loc][idx].end));
  });

  function updateSubLinePath(loc, idx) {
    const n  = getNodePos('node-' + loc);
    const sc = subLineControls[loc][idx];
    const ln = document.getElementById('sl-' + loc + '-' + idx);
    if (!ln) return;
    ln.setAttribute('d', `M ${n.x},${n.y} C ${sc.cp1.x},${sc.cp1.y} ${sc.cp2.x},${sc.cp2.y} ${sc.end.x},${sc.end.y}`);
    const len = ln.getTotalLength();
    ln.style.strokeDasharray  = len;
    ln.style.strokeDashoffset = 0;
  }

  function renderSubLineHandles(loc) {
    lineHandlesG.innerHTML = '';
    lineHandlesG.removeAttribute('style');
    const col = LC_COLORS[loc];
    subLineControls[loc].forEach((sc, idx) => {
      const n = getNodePos('node-' + loc);
      // Tangent guides: parent-node→cp1 and endpoint→cp2
      lineHandlesG.appendChild(svgNS('line', {
        id:'sgl-'+loc+'-'+idx+'-1', x1:n.x, y1:n.y, x2:sc.cp1.x, y2:sc.cp1.y,
        stroke:col, 'stroke-width':'.5', 'stroke-dasharray':'2 3', opacity:'.4',
      }));
      lineHandlesG.appendChild(svgNS('line', {
        id:'sgl-'+loc+'-'+idx+'-2', x1:sc.end.x, y1:sc.end.y, x2:sc.cp2.x, y2:sc.cp2.y,
        stroke:col, 'stroke-width':'.5', 'stroke-dasharray':'2 3', opacity:'.4',
      }));
      // Handles (cp1 solid, cp2 dashed) — labelled with line number
      [[sc.cp1,'cp1',false],[sc.cp2,'cp2',true]].forEach(([pt,cp,dashed]) => {
        const g = svgNS('g', {'data-type':'subline','data-loc':loc,'data-idx':String(idx),'data-cp':cp});
        g.classList.add('lh-handle');
        const ca = {cx:pt.x, cy:pt.y, r:6, fill:col, 'fill-opacity':'.25', stroke:col, 'stroke-width':'1.5'};
        if (dashed) ca['stroke-dasharray'] = '2 2';
        const circ = svgNS('circle', ca);
        const lbl  = svgNS('text', {
          x:pt.x, y:pt.y+2.5, 'text-anchor':'middle',
          'font-family':"'Inter',sans-serif", 'font-size':'6', 'font-weight':'600',
          fill:col, 'pointer-events':'none',
        });
        lbl.textContent = String(idx + 1);
        g.appendChild(circ); g.appendChild(lbl);
        lineHandlesG.appendChild(g);
      });
    });
  }

  /* Build the coordinate list in the panel */
  function buildPanel() {
    epList.innerHTML = '';
    if (epHelp) epHelp.textContent = HELP[editGroup] || '';

    // Sub Lines tab: show sub-line CPs for the active subLoc
    if (editGroup === 'Sub Lines') {
      subLineControls[subLoc].forEach((sc, idx) => {
        ['cp1','cp2'].forEach(cp => {
          const pt  = sc[cp];
          const id  = 'sl-' + subLoc + '-' + idx + '-' + cp;
          const row = document.createElement('div');
          row.className = 'ep-row';
          row.dataset.id = id;
          row.innerHTML = `<span class="ep-label">Line ${idx+1} ${cp.toUpperCase()}</span>
            <span class="ep-xy" id="xy-${id}">x=${pt.x} y=${pt.y}</span>`;
          epList.appendChild(row);
        });
      });
      return;
    }

    const sideKeys = ['top','bottom','left','right'];
    const sideLabels = {top:'T', bottom:'B', left:'L', right:'R'};

    GROUPS[editGroup].forEach((item, locIdx) => {
      const row = document.createElement('div');
      row.className = 'ep-row';
      row.dataset.id = item.id;
      let x, y;
      if (editGroup === 'Nodes') {
        const p = getNodePos(item.id);
        x = p.x; y = p.y;
      } else if (editGroup === 'Lines') {
        const parts = item.id.split('-cp');
        const pt = lineControls[parts[0]]['cp' + parts[1]];
        x = pt.x; y = pt.y;
      } else {
        const el = document.getElementById(item.id);
        if (!el) return;
        x = Math.round(parseFloat(el.getAttribute('x')));
        y = Math.round(parseFloat(el.getAttribute('y')));
      }

      // Connector side buttons for location sub-card tabs
      let sidesHtml = '';
      if (LOCS.includes(editGroup) && SUB_CARD_MAP[editGroup]) {
        const curSide = connectorSides[editGroup][locIdx];
        const btns = sideKeys.map(s =>
          `<button class="ep-side${s===curSide?' active':''}" data-card="${item.id}" data-idx="${locIdx}" data-side="${s}">${sideLabels[s]}</button>`
        ).join('');
        sidesHtml = `<span class="ep-sides">${btns}</span>`;
      }

      row.innerHTML =
        `<span class="ep-label">${item.label}</span>
         <span class="ep-xy" id="xy-${item.id}">x=${x} y=${y}</span>${sidesHtml}`;
      epList.appendChild(row);
    });
  }

  function refreshXY(id) {
    const el = document.getElementById(id);
    const xy = document.getElementById('xy-' + id);
    if (el && xy)
      xy.textContent =
        `x=${Math.round(parseFloat(el.getAttribute('x')))} y=${Math.round(parseFloat(el.getAttribute('y')))}`;
  }

  function refreshNodeXY(id) {
    const p  = getNodePos(id);
    const xy = document.getElementById('xy-' + id);
    if (xy) xy.textContent = `x=${p.x} y=${p.y}`;
  }

  /* Show/hide cards + icons for the active group */
  function showGroup(group) {
    document.querySelectorAll('.loc-card, .act-card, .loc-icon').forEach(el => {
      el.style.opacity      = '0';
      el.style.pointerEvents = 'none';
    });
    if (group !== 'Nodes') {
      GROUPS[group].forEach(item => {
        const el = document.getElementById(item.id);
        if (el) { el.style.opacity = '0.95'; el.style.pointerEvents = 'all'; }
      });
    }
  }

  function updateSubLoc(loc) {
    subLoc = loc;
    document.querySelectorAll('.ep-subtab').forEach(t =>
      t.classList.toggle('active', t.dataset.subloc === loc));
    svg.setAttribute('data-state', 'sub-' + loc);
    subLineControls[loc].forEach((_, idx) => updateSubLinePath(loc, idx));
    renderSubLineHandles(loc);
    buildPanel();
  }

  function setGroup(group) {
    // Collapse sub-lines only when leaving Sub Lines tab
    if (editGroup === 'Sub Lines') {
      collapseLines('.sub-line');
      svg.setAttribute('data-state', 'main');
    }
    editGroup = group;
    const sublocRow = document.getElementById('epSublocRow');
    sublocRow.classList.toggle('visible', group === 'Sub Lines');
    document.querySelectorAll('.ep-tab').forEach(t =>
      t.classList.toggle('active', t.dataset.group === group));
    showGroup(group);
    if (group === 'Lines') {
      renderLineHandles();
    } else if (group === 'Sub Lines') {
      updateSubLoc(subLoc);    // renders handles + sets sub-state
    } else {
      hideLineHandles();
      svg.setAttribute('data-state', 'main');
    }
    buildPanel();
  }

  function enterEdit() {
    editMode = true;
    window.EcoMap.setEditing(true);
    editToggle.classList.add('active');
    editToggle.textContent = '✓ Done editing';
    editPanel.classList.add('open');
    svg.setAttribute('data-edit', 'true');
    svg.appendChild(lineHandlesG); // move to end → renders above all other SVG content
    setState('main');
    setGroup(editGroup);
  }

  function exitEdit() {
    editMode = false;
    window.EcoMap.setEditing(false);
    editToggle.classList.remove('active');
    editToggle.textContent = '⟳ Edit positions';
    editPanel.classList.remove('open');
    svg.removeAttribute('data-edit');
    hideLineHandles();
    collapseLines('.sub-line');
    svg.setAttribute('data-state', window.EcoMap._state());
    document.querySelectorAll('.loc-card, .act-card, .loc-icon').forEach(el => {
      el.style.opacity = '';
      el.style.pointerEvents = '';
    });
  }

  editToggle.addEventListener('click', () => editMode ? exitEdit() : enterEdit());
  document.getElementById('editClose').addEventListener('click', exitEdit);

  document.getElementById('epTabs').addEventListener('click', e => {
    const tab = e.target.closest('.ep-tab');
    if (tab) setGroup(tab.dataset.group);
  });

  // Sub Lines location mini-tabs
  document.getElementById('epSublocRow').addEventListener('click', e => {
    const btn = e.target.closest('.ep-subtab');
    if (btn && editMode) updateSubLoc(btn.dataset.subloc);
  });

  // Connector side buttons on card rows — snap sub-line endpoint to chosen edge
  epList.addEventListener('click', e => {
    const btn = e.target.closest('.ep-side');
    if (!btn || !LOCS.includes(editGroup)) return;
    const loc    = editGroup;
    const idx    = parseInt(btn.dataset.idx);
    const side   = btn.dataset.side;
    connectorSides[loc][idx] = side;
    const newEnd = getCardEdgeCenter(btn.dataset.card, side);
    if (newEnd) {
      subLineControls[loc][idx].end = newEnd;
      updateSubLinePath(loc, idx);
      // Refresh endpoint guide line if Sub Lines editor is open for this loc
      const gl2 = document.getElementById('sgl-' + loc + '-' + idx + '-2');
      if (gl2) { gl2.setAttribute('x1', newEnd.x); gl2.setAttribute('y1', newEnd.y); }
    }
    buildPanel();
  });

  /* Copy positions to clipboard */
  document.getElementById('epCopy').addEventListener('click', function () {
    const lines = ['// ' + editGroup + ' positions'];
    if (editGroup === 'Nodes') {
      GROUPS['Nodes'].forEach(item => {
        const p = getNodePos(item.id);
        lines.push(`${item.id}: x=${p.x}, y=${p.y}`);
      });
    } else if (editGroup === 'Lines') {
      LOCS.forEach(loc => {
        const jj = getNodePos('node-jj');
        const n  = getNodePos('node-' + loc);
        const lc = lineControls[loc];
        lines.push(`line-${loc}: M ${jj.x},${jj.y} C ${lc.cp1.x},${lc.cp1.y} ${lc.cp2.x},${lc.cp2.y} ${n.x},${n.y}`);
      });
    } else if (editGroup === 'Sub Lines') {
      subLineControls[subLoc].forEach((sc, idx) => {
        const n = getNodePos('node-' + subLoc);
        lines.push(`sl-${subLoc}-${idx}: M ${n.x},${n.y} C ${sc.cp1.x},${sc.cp1.y} ${sc.cp2.x},${sc.cp2.y} ${sc.end.x},${sc.end.y}`);
      });
    } else {
      GROUPS[editGroup].forEach(item => {
        const el = document.getElementById(item.id);
        if (!el) return;
        lines.push(`${item.id}: x=${Math.round(parseFloat(el.getAttribute('x')))}, y=${Math.round(parseFloat(el.getAttribute('y')))}`);
      });
    }
    navigator.clipboard.writeText(lines.join('\n'))
      .then(() => {
        this.textContent = '✓ Copied!'; this.classList.add('ok');
        setTimeout(() => { this.textContent = 'Copy positions'; this.classList.remove('ok'); }, 1800);
      })
      .catch(() => alert(lines.join('\n')));
  });

  /* Reset group to originals */
  const initNodeOffsets = JSON.parse(JSON.stringify(nodeOffsets));
  document.getElementById('epReset').addEventListener('click', () => {
    if (editGroup === 'Nodes') {
      GROUPS['Nodes'].forEach(item => {
        nodeOffsets[item.id] = { ...initNodeOffsets[item.id] };
        const o = nodeOffsets[item.id];
        document.getElementById(item.id)?.setAttribute('transform', `translate(${o.dx},${o.dy})`);
      });
      updateBranchLines();
    } else if (editGroup === 'Lines') {
      LOCS.forEach(loc => {
        lineControls[loc] = JSON.parse(JSON.stringify(origLineControls[loc]));
        updateLinePath(loc);
      });
      renderLineHandles();
    } else if (editGroup === 'Sub Lines') {
      subLineControls[subLoc] = JSON.parse(JSON.stringify(origSubLineControls[subLoc]));
      subLineControls[subLoc].forEach((_, idx) => updateSubLinePath(subLoc, idx));
      // Re-detect connector sides for this location
      connectorSides[subLoc] = SUB_CARD_MAP[subLoc].map((cardId, idx) =>
        detectSide(cardId, subLineControls[subLoc][idx].end));
      renderSubLineHandles(subLoc);
    } else {
      GROUPS[editGroup].forEach(item => {
        const el  = document.getElementById(item.id);
        const ori = origPos[item.id];
        if (el && ori) { el.setAttribute('x', ori.x); el.setAttribute('y', ori.y); }
      });
    }
    buildPanel();
  });

  /* DRAG — mousedown: hit-test nodes (by distance) or cards (by bbox) */
  svg.addEventListener('mousedown', e => {
    if (!editMode) return;
    const pos = svgPt(e);

    if (editGroup === 'Nodes') {
      for (const item of GROUPS['Nodes']) {
        const np   = getNodePos(item.id);
        const dist = Math.hypot(pos.x - np.x, pos.y - np.y);
        if (dist < 38) {
          dragging   = document.getElementById(item.id);
          dragId     = item.id;
          dragOffset = { x: pos.x - np.x, y: pos.y - np.y };
          epList.querySelectorAll('.ep-row').forEach(r =>
            r.classList.toggle('dragging', r.dataset.id === dragId));
          e.stopPropagation(); e.preventDefault();
          break;
        }
      }
      return;
    }

    if (editGroup === 'Lines' || editGroup === 'Sub Lines') {
      const selector = editGroup === 'Lines' ? 'g[data-loc]:not([data-type])' : 'g[data-type="subline"]';
      for (const h of lineHandlesG.querySelectorAll(selector)) {
        const cx = parseFloat(h.querySelector('circle').getAttribute('cx'));
        const cy = parseFloat(h.querySelector('circle').getAttribute('cy'));
        if (Math.hypot(pos.x - cx, pos.y - cy) < 14) {
          dragging = h;
          dragId   = editGroup === 'Lines'
            ? h.dataset.loc + '-' + h.dataset.cp
            : 'sl-' + h.dataset.loc + '-' + h.dataset.idx + '-' + h.dataset.cp;
          dragOffset = {x: pos.x - cx, y: pos.y - cy};
          epList.querySelectorAll('.ep-row').forEach(r =>
            r.classList.toggle('dragging', r.dataset.id === dragId));
          e.stopPropagation(); e.preventDefault();
          break;
        }
      }
      return;
    }

    for (const item of GROUPS[editGroup]) {
      const card = document.getElementById(item.id);
      if (!card) continue;
      const cx = parseFloat(card.getAttribute('x'));
      const cy = parseFloat(card.getAttribute('y'));
      const cw = parseFloat(card.getAttribute('width'));
      const ch = parseFloat(card.getAttribute('height'));
      if (pos.x >= cx && pos.x <= cx + cw && pos.y >= cy && pos.y <= cy + ch) {
        dragging   = card;
        dragId     = item.id;
        dragOffset = { x: pos.x - cx, y: pos.y - cy };
        epList.querySelectorAll('.ep-row').forEach(r =>
          r.classList.toggle('dragging', r.dataset.id === dragId));
        e.stopPropagation(); e.preventDefault();
        break;
      }
    }
  });

  /* DRAG — mousemove */
  svg.addEventListener('mousemove', e => {
    if (!dragging) return;
    const pos = svgPt(e);

    if (editGroup === 'Nodes') {
      const item = GROUPS['Nodes'].find(i => i.id === dragId);
      if (!item) return;
      const dx = Math.round(pos.x - dragOffset.x - item.base.x);
      const dy = Math.round(pos.y - dragOffset.y - item.base.y);
      nodeOffsets[dragId] = {dx, dy};
      dragging.setAttribute('transform', `translate(${dx},${dy})`);
      updateBranchLines();
      refreshNodeXY(dragId);
      return;
    }

    if (editGroup === 'Lines') {
      const parts = dragId.split('-cp');
      const loc   = parts[0];
      const cp    = 'cp' + parts[1];
      const newX  = Math.round(pos.x - dragOffset.x);
      const newY  = Math.round(pos.y - dragOffset.y);
      lineControls[loc][cp] = {x:newX, y:newY};
      // Move handle circle + label together
      const circ = dragging.querySelector('circle');
      const lbl  = dragging.querySelector('text');
      circ.setAttribute('cx', newX); circ.setAttribute('cy', newY);
      lbl.setAttribute('x',  newX); lbl.setAttribute('y',  newY + 3.5);
      // Stretch the tangent guide line
      const gl = document.getElementById('gl-' + loc + '-' + (cp === 'cp1' ? '1' : '2'));
      if (gl) { gl.setAttribute('x2', newX); gl.setAttribute('y2', newY); }
      // Redraw bezier path live
      updateLinePath(loc);
      // Refresh coordinate readout in panel
      const xyEl = document.getElementById('xy-' + dragId);
      if (xyEl) xyEl.textContent = `x=${newX} y=${newY}`;
      return;
    }

    // Sub-line handle drag (Sub Lines tab only)
    if (editGroup === 'Sub Lines' && dragging.dataset && dragging.dataset.type === 'subline') {
      const loc  = dragging.dataset.loc;
      const idx  = parseInt(dragging.dataset.idx);
      const cp   = dragging.dataset.cp;
      const newX = Math.round(pos.x - dragOffset.x);
      const newY = Math.round(pos.y - dragOffset.y);
      subLineControls[loc][idx][cp] = {x:newX, y:newY};
      const circ = dragging.querySelector('circle');
      const lbl  = dragging.querySelector('text');
      circ.setAttribute('cx', newX); circ.setAttribute('cy', newY);
      if (lbl) { lbl.setAttribute('x', newX); lbl.setAttribute('y', newY + 2.5); }
      const gl = document.getElementById('sgl-' + loc + '-' + idx + '-' + (cp === 'cp1' ? '1' : '2'));
      if (gl) { gl.setAttribute('x2', newX); gl.setAttribute('y2', newY); }
      updateSubLinePath(loc, idx);
      const id   = 'sl-' + loc + '-' + idx + '-' + cp;
      const xyEl = document.getElementById('xy-' + id);
      if (xyEl) xyEl.textContent = `x=${newX} y=${newY}`;
      return;
    }

    dragging.setAttribute('x', Math.round(pos.x - dragOffset.x));
    dragging.setAttribute('y', Math.round(pos.y - dragOffset.y));
    refreshXY(dragId);
  });

  /* Prevent text selection while a handle is being dragged */
  document.addEventListener('selectstart', e => { if (dragging) e.preventDefault(); });

  function stopDrag() {
    if (dragging) {
      epList.querySelectorAll('.ep-row').forEach(r => r.classList.remove('dragging'));
      dragging = null; dragId = null;
    }
  }
  svg.addEventListener('mouseup',    stopDrag);
  svg.addEventListener('mouseleave', stopDrag);

  window.EcoMap.leaveEdit = function () { if (editMode) exitEdit(); };
})();
