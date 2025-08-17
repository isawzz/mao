
function DAGetTable(id) {
  if (isdef(id)) DA.tid = id;
  assertion(isdef(DA.tableDict), 'no tableDict');
  return DA.tableDict[DA.tid];
}
async function DAInit() {
  DA.backendURL = await getDA('phpUrl'); 
  let gamelist = DEV ? 'aristo bluff button96 ferro fishgame fritz huti lacuna nations setgame spotit wise' : 'setgame';
  DA.gamelist = gamelist = toWords(gamelist);
  DA.funcs = { setgame: setgame(), button96: button96() }; //implemented games!
  for (const gname of DA.gamelist) {
    if (isdef(DA.funcs[gname])) continue;
    DA.funcs[gname] = defaultGameFunc();
  }
  DA.evList = [];
  await loadAssetsStatic();
  globalKeyHandling();
}
function MGet() { return lookup(M, [...arguments]); }
function MGetGame(gamename) { return M.config.games[gamename]; }
function MGetGameColor(gamename) { return MGetGame(gamename).color; }
function MGetGameFriendly(gamename) { return MGetGame(gamename).friendly; }
function MGetGameOptions(gamename) { return MGetGame(gamename).options; }
function MGetGamePlayerOptions(gamename) { return MGetGame(gamename).ploptions; }
function MGetGamePlayerOptionsAsDict(gamename) { return valf(MGetGamePlayerOptions(gamename), {}); }
function MGetGameProp(prop) { return MGetGame(T.game)[prop]; }
function MGetTables() { return DA.tableDict; }
function MGetUser(uname) { return M.users[uname]; }
function MGetUserColor(uname) { return MGetUser(uname).color; }
function MGetUserOptionsForGame(name, gamename) { return lookup(M.users, [name, 'games', gamename]); }
function MTGetGameProp(prop) { return MGetGame(T.game)[prop]; }
function TGetGameOption(prop) { return lookup(T, ['options', prop]); }
function UGetName() { return U.name; }
function _INTERRUPT() {
  clearEvents();
}
function _calc_hex_col_array(rows, cols) {
  let colarr = [];
  let even = rows % 2 == 0;
  for (let i = 0; i < rows; i++) {
    colarr[i] = cols;
    if (even && i < (rows / 2) - 1) cols += 1;
    else if (even && i > rows / 2) cols -= 1;
    else if (!even && i < (rows - 1) / 2) cols += 1;
    else if (!even || i >= (rows - 1) / 2) cols -= 1;
  }
  return colarr;
}
function _drawPentagonAtCenter(parent, center, w, h, color = 'black') {
  const div = document.createElement('div');
  div.style.position = 'absolute';
  div.style.width = `${w}px`;
  div.style.height = `${h}px`;
  div.style.left = `${center.x - w / 2}px`;
  div.style.top = `${center.y - h / 2}px`;
  div.style.backgroundColor = color;
  div.style.clipPath = 'polygon(50% 0%, 100% 30%, 70% 100%, 30% 100%, 0% 30%)';
  parent.appendChild(div);
  return div;
}
function _showPaletteNames(dParent, colors) {
  let d1 = mDom(dParent, { padding: 10, gap: 4 }); mFlexWrap(d1);
  for (var c of colors) {
    let bg = c.hex;
    let html = `${c.name}`;
    let dmini = mDom(d1, { padding: 10, bg, fg: colorIdealText(bg) }, { html, class: 'colorbox', dataColor: bg });
  }
}
async function actionLoadAll() {
  let action = await mPhpGetFile('zdata/action.txt');
  DA.action = null;
  let actionLines = action.split('\n').filter(x => !isEmpty(x.trim()));
  let di = M.actions = { byKey: [], byDate: [], byHour: [], list: [] };
  for (const a of actionLines) {
    actionProcessLine(a, di);
  }
  return di;
}
function actionProcessLine(a, di) {
  let [key, rest] = a.split(':');
  let from = stringBefore(rest, '-');
  let to = stringAfter(rest, '-');
  if (isEmpty(to)) { DA.action = { a, key, from }; return; }
  [from, to] = [Number(from), Number(to)];
  let o = { key, from, to };
  addKeys(getDateTimeData(from, to), o);
  di.list.push(o);
  lookupAddToList(di.byKey, [key], o);
  lookupAddToList(di.byHour, [o.hour], o);
  lookupAddToList(di.byDate, [o.date], o);
}
async function actionSaveAll() {
}
function addAREA(id, o) {
  if (AREAS[id]) {
    error('AREAS ' + id + ' exists already!!! ');
    error(o);
    return;
  }
  AREAS[id] = o;
}
function addActionButton(row, action, handler, id) {
  return mAppend(row, mCreate('td')).innerHTML = hFunc(action, handler, id);
}
function addCities(container, grid, sideLength) {
  const cityMap = {};
  for (const row of grid) {
    for (const tile of row) {
      const { x, y, r, c } = tile;
      for (let i = 0; i < 6; i++) {
        const angle_deg = 60 * i - 30;
        const angle_rad = Math.PI / 180 * angle_deg;
        const cx = x + sideLength * Math.cos(angle_rad);
        const cy = y + sideLength * Math.sin(angle_rad);
        let rowIndex = r;
        let colIndex = c;
        if (i === 2 || i === 3) rowIndex += 1;
        if (i === 3 || i === 4 || i === 5) colIndex -= 1;
        addCity(cityMap, container, rowIndex, colIndex, 0 - 10, 0 - 10);
        return;
      }
      return;
    }
  }
  return cityMap;
}
function addCity(cityMap, container, r, c, x, y, padding = 0) {
  const key = `${r}_${c}`;
  if (cityMap[key]) return;
  const city = document.createElement('div');
  city.className = 'city';
  city.style.position = 'absolute';
  let sz = 30;
  city.style.width = `${sz}px`;
  city.style.height = `${sz}px`;
  city.style.borderRadius = '50%';
  city.style.background = 'green';
  x -= padding;
  y -= padding;
  city.style.left = `${x - sz / 2}px`;
  city.style.top = `${y - sz / 2}px`;
  container.appendChild(city);
  cityMap[key] = { div: city, x, y, r, c };
}
function addDummy(dParent, place) {
  let b = mButton('', null, dParent, { opacity: 0, h: 0, w: 0, padding: 0, margin: 0, outline: 'none', border: 'none', bg: 'transparent' });
  if (isdef(place)) mPlace(b, place);
  b.id = 'dummy';
}
function addEditable(dParent, styles = {}, opts = {}) {
  addKeys({ tag: 'input', classes: 'plain' }, opts)
  addKeys({ wmax: '90%', box: true }, styles);
  let x = mDom(dParent, styles, opts);
  x.focus();
  x.addEventListener('keyup', ev => {
    if (ev.key == 'Enter') {
      mDummyFocus();
      if (isdef(opts.onEnter)) opts.onEnter(ev)
    }
  });
  return x;
}
function addIf(arr, el) { if (!arr.includes(el)) arr.push(el); }
function addKeys(ofrom, oto) { for (const k in ofrom) if (!oto.hasOwnProperty(k)) oto[k] = ofrom[k]; return oto; }
function addPeepToCrowd() {
  const peep = removeRandomFromArray(availablePeeps)
  const walk = getRandomFromArray(walks)({
    peep,
    props: resetPeep({
      peep,
      stage,
    })
  }).eventCallback('onComplete', () => {
    removePeepFromCrowd(peep)
    addPeepToCrowd()
  })
  peep.walk = walk
  crowd.push(peep)
  crowd.sort((a, b) => a.anchorY - b.anchorY)
  return peep
}
function addPolygonEvents(groupElement, onClickHandler, onEnterHandler, onLeaveHandler) {
  if (!groupElement || !(groupElement instanceof SVGGElement)) {
    console.error("Invalid group element provided.");
    return;
  }
  const polygons = groupElement.querySelectorAll('polygon');
  polygons.forEach(polygon => {
    if (onClickHandler) { polygon.addEventListener('click', onClickHandler); }
    if (onEnterHandler) { polygon.addEventListener('mouseenter', onEnterHandler); }
    if (onLeaveHandler) { polygon.addEventListener('mouseleave', onLeaveHandler); }
  });
}
function addPolygonNeighborClick(groupElement, fillColor = 'yellow') {
  if (!groupElement || !(groupElement instanceof SVGGElement)) {
    console.error("Invalid group element.");
    return;
  }
  const polygons = groupElement.querySelectorAll('polygon');
  polygons.forEach(polygon => {
    polygon.addEventListener('click', () => {
      const neighbors = polygon.dataset.neighbors?.split(',') || [];
      neighbors.forEach(id => {
        const neighbor = document.getElementById(id.trim());
        console.log('neighbor', neighbor);
        if (neighbor) {
          neighbor.style.fill = fillColor;
        }
      });
    });
  });
}
function addToolX(cropper, d) {
  let img = cropper.img;
  function createCropTool() {
    let rg = mRadioGroup(d, {}, 'rSizes', 'Select crop area: '); mClass(rg, 'input');
    let handler = cropper.setSize;
    mRadio('manual', [0, 0], 'rSizes', rg, {}, handler, 'rSizes', true)
    let [w, h] = [img.offsetWidth, img.offsetHeight];
    if (w >= 128 && h >= 128) mRadio('128 x 128 (emo)', [128, 128], 'rSizes', rg, {}, handler, 'rSizes', false)
    if (w >= 200 && h >= 200) mRadio('200 x 200 (small)', [200, 200], 'rSizes', rg, {}, handler, 'rSizes', false)
    if (w >= 300 && h >= 300) mRadio('300 x 300 (medium)', [300, 300], 'rSizes', rg, {}, handler, 'rSizes', false)
    if (w >= 400 && h >= 400) mRadio('400 x 400 (large)', [400, 400], 'rSizes', rg, {}, handler, 'rSizes', false)
    if (w >= 500 && h >= 500) mRadio('500 x 500 (xlarge)', [500, 500], 'rSizes', rg, {}, handler, 'rSizes', false)
    if (w >= 140 && h >= 200) mRadio('140 x 200 (card)', [140, 200], 'rSizes', rg, {}, handler, 'rSizes', false)
    else {
      let [w1, h1] = [w, w / .7];
      let [w2, h2] = [h * .7, h];
      if (w1 < w2) mRadio(`${w1} x ${h1} (card)`, [w1, h1], 'rSizes', rg, {}, handler, 'rSizes', false)
      else mRadio(`${w2} x ${h2} (card)`, [w2, h2], 'rSizes', rg, {}, handler, 'rSizes', false)
    }
    if (w >= 200 && h >= 140) mRadio('200 x 140 (landscape)', [200, 140], 'rSizes', rg, {}, handler, 'rSizes', false)
    else {
      let [w1, h1] = [w, w * .7];
      let [w2, h2] = [h / .7, h];
      if (w1 < w2) mRadio(`${w1} x ${h1} (landscape)`, [w1, h1], 'rSizes', rg, {}, handler, 'rSizes', false)
      else mRadio(`${w2} x ${h2} (landscape)`, [w2, h2], 'rSizes', rg, {}, handler, 'rSizes', false)
    }
    mDom(rg, { fz: 14, margin: 12 }, { html: '(or use mouse to select)' });
    return rg;
  }
  function createSquareTool() {
    let rg = mRadioGroup(d, {}, 'rSquare', 'Resize (cropped area) to height: '); mClass(rg, 'input');
    let handler = x => squareTo(cropper, x);
    mRadio(`${'just crop'}`, 0, 'rSquare', rg, {}, cropper.crop, 'rSquare', false)
    for (const h of [128, 200, 300, 400, 500, 600, 700, 800]) {
      mRadio(`${h}`, h, 'rSquare', rg, {}, handler, 'rSquare', false)
    }
    return rg;
  }
  let rgCrop = createCropTool();
  let rgResize = createSquareTool();
}
function add_face_indices_to_svg(svg, face_list, vert_list) {
  const polygons = Array.from(svg.querySelectorAll('polygon'));
  function normalize_coords(coords) {
    return coords.map(([x, y]) => `${x.toFixed(6)},${y.toFixed(6)}`).join(' ');
  }
  const face_coords_map = face_list.map((face) => {
    const coords = face.map(i => vert_list[i].slice(0, 2));
    return normalize_coords(coords);
  });
  polygons.forEach(polygon => {
    const pointsAttr = polygon.getAttribute('points').trim();
    const points = pointsAttr.split(/\s+/).map(pt => pt.split(',').map(Number));
    const norm = normalize_coords(points);
    const face_index = face_coords_map.findIndex(f => f === norm);
    if (face_index !== -1) {
      polygon.setAttribute('data-face-index', face_index);
    } else {
      console.warn('Polygon did not match any face in face_list:', norm);
    }
  });
}
function adjustComplex(panData) {
  let [x0, y0] = [panData.posStart.x, panData.posStart.y];
  let [dx, dy] = [panData.mouse.x - panData.mouseStart.x, panData.mouse.y - panData.mouseStart.y];
  let [wImg, hImg] = [panData.img.width, panData.img.height];
  let ideal = panData.cropStartSize.w;
  let [cx0, cy0] = [panData.cropStartPos.l + ideal / 2, panData.cropStartPos.t + ideal / 2];
  let [cx, cy] = [cx0 + dx, cy0 + dy];
  cx = clamp(cx, ideal / 2, wImg - ideal / 2); cy = clamp(cy, ideal / 2, hImg - ideal / 2);
  let lNew = clamp(cx - ideal / 2, 0, wImg);
  let tNew = clamp(cy - ideal / 2, 0, hImg);
  let rNew = clamp(cx + ideal / 2, 0, wImg);
  let bNew = clamp(cy + ideal / 2, 0, hImg);
  let wNew = Math.min(Math.abs(cx - lNew) * 2, Math.abs(rNew - cx) * 2);
  let hNew = Math.min(Math.abs(cy - tNew) * 2, Math.abs(bNew - cy) * 2);
  mStyle(panData.dCrop, { left: cx - wNew / 2, top: cy - hNew / 2, w: wNew, h: hNew });
}
function adjustCropper(img, dc, sz) {
  let [w, h] = [img.width, img.height]; console.log('sz', w, h,)
  let [cx, cy, radx, rady, rad] = [w / 2, h / 2, sz / 2, sz / 2, sz / 2];
  mStyle(dc, { left: cx - radx, top: cy - rady, w: sz, h: sz });
}
function adjustCropperBy(dc, x, y, dx, dy, wImg, hImg, szIdeal) {
  console.log('_________\ndx', dx, 'dy', dy)
  if (nundef(wImg)) {
    mStyle(dc, { left: x + dx, top: y + dy }); //,w:sz,h:sz});
    return;
  }
  console.log('image sz', wImg, hImg)
  let [l, t, w, h] = [mGetStyle(dc, 'left'), mGetStyle(dc, 'top'), mGetStyle(dc, 'w'), mGetStyle(dc, 'h')]; console.log('dims', l, t, w, h);
  let [cx, cy] = [l + w / 2, t + h / 2];
  let [cxNew, cyNew] = [cx + dx, cy + dy]; console.log('new center', cxNew, cyNew)
  let newDist = Math.min(cxNew, cyNew, wImg - cxNew, hImg - cyNew); console.log('newDist', newDist)
  let wNew = Math.min(szIdeal, newDist * 2);
  let hNew = Math.min(szIdeal, newDist * 2);
  let xNew = cxNew - wNew / 2;
  let yNew = cyNew - hNew / 2;
  mStyle(dc, { left: xNew, top: yNew, w: wNew, h: hNew }); //,w:sz,h:sz});
}
function adjustCropperBySimple(dc, x, y, dx, dy) { mStyle(dc, { left: x + dx, top: y + dy }); }
function agColoredShape(g, shape, w, h, color) {
  SHAPEFUNCS[shape](g, w, h);
  gBg(g, color);
}
function aktivateUpDownIffSelected() {
  let b = toElem('dMoveUp'); console.log(b);
  if (isEmpty(DA.selectedPart)) { mClass('dMoveUp', 'disabled'); mClass('dMoveDown', 'disabled'); return; }
  mClassRemove('dMoveUp', 'disabled');
  mClassRemove('dMoveDown', 'disabled');
}
function allCondDict(d, func) {
  let res = [];
  for (const k in d) { if (func(d[k])) res.push(k); }
  return res;
}
function allElementsFromPoint(x, y) {
  var element, elements = [];
  var old_visibility = [];
  while (true) {
    element = document.elementFromPoint(x, y);
    if (!element || element === document.documentElement) {
      break;
    }
    elements.push(element);
    old_visibility.push(element.style.visibility);
    element.style.visibility = 'hidden';
  }
  for (var k = 0; k < elements.length; k++) {
    elements[k].style.visibility = old_visibility[k];
  }
  elements.reverse();
  return elements;
}
function allIntegers(s) {
  return s.match(/\d+\.\d+|\d+\b|\d+(?=\w)/g).map(v => {
    return +v;
  });
}
function allNumbers(s) {
  let m = s.match(/\-.\d+|\-\d+|\.\d+|\d+\.\d+|\d+\b|\d+(?=\w)/g);
  if (m) return m.map(v => Number(v)); else return [];
}
function allPlToPlayer(name) {
  let allPl = DA.allPlayers[name];
  return jsCopyExceptKeys(allPl, ['div', 'isSelected']);
}
function alphaToHex(a01) {
  a01 = Math.round(a01 * 100) / 100;
  var alpha = Math.round(a01 * 255);
  var hex = (alpha + 0x10000).toString(16).slice(-2).toUpperCase();
  return hex;
}
function amIHuman(table) { return isPlayerHuman(table, UGetName()); }
function animateEndpointsOfActivatedLines() {
  function potentialSelectedPoint(p, l) {
    let d = iDiv(p);
    mClass(d, 'pulseFastInfinite');
    d.style.zIndex = 1000;
    mStyle(d, { cursor: 'pointer' });
    d.onclick = ev => lacunaSelectPointNeu(p, l);
    addIf(B.endPoints, p.id);
  }
  for (const l of B.lines) {
    iDiv(l).style.zIndex = 0;
  }
  for (const l of B.linesActivated) {
    B.possiblePairs.push(l);
    potentialSelectedPoint(l.p1, l);
    potentialSelectedPoint(l.p2, l);
  }
}
function animateMouseTo(elem, callback) {
  let cursor = document.getElementById('fake-cursor');
  if (!cursor) {
    cursor = document.createElement('div');
    cursor.id = 'fake-cursor';
    Object.assign(cursor.style, {
      position: 'fixed',
      width: '15px',
      height: '15px',
      background: 'lime',
      borderRadius: '50%',
      pointerEvents: 'none',
      zIndex: 9999,
      left: '0px',
      top: '0px',
      transition: 'left 1s ease, top 1s ease'
    });
    document.body.appendChild(cursor);
  }
  const rect = elem.getBoundingClientRect();
  const targetX = rect.left + rect.width / 2 - 10;
  const targetY = rect.top + rect.height / 2 - 10;
  requestAnimationFrame(() => {
    cursor.style.left = `${targetX}px`;
    cursor.style.top = `${targetY}px`;
  });
  setTimeout(callback, 2000);
}
function animatedTitle(msg = 'DU BIST DRAN!!!!!') {
  TO.titleInterval = setInterval(() => {
    let idx = WhichCorner++ % CORNERS_BGA.length;
    let corner = CORNERS_BGA[idx];
    document.title = `${corner} ${msg}`; //'⌞&amp;21543;    U+231E \0xE2Fo\u0027o Bar';
  }, 1000);
}
function annotate(sp) {
  for (const k in sp) {
    let node = sp[k];
    node.pool = [];
    let pool = makePool(node);
    for (const oid in pool) {
      let o = pool[oid];
      if (!evalCond(o, node)) continue;
      if (nundef(o.RSG)) o.RSG = {};
      let rsg = o.RSG;
      rsg[k] = true;
      node.pool.push(oid);
    }
  }
}
async function api(method, endpoint, body = null) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : null
    });
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    const data = await response.json();
    console.log("API response:", data);
    return data;
  } catch (error) {
    console.error("API error:", error);
    alert(`API error: ${error.message}`);
    return null;
  }
}
function applyOpts(d, opts = {}) {
  const aliases = {
    classes: 'className',
    inner: 'innerHTML',
    html: 'innerHTML',
    w: 'width',
    h: 'height',
  };
  for (const opt in opts) {
    let name = valf(aliases[opt], opt), val = opts[opt];
    if (name == 'recClick') { d.onclick = async (ev) => { recUserEvent(); await val(ev); } }
    else if (['style', 'tag', 'innerHTML', 'className', 'checked', 'value'].includes(name) || name.startsWith('on')) d[name] = val;
    else d.setAttribute(name, val);
  }
}
function arrAllSameOrDifferent(arr) {
  if (arr.length === 0) {
    return true;
  }
  const allSame = arr.every(element => element === arr[0]);
  if (allSame) {
    return true;
  }
  const uniqueElements = new Set(arr);
  const allDifferent = uniqueElements.size === arr.length;
  return allDifferent;
}
function arrAverage(arr, prop) {
  if (isDict(arr)) arr = Object.values(arr);
  let n = arr.length; if (!n) return 0;
  let sum = arrSum(arr, prop);
  return sum / n;
}
function arrBalancedAverage(arr, prop) {
  if (arr.length != 2) return arrAverage(arr, prop);
  let o = arrMinMax(arr, x => x[prop]);
  let [min, max] = [o.min, o.max];
  if (max < min * 1000) return (min + max) / 2;
  let s = '' + max; //console.log('smax',s)
  let snew = '';
  for (let i = 0; i < s.length; i++) {
    let ch = s[i];
    if (ch == '0' || ch == '.') snew += ch; else snew += '1';
  }
  let nnew = Number(snew);
  return (min + nnew) / 2;
}
function arrChildren(elem) { return [...toElem(elem).children]; }
function arrClear(arr) { arr.length = 0; return arr; }
function arrCycle(arr, count) { return arrRotate(arr, count); }
function arrDisjoint(ad1, ad2, prop) {
  console.log(isDict(ad1), isDict(ad2))
  if (isDict(ad1) && isDict(ad2)) return Object.keys(ad1).find(x => x in ad2);
  else return ad1.map(x => x[prop]).find(el => ad2.map(x => x[prop]) == el);
}
function arrFindKeywordFromIndex(keywords, words, iStart) {
  for (let i = iStart; i < words.length; i++) {
    let w = words[i];
    if (keywords.some(x => x == w)) return { i, w };
  }
  return null;
}
function arrFlatten(arr) {
  let res = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[i].length; j++) {
      res.push(arr[i][j]);
    }
  }
  return res;
}
function arrGen(n, min, max) {
  let arr = [];
  for (const i of range(1, n)) arr.push(rNumber(min, max));
  return arr;
}
function arrLast(arr) { return arr.length > 0 ? arr[arr.length - 1] : null; }
function arrMax(arr, f) { return arrMinMax(arr, f).max; }
function arrMaxContiguous(arr) {
  let cnt = 0, el = arr[0], max = 0;
  for (let i = 0; i < arr.length; i++) {
    let a = arr[i];
    if (a == el) cnt++;
    else {
      el = a;
      if (cnt > max) max = cnt;
      cnt = 1;
    }
  }
  return max;
}
function arrMinMax(arr, func) {
  if (nundef(func)) func = x => x;
  else if (isString(func)) { let val = func; func = x => x[val]; }
  let min = func(arr[0]), max = func(arr[0]), imin = 0, imax = 0;
  for (let i = 1, len = arr.length; i < len; i++) {
    let v = func(arr[i]);
    if (v < min) {
      min = v; imin = i;
    } else if (v > max) {
      max = v; imax = i;
    }
  }
  return { min: min, imin: imin, max: max, imax: imax, elmin: arr[imin], elmax: arr[imax] };
}
function arrMinus(arr, b) {
  if (isList(arr)) {
    if (isList(b)) return arr.filter(x => !b.includes(x)); else return arr.filter(x => x != b);
  } else {
    let dinew = {};
    let keys = isList(b) ? Object.keys(arr).filter(x => !b.includes(x)) : Object.keys(arr).filter(x => x != b);
    for (const k of keys) dinew[k] = arr[k];
    return dinew;
  }
}
function arrNext(list, el) {
  let iturn = list.indexOf(el);
  let elnext = list[(iturn + 1) % list.length];
  return elnext;
}
function arrNoDuplicates(arr) { return [...new Set(arr)]; }
function arrPlus(arr, b) {
  if (isList(arr)) {
    if (isList(b)) return arr.concat(b); else return arr.concat([b]);
  } else return dictMerge(b, arr);
}
function arrRange(from = 1, to = 10, step = 1) { let res = []; for (let i = from; i <= to; i += step)res.push(i); return res; }
function arrRemoveDuplicates(arr) { return Array.from(new Set(arr)); }
function arrRemovip(arr, el) {
  let i = arr.indexOf(el);
  if (i > -1) arr.splice(i, 1);
  return i;
}
function arrReplace1(arr, elweg, eldazu) {
  let i = arr.indexOf(elweg);
  arr[i] = eldazu;
  return arr;
}
function arrRotate(arr, count) {
  var unshift = Array.prototype.unshift,
    splice = Array.prototype.splice;
  var len = arr.length >>> 0, count = count >> 0;
  let arr1 = jsCopy(arr);
  unshift.apply(arr1, splice.call(arr1, count % len, len));
  return arr1;
}
function arrShuffle(arr) { if (isEmpty(arr)) return []; else return fisherYates(arr); }
function arrSort(arr, caseSensitive = true) {
  return arr.sort((a, b) => {
    const aStr = a.toString();
    const bStr = b.toString();
    return aStr.localeCompare(bStr, undefined, { numeric: true, sensitivity: caseSensitive ? 'case' : 'base' });
  });
}
function arrSum(arr, props) {
  if (nundef(props)) return arr.reduce((a, b) => a + b);
  if (!isList(props)) props = [props];
  return arr.reduce((a, b) => a + (lookup(b, props) || 0), 0);
}
function arrTake(arr, n = 0, from = 0) {
  if (isDict(arr)) {
    let keys = Object.keys(arr);
    return n > 0 ? keys.slice(from, from + n).map(x => (arr[x])) : keys.slice(from).map(x => (arr[x]));
  } else return n > 0 ? arr.slice(from, from + n) : arr.slice(from);
}
function arrTakeFromTo(arr, a, b) { return takeFromTo(arr, a, b); }
function arrTakeWhile(arr, func) {
  let res = [];
  for (const a of arr) {
    if (func(a)) res.push(a); else break;
  }
  return res;
}
function arrToCount(arr) {
  let res = []
  let x = arr[0], cnt = 0;
  for (i of range(0, arr.length)) {
    let a = arr[i];
    if (a == x) cnt++
    else {
      res.push({ n: x, cnt });
      x = a;
      cnt = 1;
    }
  }
  return res;
}
function arrWithout(arr, b) { return arrMinus(arr, b); }
function assertion(cond) {
  if (!cond) {
    let args = [...arguments];
    for (const a of args) {
      console.log('\n', a);
    }
    throw new Error('TERMINATING!!!')
  }
}
function bgImageFromPath(path) { return isdef(path) ? `url('${path}')` : null; }
async function blogSaveAll() {
  function replaceDivs(str) {
    return str.replaceAll('<div>', '<br>').replaceAll('</div>', '');
  }
  let blog = DA.blogs;
  let list = dict2list(blog);
  for (const bl of list) {
    let d = bl.dParts;
    let chi = arrChildren(d);
    let parts = [];
    let prevType = null;
    let prevText = null;
    for (const ch of chi) {
      let type = ch.getAttribute('type'); //console.log(type,ch)
      if (type == 'text') {
        let txt = ch.innerHTML;
        txt = replaceDivs(txt);
        if (isdef(prevText)) txt = prevText + '<br>' + txt;
        prevType = 'text';
        prevText = txt;
      } else {
        if (isdef(prevText)) { parts.push(prevText); prevText = null; }
        prevType = type;
        if (type == 'image') {
          parts.push(ch.src);
        } else if (!type) {
          console.log('need to save image data', ch)
          saveBase64Image(ch, 'img1.jpg');
        }
      }
    }
    bl.parts = parts;
  }
  let di = {};
  for (const el of list) {
    di[el.key] = { title: el.o.title, text: el.parts };
  }
  let text = jsyaml.dump(di);
  let res = await mPhpPostFile(text, 'zdata/blog1.yaml');
  return res;
}
function blogShow(d, key, o) {
  let dBlog = mDom(d, { fz: 20, className: 'collapsible' }, { key });
  mDom(dBlog, { className: 'title' }, { html: `${key}: ${o.title}` });
  let dParts = mDom(dBlog, { className: 'sortable' });
  let blogItem = { o, key, div: dBlog, dParts, items: [] }
  for (let textPart of o.text) {
    let d2, type;
    if (textPart.includes('blogimages/')) {
      type = 'image'
      d2 = mDom(dParts, { w100: true }, { tag: 'img', src: textPart, type });
    } else {
      type = 'text'
      d2 = mDom(dParts, { caret: 'white', padding: 2, outline: '' }, { html: textPart, contenteditable: true, type });
    }
    let item = { key, text: textPart, div: d2, type };
    blogItem.items.push(item);
  }
  mDom(dParts, { patop: 5, pabottom: 2 }, { html: '<hr>', type: 'line' });
  return blogItem;
}
function blogShowAll(d, blog) {
  let dates = Object.keys(blog);
  dates.sort((a, b) => new Date(b) - new Date(a));
  let di = {};
  for (const date of dates) {
    di[date] = blogShow(d, date, blog[date]);
  }
  return di;
}
function button96() {
  function setup(table) {
    let fen = {};
    for (const name in table.players) {
      let pl = table.players[name];
      pl.score = 0;
    }
    fen.cards = [1, 2, 3];
    fen.deck = range(4, table.options.numCards);
    table.plorder = jsCopy(table.playerNames);
    table.turn = jsCopy(table.playerNames);
    return fen;
  }
  function prepLayout(table) { presentStandardRoundTable(table); }
  async function stats(table) {
    let [me, players] = [getUname(), table.players];
    let style = { patop: 8, mabottom: 20, wmin: 80, bg: 'beige', fg: 'contrast' };
    let player_stat_items = uiTypePlayerStats(table, me, 'dStats', 'rowflex', style)
    for (const plname in players) {
      let pl = players[plname];
      let item = player_stat_items[plname];
      if (pl.playmode == 'bot') { mStyle(item.img, { rounding: 0 }); }
      let d = iDiv(item);
      playerStatCount('star', pl.score, d); //, {}, {id:`stat_${plname}_score`});
    }
  }
  function present(table) {
    let fen = table.fen;
    mStyle('dTable', { padding: 25, w: 400, h: 400 });
    let d = mDom('dTable', { gap: 10, padding: 0 }); //mCenterFlex(d);
    let items = [];
    for (const card of fen.cards) {
      let item = cNumber(card);
      mAppend(d, iDiv(item));
      items.push(item);
    }
    return items;
  }
  async function activate(table, items) {
    await showInstructionStandard(table, 'must click a card'); //browser tab and instruction if any
    if (!isMyTurn(table)) { return; }
    for (const item of items) {
      let d = iDiv(item);
      mStyle(d, { cursor: 'pointer' });
      d.onclick = ev => onclickCard(table, item, items);
    }
    if (isEmpty(table.fen.cards)) return gameoverScore(table);
    if (amIHuman(table) && table.options.gamemode == 'multi') return;
    let name = amIHuman(table) && table.options.gamemode == 'solo' ? someOtherPlayerName(table) : getUname();
    if (nundef(name)) return;
    await botMove(name, table, items);
  }
  async function botMove(name, table, items) {
    let ms = rChoose(range(2000, 5000));
    TO.bot = setTimeout(async () => {
      let item = rChoose(items);
      toggleItemSelection(item);
      TO.bot1 = setTimeout(async () => await evalMove(name, table, item.key), 500);
    }, rNumber(ms, ms + 2000));
  }
  async function onclickCard(table, item, items) {
    toggleItemSelection(item);
    try { await mSleep(200); } catch (err) { return; }
    await evalMove(getUname(), table, item.key);
  }
  async function evalMove(name, table, key) {
    clearEvents();
    mShield('dTable', { bg: 'transparent' });
    let id = table.id;
    let step = table.step;
    let best = arrMinMax(table.fen.cards).min;
    let succeed = key == best;
    if (succeed) {
      table.players[name].score += 1;
      let fen = table.fen;
      let newCards = deckDeal(fen.deck, 1);
      if (newCards.length > 0) arrReplace1(fen.cards, key, newCards[0]); else removeInPlace(fen.cards, key);
    } else {
      table.players[name].score -= 1;
    }
    lookupAddToList(table, ['moves'], { step, name, move: key, change: succeed ? '+1' : '-1', score: table.players[name].score });
    let o = { id, name, step, table };
    if (succeed) o.stepIfValid = step + 1;
    let res = await mPostRoute('table', o);
  }
  return { prepLayout, setup, present, stats, activate };
}
function buyProgressCard(ev) {
  let o = evToAttrElem(ev, 'key');
  console.log('player buys', o.val);
  o.elem.remove();
  let spot = M.selectedCivSpot
  if (isdef(spot)) {
    spot.innerHTML = '';
    let [w, h] = [mGetStyle(spot, 'w'), mGetStyle(spot, 'h')];
    mAppend(spot, o.elem);
    mStyle(o.elem, { h: h, w: w });
    o.elem.onclick = () => selectCivSpot(spot)
    mClassRemove(M.selectedCivSpot, 'shadow');
    M.selectedCivSpot = null;
  }
}
function cBlank(dParent, styles = {}, opts = {}) {
  if (nundef(styles.h)) styles.h = valf(styles.sz, 100);
  if (nundef(styles.w)) styles.w = styles.h * .7;
  if (nundef(styles.bg)) styles.bg = 'white';
  styles.position = 'relative';
  if (nundef(styles.rounding)) styles.rounding = Math.min(styles.w, styles.h) / 21;
  addKeys({ className: 'card' }, opts);
  let d = mDom(dParent, styles, opts);
  opts.type = 'card';
  addKeys(styles, opts);
  let item = mItem(d ? { div: d } : {}, opts);
  return item;
}
function cLandscape(dParent, styles = {}, opts = {}) {
  if (nundef(styles.w)) styles.w = 100;
  if (nundef(styles.h)) styles.h = styles.w * .65;
  return cBlank(dParent, styles, opts);
}
function cNumber(ckey, styles = {}, opts = {}) {
  addKeys({ border: 'silver', h: 100 }, styles);
  addKeys({ backcolor: BLUE, ov: .3, key: ckey, type: 'num' }, opts);
  let c = cPortrait(null, styles, opts);
  if (isNumeric(ckey)) { ckey = `${ckey}_blue`; }
  let sym = c.rank = stringBefore(ckey, '_');
  let color = c.suit = c.val = stringAfter(ckey, '_');
  let sz = c.h;
  let [sm, lg, w, h] = [sz / 8, sz / 4, c.w, c.h];
  let styleSmall = { fg: color, h: sm, fz: sm, hline: sm, weight: 'bold' };
  cPrintSym(c, sym, styleSmall, 'tl')
  cPrintSym(c, sym, styleSmall, 'tr')
  styleSmall.transform = 'rotate(180deg)';
  cPrintSym(c, sym, styleSmall, 'bl')
  cPrintSym(c, sym, styleSmall, 'br')
  let styleBig = { matop: (h - lg) / 2, family: 'algerian', fg: color, fz: lg, h: lg, w: w, hline: lg, align: 'center' }
  styleBig = { display: 'inline', family: 'algerian', fg: color, fz: lg, hline: lg }
  cPrintSym(c, sym, styleBig, 'cc')
  return c;
}
function cPortrait(dParent, styles = {}, opts = {}) {
  if (nundef(styles.h)) styles.h = 100;
  if (nundef(styles.w)) styles.w = styles.h * .7;
  return cBlank(dParent, styles, opts);
}
function cPrintSym(card, sym, styles, pos) {
  let d = iDiv(card);
  let opts = {};
  if (isNumber(sym)) {
    opts.html = sym;
  } else if (sym.includes('/')) {
    opts.tag = 'img';
    opts.src = sym;
  }
  let d1 = mDom(d, styles, opts);
  mPlace(d1, pos, pos[0] == 'c' ? 0 : 2, pos[1] == 'c' ? 0 : 2);
}
function cRound(dParent, styles = {}, opts = {}) {
  styles.w = valf(styles.w, 100);
  styles.h = valf(styles.h, 100);
  styles.rounding = '50%';
  return cBlank(dParent, styles, opts);
}
function cairoTiling(container, rows, cols, w = 100, h = 100) {
  container.style.position = 'relative';
  container.innerHTML = '';
  for (let r = 0; r < rows; r++) {
    const y = r * h;
    const xOffset = (r % 2) * (w / 2);
    for (let c = 0; c < cols; c++) {
      const x = c * w + xOffset;
      const flip = (r + c) % 2 === 1;
      drawCairoTile(container, x, y, w, h, flip, '#ccc');
    }
  }
}
function calcBotLevel(table) {
  let humanPlayers = dict2list(table.players).filter(x => x.playmode == 'human');
  if (isEmpty(humanPlayers) || getGameOption('use_level') == 'no') return null;
  let level = arrAverage(humanPlayers, 'level');
  return level;
}
function calcBotSpeed(table) {
  let speed = 2000 + Math.round(Math.random() * 2000);
  let botLevel = calcBotLevel(table);
  return botLevel ? botLevel == 1 ? speed : speed * 4 / botLevel : speed;
}
function calcClipPoints(x0, y0, w, h, clipPath) {
  const percentagePoints = clipPath
    .match(/polygon\((.*?)\)/)[1]
    .split(',')                  // Split into individual points
    .map(point => point.trim())
    .map(point => point.split(' ').map(value => parseFloat(value))); // Convert to [x, y]
  const pixelPoints = percentagePoints.map(([xPercent, yPercent]) => {
    const x = x0 + (xPercent - 50) * (w / 100);
    const y = y0 + (yPercent - 50) * (h / 100);
    return { x, y };
  });
  return pixelPoints;
}
function calcHeightLeftUnder(div) {
  let hwin = window.innerHeight;
  let r = getRect(div);
  let top = r.b;
  let h = hwin - top;
  return h;
}
function calcHexCorners(center, width, height) {
  const [cx, cy] = [center.cx, center.cy]; if (VERBOSE) console.log('center', center)
  const points = [];
  const angleStep = (2 * Math.PI) / 6;
  const rx = width / 2;
  const ry = height / 2;
  for (let i = 0; i < 6; i++) {
    const angle = angleStep * i;
    const x = cx + rx * Math.cos(angle);
    const y = cy + ry * Math.sin(angle);
    points.push([x, y]);
  }
  return points;
}
function calcLifespan(s) {
  let arr = allNumbers(s, Math.abs);
  let num, unit, lifespan;
  if (!isEmpty(arr)) {
    if (arr.length > 2) arr = arr.slice(0, 2)
    let n = arrAverage(arr);
    unit = s.includes('year') ? 'y' : s.includes('month') ? 'm' : s.includes('week') ? 'w' : s.includes('day') ? 'd' : s.includes('hour') ? 'h' : 'y';
    num = calcYears(n, unit);
    lifespan = yearsToReadable(num);
  } else {
    let s1 = s.toLowerCase();
    let words = toWords(s1);
    if (s1.includes('a few')) {
      unit = wordAfter(words, 'few');
      let n = calcYears(3, unit);
      arr.push(n);
    }
    if (s1.includes('several')) {
      unit = wordAfter(words, 'several'); //console.log('unit',unit)
      let n = calcYears(3, unit);
      arr.push(n);
      let next = wordAfter(words, unit);
      if (next == 'to') {
        unit = wordAfter(words, 'to'); //console.log('unit',unit)
        if (['day', 'week', 'month', 'year'].some(x => unit.startsWith(x))) {
          let n = calcYears(3, unit);
          arr.push(n);
        }
      }
    }
    let di = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, fifteen: 15, twenty: 20 };
    for (const w of Object.keys(di)) {
      if (s.includes(w)) {
        let n = calcYears(di[w], stringAfter(s, w));
        arr.push(n);
      }
    }
    let n = arrAverage(arr);
    unit = 'year';
    lifespan = yearsToReadable(n);
    num = allNumbers(lifespan)[0];
    unit = stringAfter(lifespan, ' ');
  }
  unit = unit[0];
  return { s, text: lifespan, num, unit };
}
function calcNumericInfo(str, diunit, base) {
  if (nundef(str)) return { str: '', num: 0, base, text: '' };
  let s = str.toLowerCase(); s = replaceAll(s, '-', ' ');
  let words1 = stringSplit(s);
  let words = words1.map(x => x == 'few' || x == 'several' ? 3 : x); //console.log(words)
  let arr = allNumbers(words.join(' ')); //console.log(arr)
  if (isEmpty(arr)) {
    console.log('could NOT find any numbers!!!!')
    return { str, num: 1, unit: base, text: s };
  }
  let num, unit, text;
  let units = Object.keys(diunit);
  let arrunits = [];
  let unitFound = base;
  for (const n of arr) {
    let i = words.indexOf('' + n); //console.log('...',n,arr,words,i); //return;
    unit = arrFindKeywordFromIndex(units, words, i);
    if (unit) {
      unitFound = unit.w;
      arrunits.push({ n, unit: unit.w });
    }
    words = words.slice(i + 1);
  }
  for (const o of arrunits) {
    o.nnorm = o.n * diunit[o.unit];
  }
  let avg = arrBalancedAverage(arrunits, 'nnorm'); //let av2=arrBalancedAverage(arrunits,'nnorm')
  unit = arrunits[0].unit;
  num = avg / diunit[unit];
  text = `${num.toFixed(1)} ${unit}`;
  return { str, num, unit, text, avg };
}
function calcOffsprings(str) {
  let s = str.toLowerCase(); s = replaceAll(s, '-', ' '); s = replaceAll(s, ',', '');
  if (s.includes('incub')) s = stringBefore(s, 'incub');
  let arr = allNumbers(s);
  if (isEmpty(arr) && s.includes('hundred') && s.includes('thousand')) { s = s.replace('hundred', '100 '); s = s.replace('thousand', '1000 '); arr = [100, 1000]; }
  else if (isEmpty(arr) && s.includes('hundred')) { s = s.replace('hundred', '100 '); arr = [100]; }
  else if (isEmpty(arr) && s.includes('thousand')) { s = s.replace('thousand', '1000 '); arr = [1000]; }
  else if (isEmpty(arr) && s.includes('ten')) { s = s.replace('ten', '10 '); arr = [10]; }
  else if (isEmpty(arr) && s.includes('dozen')) { s = s.replace('dozen', '20 '); arr = [20]; }
  let words = toWords(s).filter(x => x != 's');
  if (isEmpty(arr)) return 1;
  let newarr = [];
  for (const n of arr) {
    let w = wordAfter(words, n);
    if (isdef(w) && ['day', 'month', 'week', 'year'].some(x => w.includes(x))) break;
    newarr.push(n);
  }
  let num = arrAverage(newarr);
  let text = newarr.length > 1 ? `${newarr[0]}-${newarr[1]} children}` : `${num} child${num == 1 ? '' : 'ren'}`;
  return { str, num, unit: 'child', text };
}
function calcRestHeight(dtop) {
  let hwin = window.innerHeight;
  let r = getRect(dtop);
  let top = r.y;
  let hmax = hwin - top - 20;
  return hmax;
}
function calcRows(fontSize, fontFamily, content, maxWidth) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = `${fontSize}px ${fontFamily}`;
  const words = ('' + content).split(' ');
  let line = '';
  let rows = 0;
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && i > 0) {
      rows++;
      line = words[i] + ' ';
    } else {
      line = testLine;
    }
  }
  if (line.length > 0) {
    rows++;
  }
  return rows;
}
function calcScoreSum(table) {
  let res = 0;
  for (const name in table.players) {
    res += table.players[name].score;
  }
  return res;
}
function calcSize(str) {
  return calcNumericInfo(str, { cm: .01, centimeter: .01, centimeters: .01, mm: .001, millimeter: .001, millimeters: .001, meter: 1, meters: 1, m: 1 }, 'm');
}
async function calcUserPalette(name) {
  if (nundef(name)) name = U.name;
  let user = await getUser(name);
  let dParent = mPopup(null, { opacity: 0 });
  return await showPaletteFor(dParent, user.texture, user.color, user.blendMode);
}
function calcWeight(str) {
  return calcNumericInfo(str, { kg: 1, kilogram: 1, kilograms: 1, mg: .000001, milligram: .000001, milligrams: .000001, grams: .001, gram: .001, g: .001, ton: 1000, tons: 1000 }, 'kg');
}
function calcYears(n, unit) {
  let ch = unit[0];
  let frac = ch == 'y' ? 1 : ch == 'm' ? 12 : ch == 'w' ? 52 : ch == 'd' ? 365 : ch == 'h' ? 365 * 24 : 1;
  return n / frac;
}
function calculateGoodColors(bg, fg) {
  let fgIsLight = isdef(fg) ? colorIdealText(fg) == 'black' : colorIdealText(bg) == 'white';
  let bgIsDark = colorIdealText(bg) == 'white';
  if (nundef(fg)) fg = colorIdealText(bg);
  let bgNav = bg;
  fg = colorToHex79(fg);
  if (fgIsLight) {
    if (isEmpty(U.texture)) { bgNav = '#00000040'; }
    else if (bgIsDark) { bgNav = colorTrans(bg, .8); }
    else { bgNav = colorTrans(colorDark(bg, 50), .8); }
  } else {
    if (isEmpty(U.texture)) { bgNav = '#ffffff40'; }
    else if (!bgIsDark) { bgNav = colorTrans(bg, .8); }
    else { bgNav = colorTrans(colorLight(bg, 50), .8); }
  }
  let realBg = bg;
  if (bgNav == realBg) bgNav = fgIsLight ? colorDark(bgNav, .2) : colorLight(bgNav, .2);
  let bgContrast = fgIsLight ? colorDark(bgNav, .2) : colorLight(bgNav, .2);
  let fgContrast = fgIsLight ? '#ffffff80' : '#00000080';
  return [realBg, bgContrast, bgNav, fg, fgContrast];
}
function calculateSecondsDifference(timestamp1, timestamp2) {
  const differenceInMilliseconds = Math.abs(timestamp1 - timestamp2);
  const differenceInSeconds = Math.ceil(differenceInMilliseconds / 1000);
  return differenceInSeconds;
}
function canAct() { return (aiActivated || uiActivated) && !auxOpen; }
function capitalize(s) {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function cardRect(ctx, x, y, color) {
  let dark = '#635651';
  let light = '#D9C7BD';
  delta = 20;
  let ybar = y + 33;
  let o = findNextBar(ctx, x, x + 100, ybar, ybar + 20, color, 10);
  if (nundef(o)) o = findNextBar(ctx, x, x + 100, ybar, ybar + 20, color, 15);
  console.log('bar', o);
  let xnew = o.x;
  let o1 = findNextBar(ctx, xnew, xnew + 20, ybar, ybar + 20, dark, delta);
  if (nundef(o1)) o1 = findNextBar(ctx, xnew, xnew + 20, ybar, ybar + 20, dark, delta + 10);
  console.log('dark', o1)
  let xx = o1.x + 30;
  let o2 = findNextBar(ctx, xx, xx + 100, ybar, ybar + 20, color, delta);
  console.log('bar', o2)
  let xline = x + 33;
  let o3 = findNextLine(ctx, xline, xline + 20, y, y + 100, color)
  if (nundef(o3)) o3 = findNextLine(ctx, xline, xline + 20, y, y + 100, color, delta)
  console.log('line', o3)
  let ynew = o3.y;
  let o4 = findNextLine(ctx, xline, xline + 20, ynew, ynew + 20, dark, delta)
  if (nundef(o4)) o4 = findNextLine(ctx, xline, xline + 20, ynew, ynew + 20, dark, delta + 10)
  console.log('line', o4)
  ynew = o4.y + 80;
  let o5 = findNextLine(ctx, xline, xline + 20, ynew, ynew + 100, color)
  console.log('line', o5)
  return { x: o1.x, y: o4.y, w: o2.x - o1.x, h: o5.y - o4.y };
}
function cartesianContract(dictList) {
  if (!dictList.length) return [[], []];
  const keys = Object.keys(dictList[0]);
  const valuesLists = keys.map(() => []);
  for (const obj of dictList) {
    keys.forEach((key, i) => {
      if (!valuesLists[i].includes(obj[key])) {
        valuesLists[i].push(obj[key]);
      }
    });
  }
  return [keys, valuesLists];
}
function cartesianExpand(keys, valuesLists) {
  const result = [];
  function helper(index, current) {
    if (index === keys.length) {
      result.push(Object.fromEntries(current));
      return;
    }
    for (const value of valuesLists[index]) {
      helper(index + 1, [...current, [keys[index], value]]);
    }
  }
  helper(0, []);
  return result;
}
function centerAt(elem, x, y) {
  const rect = elem.getBoundingClientRect();
  const offsetX = x - rect.width / 2;
  const offsetY = y - rect.height / 2;
  elem.style.position = 'absolute';
  elem.style.left = `${offsetX}px`;
  elem.style.top = `${offsetY}px`;
}
function centerOfDiv(div) {
  const rect = div.getBoundingClientRect();
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  return {
    x: rect.left + scrollLeft + rect.width / 2,
    y: rect.top + scrollTop + rect.height / 2
  };
}
function centerVerticalOneLine(elem, h) {
  if (nundef(h)) h = elem.offsetHeight;
  mStyle(elem.hline, h);
}
function checkState() {
}
function checkToInput(ev, inp, grid) {
  let checklist = Array.from(grid.querySelectorAll('input[type="checkbox"]')); //chks=items.map(x=>iDiv(x).firstChild);
  let names = checklist.filter(x => x.checked).map(x => x.name);
  sortCheckboxes(grid);
  names.sort();
  inp.value = names.join(', ') + ', ';
}
function choose(arr, n, excepti) { return rChoose(arr, n, null, excepti); }
function chooseRandom(arr) { return rChoose(arr); }
function circleCenters(rows, cols, wCell, hCell) {
  let [w, h] = [cols * wCell, rows * hCell];
  let cx = w / 2;
  let cy = h / 2;
  let centers = [{ x: cx, y: cy }];
  let rx = cx + wCell / 2; let dradx = rx / wCell;
  let ry = cy + hCell / 2; let drady = ry / hCell;
  let nSchichten = Math.floor(Math.min(dradx, drady));
  for (let i = 1; i < nSchichten; i++) {
    let [newCenters, wsch, hsch] = oneCircleCenters(i * 2 + 1, i * 2 + 1, wCell, hCell);
    for (const nc of newCenters) {
      centers.push({ x: nc.x + cx - wsch / 2, y: nc.y + cy - hsch / 2 });
    }
  }
  return [centers, wCell * cols, hCell * rows];
}
function circleFromCenter(dParent, center, styles = {}) {
  mSizeSuccession(styles);
  let [left, top] = [center.x - styles.w / 2, center.y - styles.h / 2];
  let d = mDom(dParent, { position: 'absolute', left, top, round: true });
  mStyle(d, styles);
  return d;
}
function clamp(x, min, max) { return Math.min(Math.max(x, min), max); }
async function cleanupOldActionIfAny(ev) {
  let w = DA.stopwatch; if (!w) return;
  let secs = w.getElapsed();
  if (w.key && secs > 0) {
    w.stop();
    let s = `${getNow()}: ${w.key}, ${secs}`;
    let res = await mPhpPostLine(s, '../../zdata/action.txt');
    w.reset();
    elem = findAncestorWith(ev.target, { attribute: 'key' });
    if (VERBOSE) console.log(elem);
  }
}
function clearBodyDiv(styles = {}, opts = {}) { document.body.innerHTML = ''; return mDom(document.body, styles, opts) }
function clearBodyReset100(styles = {}, opts = {}) {
  let body = document.body;
  body.setAttribute('style', '');
  body.innerHTML = '';
  copyKeys({ w: '100vw', h: '100vh', position: 'relative' }, styles)
  let d = mDom(document.body, styles, opts)
  return d;
}
function clearCell(cell) { mClear(cell); mStyle(cell, { opacity: 0 }); }
function clearDiv(dParent, styles = {}, opts = {}) {
  if (nundef(dParent)) dParent = document.body;
  addKeys({ className: 'h100', hline: 0 }, styles);
  addKeys({ html: '&nbsp;' }, opts);
  dParent.innerHTML = '';
  return mDom(dParent, styles, opts);
}
function clearElement(elem) {
  if (isString(elem)) elem = document.getElementById(elem);
  if (window.jQuery == undefined) { elem.innerHTML = ''; return elem; }
  while (elem.firstChild) {
    $(elem.firstChild).remove();
  }
  return elem;
}
function clearEvents() {
  for (const k in TO) { clearTimeout(TO[k]); TO[k] = null; }
  for (const k in ANIM) { if (isdef(ANIM[k])) ANIM[k].cancel(); ANIM[k] = null; }
}
function clearFleetingMessage() {
  if (isdef(dFleetingMessage)) { dFleetingMessage.remove(); dFleetingMessage = null; }
}
function clearFlex(styles = {}) {
  let dp = clearBodyDiv({ bg: 'white', hmin: '100vh', padding: 0 });
  addKeys({ gap: 10, padding: 10 }, styles)
  let d = mDom(dp, styles); mFlexWrap(d);
  return d;
}
function clearMain() {
  clearTimeouts();
  clearEvents();
  staticTitle();
  mClear('dMain');
  mClear('dTitle');
  clearMessage();
  invalidateTables()
}
function clearMessage(remove = false) { if (remove) mRemove('dMessage'); else mStyle('dMessage', { h: 0 }, { html: '' }); }
function clearParent(ev) { mClear(ev.target.parentNode); }
function clearTimeouts() {
  onclick = null;
  clearTimeout(TOMain);
  clearTimeout(TOFleetingMessage);
  clearTimeout(TOTrial);
  if (isdef(TOList)) { for (const k in TOList) { TOList[k].map(x => clearTimeout(x)); } }
}
function clearZones() {
  for (const k in Zones) {
    clearElement(Zones[k].dData);
  }
}
function cloneIfNecessary(value, optionsArgument) {
  var clone = optionsArgument && optionsArgument.clone === true
  return (clone && isMergeableObject(value)) ? deepmerge(emptyTarget(value), value, optionsArgument) : value
}
function cloneImage(img, targetDiv, x = 100, y = 100, w = 100, h = 100) {
  const clonedImage = img.cloneNode();
  clonedImage.style.position = 'absolute';
  clonedImage.style.left = `${x - w / 2}px`;
  clonedImage.style.top = `${y - h / 2}px`;
  clonedImage.style.width = `${w}px`;
  clonedImage.style.height = `${h}px`;
  targetDiv.appendChild(clonedImage);
  return clonedImage;
}
function closeLeftSidebar() { mClear('dLeft'); mStyle('dLeft', { w: 0, wmin: 0 }) }
function closePopup(name = 'dPopup') { if (isdef(mBy(name))) mBy(name).remove(); }
function clusterize(di, sz = 20) {
  const clustered = {};
  for (const key in di) {
    const [x, y] = key.split(',').map(Number);
    const clusterX = Math.floor(x / sz) * sz;
    const clusterY = Math.floor(y / sz) * sz;
    const clusterKey = `${clusterX},${clusterY}`;
    if (!clustered[clusterKey]) {
      clustered[clusterKey] = new Set();
    }
    di[key].forEach(value => clustered[clusterKey].add(value));
  }
  for (const key in clustered) {
    clustered[key] = Array.from(clustered[key]);
  }
  return clustered;
}
function cmdDisable(key) { mClass(mBy(key), 'disabled') }
function cmdEnable(key) { mClassRemove(mBy(key), 'disabled') }
function codeParseBlock(lines, i) {
  let l = lines[i];
  let type = l[0] == 'a' ? ithWord(l, 1) : ithWord(l, 0);
  let key = l[0] == 'a' ? ithWord(l, 2, true) : ithWord(l, 1, true);
  let code = l + '\n'; i++; l = lines[i];
  while (i < lines.length && !(['var', 'const', 'cla', 'func', 'async'].some(x => l.startsWith(x)) && !l.startsWith('}'))) {
    if (!(l.trim().startsWith('//') || isEmptyOrWhiteSpace(l))) code += l + '\n';
    i++; l = lines[i];
  }
  code = replaceAllSpecialChars(code, '\t', '  ');
  code = code.trim();
  return [{ key: key, type: type, code: code }, i];
}
function codeParseBlocks(text) {
  let lines = text.split('\r\n');
  lines = lines.map(x => removeTrailingComments(x));
  let i = 0, o = null, res = [];
  while (i < lines.length) {
    let l = lines[i];
    if (['var', 'const', 'cla', 'func', 'async'].some(x => l.startsWith(x))) {
      [o, iLineAfterBlock] = codeParseBlock(lines, i);
      i = iLineAfterBlock;
      res.push(o)
    } else i++;
  }
  return res;
}
function coin(percent = 50) { return Math.random() * 100 < percent; }
function collFilterImages(coll, s) {
  let di = {};
  for (const k of coll.masterKeys) { di[k] = true; }
  let list = isEmpty(s) ? Object.keys(di) : isdef(M.byCat[s]) ? M.byCat[s].filter(x => isdef(di[x])) : [];
  if (nundef(list) || isEmpty(list)) {
    list = [];
    for (const k of coll.masterKeys) {
      let o = M.superdi[k];
      if (k.includes(s) || o.friendly.toLowerCase().includes(s)) list.push(k);
    }
  }
  return list;
}
function collectCats(klist) {
  let cats = [];
  for (const k of klist) {
    M.superdi[k].cats.map(x => addIf(cats, x));
  }
  return cats;
}
function collectOptions() {
  let poss = MGetGame(DA.gamename).options;
  let options = DA.options = {};
  if (nundef(poss)) return options;
  for (const p in poss) {
    let fs = mBy(`d_${p}`);
    let val = getCheckedRadios(fs)[0];
    options[p] = isNumber(val) ? Number(val) : val;
  }
  return options;
}
function collectPlayers() {
  let players = {};
  for (const name of DA.playerList) { players[name] = allPlToPlayer(name); }
  return players;
}
function colorBlendMode(c1, c2, blendMode) {
  function colorBurn(base, blend) {
    return (blend === 0) ? 0 : Math.max(0, 255 - Math.floor((255 - base) / blend));
  }
  function blendColorBurn(baseColor, blendColor) {
    let [baseR, baseG, baseB] = colorHexToRgbArray(baseColor);
    let [blendR, blendG, blendB] = colorHexToRgbArray(blendColor);
    let resultR = colorBurn(baseR, blendR);
    let resultG = colorBurn(baseG, blendG);
    let resultB = colorBurn(baseB, blendB);
    return colorRgbArgsToHex79(resultR, resultG, resultB);
  }
  function blendColorDodge(baseColor, blendColor) {
    let [r1, g1, b1] = colorHexToRgbArray(baseColor);
    let [r2, g2, b2] = colorHexToRgbArray(blendColor);
    const dodge = (a, b) => (b === 255) ? 255 : Math.min(255, ((a << 8) / (255 - b)));
    let r = dodge(r1, r2);
    let g = dodge(g1, g2);
    let b = dodge(b1, b2);
    return colorRgbArgsToHex79(r, g, b);
  }
  function blendColor(baseColor, blendColor) {
    let [r1, g1, b1] = colorHexToRgbArray(baseColor);
    let [r2, g2, b2] = colorHexToRgbArray(blendColor);
    let [h1, s1, l1] = colorRgbArgsToHsl01Array(r1, g1, b1);
    let [h2, s2, l2] = colorRgbArgsToHsl01Array(r2, g2, b2);
    let cfinal = colorHsl01ArgsToRgbArray(h2, s1, l1);
    return colorRgbArgsToHex79(...cfinal);
  }
  function blendDarken(baseColor, blendColor) {
    let [r1, g1, b1] = colorHexToRgbArray(baseColor);
    let [r2, g2, b2] = colorHexToRgbArray(blendColor);
    let r = Math.min(r1, r2);
    let g = Math.min(g1, g2);
    let b = Math.min(b1, b2);
    return colorRgbArgsToHex79(r, g, b);
  }
  function difference(a, b) {
    return Math.abs(a - b);
  }
  function blendDifference(baseColor, blendColor) {
    let [baseR, baseG, baseB] = colorHexToRgbArray(baseColor);
    let [blendR, blendG, blendB] = colorHexToRgbArray(blendColor);
    let resultR = difference(baseR, blendR);
    let resultG = difference(baseG, blendG);
    let resultB = difference(baseB, blendB);
    return colorRgbArgsToHex79(resultR, resultG, resultB);
  }
  function exclusion(a, b) {
    a /= 255;
    b /= 255;
    return (a + b - 2 * a * b) * 255;
  }
  function blendExclusion(baseColor, blendColor) {
    let [baseR, baseG, baseB] = colorHexToRgbArray(baseColor);
    let [blendR, blendG, blendB] = colorHexToRgbArray(blendColor);
    let resultR = Math.round(exclusion(baseR, blendR));
    let resultG = Math.round(exclusion(baseG, blendG));
    let resultB = Math.round(exclusion(baseB, blendB));
    return colorRgbArgsToHex79(resultR, resultG, resultB);
  }
  function hardLight(a, b) {
    a /= 255;
    b /= 255;
    return (b < 0.5) ? (2 * a * b) : (1 - 2 * (1 - a) * (1 - b));
  }
  function blendHardLight(baseColor, blendColor) {
    let [baseR, baseG, baseB] = colorHexToRgbArray(baseColor);
    let [blendR, blendG, blendB] = colorHexToRgbArray(blendColor);
    let resultR = Math.round(hardLight(baseR, blendR) * 255);
    let resultG = Math.round(hardLight(baseG, blendG) * 255);
    let resultB = Math.round(hardLight(baseB, blendB) * 255);
    return colorRgbArgsToHex79(resultR, resultG, resultB);
  }
  function blendHue(baseColor, blendColor) {
    let [baseR, baseG, baseB] = colorHexToRgbArray(baseColor);
    let [blendR, blendG, blendB] = colorHexToRgbArray(blendColor);
    let [baseH, baseS, baseL] = colorRgbArgsToHsl01Array(baseR, baseG, baseB);
    let [blendH, blendS, blendL] = colorRgbArgsToHsl01Array(blendR, blendG, blendB);
    let [resultR, resultG, resultB] = colorHsl01ArgsToRgbArray(blendH, baseS, baseL);
    return colorRgbArgsToHex79(resultR, resultG, resultB);
  }
  function blendLighten(baseColor, blendColor) {
    let [r1, g1, b1] = colorHexToRgbArray(baseColor);
    let [r2, g2, b2] = colorHexToRgbArray(blendColor);
    let r = Math.max(r1, r2);
    let g = Math.max(g1, g2);
    let b = Math.max(b1, b2);
    return colorRgbArgsToHex79(r, g, b);
  }
  function blendLuminosity(baseColor, blendColor) {
    let [r1, g1, b1] = colorHexToRgbArray(baseColor);
    let [r2, g2, b2] = colorHexToRgbArray(blendColor);
    let [h1, s1, l1] = colorRgbArgsToHsl01Array(r1, g1, b1);
    let [h2, s2, l2] = colorRgbArgsToHsl01Array(r2, g2, b2);
    let [r, g, b] = colorHsl01ArgsToRgbArray(h1, s1, l2);
    return colorRgbArgsToHex79(r, g, b);
  }
  function blendMultiply(color1, color2) {
    let [r1, g1, b1] = colorHexToRgbArray(color1);
    let [r2, g2, b2] = colorHexToRgbArray(color2);
    let r = (r1 * r2) / 255;
    let g = (g1 * g2) / 255;
    let b = (b1 * b2) / 255;
    return colorRgbArgsToHex79(Math.round(r), Math.round(g), Math.round(b));
  }
  function blendNormal(baseColor, blendColor) {
    return blendColor;
  }
  function blendOverlay(baseColor, blendColor) {
    let [r1, g1, b1] = colorHexToRgbArray(baseColor);
    let [r2, g2, b2] = colorHexToRgbArray(blendColor);
    const overlayCalculate = (a, b) => (a <= 128) ? (2 * a * b / 255) : (255 - 2 * (255 - a) * (255 - b) / 255);
    let r = overlayCalculate(r1, r2);
    let g = overlayCalculate(g1, g2);
    let b = overlayCalculate(b1, b2);
    return colorRgbArgsToHex79(r, g, b);
  }
  function blendSaturation(baseColor, blendColor) {
    let [r1, g1, b1] = colorHexToRgbArray(baseColor);
    let [r2, g2, b2] = colorHexToRgbArray(blendColor);
    let [h1, s1, l1] = colorRgbArgsToHsl01Array(r1, g1, b1);
    let [h2, s2, l2] = colorRgbArgsToHsl01Array(r2, g2, b2);
    let cfinal = colorHsl01ArgsToRgbArray(h1, s2, l1);
    return colorRgbArgsToHex79(...cfinal);
  }
  function blendScreen(color1, color2) {
    let [r1, g1, b1] = colorHexToRgbArray(color1);
    let [r2, g2, b2] = colorHexToRgbArray(color2);
    let r = 255 - (((255 - r1) * (255 - r2)) / 255);
    let g = 255 - (((255 - g1) * (255 - g2)) / 255);
    let b = 255 - (((255 - b1) * (255 - b2)) / 255);
    return colorRgbArgsToHex79(r, g, b);
  }
  function softLight(a, b) {
    a /= 255;
    b /= 255;
    let result;
    if (a < 0.5) {
      result = (2 * a - 1) * (b - b * b) + b;
    } else {
      result = (2 * a - 1) * (Math.sqrt(b) - b) + b;
    }
    return Math.min(Math.max(result * 255, 0), 255);
  }
  function blendSoftLight(baseColor, blendColor) {
    let [baseR, baseG, baseB] = colorHexToRgbArray(baseColor);
    let [blendR, blendG, blendB] = colorHexToRgbArray(blendColor);
    let resultR = Math.round(softLight(baseR, blendR));
    let resultG = Math.round(softLight(baseG, blendG));
    let resultB = Math.round(softLight(baseB, blendB));
    return colorRgbArgsToHex79(resultR, resultG, resultB);
  }
  let di = {
    darken: blendDarken, lighten: blendLighten, color: blendColor, colorBurn: blendColorBurn, colorDodge: blendColorDodge,
    difference: blendDifference, exclusion: blendExclusion, hardLight: blendHardLight, hue: blendHue,
    luminosity: blendLuminosity, multiply: blendMultiply, normal: blendNormal, overlay: blendOverlay,
    saturation: blendSaturation, screen: blendScreen, softLight: blendSoftLight
  };
  if (blendMode.includes('-')) blendMode = stringCSSToCamelCase(blendMode);
  let func = di[blendMode]; if (nundef(di)) { console.log('blendMode', blendMode); return c1; }
  c1hex = colorFrom(c1);
  c2hex = colorFrom(c2);
  let res = func(c1hex, c2hex);
  return res;
}
function colorBucket(s) {
  let di = { black: '', blue: '', bluered: 'bluemagenta', child: 'childrenRoomColors', cyan: '', sky: 'cyanblue', rich: 'deepRichColors', green: '', greenblue: 'greencyan', magenta: '', pink: 'magentapink', modern: 'modernColors', orange: '', orangered: '', orangeyellow: '', player: 'playerColors', red: '', vibrant: 'vibrantColors', yellow: '', lime: 'yellowgreen' };
  let c = di[s];
  if (isEmpty(c)) c = s;
  return rChoose(Object.keys(dicolor[c]));
}
function colorCalculator(p, c0, c1, l) {
  function pSBCr(d) {
    let i = parseInt, m = Math.round, a = typeof c1 == 'string';
    let n = d.length,
      x = {};
    if (n > 9) {
      ([r, g, b, a] = d = d.split(',')), (n = d.length);
      if (n < 3 || n > 4) return null;
      (x.r = parseInt(r[3] == 'a' ? r.slice(5) : r.slice(4))), (x.g = parseInt(g)), (x.b = parseInt(b)), (x.a = a ? parseFloat(a) : -1);
    } else {
      if (n == 8 || n == 6 || n < 4) return null;
      if (n < 6) d = '#' + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (n > 4 ? d[4] + d[4] : '');
      d = parseInt(d.slice(1), 16);
      if (n == 9 || n == 5) (x.r = (d >> 24) & 255), (x.g = (d >> 16) & 255), (x.b = (d >> 8) & 255), (x.a = m((d & 255) / 0.255) / 1000);
      else (x.r = d >> 16), (x.g = (d >> 8) & 255), (x.b = d & 255), (x.a = -1);
    }
    return x;
  }
  let r, g, b, P, f, t, h, i = parseInt, m = Math.round, a = typeof c1 == 'string';
  if (typeof p != 'number' || p < -1 || p > 1 || typeof c0 != 'string' || (c0[0] != 'r' && c0[0] != '#') || (c1 && !a)) return null;
  h = c0.length > 9;
  h = a ? (c1.length > 9 ? true : c1 == 'c' ? !h : false) : h;
  f = pSBCr(c0);
  P = p < 0;
  t = c1 && c1 != 'c' ? pSBCr(c1) : P ? { r: 0, g: 0, b: 0, a: -1 } : { r: 255, g: 255, b: 255, a: -1 };
  p = P ? p * -1 : p;
  P = 1 - p;
  if (!f || !t) return null;
  if (l) { r = m(P * f.r + p * t.r); g = m(P * f.g + p * t.g); b = m(P * f.b + p * t.b); }
  else { r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5); g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5); b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5); }
  a = f.a;
  t = t.a;
  f = a >= 0 || t >= 0;
  a = f ? (a < 0 ? t : t < 0 ? a : a * P + t * p) : 0;
  if (h) return 'rgb' + (f ? 'a(' : '(') + r + ',' + g + ',' + b + (f ? ',' + m(a * 1000) / 1000 : '') + ')';
  else return '#' + (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0)).toString(16).slice(1, f ? undefined : -2);
}
function colorComplement(color) {
  let [r, g, b] = colorHexToRgbArray(colorFrom(color));
  let compR = 255 - r;
  let compG = 255 - g;
  let compB = 255 - b;
  return colorRgbArgsToHex79(compR, compG, compB);
}
function colorContrastFromElem(elem, list = ['white', 'black']) {
  let bg = mGetStyle(elem, 'bg');
  return colorContrastPickFromList(bg, list);
}
function colorContrastPickFromList(color, colorlist = ['white', 'black']) {
  let contrast = 0;
  let result = null;
  let rgb = colorHexToRgbArray(colorFrom(color));
  for (c1 of colorlist) {
    let x = colorHexToRgbArray(colorFrom(c1));
    let c = colorGetContrast(rgb, x);
    if (c > contrast) { contrast = c; result = c1; }
  }
  return result;
}
function colorDark(c, percent = 50, log = true) {
  if (nundef(c)) c = rColor(); else c = colorFrom(c);
  let zero1 = -percent / 100;
  return colorCalculator(zero1, c, undefined, !log);
}
function colorDistance(color1, color2) {
  let [r1, g1, b1] = colorHexToRgbArray(colorFrom(color1));
  let [r2, g2, b2] = colorHexToRgbArray(colorFrom(color2));
  let distance = Math.sqrt(
    Math.pow(r2 - r1, 2) +
    Math.pow(g2 - g1, 2) +
    Math.pow(b2 - b1, 2)
  );
  return Number(distance.toFixed(2));
}
function colorDistanceHSL(color1, color2) {
  let hsl1 = hexToHSL(color1);
  let hsl2 = hexToHSL(color2);
  let hueDiff = Math.abs(hsl1.h - hsl2.h);
  let hueDistance = Math.min(hueDiff, 360 - hueDiff) / 180;
  let lightnessDistance = Math.abs(hsl1.l - hsl2.l) / 100;
  let distance = hueDistance + 0.5 * lightnessDistance;
  return distance;
}
function colorDistanceHue(color1, color2) {
  let c1 = colorO(color1);
  let c2 = colorO(color2);
  let hueDiff = Math.abs(c1.hue - c2.hue);
  let hueDistance = Math.min(hueDiff, 360 - hueDiff) / 180;
  let num = (hueDistance * 100).toFixed(2);
  return Number(num);
}
function colorDistanceHueLum(color1, color2) {
  let c1 = colorO(color1);
  let c2 = colorO(color2);
  let hueDiff = Math.abs(c1.hue - c2.hue);
  let hueDistance = Math.min(hueDiff, 360 - hueDiff) / 180;
  let lightnessDistance = Math.abs(c1.lightness - c2.lightness);
  let distance = hueDistance + lightnessDistance;
  return Number((distance * 100).toFixed(2));
}
function colorFarestNamed(inputColor, namedColors) {
  let maxDistance = 0;
  let nearestColor = null;
  namedColors.forEach(namedColor => {
    let distance = colorDistance(inputColor, namedColor.hex);
    if (distance > maxDistance) {
      maxDistance = distance;
      nearestColor = namedColor;
    }
  });
  return nearestColor;
}
function colorFrom(c, a) {
  c = colorToHex79(c);
  if (nundef(a)) return c;
  return c.substring(0, 7) + (a < 1 ? alphaToHex(a) : '');
}
function colorFromHsl(h, s = 100, l = 50) { return colorFrom({ h, s, l }); }
function colorFromHslNamed(h, s = 100, l = 50) { let x = colorFrom({ h, s, l }); return colorNearestNamed(x); }
function colorFromHue(h, s = 100, l = 50) { return colorFrom({ h, s, l }); }
function colorFromHueNamed(h, s = 100, l = 50) { return colorFromHslNamed(h, s, l); }
function colorFromHwb(h, wPercent, bPercent) {
  let [r, g, b] = colorHwb360ToRgbArray(h, wPercent, bPercent);
  return colorRgbArgsToHex79(r, g, b);
}
function colorFromNat(ncol, wPercent, bPercent) {
  return colorFromNcol(ncol, wPercent, bPercent);
}
function colorFromNcol(ncol, wPercent, bPercent) {
  let h = colorNcolToHue(ncol); if (VERBOSE) console.log('hue', h);
  return colorFromHwb(h, wPercent, bPercent);
}
function colorFromRgb(r, g, b) { return colorFrom({ r, g, b }); }
function colorFromRgbNamed(r, g, b) { let x = colorFrom({ r, g, b }); return colorNearestNamed(x); }
function colorGetBlack(c) { return colorToHwb360Object(c).b; }
function colorGetBucket(c) {
  let buckets = 'red orange yellow lime green greencyan cyan cyanblue blue bluemagenta magenta magentared black'.split(' ');
  c = colorFrom(c);
  let hsl = colorHexToHsl360Object(c);
  let hue = hsl.h;
  let hshift = (hue + 16) % 360;
  let ib = Math.floor(hshift / 30);
  return buckets[ib];
}
function colorGetContrast(c1, c2) {
  function luminance(r, g, b) {
    var a = [r, g, b].map(function (v) {
      v /= 255;
      return v <= 0.03928
        ? v / 12.92
        : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }
  let rgb1 = colorHexToRgbArray(colorFrom(c1));
  let rgb2 = colorHexToRgbArray(colorFrom(c2));
  var lum1 = luminance(rgb1[0], rgb1[1], rgb1[2]);
  var lum2 = luminance(rgb2[0], rgb2[1], rgb2[2]);
  var brightest = Math.max(lum1, lum2);
  var darkest = Math.min(lum1, lum2);
  let res = (brightest + 0.05) / (darkest + 0.05);
  return Number(res.toFixed(3));
}
function colorGetDicolorList() {
  let di = M.dicolor;
  let list = [];
  for (const k in di) {
    let bucket = di[k];
    for (const name in bucket) {
      let o = { name, bucket: k, hex: bucket[name] };
      list.push(o);
    }
  }
  return list;
}
function colorGetHue(c) { return colorGetHue01(c) * 360; }
function colorGetHue01(c) {
  let hex = colorFrom(c);
  let hsl = colorHexToHsl01Array(hex);
  return hsl[0];
}
function colorGetLum(c) { return colorGetLum01(c) * 100; }
function colorGetLum01(c) {
  let hex = colorFrom(c);
  let hsl = colorHexToHsl01Array(hex);
  return hsl[2];
}
function colorGetPureHue(c) { c = colorO(c); return c.hue == 0 ? c.hex : colorFromHsl(c.hue, 100, 50); }
function colorGetSat(c) { return colorGetSat01(c) * 100; }
function colorGetSat01(c) {
  let hex = colorFrom(c);
  let hsl = colorHexToHsl01Array(hex);
  return hsl[1];
}
function colorGetWhite(c) { return colorToHwb360Object(c).w; }
function colorGradient(sColors, type = 'linear', param = null) {
  if (type == 'linear' && !param) param = '45deg';
  if (param && isNumber(param)) param += 'deg';
  if (param) param = `${param},`; else param = '';
  if (nundef(sColors)) sColors = `${rColor()},${rColor()}`;
  else if (!sColors.includes('#')) {
    let list = toWords(sColors, true); if (VERBOSE) console.log(list);
    sColors = list.map(x => colorFrom(x)).join(', ');
  }
  return `${type}-gradient(${param}${sColors})`;
}
function colorHex45ToHex79(c) {
  let r = c[1];
  let g = c[2];
  let b = c[3];
  if (c.length == 5) return `#${r}${r}${g}${g}${b}${b}${c[4]}${c[4]}`;
  return `#${r}${r}${g}${g}${b}${b}`;
}
function colorHex79ToRgbArray(c) {
  let r = 0, g = 0, b = 0;
  r = parseInt(c[1] + c[2], 16);
  g = parseInt(c[3] + c[4], 16);
  b = parseInt(c[5] + c[6], 16);
  if (c.length == 7) return [r, g, b];
  let a = parseInt(c[7] + c[8], 16) / 255;
  return [r, g, b, a];
}
function colorHexToHsl01Array(c) { return colorRgbArgsToHsl01Array(...colorHexToRgbArray(c)); }
function colorHexToHsl360Object(c) {
  let arr = colorHexToHsl01Array(c);
  return colorHsl01ArrayToHsl360Object(arr);
}
function colorHexToHsl360String(c) {
  let arr = colorHexToHsl01Array(c);
  let o = colorHsl01ArrayToHsl360Object(arr);
  if (nundef(o.a)) return `hsl(${o.h},${o.s}%,${o.l}%)`;
  return `hsla(${o.h},${o.s}%,${o.l}%,${o.a})`;
}
function colorHexToHslRounded(c) {
  let arr = colorHexToHsl01Array(c);
  let o = colorHsl01ArrayToHsl360Object(arr);
  return { h: Math.round(o.h), s: Math.round(o.s), l: Math.round(o.l) };
}
function colorHexToRgbArray(c) {
  if (c.length < 7) c = colorHex45ToHex79(c);
  return colorHex79ToRgbArray(c);
}
function colorHexToRgbObject(c) {
  let arr = colorHexToRgbArray(c);
  let o = { r: arr[0], g: arr[1], b: arr[2] };
  if (arr.length > 3) o.a = arr[3];
  return o;
}
function colorHexToRgbString(hex) {
  let o = colorHexToRgbObject(hex);
  if (nundef(o.a)) return `rgb(${o.r},${o.g},${o.b})`;
  return `rgba(${o.r},${o.g},${o.b},${o.a})`;
}
function colorHsl01ArgsToHex79(h, s, l, a) {
  let rgb = colorHsl01ArgsToRgbArray(h, s, l, a);
  let res = colorRgbArgsToHex79(rgb[0], rgb[1], rgb[2], rgb.length > 3 ? rgb[3] : null);
  return res;
}
function colorHsl01ArgsToRgbArray(h, s, l, a) {
  let r, g, b;
  function hue2rgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }
  if (s === 0) {
    r = g = b = l;
  } else {
    let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    let p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  let res = [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  if (nundef(a) || a == 1) return res;
  res.push(a);
  return res;
}
function colorHsl01ArrayToHsl360Object(arr) {
  let res = { h: arr[0] * 360, s: arr[1] * 100, l: arr[2] * 100 };
  if (arr.length > 3) res.a = arr[3];
  return res;
}
function colorHsl01ObjectToHex79(c) {
  if (isdef(c.a)) return colorHsl01ArgsToHex79(c.h, c.s, c.l, c.a);
  return colorHsl01ArgsToHex79(c.h, c.s, c.l);
}
function colorHsl360ArgsToHex79(h, s, l, a) {
  let o01 = colorHsl360ArgsToHsl01Object(h, s, l, a);
  return colorHsl01ArgsToHex79(o01.h, o01.s, o01.l, o01.a)
}
function colorHsl360ArgsToHsl01Object(h, s, l, a) {
  let res = { h: h / 360, s: s / 100, l: l / 100 };
  if (isdef(a)) res.a = a;
  return res;
}
function colorHsl360ObjectToHex79(c) {
  let o01 = colorHsl360ArgsToHsl01Object(c.h, c.s, c.l, c.a);
  return colorHsl01ObjectToHex79(o01)
}
function colorHsl360StringToHex79(c) {
  let o360 = colorHsl360StringToHsl360Object(c);
  let o01 = colorHsl360ArgsToHsl01Object(o360.h, o360.s, o360.l, o360.a);
  return colorHsl01ObjectToHex79(o01);
}
function colorHsl360StringToHsl360Object(c) {
  let [h, s, l, a] = c.match(/\d+\.?\d*/g).map(Number);
  if (isdef(a) && a > 1) a /= 10;
  return { h, s, l, a };
}
function colorHueToNat(hue) {
  let x = Math.floor(hue / 60);
  let pure = ['red', 'yellow', 'green', 'cyan', 'blue', 'magenta'];
  let color = pure[x];
  let inc = hue % 60;
  return color.toUpperCase()[0] + inc;
}
function colorHueToNcol(hue) {
  let x = Math.floor(hue / 60);
  let pure = ['red', 'yellow', 'green', 'cyan', 'blue', 'magenta'];
  let color = pure[x];
  let inc = (hue % 60) / 0.6;
  return color.toUpperCase()[0] + toPercent(hue % 60, 60);
}
function colorHwb360ToRgbArray(h, w, b) {
  let [r, g, blue] = colorHsl01ArgsToRgbArray(h / 360, 1, 0.5);
  let whiteness = w / 100;
  let blackness = b / 100;
  r = Math.round((r / 255 * (1 - whiteness - blackness) + whiteness) * 255);
  g = Math.round((g / 255 * (1 - whiteness - blackness) + whiteness) * 255);
  b = Math.round((blue / 255 * (1 - whiteness - blackness) + whiteness) * 255);
  return [r, g, b];
}
function colorIdealText(bg, grayPreferred = false, nThreshold = 105) {
  let rgb = colorHexToRgbObject(colorFrom(bg));
  let r = rgb.r;
  let g = rgb.g;
  let b = rgb.b;
  var bgDelta = r * 0.299 + g * 0.587 + b * 0.114;
  var foreColor = 255 - bgDelta < nThreshold ? 'black' : 'white';
  if (grayPreferred) foreColor = 255 - bgDelta < nThreshold ? 'dimgray' : 'snow';
  return foreColor;
}
function colorIsGrey(c, tolerance = 5) {
  let { r, g, b } = colorHexToRgbObject(colorFrom(c));
  return Math.abs(r - g) <= tolerance && Math.abs(r - b) <= tolerance && Math.abs(g - b) <= tolerance;
}
function colorIsHex79(c) { return isString(c) && c[0] == '#' && (c.length == 7 || c.length == 9); }
function colorLight(c, percent = 20, log = true) {
  if (nundef(c)) {
    return colorHsl360ArgsToHex79(rHue(), 100, 85);
  } else c = colorFrom(c);
  let zero1 = percent / 100;
  return colorCalculator(zero1, c, undefined, !log);
}
function colorMix(c1, c2, percent = 50) {
  return colorCalculator(percent / 100, colorFrom(c2), colorFrom(c1), true);
}
function colorNatToHue(ncol) {
  let pure = ['red', 'yellow', 'green', 'cyan', 'blue', 'magenta'].map(x => x.toUpperCase()[0]);
  let [letter, num] = [ncol[0], Number(ncol.substring(1))];
  let idx = pure.indexOf(letter);
  let hue = idx * 60 + num;
  return hue;
}
function colorNcolToHue(ncol) {
  let pure = ['red', 'yellow', 'green', 'cyan', 'blue', 'magenta'].map(x => x.toUpperCase()[0]);
  let [letter, num] = [ncol[0], Number(ncol.substring(1))];
  let idx = pure.indexOf(letter);
  let hue = idx * 60 + fromPercent(num, 60);
  return hue;
}
function colorNearestNamed(inputColor, namedColors) {
  if (nundef(namedColors)) namedColors = M.colorList;
  let minDistance = Infinity;
  let nearestColor = null;
  namedColors.forEach(namedColor => {
    let distance = colorDistance(inputColor, namedColor.hex);
    if (distance < minDistance) {
      minDistance = distance;
      nearestColor = namedColor;
    }
  });
  return nearestColor;
}
function colorO(c) {
  if (isDict(c)) return c;
  let hex = colorFrom(c);
  let o = w3color(hex);
  let named = colorNearestNamed(hex);
  let distance = Math.round(colorDistance(named.hex, hex));
  o.name = named.name;
  o.distance = distance;
  o.bucket = colorGetBucket(hex);
  o.hex = hex;
  return o;
}
function colorPalette(color, type = 'shade') { return colorShades(colorFrom(color)); }
function colorPaletteFromImage(img) {
  if (nundef(ColorThiefObject)) ColorThiefObject = new ColorThief();
  return ColorThiefObject.getPalette(img).map(x => colorFrom(x));
}
function colorPaletteFromUrl(path) {
  let img = mCreateFrom(`<img src='${path}' />`);
  let pal = colorPaletteFromImage(img);
  return pal;
}
function colorRgbArgsToHex79(r, g, b, a) {
  r = Math.round(r).toString(16).padStart(2, '0');
  g = Math.round(g).toString(16).padStart(2, '0');
  b = Math.round(b).toString(16).padStart(2, '0');
  if (nundef(a)) return `#${r}${g}${b}`;
  a = Math.round(a * 255).toString(16).padStart(2, '0');
  return `#${r}${g}${b}${a}`;
}
function colorRgbArgsToHsl01Array(r, g, b) {
  r /= 255, g /= 255, b /= 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, l];
}
function colorRgbArrayToHex79(arr) { return colorRgbArgsToHex79(...arr); }
function colorRgbStringToHex79(c) {
  let parts = c.split(',');
  let r = firstNumber(parts[0]);
  let g = firstNumber(parts[1]);
  let b = firstNumber(parts[2]);
  let a = parts.length > 3 ? Number(stringBefore(parts[3], ')')) : null;
  return colorRgbArgsToHex79(r, g, b, a);
}
function colorSample(d, color) {
  if (nundef(d)) return;
  mStyle(d, { bg: color, fg: colorIdealText(color) }); //, fg:colorIdealText(color) });  
  d.innerHTML = `${color}<br>${w3color(color).toHslString()}`;
}
function colorSchemeRYB() {
  let ryb = ['#FE2712', '#FC600A', '#FB9902', '#FCCC1A', '#FEFE33', '#B2D732', '#66B032', '#347C98', '#0247FE', '#4424D6', '#8601AF', '#C21460'];
  return ryb;
  if (VERBOSE) console.log('w3color', w3color('deeppink'))
  for (const c of ryb) {
    let cw = w3color(c);
    if (VERBOSE) console.log(cw.hue, cw.sat, cw.lightness, cw.ncol);
  }
}
function colorShades(color) {
  let res = [];
  for (let frac = -0.8; frac <= 0.8; frac += 0.2) {
    let c = colorCalculator(frac, color, undefined, true);
    res.push(c);
  }
  return res;
}
function colorSortByLightness(list) {
  let ext = list.map(x => colorO(x));
  let sorted = sortByDescending(ext, 'lightness').map(x => x.hex);
  return sorted;
}
function colorToHex79(c) {
  if (colorIsHex79(c)) return c;
  ColorDi = M.colorByName;
  let tString = isString(c), tArr = isList(c), tObj = isDict(c);
  if (tString && c[0] == '#') return colorHex45ToHex79(c);
  else if (tString && isdef(ColorDi) && lookup(ColorDi, [c])) { return ColorDi[c].hex; }
  else if (tString && c.startsWith('rand')) {
    let spec = capitalize(c.substring(4));
    let func = window['color' + spec];
    c = isdef(func) ? func() : rColor();
    assertion(colorIsHex79(c), 'ERROR coloFrom!!!!!!!!! (rand)');
    return c;
  } else if (tString && (c.startsWith('linear') || c.startsWith('radial'))) return c;
  else if (tString && c.startsWith('rgb')) return colorRgbStringToHex79(c);
  else if (tString && c.startsWith('hsl')) return colorHsl360StringToHex79(c);
  else if (tString && c == 'transparent') return '#00000000';
  else if (tString && c == 'inherit') return c;
  else if (tString) { ensureColorDict(); let c1 = ColorDi[c]; assertion(isdef(c1), `UNKNOWN color ${c}`); return c1.hex; }
  else if (tArr && (c.length == 3 || c.length == 4) && isNumber(c[0])) return colorRgbArrayToHex79(c);
  else if (tArr) return colorToHex79(rChoose(tArr));
  else if (tObj && 'h' in c && c.h > 1) { return colorHsl360ObjectToHex79(c); }
  else if (tObj && 'h' in c) return colorHsl01ObjectToHex79(c);
  else if (tObj && 'r' in c) return colorRgbArgsToHex79(c.r, c.g, c.b, c.a);
  assertion(false, `NO COLOR FOUND FOR ${c}`);
}
function colorToHwb360Object(c) {
  c = colorFrom(c);
  let [r, g, blue] = colorHexToRgbArray(c);
  let [h, s, l] = colorHexToHsl01Array(c); h *= 360;
  let w = 100 * Math.min(r, g, blue) / 255;
  let b = 100 * (1 - Math.max(r, g, blue) / 255);
  return { h, w, b };
}
function colorToHwbRounded(c) {
  let o = colorToHwb360Object(c);
  return { h: Math.round(o.h), w: Math.round(o.w), b: Math.round(o.b) };
}
function colorTrans(cAny, alpha = 0.5) { return colorFrom(cAny, alpha); }
function colorTurnHueBy(color, inc = 180) {
  let [r, g, b] = colorHexToRgbArray(colorFrom(color));
  let [h, s, l] = colorRgbArgsToHsl01Array(r, g, b); h *= 360;
  h = (h + inc) % 360;
  let [newR, newG, newB] = colorHsl01ArgsToRgbArray(h / 360, s, l);
  return colorRgbArgsToHex79(newR, newG, newB);
}
function colormapAsString() {
  let html = `
    <area style='cursor:pointer' shape='poly' coords='63,0,72,4,72,15,63,19,54,15,54,4' onclick='clickColor("#003366",-200,54)' onmouseover='mouseOverColor("#003366")' alt='#003366' />
    <area style='cursor:pointer' shape='poly' coords='81,0,90,4,90,15,81,19,72,15,72,4' onclick='clickColor("#336699",-200,72)' onmouseover='mouseOverColor("#336699")' alt='#336699' />
    <area style='cursor:pointer' shape='poly' coords='99,0,108,4,108,15,99,19,90,15,90,4' onclick='clickColor("#3366CC",-200,90)' onmouseover='mouseOverColor("#3366CC")' alt='#3366CC' />
    <area style='cursor:pointer' shape='poly' coords='117,0,126,4,126,15,117,19,108,15,108,4' onclick='clickColor("#003399",-200,108)' onmouseover='mouseOverColor("#003399")' alt='#003399' />
    <area style='cursor:pointer' shape='poly' coords='135,0,144,4,144,15,135,19,126,15,126,4' onclick='clickColor("#000099",-200,126)' onmouseover='mouseOverColor("#000099")' alt='#000099' />
    <area style='cursor:pointer' shape='poly' coords='153,0,162,4,162,15,153,19,144,15,144,4' onclick='clickColor("#0000CC",-200,144)' onmouseover='mouseOverColor("#0000CC")' alt='#0000CC' />
    <area style='cursor:pointer' shape='poly' coords='171,0,180,4,180,15,171,19,162,15,162,4' onclick='clickColor("#000066",-200,162)' onmouseover='mouseOverColor("#000066")' alt='#000066' />
    <area style='cursor:pointer' shape='poly' coords='54,15,63,19,63,30,54,34,45,30,45,19' onclick='clickColor("#006666",-185,45)' onmouseover='mouseOverColor("#006666")' alt='#006666' />
    <area style='cursor:pointer' shape='poly' coords='72,15,81,19,81,30,72,34,63,30,63,19' onclick='clickColor("#006699",-185,63)' onmouseover='mouseOverColor("#006699")' alt='#006699' />
    <area style='cursor:pointer' shape='poly' coords='90,15,99,19,99,30,90,34,81,30,81,19' onclick='clickColor("#0099CC",-185,81)' onmouseover='mouseOverColor("#0099CC")' alt='#0099CC' />
    <area style='cursor:pointer' shape='poly' coords='108,15,117,19,117,30,108,34,99,30,99,19' onclick='clickColor("#0066CC",-185,99)' onmouseover='mouseOverColor("#0066CC")' alt='#0066CC' />
    <area style='cursor:pointer' shape='poly' coords='126,15,135,19,135,30,126,34,117,30,117,19' onclick='clickColor("#0033CC",-185,117)' onmouseover='mouseOverColor("#0033CC")' alt='#0033CC' />
    <area style='cursor:pointer' shape='poly' coords='144,15,153,19,153,30,144,34,135,30,135,19' onclick='clickColor("#0000FF",-185,135)' onmouseover='mouseOverColor("#0000FF")' alt='#0000FF' />
    <area style='cursor:pointer' shape='poly' coords='162,15,171,19,171,30,162,34,153,30,153,19' onclick='clickColor("#3333FF",-185,153)' onmouseover='mouseOverColor("#3333FF")' alt='#3333FF' />
    <area style='cursor:pointer' shape='poly' coords='180,15,189,19,189,30,180,34,171,30,171,19' onclick='clickColor("#333399",-185,171)' onmouseover='mouseOverColor("#333399")' alt='#333399' />
    <area style='cursor:pointer' shape='poly' coords='45,30,54,34,54,45,45,49,36,45,36,34' onclick='clickColor("#669999",-170,36)' onmouseover='mouseOverColor("#669999")' alt='#669999' />
    <area style='cursor:pointer' shape='poly' coords='63,30,72,34,72,45,63,49,54,45,54,34' onclick='clickColor("#009999",-170,54)' onmouseover='mouseOverColor("#009999")' alt='#009999' />
    <area style='cursor:pointer' shape='poly' coords='81,30,90,34,90,45,81,49,72,45,72,34' onclick='clickColor("#33CCCC",-170,72)' onmouseover='mouseOverColor("#33CCCC")' alt='#33CCCC' />
    <area style='cursor:pointer' shape='poly' coords='99,30,108,34,108,45,99,49,90,45,90,34' onclick='clickColor("#00CCFF",-170,90)' onmouseover='mouseOverColor("#00CCFF")' alt='#00CCFF' />
    <area style='cursor:pointer' shape='poly' coords='117,30,126,34,126,45,117,49,108,45,108,34' onclick='clickColor("#0099FF",-170,108)' onmouseover='mouseOverColor("#0099FF")' alt='#0099FF' />
    <area style='cursor:pointer' shape='poly' coords='135,30,144,34,144,45,135,49,126,45,126,34' onclick='clickColor("#0066FF",-170,126)' onmouseover='mouseOverColor("#0066FF")' alt='#0066FF' />
    <area style='cursor:pointer' shape='poly' coords='153,30,162,34,162,45,153,49,144,45,144,34' onclick='clickColor("#3366FF",-170,144)' onmouseover='mouseOverColor("#3366FF")' alt='#3366FF' />
    <area style='cursor:pointer' shape='poly' coords='171,30,180,34,180,45,171,49,162,45,162,34' onclick='clickColor("#3333CC",-170,162)' onmouseover='mouseOverColor("#3333CC")' alt='#3333CC' />
    <area style='cursor:pointer' shape='poly' coords='189,30,198,34,198,45,189,49,180,45,180,34' onclick='clickColor("#666699",-170,180)' onmouseover='mouseOverColor("#666699")' alt='#666699' />
    <area style='cursor:pointer' shape='poly' coords='36,45,45,49,45,60,36,64,27,60,27,49' onclick='clickColor("#339966",-155,27)' onmouseover='mouseOverColor("#339966")' alt='#339966' />
    <area style='cursor:pointer' shape='poly' coords='54,45,63,49,63,60,54,64,45,60,45,49' onclick='clickColor("#00CC99",-155,45)' onmouseover='mouseOverColor("#00CC99")' alt='#00CC99' />
    <area style='cursor:pointer' shape='poly' coords='72,45,81,49,81,60,72,64,63,60,63,49' onclick='clickColor("#00FFCC",-155,63)' onmouseover='mouseOverColor("#00FFCC")' alt='#00FFCC' />
    <area style='cursor:pointer' shape='poly' coords='90,45,99,49,99,60,90,64,81,60,81,49' onclick='clickColor("#00FFFF",-155,81)' onmouseover='mouseOverColor("#00FFFF")' alt='#00FFFF' />
    <area style='cursor:pointer' shape='poly' coords='108,45,117,49,117,60,108,64,99,60,99,49' onclick='clickColor("#33CCFF",-155,99)' onmouseover='mouseOverColor("#33CCFF")' alt='#33CCFF' />
    <area style='cursor:pointer' shape='poly' coords='126,45,135,49,135,60,126,64,117,60,117,49' onclick='clickColor("#3399FF",-155,117)' onmouseover='mouseOverColor("#3399FF")' alt='#3399FF' />
    <area style='cursor:pointer' shape='poly' coords='144,45,153,49,153,60,144,64,135,60,135,49' onclick='clickColor("#6699FF",-155,135)' onmouseover='mouseOverColor("#6699FF")' alt='#6699FF' />
    <area style='cursor:pointer' shape='poly' coords='162,45,171,49,171,60,162,64,153,60,153,49' onclick='clickColor("#6666FF",-155,153)' onmouseover='mouseOverColor("#6666FF")' alt='#6666FF' />
    <area style='cursor:pointer' shape='poly' coords='180,45,189,49,189,60,180,64,171,60,171,49' onclick='clickColor("#6600FF",-155,171)' onmouseover='mouseOverColor("#6600FF")' alt='#6600FF' />
    <area style='cursor:pointer' shape='poly' coords='198,45,207,49,207,60,198,64,189,60,189,49' onclick='clickColor("#6600CC",-155,189)' onmouseover='mouseOverColor("#6600CC")' alt='#6600CC' />
    <area style='cursor:pointer' shape='poly' coords='27,60,36,64,36,75,27,79,18,75,18,64' onclick='clickColor("#339933",-140,18)' onmouseover='mouseOverColor("#339933")' alt='#339933' />
    <area style='cursor:pointer' shape='poly' coords='45,60,54,64,54,75,45,79,36,75,36,64' onclick='clickColor("#00CC66",-140,36)' onmouseover='mouseOverColor("#00CC66")' alt='#00CC66' />
    <area style='cursor:pointer' shape='poly' coords='63,60,72,64,72,75,63,79,54,75,54,64' onclick='clickColor("#00FF99",-140,54)' onmouseover='mouseOverColor("#00FF99")' alt='#00FF99' />
    <area style='cursor:pointer' shape='poly' coords='81,60,90,64,90,75,81,79,72,75,72,64' onclick='clickColor("#66FFCC",-140,72)' onmouseover='mouseOverColor("#66FFCC")' alt='#66FFCC' />
    <area style='cursor:pointer' shape='poly' coords='99,60,108,64,108,75,99,79,90,75,90,64' onclick='clickColor("#66FFFF",-140,90)' onmouseover='mouseOverColor("#66FFFF")' alt='#66FFFF' />
    <area style='cursor:pointer' shape='poly' coords='117,60,126,64,126,75,117,79,108,75,108,64' onclick='clickColor("#66CCFF",-140,108)' onmouseover='mouseOverColor("#66CCFF")' alt='#66CCFF' />
    <area style='cursor:pointer' shape='poly' coords='135,60,144,64,144,75,135,79,126,75,126,64' onclick='clickColor("#99CCFF",-140,126)' onmouseover='mouseOverColor("#99CCFF")' alt='#99CCFF' />
    <area style='cursor:pointer' shape='poly' coords='153,60,162,64,162,75,153,79,144,75,144,64' onclick='clickColor("#9999FF",-140,144)' onmouseover='mouseOverColor("#9999FF")' alt='#9999FF' />
    <area style='cursor:pointer' shape='poly' coords='171,60,180,64,180,75,171,79,162,75,162,64' onclick='clickColor("#9966FF",-140,162)' onmouseover='mouseOverColor("#9966FF")' alt='#9966FF' />
    <area style='cursor:pointer' shape='poly' coords='189,60,198,64,198,75,189,79,180,75,180,64' onclick='clickColor("#9933FF",-140,180)' onmouseover='mouseOverColor("#9933FF")' alt='#9933FF' />
    <area style='cursor:pointer' shape='poly' coords='207,60,216,64,216,75,207,79,198,75,198,64' onclick='clickColor("#9900FF",-140,198)' onmouseover='mouseOverColor("#9900FF")' alt='#9900FF' />
    <area style='cursor:pointer' shape='poly' coords='18,75,27,79,27,90,18,94,9,90,9,79' onclick='clickColor("#006600",-125,9)' onmouseover='mouseOverColor("#006600")' alt='#006600' />
    <area style='cursor:pointer' shape='poly' coords='36,75,45,79,45,90,36,94,27,90,27,79' onclick='clickColor("#00CC00",-125,27)' onmouseover='mouseOverColor("#00CC00")' alt='#00CC00' />
    <area style='cursor:pointer' shape='poly' coords='54,75,63,79,63,90,54,94,45,90,45,79' onclick='clickColor("#00FF00",-125,45)' onmouseover='mouseOverColor("#00FF00")' alt='#00FF00' />
    <area style='cursor:pointer' shape='poly' coords='72,75,81,79,81,90,72,94,63,90,63,79' onclick='clickColor("#66FF99",-125,63)' onmouseover='mouseOverColor("#66FF99")' alt='#66FF99' />
    <area style='cursor:pointer' shape='poly' coords='90,75,99,79,99,90,90,94,81,90,81,79' onclick='clickColor("#99FFCC",-125,81)' onmouseover='mouseOverColor("#99FFCC")' alt='#99FFCC' />
    <area style='cursor:pointer' shape='poly' coords='108,75,117,79,117,90,108,94,99,90,99,79' onclick='clickColor("#CCFFFF",-125,99)' onmouseover='mouseOverColor("#CCFFFF")' alt='#CCFFFF' />
    <area style='cursor:pointer' shape='poly' coords='126,75,135,79,135,90,126,94,117,90,117,79' onclick='clickColor("#CCCCFF",-125,117)' onmouseover='mouseOverColor("#CCCCFF")' alt='#CCCCFF' />
    <area style='cursor:pointer' shape='poly' coords='144,75,153,79,153,90,144,94,135,90,135,79' onclick='clickColor("#CC99FF",-125,135)' onmouseover='mouseOverColor("#CC99FF")' alt='#CC99FF' />
    <area style='cursor:pointer' shape='poly' coords='162,75,171,79,171,90,162,94,153,90,153,79' onclick='clickColor("#CC66FF",-125,153)' onmouseover='mouseOverColor("#CC66FF")' alt='#CC66FF' />
    <area style='cursor:pointer' shape='poly' coords='180,75,189,79,189,90,180,94,171,90,171,79' onclick='clickColor("#CC33FF",-125,171)' onmouseover='mouseOverColor("#CC33FF")' alt='#CC33FF' />
    <area style='cursor:pointer' shape='poly' coords='198,75,207,79,207,90,198,94,189,90,189,79' onclick='clickColor("#CC00FF",-125,189)' onmouseover='mouseOverColor("#CC00FF")' alt='#CC00FF' />
    <area style='cursor:pointer' shape='poly' coords='216,75,225,79,225,90,216,94,207,90,207,79' onclick='clickColor("#9900CC",-125,207)' onmouseover='mouseOverColor("#9900CC")' alt='#9900CC' />
    <area style='cursor:pointer' shape='poly' coords='9,90,18,94,18,105,9,109,0,105,0,94' onclick='clickColor("#003300",-110,0)' onmouseover='mouseOverColor("#003300")' alt='#003300' />
    <area style='cursor:pointer' shape='poly' coords='27,90,36,94,36,105,27,109,18,105,18,94' onclick='clickColor("#009933",-110,18)' onmouseover='mouseOverColor("#009933")' alt='#009933' />
    <area style='cursor:pointer' shape='poly' coords='45,90,54,94,54,105,45,109,36,105,36,94' onclick='clickColor("#33CC33",-110,36)' onmouseover='mouseOverColor("#33CC33")' alt='#33CC33' />
    <area style='cursor:pointer' shape='poly' coords='63,90,72,94,72,105,63,109,54,105,54,94' onclick='clickColor("#66FF66",-110,54)' onmouseover='mouseOverColor("#66FF66")' alt='#66FF66' />
    <area style='cursor:pointer' shape='poly' coords='81,90,90,94,90,105,81,109,72,105,72,94' onclick='clickColor("#99FF99",-110,72)' onmouseover='mouseOverColor("#99FF99")' alt='#99FF99' />
    <area style='cursor:pointer' shape='poly' coords='99,90,108,94,108,105,99,109,90,105,90,94' onclick='clickColor("#CCFFCC",-110,90)' onmouseover='mouseOverColor("#CCFFCC")' alt='#CCFFCC' />
    <area style='cursor:pointer' shape='poly' coords='117,90,126,94,126,105,117,109,108,105,108,94' onclick='clickColor("#FFFFFF",-110,108)' onmouseover='mouseOverColor("#FFFFFF")' alt='#FFFFFF' />
    <area style='cursor:pointer' shape='poly' coords='135,90,144,94,144,105,135,109,126,105,126,94' onclick='clickColor("#FFCCEE",-110,126)' onmouseover='mouseOverColor("#FFCCEE")' alt='#FFCCFF' />
    <area style='cursor:pointer' shape='poly' coords='153,90,162,94,162,105,153,109,144,105,144,94' onclick='clickColor("#FFAAEE",-110,144)' onmouseover='mouseOverColor("#FFAAEE")' alt='#FF33DD' />
    <area style='cursor:pointer' shape='poly' coords='171,90,180,94,180,105,171,109,162,105,162,94' onclick='clickColor("#FF88EE",-110,162)' onmouseover='mouseOverColor("#FF88EE")' alt='#FF66FF' />
    <area style='cursor:pointer' shape='poly' coords='189,90,198,94,198,105,189,109,180,105,180,94' onclick='clickColor("#FF14EE",-110,180)' onmouseover='mouseOverColor("#FF14EE")' alt='#FF00FF' />
    <area style='cursor:pointer' shape='poly' coords='207,90,216,94,216,105,207,109,198,105,198,94' onclick='clickColor("#CC00CC",-110,198)' onmouseover='mouseOverColor("#CC00CC")' alt='#CC00CC' />
    <area style='cursor:pointer' shape='poly' coords='225,90,234,94,234,105,225,109,216,105,216,94' onclick='clickColor("#660066",-110,216)' onmouseover='mouseOverColor("#660066")' alt='#660066' />
    <area style='cursor:pointer' shape='poly' coords='18,105,27,109,27,120,18,124,9,120,9,109' onclick='clickColor("#336600",-95,9)' onmouseover='mouseOverColor("#336600")' alt='#336600' />
    <area style='cursor:pointer' shape='poly' coords='36,105,45,109,45,120,36,124,27,120,27,109' onclick='clickColor("#009900",-95,27)' onmouseover='mouseOverColor("#009900")' alt='#009900' />
    <area style='cursor:pointer' shape='poly' coords='54,105,63,109,63,120,54,124,45,120,45,109' onclick='clickColor("#66FF33",-95,45)' onmouseover='mouseOverColor("#66FF33")' alt='#66FF33' />
    <area style='cursor:pointer' shape='poly' coords='72,105,81,109,81,120,72,124,63,120,63,109' onclick='clickColor("#99FF66",-95,63)' onmouseover='mouseOverColor("#99FF66")' alt='#99FF66' />
    <area style='cursor:pointer' shape='poly' coords='90,105,99,109,99,120,90,124,81,120,81,109' onclick='clickColor("#CCFF99",-95,81)' onmouseover='mouseOverColor("#CCFF99")' alt='#CCFF99' />
    <area style='cursor:pointer' shape='poly' coords='108,105,117,109,117,120,108,124,99,120,99,109' onclick='clickColor("#FFFFCC",-95,99)' onmouseover='mouseOverColor("#FFFFCC")' alt='#FFFFCC' />
    <area style='cursor:pointer' shape='poly' coords='126,105,135,109,135,120,126,124,117,120,117,109' onclick='clickColor("#FFCCCC",-95,117)' onmouseover='mouseOverColor("#FFCCCC")' alt='#FFCCCC' />
    <area style='cursor:pointer' shape='poly' coords='144,105,153,109,153,120,144,124,135,120,135,109' onclick='clickColor("#FF99CC",-95,135)' onmouseover='mouseOverColor("#FF99CC")' alt='#FF99CC' />
    <area style='cursor:pointer' shape='poly' coords='162,105,171,109,171,120,162,124,153,120,153,109' onclick='clickColor("#FF66CC",-95,153)' onmouseover='mouseOverColor("#FF66CC")' alt='#FF66CC' />
    <area style='cursor:pointer' shape='poly' coords='180,105,189,109,189,120,180,124,171,120,171,109' onclick='clickColor("#FF33CC",-95,171)' onmouseover='mouseOverColor("#FF33CC")' alt='#FF33CC' />
    <area style='cursor:pointer' shape='poly' coords='198,105,207,109,207,120,198,124,189,120,189,109' onclick='clickColor("#CC0099",-95,189)' onmouseover='mouseOverColor("#CC0099")' alt='#CC0099' />
    <area style='cursor:pointer' shape='poly' coords='216,105,225,109,225,120,216,124,207,120,207,109' onclick='clickColor("#993399",-95,207)' onmouseover='mouseOverColor("#993399")' alt='#993399' />
    <area style='cursor:pointer' shape='poly' coords='27,120,36,124,36,135,27,139,18,135,18,124' onclick='clickColor("#333300",-80,18)' onmouseover='mouseOverColor("#333300")' alt='#333300' />
    <area style='cursor:pointer' shape='poly' coords='45,120,54,124,54,135,45,139,36,135,36,124' onclick='clickColor("#669900",-80,36)' onmouseover='mouseOverColor("#669900")' alt='#669900' />
    <area style='cursor:pointer' shape='poly' coords='63,120,72,124,72,135,63,139,54,135,54,124' onclick='clickColor("#99FF33",-80,54)' onmouseover='mouseOverColor("#99FF33")' alt='#99FF33' />
    <area style='cursor:pointer' shape='poly' coords='81,120,90,124,90,135,81,139,72,135,72,124' onclick='clickColor("#CCFF66",-80,72)' onmouseover='mouseOverColor("#CCFF66")' alt='#CCFF66' />
    <area style='cursor:pointer' shape='poly' coords='99,120,108,124,108,135,99,139,90,135,90,124' onclick='clickColor("#FFFF99",-80,90)' onmouseover='mouseOverColor("#FFFF99")' alt='#FFFF99' />
    <area style='cursor:pointer' shape='poly' coords='117,120,126,124,126,135,117,139,108,135,108,124' onclick='clickColor("#FFCC99",-80,108)' onmouseover='mouseOverColor("#FFCC99")' alt='#FFCC99' />
    <area style='cursor:pointer' shape='poly' coords='135,120,144,124,144,135,135,139,126,135,126,124' onclick='clickColor("#FF9999",-80,126)' onmouseover='mouseOverColor("#FF9999")' alt='#FF9999' />
    <area style='cursor:pointer' shape='poly' coords='153,120,162,124,162,135,153,139,144,135,144,124' onclick='clickColor("#FF6699",-80,144)' onmouseover='mouseOverColor("#FF6699")' alt='#FF6699' />
    <area style='cursor:pointer' shape='poly' coords='171,120,180,124,180,135,171,139,162,135,162,124' onclick='clickColor("#FF3399",-80,162)' onmouseover='mouseOverColor("#FF3399")' alt='#FF3399' />
    <area style='cursor:pointer' shape='poly' coords='189,120,198,124,198,135,189,139,180,135,180,124' onclick='clickColor("#CC3399",-80,180)' onmouseover='mouseOverColor("#CC3399")' alt='#CC3399' />
    <area style='cursor:pointer' shape='poly' coords='207,120,216,124,216,135,207,139,198,135,198,124' onclick='clickColor("#990099",-80,198)' onmouseover='mouseOverColor("#990099")' alt='#990099' />
    <area style='cursor:pointer' shape='poly' coords='36,135,45,139,45,150,36,154,27,150,27,139' onclick='clickColor("#666633",-65,27)' onmouseover='mouseOverColor("#666633")' alt='#666633' />
    <area style='cursor:pointer' shape='poly' coords='54,135,63,139,63,150,54,154,45,150,45,139' onclick='clickColor("#99CC00",-65,45)' onmouseover='mouseOverColor("#99CC00")' alt='#99CC00' />
    <area style='cursor:pointer' shape='poly' coords='72,135,81,139,81,150,72,154,63,150,63,139' onclick='clickColor("#CCFF33",-65,63)' onmouseover='mouseOverColor("#CCFF33")' alt='#CCFF33' />
    <area style='cursor:pointer' shape='poly' coords='90,135,99,139,99,150,90,154,81,150,81,139' onclick='clickColor("#FFFF66",-65,81)' onmouseover='mouseOverColor("#FFFF66")' alt='#FFFF66' />
    <area style='cursor:pointer' shape='poly' coords='108,135,117,139,117,150,108,154,99,150,99,139' onclick='clickColor("#FFCC66",-65,99)' onmouseover='mouseOverColor("#FFCC66")' alt='#FFCC66' />
    <area style='cursor:pointer' shape='poly' coords='126,135,135,139,135,150,126,154,117,150,117,139' onclick='clickColor("#FF9966",-65,117)' onmouseover='mouseOverColor("#FF9966")' alt='#FF9966' />
    <area style='cursor:pointer' shape='poly' coords='144,135,153,139,153,150,144,154,135,150,135,139' onclick='clickColor("#FF6666",-65,135)' onmouseover='mouseOverColor("#FF6666")' alt='#FF6666' />
    <area style='cursor:pointer' shape='poly' coords='162,135,171,139,171,150,162,154,153,150,153,139' onclick='clickColor("#FF0066",-65,153)' onmouseover='mouseOverColor("#FF0066")' alt='#FF0066' />
    <area style='cursor:pointer' shape='poly' coords='180,135,189,139,189,150,180,154,171,150,171,139' onclick='clickColor("#CC6699",-65,171)' onmouseover='mouseOverColor("#CC6699")' alt='#CC6699' />
    <area style='cursor:pointer' shape='poly' coords='198,135,207,139,207,150,198,154,189,150,189,139' onclick='clickColor("#993366",-65,189)' onmouseover='mouseOverColor("#993366")' alt='#993366' />
    <area style='cursor:pointer' shape='poly' coords='45,150,54,154,54,165,45,169,36,165,36,154' onclick='clickColor("#999966",-50,36)' onmouseover='mouseOverColor("#999966")' alt='#999966' />
    <area style='cursor:pointer' shape='poly' coords='63,150,72,154,72,165,63,169,54,165,54,154' onclick='clickColor("#CCCC00",-50,54)' onmouseover='mouseOverColor("#CCCC00")' alt='#CCCC00' />
    <area style='cursor:pointer' shape='poly' coords='81,150,90,154,90,165,81,169,72,165,72,154' onclick='clickColor("#FFFF00",-50,72)' onmouseover='mouseOverColor("#FFFF00")' alt='#FFFF00' />
    <area style='cursor:pointer' shape='poly' coords='99,150,108,154,108,165,99,169,90,165,90,154' onclick='clickColor("#FFCC00",-50,90)' onmouseover='mouseOverColor("#FFCC00")' alt='#FFCC00' />
    <area style='cursor:pointer' shape='poly' coords='117,150,126,154,126,165,117,169,108,165,108,154' onclick='clickColor("#FF9933",-50,108)' onmouseover='mouseOverColor("#FF9933")' alt='#FF9933' />
    <area style='cursor:pointer' shape='poly' coords='135,150,144,154,144,165,135,169,126,165,126,154' onclick='clickColor("#FF6600",-50,126)' onmouseover='mouseOverColor("#FF6600")' alt='#FF6600' />
    <area style='cursor:pointer' shape='poly' coords='153,150,162,154,162,165,153,169,144,165,144,154' onclick='clickColor("#FF5050",-50,144)' onmouseover='mouseOverColor("#FF5050")' alt='#FF5050' />
    <area style='cursor:pointer' shape='poly' coords='171,150,180,154,180,165,171,169,162,165,162,154' onclick='clickColor("#CC0066",-50,162)' onmouseover='mouseOverColor("#CC0066")' alt='#CC0066' />
    <area style='cursor:pointer' shape='poly' coords='189,150,198,154,198,165,189,169,180,165,180,154' onclick='clickColor("#660033",-50,180)' onmouseover='mouseOverColor("#660033")' alt='#660033' />
    <area style='cursor:pointer' shape='poly' coords='54,165,63,169,63,180,54,184,45,180,45,169' onclick='clickColor("#996633",-35,45)' onmouseover='mouseOverColor("#996633")' alt='#996633' />
    <area style='cursor:pointer' shape='poly' coords='72,165,81,169,81,180,72,184,63,180,63,169' onclick='clickColor("#CC9900",-35,63)' onmouseover='mouseOverColor("#CC9900")' alt='#CC9900' />
    <area style='cursor:pointer' shape='poly' coords='90,165,99,169,99,180,90,184,81,180,81,169' onclick='clickColor("#FF9900",-35,81)' onmouseover='mouseOverColor("#FF9900")' alt='#FF9900' />
    <area style='cursor:pointer' shape='poly' coords='108,165,117,169,117,180,108,184,99,180,99,169' onclick='clickColor("#CC6600",-35,99)' onmouseover='mouseOverColor("#CC6600")' alt='#CC6600' />
    <area style='cursor:pointer' shape='poly' coords='126,165,135,169,135,180,126,184,117,180,117,169' onclick='clickColor("#FF3300",-35,117)' onmouseover='mouseOverColor("#FF3300")' alt='#FF3300' />
    <area style='cursor:pointer' shape='poly' coords='144,165,153,169,153,180,144,184,135,180,135,169' onclick='clickColor("#FF0000",-35,135)' onmouseover='mouseOverColor("#FF0000")' alt='#FF0000' />
    <area style='cursor:pointer' shape='poly' coords='162,165,171,169,171,180,162,184,153,180,153,169' onclick='clickColor("#CC0000",-35,153)' onmouseover='mouseOverColor("#CC0000")' alt='#CC0000' />
    <area style='cursor:pointer' shape='poly' coords='180,165,189,169,189,180,180,184,171,180,171,169' onclick='clickColor("#990033",-35,171)' onmouseover='mouseOverColor("#990033")' alt='#990033' />
    <area style='cursor:pointer' shape='poly' coords='63,180,72,184,72,195,63,199,54,195,54,184' onclick='clickColor("#663300",-20,54)' onmouseover='mouseOverColor("#663300")' alt='#663300' />
    <area style='cursor:pointer' shape='poly' coords='81,180,90,184,90,195,81,199,72,195,72,184' onclick='clickColor("#996600",-20,72)' onmouseover='mouseOverColor("#996600")' alt='#996600' />
    <area style='cursor:pointer' shape='poly' coords='99,180,108,184,108,195,99,199,90,195,90,184' onclick='clickColor("#CC3300",-20,90)' onmouseover='mouseOverColor("#CC3300")' alt='#CC3300' />
    <area style='cursor:pointer' shape='poly' coords='117,180,126,184,126,195,117,199,108,195,108,184' onclick='clickColor("#993300",-20,108)' onmouseover='mouseOverColor("#993300")' alt='#993300' />
    <area style='cursor:pointer' shape='poly' coords='135,180,144,184,144,195,135,199,126,195,126,184' onclick='clickColor("#990000",-20,126)' onmouseover='mouseOverColor("#990000")' alt='#990000' />
    <area style='cursor:pointer' shape='poly' coords='153,180,162,184,162,195,153,199,144,195,144,184' onclick='clickColor("#800000",-20,144)' onmouseover='mouseOverColor("#800000")' alt='#800000' />
    <area style='cursor:pointer' shape='poly' coords='171,180,180,184,180,195,171,199,162,195,162,184' onclick='clickColor("#993333",-20,162)' onmouseover='mouseOverColor("#993333")' alt='#993333' />
   `;
  return html;
}
function colormapAsStringOrig() {
  let html = `
    <area style='cursor:pointer' shape='poly' coords='63,0,72,4,72,15,63,19,54,15,54,4' onclick='clickColor("#003366",-200,54)' onmouseover='mouseOverColor("#003366")' alt='#003366' />
    <area style='cursor:pointer' shape='poly' coords='81,0,90,4,90,15,81,19,72,15,72,4' onclick='clickColor("#336699",-200,72)' onmouseover='mouseOverColor("#336699")' alt='#336699' />
    <area style='cursor:pointer' shape='poly' coords='99,0,108,4,108,15,99,19,90,15,90,4' onclick='clickColor("#3366CC",-200,90)' onmouseover='mouseOverColor("#3366CC")' alt='#3366CC' />
    <area style='cursor:pointer' shape='poly' coords='117,0,126,4,126,15,117,19,108,15,108,4' onclick='clickColor("#003399",-200,108)' onmouseover='mouseOverColor("#003399")' alt='#003399' />
    <area style='cursor:pointer' shape='poly' coords='135,0,144,4,144,15,135,19,126,15,126,4' onclick='clickColor("#000099",-200,126)' onmouseover='mouseOverColor("#000099")' alt='#000099' />
    <area style='cursor:pointer' shape='poly' coords='153,0,162,4,162,15,153,19,144,15,144,4' onclick='clickColor("#0000CC",-200,144)' onmouseover='mouseOverColor("#0000CC")' alt='#0000CC' />
    <area style='cursor:pointer' shape='poly' coords='171,0,180,4,180,15,171,19,162,15,162,4' onclick='clickColor("#000066",-200,162)' onmouseover='mouseOverColor("#000066")' alt='#000066' />
    <area style='cursor:pointer' shape='poly' coords='54,15,63,19,63,30,54,34,45,30,45,19' onclick='clickColor("#006666",-185,45)' onmouseover='mouseOverColor("#006666")' alt='#006666' />
    <area style='cursor:pointer' shape='poly' coords='72,15,81,19,81,30,72,34,63,30,63,19' onclick='clickColor("#006699",-185,63)' onmouseover='mouseOverColor("#006699")' alt='#006699' />
    <area style='cursor:pointer' shape='poly' coords='90,15,99,19,99,30,90,34,81,30,81,19' onclick='clickColor("#0099CC",-185,81)' onmouseover='mouseOverColor("#0099CC")' alt='#0099CC' />
    <area style='cursor:pointer' shape='poly' coords='108,15,117,19,117,30,108,34,99,30,99,19' onclick='clickColor("#0066CC",-185,99)' onmouseover='mouseOverColor("#0066CC")' alt='#0066CC' />
    <area style='cursor:pointer' shape='poly' coords='126,15,135,19,135,30,126,34,117,30,117,19' onclick='clickColor("#0033CC",-185,117)' onmouseover='mouseOverColor("#0033CC")' alt='#0033CC' />
    <area style='cursor:pointer' shape='poly' coords='144,15,153,19,153,30,144,34,135,30,135,19' onclick='clickColor("#0000FF",-185,135)' onmouseover='mouseOverColor("#0000FF")' alt='#0000FF' />
    <area style='cursor:pointer' shape='poly' coords='162,15,171,19,171,30,162,34,153,30,153,19' onclick='clickColor("#3333FF",-185,153)' onmouseover='mouseOverColor("#3333FF")' alt='#3333FF' />
    <area style='cursor:pointer' shape='poly' coords='180,15,189,19,189,30,180,34,171,30,171,19' onclick='clickColor("#333399",-185,171)' onmouseover='mouseOverColor("#333399")' alt='#333399' />
    <area style='cursor:pointer' shape='poly' coords='45,30,54,34,54,45,45,49,36,45,36,34' onclick='clickColor("#669999",-170,36)' onmouseover='mouseOverColor("#669999")' alt='#669999' />
    <area style='cursor:pointer' shape='poly' coords='63,30,72,34,72,45,63,49,54,45,54,34' onclick='clickColor("#009999",-170,54)' onmouseover='mouseOverColor("#009999")' alt='#009999' />
    <area style='cursor:pointer' shape='poly' coords='81,30,90,34,90,45,81,49,72,45,72,34' onclick='clickColor("#33CCCC",-170,72)' onmouseover='mouseOverColor("#33CCCC")' alt='#33CCCC' />
    <area style='cursor:pointer' shape='poly' coords='99,30,108,34,108,45,99,49,90,45,90,34' onclick='clickColor("#00CCFF",-170,90)' onmouseover='mouseOverColor("#00CCFF")' alt='#00CCFF' />
    <area style='cursor:pointer' shape='poly' coords='117,30,126,34,126,45,117,49,108,45,108,34' onclick='clickColor("#0099FF",-170,108)' onmouseover='mouseOverColor("#0099FF")' alt='#0099FF' />
    <area style='cursor:pointer' shape='poly' coords='135,30,144,34,144,45,135,49,126,45,126,34' onclick='clickColor("#0066FF",-170,126)' onmouseover='mouseOverColor("#0066FF")' alt='#0066FF' />
    <area style='cursor:pointer' shape='poly' coords='153,30,162,34,162,45,153,49,144,45,144,34' onclick='clickColor("#3366FF",-170,144)' onmouseover='mouseOverColor("#3366FF")' alt='#3366FF' />
    <area style='cursor:pointer' shape='poly' coords='171,30,180,34,180,45,171,49,162,45,162,34' onclick='clickColor("#3333CC",-170,162)' onmouseover='mouseOverColor("#3333CC")' alt='#3333CC' />
    <area style='cursor:pointer' shape='poly' coords='189,30,198,34,198,45,189,49,180,45,180,34' onclick='clickColor("#666699",-170,180)' onmouseover='mouseOverColor("#666699")' alt='#666699' />
    <area style='cursor:pointer' shape='poly' coords='36,45,45,49,45,60,36,64,27,60,27,49' onclick='clickColor("#339966",-155,27)' onmouseover='mouseOverColor("#339966")' alt='#339966' />
    <area style='cursor:pointer' shape='poly' coords='54,45,63,49,63,60,54,64,45,60,45,49' onclick='clickColor("#00CC99",-155,45)' onmouseover='mouseOverColor("#00CC99")' alt='#00CC99' />
    <area style='cursor:pointer' shape='poly' coords='72,45,81,49,81,60,72,64,63,60,63,49' onclick='clickColor("#00FFCC",-155,63)' onmouseover='mouseOverColor("#00FFCC")' alt='#00FFCC' />
    <area style='cursor:pointer' shape='poly' coords='90,45,99,49,99,60,90,64,81,60,81,49' onclick='clickColor("#00FFFF",-155,81)' onmouseover='mouseOverColor("#00FFFF")' alt='#00FFFF' />
    <area style='cursor:pointer' shape='poly' coords='108,45,117,49,117,60,108,64,99,60,99,49' onclick='clickColor("#33CCFF",-155,99)' onmouseover='mouseOverColor("#33CCFF")' alt='#33CCFF' />
    <area style='cursor:pointer' shape='poly' coords='126,45,135,49,135,60,126,64,117,60,117,49' onclick='clickColor("#3399FF",-155,117)' onmouseover='mouseOverColor("#3399FF")' alt='#3399FF' />
    <area style='cursor:pointer' shape='poly' coords='144,45,153,49,153,60,144,64,135,60,135,49' onclick='clickColor("#6699FF",-155,135)' onmouseover='mouseOverColor("#6699FF")' alt='#6699FF' />
    <area style='cursor:pointer' shape='poly' coords='162,45,171,49,171,60,162,64,153,60,153,49' onclick='clickColor("#6666FF",-155,153)' onmouseover='mouseOverColor("#6666FF")' alt='#6666FF' />
    <area style='cursor:pointer' shape='poly' coords='180,45,189,49,189,60,180,64,171,60,171,49' onclick='clickColor("#6600FF",-155,171)' onmouseover='mouseOverColor("#6600FF")' alt='#6600FF' />
    <area style='cursor:pointer' shape='poly' coords='198,45,207,49,207,60,198,64,189,60,189,49' onclick='clickColor("#6600CC",-155,189)' onmouseover='mouseOverColor("#6600CC")' alt='#6600CC' />
    <area style='cursor:pointer' shape='poly' coords='27,60,36,64,36,75,27,79,18,75,18,64' onclick='clickColor("#339933",-140,18)' onmouseover='mouseOverColor("#339933")' alt='#339933' />
    <area style='cursor:pointer' shape='poly' coords='45,60,54,64,54,75,45,79,36,75,36,64' onclick='clickColor("#00CC66",-140,36)' onmouseover='mouseOverColor("#00CC66")' alt='#00CC66' />
    <area style='cursor:pointer' shape='poly' coords='63,60,72,64,72,75,63,79,54,75,54,64' onclick='clickColor("#00FF99",-140,54)' onmouseover='mouseOverColor("#00FF99")' alt='#00FF99' />
    <area style='cursor:pointer' shape='poly' coords='81,60,90,64,90,75,81,79,72,75,72,64' onclick='clickColor("#66FFCC",-140,72)' onmouseover='mouseOverColor("#66FFCC")' alt='#66FFCC' />
    <area style='cursor:pointer' shape='poly' coords='99,60,108,64,108,75,99,79,90,75,90,64' onclick='clickColor("#66FFFF",-140,90)' onmouseover='mouseOverColor("#66FFFF")' alt='#66FFFF' />
    <area style='cursor:pointer' shape='poly' coords='117,60,126,64,126,75,117,79,108,75,108,64' onclick='clickColor("#66CCFF",-140,108)' onmouseover='mouseOverColor("#66CCFF")' alt='#66CCFF' />
    <area style='cursor:pointer' shape='poly' coords='135,60,144,64,144,75,135,79,126,75,126,64' onclick='clickColor("#99CCFF",-140,126)' onmouseover='mouseOverColor("#99CCFF")' alt='#99CCFF' />
    <area style='cursor:pointer' shape='poly' coords='153,60,162,64,162,75,153,79,144,75,144,64' onclick='clickColor("#9999FF",-140,144)' onmouseover='mouseOverColor("#9999FF")' alt='#9999FF' />
    <area style='cursor:pointer' shape='poly' coords='171,60,180,64,180,75,171,79,162,75,162,64' onclick='clickColor("#9966FF",-140,162)' onmouseover='mouseOverColor("#9966FF")' alt='#9966FF' />
    <area style='cursor:pointer' shape='poly' coords='189,60,198,64,198,75,189,79,180,75,180,64' onclick='clickColor("#9933FF",-140,180)' onmouseover='mouseOverColor("#9933FF")' alt='#9933FF' />
    <area style='cursor:pointer' shape='poly' coords='207,60,216,64,216,75,207,79,198,75,198,64' onclick='clickColor("#9900FF",-140,198)' onmouseover='mouseOverColor("#9900FF")' alt='#9900FF' />
    <area style='cursor:pointer' shape='poly' coords='18,75,27,79,27,90,18,94,9,90,9,79' onclick='clickColor("#006600",-125,9)' onmouseover='mouseOverColor("#006600")' alt='#006600' />
    <area style='cursor:pointer' shape='poly' coords='36,75,45,79,45,90,36,94,27,90,27,79' onclick='clickColor("#00CC00",-125,27)' onmouseover='mouseOverColor("#00CC00")' alt='#00CC00' />
    <area style='cursor:pointer' shape='poly' coords='54,75,63,79,63,90,54,94,45,90,45,79' onclick='clickColor("#00FF00",-125,45)' onmouseover='mouseOverColor("#00FF00")' alt='#00FF00' />
    <area style='cursor:pointer' shape='poly' coords='72,75,81,79,81,90,72,94,63,90,63,79' onclick='clickColor("#66FF99",-125,63)' onmouseover='mouseOverColor("#66FF99")' alt='#66FF99' />
    <area style='cursor:pointer' shape='poly' coords='90,75,99,79,99,90,90,94,81,90,81,79' onclick='clickColor("#99FFCC",-125,81)' onmouseover='mouseOverColor("#99FFCC")' alt='#99FFCC' />
    <area style='cursor:pointer' shape='poly' coords='108,75,117,79,117,90,108,94,99,90,99,79' onclick='clickColor("#CCFFFF",-125,99)' onmouseover='mouseOverColor("#CCFFFF")' alt='#CCFFFF' />
    <area style='cursor:pointer' shape='poly' coords='126,75,135,79,135,90,126,94,117,90,117,79' onclick='clickColor("#CCCCFF",-125,117)' onmouseover='mouseOverColor("#CCCCFF")' alt='#CCCCFF' />
    <area style='cursor:pointer' shape='poly' coords='144,75,153,79,153,90,144,94,135,90,135,79' onclick='clickColor("#CC99FF",-125,135)' onmouseover='mouseOverColor("#CC99FF")' alt='#CC99FF' />
    <area style='cursor:pointer' shape='poly' coords='162,75,171,79,171,90,162,94,153,90,153,79' onclick='clickColor("#CC66FF",-125,153)' onmouseover='mouseOverColor("#CC66FF")' alt='#CC66FF' />
    <area style='cursor:pointer' shape='poly' coords='180,75,189,79,189,90,180,94,171,90,171,79' onclick='clickColor("#CC33FF",-125,171)' onmouseover='mouseOverColor("#CC33FF")' alt='#CC33FF' />
    <area style='cursor:pointer' shape='poly' coords='198,75,207,79,207,90,198,94,189,90,189,79' onclick='clickColor("#CC00FF",-125,189)' onmouseover='mouseOverColor("#CC00FF")' alt='#CC00FF' />
    <area style='cursor:pointer' shape='poly' coords='216,75,225,79,225,90,216,94,207,90,207,79' onclick='clickColor("#9900CC",-125,207)' onmouseover='mouseOverColor("#9900CC")' alt='#9900CC' />
    <area style='cursor:pointer' shape='poly' coords='9,90,18,94,18,105,9,109,0,105,0,94' onclick='clickColor("#003300",-110,0)' onmouseover='mouseOverColor("#003300")' alt='#003300' />
    <area style='cursor:pointer' shape='poly' coords='27,90,36,94,36,105,27,109,18,105,18,94' onclick='clickColor("#009933",-110,18)' onmouseover='mouseOverColor("#009933")' alt='#009933' />
    <area style='cursor:pointer' shape='poly' coords='45,90,54,94,54,105,45,109,36,105,36,94' onclick='clickColor("#33CC33",-110,36)' onmouseover='mouseOverColor("#33CC33")' alt='#33CC33' />
    <area style='cursor:pointer' shape='poly' coords='63,90,72,94,72,105,63,109,54,105,54,94' onclick='clickColor("#66FF66",-110,54)' onmouseover='mouseOverColor("#66FF66")' alt='#66FF66' />
    <area style='cursor:pointer' shape='poly' coords='81,90,90,94,90,105,81,109,72,105,72,94' onclick='clickColor("#99FF99",-110,72)' onmouseover='mouseOverColor("#99FF99")' alt='#99FF99' />
    <area style='cursor:pointer' shape='poly' coords='99,90,108,94,108,105,99,109,90,105,90,94' onclick='clickColor("#CCFFCC",-110,90)' onmouseover='mouseOverColor("#CCFFCC")' alt='#CCFFCC' />
    <area style='cursor:pointer' shape='poly' coords='117,90,126,94,126,105,117,109,108,105,108,94' onclick='clickColor("#FFFFFF",-110,108)' onmouseover='mouseOverColor("#FFFFFF")' alt='#FFFFFF' />
    <area style='cursor:pointer' shape='poly' coords='135,90,144,94,144,105,135,109,126,105,126,94' onclick='clickColor("#FFCCFF",-110,126)' onmouseover='mouseOverColor("#FFCCFF")' alt='#FFCCFF' />
    <area style='cursor:pointer' shape='poly' coords='153,90,162,94,162,105,153,109,144,105,144,94' onclick='clickColor("#FF99FF",-110,144)' onmouseover='mouseOverColor("#FF99FF")' alt='#FF99FF' />
    <area style='cursor:pointer' shape='poly' coords='171,90,180,94,180,105,171,109,162,105,162,94' onclick='clickColor("#FF66FF",-110,162)' onmouseover='mouseOverColor("#FF66FF")' alt='#FF66FF' />
    <area style='cursor:pointer' shape='poly' coords='189,90,198,94,198,105,189,109,180,105,180,94' onclick='clickColor("#FF00FF",-110,180)' onmouseover='mouseOverColor("#FF00FF")' alt='#FF00FF' />
    <area style='cursor:pointer' shape='poly' coords='207,90,216,94,216,105,207,109,198,105,198,94' onclick='clickColor("#CC00CC",-110,198)' onmouseover='mouseOverColor("#CC00CC")' alt='#CC00CC' />
    <area style='cursor:pointer' shape='poly' coords='225,90,234,94,234,105,225,109,216,105,216,94' onclick='clickColor("#660066",-110,216)' onmouseover='mouseOverColor("#660066")' alt='#660066' />
    <area style='cursor:pointer' shape='poly' coords='18,105,27,109,27,120,18,124,9,120,9,109' onclick='clickColor("#336600",-95,9)' onmouseover='mouseOverColor("#336600")' alt='#336600' />
    <area style='cursor:pointer' shape='poly' coords='36,105,45,109,45,120,36,124,27,120,27,109' onclick='clickColor("#009900",-95,27)' onmouseover='mouseOverColor("#009900")' alt='#009900' />
    <area style='cursor:pointer' shape='poly' coords='54,105,63,109,63,120,54,124,45,120,45,109' onclick='clickColor("#66FF33",-95,45)' onmouseover='mouseOverColor("#66FF33")' alt='#66FF33' />
    <area style='cursor:pointer' shape='poly' coords='72,105,81,109,81,120,72,124,63,120,63,109' onclick='clickColor("#99FF66",-95,63)' onmouseover='mouseOverColor("#99FF66")' alt='#99FF66' />
    <area style='cursor:pointer' shape='poly' coords='90,105,99,109,99,120,90,124,81,120,81,109' onclick='clickColor("#CCFF99",-95,81)' onmouseover='mouseOverColor("#CCFF99")' alt='#CCFF99' />
    <area style='cursor:pointer' shape='poly' coords='108,105,117,109,117,120,108,124,99,120,99,109' onclick='clickColor("#FFFFCC",-95,99)' onmouseover='mouseOverColor("#FFFFCC")' alt='#FFFFCC' />
    <area style='cursor:pointer' shape='poly' coords='126,105,135,109,135,120,126,124,117,120,117,109' onclick='clickColor("#FFCCCC",-95,117)' onmouseover='mouseOverColor("#FFCCCC")' alt='#FFCCCC' />
    <area style='cursor:pointer' shape='poly' coords='144,105,153,109,153,120,144,124,135,120,135,109' onclick='clickColor("#FF99CC",-95,135)' onmouseover='mouseOverColor("#FF99CC")' alt='#FF99CC' />
    <area style='cursor:pointer' shape='poly' coords='162,105,171,109,171,120,162,124,153,120,153,109' onclick='clickColor("#FF66CC",-95,153)' onmouseover='mouseOverColor("#FF66CC")' alt='#FF66CC' />
    <area style='cursor:pointer' shape='poly' coords='180,105,189,109,189,120,180,124,171,120,171,109' onclick='clickColor("#FF33CC",-95,171)' onmouseover='mouseOverColor("#FF33CC")' alt='#FF33CC' />
    <area style='cursor:pointer' shape='poly' coords='198,105,207,109,207,120,198,124,189,120,189,109' onclick='clickColor("#CC0099",-95,189)' onmouseover='mouseOverColor("#CC0099")' alt='#CC0099' />
    <area style='cursor:pointer' shape='poly' coords='216,105,225,109,225,120,216,124,207,120,207,109' onclick='clickColor("#993399",-95,207)' onmouseover='mouseOverColor("#993399")' alt='#993399' />
    <area style='cursor:pointer' shape='poly' coords='27,120,36,124,36,135,27,139,18,135,18,124' onclick='clickColor("#333300",-80,18)' onmouseover='mouseOverColor("#333300")' alt='#333300' />
    <area style='cursor:pointer' shape='poly' coords='45,120,54,124,54,135,45,139,36,135,36,124' onclick='clickColor("#669900",-80,36)' onmouseover='mouseOverColor("#669900")' alt='#669900' />
    <area style='cursor:pointer' shape='poly' coords='63,120,72,124,72,135,63,139,54,135,54,124' onclick='clickColor("#99FF33",-80,54)' onmouseover='mouseOverColor("#99FF33")' alt='#99FF33' />
    <area style='cursor:pointer' shape='poly' coords='81,120,90,124,90,135,81,139,72,135,72,124' onclick='clickColor("#CCFF66",-80,72)' onmouseover='mouseOverColor("#CCFF66")' alt='#CCFF66' />
    <area style='cursor:pointer' shape='poly' coords='99,120,108,124,108,135,99,139,90,135,90,124' onclick='clickColor("#FFFF99",-80,90)' onmouseover='mouseOverColor("#FFFF99")' alt='#FFFF99' />
    <area style='cursor:pointer' shape='poly' coords='117,120,126,124,126,135,117,139,108,135,108,124' onclick='clickColor("#FFCC99",-80,108)' onmouseover='mouseOverColor("#FFCC99")' alt='#FFCC99' />
    <area style='cursor:pointer' shape='poly' coords='135,120,144,124,144,135,135,139,126,135,126,124' onclick='clickColor("#FF9999",-80,126)' onmouseover='mouseOverColor("#FF9999")' alt='#FF9999' />
    <area style='cursor:pointer' shape='poly' coords='153,120,162,124,162,135,153,139,144,135,144,124' onclick='clickColor("#FF6699",-80,144)' onmouseover='mouseOverColor("#FF6699")' alt='#FF6699' />
    <area style='cursor:pointer' shape='poly' coords='171,120,180,124,180,135,171,139,162,135,162,124' onclick='clickColor("#FF3399",-80,162)' onmouseover='mouseOverColor("#FF3399")' alt='#FF3399' />
    <area style='cursor:pointer' shape='poly' coords='189,120,198,124,198,135,189,139,180,135,180,124' onclick='clickColor("#CC3399",-80,180)' onmouseover='mouseOverColor("#CC3399")' alt='#CC3399' />
    <area style='cursor:pointer' shape='poly' coords='207,120,216,124,216,135,207,139,198,135,198,124' onclick='clickColor("#990099",-80,198)' onmouseover='mouseOverColor("#990099")' alt='#990099' />
    <area style='cursor:pointer' shape='poly' coords='36,135,45,139,45,150,36,154,27,150,27,139' onclick='clickColor("#666633",-65,27)' onmouseover='mouseOverColor("#666633")' alt='#666633' />
    <area style='cursor:pointer' shape='poly' coords='54,135,63,139,63,150,54,154,45,150,45,139' onclick='clickColor("#99CC00",-65,45)' onmouseover='mouseOverColor("#99CC00")' alt='#99CC00' />
    <area style='cursor:pointer' shape='poly' coords='72,135,81,139,81,150,72,154,63,150,63,139' onclick='clickColor("#CCFF33",-65,63)' onmouseover='mouseOverColor("#CCFF33")' alt='#CCFF33' />
    <area style='cursor:pointer' shape='poly' coords='90,135,99,139,99,150,90,154,81,150,81,139' onclick='clickColor("#FFFF66",-65,81)' onmouseover='mouseOverColor("#FFFF66")' alt='#FFFF66' />
    <area style='cursor:pointer' shape='poly' coords='108,135,117,139,117,150,108,154,99,150,99,139' onclick='clickColor("#FFCC66",-65,99)' onmouseover='mouseOverColor("#FFCC66")' alt='#FFCC66' />
    <area style='cursor:pointer' shape='poly' coords='126,135,135,139,135,150,126,154,117,150,117,139' onclick='clickColor("#FF9966",-65,117)' onmouseover='mouseOverColor("#FF9966")' alt='#FF9966' />
    <area style='cursor:pointer' shape='poly' coords='144,135,153,139,153,150,144,154,135,150,135,139' onclick='clickColor("#FF6666",-65,135)' onmouseover='mouseOverColor("#FF6666")' alt='#FF6666' />
    <area style='cursor:pointer' shape='poly' coords='162,135,171,139,171,150,162,154,153,150,153,139' onclick='clickColor("#FF0066",-65,153)' onmouseover='mouseOverColor("#FF0066")' alt='#FF0066' />
    <area style='cursor:pointer' shape='poly' coords='180,135,189,139,189,150,180,154,171,150,171,139' onclick='clickColor("#CC6699",-65,171)' onmouseover='mouseOverColor("#CC6699")' alt='#CC6699' />
    <area style='cursor:pointer' shape='poly' coords='198,135,207,139,207,150,198,154,189,150,189,139' onclick='clickColor("#993366",-65,189)' onmouseover='mouseOverColor("#993366")' alt='#993366' />
    <area style='cursor:pointer' shape='poly' coords='45,150,54,154,54,165,45,169,36,165,36,154' onclick='clickColor("#999966",-50,36)' onmouseover='mouseOverColor("#999966")' alt='#999966' />
    <area style='cursor:pointer' shape='poly' coords='63,150,72,154,72,165,63,169,54,165,54,154' onclick='clickColor("#CCCC00",-50,54)' onmouseover='mouseOverColor("#CCCC00")' alt='#CCCC00' />
    <area style='cursor:pointer' shape='poly' coords='81,150,90,154,90,165,81,169,72,165,72,154' onclick='clickColor("#FFFF00",-50,72)' onmouseover='mouseOverColor("#FFFF00")' alt='#FFFF00' />
    <area style='cursor:pointer' shape='poly' coords='99,150,108,154,108,165,99,169,90,165,90,154' onclick='clickColor("#FFCC00",-50,90)' onmouseover='mouseOverColor("#FFCC00")' alt='#FFCC00' />
    <area style='cursor:pointer' shape='poly' coords='117,150,126,154,126,165,117,169,108,165,108,154' onclick='clickColor("#FF9933",-50,108)' onmouseover='mouseOverColor("#FF9933")' alt='#FF9933' />
    <area style='cursor:pointer' shape='poly' coords='135,150,144,154,144,165,135,169,126,165,126,154' onclick='clickColor("#FF6600",-50,126)' onmouseover='mouseOverColor("#FF6600")' alt='#FF6600' />
    <area style='cursor:pointer' shape='poly' coords='153,150,162,154,162,165,153,169,144,165,144,154' onclick='clickColor("#FF5050",-50,144)' onmouseover='mouseOverColor("#FF5050")' alt='#FF5050' />
    <area style='cursor:pointer' shape='poly' coords='171,150,180,154,180,165,171,169,162,165,162,154' onclick='clickColor("#CC0066",-50,162)' onmouseover='mouseOverColor("#CC0066")' alt='#CC0066' />
    <area style='cursor:pointer' shape='poly' coords='189,150,198,154,198,165,189,169,180,165,180,154' onclick='clickColor("#660033",-50,180)' onmouseover='mouseOverColor("#660033")' alt='#660033' />
    <area style='cursor:pointer' shape='poly' coords='54,165,63,169,63,180,54,184,45,180,45,169' onclick='clickColor("#996633",-35,45)' onmouseover='mouseOverColor("#996633")' alt='#996633' />
    <area style='cursor:pointer' shape='poly' coords='72,165,81,169,81,180,72,184,63,180,63,169' onclick='clickColor("#CC9900",-35,63)' onmouseover='mouseOverColor("#CC9900")' alt='#CC9900' />
    <area style='cursor:pointer' shape='poly' coords='90,165,99,169,99,180,90,184,81,180,81,169' onclick='clickColor("#FF9900",-35,81)' onmouseover='mouseOverColor("#FF9900")' alt='#FF9900' />
    <area style='cursor:pointer' shape='poly' coords='108,165,117,169,117,180,108,184,99,180,99,169' onclick='clickColor("#CC6600",-35,99)' onmouseover='mouseOverColor("#CC6600")' alt='#CC6600' />
    <area style='cursor:pointer' shape='poly' coords='126,165,135,169,135,180,126,184,117,180,117,169' onclick='clickColor("#FF3300",-35,117)' onmouseover='mouseOverColor("#FF3300")' alt='#FF3300' />
    <area style='cursor:pointer' shape='poly' coords='144,165,153,169,153,180,144,184,135,180,135,169' onclick='clickColor("#FF0000",-35,135)' onmouseover='mouseOverColor("#FF0000")' alt='#FF0000' />
    <area style='cursor:pointer' shape='poly' coords='162,165,171,169,171,180,162,184,153,180,153,169' onclick='clickColor("#CC0000",-35,153)' onmouseover='mouseOverColor("#CC0000")' alt='#CC0000' />
    <area style='cursor:pointer' shape='poly' coords='180,165,189,169,189,180,180,184,171,180,171,169' onclick='clickColor("#990033",-35,171)' onmouseover='mouseOverColor("#990033")' alt='#990033' />
    <area style='cursor:pointer' shape='poly' coords='63,180,72,184,72,195,63,199,54,195,54,184' onclick='clickColor("#663300",-20,54)' onmouseover='mouseOverColor("#663300")' alt='#663300' />
    <area style='cursor:pointer' shape='poly' coords='81,180,90,184,90,195,81,199,72,195,72,184' onclick='clickColor("#996600",-20,72)' onmouseover='mouseOverColor("#996600")' alt='#996600' />
    <area style='cursor:pointer' shape='poly' coords='99,180,108,184,108,195,99,199,90,195,90,184' onclick='clickColor("#CC3300",-20,90)' onmouseover='mouseOverColor("#CC3300")' alt='#CC3300' />
    <area style='cursor:pointer' shape='poly' coords='117,180,126,184,126,195,117,199,108,195,108,184' onclick='clickColor("#993300",-20,108)' onmouseover='mouseOverColor("#993300")' alt='#993300' />
    <area style='cursor:pointer' shape='poly' coords='135,180,144,184,144,195,135,199,126,195,126,184' onclick='clickColor("#990000",-20,126)' onmouseover='mouseOverColor("#990000")' alt='#990000' />
    <area style='cursor:pointer' shape='poly' coords='153,180,162,184,162,195,153,199,144,195,144,184' onclick='clickColor("#800000",-20,144)' onmouseover='mouseOverColor("#800000")' alt='#800000' />
    <area style='cursor:pointer' shape='poly' coords='171,180,180,184,180,195,171,199,162,195,162,184' onclick='clickColor("#993333",-20,162)' onmouseover='mouseOverColor("#993333")' alt='#993333' />
   `;
  return html;
}
function colorsFromBFA(bg, fg, alpha) {
  if (fg == 'contrast') {
    if (bg != 'inherit') bg = colorFrom(bg, alpha);
    fg = colorIdealText(bg);
  } else if (bg == 'contrast') {
    fg = colorFrom(fg);
    bg = colorIdealText(fg);
  } else {
    if (isdef(bg) && bg != 'inherit') bg = colorFrom(bg, alpha);
    if (isdef(fg) && fg != 'inherit') fg = colorFrom(fg);
  }
  return [bg, fg];
}
function computeColorX(c) {
  let res = c;
  if (isList(c)) return rChoose(c);
  else if (isString(c) && c.startsWith('rand')) {
    res = rColor();
    let spec = c.substring(4);
    if (isdef(window['color' + spec])) {
      res = window['color' + spec](res);
    }
  }
  return res;
}
function computeFaceNeighbors(face_list) {
  const vertexToFaces = new Map();
  face_list.forEach((faceVerts, faceIdx) => {
    faceVerts.forEach((v) => {
      if (!vertexToFaces.has(v)) vertexToFaces.set(v, new Set());
      vertexToFaces.get(v).add(faceIdx);
    });
  });
  const neighbors = {};
  face_list.forEach((faceVerts, faceIdx) => {
    const neighborSet = new Set();
    faceVerts.forEach((v) => {
      const facesWithV = vertexToFaces.get(v);
      facesWithV.forEach((neighborFaceIdx) => {
        if (neighborFaceIdx !== faceIdx) {
          neighborSet.add(neighborFaceIdx);
        }
      });
    });
    neighbors[faceIdx] = Array.from(neighborSet).sort((a, b) => a - b);
  });
  return neighbors;
}
function computeFaceNeighborsTwoOrMoreSharedVerts(face_list) {
  const vertexToFaces = new Map();
  face_list.forEach((faceVerts, faceIdx) => {
    faceVerts.forEach((v) => {
      if (!vertexToFaces.has(v)) vertexToFaces.set(v, new Set());
      vertexToFaces.get(v).add(faceIdx);
    });
  });
  const neighbors = {};
  face_list.forEach((faceVerts, faceIdx) => {
    const sharedCount = new Map();
    faceVerts.forEach((v) => {
      const facesWithV = vertexToFaces.get(v);
      facesWithV.forEach((otherFaceIdx) => {
        if (otherFaceIdx !== faceIdx) {
          sharedCount.set(otherFaceIdx, (sharedCount.get(otherFaceIdx) || 0) + 1);
        }
      });
    });
    const neighborsList = [];
    for (const [otherFaceIdx, count] of sharedCount.entries()) {
      if (count >= 2) neighborsList.push(otherFaceIdx);
    }
    neighbors[faceIdx] = neighborsList.sort((a, b) => a - b);
  });
  return neighbors;
}
function compute_face_neighbors(mesh) {
  const face_list = mesh.face_list;
  const edge_to_faces = {};
  face_list.forEach((face, face_index) => {
    const num_vertices = face.length;
    for (let i = 0; i < num_vertices; i++) {
      const v1 = face[i];
      const v2 = face[(i + 1) % num_vertices];
      const edge = [v1, v2].sort((a, b) => a - b).join(',');
      if (!(edge in edge_to_faces)) {
        edge_to_faces[edge] = new Set();
      }
      edge_to_faces[edge].add(face_index);
    }
  });
  const face_neighbors = Array.from({ length: face_list.length }, () => new Set());
  for (const edge in edge_to_faces) {
    const faces = Array.from(edge_to_faces[edge]);
    if (faces.length > 1) {
      for (const f1 of faces) {
        for (const f2 of faces) {
          if (f1 !== f2) {
            face_neighbors[f1].add(f2);
          }
        }
      }
    }
  }
  return face_neighbors.map(neigh => Array.from(neigh).sort((a, b) => a - b));
}
function conslog(s) { console.log(s, window[s]) }
function contains(s, sSub) { return s.toLowerCase().includes(sSub.toLowerCase()); }
function convertDogmaText(t) {
  let parts = t.split('[');
  let html = parts[0];
  for (const p of parts.slice(1)) {
    let k = stringBefore(p, ']');
    if (isNumber(k)) {
      let lpad = k == '10' ? 0 : 6;
      let rpad = k == '10' ? 3 : 6;
      html += `<span style="padding-left:${lpad}px;padding-right:${rpad}px;background-color:white;color:black;border-radius:50%">${k}</span>`;
    } else if (isdef(InnoDict[k])) {
      let sym = InnoDict[k].k;
      let bg = InnoDict[k].bg;
      let fg = InnoDict[k].fg;
      let s1 = symbolDict[sym];
      let family = s1.family;
      let txt = s1.text;
      let pad = k == 'factory' ? '2px 6px' : '2px';
      html += `<span style="padding:${pad};font-family:${family};background-color:${bg};color:white;border-radius:50%">${txt}</span>`;
    } else html += ` ${k} `
    html += stringAfter(p, ']');
  }
  return html;
}
function copyKeys(ofrom, oto, except = {}, only = null) {
  let keys = isdef(only) ? only : Object.keys(ofrom);
  for (const k of keys) {
    if (isdef(except[k])) continue;
    oto[k] = ofrom[k];
  }
  return oto;
}
function correctFuncName(specType) {
  switch (specType) {
    case 'list': specType = 'liste'; break;
    case 'dict': specType = 'dicti'; break;
    case undefined: specType = 'panel'; break;
  }
  return specType;
}
function createBatchGridCells(d, w, h, styles = {}, opts = {}) {
  let gap = valf(styles.gap, 4);
  if (nundef(styles.w)) styles.w = 128;
  if (nundef(styles.h)) styles.h = styles.w;
  if (nundef(styles.margin)) styles.margin = gap;
  let sz = styles.w + styles.margin;
  let cols = Math.floor((w - 20) / sz);
  let rows = Math.floor((h - 20) / sz);
  let dGrid = mGrid(rows, cols, d, { margin: 'auto', gap })
  let cells = [];
  for (let i = 0; i < rows * cols; i++) {
    let d = mDom(dGrid, styles, opts);
    mCenterCenterFlex(d);
    cells.push(d);
  }
  return { dGrid, cells, rows, cols };
}
function createCard(rank = "10", suit = "♣", height = 200, width) {
  if (nundef(width)) width = height * .7;
  const card = document.createElement("div");
  card.style.position = "relative";
  card.style.width = width + "px";
  card.style.height = height + "px";
  card.style.border = "1px solid black";
  card.style.borderRadius = Math.max(4, width / 20) + 'px';//`${width/20}px;`; //"12px";
  card.style.background = "white";
  card.style.fontFamily = "serif";
  card.style.fontFamily = '"DejaVu Sans", "Arial Unicode MS", sans-serif';
  const centerX = width / 2;
  const colOffset = width * 0.2;
  const colX = [centerX - colOffset, centerX, centerX + colOffset];
  const topMargin = height * 0.12;
  const pipSpacing = (height - 2 * topMargin) / 3.3;
  const pipPatterns = {
    1: [[1, [1.5]]],
    2: [[1, [0, 3]]],
    3: [[1, [0, 1.5, 3]]],
    4: [[0, [0, 3]], [2, [0, 3]]],
    5: [[0, [0, 3]], [1, [1.5]], [2, [0, 3]]],
    6: [[0, [0, 1.5, 3]], [2, [0, 1.5, 3]]],
    7: [[0, [0, 1.5, 3]], [1, [0.75]], [2, [0, 1.5, 3]]],
    8: [[0, [0, 1.5, 3]], [1, [0.75, 2.25]], [2, [0, 1.5, 3]]],
    9: [[0, [0, 1, 2, 3]], [1, [1.5]], [2, [0, 1, 2, 3]]],
    10: [[0, [0, 1, 2, 3]], [1, [0.5, 2.5]], [2, [0, 1, 2, 3]]],
    11: [[0, [0, 1, 2, 3]], [1, [0.5, 1.5, 2.5]], [2, [0, 1, 2, 3]]],
  };
  const value = parseInt(rank);
  const pipData = pipPatterns[value];
  const pipFontSize = height * .2;
  pipData.forEach(([col, rows]) => {
    rows.forEach(rowIndex => {
      const pip = document.createElement("div");
      pip.textContent = suit;
      pip.style.position = "absolute";
      pip.style.left = (colX[col] - pipFontSize * 0.35) + "px";
      pip.style.top = (topMargin + pipSpacing * rowIndex - pipFontSize * 0.5) + "px";
      pip.style.fontSize = pipFontSize + "px";
      if (rowIndex === 3) pip.style.transform = "rotate(180deg)";
      card.appendChild(pip);
    });
  });
  const top = document.createElement("div");
  top.innerHTML = `<div>${rank}</div><div style="text-align:center">${suit}</div>`;
  top.innerHTML = `<div style="line-height:1">${rank}<span style="display:block; line-height:0.9;">${suit}</span></div>`;
  top.style.position = "absolute";
  top.style.left = "3px";
  top.style.top = "3px";
  top.style.fontSize = Math.floor(height * 0.08) + "px";
  card.appendChild(top);
  const bottom = top.cloneNode(true);
  bottom.style.left = "";
  bottom.style.right = "3px";
  bottom.style.top = "";
  bottom.style.bottom = "3px";
  bottom.style.transform = "rotate(180deg)";
  bottom.style.textAlign = "center";
  card.appendChild(bottom);
  return card;
}
function createCardContainer(dParent, styles = {}, id) {
  let container = mDom(dParent, { ...flexCenterCenter(), fg: 'white', ...styles }, { id });
  return container;
}
function createCardSVG(face, valueSymbolId, suitSymbolId) {
  const xmlns = "http://www.w3.org/2000/svg";
  const xlink = "http://www.w3.org/1999/xlink";
  const svg = document.createElementNS(xmlns, "svg");
  svg.setAttribute("class", "card");
  svg.setAttribute("face", face);
  svg.setAttribute("viewBox", "-120 -168 240 336");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("xmlns", xmlns);
  svg.setAttribute("xmlns:xlink", xlink);
  const rect = document.createElementNS(xmlns, "rect");
  rect.setAttribute("x", "-119.5");
  rect.setAttribute("y", "-167.5");
  rect.setAttribute("width", "239");
  rect.setAttribute("height", "335");
  rect.setAttribute("rx", "12");
  rect.setAttribute("ry", "12");
  rect.setAttribute("fill", "white");
  rect.setAttribute("stroke", "black");
  svg.appendChild(rect);
  const valueUse = document.createElementNS(xmlns, "use");
  valueUse.setAttributeNS(xlink, "xlink:href", `#${valueSymbolId}`);
  valueUse.setAttribute("x", "-114.4");
  valueUse.setAttribute("y", "-156");
  valueUse.setAttribute("height", "32");
  svg.appendChild(valueUse);
  const suitUse = document.createElementNS(xmlns, "use");
  suitUse.setAttributeNS(xlink, "xlink:href", `#${suitSymbolId}`);
  suitUse.setAttribute("x", "-111.784");
  suitUse.setAttribute("y", "-119");
  suitUse.setAttribute("height", "26.769");
  svg.appendChild(suitUse);
  const centerUse = document.createElementNS(xmlns, "use");
  centerUse.setAttributeNS(xlink, "xlink:href", `#${suitSymbolId}`);
  centerUse.setAttribute("x", "-35");
  centerUse.setAttribute("y", "-135.501");
  centerUse.setAttribute("height", "70");
  svg.appendChild(centerUse);
  const g = document.createElementNS(xmlns, "g");
  g.setAttribute("transform", "rotate(180)");
  const valueUse2 = valueUse.cloneNode();
  const suitUse2 = suitUse.cloneNode();
  const centerUse2 = centerUse.cloneNode();
  g.appendChild(valueUse2);
  g.appendChild(suitUse2);
  g.appendChild(centerUse2);
  svg.appendChild(g);
  return svg;
}
function createCountdown(elem, duration) {
  let isRunning = false;
  let remaining = duration;
  let interval = null;
  function updateDisplay() {
    const h = Math.floor(remaining / 3600).toString().padStart(2, '0');
    const m = Math.floor((remaining % 3600) / 60).toString().padStart(2, '0');
    const s = (remaining % 60).toString().padStart(2, '0');
    elem.textContent = `${h}:${m}:${s}`;
  }
  function start() {
    if (isRunning || remaining <= 0) return;
    isRunning = true;
    const startTime = Date.now();
    interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      remaining = duration - elapsed;
      updateDisplay();
      if (remaining <= 0) {
        stop();
        remaining = 0;
        updateDisplay();
      }
    }, 1000);
  }
  function stop() {
    isRunning = false;
    clearInterval(interval);
  }
  function toggle() {
    isRunning ? stop() : start();
  }
  elem.addEventListener('click', toggle);
  updateDisplay();
  return elem;
}
function createGameCard(container, game) {
  let bg = game.color, fg = colorIdealText(bg);
  let styles = { cursor: 'pointer', rounding: 10, bg, fg, fz: 65, hline: 65, padding: 10, wmin: 140, margin: 10, align: 'center' }; //, margin: 10, padding: 10, patop: 10, w: 140, height: 100, bg, position: 'relative' }
  let x = mKey(game.logo, container, styles, { label: capitalize(game.friendly), prefer: 'emo' });
  x.onclick = onclickGameMenuItem;
  x.setAttribute('gamename', game.name);
  x.id = game.id;
  return x;
}
function createHexGrid(d, rows, cols, sideLength = 50, gap = 1) {
  const container = toElem(d);
  container.innerHTML = '';
  const hexWidth = sideLength * 2;
  const hexHeight = hexWidth;
  const vertSpacing = hexHeight * 0.75;
  container.style.height = `${vertSpacing * rows + hexHeight * 0.25}px`;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const hex = document.createElement('div');
      hex.className = 'hex';
      hex.style.width = `${hexWidth - gap}px`;
      hex.style.height = `${hexHeight - gap}px`;
      const xOffset = (r % 2) * (hexWidth / 2);
      const x = c * hexWidth + xOffset;
      const y = r * vertSpacing;
      hex.style.left = `${x}px`;
      hex.style.top = `${y}px`;
      container.appendChild(hex);
    }
  }
}
function createHexShapedGrid(containerId, rows = 5, maxCols = 5, sz = 50, gap = 1) {
  if (rows % 2 === 0) {
    console.error("Number of rows must be odd for a symmetrical hexagon grid.");
    return;
  }
  const container = toElem(containerId);
  container.innerHTML = '';
  const hexWidth = sz * 2;
  const hexHeight = hexWidth;
  const vertSpacing = hexHeight * 0.75;
  const midRow = Math.floor(rows / 2);
  const tiles = {};
  let [w, h] = [hexWidth - gap, hexHeight - gap];
  for (let r = 0; r < rows; r++) {
    const offsetFromMiddle = Math.abs(midRow - r);
    const cols = maxCols - offsetFromMiddle;
    const totalRowOffset = ((maxCols - cols) / 2) * hexWidth;
    const horizontalOffset = (r % 2 === 1) ? hexWidth / 2 : 0;
    const y = r * vertSpacing;
    for (let i = 0; i < cols; i++) {
      const x = i * hexWidth + totalRowOffset;
      const c = Math.round(x / (hexWidth / 2));
      const id = `r${r}_c${c}`;
      let div = mDom(container, { className: 'hex', left: x, top: y, w, h }, { id })
      const tile = { id, div, x, y, sz, c, r, NE: null, E: null, SE: null, SW: null, W: null, NW: null };
      tiles[id] = tile;
    }
  }
  for (const id in tiles) {
    const tile = tiles[id];
    let [r, c] = [tile.r, tile.c];
    function getTile(rr, cc) { return tiles[`r${rr}_c${cc}`] || null; }
    tile.E = getTile(r, c + 2);
    tile.W = getTile(r, c - 2);
    tile.NE = getTile(r - 1, c + 1);
    tile.NW = getTile(r - 1, c - 1);
    tile.SE = getTile(r + 1, c + 1);
    tile.SW = getTile(r + 1, c - 1);
  }
  let hGrid = rows * vertSpacing + hexHeight * 0.25;
  let wGrid = maxCols * hexWidth;
  mStyle(container, { w: wGrid, h: hGrid }); //,bg:'skyblue'})
  return tiles;
}
function createHexShapedGridOptimized(containerId, rows = 5, maxCols = 5, sz = 50, gap = 1) {
  if (rows <= 0 || maxCols <= 0 || sz <= 0 || gap < 0) {
    console.error("Invalid input parameters: rows, maxCols, and sz must be positive, gap must be non-negative.");
    return null;
  }
  if (rows % 2 === 0) {
    console.error("Number of rows must be odd for a symmetrical hexagon grid.");
    return null;
  }
  const container = typeof toElem !== 'undefined' ? toElem(containerId) : document.getElementById(containerId);
  if (!container) {
    console.error(`Container element with id "${containerId}" not found.`);
    return null;
  }
  container.innerHTML = ''; // Clear previous content
  const hexWidth = sz * 2;
  const hexHeight = hexWidth;
  const vertSpacing = hexHeight * 0.75;
  const midRow = Math.floor(rows / 2);
  const gridWidth = 2 * maxCols;
  const grid = [];
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let r = 0; r < rows; r++) {
    grid[r] = new Array(gridWidth).fill(null);
    const offsetFromMiddle = Math.abs(midRow - r);
    const cols = maxCols - offsetFromMiddle;
    const totalRowOffset = ((maxCols - cols) / 2) * hexWidth;
    for (let i = 0; i < cols; i++) {
      const x = i * hexWidth + totalRowOffset;
      const y = r * vertSpacing;
      const c = Math.round(x / (hexWidth / 2));
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      if (c >= 0 && c < gridWidth) {
        const tile = {
          r: r, // Row index in the 2D array
          c: c, // Column index in the 2D array (offset coordinate)
          x: x, // X position for rendering (based on original code)
          y: y, // Y position for rendering (based on original code)
          sz: sz, // Size parameter
          NE: null,
          E: null,
          SE: null,
          SW: null,
          W: null,
          NW: null,
          div: null // Reference to the created DOM element
        };
        const tileId = `hex_${r}_${c}`;
        const tileW = hexWidth - gap;
        const tileH = hexHeight - gap;
        let div = typeof mDom !== 'undefined' ? mDom(container, { className: 'hex', left: x, top: y, w: tileW, h: tileH }, { id: tileId }) : null;
        if (div) {
          tile.div = div;
        } else {
          div = document.createElement('div');
          div.id = tileId;
          div.className = 'hex';
          div.style.position = 'absolute';
          div.style.left = `${x}px`;
          div.style.top = `${y}px`;
          div.style.width = `${tileW}px`;
          div.style.height = `${tileH}px`;
          container.appendChild(div);
          tile.div = div;
        }
        grid[r][c] = tile;
      } else {
        console.warn(`Calculated column index ${c} out of bounds [0, ${gridWidth - 1}] for row ${r}. Tile at i=${i}, x=${x}. This tile will not be added to the grid array.`);
      }
    }
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < gridWidth; c++) {
      const tile = grid[r][c];
      if (tile) {
        const neighbors = {
          E: { dr: 0, dc: 2 },
          W: { dr: 0, dc: -2 },
          NE: { dr: -1, dc: 1 },
          NW: { dr: -1, dc: -1 },
          SE: { dr: 1, dc: 1 },
          SW: { dr: 1, dc: -1 }
        };
        for (const dir in neighbors) {
          const neighborPos = neighbors[dir];
          const nr = r + neighborPos.dr;
          const nc = c + neighborPos.dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < gridWidth) {
            const neighborTile = grid[nr] ? grid[nr][nc] : null;
            if (neighborTile) {
              tile[dir] = neighborTile;
            }
          }
        }
      }
    }
  }
  let wGrid = (maxX - minX) + (hexWidth - gap);
  let hGrid = (maxY - minY) + (hexHeight - gap);
  if (typeof mStyle !== 'undefined') {
    mStyle(container, { w: wGrid, h: hGrid });
  } else {
    container.style.width = `${wGrid}px`;
    container.style.height = `${hGrid}px`;
    container.style.position = 'relative'; // Ensure positioning context for absolute children
    container.style.overflow = 'hidden'; // Hide potential overflow
  }
  return grid;
}
if (typeof toElem === 'undefined') {
  /**
   * Dummy function to get an element by ID.
   * @param {string} id The ID of the element.
   * @returns {HTMLElement|null} The element or null if not found.
   */
  function toElem(id) {
    return document.getElementById(id);
  }
}
if (typeof mDom === 'undefined') {
  /**
   * Dummy function to create a DOM element with styles and attributes and append to a container.
   * @param {HTMLElement} container The container element.
   * @param {Object} styles CSS styles to apply.
   * @param {Object} attrs Attributes to set.
   * @returns {HTMLElement} The created element.
   */
  function mDom(container, styles, attrs) {
    const div = document.createElement('div');
    if (styles) {
      for (const prop in styles) {
        if (['w', 'h', 'left', 'top'].includes(prop)) {
          div.style[prop] = `${styles[prop]}px`;
        } else {
          div.style[prop] = styles[prop];
        }
      }
    }
    if (attrs) {
      for (const prop in attrs) {
        div[prop] = attrs[prop];
      }
    }
    if (container) {
      container.appendChild(div);
    }
    return div;
  }
}
function createImageSymbol(src, id) {
  return `
      <symbol id="${id}" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
        <image href="${src}" x="0" y="0" width="100" height="100" />
      </symbol>
    `;
}
function createInteractiveCanvas(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = 300 / Math.min(img.width, img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const canvas = document.createElement('canvas');
      canvas.width = scaledWidth;
      canvas.height = scaledHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
      let isDragging = false;
      let rect = { x: 100, y: 100, width: 50, height: 50 }; // Initial rectangle properties
      let dragOffsetX, dragOffsetY;
      function isMouseInRect(x, y) {
        return x > rect.x && x < rect.x + rect.width && y > rect.y && y < rect.y + rect.height;
      }
      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
        ctx.fillStyle = 'red';
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
      }
      canvas.addEventListener('mousedown', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (isMouseInRect(x, y)) {
          isDragging = true;
          dragOffsetX = x - rect.x;
          dragOffsetY = y - rect.y;
        }
      });
      canvas.addEventListener('mousemove', (event) => {
        if (isDragging) {
          const rect = canvas.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          rect.x = x - dragOffsetX;
          rect.y = y - dragOffsetY;
          draw();
        }
      });
      canvas.addEventListener('mouseup', () => {
        isDragging = false;
      });
      draw();
      resolve(canvas);
    };
    img.onerror = reject;
    img.src = src;
  });
}
function createLineBetweenPoints(dboard, pointA, pointB, thickness = 10) {
  const [x1, y1] = pointA;
  const [x2, y2] = pointB;
  const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
  const line = document.createElement('div');
  line.style.position = 'absolute';
  line.style.width = `${length}px`;
  line.style.height = `${thickness}px`;
  line.style.backgroundColor = 'black'; // Customize line color
  line.style.top = `${y1}px`; // Set starting position
  line.style.left = `${x1}px`;
  line.style.transformOrigin = '0 50%'; // Rotate around the starting point
  line.style.transform = `rotate(${angle}deg)`;
  const parent = toElem(dboard);
  if (parent) {
    parent.style.position = 'relative'; // Ensure the parent is relatively positioned
    parent.appendChild(line);
  } else {
    console.error(`Parent element with selector '${dboard}' not found.`);
  }
}
function createOptionsPopup(dParent, title, bg, styles = {}) {
  let d1 = mDom(dParent, {
    bg: colorLight(bg, 50),
    border: `solid 2px ${bg}`,
    rounding: 6,
    display: 'inline-block',
    hPadding: 3,
    ...styles
  }, { id: 'dPlayerOptions' });
  mDom(d1, {}, { html: title });
  let d = mDom(d1);
  mCenterFlex(d);
  return [d1, d];
}
function createPanZoomCanvas(parentElement, src, wCanvas, hCanvas) {
  const canvas = document.createElement('canvas');
  canvas.width = wCanvas;
  canvas.height = hCanvas;
  parentElement.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let image = new Image();
  image.src = src;
  let scale = 1;
  let originX = 0;
  let originY = 0;
  let startX = 0;
  let startY = 0;
  let isDragging = false;
  image.onload = () => {
    if (image.width < canvas.width) canvas.width = image.width;
    if (image.height < canvas.height) canvas.height = image.height;
    const scaleX = canvas.width / image.width;
    const scaleY = canvas.height / image.height;
    scale = Math.min(scaleX, scaleY, 1);
    originX = (canvas.width - image.width * scale) / 2;
    originY = (canvas.height - image.height * scale) / 2;
    draw();
  };
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(originX, originY);
    ctx.scale(scale, scale);
    ctx.drawImage(image, 0, 0);
    ctx.restore();
  }
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX - originX;
    startY = e.clientY - originY;
    canvas.style.cursor = 'grabbing';
  });
  canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
      originX = e.clientX - startX;
      originY = e.clientY - startY;
      draw();
    }
  });
  canvas.addEventListener('mouseup', () => {
    isDragging = false;
    canvas.style.cursor = 'grab';
  });
  canvas.addEventListener('mouseout', () => {
    isDragging = false;
    canvas.style.cursor = 'grab';
  });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoom = Math.exp(e.deltaY * -0.0005);
    scale *= zoom;
    if (scale >= 1) scale = 1;
    const mouseX = e.clientX - canvas.offsetLeft;
    const mouseY = e.clientY - canvas.offsetTop;
    originX = mouseX - (mouseX - originX) * zoom;
    originY = mouseY - (mouseY - originY) * zoom;
    draw();
  });
  let touchStartX = 0;
  let touchStartY = 0;
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      touchStartX = e.touches[0].clientX - originX;
      touchStartY = e.touches[0].clientY - originY;
      canvas.style.cursor = 'grabbing';
    }
  });
  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1 && isDragging) {
      originX = e.touches[0].clientX - touchStartX;
      originY = e.touches[0].clientY - touchStartY;
      draw();
    }
  });
  canvas.addEventListener('touchend', () => {
    isDragging = false;
    canvas.style.cursor = 'grab';
  });
  return canvas;
}
function createPlayerOptionsPopup(dParent, player, handler) {
  let bg = MGetUserColor(player);
  let d1 = mDom(dParent, {
    bg: colorLight(bg, 50),
    border: `solid 2px ${bg}`,
    rounding: 6,
    display: 'inline-block',
    hPadding: 3
  }, { id: 'dPlayerOptions' });
  mDom(d1, {}, { html: player });
  let d = mDom(d1);
  mCenterFlex(d);
  mButtonX(d1, handler, 20, 0, 'dimgray');
  return [d1, d];
}
function createRadioGroup(dParent, key, values, selectedValue, onOptionChange = null) {
  let list = values.split(',');
  let fs = mRadioGroup(dParent, { fg: 'black' }, `d_${key}`, formatLegend(key));
  for (const v of list) {
    let val = isNumber(v) ? Number(v) : v;
    let radio = mRadio(v, val, key, fs, { cursor: 'pointer' }, null, key, false);
    if (onOptionChange) {
      radio.firstChild.onchange = () => onOptionChange(val);
    }
  }
  for (const ch of fs.children) {
    if (!ch.id) continue;
    let rval = stringAfterLast(ch.id, '_');
    if (isNumber(rval)) rval = Number(rval);
    ch.firstChild.checked = selectedValue == rval || (nundef(selectedValue) && `${rval}` == arrLast(list));
  }
  measureFieldset(fs);
  return fs;
}
function createScaledCanvasFromImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = 300 / Math.min(img.width, img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const canvas = document.createElement('canvas');
      canvas.width = scaledWidth;
      canvas.height = scaledHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
      resolve(canvas);
    };
    img.onerror = reject;
    img.src = src;
  });
}
function createSection(parentId, sectionId) {
  return mBy(sectionId) || mDom(parentId, {}, { className: 'section', id: sectionId });
}
function createSquareGrid(dParent, rows = 5, cols = 5, sz = 50, gap = 1) {
  const container = toElem(dParent);
  container.innerHTML = '';
  let [w, h] = [sz - gap, sz - gap];
  const tiles = {};
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = `r${r}_c${c}`;
      let [x, y] = [c * sz, r * sz]; console.log(x, y)
      let div = mDom(container, { position: 'absolute', left: x, top: y, w, h }, { id })
      const tile = { id, r, c, x, y, sz, div, N: null, E: null, S: null, W: null };
      tiles[id] = tile;
    }
  }
  for (const id in tiles) {
    const t = tiles[id];
    t.N = tiles[`r${t.r - 1}_c${t.c}`] || null;
    t.S = tiles[`r${t.r + 1}_c${t.c}`] || null;
    t.E = tiles[`r${t.r}_c${t.c + 1}`] || null;
    t.W = tiles[`r${t.r}_c${t.c - 1}`] || null;
  }
  mStyle(container, { w: cols * sz, h: rows * sz }); //,bg:'skyblue'})
  return tiles;
}
function createStopwatch(elem) {
  elem = toElem(elem);
  let isRunning = false; mStyle(elem, { fg: 'white' });
  let elapsed = 0;
  let interval = null;
  function getElapsed() {
    let nums = allNumbers(elem.textContent);
    return nums[0] * 3600 + nums[1] * 60 + nums[2];
    const h = Math.floor(elapsed / 3600).toString().padStart(2, '0');
    const m = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
    const s = (elapsed % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }
  function updateDisplay() {
    const h = Math.floor(elapsed / 3600).toString().padStart(2, '0');
    const m = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
    const s = (elapsed % 60).toString().padStart(2, '0');
    elem.textContent = `${h}:${m}:${s}`;
  }
  function start() {
    if (isRunning) return;
    isRunning = true;
    const startTime = Date.now() - elapsed * 1000;
    interval = setInterval(() => {
      elapsed = Math.floor((Date.now() - startTime) / 1000);
      updateDisplay();
    }, 1000);
  }
  function stop() {
    isRunning = false;
    clearInterval(interval);
  }
  function toggle() {
    isRunning ? stop() : start();
  }
  function getStatus() { return isRunning ? 1 : 0; }
  function reset() {
    elapsed = 0;
    updateDisplay();
  }
  elem.addEventListener('click', toggle);
  updateDisplay();
  return { elem, start, stop, toggle, getElapsed, getStatus, reset };
}
function createSvgTessellationPolygons(dParent, TessClass, styles = {}, options = {}) {
  dParent = toElem(dParent);
  mClear(dParent);
  const cols = options.cols || 5;
  const rows = options.rows || 5;
  const tessagon = new TessClass({
    function: planeFunction,
    u_range: [0.0, 1.0],
    v_range: [0.0, 1.0],
    u_num: cols,
    v_num: rows,
    u_cyclic: false,
    v_cyclic: false,
    adaptor_class: SvgAdaptor
  });
  const svgElem = tessagon.create_mesh();
  dParent.appendChild(svgElem);
  const polygons = svgElem.querySelectorAll('polygon');
  polygons.forEach(poly => {
    for (const [k, v] of Object.entries(styles)) {
      poly.setAttribute(k, v);
    }
  });
  return polygons;
}
function createTessellationDivs(container, faces, vertices, options = {}) {
  const width = options.width || 600;
  const height = options.height || 600;
  const scaleX = options.scaleX || 1;
  const scaleY = options.scaleY || 1;
  const tileClass = options.tileClass || 'tessagon-tile';
  const tileStyle = options.tileStyle || {};
  container.style.position = 'relative';
  container.style.width = width + 'px';
  container.style.height = height + 'px';
  container.innerHTML = '';
  console.log('faces', faces)
  faces.forEach((face, i) => {
    const div = document.createElement('div');
    div.className = tileClass;
    const polygonPoints = face.map(idx => {
      const [x, y] = vertices[idx];
      const px = (x * scaleX / width) * 100;
      const py = (y * scaleY / height) * 100;
      return `${px}% ${py}%`;
    }).join(', ');
    console.log('polygonPoints', polygonPoints)
    div.style.position = 'absolute';
    div.style.top = '0';
    div.style.left = '0';
    div.style.width = '100%';
    div.style.height = '100%';
    div.style.clipPath = `polygon(${polygonPoints})`;
    div.style.backgroundColor = options.backgroundColor || `hsl(${(i * 30) % 360}, 60%, 70%)`;
    div.style.border = options.border || '1px solid #333';
    div.style.boxSizing = 'border-box';
    Object.entries(tileStyle).forEach(([k, v]) => div.style[k] = v);
    container.appendChild(div);
  });
}
function cropImage(imageUrl, d) {
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    d.appendChild(canvas);
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    let isCropping = false;
    let startX, startY, endX, endY;
    canvas.addEventListener('mousedown', (e) => {
      isCropping = true;
      startX = e.offsetX;
      startY = e.offsetY;
    });
    canvas.addEventListener('mousemove', (e) => {
      if (isCropping) {
        endX = e.offsetX;
        endY = e.offsetY;
        drawCropRect();
      }
    });
    canvas.addEventListener('mouseup', (e) => {
      if (isCropping) {
        isCropping = false;
        cropImage();
      }
    });
    function drawCropRect() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.strokeRect(startX, startY, endX - startX, endY - startY);
    }
    function cropImage() {
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = endX - startX;
      croppedCanvas.height = endY - startY;
      const croppedCtx = croppedCanvas.getContext('2d');
      croppedCtx.drawImage(img, startX, startY, endX - startX, endY - startY, 0, 0, endX - startX, endY - startY);
      const link = document.createElement('a');
      link.download = 'cropped_image.png';
      link.href = croppedCanvas.toDataURL('image/png');
      link.click();
    }
  };
  img.src = imageUrl;
}
function cropOrExpandImageAndGetDataUrl(imageSrc, x, y) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // CORS permission for cross-origin images
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 300;
      canvas.height = 300;
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const dx = isdef(x) ? x * scale : (canvas.width - scaledWidth) / 2;
      const dy = isdef(y) ? y * scale : (canvas.height - scaledHeight) / 2;
      ctx.drawImage(img, dx, dy, scaledWidth, scaledHeight);
      const dataUrl = canvas.toDataURL();
      resolve(dataUrl);
    };
    img.onerror = (error) => reject(error);
    img.src = imageSrc;
  });
}
function cropTo(tool, wnew, hnew) {
  let [img, dParent, cropBox, setRect] = [tool.img, tool.dParent, tool.cropBox, tool.setRect];
  let [x, y, w, h] = ['left', 'top', 'width', 'height'].map(x => parseInt(cropBox.style[x]));
  let xnew = x + (wnew - w) / 2;
  let ynew = y + (hnew - h) / 2;
  redrawImage(img, dParent, xnew, ynew, wnew, wnew, wnew, hnew, () => setRect(0, 0, wnew, hnew))
}
function cryBoard(dParent, cols, rows, sz) {
  dParent = toElem(dParent);
  let [w, h] = [sz * cols + sz + 20, (sz * .75) * cols + 40];
  let dBoard = mDom(dParent, { w, h });
  let d = mDom(dBoard, { gap: 10, margin: 10, position: 'relative' });
  let clip = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';
  let dihab = { mountain: 'gray', desert: 'yellow', forest: 'green', water: 'blue', swamp: 'brown' };
  let diterr = { all: null, bear: 'black', puma: 'red' };
  let items = [];
  for (let r = 0; r < rows; r++) {
    let x = r % 2;
    let thiscols = x > 0 ? cols : cols + 1;
    for (let c = 0; c < cols; c++) {
      let gap = 1;
      let db = mDom(d, { clip, w: sz - gap, h: sz - gap, position: 'absolute', left: x * sz * .5, top: r * sz * .75 }); //, bg:rChoose(Object.keys(dihab))})
      let shrink = 0;
      let habitat = rChoose(Object.keys(dihab));
      let territory = rChoose(Object.keys(diterr));
      if (territory == 'puma') { shrink = 4; mStyle(db, getDashedHexBorder('red')); }
      else if (territory == 'bear') { shrink = 4; mStyle(db, getDashedHexBorder('silver')); }
      let d1 = mDom(db, { left: 2, top: 2, clip, position: 'absolute', w: sz - (gap + shrink), h: sz - (gap + shrink), bg: dihab[habitat] });
      x += 2;
      mCenterCenterFlex(d1);
      items.push({ r, c, div: d1, habitat, territory })
    }
  }
  return items;
}
function cryptid() {
}
function cryptidBoard(dParent, cols, rows, sz) {
  dParent = toElem(dParent);
  let [w, h] = [sz * cols + sz + 20, (sz * .75) * cols + 40];
  let dBoard = mDom(dParent, { w, h });
  let d = mDom(dBoard, { gap: 0, margin: 0, position: 'relative' });
  let clip = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';
  let dihab = { mountain: 'gray', desert: 'yellow', forest: 'green', water: 'blue', swamp: 'brown' };
  let diterr = { all: null, bear: 'black', puma: 'red' };
  let distruct = { all: null, shack: 'green', stone: 'grey', hut: 'brown', house: 'blue', castle: 'white' };
  let items = [];
  for (let r = 0; r < rows; r++) {
    let x = r % 2;
    let thiscols = x > 0 ? cols : cols + 1;
    for (let c = 0; c < cols; c++) {
      let gap = 2;
      let habitat = rChoose(Object.keys(dihab));
      let territory = rChoose(Object.keys(diterr));
      let structure = rChoose(Object.keys(distruct));
      let bg = dihab[habitat];
      let d1 = cryptidTile(d, x, r, sz, gap, clip, bg, territory, structure);
      let center = centerOfDiv(d1);
      items.push({ row: r, col: c, cx: center.x, cy: center.y, w: sz, h: sz, div: d1, habitat, territory, structure })
      x += 2;
    }
  }
  return items;
}
function cryptidTile(d, x, r, sz, gap, clip, bg, territory) {
  let sznet = sz - gap;
  let posnet = sz - gap / 2;
  let [w, h, left, top] = [sznet, sznet, x * posnet * .5, r * posnet * .75];
  let html = `
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" pointer-events="none">
              <polygon
                points="50,0 100,25 100,75 50,100 0,75 0,25"
                stroke="${territory == 'puma' ? 'red' : territory == 'bear' ? 'silver' : bg}"
                stroke-width="2"
                fill="${bg}"
                ${territory == 'puma' || territory == 'bear' ? 'stroke-dasharray="2,2"' : ''}
                stroke-linejoin="round"
              />
            </svg>
      `; //vector-effect="non-scaling-stroke" points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" 
  let d1 = mDom(d, { cursor: 'pointer', position: 'absolute', left, top, w, h, clip, bg }, { html });
  mCenterCenterFlex(d1);
  return d1;
}
function darkenColor(hex, amount = 20) {
  function hexToHSL(H) {
    let r = 0, g = 0, b = 0;
    if (H.length === 4) {
      r = parseInt(H[1] + H[1], 16);
      g = parseInt(H[2] + H[2], 16);
      b = parseInt(H[3] + H[3], 16);
    } else if (H.length === 7) {
      r = parseInt(H[1] + H[2], 16);
      g = parseInt(H[3] + H[4], 16);
      b = parseInt(H[5] + H[6], 16);
    }
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h *= 60;
    }
    return { h, s: s * 100, l: l * 100 };
  }
  function hslToHex({ h, s, l }) {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (0 <= h && h < 60) [r, g, b] = [c, x, 0];
    else if (60 <= h && h < 120) [r, g, b] = [x, c, 0];
    else if (120 <= h && h < 180) [r, g, b] = [0, c, x];
    else if (180 <= h && h < 240) [r, g, b] = [0, x, c];
    else if (240 <= h && h < 300) [r, g, b] = [x, 0, c];
    else if (300 <= h && h < 360) [r, g, b] = [c, 0, x];
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    return "#" + [r, g, b].map(x =>
      x.toString(16).padStart(2, "0")
    ).join("");
  }
  const hsl = hexToHSL(hex);
  hsl.l = Math.max(0, hsl.l - amount);
  return hslToHex(hsl);
}
function deckDeal(deck, n) { return deck.splice(0, n); }
function deepCompare(obj1, obj2) {
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
    return obj1 === obj2 ? null : { oldValue: obj1, newValue: obj2 };
  }
  const changes = {};
  for (let key in obj1) {
    if (obj1.hasOwnProperty(key)) {
      const nestedChanges = deepCompare(obj1[key], obj2[key]);
      if (nestedChanges !== null) {
        changes[key] = nestedChanges;
      }
    }
  }
  for (let key in obj2) {
    if (obj2.hasOwnProperty(key) && !obj1.hasOwnProperty(key)) {
      changes[key] = { oldValue: undefined, newValue: obj2[key] };
    }
  }
  return Object.keys(changes).length > 0 ? changes : null;
}
function deepMerge(target, source) {
  if (Array.isArray(target) && Array.isArray(source)) {
    return mergeArrays(target, source);
  } else if (isObject(target) && isObject(source)) {
    const output = Object.assign({}, target);
    Object.keys(source).forEach(key => {
      if (isObject(source[key]) || Array.isArray(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
    return output;
  }
  return source;
}
function deepMergeConcatLists(target, source) {
  if (Array.isArray(target) && Array.isArray(source)) {
    return [...target, ...source];
  } else if (isObject(target) && isObject(source)) {
    const output = Object.assign({}, target);
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMergeConcatLists(target[key], source[key]);
        }
      } else if (Array.isArray(source[key])) {
        output[key] = target[key] ? deepMergeConcatLists(target[key], source[key]) : source[key];
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
    return output;
  }
  return source;
}
function deepMergeIndex(target, source) {
  if (typeof target !== 'object' || typeof source !== 'object') {
    throw new Error('Both arguments must be objects');
  }
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (target.hasOwnProperty(key)) {
        if (typeof target[key] === 'object' && typeof source[key] === 'object') {
          target[key] = deepMergeIndex(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      } else {
        target[key] = source[key];
      }
    }
  }
  return target;
}
function deepMergeOverrideLists(target, source) {
  let output = Object.assign({}, source);
  if (isObject(source) && isObject(target)) {
    Object.keys(target).forEach(key => {
      if (isObject(target[key])) {
        if (!(key in source))
          Object.assign(output, { [key]: target[key] });
        else
          output[key] = deepMergeOverrideLists(source[key], target[key]);
      } else {
        Object.assign(output, { [key]: target[key] });
      }
    });
  }
  return output;
}
function deepmerge(target, source, optionsArgument) {
  var array = Array.isArray(source);
  var options = optionsArgument || { arrayMerge: defaultArrayMerge }
  var arrayMerge = options.arrayMerge || defaultArrayMerge
  if (array) {
    return Array.isArray(target) ? arrayMerge(target, source, optionsArgument) : cloneIfNecessary(source, optionsArgument)
  } else {
    return mergeObject(target, source, optionsArgument)
  }
}
function deepmergeOverride(base, drueber) { return mergeOverrideArrays(base, drueber); }
function defaultArrayMerge(target, source, optionsArgument) {
  var destination = target.slice()
  source.forEach(function (e, i) {
    if (typeof destination[i] === 'undefined') {
      destination[i] = cloneIfNecessary(e, optionsArgument)
    } else if (isMergeableObject(e)) {
      destination[i] = deepmerge(target[i], e, optionsArgument)
    } else if (target.indexOf(e) === -1) {
      destination.push(cloneIfNecessary(e, optionsArgument))
    }
  })
  return destination
}
function defaultGameFunc() {
  function setup(table) {
    let fen = {};
    for (const name in table.players) {
      let pl = table.players[name];
      pl.score = 0;
    }
    fen.cards = [1, 2, 3];
    fen.deck = range(4, table.options.numCards);
    table.plorder = jsCopy(table.playerNames);
    table.turn = jsCopy(table.playerNames);
    return fen;
  }
  function present(dParent, table) { clearMain(); }
  async function activate(table) { console.log('activate for', getUname()) }
  async function stats(table) { console.log('stats for', getUname()) }
  function checkGameover(table) { return false; }
  async function hybridMove(table) { console.log('hybrid moves for', getUname()) }
  async function botMove(table) { console.log('robot moves for', getUname()) }
  function prepLayout(table) { presentStandardRoundTable(table); }
  async function stepComplete(table, o) { console.log(`integrate if step complete for ${table.friendly}`); }
  return { stats, prepLayout, setup, activate, checkGameover, present, hybridMove, botMove, stepComplete };
}
async function deleteEvent(id) {
  let result = await simpleUpload('postEvent', { id });
  delete Items[id];
  mBy(id).remove();
}
async function deleteGame(gameId) {
  return await api('DELETE', `/delete_game/${gameId}`);
}
async function deleteGames() {
  return await api('DELETE', `/delete_games`);
}
function deleteKeyFromLocalSuperdi(k) {
  delete M.superdi[k];
  let fri = item.friendly;
  let lst = M.byFriendly[fri];
  removeInPlace(lst, k); if (isEmpty(lst)) { delete M.byFriendly[fri]; removeInPlace(M.names, fri); }
  for (const cat of item.cats) {
    let lst = M.byCat[cat];
    removeInPlace(lst, k); if (isEmpty(lst)) { delete M.byCat[cat]; removeInPlace(M.categories, cat); }
  }
}
function detectSessionType() {
  if (isdef(DA.project)) return DA.sessionType;
  let loc = window.location.href; console.log('BAU1.JS ??????????????????detectSessionType', loc);
  DA.project = stringAfterLast(stringBefore(loc, '/index.html'), '/'); console.log('project', DA.project);
  DA.serverdir = SERVERDIR;
  DA.sessionType =
    loc.includes('moxito.online/at0') ? 'at0' :
      loc.includes('moxito.online') ? 'fastcomet' :
        loc.includes('telecave') ? 'telecave' :
          loc.includes('8080') ? 'php' :
            loc.includes(':3000') ? 'nodejs' :
              loc.includes(':5000') ? 'flask' :
                'live'; // loc.includes('vidulus') ? 'vps' :
  return DA.sessionType;
}
function dict2list(di, keyName = 'id') {
  let vals = Object.values(di);
  if (vals.length == 0) return [];
  let res = [];
  if (!isDict(vals[0])) {
    for (const v of vals) res.push({ value: v });
  } else res = vals;
  let keys = Object.keys(di);
  for (let i = 0; i < res.length; i++) { res[i][keyName] = keys[i]; }
  return res;
}
function dictMerge(target, source) {
  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], dictMerge(target[key], source[key]));
    }
  }
  return { ...target, ...source };
}
function disableButton(b) { mClass(toElem(b), 'disabled') }
function disableUI() { mShield('dGameDiv'); }
function displaySymbol(symbolString, containerDiv) {
  const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  tempSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const idMatch = symbolString.match(/<symbol[^>]*id=['"]([^'"]+)['"]/);
  if (!idMatch) {
    console.error("Symbol ID not found");
    return;
  }
  const symbolId = idMatch[1];
  tempSvg.innerHTML = `
    <defs>${symbolString}</defs>
    <use href="#${symbolId}" x="0" y="0" />
  `;
  tempSvg.setAttribute("width", "100");
  tempSvg.setAttribute("height", "100");
  containerDiv.innerHTML = ""; // Clear previous content
  containerDiv.appendChild(tempSvg);
}
function divideRectangleIntoGrid(w, h, n) {
  let bestRows = 1;
  let bestCols = n;
  let bestAspectRatio = Infinity;
  for (let rows = 1; rows <= n; rows++) {
    const cols = Math.ceil(n / rows);
    const cellWidth = w / cols;
    const cellHeight = h / rows;
    const aspectRatio = Math.abs(cellWidth / cellHeight - 1);
    if (aspectRatio < bestAspectRatio) {
      bestAspectRatio = aspectRatio;
      bestRows = rows;
      bestCols = cols;
    }
  }
  return { rows: bestRows, cols: bestCols };
}
function doYourThing(inp, grid) {
  let words = extractWords(inp.value, ' ').map(x => x.toLowerCase());
  let checklist = Array.from(grid.querySelectorAll('input[type="checkbox"]')); //chks=items.map(x=>iDiv(x).firstChild);
  let allNames = checklist.map(x => x.name);
  let names = checklist.filter(x => x.checked).map(x => x.name);
  for (const w of words) {
    if (!allNames.includes(w)) {
      let div = mCheckbox(grid, w);
      let chk = div.firstChild;
      chk.checked = true;
      chk.addEventListener('click', ev => checkToInput(ev, inp, grid))
      needToSortChildren = true;
    } else {
      let chk = checklist.find(x => x.name == w);
      if (!chk.checked) chk.checked = true;
    }
  }
  for (const name of names) {
    if (!words.includes(name)) {
      let chk = checklist.find(x => x.name == name);
      chk.checked = false;
    }
  }
  sortCheckboxes(grid);
  words.sort();
  inp.value = words.join(', ') + ', ';
}
function downloadAsText(text, filename) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
function downloadAsYaml(o, filename) {
  let y = jsyaml.dump(o);
  downloadAsText(y, filename + '.yaml');
}
async function downloadVideo(url, filename) {
  try {
    const response = await fetch(url, { mode: 'no-cors' });
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename || 'video.mp4'; // Set the filename
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Download failed:', error);
  }
}
function drag(ev) {
  let elem = ev.target;
  dragStartOffset = getRelCoords(ev, elem);
  draggedElement = elem;
}
function draw() {
  background(51);
  for (let i = 0; i < tree.length; i++) {
    tree[i].show();
    if (jittering) tree[i].jitter();
  }
  for (let i = 0; i < leaves.length; i++) {
    let l = leaves[i].current;
    noStroke();
    fill(0, 255, 100, 100);
    ellipse(l.x, l.y, 8, 8);
    if (jittering) leaves[i].current.y += random(0, 2);
  }
}
function drawCairoTile(parent, x, y, w, h, flip = false, color = 'black') {
  const div = document.createElement('div');
  div.style.position = 'absolute';
  div.style.width = `${w}px`;
  div.style.height = `${h}px`;
  div.style.left = `${x}px`;
  div.style.top = `${y}px`;
  div.style.backgroundColor = color;
  div.style.clipPath = getCairoPentagonClipPath();
  if (flip) div.style.transform = 'scaleX(-1)';
  parent.appendChild(div);
  return div;
}
function drawCircle(d, x, y, sz = 4, bg = 'red') {
  mDom(d, { bg, round: true, w: sz, h: sz, position: 'absolute', left: x - sz / 2, top: y - sz / 2 }); //left:0,top:0}); //
}
function drawCircleOnCanvas(canvas, cx, cy, sz, color) {
  const ctx = canvas.getContext('2d');
  ctx.beginPath();
  ctx.arc(cx, cy, sz / 2, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}
function drawCircleOnDiv(dParent, cx, cy, sz, bg = 'red') {
  let o = { cx, cy, x: cx - sz / 2, y: cy - sz / 2, sz, bg };
  let [w, h] = [sz, sz];
  o.div = mDom(dParent, { w, h, position: 'absolute', round: true, x: cx - sz / 2, y: cy - sz / 2, bg });
  return o;
}
function drawEllipseOnCanvas(canvas, cx, cy, w, h, color = 'orange', stroke = 0, border = 'red') {
  const ctx = canvas.getContext('2d');
  ctx.beginPath();
  ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, 2 * Math.PI);
  if (stroke > 0) { ctx.strokeStyle = border; ctx.lineWidth = stroke; ctx.stroke(); }
  if (color) { ctx.fillStyle = color; ctx.fill(); }
}
function drawHexBoard(topside, side, dParent, styles = {}, itemStyles = {}, opts = {}) {
  addKeys({ box: true }, styles);
  let dOuter = mDom(dParent, styles, opts);
  let d = mDom(dOuter, { position: 'relative', });
  let { centers, rows, maxcols } = hexBoardCenters(topside, side);
  let [w, h] = mSizeSuccession(itemStyles, 24);
  let gap = valf(styles.gap, -.5);
  let items = [];
  if (gap != 0) copyKeys({ w: w - gap, h: h - gap }, itemStyles);
  for (const c of centers) {
    let dhex = hexFromCenter(d, { x: c.x * w, y: c.y * h }, addKeys({ bg: 'rand' }, itemStyles));
    let item = { div: dhex, cx: c.x, cy: c.y, row: c.row, col: c.col };
    items.push(item);
  }
  let [wBoard, hBoard] = [maxcols * w, rows * h * .75 + h * .25];
  mStyle(d, { w: wBoard, h: hBoard });
  return { div: dOuter, topside, side, centers, rows, maxcols, boardShape: 'hex', w, h, wBoard, hBoard, items }
}
function drawInteractiveLine(d, p1, p2, color = 'black', thickness = 10) {
  const offs = thickness / 2;
  let [x1, y1, x2, y2] = [p1.x, p1.y, p2.x, p2.y];
  const distance = Math.hypot(x2 - x1, y2 - y1);
  const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
  const line = mDom(d, { left: x1, top: y1 - offs, bg: color, opacity: .1, className: 'line1', w: distance, h: thickness, transform: `rotate(${angle}deg)` })
  line.dataset.x1 = x1;
  line.dataset.y1 = y1;
  line.dataset.x2 = x2;
  line.dataset.y2 = y2;
  line.dataset.thickness = thickness;
  return line;
}
function drawInteractiveLine_orig(p1, p2) {
  const line = document.createElement('div');// mDom(d);
  const distance = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
  line.style.position = 'absolute';
  line.style.transformOrigin = '0 0';
  line.style.transform = `rotate(${angle}deg)`;
  line.style.height = '2px';
  line.style.width = `${distance}px`;
  line.style.backgroundColor = 'black';
  line.style.left = `${p1.x}px`;
  line.style.top = `${p1.y}px`;
  line.addEventListener('mouseover', () => {
    line.style.backgroundColor = 'red';
  });
  line.addEventListener('mouseout', () => {
    line.style.backgroundColor = 'black';
  });
  document.body.appendChild(line);
  return line;
}
function drawLineOnCanvas(canvas, x1, y1, x2, y2, stroke = 1) {
  const ctx = canvas.getContext('2d');
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = stroke;
  ctx.stroke();
}
function drawLineSegmentDiv(x1, y1, x2, y2, parent, thickness = 5, color = 'black') {
  const length = Math.hypot(x2 - x1, y2 - y1);
  const angleRad = Math.atan2(y2 - y1, x2 - x1);
  const angleDeg = angleRad * 180 / Math.PI;
  const line = document.createElement('div');
  line.style.position = 'absolute';
  line.style.left = `${x1}px`;
  line.style.top = `${y1 - thickness / 2}px`; // center vertically
  line.style.width = `${length}px`;
  line.style.height = `${thickness}px`;
  line.style.backgroundColor = color;
  line.style.transform = `rotate(${angleDeg}deg)`;
  line.style.transformOrigin = '0 50%'; // rotate around start point
  line.style.pointerEvents = 'none';
  parent.appendChild(line);
  return line;
}
function drawMeeple(dParent, p) {
  let addLabel = true;
  let html = isdef(p.owner) && addLabel ? p.owner[0].toUpperCase() : ''; //p.id.substring(1) : ''
  let d1 = p.div = mDom(dParent, { fz: p.sz * .75, left: p.x + p.sz / 2, top: p.y + p.sz / 2, w: p.sz, h: p.sz, position: 'absolute', bg: p.bg, fg: 'contrast' }, { html, id: p.id });
  mCenterCenterFlex(d1);
  d1.style.cursor = 'default';
}
function drawPentagonAtCenter(parent, center, w, h, color = 'black') {
  const div = document.createElement('div');
  div.style.position = 'absolute';
  div.style.width = `${w}px`;
  div.style.height = `${h}px`;
  div.style.left = `${center.x - w / 2}px`;
  div.style.top = `${center.y - h / 2}px`;
  div.style.backgroundColor = color;
  div.style.clipPath = generatePentagonClipPath();
  parent.appendChild(div);
  return div;
}
function drawPix(ctx, x, y, color = 'red', sz = 5) {
  ctx.fillStyle = color;
  ctx.fillRect(x - sz / 2, y - sz / 2, sz, sz)
}
function drawPixFrame(ctx, x, y, color = 'red', sz = 5) {
  ctx.strokeStyle = color;
  ctx.strokeRect(x - sz / 2, y - sz / 2, sz, sz)
}
function drawPoint(dParent, p, addLabel = true) {
  let html = isdef(p.owner) && addLabel ? p.owner[0].toUpperCase() : '';
  addKeys({ sz: 20, bg: rColor(), id: getUID() }, p);
  let d1 = p.div = mDom(dParent, { round: true, left: p.x, top: p.y, w: p.sz, h: p.sz, position: 'absolute', bg: p.bg, align: 'center', fg: 'contrast' }, { html, id: p.id });
  d1.style.cursor = 'default';
  if (isdef(p.border)) mStyle(d1, { outline: `solid ${p.border} 4px` });
  let rect = getRect(d1);
  p.cx = p.x + p.sz / 2; p.cy = p.y + p.sz / 2;
  p.xPage = rect.x; p.yPage = rect.y;
  p.cxPage = rect.x + p.sz / 2; p.cyPage = rect.y + p.sz / 2;
  return p;
}
function drawPointStar(p1, d, sz) {
  let starSizes = [1, .4, 1, 1, 1, .8, 1, .6, 1];
  let itype = p1.type % starSizes.length;
  p1.sz = sz = 30 * starSizes[itype];
  let img = p1.div = cloneImage(M.starImages[itype], d, p1.x, p1.y, sz, sz);
  img.id = p1.id = `p${p1.x}_${p1.y}`;
}
function drawPointType(dParent, p, addLabel = true) {
  let html = isdef(p.owner) && addLabel ? p.owner[0].toUpperCase() : '';
  addKeys({ sz: 20, bg: rColor(), id: getUID() }, p);
  let d1 = p.div = mDom(dParent, { round: true, left: p.x, top: p.y, w: p.sz, h: p.sz, position: 'absolute', bg: p.bg, align: 'center', fg: 'contrast' }, { html, id: p.id });
  d1.style.cursor = 'default';
  if (isdef(p.border)) mStyle(d1, { outline: `solid ${p.border} 4px` });
  let rect = getRect(d1);
  p.cx = p.x + p.sz / 2; p.cy = p.y + p.sz / 2;
  p.xPage = rect.x; p.yPage = rect.y;
  p.cxPage = rect.x + p.sz / 2; p.cyPage = rect.y + p.sz / 2;
  return p;
}
function drawShape(key, dParent, styles, classes, sizing) {
  if (nundef(styles)) styles = { w: 96, h: 96, bg: 'random' };
  if (nundef(sizing)) sizing = { hgrow: true, wgrow: true };
  let d = mDom(dParent, { ...styles, className: classes, ...sizing });
  if (key == 'circle' || key == 'ellipse') mStyle(d, { rounding: '50%' });
  else mStyle(d, { 'clip-path': PolyClips[key] });
  return d;
}
function drawTriangleAtCenter(parent, center, w, h, pointingUp = true, color = 'black') {
  const div = document.createElement('div');
  div.style.position = 'absolute';
  div.style.width = `${w}px`;
  div.style.height = `${h}px`;
  div.style.left = `${center.x - w / 2}px`;
  div.style.top = `${center.y - h / 2}px`;
  div.style.backgroundColor = color;
  div.style.clipPath = pointingUp
    ? 'polygon(50% 0%, 0% 100%, 100% 100%)'
    : 'polygon(0% 0%, 100% 0%, 50% 100%)';
  parent.appendChild(div);
  return div;
}
function drop(ev) {
  ev.preventDefault();
  let targetElem = findDragTarget(ev);
  targetElem.appendChild(draggedElement);
  setDropPosition(ev, draggedElement, targetElem, isdef(draggedElement.dropPosition) ? draggedElement.dropPosition : dropPosition);
}
async function editDetailsFor(key, anchor) {
  let content = valf(lookup(M.details, [key]), {});
  console.log(content)
  let result = await mGather(anchor, {}, { content, type: 'multiText', title: M.superdi[key].friendly });
  if (!result) return;
  let res = await updateDetails(result, key);
}
function empty(arr) {
  let result = arr === undefined || !arr || (isString(arr) && (arr == 'undefined' || arr == '')) || (Array.isArray(arr) && arr.length == 0) || emptyDict(arr);
  testHelpers(typeof arr, result ? 'EMPTY' : arr);
  return result;
}
function emptyDict(obj) {
  let test = Object.entries(obj).length === 0 && obj.constructor === Object;
  return test;
}
function emptyTarget(val) {
  return Array.isArray(val) ? [] : {}
}
function enableAutoScrollOnDrag(draggableElement) {
  let scrollInterval;
  const scrollSpeed = 20;
  const edgeThreshold = 50;
  draggableElement.addEventListener('drag', (e) => {
    clearInterval(scrollInterval);
    const { clientY } = e;
    const { innerHeight } = window;
    if (clientY < edgeThreshold) {
      scrollInterval = setInterval(() => {
        window.scrollBy(0, -scrollSpeed);
      }, 50);
    } else if (clientY > innerHeight - edgeThreshold) {
      scrollInterval = setInterval(() => {
        window.scrollBy(0, scrollSpeed);
      }, 50);
    }
  });
  draggableElement.addEventListener('dragend', () => {
    clearInterval(scrollInterval);
  });
}
function enableButton(b) { mClassRemove(toElem(b), 'disabled') }
function enableDataDrop(elem, onDropCallback) {
  const originalBorderStyle = elem.style.border;
  elem.addEventListener('dragover', ev => { ev.preventDefault(); }); // Prevent default behavior for dragover and drop events to allow drop
  elem.addEventListener('dragenter', ev => {
    let els = ev.srcElement;
    if (isAncestorOf(els, elem)) return;
    elem.style.border = '2px solid red';
  });
  elem.addEventListener('drop', ev => {
    ev.preventDefault();
    elem.style.border = originalBorderStyle;
    if (VERBOSE) console.log('dropped onto', elem)
    if (VERBOSE) console.log(ev.target);
    if (VERBOSE) console.log(ev.dataTransfer.types);
  });
}
function enableImageDrop(element, onDropCallback) {
  const originalBorderStyle = element.style.border;
  element.addEventListener('dragover', function (event) {
    event.preventDefault();
  });
  element.addEventListener('dragenter', function (event) {
    element.style.border = '2px solid red';
  });
  element.addEventListener('drop', function (event) {
    event.preventDefault();
    element.style.border = originalBorderStyle;
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) { // Check if the dropped file is an image
        onDropCallback(file);
      }
    }
  });
  element.addEventListener('dragleave', function (event) {
    element.style.border = originalBorderStyle;
  });
}
async function encryptData(data) {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const publicKey = await crypto.subtle.importKey(
    'jwk',
    { kty: 'RSA', e: 'AQAB', n: 'your_public_key_here' },
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt']
  );
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    dataBuffer
  );
  return new Uint8Array(encryptedBuffer).toString();
}
function endsWith(s, sSub) { let i = s.indexOf(sSub); return i >= 0 && i == s.length - sSub.length; }
function ensureColorDict() {
  if (isdef(ColorDi)) return;
  ColorDi = {};
  let names = getColorNames();
  let hexes = getColorHexes();
  for (let i = 0; i < names.length; i++) {
    ColorDi[names[i].toLowerCase()] = { hex: '#' + hexes[i] };
  }
  const newcolors = {
    black: { hex: '#000000', D: 'schwarz' },
    blue: { hex: '#0000ff', D: 'blau' },
    BLUE: { hex: '#4363d8', E: 'blue', D: 'blau' },
    BLUEGREEN: { hex: '#004054', E: 'bluegreen', D: 'blaugrün' },
    BROWN: { hex: '#96613d', E: 'brown', D: 'braun' },
    deepyellow: { hex: '#ffed01', E: 'yellow', D: 'gelb' },
    FIREBRICK: { hex: '#800000', E: 'darkred', D: 'rotbraun' },
    gold: { hex: 'gold', D: 'golden' },
    green: { hex: 'green', D: 'grün' },
    GREEN: { hex: '#3cb44b', E: 'green', D: 'grün' },
    grey: { hex: 'grey', D: 'grau' },
    lightblue: { hex: 'lightblue', D: 'hellblau' },
    LIGHTBLUE: { hex: '#42d4f4', E: 'lightblue', D: 'hellblau' },
    lightgreen: { hex: 'lightgreen', D: 'hellgrün' },
    LIGHTGREEN: { hex: '#afff45', E: 'lightgreen', D: 'hellgrün' },
    lightyellow: { hex: '#fff620', E: 'lightyellow', D: 'gelb' },
    NEONORANGE: { hex: '#ff6700', E: 'neonorange', D: 'neonorange' },
    NEONYELLOW: { hex: '#efff04', E: 'neonyellow', D: 'neongelb' },
    olive: { hex: 'olive', D: 'oliv' },
    OLIVE: { hex: '#808000', E: 'olive', D: 'oliv' },
    orange: { hex: 'orange', D: 'orange' },
    ORANGE: { hex: '#f58231', E: 'orange', D: 'orange' },
    PINK: { hex: 'deeppink', D: 'rosa' },
    pink: { hex: 'pink', D: 'rosa' },
    purple: { hex: 'purple', D: 'lila' },
    PURPLE: { hex: '#911eb4', E: 'purple', D: 'lila' },
    red: { hex: 'red', D: 'rot' },
    RED: { hex: '#e6194B', E: 'red', D: 'rot' },
    skyblue: { hex: 'skyblue', D: 'himmelblau' },
    SKYBLUE: { hex: 'deepskyblue', D: 'himmelblau' },
    teal: { hex: '#469990', D: 'blaugrün' },
    TEAL: { hex: '#469990', E: 'teal', D: 'blaugrün' },
    transparent: { hex: '#00000000', E: 'transparent', D: 'transparent' },
    violet: { hex: 'violet', E: 'violet', D: 'violett' },
    VIOLET: { hex: 'indigo', E: 'violet', D: 'violett' },
    white: { hex: 'white', D: 'weiss' },
    yellow: { hex: 'yellow', D: 'gelb' },
    yelloworange: { hex: '#ffc300', E: 'yellow', D: 'gelb' },
    YELLOW: { hex: '#ffe119', E: 'yellow', D: 'gelb' },
  };
  for (const k in newcolors) {
    let cnew = newcolors[k];
    if (cnew.hex[0] != '#' && isdef(ColorDi[k])) cnew.hex = ColorDi[k].hex;
    ColorDi[k] = cnew;
  }
}
function ensureColorNames() {
  if (isdef(ColorNames)) return;
  ColorNames = {};
  let names = getColorNames();
  let hexes = getColorHexes();
  for (let i = 0; i < names.length; i++) {
    ColorNames[names[i].toLowerCase()] = '#' + hexes[i];
  }
}
function enterInterruptState() {
  clearTimeouts();
  if (isdef(G.instance)) G.instance.clear();
  auxOpen = true;
}
function error(msg) {
  let fname = getFunctionsNameThatCalledThisFunction();
  console.log(fname, 'ERROR!!!!! ', msg);
}
function evNoBubble(ev) { ev.preventDefault(); ev.stopPropagation(); }
function evToAttr(ev, attr) { let elem = findAncestorWithAttribute(ev.target, attr); return elem.getAttribute(attr); }
function evToAttrElem(ev, attr) { let elem = findAncestorWithAttribute(ev.target, attr); return { val: elem.getAttribute(attr), elem }; }
function evToClass(ev, className) { let elem = findAncestorWith(ev.target, { className }); return elem; }
function evToElem(ev, attr) { let elem = findAncestorWithAttribute(ev.target, attr); return elem; }
function evToId(ev) { let elem = findAncestorWithAttribute(ev.target, 'id'); return elem.id; }
function evalCond(o, condKey, condVal) {
  let func = FUNCTIONS[condKey];
  if (isString(func)) func = window[func];
  if (nundef(func)) {
    if (nundef(o[condKey])) return null;
    if (isList(condVal)) {
      for (const v of condVal) if (o[condKey] == v) return true;
      return null;
    } else {
      return isdef(o[condKey]) ? o[condKey] == condVal : null;
    }
  }
  return func(o, condVal);
}
function evalConds(o, conds) {
  for (const [f, v] of Object.entries(conds)) {
    if (!evalCond(o, f, v)) return false;
  }
  return true;
}
function exampleFields0(tiles, sz) {
  for (const id in tiles) {
    let t = tiles[id];
    let d = iDiv(t);
    mCenterCenterFlex(d);
    msKey(rChoose(Object.keys(M.superdi)), d, { hmax: sz, fz: sz, fg: rColor() })
    d.addEventListener('mouseenter', () => {
      for (const dir of ['NE', 'E', 'SE', 'SW', 'W', 'NW']) {
        const neighbor = tiles[t[dir]]; console.log(neighbor)
        if (neighbor) neighbor.div.classList.add('neighbor-highlight');
      }
    });
    d.addEventListener('mouseleave', () => {
      for (const dir of ['NE', 'E', 'SE', 'SW', 'W', 'NW']) {
        const neighbor = tiles[t[dir]];
        if (neighbor) neighbor.div.classList.remove('neighbor-highlight');
      }
    });
  }
}
function exitToAddon(callback) {
  AD.callback = callback;
  enterInterruptState(); auxOpen = false;
  AD.run();
}
function extendRect(r4) { r4.l = r4.x; r4.t = r4.y; r4.r = r4.x + r4.w; r4.b = r4.t + r4.h; }
function extractColors(s, colors) {
  let words = toWords(s);
  words = words.map(x => strRemoveTrailing(x, 'ish')).map(x => x.toLowerCase());
  if (nundef(colors)) colors = Object.keys(M.colorByName);
  let res = [];
  for (const w of words) {
    for (const c of colors) {
      if (w == c) res.push(c);
    }
  }
  return res;
}
function extractFilesFromHtml(html, htmlfile, ext = 'js') {
  let prefix = ext == 'js' ? 'script src="' : 'link rel="stylesheet" href="';
  let dirhtml = stringBeforeLast(htmlfile, '/');
  let project = stringAfter(dirhtml, '/'); if (project.includes('/')) project = stringBefore(project, '/');
  let parts = html.split(prefix);
  parts.shift();
  let files = parts.map(x => stringBefore(x, '"'));
  files = files.filter(x => !x.includes('alibs/') && !x.includes('assets/'));
  let files2 = [];
  for (const f of files) {
    if (f.startsWith(dirhtml)) { files2.push(f); continue; }
    if (f.startsWith('./')) { files2.push(dirhtml + f.substring(1)); continue; }
    if (f.startsWith('../') && stringCount(dirhtml, '../') == 1) {
      files2.push(f); continue;
    }
    if (!f.includes('/')) { files2.push(dirhtml + '/' + f); continue; }
    if (isLetter(f[0])) { files2.push(dirhtml + '/' + f); continue; }
    console.log('PROBLEM!', f)
  }
  files = files2;
  return files;
}
function extractFoodAndType(s) {
  let carni = ['mouse', 'bird', 'fish', 'beetle', 'spider', 'animal', 'frog', 'lizard', 'worm', 'deer', 'zebra', 'shrimp', 'squid', 'snail'];
  let insecti = ['worm', 'ant', 'insect', 'moth', 'flies', 'grasshopper',]
  let herbi = ['grass', 'grasses', 'leaves', 'fruit', 'flowers', 'grain', 'berries', 'plant', 'bamboo', 'tree', 'wood', 'reed', 'twig', 'crops', 'herbs'];
  s = s.toLowerCase();
  let words = toWords(s, true).map(x => strRemoveTrailing(x, 's'));
  let di = { herbi, carni, insecti };
  let types = [];
  let contained = [];
  for (const type in di) {
    let arr = di[type];
    for (const a of arr) {
      let w = strRemoveTrailing(a, 's');
      if (words.includes(w)) {
        addIf(contained, a);
        addIf(types, type);
        continue;
      }
    }
  }
  let type;
  for (const t of ['omni', 'herbi', 'carni', 'insecti']) {
    if (s.includes(t)) type = t + 'vorous';
  }
  if (nundef(type)) {
    if (isEmpty(types)) { type = 'unknown' }
    if (types.includes('herbi') && types.length >= 2) type = 'omnivorous';
    else if (types.length >= 2) type = 'carnivorous';
    else type = types[0] + 'vorous';
  }
  return [contained, type];
}
function extractFoodType(s, easy = true, key = null) {
  s = s.toLowerCase();
  let words = toWords(s, true).map(x => strRemoveTrailing(x, 's'));
  if (easy) {
    for (const t of ['omni', 'herbi', 'carni', 'insecti']) {
      if (s.includes(t)) return t + 'vorous';
    }
  }
  let herbi = M.byCat.plant; herbi = herbi.concat(['plant', 'berries', 'grasses', 'leave', 'tree', 'twig', 'fruit', 'grass', 'grain']);
  let carni = M.byCat.animal; carni = carni.concat(['animal'])
  let insecti = ['insect', 'worm', 'ant', 'fly', 'flies']
  let di = { herbi, carni, insecti };
  let types = [];
  let contained = [];
  for (const type in di) {
    let arr = di[type];
    for (const a of arr) {
      let w = strRemoveTrailing(a, 's'); //console.log('w',w)
      let o = M.superdi[a];
      if (isdef(o) && words.includes(o.friendly) || words.includes(w)) {
        let cont = {};
        if (o) { cont.key = a; cont.cats = o.cats; cont.friendly = o.friendly }
        else cont.key = w;
        addIf(contained, cont);
        addIf(types, type);
        continue;
      }
    }
  }
  if (isEmpty(types)) { return 'unknown' }
  if (types.includes('herbi') && types.length >= 2) return 'omnivorous';
  else if (types.length >= 2) return 'carnivorous';
  else return types[0] + 'vorous';
}
function extractFoods(s) {
  s = s.toLowerCase();
  let words = toWords(s, true).map(x => strRemoveTrailing(x, 's'));
  let herbi = M.byCat.plant; herbi = herbi.concat(['plant', 'berries', 'grasses', 'leave', 'tree', 'twig', 'fruit', 'grass', 'grain']);
  let carni = M.byCat.animal; carni = carni.concat(['animal'])
  let insecti = ['insect', 'worm', 'ant', 'fly', 'flies']
  let di = { herbi, carni, insecti };
  let types = [];
  let contained = [];
  for (const type in di) {
    let arr = di[type];
    for (const a of arr) {
      let w = strRemoveTrailing(a, 's'); //console.log('w',w)
      let o = M.superdi[a];
      if (isdef(o) && words.includes(o.friendly) || words.includes(w)) {
        let cont = {};
        if (o) { cont.key = a; cont.cats = o.cats; cont.friendly = o.friendly }
        else cont.key = w;
        addIf(contained, cont);
        addIf(types, type);
        continue;
      }
    }
  }
  return [contained, types];
}
function extractHabitat(str, ignore = []) {
  let s = str.toLowerCase();
  let habit = [];
  let di = M.habitat;
  for (const k in di) {
    if (k == 'geo') continue;
    for (const hab of di[k]) {
      if (ignore.includes(hab)) continue;
      if (s.includes(hab)) { addIf(habit, k); break; }
    }
  }
  return habit;
}
function extractLines(text, list, reverse = false) {
  let arr = text.split('\n').filter(line => list.some(prefix => line.startsWith(prefix))); // Keep lines starting with any prefix
  if (reverse) arr.reverse();
  return arr.join('\n');
}
function extractSpecies(s) {
  s = s.toLowerCase();
  let words = toWords(s);
  if (words.length <= 2) { s = s.replace('suborder', ''); s = s.replace('genus', ''); return s.trim(); }
  s = s.replace(' x ', ', ');
  if (s.includes('hybrid')) return s;
  if (s.includes('including')) return arrTake(toWords(stringAfter(s, 'including')), 2).join(' ');
  if (s.includes('suborder')) return wordAfter(s, 'suborder');
  let firstTwo = arrTake(words, 2).join(' '); //console.log(slower);
  return firstTwo;
}
function extractSymbols(svgString, symbolDict) {
  const symbolRegex = /<symbol id='([^']+)'[^>]*>[\s\S]*?<\/symbol>/g;
  let match;
  while ((match = symbolRegex.exec(svgString)) !== null) {
    const id = match[1];
    const fullSymbol = match[0];
    symbolDict[id] = fullSymbol;
  }
}
function extractTime(input) {
  const regex = /\b([0-9]|1[0-9]|2[0-3])[h:]*\S*\b/g;
  const match = input.match(regex);
  if (match) {
    let time = match[0];
    let text = input.replace(time, '').trim();
    return [time, text];
  } else {
    return ['', input];
  }
}
function extractWords(s, allowed) {
  let specialChars = getSeparators(allowed);
  let parts = splitAtAnyOf(s, specialChars.join('')).map(x => x.trim());
  return parts.filter(x => !isEmpty(x));
}
function faButton(dParent, key, styles = {}, opts = {}) {
  let o = lookup(M.superdi, [key]);
  if (!isdef(o)) {
    console.warn(`no superdi entry for key ${key}`);
    return;
  }
  let html = `<div class='keyButton'><div class='keyinner'>&#x${o.fa6};</div></div>`;
  let d = mDom(dParent, styles, { html, ...opts });
  mClass(d, 'keyButton');
  mClass(d.firstChild, 'keyinner');
  d.onclick = ev => {
    evNoBubble(ev);
    if (isdef(opts.onclick)) opts.onclick(ev);
  }
  mStyle(d, { cursor: 'pointer', display: 'flex', placeContent: 'center' });
  mStyle(d.firstChild, { fontSize: '24px', lineHeight: '24px', fontFamily: 'fa6', background: 'rgba(0,0,0,0)', color: 'lightgray' });
  return d;
}
function fetchGameState() {
  const gameId = document.getElementById("stateGameId").value;
  getGameState(gameId);
}
function fetchGamesList() {
  console.log("Fetching games list");
  DA.socket.emit("games_list");
}
function fillFormFromObject(inputs, wIdeal, df, db, styles, opts) {
  let popup = mDom(df, { margin: 10 });
  mDom(popup, {}, { html: 'paste your information into the text area' })
  let ta = mDom(popup, {}, { tag: 'textarea', rows: 20, cols: 80 });
  let b = mButton('Parse To Form', () => { onclickPasteDetailObject(ta.value, inputs, wIdeal, df, styles, opts); }, db, { maright: 10 }, 'button', 'bParseIntoForm');
  mInsert(db, b);
}
function fillMultiForm(dict, inputs, wIdeal, df, styles, opts) {
  mClear(df);
  for (const k in dict) {
    let [content, val] = [k, dict[k]]; console.log(content, val)
    mDom(df, {}, { html: `${content}:` });
    let inp = mDom(df, styles, opts);
    inp.rows = calcRows(styles.fz, styles.family, val, wIdeal);
    inp.value = val;
    inputs.push({ name: content, inp: inp });
    mNewline(df)
  }
}
function filterIsolatedPairs(pairs, blockers, threshold = 10) {
  let newPairs = [];
  for (const pair of pairs) {
    const [ax, ay] = [pair[0].x, pair[0].y];
    const [bx, by] = [pair[1].x, pair[1].y];
    let isIsolated = true;
    for (const blocker of blockers) {
      const [px, py] = [blocker.x, blocker.y];
      const distance = pointToLineDistance(px, py, ax, ay, bx, by);
      if (distance < threshold) {
        isIsolated = false;
        break;
      }
    }
    if (isIsolated) {
      newPairs.push(pair);
    }
  }
  return newPairs;
}
function filterKeys(collection, cat, func) {
  let keys = isdef(collection) ? M.byCollection[collection] : M.names;
  if (isdef(cat)) {
    let catKeys = M.byCat[cat];
    keys = keys.filter(x => catKeys.includes(x));
  }
  if (isdef(func)) keys = keys.filter(x => func(M.superdi[x]));
  return keys;
}
function findAllFoodTypes() {
  let res = [];
  for (const k in M.details) {
    let o = M.details[k];
    let food = o.food.toLowerCase();
    let type = null;
    for (const t of ['omni', 'herbi', 'carni', 'insecti']) {
      if (food.includes(t)) type = t;
    }
    if (!type) type = food;
    addIf(res, type);
  }
  return res;
}
function findAncestorWith(elem, { attribute = null, className = null, id = null }) {
  elem = toElem(elem);
  while (elem) {
    if ((attribute && elem.hasAttribute && elem.hasAttribute(attribute))
      || (className && elem.classList && elem.classList.contains(className))
      || (id && isdef(elem.id))) { return elem; }
    elem = elem.parentNode;
  }
  return null;
}
function findAncestorWithAttribute(el, attrName) {
  while (el) {
    if (el.hasAttribute && el.hasAttribute(attrName)) return el;
    el = el.parentElement;
  }
  return null;
}
function findAttributeInAncestors(elem, attr) {
  let val;
  while (elem && nundef(val = elem.getAttribute(attr))) { elem = elem.parentNode; }
  return val;
}
function findBottomLine(ct, w, h, cgoal) {
  let [_, restlist] = findPointsBoth(ct, 0, w, h - 30, h, cgoal, 20);
  let o = nextLine(ct, restlist, 'green');
  return o.val;
}
function findClosePairs(points, x, y, threshold = 3) {
  function _pointLineDistance(px, py, ax, ay, bx, by) {
    const A = px - ax;
    const B = py - ay;
    const C = bx - ax;
    const D = by - ay;
    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = (len_sq !== 0) ? dot / len_sq : -1;
    let xx, yy;
    if (param < 0) {
      xx = ax;
      yy = ay;
    } else if (param > 1) {
      xx = bx;
      yy = by;
    } else {
      xx = ax + param * C;
      yy = ay + param * D;
    }
    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }
  const closePairs = [];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const [ax, ay] = [points[i].x, points[i].y];
      const [bx, by] = [points[j].x, points[j].y];
      const distance = pointLineDistance(x, y, ax, ay, bx, by);
      if (distance < threshold) {
        closePairs.push([points[i], points[j]]);
      }
    }
  }
  return closePairs;
}
function findClosestMeeple(p) {
  let fen = T.fen;
  let dist = 9999999;
  let closestMeeple = null;
  for (const meeple of fen.meeples) {
    let d = getDistanceBetweenCenters(mBy(p.id), mBy(meeple.id));
    if (d < dist) {
      dist = d;
      closestMeeple = meeple;
    }
  }
  return closestMeeple;
}
function findColor(colorhex) {
  let x, y;
  colormap = document.getElementById("colormap");
  areas = colormap.getElementsByTagName("area");
  for (i = 0; i < areas.length; i++) {
    areacolor = areas[i].getAttribute("onmouseover").replace('mouseOverColor("', '');
    areacolor = areacolor.replace('")', '');
    if (areacolor.toLowerCase() == colorhex) {
      cc = areas[i].getAttribute("onclick").replace(')', '').split(",");
      y = Number(cc[1]);
      x = Number(cc[2]);
    }
  }
  return [x, y];
}
function findDarkBars(ctx, w, h, cgoal, diffleft, diffright) {
  let [restlist, _] = findPoints(ctx, 0, w, 0, h, cgoal, 20);
  let num = 201;
  let colors = ['yellow', 'orange', 'red', 'pink', 'violet', 'blue', 'teal', 'green', 'sienna', 'grey', 'black'], i = 0;
  let res = [];
  while (num > 100 && i < colors.length) {
    let color = colors[i++];
    let o = nextBar(ctx, restlist, color);
    restlist = o.rest;
    num = o.line.length;
    res.push(o)
  }
  console.log('result', res);
  let diff = 243;
  let cand = res.filter(o => o.val >= 40 && o.val <= 500);
  let [kleinere, groessere] = findMidlines(cand, diff);
  let topmost, bottommost;
  for (const l3 of res) {
    let distleft = kleinere.val - l3.val;
    let distright = l3.val - groessere.val;
    if (isWithinDelta(distleft, diffleft, 2)) {
      topmost = l3;
    }
    if (isWithinDelta(distright, diffright, 2)) {
      bottommost = l3;
    }
  }
  let [ytop, ybottom] = [nundef(topmost) ? 0 : topmost.val, nundef(bottommost) ? w : bottommost.val]
  return [ytop, kleinere.val, groessere.val, ybottom, topmost, kleinere, groessere, bottommost];
}
function findDarkLines(ctx, w, h, cgoal) {
  let [_, restlist] = findPoints(ctx, 0, w, 0, h, cgoal, 20);
  let y, num = 201;
  let colors = ['yellow', 'orange', 'red', 'pink', 'violet', 'blue', 'crimson', 'seagreen', 'skyblue', 'teal', 'green', 'sienna', 'grey', 'black'], i = 0;
  let res = [];
  while (i < colors.length) {
    let color = colors[i++];
    let o = nextLine(ctx, restlist, color);
    if (!o.line) { console.log('o', o); break; }
    restlist = o.rest;
    num = o.line.length;
    if (num > 112) res.push(o)
  }
  console.log('result', res);
  let diff = 261, diff2 = 22;
  let [kleinere, groessere] = findMidlines(res, diff);
  let topmost, bottommost;
  for (const l3 of res) {
    if (isWithinDelta(kleinere.val - l3.val, diff2, 2)) {
      topmost = l3;
    }
    if (isWithinDelta(l3.val - groessere.val, diff2, 2)) {
      bottommost = l3;
    }
  }
  let [ytop, ybottom] = [nundef(topmost) ? 0 : topmost.val, nundef(bottommost) ? h : bottommost.val]
  return [ytop, kleinere.val, groessere.val, ybottom, topmost, kleinere, groessere, bottommost];
}
function findDragTarget(ev) {
  let targetElem = ev.target;
  while (!targetElem.ondragover) targetElem = targetElem.parentNode;
  return targetElem;
}
function findEdgeHor(ctx, x1, x2, h, cgoal, lighting = true) {
  let [list, _] = findPoints(ctx, x1, x2, 0, h, cgoal, 20);
  if (lighting) list = list.filter(o => isLightAfter(ctx, o.x, o.y) && isLightBefore(ctx, o.x, o.y));
  let vfreq = findMostFrequentVal(list, 'x');
  return list.filter(o => o.x == vfreq);
}
function findEdgeVert(ctx, y1, y2, w, cgoal, lighting = true) {
  let [_, list] = findPoints(ctx, 0, w, y1, y2, cgoal, 20);
  let vfreq = findMostFrequentVal(list, 'y');
  return list.filter(o => o.y == vfreq);
}
function findEdgesApart(list, dx, dy, prop) {
  list.map(o => o.nei = findPointAtDistance(o, dx, dy, list, 10))
  list = list.filter(o => o.nei)
  let vfreq = findMostFrequentVal(list, prop); console.log(prop, vfreq)
  let good = list.filter(o => isWithinDelta(o[prop], vfreq, 3));
  let rest = list.filter(o => !isWithinDelta(o[prop], vfreq, 3));
  vfreq = findMostFrequentVal(rest, prop); console.log(prop, vfreq)
  let good2 = list.filter(o => o[prop] == vfreq);
  list = good.concat(good2);
  return list;
}
function findElementBy(value, key = 'html') {
  const all = document.querySelectorAll('*');
  for (const el of all) {
    if (el[key] === value) return el;
    if (el.hasAttribute(key) && el.getAttribute(key) === value) return el;
    let di = { html: 'innerHTML', text: 'textContent', caption: 'innerHTML' };
    key = valf(di[key], key);
    if ((key === 'innerHTML' || key === 'textContent') && el[key] === value) return el;
  }
  return null;
}
function findIsolatedPairs(nodes, prop = 'bg', threshold = 3) {
  const isolatedPairs = [], obstaclePairs = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (nodes[i][prop] != nodes[j][prop]) continue;
      const [ax, ay] = [nodes[i].x, nodes[i].y];
      const [bx, by] = [nodes[j].x, nodes[j].y];
      let isIsolated = true;
      for (let k = 0; k < nodes.length; k++) {
        if (k === i || k === j) continue;
        const [px, py] = [nodes[k].x, nodes[k].y];
        const distance = pointToLineDistance(px, py, ax, ay, bx, by);
        if (distance < threshold) {
          isIsolated = false;
          break;
        }
      }
      let pair = nodes[i].x <= nodes[j].x ? [nodes[i], nodes[j]] : [nodes[j], nodes[i]]; //console.log(pair[0].x,pair[1].x);
      assertion(pair[0].x <= pair[1].x, "NOT SORTED!!!!!!!!!!!!!!!!");
      if (isIsolated) {
        isolatedPairs.push(pair);
      } else {
        obstaclePairs.push(pair);
      }
    }
  }
  return { isolatedPairs, obstaclePairs };
}
function findLeftLine(ct, w, h, cgoal, xStart = 0) {
  let [restlist, _] = findPointsBoth(ct, xStart, xStart + 40, 0, h, cgoal, 20);
  let o = nextBar(ct, restlist, 'red');
  return o.val;
}
function findMidlines(res, diff) {
  let mid1, mid2;
  for (const l1 of res) {
    for (const l2 of res) {
      if (isWithinDelta(Math.abs(l1.val - l2.val), diff, 2)) {
        mid1 = l1; mid2 = l2;
      }
    }
    if (isdef(mid1)) break;
  }
  let kleinere = mid1.val < mid2.val ? mid1 : mid2;
  let groessere = mid1 == kleinere ? mid2 : mid1;
  return [kleinere, groessere];
}
function findMostFrequentVal(arr, prop, delta = 0) {
  if (!Array.isArray(arr) || arr.length === 0) {
    return null;
  }
  let frequencyMap = new Map();
  for (let i = 0; i < arr.length; i++) {
    const val = arr[i][prop];
    frequencyMap.set(val, (frequencyMap.get(val) || 0) + 1);
  }
  let mostFrequentY;
  let maxFrequency = 0;
  for (let [val, frequency] of frequencyMap) {
    if (frequency > maxFrequency) {
      mostFrequentY = val;
      maxFrequency = frequency;
    }
  }
  return mostFrequentY;
}
function findNextBar(ctx, x1, x2, y1, y2, cgoal, delta = 10) {
  for (let x = x1; x < x2; x++) {
    for (let y = y1; y < y2; y++) {
      let c = isPix(ctx, x, y, cgoal, delta);
      if (c) {
        drawPixFrame(ctx, x - 1, y - 1, 'red', 3)
        let len = 1, yy = y + 1; xx = x;
        while (yy < y2) {
          let p = getPixRgb(ctx, xx, yy);
          let c1 = isPix(ctx, xx, yy, cgoal, delta + 10);
          yy++;
          if (c1) len++;
        }
        return { c, x, y, len };
      }
    }
  }
}
function findNextLine(ctx, x1, x2, y1, y2, cgoal, delta = 10) {
  for (let y = y1; y < y2; y++) {
    for (let x = x1; x < x2; x++) {
      let c = isPix(ctx, x, y, cgoal, delta);
      if (c) {
        drawPixFrame(ctx, x - 1, y - 1, 'red', 3)
        let len = 1, xx = x + 1; yy = y;
        while (xx < x2) {
          let p = getPixRgb(ctx, xx, yy);
          let c1 = isPix(ctx, xx, yy, cgoal, delta + 10);
          xx++;
          if (c1) len++;
        }
        return { c, x, y, len };
      }
    }
  }
}
function findPairsByProp(objects, prop) {
  const pairs = [];
  const groupedByProp = {};
  objects.forEach(obj => {
    const key = obj[prop];
    if (!groupedByProp[key]) {
      groupedByProp[key] = [];
    }
    groupedByProp[key].push(obj);
  });
  Object.values(groupedByProp).forEach(group => {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        pairs.push([group[i], group[j]]);
      }
    }
  });
  return pairs;
}
function findParentWithClass(elem, className) { while (elem && !mHasClass(elem, className)) { elem = elem.parentNode; } return elem; }
function findParentWithId(elem) { while (elem && !(elem.id)) { elem = elem.parentNode; } return elem; }
function findPlayerWithMeeplesLeft(name) {
  let pnamesWithMeeplesLeft = [];
  for (const pname of T.playerNames) {
    let meeplesOfThatPlayer = T.fen.meeples.filter(x => x.owner == pname);
    if (meeplesOfThatPlayer.length < T.options.numMeeples) pnamesWithMeeplesLeft.push(pname);
  }
  if (pnamesWithMeeplesLeft.length == 0) return null;
  let nextPlayer = null;
  while (!nextPlayer) {
    nextPlayer = arrNext(T.plorder, name);
    if (!pnamesWithMeeplesLeft.includes(nextPlayer)) { name = nextPlayer; nextPlayer = null; }
  }
  return nextPlayer;
}
function findPointAtDistance(pt, dx, dy, list, delta = 0) {
  for (const p1 of list) {
    if (isWithinDelta(Math.abs(pt.x - p1.x), dx, delta) && isWithinDelta(Math.abs(pt.y - p1.y), dy, delta)) return p1;
  }
  return null;
}
function findPoints(ctx, x1, x2, y1, y2, cgoal, delta = 10) {
  let p;
  let resy = [], resx = [];
  for (let y = y1; y < y2; y++) {
    for (let x = x1; x < x2; x++) {
      p = isPixDark(ctx, x, y);
      if (p) {
        let l = isLightBeforeV(ctx, x, y);
        let d = isLightAfterV(ctx, x, y);
        if (l || d) resy.push({ x, y })
        l = isLightBefore(ctx, x, y);
        d = isLightAfter(ctx, x, y);
        if (l || d) resx.push({ x, y })
      }
    }
  }
  return [resx, resy];
}
function findPointsBoth(ctx, x1, x2, y1, y2, cgoal, delta = 10) {
  let p;
  let resy = [], resx = [];
  for (let y = y1; y < y2; y++) {
    for (let x = x1; x < x2; x++) {
      p = isPix(ctx, x, y, cgoal, delta);
      if (p) {
        let l = isLightBeforeV(ctx, x, y);
        let d = isLightAfterV(ctx, x, y);
        if (l && d) resy.push({ x, y })
        l = isLightBefore(ctx, x, y);
        d = isLightAfter(ctx, x, y);
        if (l && d) resx.push({ x, y })
      }
    }
  }
  return [resx, resy];
}
function findRectSample(ctx, x1, x2, y1, y2, cgoal, sz = 4, lightCounts = false) {
  let p;
  for (let yStart = y1; yStart <= y2; yStart += sz) {
    for (let xStart = x1; xStart <= x2; xStart += sz) {
      let found = true;
      for (let x = xStart; x < xStart + sz; x++) {
        for (let y = yStart; y < yStart + sz; y++) {
          p = isPix(ctx, x, y, cgoal, 20);
          if (lightCounts && isPix(ctx, x, y, 'white', 10)) p = true;
          if (!p) { found = false; break; }
        }
        if (!found) break;
      }
      if (found) return true;
    }
  }
  return false;
}
function findRightLine(ct, w, h, cgoal) {
  let [restlist, _] = findPointsBoth(ct, w - 40, w, 0, h, cgoal, 20);
  let o = nextBar(ct, restlist, 'orange');
  return o.val;
}
function findSym(s) {
  s = normalizeString(s);
  let o = M.superdi[s]; if (isdef(o)) return o;
  let list = M.byFriendly[s]; if (isdef(list)) return rChoose(list);
  for (const k in M.superdi) {
    if (k.includes(s)) return M.superdi[k];
  }
  for (const k in M.names) {
    if (k.includes(s)) { list = M.byFriendly[k]; return rChoose(list); }
  }
  for (const k in M.categories) {
    if (k.includes(s)) { list = M.byCat[k]; return rChoose(list); }
  }
  return null;
}
function findTopLine(ct, w, h, cgoal) {
  let [_, restlist] = findPointsBoth(ct, 0, w, 0, 40, cgoal, 20);
  let o = nextLine(ct, restlist, 'blue');
  return o.val;
}
function findUniqueSuperdiKey(friendly) {
  console.log('friendly', friendly)
  let name = friendly;
  let i = 1;
  let imgname = null;
  while (true) {
    let o = M.superdi[name];
    if (nundef(o)) { break; }
    console.log(o.colls.includes('emo'))
    if (isdef(o.img) && isdef(o.photo) || ['emo', 'fa6', 'icon'].every(x => !o.colls.includes(x))) { name = friendly + (i++); continue; }
    else if (isdef(o.img)) { imgname = 'photo'; break; }
    else { imgname = 'img'; break; }
  }
  return [name, imgname];
}
function first(arr) {
  return arr.length > 0 ? arr[0] : null;
}
function firstCond(aos, func) {
  if (nundef(aos)) return null;
  else if (isDict(aos)) for (const k in aos) { if (func(k) || func(aos[k])) return k; }
  else for (const a of aos) { if (func(a)) return a; }
  return null;
}
function firstCondDictKeys(dict, func) {
  for (const k in dict) { if (func(k)) return k; }
  return null;
}
function firstNCond(n, arr, func) {
  if (nundef(arr)) return [];
  let result = [];
  let cnt = 0;
  for (const a of arr) {
    cnt += 1; if (cnt > n) break;
    if (func(a)) result.push(a);
  }
  return result;
}
function firstNumber(s) {
  if (s) {
    let m = s.match(/-?\d+/);
    if (m) {
      let sh = m.shift();
      if (sh) { return Number(sh); }
    }
  }
  return null;
}
function firstVisibleChild(div) {
  if (!div || !div.children) return null;
  for (const child of div.children) {
    const style = window.getComputedStyle(child);
    if (style.display !== 'none') {
      return child;
    }
  }
  return null;
}
function fisherYates(arr) {
  if (arr.length == 2 && coin()) { return arr; }
  var rnd, temp;
  let last = arr[0];
  for (var i = arr.length - 1; i; i--) {
    rnd = Math.random() * i | 0;
    temp = arr[i];
    arr[i] = arr[rnd];
    arr[rnd] = temp;
  }
  return arr;
}
function fitFzToBox(div, maxWidth, maxHeight, options = {}) {
  const {
    minFontSize = 10,
    maxFontSize = 100,
    fontStep = 1,
    lineHeight = 1
  } = options;
  const style = window.getComputedStyle(div);
  const originalText = div.textContent;
  const testDiv = document.createElement("div");
  document.body.appendChild(testDiv);
  testDiv.style.position = "absolute";
  testDiv.style.visibility = "hidden";
  testDiv.style.whiteSpace = "pre-wrap";
  testDiv.style.wordBreak = "break-word";
  const keysToCopy = ["fontFamily", "fontWeight", "fontStyle", "letterSpacing", "padding", "border"];
  keysToCopy.forEach(key => {
    testDiv.style[key] = style[key];
  });
  let fontSize = maxFontSize;
  testDiv.textContent = originalText;
  while (fontSize >= minFontSize) {
    testDiv.style.fontSize = `${fontSize}px`;
    testDiv.style.lineHeight = lineHeight;
    if (
      testDiv.offsetWidth <= maxWidth &&
      testDiv.offsetHeight <= maxHeight
    ) {
      break;
    }
    fontSize -= fontStep;
  }
  div.style.fontSize = `${fontSize}px`;
  div.style.lineHeight = lineHeight;
  document.body.removeChild(testDiv);
  return fontSize;
}
function fitTextToBox(text, family, maxWidth, maxHeight, options = {}) {
  const {
    minFontSize = 10,
    maxFontSize = 100,
    fontStep = 1,
    lineHeight = 1.2,
    weight = "normal",
    fontStyle = "normal",
    letterSpacing = "normal",
    padding = "0"
  } = options;
  const testDiv = mDom(document.body, {}, { tag: 'div', html: text });
  mStyle(testDiv, {
    position: 'absolute',
    visibility: 'hidden',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    padding,
    family,
    weight,
    fontStyle,
    letterSpacing
  });
  let fz = maxFontSize;
  while (fz >= minFontSize) {
    mStyle(testDiv, { fz, lineHeight });
    if (testDiv.offsetWidth <= maxWidth && testDiv.offsetHeight <= maxHeight) break;
    fz -= fontStep;
  }
  testDiv.remove();
  return fz;
}
function fleetingMessage(msg, d, styles, ms, fade) {
  if (isString(msg)) {
    dFleetingMessage.innerHTML = msg;
    mStyle(dFleetingMessage, styles);
  } else {
    mAppend(dFleetingMessage, msg);
  }
  if (fade) Animation1 = mAnimate(dFleetingMessage, 'opacity', [1, .4, 0], null, ms, 'ease-in', 0, 'both');
  return dFleetingMessage;
}
function flexCenterCenter() { return { display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' } }
function flexCenterTop() { return { display: 'flex', alignItems: 'flex-start', justifyContent: 'center', flexWrap: 'wrap' } }
function flexLeftCenter() { return { display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'wrap' } }
function flexLeftTop() { return { display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', flexWrap: 'wrap' } }
function foldCartesianProduct(keys, valuesLists) {
  const result = [];
  function helper(index, current) {
    if (index === keys.length) {
      result.push(Object.fromEntries(keys.map((k, i) => [k, current[i]])));
      return;
    }
    for (const value of valuesLists[index]) {
      helper(index + 1, [...current, value]);
    }
  }
  helper(0, []);
  return result;
}
function formatDate(d) {
  const date = isdef(d) ? d : new Date();
  const month = ('0' + date.getMonth()).slice(0, 2);
  const day = date.getDate();
  const year = date.getFullYear();
  const dateString = `${month}/${day}/${year}`;
  return dateString;
}
function formatDate1(d) {
  if (nundef(d)) d = Date.now();
  let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
  let mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
  let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
  return `${da}-${mo}-${ye}`;
}
function formatDate2(d) { if (nundef(d)) d = new Date(); return d.toISOString().slice(0, 19).replace("T", " "); }
function formatDate3(d) { if (nundef(d)) d = new Date(); return d.toISOString().slice(0, 19).replace(/-/g, "/").replace("T", " "); }
function formatDateCompact(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  const yy = pad(date.getFullYear() % 100);
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${yy}${mm}${dd}_${hh}${mi}${ss}`;
}
function formatDatetime(date = new Date()) {
  const formatted = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  }).format(date);
  console.log(formatted);
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };
  return date.toLocaleString('en-US', options).replace(/,/g, '');
}
function formatLegend(key) {
  return key.includes('per') ? stringBefore(key, '_') + '/' + stringAfterLast(key, '_')
    : key.includes('_') ? replaceAll(key, '_', ' ') : key;
}
function formatNow() { return new Date().toISOString().slice(0, 19).replace("T", " "); }
function from01ToPercent(x) { return Math.round(Number(x) * 100); }
function fromNormalized(s, opts = {}) {
  let sep = valf(opts.sep, '_');
  let caps = isdef(opts.caps) ? opts.caps : true;
  let x = replaceAll(s, sep, ' ');
  let words = caps ? toWords(x).map(x => capitalize(x)).join(' ') : toWords(x).join(' ');
  return words;
}
function fromPercent(n, total) { return Math.round(n * total / 100); }
function fromPercentTo01(x, nDecimals = 2) { return Number((Number(x) / 100).toFixed(nDecimals)); }
function gBg(g, color) { g.setAttribute('fill', color); }
function gCanvas(area, w, h, color, originInCenter = true) {
  let dParent = mBy(area);
  let div = stage3_prepContainer(dParent);
  div.style.width = w + 'px';
  div.style.height = h + 'px';
  let svg = gSvg();
  let style = `margin:0;padding:0;position:absolute;top:0px;left:0px;width:100%;height:100%;`
  svg.setAttribute('style', style);
  mColor(svg, color);
  div.appendChild(svg);
  let g = gG();
  if (originInCenter) g.style.transform = "translate(50%, 50%)";
  svg.appendChild(g);
  return g;
}
function gCreate(tag) { return document.createElementNS('http:/' + '/www.w3.org/2000/svg', tag); }
function gEllipse(w, h) { let r = gCreate('ellipse'); r.setAttribute('rx', w / 2); r.setAttribute('ry', h / 2); return r; }
function gFg(g, color, thickness) { g.setAttribute('stroke', color); if (thickness) g.setAttribute('stroke-width', thickness); }
function gHex(w, h) { let pts = size2hex(w, h); return gPoly(pts); }
function gHighlight(poly, color = 'neon_yellow', mem = true) {
  if (mem) {
    let orig = mGetAttr(poly, 'orig');
    if (nundef(orig)) mSetAttr(poly, 'orig', mGetAttr(poly, 'fill'));
  }
  mSetAttr(poly, 'fill', colorFrom(color));
}
function gLine(x1, y1, x2, y2) { let r = gCreate('line'); r.setAttribute('x1', x1); r.setAttribute('y1', y1); r.setAttribute('x2', x2); r.setAttribute('y2', y2); return r; }
function gPoly(pts) { let r = gCreate('polygon'); if (pts) r.setAttribute('points', pts); return r; }
function gPos(g, x, y) { g.style.transform = `translate(${x}px, ${y}px)`; }
function gRect(w, h) { let r = gCreate('rect'); r.setAttribute('width', w); r.setAttribute('height', h); r.setAttribute('x', -w / 2); r.setAttribute('y', -h / 2); return r; }
function gRounding(r, rounding) {
  r.setAttribute('rx', rounding);
  r.setAttribute('ry', rounding);
}
function gSet() {
  function set_fen() {
    let items = Session.items;
    let fen = items.map(x => x.fen).join(',');
    return fen;
  }
  function set_prompt(g, fen) {
    let [n, rows, cols] = [g.num_attrs, g.rows, g.cols];
    let all_attrs = gSet_attributes();
    let attrs_in_play = arrTake(get_keys(all_attrs), n);
    let deck = g.deck = make_set_deck(n);
    shuffle(deck);
    let goal = Goal = { set: make_goal_set(deck, g.prob_different), cards: [] };
    let dCards = stdRowsColsContainer(dTable, cols, styles = { bg: 'transparent' });
    let card_styles = { w: cols > 4 ? 130 : 160 };
    let items = g.items = [];
    let deck_rest = arrWithout(deck, goal.set);
    let fens = choose(deck_rest, rows * cols - 3);
    let all_fens = goal.set.concat(fens);
    shuffle(all_fens);
    if (isdef(fen)) { all_fens = fen.split(','); }
    for (const f of all_fens) {
      let item = create_set_card(f, dCards, card_styles);
      let d = iDiv(item);
      mStyle(d, { cursor: 'pointer' });
      d.onclick = set_interact;
      if (Goal.set.includes(item.fen)) Goal.cards.push(item);
      items.push(item);
    }
    g.selected = [];
    return items;
  }
  function set_interact(ev) {
    ev.cancelBubble = true;
    if (!canAct()) { console.log('no act'); return; }
    let id = evToId(ev);
    if (isdef(Items[id])) {
      let item = Items[id];
      toggleSelectionOfPicture(item, Session.selected);
      if (Session.selected.length == 3) {
        let correct = check_complete_set(Session.selected.map(x => x.fen));
        if (correct) {
          Selected = { isCorrect: true, feedbackUI: Session.selected.map(x => iDiv(x)) };
        } else {
          Selected = { isCorrect: false, correctUis: Goal.cards.map(x => iDiv(x)), feedbackUI: null, animation: 'onPulse1' };
        }
        set_eval();
      }
    }
  }
  function set_eval() {
    if (!canAct()) return;
    uiActivated = false; clear_timeouts();
    IsAnswerCorrect = Selected.isCorrect;
    race_set_fen();
    race_update_my_score(IsAnswerCorrect ? 1 : 0);
    let delay = show_feedback(IsAnswerCorrect);
    setTimeout(() => {
      in_game_open_prompt_off();
      clear_table_events();
      race_send_move();
    }, delay);
  }
  return {
    prompt: set_prompt,
    fen: set_fen,
  }
}
function gShape(shape, w = 20, h = 20, color = 'green', rounding) {
  let el = gG();
  if (nundef(shape)) shape = 'rect';
  if (shape != 'line') agColoredShape(el, shape, w, h, color);
  else gStroke(el, color, w);
  if (isdef(rounding) && shape == 'rect') {
    let r = el.children[0];
    gRounding(r, rounding);
  }
  return el;
}
function gSize(g, w, h, shape = null, iChild = 0) {
  let el = (getTypeOf(g) != 'g') ? g : g.children[iChild];
  let t = getTypeOf(el);
  switch (t) {
    case 'rect': el.setAttribute('width', w); el.setAttribute('height', h); el.setAttribute('x', -w / 2); el.setAttribute('y', -h / 2); break;
    case 'ellipse': el.setAttribute('rx', w / 2); el.setAttribute('ry', h / 2); break;
    default:
      if (shape) {
        switch (shape) {
          case 'hex': let pts = size2hex(w, h); el.setAttribute('points', pts); break;
        }
      }
  }
  return el;
}
function gStroke(g, color, thickness) { g.setAttribute('stroke', color); if (thickness) g.setAttribute('stroke-width', thickness); }
function gSvg() { return gCreate('svg'); }
function gUnhighlight(poly, color = 'grey', mem = true) {
  mSetAttr(poly, 'fill', mem ? mGetAttr(poly, 'orig') : color);
}
function genTTT() {
  const settings = {
    rows: 6,
    cols: 6,
    winLength: 4,
    players: [
      { symbol: 'X', isAI: true, level: 'hard', color: 'red' },
      { symbol: 'O', isAI: false, level: 'easy', color: 'blue' },
      { symbol: 'A', isAI: true, level: 'easy', color: 'gold' },
    ]
  };
  let board = initializeBoard(settings.rows, settings.cols);
  let currentPlayerIdx = 0;
  function initializeBoard(rows, cols) {
    return Array.from({ length: rows }, () => Array(cols).fill(null));
  }
  function getLegalMoves(board) {
    const moves = [];
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board[0].length; c++) {
        if (board[r][c] === null) {
          moves.push({ row: r, col: c });
        }
      }
    }
    return moves;
  }
  function applyMove(board, move, playerSymbol) {
    const newBoard = board.map(row => row.slice());
    newBoard[move.row][move.col] = playerSymbol;
    return newBoard;
  }
  function isTerminal(board) {
    return settings.players.some(p => hasWon(board, p.symbol, settings.winLength)) || getLegalMoves(board).length === 0;
  }
  function evaluate(board) {
    return settings.players.map(p => {
      if (hasWon(board, p.symbol, settings.winLength)) return 1000;
      return countPartialLines(board, p.symbol, settings.winLength - 1);
    });
  }
  function hasWon(board, player, winLength) {
    const rows = board.length;
    const cols = board[0].length;
    const directions = [
      { dr: 0, dc: 1 },
      { dr: 1, dc: 0 },
      { dr: 1, dc: 1 },
      { dr: 1, dc: -1 }
    ];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (board[r][c] !== player) continue;
        for (let { dr, dc } of directions) {
          let count = 0;
          for (let k = 0; k < winLength; k++) {
            const nr = r + dr * k;
            const nc = c + dc * k;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc] === player) {
              count++;
            } else {
              break;
            }
          }
          if (count === winLength) return true;
        }
      }
    }
    return false;
  }
  function countPartialLines(board, player, targetLength) {
    const directions = [
      { dr: 0, dc: 1 },
      { dr: 1, dc: 0 },
      { dr: 1, dc: 1 },
      { dr: 1, dc: -1 }
    ];
    const rows = board.length;
    const cols = board[0].length;
    let count = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        for (let { dr, dc } of directions) {
          let playerCount = 0;
          let emptyCount = 0;
          let blocked = false;
          for (let k = 0; k < targetLength; k++) {
            const nr = r + dr * k;
            const nc = c + dc * k;
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) {
              blocked = true;
              break;
            }
            const cell = board[nr][nc];
            if (cell === player) playerCount++;
            else if (cell === null) emptyCount++;
            else {
              blocked = true;
              break;
            }
          }
          if (!blocked && playerCount + emptyCount === targetLength) {
            count++;
          }
        }
      }
    }
    return count;
  }
  function minimax(board, depth, maximizingPlayerIdx) {
    if (depth === 0 || isTerminal(board)) {
      const evals = evaluate(board);
      return { score: evals[maximizingPlayerIdx], move: null };
    }
    const legalMoves = getLegalMoves(board);
    let bestMove = null;
    let bestScore = -Infinity;
    for (let move of legalMoves) {
      const newBoard = applyMove(board, move, settings.players[maximizingPlayerIdx].symbol);
      const nextIdx = (maximizingPlayerIdx + 1) % settings.players.length;
      const result = minimax(newBoard, depth - 1, nextIdx);
      const score = -result.score;
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    return { score: bestScore, move: bestMove };
  }
  function makeAIMove() {
    const currentPlayer = settings.players[currentPlayerIdx];
    const { move } = minimax(board, 2, currentPlayerIdx);
    if (move) {
      board = applyMove(board, move, currentPlayer.symbol);
      currentPlayerIdx = (currentPlayerIdx + 1) % settings.players.length;
      renderBoard();
      checkGameEnd();
      requestNextTurn();
    }
  }
  function requestNextTurn() {
    if (settings.players[currentPlayerIdx].isAI) {
      setTimeout(makeAIMove, 300);
    }
  }
  function renderBoard() {
    const boardDiv = document.getElementById("board");
    boardDiv.innerHTML = '';
    board.forEach((row, r) => {
      const rowDiv = document.createElement("div");
      rowDiv.className = "row";
      row.forEach((cell, c) => {
        const cellDiv = document.createElement("div");
        cellDiv.className = "cell";
        cellDiv.textContent = cell || '';
        if (cell === null && !settings.players[currentPlayerIdx].isAI) {
          cellDiv.addEventListener("click", () => {
            board = applyMove(board, { row: r, col: c }, settings.players[currentPlayerIdx].symbol);
            currentPlayerIdx = (currentPlayerIdx + 1) % settings.players.length;
            renderBoard();
            checkGameEnd();
            requestNextTurn();
          });
        }
        rowDiv.appendChild(cellDiv);
      });
      boardDiv.appendChild(rowDiv);
    });
  }
  function checkGameEnd() {
    const prevPlayer = settings.players[(currentPlayerIdx - 1 + settings.players.length) % settings.players.length];
    if (hasWon(board, prevPlayer.symbol, settings.winLength)) {
      alert(`Player ${prevPlayer.symbol} wins!`);
    } else if (getLegalMoves(board).length === 0) {
      alert("It's a draw!");
    }
  }
  document.body.innerHTML = `
      <style>
        .row { display: flex; }
        .cell {
          width: 40px;
          height: 40px;
          border: 1px solid #999;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 20px;
          cursor: pointer;
        }
      </style>
      <div id="board"></div>
    `;
  renderBoard();
  requestNextTurn();
}
function generateEventId(tsDay, tsCreated) { return `${rLetter()}_${tsDay}_${tsCreated}`; }
function generateGridPoints(n, w, h) {
  const points = [];
  let [x, y] = [0, 0];
  let { rows, cols } = divideRectangleIntoGrid(w, h, n);
  let [xSpacing, ySpacing] = [w / (cols - 1), h / (rows - 1)];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      x = j * xSpacing;
      y = i * ySpacing;
      points.push({ x: Math.round(x), y: Math.round(y) });
      if (points.length >= n) return points;
    }
  }
  return points;
}
function generateHotspots(dParent, pointPairs, sz = 20, color = 'red') {
  let hotspots = [];
  let linesByPair = {};
  for (const pair of pointPairs) {
    unlockLengthyProcess();
    let ids = pair.map(x => x.id);
    let key = ids.join(',');
    let [pStart, pEnd] = [B.diPoints[ids[0]], B.diPoints[ids[1]]];
    let line = getEquidistantPoints(pStart, pEnd, sz / 2);
    for (const p of line) {
      p.bg = color;
      p.sz = sz;
      p.start = ids[0];
      p.end = ids[1];
      p.startX = pStart.x;
      p.endX = pEnd.x;
      p.startY = pStart.y;
      p.endY = pEnd.y;
      p.id = getUID();
      p.pairs = [key];
      hotspots.push(p);
    }
    linesByPair[key] = line;
  }
  let dihotspots = lacunaDrawPoints(dParent, hotspots);
  if (color == 'transparent') hotspots.map(x => mStyle(x.div, { opacity: 0 }))
  let [c1, c2, c3, c4, c5, c6] = [0, 0, 0, 0, 0, 0];
  for (const p1 of hotspots) {
    assertion(p1.startX <= p1.endX, "NOT SORTED!!!!!")
    for (const p2 of hotspots) {
      unlockLengthyProcess();
      if (p1 == p2) { c3++; continue; }
      if (p1.startX > p2.endX) { c1++; continue; }
      if (p2.startX > p1.endX) { c2++; continue; }
      if (p1.start == p2.start && p1.end == p2.end) { c4++; continue; }
      if (p1.start == p2.end && p1.end == p2.start) { c5++; continue; }
      let miny1 = Math.min(p1.startY, p1.endY);
      let maxy1 = Math.max(p1.startY, p1.endY);
      let miny2 = Math.min(p2.startY, p2.endY);
      let maxy2 = Math.max(p2.startY, p2.endY);
      if (miny1 > maxy2 || miny2 > maxy1) { c5++; continue; }
      c6++;
      let dist = getDistanceBetweenPoints(p1, p2);
      if (dist < sz / 3) {
        let newlist = new Set(p1.pairs.concat(p2.pairs));
        p1.pairs = Array.from(newlist);
        p2.pairs = Array.from(newlist);
        if (color != 'transparent') {
          p1.bg = 'blue'; mStyle(p1.div, { bg: 'blue' });
          p2.bg = 'blue'; mStyle(p2.div, { bg: 'blue' });
        }
      }
    }
  }
  return [hotspots, linesByPair];
}
function generateListTessellation(cols = 10, rows = 10, name = 'HexTessagon') {
  let shapeFunc = getTessagonDict()[name]
  const options = {
    function: planeFunction,
    u_range: [0.0, 1.0],
    v_range: [0.0, 1.0],
    u_num: cols,
    v_num: rows,
    u_cyclic: false,
    v_cyclic: false,
    adaptor_class: ListAdaptor
  };
  const tessagon = new shapeFunc(options);
  const list = tessagon.create_mesh();
  return { tessagon, list };
}
function generatePentagonClipPath() {
  const points = [];
  const cx = 50, cy = 50;
  const r = 50;
  const angleOffset = -90;
  for (let i = 0; i < 5; i++) {
    const angleDeg = angleOffset + i * 72;
    const angleRad = (angleDeg * Math.PI) / 180;
    const x = cx + r * Math.cos(angleRad);
    const y = cy + r * Math.sin(angleRad);
    points.push(`${x}% ${y}%`);
  }
  return `polygon(${points.join(', ')})`;
}
function generatePizzaSvg(sz) {
  let colors = Array.from(arguments).slice(1);
  let numSlices = colors.length;
  const radius = sz / 2;
  const centerX = radius;
  const centerY = radius;
  const angleStep = (2 * Math.PI) / numSlices;
  const svgParts = [];
  svgParts.push(`<svg width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}" xmlns="http://www.w3.org/2000/svg">`);
  for (let i = 0; i < numSlices; i++) {
    const startAngle = i * angleStep;
    const endAngle = (i + 1) * angleStep;
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    const largeArcFlag = angleStep > Math.PI ? 1 : 0;
    const pathData = [
      `M ${centerX},${centerY}`, // Move to the center
      `L ${x1},${y1}`,           // Line to the start of the arc
      `A ${radius},${radius} 0 ${largeArcFlag} 1 ${x2},${y2}`, // Arc to the end of the slice
      `Z`                        // Close the path
    ].join(' ');
    svgParts.push(`<path d="${pathData}" fill="${colors[i]}" />`);
  }
  svgParts.push('</svg>');
  return svgParts.join('\n');
}
function generateRandomPoints(n, w, h) {
  const points = [];
  for (let i = 0; i < n; i++) {
    points.push({ x: Math.random() * w, y: Math.random() * h });
  }
  return points;
}
function generateRandomPointsRect(n, w, h, rand = 0) {
  const points = [];
  let { rows, cols } = divideRectangleIntoGrid(w, h * .8, n);
  const xSpacing = w / (cols + 1);
  const ySpacing = h / (rows + 1);
  let dmin = 10;
  let x, y, xfix, yfix, xlast = -dmin, ylast = -dmin;
  for (let i = 0; i < rows; i++) {
    yfix = (i + .75) * ySpacing;
    for (let j = 0; j < cols; j++) {
      xfix = (j + .75) * xSpacing;
      if (points.length < n) {
        let dx = rand * (Math.random() - 0.5) * xSpacing; if (coin()) dx = -dx;
        let dy = rand * (Math.random() - 0.5) * ySpacing; if (coin()) dy = -dy;
        x = xfix + dx; if (x > xlast && x - xlast < dmin) x += dmin;
        y = yfix + dy; if (y > ylast && y - ylast < dmin) y += dmin;
        xlast = x;
        points.push({ x: Math.round(x), y: Math.round(y) });
      }
      ylast = y
    }
  }
  return points;
}
function generateRandomPointsRound(n, w, h, rand = 0.8) {
  let [radx, rady] = [w / 2, h / 2];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const points = [];
  for (let i = 1; i < n + 1; i++) {
    const angle = i * goldenAngle + (Math.random() - 0.5) * goldenAngle * rand / 4;
    const distance = Math.sqrt(i / n);
    let x = radx + distance * radx * Math.cos(angle);
    let y = rady + distance * rady * Math.sin(angle);
    points.push({ x: Math.round(x), y: Math.round(y) });
  }
  return points;
}
function generateRandomTiling({
  width,
  height,
  rows,
  cols,
  jitter = 0.4
}) {
  const points = [];
  const tiles = [];
  const dx = width / (cols - 1);
  const dy = height / (rows - 1);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * dx + (Math.random() - 0.5) * dx * jitter;
      const y = row * dy + (Math.random() - 0.5) * dy * jitter;
      points.push({ x, y, row, col });
    }
  }
  function pointAt(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return null;
    return points[r * cols + c];
  }
  for (let row = 0; row < rows - 1; row++) {
    for (let col = 0; col < cols - 1; col++) {
      const p1 = pointAt(row, col);
      const p2 = pointAt(row, col + 1);
      const p3 = pointAt(row + 1, col + 1);
      const p4 = pointAt(row + 1, col);
      tiles.push([p1, p2, p3, p4]);
    }
  }
  return { points, tiles };
}
function generateRandomTilingWithNCorners({
  width,
  height,
  rows,
  cols,
  jitter = 0.4,
  corners = 5,
}) {
  const points = [];
  const tiles = [];
  const dx = width / (cols - 1);
  const dy = height / (rows - 1);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * dx + (Math.random() - 0.5) * dx * jitter;
      const y = row * dy + (Math.random() - 0.5) * dy * jitter;
      points.push({ x, y, row, col });
    }
  }
  function pointAt(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return null;
    return points[r * cols + c];
  }
  for (let row = 1; row < rows - 1; row++) {
    for (let col = 1; col < cols - 1; col++) {
      const center = pointAt(row, col);
      const neighbors = [];
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const pt = pointAt(row + dr, col + dc);
          if (pt) neighbors.push(pt);
        }
      }
      neighbors.sort((a, b) => {
        const angleA = Math.atan2(a.y - center.y, a.x - center.x);
        const angleB = Math.atan2(b.y - center.y, b.x - center.x);
        return angleA - angleB;
      });
      const selected = neighbors.slice(0, corners - 1);
      const polygon = [center, ...selected];
      tiles.push(polygon);
    }
  }
  return { points, tiles };
}
function generateRandomWords(n, unique = false) {
  const sampleWords = ['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 'honeydew', 'kiwi', 'lemon', 'mango', 'nectarine', 'orange', 'papaya', 'quince', 'raspberry', 'strawberry', 'tangerine', 'ugli', 'victoria plum', 'watermelon', 'xigua', 'yuzu', 'zucchini'];
  let randomWords = [];
  for (let i = 0; i < n; i++) {
    const randomWord = sampleWords[Math.floor(Math.random() * sampleWords.length)];
    randomWords.push(randomWord);
  }
  return randomWords;
}
function generateRepeatedColors(n, repeat, colorList) {
  const colors = [];
  let max = Math.ceil(n / repeat);
  for (let i = 0; i < max; i++) {
    const color = colorList[i % colorList.length];
    for (let j = 0; j < repeat; j++) {
      colors.push(color);
    }
  }
  return colors;
}
function generateSvgTessellation(cols = 10, rows = 10, name = 'HexTessagon') {
  let shapeFunc = getTessagonDict()[name];
  const options = {
    function: planeFunction,
    u_range: [0.0, 1.0],
    v_range: [0.0, 1.0],
    u_num: cols,
    v_num: rows,
    u_cyclic: false,
    v_cyclic: false,
    adaptor_class: SvgAdaptor
  };
  const tessagon = new shapeFunc(options);
  const svg = tessagon.create_mesh();
  return { tessagon, svg };
}
function generateSvgWithImage(imageSrc, width = 100, height = 100) {
  if (!imageSrc || typeof imageSrc !== 'string') {
    console.error("Invalid image source provided to generateSvgWithImage.");
    return ''; // Return empty string or handle error as appropriate
  }
  const svgCode = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <image xlink:href="${imageSrc}" x="0" y="0" width="${width}" height="${height}"/>
      </svg>
  `;
  return svgCode;
}
function generateTableId(gamename, me) { return gamename + '_' + me + '_' + formatDateCompact(); }
function generateTableName(n, existing) {
  while (true) {
    let cap = rChoose(M.asciiCapitals);
    let parts = cap.split(' ');
    if (parts.length == 2) cap = stringBefore(cap, ' '); else cap = stringBefore(cap, '-');
    cap = cap.trim();
    let arr = ['battle of ', 'rally of ', 'showdown in ', 'summit of ', 'joust of ', 'tournament of ', 'rendezvous in ', 'soiree in ', 'festival of '];//,'encounter in ']; //['battle of ', 'war of ']
    if (n == 2) arr.push('duel of ');
    let s = rChoose(arr) + cap;
    s = normalizeString(s, { lowercase: false });
    if (!existing.includes(s)) return s;
  }
}
function getAbstractSymbol(n) {
  if (nundef(n)) n = rChoose(range(1, 100));
  else if (isList(n)) n = rChoose(n);
  return `abstract_${String(n).padStart(3, '0')}`;
}
function getActivatedLines(lines) {
  if (nundef(lines)) return [];
  let res = [];
  for (const l of lines) {
    let d = iDiv(l);
    let bg = mGetStyle(d, 'bg');
    let opa = mGetStyle(d, 'opacity'); //console.log(bg, opa);
    if (bg == 'red' || opa == 1) res.push(l);
  }
  return res;
}
function getAllHabitats() {
  let res = [];
  for (const k in M.details) {
    let hab = M.details[k].habitat;
    toWords(hab.toLowerCase()).map(x => addIf(res, x));
  }
  res.sort();
  return res;
}
async function getAllTables() {
  const tables = await api('GET', '/get_tables');
  console.log(tables);
}
function getBackendUrl(isScript = null) {
  if (nundef(DA.backendUrl)) {
    let loc = window.location.href;
    if (VERBOSE) console.log('href', loc);
    let sessionType = DA.sessionType = detectSessionType();
    if (VERBOSE) console.log('sessionType', sessionType);
    let backendUrl = DA.backendUrl = sessionType == 'live' ? 'http://localhost:5000' : 'at0' ? 'https://moxito.online/at0' : 'fastcomet' ? 'https://moxito.online' : isScript || sessionType == 'php' ? 'http://localhost:8080/mox' : '..';
    if (VERBOSE) console.log('backendUrl', backendUrl);
  }
  return DA.backendUrl;
}
function getBar(ctx, list, val) {
  let res = list.filter(p => isWithinDelta(p.x, val, 2) && (isLightBefore(ctx, p.x, p.y) || isLightAfter(ctx, p.x, p.y)));
  return res;
}
function getBeautifulColors() {
  let res = getColormapColors();
  res = res.concat(colorSchemeRYB());
  res = res.concat(levelColors.concat(modernColors.concat(Object.values(playerColors).concat(vibrantColors.concat(childrenRoomColors.concat(deepRichColors)))))).map(x => w3color(x));
  for (const o of res) o.hex = o.toHexString();
  return res;
}
function getBestContrastingColor(color) {
  let [r, g, b] = colorHexToRgbArray(colorFrom(color));
  let yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#000000' : '#FFFFFF';
}
function getBlendCSS(blcanvas) {
  const blendModes = {
    'source-over': 'normal',
    'lighter': 'normal',
    'copy': 'normal'
  };
  return valf(blendModes[blcanvas], blcanvas);
}
function getBlendCanvas(blendMode = 'normal') {
  const blendModeMapping = {
    'normal': 'source-over',       // Default blending mode
    'multiply': 'multiply',
    'screen': 'screen',
    'overlay': 'overlay',
    'darken': 'darken',
    'lighten': 'lighten',
    'color-dodge': 'color-dodge',
    'saturation': 'saturation',
    'color': 'color',
    'luminosity': 'luminosity',
    'pass-through': 'source-over' // This is a made-up value for cases where no blending is applied
  };
  return valf(blendModeMapping[blendMode], blendMode);
}
function getBlendModeForCanvas(blendMode = 'normal') {
  const blendModeMapping = {
    'normal': 'source-over',       // Default blending mode
    'multiply': 'multiply',
    'screen': 'screen',
    'overlay': 'overlay',
    'darken': 'darken',
    'lighten': 'lighten',
    'color-dodge': 'color-dodge',
    'saturation': 'saturation',
    'color': 'color',
    'luminosity': 'luminosity',
    'pass-through': 'source-over' // This is a made-up value for cases where no blending is applied
  };
  return valf(blendModeMapping[blendMode], blendMode);
}
function getBlendModesCSS() {
  return 'normal|multiply|screen|overlay|darken|lighten|color-dodge|saturation|color|luminosity'.split('|');
}
function getBlendModesCanvas() {
  const blendModes = [
    'source-over',
    'lighter',
    'copy',
    'multiply',
    'screen',
    'overlay',
    'darken',
    'lighten',
    'color-dodge',
    'color-burn',
    'hard-light',
    'soft-light',
    'difference',
    'exclusion',
    'hue',
    'saturation',
    'color',
    'luminosity'
  ];
  return blendModes;
}
function getBrowser() {
  var userAgent = navigator.userAgent;
  if (userAgent.match(/chrome|chromium|crios/i)) {
    return "Chrome";
  }
  else if (userAgent.match(/firefox|fxios/i)) {
    return "Firefox";
  }
  else if (userAgent.match(/safari/i)) {
    return "Safari";
  }
  else if (userAgent.match(/msie|trident/i)) {
    return "Internet Explorer";
  }
  else if (userAgent.match(/edg/i)) {
    return "Edge";
  }
  else {
    return "Other";
  }
}
function getButtonCaptionName(name) { return `bTest${name}`; }
function getButtonCaptionNames(table) { return isdef(table) ? table.playerNames : ['felix', 'gul', 'amanda', 'lauren', 'mimi']; }
function getButtonId(key) { return 'b' + capitalize(key); }
function getCSSVariable(varname) { return getCssVar(varname); }
function getCairoPentagonClipPath() {
  return 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
}
function getCallerInfo() {
  const err = new Error();
  const stack = err.stack?.split('\n');
  if (!stack || stack.length < 4) {
    return { functionName: null, file: null, line: null };
  }
  const callerLine = stack[3] || '';
  const match = callerLine.match(/at\s+(.*)\s+\((.*):(\d+):(\d+)\)/) ||
    callerLine.match(/at\s+(.*):(\d+):(\d+)/);
  if (match) {
    return match.length === 5
      ? {
        functionName: match[1],
        file: match[2],
        line: parseInt(match[3]),
      }
      : {
        functionName: null,
        file: match[1],
        line: parseInt(match[2]),
      };
  }
  return { functionName: null, file: null, line: null };
}
async function getCanvasCtx(d, styles = {}, opts = {}) {
  opts.tag = 'canvas';
  let cv = mDom(d, styles, opts);
  let ctx = cv.getContext('2d');
  let fill = valf(styles.fill, styles.bg);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fillRect(0, 0, cv.width, cv.height);
  }
  let bgBlend = styles.bgBlend;
  if (bgBlend) ctx.globalCompositeOperation = bgBlend;
  let src = valf(opts.src, opts.path);
  if (src) {
    let isRepeat = src.includes('ttrans');
    let imgStyle = isRepeat ? {} : { w: cv.width, h: cv.height };
    let img = await imgAsync(null, imgStyle, { src });
    if (bgBlend) ctx.globalCompositeOperation = bgBlend;
    if (isRepeat) {
      const pattern = ctx.createPattern(img, 'repeat');
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, cv.width, cv.height);
    } else ctx.drawImage(img, 0, 0, cv.width, cv.height);
  }
  return { cv, ctx };
}
function getCenter(elem, relto) {
  const rect = elem.getBoundingClientRect();
  if (nundef(relto)) relto = elem.parentNode;
  const containerRect = relto.getBoundingClientRect();
  return {
    x: rect.left - containerRect.left + rect.width / 2,
    y: rect.top - containerRect.top + rect.height / 2
  };
}
function getCenterRelativeToParent(div) {
  const rect = div.getBoundingClientRect();
  const parentRect = div.parentNode.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2 - parentRect.left,
    y: rect.top + rect.height / 2 - parentRect.top
  };
}
function getCenters(layout, rows, cols, wCell, hCell,) {
  if (layout == 'quad') { return quadCenters(rows, cols, wCell, hCell); }
  else if (layout == 'hex') { return hexCenters(rows, cols, wCell, hCell); }
  else if (layout == 'hex1') { info = hex1Centers(rows, cols, wCell, hCell); }
  else if (layout == 'circle') { return circleCenters(rows, cols, wCell, hCell); }
}
function getCentersFromAreaSize(layout, wBoard, hBoard, wCell, hCell) {
  let info;
  let [rows, cols] = [Math.ceil(wBoard / wCell), Math.ceil(hBoard / hCell)]
  if (layout == 'quad') { info = quadCenters(rows, cols, wCell, hCell); }
  else if (layout == 'hex') { info = hexCenters(rows, cols, wCell, hCell); }
  else if (layout == 'hex1') { info = hex1Centers(rows, cols, wCell, hCell); }
  else if (layout == 'circle') { info = circleCenters(rows, cols, wCell, hCell); }
  return info;
}
function getCentersFromRowsCols(layout, rows, cols, wCell, hCell) {
  let info;
  if (layout == 'quad') { info = quadCenters(rows, cols, wCell, hCell); }
  else if (layout == 'hex') { info = hexCenters(rows, cols, wCell, hCell); }
  else if (layout == 'hex1') { info = hex1Centers(rows, cols, wCell, hCell); }
  else if (layout == 'circle') { info = circleCenters(rows, cols, wCell, hCell); }
  return info;
}
function getCheckedNames(dParent) {
  let checks = Array.from(dParent.querySelectorAll('input[type="checkbox"]')); //dParent.getElementsByTagName('input'));
  let res = [];
  for (const ch of checks) {
    if (ch.checked) res.push(ch.name);
  }
  return res;
}
function getCheckedRadios(rg) {
  let inputs = rg.getElementsByTagName('INPUT');
  let list = [];
  for (const ch of inputs) {
    if (ch.checked) list.push(ch.value);
  }
  return list;
}
function getCivSpot(civ, row, col, fact = 1) {
  let rAdvisor = { x: 11, y: 27, w: 87, h: 136 }; //von persia
  let rColony1 = { x: 10, y: 193, w: 87, h: 137 }; //von japan
  let rColony2 = { x: 122, y: 192, w: 87, h: 136 }; //von india
  let rColonyUpPersia = { x: 122, y: 26, w: 87, h: 136 }; //von portugal
  let rBuilding1 = { x: 132, y: 26, w: 87, h: 136 }; //von portugal
  let rBuilding1Persia = { x: 243, y: 26, w: 87, h: 136 }; //von persia
  let rBuilding2 = { x: 243, y: 28, w: 87, h: 136 };
  let dxBuildings = rBuilding2.x - (rBuilding1.x + rBuilding1.w);
  let rWic = { x: 700, y: 26, w: 87, h: 136 }; //calculated
  let rLastWonder = { x: 700, y: 193, w: 87, h: 136 };
  let rWonder = { x: 674, y: 193, w: 87, h: 136 };
  let dxWonders = 25;
  for (const r of [rAdvisor, rColony1, rColony2, rColonyUpPersia, rBuilding1, rBuilding1Persia, rBuilding2, rWic, rLastWonder, rWonder]) {
    r.x *= fact; r.y *= fact; r.w *= fact; r.h *= fact;
  }
  dxBuildings *= fact;
  dxWonders *= fact;
  if (row == 0 && col == 0) return rAdvisor;
  if (row == 0 && col == 1 && civ == 'persia') return rColonyUpPersia;
  if (row == 0 && col == 1) return rBuilding1;
  if (row == 0 && col == 2 && civ == 'persia') return rBuilding1Persia;
  if (row == 0 && col == 2) return rBuilding2;
  if (row == 0 && col == 6) return rWic;
  let r, dist;
  if (row == 0) {
    r = rBuilding2;
    dist = dxBuildings + r.w
    return { x: r.x + dist * (col - 2), y: r.y, w: r.w, h: r.h };
  }
  if (row == 1 && col == 0) return rColony1;
  if (row == 1 && col == 1 && civ != 'china' && civ != 'poland') return rColony2;
  if (row == 1 && col == 6) return rLastWonder;
  r = rLastWonder;
  dist = dxWonders + r.w;
  return { x: r.x - dist * (6 - col), y: r.y, w: r.w, h: r.h };
}
function getColorHexes(x) {
  return [
    'f0f8ff',
    'faebd7',
    '00ffff',
    '7fffd4',
    'f0ffff',
    'f5f5dc',
    'ffe4c4',
    '000000',
    'ffebcd',
    '0000ff',
    '8a2be2',
    'a52a2a',
    'deb887',
    '5f9ea0',
    '7fff00',
    'd2691e',
    'ff7f50',
    '6495ed',
    'fff8dc',
    'dc143c',
    '00ffff',
    '00008b',
    '008b8b',
    'b8860b',
    'a9a9a9',
    'a9a9a9',
    '006400',
    'bdb76b',
    '8b008b',
    '556b2f',
    'ff8c00',
    '9932cc',
    '8b0000',
    'e9967a',
    '8fbc8f',
    '483d8b',
    '2f4f4f',
    '2f4f4f',
    '00ced1',
    '9400d3',
    'ff1493',
    '00bfff',
    '696969',
    '696969',
    '1e90ff',
    'b22222',
    'fffaf0',
    '228b22',
    'ff00ff',
    'dcdcdc',
    'f8f8ff',
    'ffd700',
    'daa520',
    '808080',
    '808080',
    '008000',
    'adff2f',
    'f0fff0',
    'ff69b4',
    'cd5c5c',
    '4b0082',
    'fffff0',
    'f0e68c',
    'e6e6fa',
    'fff0f5',
    '7cfc00',
    'fffacd',
    'add8e6',
    'f08080',
    'e0ffff',
    'fafad2',
    'd3d3d3',
    'd3d3d3',
    '90ee90',
    'ffb6c1',
    'ffa07a',
    '20b2aa',
    '87cefa',
    '778899',
    '778899',
    'b0c4de',
    'ffffe0',
    '00ff00',
    '32cd32',
    'faf0e6',
    'ff00ff',
    '800000',
    '66cdaa',
    '0000cd',
    'ba55d3',
    '9370db',
    '3cb371',
    '7b68ee',
    '00fa9a',
    '48d1cc',
    'c71585',
    '191970',
    'f5fffa',
    'ffe4e1',
    'ffe4b5',
    'ffdead',
    '000080',
    'fdf5e6',
    '808000',
    '6b8e23',
    'ffa500',
    'ff4500',
    'da70d6',
    'eee8aa',
    '98fb98',
    'afeeee',
    'db7093',
    'ffefd5',
    'ffdab9',
    'cd853f',
    'ffc0cb',
    'dda0dd',
    'b0e0e6',
    '800080',
    '663399',
    'ff0000',
    'bc8f8f',
    '4169e1',
    '8b4513',
    'fa8072',
    'f4a460',
    '2e8b57',
    'fff5ee',
    'a0522d',
    'c0c0c0',
    '87ceeb',
    '6a5acd',
    '708090',
    '708090',
    'fffafa',
    '00ff7f',
    '4682b4',
    'd2b48c',
    '008080',
    'd8bfd8',
    'ff6347',
    '40e0d0',
    'ee82ee',
    'f5deb3',
    'ffffff',
    'f5f5f5',
    'ffff00',
    '9acd32'
  ];
}
function getColorNames() {
  return [
    'AliceBlue',
    'AntiqueWhite',
    'Aqua',
    'Aquamarine',
    'Azure',
    'Beige',
    'Bisque',
    'Black',
    'BlanchedAlmond',
    'Blue',
    'BlueViolet',
    'Brown',
    'BurlyWood',
    'CadetBlue',
    'Chartreuse',
    'Chocolate',
    'Coral',
    'CornflowerBlue',
    'Cornsilk',
    'Crimson',
    'Cyan',
    'DarkBlue',
    'DarkCyan',
    'DarkGoldenRod',
    'DarkGray',
    'DarkGrey',
    'DarkGreen',
    'DarkKhaki',
    'DarkMagenta',
    'DarkOliveGreen',
    'DarkOrange',
    'DarkOrchid',
    'DarkRed',
    'DarkSalmon',
    'DarkSeaGreen',
    'DarkSlateBlue',
    'DarkSlateGray',
    'DarkSlateGrey',
    'DarkTurquoise',
    'DarkViolet',
    'DeepPink',
    'DeepSkyBlue',
    'DimGray',
    'DimGrey',
    'DodgerBlue',
    'FireBrick',
    'FloralWhite',
    'ForestGreen',
    'Fuchsia',
    'Gainsboro',
    'GhostWhite',
    'Gold',
    'GoldenRod',
    'Gray',
    'Grey',
    'Green',
    'GreenYellow',
    'HoneyDew',
    'HotPink',
    'IndianRed',
    'Indigo',
    'Ivory',
    'Khaki',
    'Lavender',
    'LavenderBlush',
    'LawnGreen',
    'LemonChiffon',
    'LightBlue',
    'LightCoral',
    'LightCyan',
    'LightGoldenRodYellow',
    'LightGray',
    'LightGrey',
    'LightGreen',
    'LightPink',
    'LightSalmon',
    'LightSeaGreen',
    'LightSkyBlue',
    'LightSlateGray',
    'LightSlateGrey',
    'LightSteelBlue',
    'LightYellow',
    'Lime',
    'LimeGreen',
    'Linen',
    'Magenta',
    'Maroon',
    'MediumAquaMarine',
    'MediumBlue',
    'MediumOrchid',
    'MediumPurple',
    'MediumSeaGreen',
    'MediumSlateBlue',
    'MediumSpringGreen',
    'MediumTurquoise',
    'MediumVioletRed',
    'MidnightBlue',
    'MintCream',
    'MistyRose',
    'Moccasin',
    'NavajoWhite',
    'Navy',
    'OldLace',
    'Olive',
    'OliveDrab',
    'Orange',
    'OrangeRed',
    'Orchid',
    'PaleGoldenRod',
    'PaleGreen',
    'PaleTurquoise',
    'PaleVioletRed',
    'PapayaWhip',
    'PeachPuff',
    'Peru',
    'Pink',
    'Plum',
    'PowderBlue',
    'Purple',
    'RebeccaPurple',
    'Red',
    'RosyBrown',
    'RoyalBlue',
    'SaddleBrown',
    'Salmon',
    'SandyBrown',
    'SeaGreen',
    'SeaShell',
    'Sienna',
    'Silver',
    'SkyBlue',
    'SlateBlue',
    'SlateGray',
    'SlateGrey',
    'Snow',
    'SpringGreen',
    'SteelBlue',
    'Tan',
    'Teal',
    'Thistle',
    'Tomato',
    'Turquoise',
    'Violet',
    'Wheat',
    'White',
    'WhiteSmoke',
    'Yellow',
    'YellowGreen'
  ];
}
function getColormapColors() {
  let s = colormapAsStringOrig();
  let parts = s.split('clickColor("');
  let colors = [];
  for (const p of parts) { if (p.startsWith('#')) colors.push(p.substring(0, 7)); }
  return colors;
}
function getCoordinates() {
  let res = [];
  for (const a of arguments) { res.push(a[0]), res.push(a[1]) }
  return res;
}
function getCorners(x, y, sz, func) {
  let res = {};
  let list = func(x, y, sz);
  for (let i = 0; i < list.length / 2; i++) {
    let id = `c${list[2 * i]}_${list[2 * i + 1]}`;
    res[id] = { x: list[2 * i], y: list[2 * i + 1] }
  }
  return res;
}
function getCssVar(varname) { return getComputedStyle(document.body).getPropertyValue(varname); }
async function getDA(key, fast = true) {
  if (isdef(DA[key])) return DA[key];
  let loc = window.location.href;
  DA.isMoxito = loc.includes('moxito.online');
  DA.isLocal = !DA.isMoxito && !loc.includes('telecave');
  DA.isLocal8080 = loc.includes('localhost:8080');
  DA.isLive = DA.isLocal && !loc.includes('8080');
  DA.project = stringAfterLast(stringBeforeLast(loc, '/'), '/'); //console.log('project', DA.project);
  DA.staticUrl = DA.isLive ? '../' : DA.isLocal8080 ? 'http://localhost:8080/mox/' : 'https://moxito.online/';
  DA.phpUrl = (DA.isLocal ? 'http://localhost:8080/mox/' : 'https://moxito.online/') + DA.project + '/php/';
  DA.flaskUrl = (DA.isLocal ? 'http://localhost:5000/' : 'https://moxito.online/flaskgame0/');
  DA.nodeUrl = (DA.isLocal ? 'http://localhost:3000/' : 'https://games.moxito.online/');
  if (!fast) {
    try {
      let flaskLocal = await fetch(DA.flaskUrl);
    } catch { DA.flaskUrl = 'https://moxito.online/flaskgame0/' }
    try {
      let nodeLocal = await fetch(DA.nodeUrl);
    } catch { DA.nodeUrl = 'https://games.moxito.online/' }
  }
  return DA[key];
}
function getDashedHexBorder(color) {
  return {
    background: `repeating-linear-gradient(-60deg, ${color}, ${color} 4px, transparent 4px, transparent 10px),
    repeating-linear-gradient(60deg, ${color}, ${color} 4px, transparent 4px, transparent 10px),
    repeating-linear-gradient(0deg, ${color}, ${color} 4px, transparent 4px, transparent 10px)`,
    bgSize: '100% 100%'
  }
  return {
    background: `repeating-linear-gradient(-60deg, ${color}, ${color} 4px, transparent 4px, transparent 10px)`,
    bgSize: '100% 100%'
  };
}
function getDateTimeData(from, to) {
  let dt = new Date(from);
  const year = dt.getFullYear();
  const month = String(dt.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(dt.getDate()).padStart(2, '0'); // Add leading zero if needed
  const hour = String(dt.getHours()).padStart(2, '0'); // Get hours (24-hour format)
  const minute = String(dt.getMinutes()).padStart(2, '0'); // Get minutes
  const second = String(dt.getSeconds()).padStart(2, '0'); // Get minutes
  let dateSort = `${year}.${month}.${day}`;
  let date = `${day}.${month}.${year}`;
  let time = `${hour}:${minute}:${second}`;
  let secs = calculateSecondsDifference(from, to);
  return { dt, year, month, day, hour, minute, second, date, time, secs, dateSort };
}
function getDetailedSuperdi(key) {
  let o = M.superdi[key];
  let details = valf(M.details[key], M.details[o.friendly]);
  if (nundef(details)) return null;
  addKeys(details, o);
  o.key = key;
  o.class = o.class.toLowerCase();
  if (isdef(o.lifespan)) o.olifespan = calcLifespan(o.lifespan);
  if (isdef(o.food)) {
    [o.foodlist, o.foodtype] = extractFoodAndType(o.food);
    let foodTokens = [];
    if (['berries', 'fruit'].some(x => o.foodlist.includes(x))) foodTokens.push('cherries');
    if (['fish', 'shrimp', 'squid'].some(x => o.foodlist.includes(x))) foodTokens.push('fish');
    if (['wheat', 'grain', 'crops'].some(x => o.foodlist.includes(x))) foodTokens.push('grain');
    if (o.foodtype.startsWith('insect')) foodTokens.push('worm');
    else if (o.foodtype.startsWith('carni')) foodTokens.push('mouse');
    else if (o.foodtype.startsWith('omni')) foodTokens.push('omni');
    else if (o.foodtype.startsWith('herbi')) foodTokens.push('seedling');
    o.foodTokens = arrTake(foodTokens, 3);
  }
  if (isdef(o.offsprings)) o.ooffsprings = calcOffsprings(o.offsprings);
  if (isdef(o.weight)) { o.oweight = calcWeight(o.weight); o.nweight = o.oweight.avg; }
  if (isdef(o.size)) { o.osize = calcSize(o.size); o.nsize = o.osize.avg; }
  if (isdef(o.species)) {
    let x = o.species; o.longSpecies = x; o.species = extractSpecies(x);
  }
  if (isdef(o.habitat)) {
    let text = o.habitat;
    let hlist = o.hablist = extractHabitat(text, ['coastal']);
    let habTokens = [];
    if (['wetland'].some(x => hlist.includes(x))) { habTokens.push('wetland'); } //colors.push('lightblue'); imgs.push('../assets/games/wingspan/wetland.png'); }
    if (['dwellings', 'grassland', 'desert'].some(x => hlist.includes(x))) { habTokens.push('grassland'); } //{ colors.push('goldenrod'); imgs.push('../assets/games/wingspan/grassland2.png'); }
    if (['forest', 'mountain', 'ice'].some(x => hlist.includes(x))) { habTokens.push('forest'); } //{ colors.push('emerald'); imgs.push('../assets/games/wingspan/forest1.png'); }
    o.habTokens = habTokens;
  }
  let colors = ['turquoise', 'bluegreen', 'teal', 'brown', 'gray', 'green', 'violet', 'blue', 'black', 'yellow', 'white', 'lavender', 'orange', 'buff', 'red', 'pink', 'golden', 'cream', 'grey', 'sunny', 'beige'];
  if (isdef(o.color)) o.colors = extractColors(o.color, colors);
  o = sortDictionary(o);
  return o;
}
function getDetails(key) {
  let o = getSuperdi(key);
  let de = valf(M.details[key], M.details[o.friendly]);
  return valf(de, {});
}
function getDistanceBetweenCenters(div1, div2) {
  const rect1 = div1.getBoundingClientRect();
  const rect2 = div2.getBoundingClientRect();
  const centerX1 = rect1.left + rect1.width / 2;
  const centerY1 = rect1.top + rect1.height / 2;
  const centerX2 = rect2.left + rect2.width / 2;
  const centerY2 = rect2.top + rect2.height / 2;
  const dx = centerX2 - centerX1;
  const dy = centerY2 - centerY1;
  return Math.sqrt(dx * dx + dy * dy);
}
function getDistanceBetweenPoints(p1, p2) {
  if (isString(p1)) p1 = B.diPoints[p1];
  if (isString(p2)) p2 = B.diPoints[p2];
  return getDistanceBetweenCenters(p1.div, p2.div);
}
function getDivId(key) { return 'd' + capitalize(key); }
function getDynId(loc, oid) { return loc + '@' + oid; }
function getElementWithAttribute(key, val) {
  return document.querySelector(`[${key}="${val}"]`);
}
function getEndPoints(c0, c1) { return [c0[0], c0[1], c1[0], c1[1]]; }
function getEquidistantPoints(p1, p2, d = 10, includeEnds = false) {
  const points = [];
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const numPoints = Math.floor(distance / d);
  let istart = includeEnds ? 0 : 1;
  let iend = includeEnds ? numPoints : numPoints - 1;
  for (let i = istart; i <= iend; i++) {
    const t = i / numPoints;
    const x = p1.x + t * dx;
    const y = p1.y + t * dy;
    points.push({ x, y });
  }
  return points;
}
function getEventValue(o) {
  if (isEmpty(o.time)) return o.text;
  return o.time + ' ' + stringBefore(o.text, '\n');
}
function getFlexStyle() { return { display: 'flex', alignItems: 'center', justifyContent: 'center' } }
function getFormattedDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(date.getDate()).padStart(2, '0'); // Add leading zero if needed
  return `${year}-${month}-${day}`;
}
function getFormattedTime() {
  const date = new Date();
  const hours = String(date.getHours()).padStart(2, '0'); // Get hours (24-hour format)
  const minutes = String(date.getMinutes()).padStart(2, '0'); // Get minutes
  return `${hours}:${minutes}`;
}
function getFunctionsNameThatCalledThisFunction() {
  let c1 = getFunctionsNameThatCalledThisFunction.caller;
  if (nundef(c1)) return 'no caller!';
  let c2 = c1.caller;
  if (nundef(c2)) return 'no caller!';
  return c2.name;
}
function getGameColor(gamename) { return getGameConfig(gamename).color; }
function getGameFriendly(gamename) { return getGameConfig(gamename).friendly; }
function getGameOption(prop) { return lookup(T, ['options', prop]); }
function getGameOptions(gamename) { return getGameConfig(gamename).options; }
function getGamePlayerOptions(gamename) { return getGameConfig(gamename).ploptions; }
function getGamePlayerOptionsAsDict(gamename) { return valf(getGamePlayerOptions(gamename), {}); }
function getGameProp(prop) { return getGameConfig(T.game)[prop]; }
async function getGameState(gameId) {
  return await api('GET', `/game_state/${gameId}`);
}
function getGameValues() {
  let user = U.id;
  let game = G.id;
  let level = G.level;
  let settings = { numColors: 1, numRepeat: 1, numPics: 1, numSteps: 1, colors: ColorList };
  settings = mergeOverride(settings, DB.settings);
  if (isdef(U.settings)) settings = mergeOverride(settings, U.settings);
  if (isdef(DB.games[game])) settings = mergeOverride(settings, DB.games[game]);
  let next = lookup(DB.games, [game, 'levels', level]); if (next) settings = mergeOverride(settings, next);
  next = lookup(U, ['games', game]); if (next) settings = mergeOverride(settings, next);
  next = lookup(U, ['games', game, 'levels', level]); if (next) settings = mergeOverride(settings, next);
  delete settings.levels;
  Speech.setLanguage(settings.language);
  return settings;
}
function getHeaderNames(arr) {
  let di = { dateof: 'date', sender_name: 'from', sender_owner: 'owner', receiver_name: 'to', receiver_owner: 'owner', description: 'note' };
  let headers = arr.map(x => valf(di[x], x));
  return headers;
}
function getHexCornerList(x, y, sz) { return [x + sz, y, x + 2 * sz, y + sz / 2, x + 2 * sz, y + sz * 3 / 2, x + sz, y + 2 * sz, x, y + sz * 3 / 2, x, y + sz / 2]; }
function getHexCorners(x, y, sz) {
  let res = {};
  let list = getHexCornerList(x, y, sz);
  for (let i = 0; i < list.length / 2; i++) {
    let id = `c${list[2 * i]}_${list[2 * i + 1]}`;
    res[id] = { x: list[2 * i], y: list[2 * i + 1] }
  }
  return res;
}
function getHexPoly(x, y, w, h) {
  let hex = [[0, -0.5], [0.5, -0.25], [0.5, 0.25], [0, 0.5], [-0.5, 0.25], [-0.5, -0.25]];
  return getPoly(hex, x, y, w, h);
}
function getHexSegments(x, y, sz) {
  let res = {};
  let list = getHexCornerList(x, y, sz);
  for (let i = 0; i < list.length / 2; i++) {
    let x1 = list[2 * i];
    let y1 = list[2 * i + 1];
    let x2 = list[2 * ((i + 1) % 6)];
    let y2 = list[2 * ((i + 1) % 6) + 1];
    let id = `s${x1}_${y1}_${x2}_${y2}`;
    res[id] = { x1, y1, x2, y2 }
  }
  return res;
}
function getIdKey(elem) { let id = mBy(elem).id; return id.substring(1).toLowerCase(); }
function getImageData(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // To avoid CORS issues
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      let data = canvas.toDataURL('image/png');
      resolve(data);
    };
    img.onerror = (err) => {
      reject(new Error('Failed to load image'));
    };
  });
}
function getImageSize(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      reject(new Error(`Failed to load the image from: ${src}`));
    };
    img.src = src;
  });
}
function getInnermostTextString(div) {
  if (!div || !div.children.length) {
    return div && div.innerHTML.trim() && !/<[^>]+>/.test(div.innerHTML) ? div.innerHTML.trim() : null;
  }
  for (let child of div.children) {
    let result = getInnermostTextString(child);
    if (result) return result;
  }
  return null;
}
function getItem(k) { return infoToItem(Syms[k]); }
function getKeyLists() {
  if (isdef(M.byKeyType)) return M.byKeyType;
  let types = getKeyTypes();
  let di = {};
  let keys = M.symKeys = Object.keys(M.superdi);
  for (const k of keys) {
    let o = M.superdi[k];
    for (const t of types) if (isdef(o[t])) lookupAddToList(di, [t], k);
  }
  di.plain = jsCopy(commandWords);
  M.byKeyType = di;
  return di;
}
function getKeyTypes() { return ['plain', 'fa', 'ga', 'fa6', 'img', 'text', 'photo']; }
function getLevelColor(n) {
  const levelColors = [LIGHTBLUE, BLUE, GREEN, YELLOW, 'orange', RED, '#222',
    GREEN, BLUE, PURPLE, YELLOW2, 'deepskyblue', 'deeppink', //** MAXLEVEL 10 */
    TEAL, ORANGE, 'seagreen', FIREBRICK, OLIVE, '#ffd8b1', '#000075', '#a9a9a9', '#ffffff', '#000000', 'gold', 'orangered', 'skyblue', 'pink', 'palegreen', '#e6194B'];
  return levelColors[n - 1];
}
function getLine(ctx, list, val) {
  let res = list.filter(p => isWithinDelta(p.y, val, 2) && (isLightBeforeV(ctx, p.x, p.y) || isLightAfterV(ctx, p.x, p.y)));
  let ls = sortBy(res, 'x');
  let segments = [], seg = [];
  let i = -1; let lastx = -1;
  while (++i < ls.length) {
    let el = ls[i];
    if (lastx >= 0 && el.x > lastx + 1) {
      segments.push(seg); seg = [];
    } else {
      if (el.x != lastx) seg.push(el);
    }
    lastx = el.x;
  }
  segments.push(seg);
  let len = 0, best = null;
  for (const s of segments) { if (s.length > len) { len = s.length; best = s } }
  return best;
}
function getLinePixels(x1, y1, x2, y2) {
  [x1, y2, x2, y2] = [x1, y2, x2, y2].map(x => Math.round(x));
  const pixels = [];
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const sx = (x1 < x2) ? 1 : -1;
  const sy = (y1 < y2) ? 1 : -1;
  let err = dx - dy;
  while (true) {
    pixels.push({ x: x1, y: y1 });
    if (Math.round(x1) === Math.round(x2) && Math.round(y1) === Math.round(y2)) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x1 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y1 += sy;
    }
  }
  return pixels;
}
function getLinePixels1(x1, y1, x2, y2) {
  [x1, y2, x2, y2] = [x1, y2, x2, y2].map(x => Math.round(x));
  const pixels = [];
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const sx = (x1 < x2) ? 1 : -1;
  const sy = (y1 < y2) ? 1 : -1;
  let err = dx - dy;
  while (true) {
    pixels.push({ x: x1, y: y1 });
    if (Math.round(x1) === Math.round(x2) && Math.round(y1) === Math.round(y2)) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x1 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y1 += sy;
    }
  }
  return pixels;
}
function getListAndDicts(list) {
  let dicts = {}, lists = [];
  for (const arg of Array.from(arguments).slice(1)) {
    lists.push(list2dict(list, arg));
  }
  return [list].concat(lists);
}
function getListAndDictsForDicolors() {
  let bucketlist = Object.keys(M.dicolor);
  bucketlist = arrCycle(bucketlist, 8);
  let dicolorlist = [];
  for (const bucket of bucketlist) {
    let list = dict2list(M.dicolor[bucket]);
    for (const c of list) {
      let o = w3color(c.value);
      o.name = c.id;
      o.hex = c.value;
      o.bucket = bucket;
      dicolorlist.push(o);
    }
  }
  let byhex = list2dict(dicolorlist, 'hex');
  let byname = list2dict(dicolorlist, 'name');
  return [dicolorlist, byhex, byname];
}
function getMaxWordWidth(words, div) {
  if (!div || !Array.isArray(words)) return 0;
  const span = document.createElement('span');
  span.style.visibility = 'hidden';
  span.style.position = 'absolute';
  span.style.whiteSpace = 'nowrap';
  span.style.top = '-9999px';
  span.style.left = '-9999px';
  const computedStyle = window.getComputedStyle(div);
  span.style.font = computedStyle.font;
  span.style.fontSize = computedStyle.fontSize;
  span.style.fontFamily = computedStyle.fontFamily;
  span.style.fontWeight = computedStyle.fontWeight;
  span.style.letterSpacing = computedStyle.letterSpacing;
  span.style.wordSpacing = computedStyle.wordSpacing;
  span.style.textTransform = computedStyle.textTransform;
  document.body.appendChild(span);
  let maxWidth = 0;
  for (const word of words) {
    span.textContent = word;
    const width = span.offsetWidth;
    if (width > maxWidth) {
      maxWidth = width;
    }
  }
  document.body.removeChild(span);
  return maxWidth;
}
function getMenu() { return isdef(Menu) ? Menu.key : null; }
function getMotto() {
  let list = [
    `Let's play!`, 'Enjoy this beautiful space!', 'First vacation day!', 'No place like home!',
    'You are free!', 'Nothing to do here!', `Don't worry, be happy!`, `Good times ahead!`,
    'Right here, right now', 'Life is a dream', 'Dream away!', 'Airport forever', 'All is well',
    `Let the world spin!`
  ];
  return rChoose(list);
}
function getMouseCoordinates(event) {
  const image = event.target;
  const offsetX = event.clientX +
    (window.scrollX !== undefined ? window.scrollX : (document.documentElement || document.body.parentNode || document.body).scrollLeft) -
    12;
  const offsetY = event.clientY +
    (window.scrollY !== undefined ? window.scrollY : (document.documentElement || document.body.parentNode || document.body).scrollTop) -
    124;
  return { x: offsetX, y: offsetY };
}
function getMouseCoordinatesRelativeToElement(ev, elem) {
  if (nundef(elem)) elem = ev.target;
  const rect = elem.getBoundingClientRect();
  const x = ev.clientX - rect.left;
  const y = ev.clientY - rect.top;
  return { x, y };
}
function getMyColors1() {
  const colors = [
    { hex: '#336699', name: 'Dark Slate Blue', bucket: 'blue' },
    { hex: '#3366cc', name: 'Royal Blue', bucket: 'blue' },
    { hex: '#000099', name: 'Dark Blue', bucket: 'blue' },
    { hex: '#0000cc', name: 'Medium Blue', bucket: 'blue' },
    { hex: '#000066', name: 'Navy Blue', bucket: 'blue' },
    { hex: '#006666', name: 'Medium Teal', bucket: 'cyanblue' },
    { hex: '#006699', name: 'Sea Bluegreen', bucket: 'cyanblue' },
    { hex: '#0099cc', name: 'Deep Sky Blue', bucket: 'cyanblue' },
    { hex: '#0066cc', name: 'Dodger Blue', bucket: 'cyanblue' },
    { hex: '#0033cc', name: 'Bright Blue', bucket: 'blue' },
    { hex: '#3333ff', name: 'Electric Blue', bucket: 'blue' },
    { hex: '#009999', name: 'Strong Cyan', bucket: 'cyan' },
    { hex: '#33cccc', name: 'Sea Sky', bucket: 'cyan' },
    { hex: '#0099ff', name: 'Spring Sky', bucket: 'cyanblue' },
    { hex: '#0066ff', name: 'Brilliant Blue', bucket: 'cyanblue' },
    { hex: '#3366ff', name: 'Summer Sky', bucket: 'blue' },
    { hex: '#3333cc', name: 'Indigo Sky', bucket: 'blue' },
    { hex: '#339966', name: 'Sea Green', bucket: 'greencyan' },
    { hex: '#00ffcc', name: 'Aquagreen', bucket: 'cyan' },
    { hex: '#33ccff', name: 'Light Sky Blue', bucket: 'cyanblue' },
    { hex: '#6699ff', name: 'Light Royal Blue', bucket: 'blue' },
    { hex: '#6600ff', name: 'Vivid Violet', bucket: 'bluemagenta' },
    { hex: '#6600cc', name: 'Deep Purple', bucket: 'bluemagenta' },
    { hex: '#339933', name: 'Forest Green', bucket: 'green' },
    { hex: '#00cc66', name: 'Medium Spring Green', bucket: 'greencyan' },
    { hex: '#00ff99', name: 'Spring Green', bucket: 'greencyan' },
    { hex: '#66ffcc', name: 'Light Aqua', bucket: 'cyan' },
    { hex: '#66ffff', name: 'bleach', bucket: 'cyan' },
    { hex: '#66ccff', name: 'Light Azure', bucket: 'cyanblue' },
    { hex: '#99ccff', name: 'Pale Sky Blue', bucket: 'cyanblue' },
    { hex: '#9999ff', name: 'Pale Lilac', bucket: 'bluemagenta' },
    { hex: '#9966ff', name: 'Medium Violet', bucket: 'bluemagenta' },
    { hex: '#9933ff', name: 'Electric Lilac', bucket: 'bluemagenta' },
    { hex: '#9900ff', name: 'Bright Violet', bucket: 'bluemagenta' },
    { hex: '#00cc00', name: 'Lime Green', bucket: 'green' },
    { hex: '#66ff99', name: 'Spearmint', bucket: 'greencyan' },
    { hex: '#99ffcc', name: 'Pale Mint', bucket: 'greencyan' },
    { hex: '#ccffff', name: 'Very Pale Cyan', bucket: 'cyan' },
    { hex: '#cc66ff', name: 'Medium Orchid', bucket: 'magenta' },
    { hex: '#cc33ff', name: 'Bright Orchid', bucket: 'magenta' },
    { hex: '#9900cc', name: 'Dark Violet', bucket: 'bluemagenta' },
    { hex: '#003300', name: 'Dark Green', bucket: 'green' },
    { hex: '#009933', name: 'Jungle Green', bucket: 'green' },
    { hex: '#33cc33', name: 'Light Green', bucket: 'green' },
    { hex: '#99ff99', name: 'Pale Green', bucket: 'green' },
    { hex: '#ccffcc', name: 'Very Pale Green', bucket: 'green' },
    { hex: '#ffccff', name: 'Rosa', bucket: 'magenta' },
    { hex: '#ffcccc', name: 'Pale Pink', bucket: 'magenta' },
    { hex: '#ff99ff', name: 'Light Pink', bucket: 'magenta' },
    { hex: '#ff66ff', name: 'Magentapink', bucket: 'magenta' },
    { hex: '#660066', name: 'Purple', bucket: 'magenta' },
    { hex: '#336600', name: 'Young Olive', bucket: 'green' },
    { hex: '#009900', name: 'Strong Green', bucket: 'green' },
    { hex: '#66ff33', name: 'Spring Leaf', bucket: 'yellowgreen' },
    { hex: '#99ff66', name: 'Light Lime', bucket: 'yellowgreen' },
    { hex: '#ccff99', name: 'Very Light Green', bucket: 'yellowgreen' },
    { hex: '#cc0099', name: 'Strong Magenta', bucket: 'magenta' },
    { hex: '#993399', name: 'Dark Magenta', bucket: 'magenta' },
    { hex: '#333300', name: 'Very Dark Olive', bucket: 'green' },
    { hex: '#669900', name: 'Olive Drab', bucket: 'yellowgreen' },
    { hex: '#99ff33', name: 'Light Chartreuse', bucket: 'yellowgreen' },
    { hex: '#ccff66', name: 'Pale Yellow Green', bucket: 'yellowgreen' },
    { hex: '#ff6699', name: 'Light Red Violet', bucket: 'magenta' },
    { hex: '#ff3399', name: 'Deep Pink', bucket: 'magenta' },
    { hex: '#cc3399', name: 'Medium Red Violet', bucket: 'magenta' },
    { hex: '#990099', name: 'Dark Red Violet', bucket: 'magenta' },
    { hex: '#99cc00', name: 'Lime', bucket: 'yellowgreen' },
    { hex: '#ccff33', name: 'Light Lime Green', bucket: 'yellowgreen' },
    { hex: '#ffcc66', name: 'Light Orange', bucket: 'orangeyellow' },
    { hex: '#ff6666', name: 'Dark Salmon', bucket: 'red' },
    { hex: '#ff0066', name: 'Hot Pink', bucket: 'magenta' },
    { hex: '#cc6699', name: 'Medium Pink', bucket: 'magenta' },
    { hex: '#993366', name: 'Dark Mauve', bucket: 'magenta' },
    { hex: '#ff5050', name: 'Strawberry', bucket: 'red' },
    { hex: '#cc0066', name: 'Vivid Raspberry', bucket: 'magenta' },
    { hex: '#660033', name: 'Dark Red', bucket: 'red' },
    { hex: '#996633', name: 'Medium Brown', bucket: 'orange' },
    { hex: '#cc6600', name: 'Orange Brown', bucket: 'orange' },
    { hex: '#ff3300', name: 'Red Orange', bucket: 'orangered' },
    { hex: '#cc0000', name: 'Jolly Red', bucket: 'red' },
    { hex: '#990033', name: 'Dark Crimson', bucket: 'red' },
    { hex: '#663300', name: 'Darkbrown', bucket: 'orange' },
    { hex: '#cc3300', name: 'Carrot', bucket: 'orangered' },
    { hex: '#993333', name: 'Indian Red', bucket: 'red' },
    { hex: '#fc600a', name: 'Tangerine', bucket: 'orange' },
    { hex: '#fccc1a', name: 'Bright Yellow', bucket: 'yellow' },
    { hex: '#b2d732', name: 'Lime Green', bucket: 'yellowgreen' },
    { hex: '#4424d6', name: 'Violetblue', bucket: 'bluemagenta' },
    { hex: '#c21460', name: 'Raspberry', bucket: 'magenta' },
    { hex: '#afff45', name: 'Apple Green', bucket: 'yellowgreen' },
    { hex: '#42d4f4', name: 'Sky Blue', bucket: 'cyanblue' },
    { hex: '#ffe119', name: 'Sunshine Yellow', bucket: 'yellow' },
    { hex: '#e6194b', name: 'Deep Raspberry', bucket: 'red' },
    { hex: '#3cb44b', name: 'Pleasant Green', bucket: 'green' },
    { hex: '#4363d8', name: 'Cobalt Blue', bucket: 'blue' },
    { hex: '#911eb4', name: 'Violet', bucket: 'bluemagenta' },
    { hex: '#fff620', name: 'Buttercup Yellow', bucket: 'yellow' },
    { hex: '#f58231', name: 'Orange', bucket: 'orange' },
    { hex: '#ffd8b1', name: 'Peach', bucket: 'orangeyellow' },
    { hex: '#000075', name: 'Deep Blue', bucket: 'blue' },
    { hex: '#ff6f61', name: 'Watermelon', bucket: 'orangered' },
    { hex: '#c68e17', name: 'Caramel', bucket: 'yellow' },
    { hex: '#f7cac9', name: 'Light Pink', bucket: 'magenta' },
    { hex: '#009b77', name: 'Seaglass', bucket: 'cyan' },
    { hex: '#dd4124', name: 'Rust Red', bucket: 'orangered' },
    { hex: '#d65076', name: 'Blush', bucket: 'magenta' },
    { hex: '#efc050', name: 'Goldenrod', bucket: 'orangeyellow' },
    { hex: '#9b2335', name: 'Carmine', bucket: 'red' },
    { hex: '#e15d44', name: 'Terracotta', bucket: 'orangered' },
    { hex: '#bc243c', name: 'Red', bucket: 'red' },
    { hex: '#c3447a', name: 'Berry Pink', bucket: 'magenta' },
    { hex: '#ffd662', name: 'Banana', bucket: 'orangeyellow' },
    { hex: '#f4b9b8', name: 'Pale Blush', bucket: 'magenta' },
    { hex: '#ff968a', name: 'Light Coral', bucket: 'orangered' },
    { hex: '#83781b', name: 'Olive', bucket: 'yellowgreen' },
    { hex: '#d01013', name: 'Scarlet', bucket: 'red' },
    { hex: '#58a813', name: 'Lawn Green', bucket: 'yellowgreen' },
    { hex: '#fad302', name: 'Golden Yellow', bucket: 'yellow' },
    { hex: '#55038c', name: 'Deep Violet', bucket: 'bluemagenta' },
    { hex: '#ed527a', name: 'Raspberry Pink', bucket: 'magenta' },
    { hex: '#d99559', name: 'Sand', bucket: 'orange' },
    { hex: '#049dd9', name: 'Ocean Blue', bucket: 'cyanblue' },
    { hex: '#ff4057', name: 'Salmon Pink', bucket: 'orangered' },
    { hex: '#00b8a9', name: 'Sea Green', bucket: 'greencyan' },
    { hex: '#f46036', name: 'Orange Red', bucket: 'orangered' },
    { hex: '#e71d36', name: 'Crimson Red', bucket: 'red' },
    { hex: '#2ec4b6', name: 'Aqua', bucket: 'cyan' },
    { hex: '#ffd166', name: 'Apricot', bucket: 'orangeyellow' },
    { hex: '#06d6a0', name: 'Medium Spring Green', bucket: 'greencyan' },
    { hex: '#ef476f', name: 'Pale Red', bucket: 'orangered' },
    { hex: '#26547c', name: 'Winter Blue', bucket: 'blue' },
    { hex: '#ff9f1c', name: 'Vivid Orange', bucket: 'orange' },
    { hex: '#00bbf9', name: 'Bright Sky Blue', bucket: 'cyanblue' },
    { hex: '#118ab2', name: 'Blue Green', bucket: 'cyanblue' },
    { hex: '#073b4c', name: 'Dark Teal', bucket: 'cyanblue' },
    { hex: '#ffd32d', name: 'Bright Yellow', bucket: 'yellow' },
    { hex: '#8338ec', name: 'Bright Purple', bucket: 'bluemagenta' },
    { hex: '#fb5607', name: 'Bright Orange Red', bucket: 'orangered' },
    { hex: '#ff006e', name: 'Hot Magenta', bucket: 'magenta' },
    { hex: '#3a86ff', name: 'Bright Blue', bucket: 'blue' },
    { hex: '#ffbe0b', name: 'Bright Yellow Orange', bucket: 'orangeyellow' },
    { hex: '#ff006e', name: 'Hot Magenta', bucket: 'magenta' },
    { hex: '#f94144', name: 'Strong Red', bucket: 'red' },
    { hex: '#f3722c', name: 'Deep Orange', bucket: 'orangered' },
    { hex: '#9b5de5', name: 'Bright Violet', bucket: 'bluemagenta' },
    { hex: '#f15bb5', name: 'Light Magenta', bucket: 'magenta' },
    { hex: '#fee440', name: 'Bright Yellow', bucket: 'yellow' },
    { hex: '#00f5d4', name: 'Bright Aqua', bucket: 'cyan' },
    { hex: '#7209b7', name: 'Dark Purple', bucket: 'bluemagenta' },
    { hex: '#ff9aa2', name: 'Light Pink', bucket: 'magenta' },
    { hex: '#ffb7b2', name: 'Light Blush', bucket: 'magenta' },
    { hex: '#ffdac1', name: 'Peach Puff', bucket: 'orangeyellow' },
    { hex: '#e2f0cb', name: 'Pale Green', bucket: 'yellowgreen' },
    { hex: '#b5ead7', name: 'Mint Green', bucket: 'greencyan' },
    { hex: '#fddb3a', name: 'Bright Yellow', bucket: 'yellow' },
    { hex: '#f49ac2', name: 'Orchid Pink', bucket: 'magenta' },
    { hex: '#836fff', name: 'Medium Slate Blue', bucket: 'bluemagenta' },
    { hex: '#ffd1dc', name: 'Pale Blush Pink', bucket: 'magenta' },
    { hex: '#a23bec', name: 'Bright Purple', bucket: 'bluemagenta' },
    { hex: '#450920', name: 'Dark Crimson', bucket: 'red' },
    { hex: '#004346', name: 'Dark Cyan', bucket: 'cyan' },
    { hex: '#540b0e', name: 'Dark Maroon', bucket: 'red' },
    { hex: '#0b132b', name: 'Dark Blue', bucket: 'blue' },
    { hex: '#3c1874', name: 'Deep Purple', bucket: 'bluemagenta' },
    { hex: '#08415c', name: 'Dark Cyan Blue', bucket: 'cyanblue' },
    { hex: '#650d1b', name: 'Deep Red', bucket: 'red' },
    { hex: '#005f73', name: 'Teal Blue', bucket: 'cyanblue' },
    { hex: '#6622cc', name: 'Bright Violet', bucket: 'bluemagenta' },
    { hex: '#6a040f', name: 'Dark Red', bucket: 'red' },
    { hex: '#230c33', name: 'Dark Purple', bucket: 'bluemagenta' },
    { hex: '#3a0ca3', name: 'Dark Violet', bucket: 'bluemagenta' },
    { hex: '#240046', name: 'Very Dark Violet', bucket: 'bluemagenta' },
    { hex: '#10002b', name: 'Midnight Purple', bucket: 'bluemagenta' }
  ];
  let res = [];
  for (const c of colors) {
    let o = w3color(c.hex);
    o.name = transformColorName(c.name);
    o.bucket = c.bucket;
    o.hex = c.hex;
    res.push(o)
  }
  return res;
}
function getMyColors2() {
  const colors = [
    { hex: '#669999', name: 'Desaturated Cyan', bucket: 'cyan' },
    { hex: '#666699', name: 'Dark Lavender', bucket: 'bluemagenta' },
    { hex: '#ffffff', name: 'White', bucket: 'black' },
    { hex: '#a9a9a9', name: 'Dark Gray', bucket: 'blue' },
    { hex: '#000000', name: 'Black', bucket: 'black' },
    { hex: '#cb99c9', name: 'Lavender Pink', bucket: 'magenta' },
    { hex: '#aec6cf', name: 'Pastel Blue', bucket: 'cyanblue' },
    { hex: '#dea5a4', name: 'Pastel Red', bucket: 'red' },
    { hex: '#779ecb', name: 'Periwinkle', bucket: 'bluemagenta' },
    { hex: '#b39eb5', name: 'Pastel Purple', bucket: 'bluemagenta' },
    { hex: '#cfcfc4', name: 'Light Gray', bucket: 'black' },
    { hex: '#666633', name: 'Dark Olive Green', bucket: 'yellowgreen' },
    { hex: '#999966', name: 'Pale Olive', bucket: 'yellowgreen' },
    { hex: '#347c98', name: 'Steel Blue', bucket: 'cyanblue' },
    { hex: '#469990', name: 'Teal', bucket: 'cyan' },
    { hex: '#6b5b95', name: 'Royal Purple', bucket: 'bluemagenta' },
    { hex: '#88b04b', name: 'Lime Green', bucket: 'yellowgreen' },
    { hex: '#92a8d1', name: 'Pale Blue', bucket: 'cyanblue' },
    { hex: '#955251', name: 'Rosewood', bucket: 'red' },
    { hex: '#b565a7', name: 'Orchid', bucket: 'magenta' },
    { hex: '#45b8ac', name: 'Medium Turquoise', bucket: 'cyan' },
    { hex: '#5b5ea6', name: 'Medium Blue', bucket: 'blue' },
    { hex: '#dfcfbe', name: 'Beige Grey', bucket: 'yellow' },
    { hex: '#55b4b0', name: 'Dark Turquoise', bucket: 'cyan' },
    { hex: '#7fcdcd', name: 'Light Cyan', bucket: 'cyan' },
    { hex: '#98b4d4', name: 'Pale Blue', bucket: 'cyanblue' },
    { hex: '#8d9440', name: 'Olive', bucket: 'yellowgreen' },
    { hex: '#a4b086', name: 'Sage Green', bucket: 'yellowgreen' },
    { hex: '#774d8e', name: 'Purple', bucket: 'bluemagenta' },
    { hex: '#6e81a0', name: 'Slate Blue', bucket: 'cyanblue' },
    { hex: '#5a7247', name: 'Military Green', bucket: 'yellowgreen' },
    { hex: '#d2c29d', name: 'Pale Tan', bucket: 'yellow' },
    { hex: '#f2e2e0', name: 'Very Pale Pink', bucket: 'magenta' },
    { hex: '#e1ede9', name: 'Very Pale Cyan', bucket: 'cyan' },
    { hex: '#5e3d26', name: 'Dark Brown', bucket: 'orange' },
    { hex: '#a65f46', name: 'Copper Brown', bucket: 'orange' },
    { hex: '#48bf84', name: 'Light Emerald', bucket: 'greencyan' },
    { hex: '#90be6d', name: 'Light Olive Green', bucket: 'yellowgreen' },
    { hex: '#577590', name: 'Airforce Greyblue', bucket: 'blue' },
    { hex: '#c7ceea', name: 'Lavender Blue', bucket: 'bluemagenta' },
    { hex: '#2b2d42', name: 'Gun Grey', bucket: 'blue' },
    { hex: '#3f3351', name: 'Dark Lavender', bucket: 'bluemagenta' },
    { hex: '#423629', name: 'Dark Taupe', bucket: 'orange' },
    { hex: '#283618', name: 'Dark Olive', bucket: 'yellowgreen' },
    { hex: '#462255', name: 'Purple', bucket: 'bluemagenta' },
    { hex: '#1b263b', name: 'Prussian Blue', bucket: 'blue' },
    { hex: '#353535', name: 'Dark Gray', bucket: 'black' },
    { hex: '#101820', name: 'Eerie Black', bucket: 'black' },
    { hex: '#1a1423', name: 'Raisin Black', bucket: 'black' },
    { hex: '#4a4e69', name: 'Independence2', bucket: 'bluemagenta' },
    { hex: '#264653', name: 'Greengrey', bucket: 'cyanblue' }
  ];
  let res = [];
  for (const c of colors) {
    let o = w3color(c.hex);
    o.name = transformColorName(c.name);
    o.bucket = c.bucket;
    o.hex = c.hex;
    res.push(o)
  }
  return res;
}
function getNavBg() { return mGetStyle('dNav', 'bg'); }
function getNow() { return Math.floor(Date.now() / 1000); }
function getO(n, R) { let oid = n.oid; if (isdef(oid)) return R.getO(oid); else return null; }
function getPaletteFromCanvas(canvas) {
  if (nundef(ColorThiefObject)) ColorThiefObject = new ColorThief();
  const dataUrl = canvas.toDataURL();
  const img = new Image();
  img.src = dataUrl;
  return new Promise((resolve, reject) => {
    img.onload = () => {
      const palette = ColorThiefObject.getPalette(img);
      resolve(palette ? palette.map(x => colorFrom(x)) : ['black', 'white']);
    };
    img.onerror = () => {
      reject(new Error('Failed to load the image from canvas.'));
    };
  });
}
function getParams(areaName, oSpec, oid) {
  let params = oSpec.params ? oSpec.params : {};
  let panels = oSpec.panels ? oSpec.panels : [];
  let num = panels.length;
  let or = params.orientation ? params.orientation == 'h' ? 'rows'
    : 'columns' : DEF_ORIENTATION;
  let split = params.split ? params.split : DEF_SPLIT;
  let bg = oSpec.color ? oSpec.color : randomColor();
  let fg = bg ? colorIdealText(bg) : null;
  let id = oSpec.id ? oSpec.id : areaName;
  if (oid) { id = getDynId(id, oid); }
  let parent = mBy(areaName);
  if (oSpec.id) {
    parent.id = id;
    addAREA(id, oSpec);
    parent.innerHTML = id;
  }
  if (bg) { mColor(parent, bg, fg); }
  return [num, or, split, bg, fg, id, panels, parent];
}
function getPixRgb(ctx, x, y) {
  var pix = ctx.getImageData(x, y, 1, 1).data;
  var red = pix[0]; var green = pix[1]; var blue = pix[2];
  return { r: red, g: green, b: blue };
}
function getPixTL(img) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, 1, 1).data;
  const r = imageData[0];
  const g = imageData[1];
  const b = imageData[2];
  const a = imageData[3] / 255;
  const color = { r, g, b, a };
  return color;
}
function getPixelKey(pix) { return getXYKey(pix.x, pix.y); }
function getPlayerProp(prop, name) { let pl = T.players[valf(name, getUname())]; return pl[prop]; }
function getPlayersWithMaxScore(table) {
  let list = dict2list(table.players, 'name');
  list = sortByDescending(list, 'score');
  maxlist = arrTakeWhile(list, x => x.score == list[0].score);
  return maxlist.map(x => x.name);
}
function getPlaymode(idOrTable, name) {
  if (isDict(idOrTable)) {
    let table = idOrTable;
    return table.players[name].playmode;
  } else if (T) {
    return T.id == idOrTable ? T.players[name].playmode : 'wrong table';
  } else return 'NO table!';
}
function getPoly(offsets, x, y, w, h) {
  let poly = [];
  for (let p of offsets) {
    let px = Math.round(x + p[0] * w);
    let py = Math.round(y + p[1] * h);
    poly.push({ x: px, y: py });
  }
  return poly;
}
function getPolyNeighbors(poly) {
  const neighbors = poly.getAttribute('data-neighbors').split(','); //console.log(neighbors);
  return neighbors.map(x => mBy(x));
}
function getPolygonCentersFromG(gElement) {
  if (typeof gElement === 'string') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<svg>${gElement}</svg>`, 'image/svg+xml');
    gElement = doc.querySelector('g');
  }
  const polygons = gElement.querySelectorAll('polygon');
  const centers = [];
  polygons.forEach(polygon => {
    const pointsStr = polygon.getAttribute('points').trim();
    const points = pointsStr.split(/\s+/).map(pair => {
      const [x, y] = pair.split(',').map(Number);
      return { x, y };
    });
    let area = 0;
    let cx = 0;
    let cy = 0;
    for (let i = 0; i < points.length; i++) {
      const { x: x0, y: y0 } = points[i];
      const { x: x1, y: y1 } = points[(i + 1) % points.length];
      const cross = x0 * y1 - x1 * y0;
      area += cross;
      cx += (x0 + x1) * cross;
      cy += (y0 + y1) * cross;
    }
    area /= 2;
    cx /= (6 * area);
    cy /= (6 * area);
    centers.push({ x: cx, y: cy });
  });
  return centers;
}
function getPresentableDetails(o) {
  if (!o || nundef(M.details[o.key])) return null;
  let di = {};
  for (const key in o) {
    if ('cats colls fa fa6 img photo text key friendly ga name'.includes(key)) continue;
    let val = o[key];
    if (!isLiteral(val)) continue;
    di[key] = val;
  }
  return di;
}
function getQuadCornerList(x, y, sz) { return [x, y, x + sz, y, x + sz, y + sz, x, y + sz]; }
function getQuadCorners(x, y, sz) {
  let res = {};
  let list = getQuadCornerList(x, y, sz);
  for (let i = 0; i < list.length / 2; i++) {
    let id = `c${list[2 * i]}_${list[2 * i + 1]}`;
    res[id] = { x: list[2 * i], y: list[2 * i + 1] }
  }
  return res;
}
function getQuadPoly(x, y, w, h) {
  q = [[0.5, -0.5], [0.5, 0.5], [-0.5, 0.5], [-0.5, -0.5]];
  return getPoly(q, x, y, w, h);
}
function getQuadSegments(x, y, sz) {
  let res = {};
  let list = getQuadCornerList(x, y, sz);
  for (let i = 0; i < list.length / 2; i++) {
    let x1 = list[2 * i];
    let y1 = list[2 * i + 1];
    let x2 = list[2 * ((i + 1) % 6)];
    let y2 = list[2 * ((i + 1) % 6) + 1];
    let id = `s${x1}_${y1}_${x2}_${y2}`;
    res[id] = { x1, y1, x2, y2 }
  }
  return res;
}
function getRadioValue(prop) {
  let fs = mBy(`d_${prop}`);
  if (nundef(fs)) return null;
  let val = getCheckedRadios(fs)[0];
  return isNumber(val) ? Number(val) : val;
}
function getRandomFromArray(array) { return (array[randomIndex(array) | 0]) }
function getRect(elem, relto) {
  if (isString(elem)) elem = document.getElementById(elem);
  let res = elem.getBoundingClientRect();
  if (isdef(relto)) {
    let b2 = relto.getBoundingClientRect();
    let b1 = res;
    res = {
      x: b1.x - b2.x,
      y: b1.y - b2.y,
      left: b1.left - b2.left,
      top: b1.top - b2.top,
      right: b1.right - b2.right,
      bottom: b1.bottom - b2.bottom,
      width: b1.width,
      height: b1.height
    };
  }
  let r = { x: res.left, y: res.top, w: res.width, h: res.height };
  addKeys({ l: r.x, t: r.y, r: r.x + r.w, b: r.y + r.h }, r);
  return r;
}
function getRectInt(elem, relto) {
  if (isString(elem)) elem = document.getElementById(elem);
  let res = elem.getBoundingClientRect();
  if (isdef(relto)) {
    let b2 = relto.getBoundingClientRect();
    let b1 = res;
    res = {
      x: b1.x - b2.x,
      y: b1.y - b2.y,
      left: b1.left - b2.left,
      top: b1.top - b2.top,
      right: b1.right - b2.right,
      bottom: b1.bottom - b2.bottom,
      width: b1.width,
      height: b1.height
    };
  }
  let r4 = { x: Math.round(res.left), y: Math.round(res.top), w: Math.round(res.width), h: Math.round(res.height) };
  extendRect(r4);
  return r4;
}
function getRelCoords(ev, elem) {
  let x = ev.pageX - elem.offset().left;
  let y = ev.pageY - elem.offset().top;
  return { x: x, y: y };
}
function getSegments(x, y, sz, npoly = 6) {
  let func = { 4: getQuadCornerList, 6: getHexCornerList }[npoly];
  let res = {};
  let list = func(x, y, sz);
  for (let i = 0; i < list.length / 2; i++) {
    let x1 = list[2 * i];
    let y1 = list[2 * i + 1];
    let x2 = list[2 * ((i + 1) % npoly)];
    let y2 = list[2 * ((i + 1) % npoly) + 1];
    if (x1 > x2) { [x1, x2] = [x2, x1];[y1, y2] = [y2, y1]; }
    else if (x1 == x2 && y1 > y2) { [x1, x2] = [x2, x1];[y1, y2] = [y2, y1]; }
    let id = `s${x1}_${y1}_${x2}_${y2}`;
    res[id] = { x1, y1, x2, y2 }
  }
  return res;
}
function getSeparators(allowed) {
  let specialChars = toLetters(' ,-.!?;:');
  if (isdef(allowed)) specialChars = arrMinus(specialChars, toLetters(allowed));
  return specialChars;
}
function getServer(isScript = null) {
  let sessionType = detectSessionType();
  let server = sessionType == 'fastcomet' ? 'https://moxito.online/' : isScript || sessionType == 'php' ? 'http://localhost:8080/mox/' : '../';
  return server;
}
function getServerurl(port = 3000) {
  let type = detectSessionType();
  let server = type == 'vps' ? 'https://server.vidulusludorum.com' : `http://localhost:${port}`;
  return server;
}
function getSetOfDifferentTypesOfPoints(points) {
  let types = new Set(); for (const p of points) types.add(p.type); return types;
}
function getStyleProp(elem, prop) { return getComputedStyle(elem).getPropertyValue(prop); }
function getSuperdi(key) { return valf(M.superdi[key], {}); }
function getTable() { assertion(!Tid, `getTable!!! ${T.id} !!! ${Tid}`); return T; }
async function getTableNames() {
  const names = await api('GET', '/get_table_names');
  console.log(names);
}
function getTessSvgFacesVerts(TessClass, cols = 3, rows = 3, options = {}) {
  addKeys({
    function: planeFunction,
    u_range: [0.0, 1.0],
    v_range: [0.0, 1.0],
    u_num: cols,
    v_num: rows,
    u_cyclic: false,
    v_cyclic: false,
    adaptor_class: SvgAdaptor
  }, options);
  const tessagon = new TessClass(options);
  const gCode = tessagon.create_mesh();
  const faces = tessagon.mesh_adaptor.face_list;
  const verts = tessagon.mesh_adaptor.vert_list;
  return { tessagon, faces, verts, gCode };
}
/**
 * Create an SVG tessellation of the given tessagon class inside the given div, applying styles, and return the polygons.
 * @param {HTMLElement|string} dParent - The container div or its id.
 * @param {Function} TessClass - The tessagon class constructor (e.g. HexTessagon).
 * @param {Object} [styles={}] - Optional styles to apply to each polygon (e.g. {fill: 'orange', stroke: 'black'}).
 * @param {Object} [options={}] - Optional tessellation options (cols, rows, etc).
 * @returns {NodeListOf<SVGPolygonElement>} The list of SVG polygon elements created.
 */
function getTessagonDict() {
  return {
    BigHexTriTessagon: BigHexTriTessagon,
    BrickTessagon: BrickTessagon,
    CloverdaleTessagon: CloverdaleTessagon,
    DissectedHexQuadTessagon: DissectedHexQuadTessagon,
    DissectedHexTriTessagon: DissectedHexTriTessagon,
    DissectedSquareTessagon: DissectedSquareTessagon,
    DissectedTriangleTessagon: DissectedTriangleTessagon,
    DodecaTessagon: DodecaTessagon,
    DodecaTriTessagon: DodecaTriTessagon,
    FloretTessagon: FloretTessagon,
    HexBigTriTessagon: HexBigTriTessagon,
    HexSquareTriTessagon: HexSquareTriTessagon,
    HexTessagon: HexTessagon,
    HexTriTessagon: HexTriTessagon,
    IslamicHexStarsTessagon: IslamicHexStarsTessagon,
    IslamicStarsCrossesTessagon: IslamicStarsCrossesTessagon,
    OctoTessagon: OctoTessagon,
    PentaTessagon: PentaTessagon,
    Penta2Tessagon: Penta2Tessagon,
    PythagoreanTessagon: PythagoreanTessagon,
    RhombusTessagon: RhombusTessagon,
    SquareTessagon: SquareTessagon,
    SquareTriTessagon: SquareTriTessagon,
    SquareTri2Tessagon: SquareTri2Tessagon,
    StanleyParkTessagon: StanleyParkTessagon,
    TriTessagon: TriTessagon,
    ValemountTessagon: ValemountTessagon,
    WeaveTessagon: WeaveTessagon,
    ZigZagTessagon: ZigZagTessagon,
  };
}
function getTessagonList() {
  return [
    'BigHexTriTessagon',
    'BrickTessagon',
    'CloverdaleTessagon',
    'DissectedHexQuadTessagon',
    "DissectedHexTriTessagon",
    "DissectedSquareTessagon",
    "DissectedTriangleTessagon",
    "DodecaTessagon",
    "DodecaTriTessagon",
    "FloretTessagon",
    "HexBigTriTessagon",
    "HexSquareTriTessagon",
    "HexTessagon",
    "HexTriTessagon",
    "IslamicHexStarsTessagon",
    "IslamicStarsCrossesTessagon",
    "OctoTessagon",
    "PentaTessagon",
    "Penta2Tessagon",
    "PythagoreanTessagon",
    "RhombusTessagon",
    "SquareTessagon",
    "SquareTriTessagon",
    "SquareTri2Tessagon",
    "StanleyParkTessagon",
    "TriTessagon",
    "ValemountTessagon",
    "WeaveTessagon",
    "ZigZagTessagon",
  ];
}
function getTextureStyle(bg, t) {
  let bgRepeat = t.includes('marble_') || t.includes('wall') ? 'no-repeat' : 'repeat';
  let bgSize = t.includes('marble_') || t.includes('wall') ? `cover` : t.includes('ttrans') ? '' : 'auto';
  let bgImage = `url('${t}')`;
  let bgBlend = t.includes('ttrans') ? 'normal' : (t.includes('marble_') || t.includes('wall')) ? 'luminosity' : 'multiply';
  return { bg, bgImage, bgSize, bgRepeat, bgBlend };
}
async function getTextures() {
  M.textures = (await mGetFiles(`../assets/textures`)).map(x => `../assets/textures/${x}`);
  return M.textures;
}
function getThemeDark() { return getCSSVariable('--bgNav'); }
function getThemeFg() { return getCSSVariable('--fgButton'); }
function getTid() { return Tid; }
function getTimestamp() { return Date.now(); }
function getTriangleDownPoly(x, y, w, h) {
  let tridown = [[-0.5, 0.5], [0.5, 0.5], [-0.5, 0.5]];
  return getPoly(tridown, x, y, w, h);
}
function getTriangleUpPoly(x, y, w, h) {
  let triup = [[0, -0.5], [0.5, 0.5], [-0.5, 0.5]];
  return getPoly(triup, x, y, w, h);
}
function getTurnPlayers(table) {
  return table.turn.join(', ');
}
function getTypeOf(param) {
  let type = typeof param;
  if (type == 'string') {
    return 'string';
  }
  if (type == 'object') {
    type = param.constructor.name;
    if (startsWith(type, 'SVG')) type = stringBefore(stringAfter(type, 'SVG'), 'Element').toLowerCase();
    else if (startsWith(type, 'HTML')) type = stringBefore(stringAfter(type, 'HTML'), 'Element').toLowerCase();
  }
  let lType = type.toLowerCase();
  if (lType.includes('event')) type = 'event';
  return type;
}
function getUID(pref = '') {
  UIDCounter += 1;
  return pref + '_' + UIDCounter;
}
function getUname() { return U.name; }
function getWaitingHtml(sz = 30) { return `<img src="../assets/icons/active_player.gif" height="${sz}" style="margin:0px ${sz / 3}px" />`; }
function getXYKey(x, y) { return [x, y]; }
function globalKeyHandling() {
  DA.hotkeys = {};
  DA.keysToCheck = {};
  document.addEventListener('keydown', keyDownHandler);
  document.addEventListener('keyup', keyUpHandler);
  document.addEventListener('keydown', hotkeyHandler);
}
function groupByProperty(list, prop) {
  const groups = {};
  list.forEach(obj => {
    const key = obj[prop];
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(obj);
  });
  return Object.values(groups);
}
function hFunc(content, funcname, arg1, arg2, arg3) {
  let html = `<a style='color:blue' href="javascript:${funcname}('${arg1}','${arg2}','${arg3}');">${content}</a>`;
  return html;
}
function hPrepUi(ev, areas, cols, rows, bg, dParent) {
  hToggleClassMenu(ev); mClear(dParent);
  let d = mDom(dParent, { w: '100%', h: '100%' });
  let names = mAreas(d, areas, cols, rows);
  DA.divNames = Array.from(new Set(DA.divNames.concat(names))); if (VERBOSE) console.log(DA.divNames);
  mStyle('dPage', { bg });
}
function hToggleClassMenu(ev) {
  let elem = findAncestorWith(ev.target, { attribute: 'menu' });
  if (mHasClass(elem, 'active')) return [elem, elem];
  let menu = elem.getAttribute('menu');
  let others = mBy(`[menu='${menu}']`, 'query').filter(x => x != elem);
  let prev = null;
  for (const o of others) {
    assertion(o != elem);
    if (mHasClass(o, 'active')) { prev = o; mClassRemove(o, 'active'); }
  }
  mClass(elem, 'active');
  return [prev, elem];
}
function handleVisibilityChange() {
  if (document.visibilityState === "hidden") {
    console.log('HIDDEN!!!')
    if (pollIsOn()) DA.pollHidden = true;
    pollOff();
  } else if (DA.pollHidden) {
    console.log('VISIBLE!!!');
    delete DA.pollHidden;
    pollOn(true);
  }
}
function hex1Centers(rows, cols, wCell = 100, hCell = null) {
  let colarr = _calc_hex_col_array(rows, cols);
  let maxcols = arrMax(colarr);
  if (nundef(hCell)) hCell = (hCell / .866);
  let hline = hCell * .75;
  let offX = wCell / 2, offY = hCell / 2;
  let centers = [];
  let x = 0; y = 0;
  for (let r = 0; r < colarr.length; r++) {
    let n = colarr[r];
    for (let c = 0; c < n; c++) {
      let dx = (maxcols - n) * wCell / 2;
      let dy = r * hline;
      let center = { x: dx + c * wCell + offX, y: dy + offY };
      centers.push(center);
    }
  }
  return [centers, wCell * maxcols, hCell / 4 + rows * hline];
}
function hexBoardCenters(topside, side) {
  if (nundef(topside)) topside = 4;
  if (nundef(side)) side = topside;
  let [rows, maxcols] = [side + side - 1, topside + side - 1];
  assertion(rows % 2 == 1, `hex with even rows ${rows} top:${topside} side:${side}!`);
  let centers = [];
  let cols = topside;
  let y = 0.5;
  for (i of range(rows)) {
    let n = cols;
    let x = (maxcols - n) / 2 + .5;
    for (const c of range(n)) {
      centers.push({ x, y, row: i + 1, col: x * 2 }); x++;
    }
    y += .75
    if (i < (rows - 1) / 2) cols += 1; else cols -= 1;
  }
  assertion(cols == topside - 1, `END OF COLS WRONG ${cols}`)
  return { centers, rows, maxcols };
}
function hexCenters(rows, cols, wCell = 100, hCell) {
  if (nundef(hCell)) hCell = (hCell / .866);
  let hline = hCell * .75;
  let offX = wCell / 2, offY = hCell / 2;
  let centers = [];
  let startSmaller = Math.floor(rows / 2) % 2 == 1;
  let x = 0; y = 0;
  for (let r = 0; r < rows; r++) {
    let isSmaller = startSmaller && r % 2 == 0 || !startSmaller && r % 2 == 1;
    let curCols = isSmaller ? cols - 1 : cols;
    let dx = isSmaller ? wCell / 2 : 0;
    dx += offX;
    for (let c = 0; c < curCols; c++) {
      let center = { x: dx + c * wCell, y: offY + r * hline };
      centers.push(center);
    }
  }
  return [centers, wCell * cols, hCell / 4 + rows * hline];
}
function hexFromCenter(dParent, center, styles = {}, opts = {}) {
  let [w, h] = mSizeSuccession(styles, 40);
  let [left, top] = [center.x - w / 2, center.y - h / 2];
  let d = mDom(dParent, { w, h, position: 'absolute', left, top, 'clip-path': 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }, opts);
  mStyle(d, styles);
  return d;
}
function hide(elem) {
  if (isString(elem)) elem = document.getElementById(elem);
  if (nundef(elem)) return;
  if (isSvg(elem)) {
    elem.setAttribute('style', 'visibility:hidden;display:none');
  } else {
    elem.style.display = 'none';
  }
}
function highlightHotspots(ev) {
  let [x, y] = [ev.clientX, ev.clientY];
  let els = allElementsFromPoint(x, y);
  let endPoints = [], possiblePairs = [];
  for (const elem of els) {
    let p = B.hotspotDict[elem.id];
    if (isdef(p)) {
      addIf(endPoints, p.start);
      addIf(endPoints, p.end);
      let pair = [p.start, p.end]; pair.sort();
      addIf(possiblePairs, pair.join(','));
    }
  }
  stopPulsing(endPoints);
  startPulsing(endPoints);
  B.endPoints = endPoints;
  B.selectedPoints = [];
  B.possiblePairs = possiblePairs;
}
function highlightPlayerItem(item) { mStyle(iDiv(item), { bg: MGetUserColor(item.name), fg: 'white', border: `white` }); }
async function homeOnclickDeleteBlog() {
  let ta = mByTag('textarea');
  if (nundef(ta)) return;
  let val = ta.value;
  let me = getUname();
  if (isEmptyOrWhiteSpace(val)) return;
  U.blog = [];
  await postUserChange();
}
async function homeOnclickEditBlog() {
  let ta = mByTag('textarea');
  if (nundef(ta)) return;
  ta.value = U.blog.map(x => x.text).join('\n');
}
async function homeOnclickSaveBlog() {
  let ta = mByTag('textarea');
  if (nundef(ta)) return;
  let val = ta.value;
  let me = getUname();
  if (isEmptyOrWhiteSpace(val)) return;
  lookupAddToList(U, ['blog'], { text: val, ts: getNow() });
  await postUserChange();
}
function homeSidebar(wmin = 150) {
  mStyle('dLeft', { wmin });
  let d = mDom('dLeft', { wmin: wmin - 10, matop: 20, h: window.innerHeight - getRect('dLeft').y - 102 }); //, bg:'#00000020'  }); 
  let gap = 5;
  let stylesTitles = { matop: 10, bg: '#ffffff80', fg: 'black' };
  let cmds = {};
  cmds.homeNew = mCommand(d, 'homeNew', 'New Entry'); mNewline(d, gap);
  UI.commands = cmds;
}
function hotkeyActivate(key, handler) { DA.hotkeys[key] = handler; }
function hotkeyDeactivate(key) { delete DA.hotkeys[key]; }
function hotkeyHandler(ev) {
  let k = ev.key;
  let handler = lookup(DA, ['hotkeys', ev.key]);
  if (handler) { handler(ev); }
}
function hourglassUpdate() {
}
function iAdd(item, liveprops = {}, addprops = {}) {
  let id, l;
  if (isString(item)) { id = item; item = valf(Items[id], {}); }
  let el = valf(liveprops.div, liveprops.ui, iDiv(item), null);
  id = valnwhite(addprops.id, item.id, (el ? el.id : getUID()), getUID());
  item.id = id; if (nundef(Items[id])) Items[id] = item; if (el) el.id = id;
  if (nundef(item.live)) item.live = {};
  l = item.live;
  for (const k in liveprops) {
    let val = liveprops[k];
    if (nundef(val)) { continue; }
    l[k] = val;
    if (isdef(val.id) && val.id != id) { lookupAddIfToList(val, ['memberOf'], id); }
  }
  if (isdef(addprops)) copyKeys(addprops, item);
  return item;
}
function iDiv(i) { return isdef(i.live) ? i.live.div : valf(i.div, i.ui, i); } //isdef(i.div) ? i.div : i; }
function iRegister(item, id) { let uid = isdef(id) ? id : getUID(); Items[uid] = item; return uid; }
async function ilAddGadget(ev) {
  let dParent = DA.currentPage;
  let list = ['image', 'page', 'text'];
  let item = await mGather(mSelect, ev.target, {}, { list }); console.log('you entered', item);
  if (item == 'image') {
    return mImageDropper(dParent);
  } else if (item == 'text') {
    let bg = rChoose(DA.palette);
    let fg = colorIdealText(bg);
    let d2 = mDom(dParent, { align: 'left', padding: 10, rounding: 10, matop: 10, fz: 20, caret: fg, fg, bg }, { html: '', contenteditable: true });
    d2.focus();
    d2.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        d2.blur();
      }
    });
    return d2;
  } else if (item == 'page') {
    let d2 = mDom(dParent, { align: 'left', padding: 10, rounding: 10, matop: 10, fz: 20, caret: fg, fg, bg }, { html: '', contenteditable: true });
    d2.focus();
    d2.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        d2.blur();
      }
    });
    return d2;
  }
}
async function ilNewPage() {
  clearMain();
  let bg = rChoose(DA.palette);
  let fg = colorIdealText(bg);
  let d = DA.currentPage = mDom('dMain', { padding: 10, w: 500, align: 'center' });
}
async function imgAsIsInDiv(url, dParent) {
  let d = mDom(dParent, { bg: 'pink', wmin: 128, hmin: 128, display: 'inline-block', align: 'center', margin: 10 }, { className: 'imgWrapper' });
  let sz = 300;
  let img = await imgAsync(d, {}, { tag: 'img', src: url });
  let [w, h] = [img.width, img.height]; console.log('sz', w, h);
  let scale = sz / img.height;
  return [img, scale];
}
function imgAsync(dParent, styles, opts) {
  let path = opts.src;
  delete opts.src;
  addKeys({ tag: 'img' }, opts); //if forget
  return new Promise((resolve, reject) => {
    const img = mDom(dParent, styles, opts);
    img.onload = () => {
      resolve(img);
    };
    img.onerror = (error) => {
      reject(error);
    };
    img.src = path;
  });
}
function imgBackground(d, src) {
  d.style.backgroundImage = `url('${src}')`; //../assets/games/nations/civs/civ_${pl1.civ}.png')`;
  d.style.backgroundSize = 'cover';
}
async function imgCrop(img, dc, wOrig, hOrig) {
  let dims = mGetStyles(dc, ['left', 'top', 'w', 'h']); console.log('dims', dims);
  let wScale = img.width / wOrig;
  let hScale = img.height / hOrig;
  console.log('scale', wScale, hScale, wOrig, hOrig, img.width, img.height)
  let d1 = mDom(document.body, { margin: 10 });
  let canvas = mDom(d1, {}, { tag: 'canvas', width: dims.w, height: dims.h });
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, dims.left / wScale, dims.top / hScale, (dims.w) / wScale, img.height / hScale, 0, 0, dims.w, dims.h)
}
function imgExpand(img, dc, sz) { img.width += 20; adjustCropper(img, dc, sz); return [img.width, img.height]; }
function imgMeasure(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // CORS permission for cross-origin images
    img.onload = () => {
      resolve({ img, w: img.width, h: img.height });
    };
    img.onerror = (error) => {
      reject(error);
    };
    img.src = src;
  });
}
function imgReset(img, dc, sz, w, h) { img.width = w; img.height = h; adjustCropper(img, dc, sz); return [w, h]; }
async function imgScaledToHeightInDiv(url, dParent, sz = 300) {
  let d = mDom(dParent, { bg: 'pink', wmin: 128, hmin: 128, display: 'inline-block', align: 'center', margin: 10 }, { className: 'imgWrapper' });
  let img = await imgAsync(d, {}, { tag: 'img', src: url });
  let [w, h] = [img.width, img.height]; console.log('orig', w, h);
  let scale = sz / img.height;
  img.width *= scale;
  img.height *= scale;
  mStyle(img, { w: img.width, h: img.height })
  return [img, scale];
}
function imgSquish(img, dc, sz) { let w = mGetStyle(dc, 'w'); if (img.width == w) return; else { img.width = Math.max(img.width - 20, w); adjustCropper(img, dc, sz); return [img.width, img.height]; } }
function imgToDataUrl(img) {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL('image/png');
  return dataUrl;
}
function infoToItem(x) { let item = { info: x, key: x.key }; item.id = iRegister(item); return item; }
function initCodingUI() {
  mStyle('dMain', { bg: 'silver' });
  [dTable, dSidebar] = mCols100('dMain', '1fr auto', 0);
  let [dtitle, dta] = mRows100(dTable, 'auto 1fr', 2);
  mDiv(dtitle, { padding: 10, fg: 'white', fz: 24 }, null, 'OUTPUT:');
  AU.ta = mTextArea100(dta, { fz: 20, padding: 10, family: 'opensans' });
}
function initCrowd() {
  while (availablePeeps.length) {
    addPeepToCrowd().walk.progress(Math.random())
  }
}
function initSockets(username) {
  let socket = DA.socket = io("http://localhost:5000");  // Adjust if needed
  socket.on("connect", () => {
    console.log("Connected to server");
  });
  socket.on("chat_message", function (data) {
    showChatMessage(data);
  });
  socket.on("games_list", games => {
    showGamesList(games);
  });
  socket.on("game_started", data => {
    console.log("Game started:", data);
    document.getElementById("gameIdInput").value = data.gameid;
    document.getElementById("stateGameId").value = data.gameid;
    updateGameState(data.state);
  });
  socket.on("game_update", updateGameState);
  socket.on("state", updateGameState);
  socket.on("error", err => {
    console.error("Error:", err.message);
    alert("Server error: " + err.message);
  });
  socket.on("user_joined", msg => {
    const chatBox = document.getElementById("chatBox");
    const div = document.createElement("div");
    div.textContent = `[JOIN] ${msg}`;
    div.style.color = "green";
    chatBox.appendChild(div);
  });
  socket.on("user_left", msg => {
    const chatBox = document.getElementById("chatBox");
    const div = document.createElement("div");
    div.textContent = `[LEAVE] ${msg}`;
    div.style.color = "red";
    chatBox.appendChild(div);
  });
  socket.emit("register", { username });
}
async function initTest() {
  API_BASE = getBackendUrl();
  DA.items = {};
  DA.selectedImages = [];
  await loadAssetsStatic();
  stickyHeaderCode();
  let elems = mLayoutLM('dPage');
  mStyle('dMain', { overy: 'auto' });
  let dLeft = mBy('dLeft');
  mStyle(dLeft, { overy: 'auto' });
}
async function initUI() {
  mLayoutTLM('dPage', {}, { wcol: 0 });
  mStyle('dMain', { overy: 'scroll', pah: 10, height: '100%' });
  mLayoutTopTestExtraTitle('dTop');
  let d = mBy('dTopLeft'); mClass(d, 'button_container'); //mFlex(d); // mStyle(d, { display: 'flex', vStretch: true, gap: 10, padding: 4, box: true }); //, box:true, vStretch:true, hCenter: true, padding: 10, gap: 10 }) //mClass(d,'flex')
  faButton(d, DEV ? 'angles_up' : 'angles_down', {}, { onclick: toggleDevmode });
  mDom(d, {}, { tag: 'button', html: 'games', onclick: switchToMenu, menu: 'top', key: 'games' });
  mDom(d, {}, { tag: 'button', html: 'table', onclick: switchToMenu, menu: 'top', key: 'table' });
  mDom(d, {}, { tag: 'button', html: 'settings', onclick: switchToMenu, menu: 'top', key: 'settings' });
}
function inpToChecklist(ev, grid) {
  let key = ev.key;
  let inp = ev.target;
  if (key == 'Backspace') {
    let s = inp.value;
    let cursorPos = inp.selectionStart;
    let ch = cursorPos == 0 ? null : inp.value[cursorPos - 1];
    if (!ch || isWhiteSpace(ch)) {
      doYourThing(inp, grid);
    }
    console.log('Backspace', ch);
    return;
  }
  if (key == 'Enter') ev.preventDefault();
  if (isExpressionSeparator(key) || key == 'Enter') doYourThing(inp, grid);
}
function intersection(arr1, arr2) {
  let res = [];
  for (const a of arr1) {
    if (arr2.includes(a)) {
      addIf(res, a);
    }
  }
  return res;
}
function intersectionOfArrays() {
  let arrs = arguments[0]; console.log('arrs', arrs);
  if (!arrs.every(Array.isArray)) arrs = Array.from(arguments);
  return arrs.reduce((acc, array) => acc.filter(element => array.includes(element)));
}
function invalidTables() { return DA.tableDict === null; }
function invalidateMain() { DA.tableDict = DA.table = null; }
function invalidateTables() { DA.tableDict = null; }
function isAlphaNum(s) { query = /^[a-zA-Z0-9]+$/; return query.test(s); }
function isAlphanumeric(s) { for (const ch of s) { if (!isLetter(ch) && !isDigit(ch)) return false; } return isLetter(s[0]); }
function isAncestorOf(elem, elemAnc) {
  while (elem) {
    if (elem === elemAnc) {
      return true;
    }
    elem = elem.parentNode;
  }
  return false;
}
function isAtLeast(n, num = 1) { return n >= num; }
function isBetween(n, a, b) { return n >= a && n <= b }
function isBusy() { return DA.sysState == 'busy'; }
function isCloseTo(n, m, acc = 10) { return Math.abs(n - m) <= acc + 1; }
function isColor(s) { return isdef(M.colorByName[s]) || s.length == 7 && s[0] == '#'; }
function isDict(d) { let res = (d !== null) && (typeof (d) == 'object') && !isList(d); return res; }
function isDigit(s) { return /^[0-9]$/i.test(s); }
function isEmpty(arr) {
  return arr === undefined || !arr
    || (isString(arr) && (arr == 'undefined' || arr == ''))
    || (Array.isArray(arr) && arr.length == 0)
    || Object.entries(arr).length === 0;
}
function isEmptyOrWhiteSpace(s) { return isEmpty(s.trim()); }
function isExactly(n, num = 1) { return n == num; }
function isExpressionSeparator(ch, charsAllowed) { return ',-.!?;:'.includes(ch); }
function isFilename(s) { return s.includes('../'); }
function isGrayColor(color, diff = 60) {
  const rgb = colorHexToRgbObject(color);
  return Math.abs(rgb.r - rgb.g) + Math.abs(rgb.r - rgb.b) + Math.abs(rgb.g - rgb.b) < 3 * diff;
}
function isIdle() { return DA.sysState == 'idle'; }
function isKeyDown(key) { return lookup(DA.keysToCheck, [key]); }
function isLetter(s) { return /^[a-zA-Z]$/i.test(s); }
function isLightAfter(ctx, x, y) {
  for (let p = x + 1; p < x + 4; p++) if (isPixLight(ctx, p, y)) return true;
  return false;
}
function isLightAfterV(ctx, x, y) {
  for (let p = y + 1; p < y + 5; p++) if (isPixLight(ctx, x, p)) return true;
  return false;
}
function isLightBefore(ctx, x, y) {
  for (let p = x - 4; p < x - 1; p++) if (isPixLight(ctx, p, y)) return true;
  return false;
}
function isLightBeforeV(ctx, x, y) {
  for (let p = y - 4; p < y - 1; p++) if (isPixLight(ctx, x, p)) return true;
  return false;
}
function isList(arr) { return Array.isArray(arr); }
function isLiteral(x) { return isString(x) || isNumber(x); }
function isMergeableObject(val) {
  var nonNullObject = val && typeof val === 'object'
  return nonNullObject
    && Object.prototype.toString.call(val) !== '[object RegExp]'
    && Object.prototype.toString.call(val) !== '[object Date]'
}
function isMyTurn(table) { return table.turn.includes(UGetName()) }
function isNumber(x) { return x !== ' ' && x !== true && x !== false && isdef(x) && (x == 0 || !isNaN(+x)); }
function isNumeric(x) { return !isNaN(+x); }
function isObject(item) { return item && typeof item === 'object' && !Array.isArray(item); }
function isPix(ctx, x, y, color, delta = 10) {
  let rgb = colorHexToRgbObject(colorFrom(color));
  let p = getPixRgb(ctx, x, y);
  let found = isWithinDelta(p.r, rgb.r, delta) && isWithinDelta(p.g, rgb.g, delta) && isWithinDelta(p.b, rgb.b, delta);
  return found ? p : null;
}
function isPixDark(ctx, x, y) {
  var pix = ctx.getImageData(x, y, 1, 1).data;
  var red = pix[0]; var green = pix[1]; var blue = pix[2];
  return green < 100 && blue < 100;
}
function isPixLight(ctx, x, y) {
  var pix = ctx.getImageData(x, y, 1, 1).data;
  var red = pix[0]; var green = pix[1]; var blue = pix[2];
  return red + green + blue > 520;
}
function isPlayerHuman(table, name) { return table.players[name].playmode != 'bot'; }
function isPointOutsideOf(elem, x, y) { const r = elem.getBoundingClientRect(); return (x < r.left || x > r.right || y < r.top || y > r.bottom); }
function isPolling() { return DA.sysState == 'polling'; }
function isSameDate(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
}
function isSameTableOpen(id) { return T && T.id == id; }
async function isServerRunning(which = 'flask', remote = false) {
  let url = remote ? 'https://moxito.online/' : 'http://localhost:5000/';
  url += which == 'flask' ? 'flaskgame0/' : 'node';
  console.log('checking url', url);
  try {
    const res = await fetch(url, {
      mode: 'no-cors',
    });
    console.log('res', res);
    return res.ok ? true : null;
  } catch (err) {
    return null;
  }
}
function isSet(x) { return (isDict(x) && (x.set || x._set)); }
function isString(param) { return typeof param == 'string'; }
function isSvg(elem) { return startsWith(elem.constructor.name, 'SVG'); }
function isTimeForAddon() {
  if (nundef(ADS)) return false;
  if (isEmpty(U.avAddons)) return false;
  if (isdef(AD) && AD.running && AD.checkEndCondition()) {
    console.log('END!')
    AD.die();
    U.addons[AD.key].open = false;
    AD = null;
  }
  if (isdef(AD)) return AD.isTimeForAddon();
  let open = allCondDict(U.addons, x => x.open == true);
  if (isEmpty(open)) {
    console.log('open is empty! choosing a random addon!')
    let k = chooseRandom(U.avAddons);
    AD = new ADS[k].cl(k, ADS[k], {});
  } else if (open.length == 1) {
    let k = open[0];
    AD = new ADS[k].cl(k, ADS[k], U.addons[k]);
  } else {
    let k = chooseRandom(open);
    AD = new ADS[k].cl(k, ADS[k], U.addons[k]);
  }
  return AD.isTimeForAddon();
}
function isWhiteSpace(s) { let white = new RegExp(/^\s$/); return white.test(s.charAt(0)); }
function isWithinDelta(n, goal, delta) { return isBetween(n, goal - delta, goal + delta) }
function isWordSeparator(ch) { return ' ,-.!?;:'.includes(ch); }
function isdef(x) { return x !== null && x !== undefined && x !== 'undefined'; }
function ithWord(s, n, allow_) {
  let ws = toWords(s, allow_);
  return ws[Math.min(n, ws.length - 1)];
}
function jsCopy(o) { return JSON.parse(JSON.stringify(o)); }
function jsCopyExceptKeys(o, keys = []) {
  if (!isDict(o)) return jsCopy(o);
  let onew = {};
  for (const k in o) { if (keys.includes(k)) continue; onew[k] = o[k]; }
  return JSON.parse(JSON.stringify(onew));
}
function jsonToYaml(o) { let y = jsyaml.dump(o); return y; }
function keyDownHandler(ev) { DA.keysToCheck[ev.key] = true; }
function keyUpHandler(ev) { delete DA.keysToCheck[ev.key]; }
function lacuna() {
  function setup(table) {
    let opts = table.options;
    opts = { numPoints: 10, numColors: 2, numMeeples: 1 };
    let n = opts.numPoints;
    let neach = opts.numPoints / opts.numColors;
    let points = lacunaGenerateFenPoints(n, neach, 1000, 1000);
    let fen = { points }; console.log('points', points)
    for (const name in table.players) {
      let pl = table.players[name];
      pl.score = 0;
      pl.positions = [];
      pl.flowers = {};
      for (const c of range(opts.numColors)) { pl.flowers[c] = 0; }
    }
    fen.meeples = [];
    table.plorder = jsCopy(table.playerNames);
    table.turn = [rChoose(table.playerNames)];
    return fen;
  }
  function stats(table) {
    let [me, players] = [getUname(), table.players];
    let style = { patop: 8, mabottom: 20, wmin: 80, bg: 'beige', fg: 'contrast' };
    let player_stat_items = uiTypePlayerStats(table, me, 'dStats', 'colflex', style)
    for (const plname in players) {
      let pl = players[plname];
      let item = player_stat_items[plname];
      if (pl.playmode == 'bot') { mStyle(item.img, { rounding: 0 }); }
      let d = iDiv(item); mCenterFlex(d); mLinebreak(d); mIfNotRelative(d);
      for (const c in pl.flowers) {
        let n = pl.flowers[c];
        playerStatCount(c, n, d);
      }
      if (table.turn.includes(plname)) { mDom(d, { position: 'absolute', left: -3, top: 0 }, { html: getWaitingHtml() }); }
    }
  }
  function present(table) {
    let fen = table.fen; console.log(fen);
    console.log(table.fen, table.players);
    B = {};
    let dTable = presentBgaRoundTable();
    B.points = lacunaPresentPoints(fen.points, dTable);
  }
  function muell(table) {
    let [w, h, sz, n, neach, points, meeples] = [fen.w, fen.h, fen.sz, fen.n, fen.neach, jsCopy(fen.points), jsCopy(fen.meeples)];
    let padding = 20;
    mStyle(dTable, { bg: 'midnight_purple', position: 'relative', padding, wmin: w + 2 * padding, hmin: h + 2 * padding });
    let dParent = B.dParent = mDom(dTable, { w, h, position: 'absolute', left: 2 * padding, top: 2 * padding }, { id: 'dCanvas' });
    B.points = points;
    B.sz = sz;
    B.diPoints = lacunaDrawPoints(dParent, points);
    B.meeples = meeples;
    B.diMeeples = lacunaDrawPoints(dParent, meeples);
    return B.points;
  }
  async function activate(table, items) {
    if (!isMyTurn(table)) return;
    setInstruction('must place a meeple'); //browser tab and instruction if any
    console.log('AAAAAAAAAAAAAAAA')
    return;
    setTimeout(() => lacunaStartMove(), 10);
  }
  return { setup, present, stats, activate, hasInstruction: true };
}
function lacunaColor(name) {
  let clist = { red: "#E63946", green: "#06D6A0", blue: "#118AB2", cyan: "#0F4C75", magenta: "#D81159", yellow: "#FFD166", orange: "#F4A261", purple: "#9D4EDD", pink: "#FF80AB", brown: "#8D6E63", lime: "#A7FF83", indigo: "#3A0CA3", violet: "#B5838D", gold: "#F5C518", teal: "#008080" };
  return clist[name];
}
function lacunaColorName(val) {
  let clist = { red: "#E63946", green: "#06D6A0", blue: "#118AB2", cyan: "#0F4C75", magenta: "#D81159", yellow: "#FFD166", orange: "#F4A261", purple: "#9D4EDD", pink: "#FF80AB", brown: "#8D6E63", lime: "#A7FF83", indigo: "#3A0CA3", violet: "#B5838D", gold: "#F5C518", teal: "#008080" };
  for (const k in clist) {
    if (val == clist[k]) return k;
  }
  return 'unknown';
}
function lacunaColors() {
  let clist = { red: 'crimson', green: "#00ff00", blue: "#0000ff", cyan: "#00ffff", yellow: "#FFD166", pink: "#FF80AB", orange: "#F4A261", purple: "#9D4EDD", brown: "#8D6E63", lime: "#A7FF83", indigo: "#3A0CA3", violet: "#B5838D", gold: "#F5C518", teal: "#008080", magenta: "#D81159" };
  return Object.values(clist);
}
function lacunaDrawPoints(dParent, points, addLabel = true) {
  let items = [];
  for (const p of points) {
    let html = isdef(p.owner) && addLabel ? p.owner[0].toUpperCase() : ''; //p.id.substring(1) : ''
    let d1 = p.div = mDom(dParent, { round: true, left: p.x, top: p.y, w: p.sz, h: p.sz, position: 'absolute', bg: p.bg, align: 'center', fg: 'contrast' }, { html, id: p.id });
    d1.style.cursor = 'default';
    if (isdef(p.border)) mStyle(d1, { outline: `solid ${p.border} 4px` });
    let rect = getRect(d1);
    p.cx = p.x + p.sz / 2; p.cy = p.y + p.sz / 2;
    p.xPage = rect.x; p.yPage = rect.y;
    p.cxPage = rect.x + p.sz / 2; p.cyPage = rect.y + p.sz / 2;
    items[p.id] = p;
  }
  return items;
}
async function lacunaGameover() {
  showMessage('Game over');
  console.log('Game over');
  let [fen, players] = [T.fen, T.players];
  for (const p of fen.points) {
    let closestMeeple = findClosestMeeple(p);
    if (closestMeeple) {
      let owner = closestMeeple.owner;
      players[owner].flowers[p.bg] += 1;
      p.owner = owner;
    }
  }
  for (const plname of T.playerNames) {
    let pl = T.players[plname];
    for (const f in pl.flowers) pl.score += pl.flowers[f];
  }
  let table = T;
  table.winners = getPlayersWithMaxScore(table);
  table.status = 'over';
  table.turn = [];
  let id = table.id;
  let name = getUname();
  let step = table.step;
  let o = { id, name, step, table };
  let res = await mPostRoute('table', o); //console.log(res);
}
function lacunaGenerateFenPoints(n, nColors, w = 1000, h = 1000, rand = .8) {
  let pts = generateRandomPointsRound(n, w, h, rand);
  return pts.map(p => `${p.x}_${p.y}_${rChoose(range(nColors))}`); //.join(' ');
}
function lacunaGeneratePoints(w, h, n = 49, neach = 7, sz = 10, rand = .7, round = false) {
  let clist = lacunaColors();
  let points = round ? generateRandomPointsRound(n, w, h, rand) : generateRandomPointsRect(n, w, h, rand);
  let colors = generateRepeatedColors(n, neach, clist); arrShuffle(colors);
  for (let i = 0; i < n; i++) { points[i].bg = colors[i]; points[i].sz = sz; points[i].id = getUID(); }
  return points;
}
function lacunaGeneratePointsMargin(w, h, margin, n = 49, neach = 7, sz = 10, rand = .7, round = false) {
  let points = lacunaGeneratePoints(w - 2 * margin, h - 2 * margin, n, neach, sz, rand, round);
  for (let i = 0; i < n; i++) { points[i].x += margin; points[i].y += margin; }
  return points;
}
function lacunaMakeSelectableME() {
  for (const id of B.endPoints) {
    let div = mBy(id);
    mClass(div, 'selectable')
    div.onclick = ev => lacunaSelectPointME(ev);
  }
}
async function lacunaMoveComplete(idlist) {
  console.log('lacunaMoveComplete', idlist); return idlist;
  let [fen, players, me, table] = [T.fen, T.players, T.players[getUname()], T]
  B.endPoints.map(x => lacunaUnselectable(x));
  showMessage(`________Move completed, removing ${idlist}`);
  assertion(idlist.length == 2 || idlist.length == 0, `WTF3!!! ${idlist.length}`);
  if (idlist.length == 2) {
    fen.points = fen.points.filter(x => x.id != idlist[0] && x.id != idlist[1]);
    let color = B.diPoints[idlist[0]].bg;
    let flower = lacunaColorName(color);
    let n = lookup(me, ['flowers', color]);
    lookupSetOverride(me, ['flowers', color], n ? n + 2 : 2);
  }
  let nextPlayer = findPlayerWithMeeplesLeft(getUname()); console.log('nextPlayer', nextPlayer);
  if (nextPlayer) {
    table.turn = [nextPlayer];
    let o = { id: table.id, name: me, step: table.step + 1, table };
    let res = await mPostRoute('table', o); //console.log(res);
  } else await lacunaGameover();
}
async function lacunaMoveCompletedME(idlist) {
  let [fen, players, me, table] = [T.fen, T.players, T.players[getUname()], T]
  B.endPoints.map(x => lacunaUnselectable(x));
  showMessage(`________Move completed, removing ${idlist}`);
  assertion(idlist.length == 2 || idlist.length == 0, `WTF3!!! ${idlist.length}`);
  if (idlist.length == 2) {
    fen.points = fen.points.filter(x => x.id != idlist[0] && x.id != idlist[1]);
    let color = B.diPoints[idlist[0]].bg;
    let flower = lacunaColorName(color);
    let n = lookup(me, ['flowers', color]);
    lookupSetOverride(me, ['flowers', color], n ? n + 2 : 2);
  }
  let nextPlayer = findPlayerWithMeeplesLeft(getUname()); console.log('nextPlayer', nextPlayer);
  if (nextPlayer) {
    table.turn = [nextPlayer];
    let o = { id: table.id, name: me, step: table.step + 1, table };
    let res = await mPostRoute('table', o); //console.log(res);
  } else await lacunaGameover();
}
async function lacunaPresent() {
  await loadStarImages();
  let [n, nTypes] = [49, 7];
  let fenPoints = lacunaGenerateFenPoints(n, nTypes, 1000, 1000, 0); logMinMax(fenPoints);
  B = {};
  let d1 = mDom(document.body, { hline: 0, margin: 0 }, { html: '&nbsp;' });
  let [w, h, margin, padding, border] = [500, 500, 20, 30, 8];
  let d = mDom(d1, { border: `${border}px solid #555`, wbox: true, position: 'relative', w, h, bg: '#242430', margin, padding }, { id: 'dCanvas' });
  let sz = 30;
  let points = [];
  for (const p of fenPoints) {
    let p1 = pointFromFenRaw(p);
    p1.x = mapRange(p1.x, 0, 1000, 0, w);
    p1.y = mapRange(p1.y, 0, 1000, 0, h);
    p1 = pointAddMargin(p1, padding);
    drawPointStar(p1, d, sz);
    points.push(p1);
  }
  B.diPoints = list2dict(points, 'id');
  console.log(points[0], getSetOfDifferentTypesOfPoints(points));
  B.obstacleThreshold = 10; B.triggerThreshold = 8;
  let result = findIsolatedPairs(points, 'type', B.obstacleThreshold); //je groesser threshold umso mehr obstacles werden detected!
  let pairs = result.isolatedPairs;
  let lines = []; B.lines = lines;
  pairs.map(pair => lines.push({ p1: pair[0], p2: pair[1], div: drawInteractiveLine(d, pair[0], pair[1], 'lightblue', 1) })); //rColor(), 1)));
  d.onmousemove = onMouseMoveLine;
  B.counter = 0;
  B.meeples = [];
  document.onclick = placeYourMeeple;
}
function lacunaPresentPoints(points, d) {
  let [w, h, sz, margin, padding] = [400, 400, 10, 10, 20];
  B.sz = sz;
  let dParent = B.dParent = mDom(d, { w, h, margin, padding, position: 'relative', bg: '#eee' }, { id: 'dCanvas' });
  for (const p of points) {
    let p1 = pointFromFenRaw(p);
    p1.x = mapRange(p1.x, 0, 1000, 0, w - sz);
    p1.y = mapRange(p1.y, 0, 1000, 0, h - sz);
    p1 = pointAddMargin(p1, padding);
    p1.sz = sz;
    p1 = drawPoint(dParent, p1);
  }
}
async function lacunaSelectPointME(ev) {
  let [fen, players, pl] = [T.fen, T.players, T.players[getUname()]]
  let id = evToId(ev);
  let p = B.diPoints[id];
  lookupAddIfToList(B, ['selectedPoints'], id); //console.log(B.selectedPoints.length)
  assertion(B.selectedPoints.length >= 1, "WTF");
  if (B.selectedPoints.length == 1) {
    let eps = [];
    for (const pair of B.possiblePairs.map(x => x.split(',').map(x => B.diPoints[x]))) {
      let p1 = pair[0];
      let p2 = pair[1];
      if (p1.id != id && p2.id != id) continue;
      if (p1.id == id) addIf(eps, p2.id); else addIf(eps, p1.id);
    }
    let unselect = B.endPoints.filter(x => !eps.includes(x));
    unselect.map(x => lacunaUnselectable(x));
    B.endPoints = eps;
    if (B.endPoints.length < 2) {
      B.selectedPoints.push(B.endPoints[0]);
      await lacunaMoveCompletedME(B.selectedPoints);
    }
  } else {
    assertion(B.selectedPoints.length == 2, "WTF2!!!!!!!!!!!!!");
    await lacunaMoveCompletedME(B.selectedPoints);
  }
}
async function lacunaSelectPointNeu(p, l) {
  let id = p.id;
  lookupAddIfToList(B, ['selectedPoints'], id); //console.log(B.selectedPoints.length)
  assertion(B.selectedPoints.length >= 1, "WTF");
  if (B.selectedPoints.length == 1) {
    let eps = [];
    for (const line of B.possiblePairs) {
      let p1 = line.p1;
      let p2 = line.p2;
      if (p1.id != id && p2.id != id) continue;
      if (p1.id == id) addIf(eps, p2.id); else addIf(eps, p1.id);
    }
    let unselect = B.endPoints.filter(x => !eps.includes(x));
    unselect.map(x => { let d = mBy(id); mClassRemove(div, 'pulseFastInfinite'); d.onclick = null; });
    B.endPoints = eps;
    if (B.endPoints.length < 2) {
      B.selectedPoints.push(B.endPoints[0]);
      await lacunaMoveCompletedME(B.selectedPoints);
    }
  } else {
    assertion(B.selectedPoints.length == 2, "WTF2!!!!!!!!!!!!!");
    await lacunaMoveCompletedME(B.selectedPoints);
  }
}
function lacunaStartMove() {
  lockForLengthyProcess();
  h = { meeples: B.meeples, dParent: B.dParent, points: B.points, sz: B.sz };
  let [points, dParent, sz] = [B.points, B.dParent, B.sz];
  let result = findIsolatedPairs(points, sz * 1.2);
  let isolated = B.isolatedPairs = filterIsolatedPairs(result.isolatedPairs, B.meeples, 15);
  let [hotspots, linesByPair] = generateHotspots(dParent, isolated, sz, 'transparent');
  B.hotspots = hotspots;
  B.linesByPair = linesByPair;
  B.pairs = linesByPair;
  B.hotspotList = hotspots;
  B.hotspotDict = list2dict(hotspots, 'id');
  dParent.onmousemove = highlightHotspots;
  dParent.onclick = placeYourMeepleME;
  unlock();
}
function lacunaUnselectable(id) {
  let div = mBy(id);
  mClassRemove(div, 'selectable');
  div.onclick = null;
}
function last(arr) {
  return arr.length > 0 ? arr[arr.length - 1] : null;
}
function lastCond(arr, func) {
  if (nundef(arr)) return null;
  for (let i = arr.length - 1; i >= 0; i--) { let a = arr[i]; if (func(a)) return a; }
  return null;
}
function lastOfLanguage(key, language) {
  let y = symbolDict[key];
  let w = y[language];
  let last = stringAfterLast(w, '|');
  return last.trim();
}
function lastWord(s) { return arrLast(toWords(s)); }
function lazyLoadImages() {
  const images = document.querySelectorAll('img[data-src]');
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        obs.unobserve(img);
      }
    });
  });
  images.forEach(img => observer.observe(img));
}
function leinwand(w = 500, h = 500, bg = '#242430') {
  let d1 = mDom(document.body, { hline: 0, margin: 0 }, { html: '&nbsp;' });
  let [margin, padding, border] = [25, 0, 7];
  let d = mDom(d1, { border: `${border}px solid #555`, wbox: true, position: 'relative', w, h, bg, margin, padding, className: 'lensBorder' }, { id: 'dCanvas' });
  return d;
}
function list2dict(arr, keyprop = 'id', uniqueKeys = true) {
  let di = {};
  for (const a of arr) {
    let key = typeof (a) == 'object' ? a[keyprop] : a;
    if (uniqueKeys) lookupSet(di, [key], a);
    else lookupAddToList(di, [key], a);
  }
  return di;
}
function liste(areaName, oSpec, oid, o) {
  let [num, or, split, bg, fg, id, panels, parent] = getParams(areaName, oSpec, oid);
  parent.style.display = 'inline-grid';
  return parent;
}
function loadAndDivideImage(imageUrl, dParent) {
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imgWidthThird = img.width / 3;
    const imgHeightThird = img.height / 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const subCanvas = document.createElement('canvas');
        subCanvas.width = imgWidthThird;
        subCanvas.height = imgHeightThird;
        const subCtx = subCanvas.getContext('2d');
        subCtx.drawImage(img, i * imgWidthThird, j * imgHeightThird, imgWidthThird, imgHeightThird, 0, 0, imgWidthThird, imgHeightThird);
        dParent.appendChild(subCanvas);
      }
    }
  };
  img.src = imageUrl;
}
async function loadAndMakeInteractive(imageUrl) {
  try {
    const canvas = await createInteractiveCanvas(imageUrl);
    document.body.appendChild(canvas);
  } catch (error) {
    console.error("Error loading image:", error);
  }
}
async function loadAndScaleImage(imageUrl) {
  try {
    const canvas = await createScaledCanvasFromImage(imageUrl);
    document.body.appendChild(canvas);
  } catch (error) {
    console.error("Error loading image:", error);
  }
}
async function loadAssets() {
  M = await mGetYaml('../y/m.yaml');
  M.superdi = await mGetYaml('../y/superdi.yaml');
  M.details = await mGetYaml('../y/details.yaml');
  let [di, byColl, byFriendly, byCat, allImages] = [M.superdi, {}, {}, {}, {}];
  for (const k in di) {
    let o = di[k];
    for (const cat of o.cats) lookupAddIfToList(byCat, [cat], k);
    for (const coll of o.colls) lookupAddIfToList(byColl, [coll], k);
    lookupAddIfToList(byFriendly, [o.friendly], k)
    if (isdef(o.img)) {
      let fname = stringAfterLast(o.img, '/')
      allImages[fname] = { fname, path: o.img, k };
    }
  }
  M.allImages = allImages;
  M.byCat = byCat;
  M.byCollection = byColl;
  M.byFriendly = byFriendly;
  M.categories = Object.keys(byCat); M.categories.sort();
  M.collections = Object.keys(byColl); M.collections.sort();
  M.names = Object.keys(byFriendly); M.names.sort();
  M.dicolor = await mGetYaml(`../assets/dicolor.yaml`);
  [M.colorList, M.colorByHex, M.colorByName] = getListAndDictsForDicolors();
}
async function loadAssetsFast() {
  if (nundef(M)) M = {};
  M = await loadStaticYaml('assets/m.yaml');
  console.log(M)
  loadColors();
}
async function loadAssetsStatic() {
  if (nundef(M)) M = {};
  M = await loadStaticYaml('y/m.yaml');
  M.superdi = await loadStaticYaml('y/superdi.yaml');
  M.details = await loadStaticYaml('y/details.yaml');
  M.config = await loadStaticYaml('y/config.yaml');
  M.users = await loadStaticYaml('y/users.yaml');
  loadColors();
  loadSuperdiAssets();
  if (nundef(M.asciiCapitals)) {
    let except = ["Noum", 'Bras', 'Reykja'];
    M.asciiCapitals = M.capital.filter(x => !x.includes('.') && !except.some(y => x.startsWith(y)));
  }
  let dict = M.c52Symbols = await loadStaticYaml('assets/c52symbols.yaml');
}
function loadColors(bh = 18, bs = 20, bl = 20) {
  if (nundef(M.dicolor)) {
    M.dicolor = dicolor;
  }
  if (nundef(M.colorList)) {
    [M.colorList, M.colorByHex, M.colorByName] = getListAndDictsForDicolors();
    M.colorNames = Object.keys(M.colorByName); M.colorNames.sort();
  }
  let list = M.colorList;
  for (const x of list) {
    let fg = colorIdealText(x.hex);
    x.fg = fg;
    x.sorth = Math.round(x.hue / bh) * bh;
    x.sortl = Math.round(x.lightness * 100 / bl) * bl;
    x.sorts = Math.round(x.sat * 100 / bs) * bs;
  }
  list = sortByMultipleProperties(list, 'fg', 'sorth', 'sorts', 'sortl', 'hue');
  return list;
}
async function loadGame(gameId) {
  return await api('GET', `/load_game/${gameId}`);
}
function loadImageAsync(src, img) {
  return new Promise((resolve, reject) => {
    img.onload = async () => {
      resolve(img);
    };
    img.onerror = (error) => {
      reject(error);
    };
    img.src = src;
  });
}
async function loadStarImages() {
  let list = [];
  let names = ['bl1', 'bl2', 'bl3', 'bl4', 'bl7', 'bl8', 'bl9', 'bl6', 'bl5'];
  for (const name of names) { list.push(`../assets/icons/stars/${name}.png`); }
  let starImages = await preloadImages(list);
  M.starImages = starImages;
  return starImages;
}
async function loadStaticText(path) {
  let server = await getDA('staticUrl'); console.log('server', server);
  let res = await fetch(server + path);
  if (!res.ok) return null;
  return await res.text();
}
async function loadStaticYaml(path) {
  let server = await getDA('staticUrl'); //console.log('server', server);
  let res = await fetch(server + path);
  if (!res.ok) return null;
  return jsyaml.load(await res.text());
}
function loadSuperdiAssets() {
  let [di, byType, byCat, allImages] = [M.superdi, {}, {}, {}];
  for (const k in di) {
    let o = di[k];
    for (const cat of o.cats) lookupAddIfToList(byCat, [cat], k);
    if (isdef(o.img)) {
      let fname = stringAfterLast(o.img, '/')
      allImages[k] = { fname, path: o.img, key: k };
    }
    if (isdef(o.photo)) {
      let fname = stringAfterLast(o.photo, '/')
      allImages[k + '_photo'] = { fname, path: o.photo, key: k };
    }
  }
  for (const k in M.superdi) { M.superdi[k].key = k; }
  M.allImages = allImages;
  M.byCat = byCat;
  M.categories = Object.keys(byCat); M.categories.sort();
  for (const k in M.superdi) {
    let o = M.superdi[k];
    for (const fk in Families) {
      if (isdef(o[fk])) { lookupAddIfToList(byType, [fk], k); }
    }
  }
  M.byType = byType;
}
function loadUsers() {
}
function lockForLengthyProcess() {
  DA.LengthyProcessRunning = true;
  console.log('LOCK!!!!!!!!!!!!!!!!!!!!!!');
}
function logItems() { Object.keys(Items).sort().forEach(k => console.log('Items', Items[k])); }
function logMinMax(fenPoints) {
  let xValues = fenPoints.map(p => parseInt(p.split('_')[0]));
  let yValues = fenPoints.map(p => parseInt(p.split('_')[1]));
  let minX = Math.min(...xValues);
  let maxX = Math.max(...xValues);
  let minY = Math.min(...yValues);
  let maxY = Math.max(...yValues);
  console.log('Min X:', minX);
  console.log('Max X:', maxX);
  console.log('Min Y:', minY);
  console.log('Max Y:', maxY);
}
function lookup(dict, keys) {
  if (nundef(dict)) return null;
  let d = dict;
  let ilast = keys.length - 1;
  let i = 0;
  for (const k of keys) {
    if (k === undefined) break;
    let e = d[k];
    if (e === undefined || e === null) return null;
    d = d[k];
    if (i == ilast) return d;
    i += 1;
  }
  return d;
}
function lookupAddIfToList(dict, keys, val) {
  let lst = lookup(dict, keys);
  if (isList(lst) && lst.includes(val)) return;
  return lookupAddToList(dict, keys, val);
}
function lookupAddToList(dict, keys, val) {
  let d = dict;
  let ilast = keys.length - 1;
  let i = 0;
  for (const k of keys) {
    if (i == ilast) {
      if (nundef(k)) {
        console.assert(false, 'lookupAddToList: last key indefined!' + keys.join(' '));
        return null;
      } else if (isList(d[k])) {
        d[k].push(val);
      } else {
        d[k] = [val];
      }
      return d[k];
    }
    if (nundef(k)) continue;
    if (d[k] === undefined) d[k] = {};
    d = d[k];
    i += 1;
  }
  return d;
}
function lookupSet(dict, keys, val) {
  let d = dict;
  let ilast = keys.length - 1;
  let i = 0;
  for (const k of keys) {
    if (nundef(k)) continue;
    if (nundef(d[k])) d[k] = (i == ilast ? val : {});
    d = d[k];
    if (i == ilast) return d;
    i += 1;
  }
  return d;
}
function lookupSetOverride(dict, keys, val) {
  let d = dict;
  let ilast = keys.length - 1;
  let i = 0;
  for (const k of keys) {
    if (i == ilast) {
      if (nundef(k)) {
        return null;
      } else {
        d[k] = val;
      }
      return d[k];
    }
    if (nundef(k)) continue;
    if (nundef(d[k])) d[k] = {};
    d = d[k];
    i += 1;
  }
  return d;
}
function mAdjustPage(wmargin) {
  let r = getRect('dBuffer');
  let r2 = getRect('dExtra');
  let [w, h] = [window.innerWidth - wmargin, window.innerHeight - (r.h + r2.h)];
  mStyle('dMain', { w, h });
  mStyle('dPage', { w, h });
}
function mAlign(box, dOuter, opts) {
  if (mGetStyle(box, 'display') != 'inline-block') {
    let parent = box.parentNode;
    let wrapper = mDom(parent, { display: 'inline-block' });
    mAppend(wrapper, box);
    box = wrapper;
  }
  let rOuter = getRect(dOuter);
  let rbox = getRect(box);
  let align = valf(opts.align, 'bl'), ov = valf(opts.ov, 0);
  if (align == 'tl') { dx = rOuter.l; dy = rOuter.t - rbox.h * (1 - ov); }
  else if (align == 'bl') { dx = rOuter.l; dy = rOuter.b - rbox.h * ov; }
  else if (align == 'cl') { dx = rOuter.l - rbox.w * (1 - ov); dy = rOuter.t + rOuter.h / 2 - rbox.h / 2; }
  else if (align == 'tr') { dx = rOuter.l + rOuter.w - rbox.w; dy = rOuter.t - rbox.h * (1 - ov); }
  else if (align == 'br') { dx = rOuter.l + rOuter.w - rbox.w; dy = rOuter.t + rOuter.h - rbox.h * ov; }
  else if (align == 'cr') { dx = rOuter.l + rOuter.w - rbox.w + rbox.w * (1 - ov); dy = rOuter.t + rOuter.h / 2 - rbox.h / 2; }
  else if (align == 'tc') { dx = rOuter.l + rOuter.w / 2 - rbox.w / 2; dy = rOuter.t - rbox.h * (1 - ov); }
  else if (align == 'bc') { dx = rOuter.l + rOuter.w / 2 - rbox.w / 2; dy = rOuter.t + rOuter.h - rbox.h * ov; }
  else if (align == 'cc') { dx = rOuter.l + rOuter.w / 2 - rbox.w / 2; dy = rOuter.t + rOuter.h / 2 - rbox.h / 2; }
  dx = clamp(dx, 0, window.innerWidth - rbox.w); dy = clamp(dy, 0, window.innerHeight - rbox.h);
  mPos(box, dx, dy, opts.offx, opts.offy);
}
function mAnchorTo(elem, dAnchor, align = 'bl') {
  let rect = dAnchor.getBoundingClientRect();
  let drect = elem.getBoundingClientRect();
  let [v, h] = [align[0], align[1]];
  let vPos = v == 'b' ? { top: rect.bottom } : v == 'c' ? { top: rect.top } : { top: rect.top - drect.height };
  let hPos = h == 'l' ? { left: rect.left } : h == 'c' ? { left: rect.left } : { right: window.innerWidth - rect.right };
  let posStyles = { position: 'absolute' };
  addKeys(vPos, posStyles);
  addKeys(hPos, posStyles);
  mStyle(elem, posStyles);
}
function mAnimate(elem, prop, valist, callback, msDuration = 1000, easing = 'cubic-bezier(1,-0.03,.86,.68)', delay = 0, forwards = 'none') {
  let kflist = [];
  for (const perc in valist) {
    let o = {};
    let val = valist[perc];
    o[prop] = isString(val) || prop == 'opacity' ? val : '' + val + 'px';
    kflist.push(o);
  }
  let opts = { duration: msDuration, fill: forwards, easing: easing, delay: delay };
  let a = toElem(elem).animate(kflist, opts);
  if (isdef(callback)) { a.onfinish = callback; }
  return a;
}
function mAppend(d, child) { toElem(d).appendChild(child); return child; }
function mArea(padding, dParent, styles = {}, opts = {}) {
  addKeys({ padding, wbox: true, position: 'relative' }, styles)
  let d0 = mDom(dParent, styles);
  let d = mDom(d0, { w100: true, h100: true, box: true, position: 'relative' }, opts);
  let [w, h] = [mGetStyle(d, 'w'), mGetStyle(d, 'h')];
  let cv = mDom(d, { position: 'absolute', top: 0, left: 0, w100: true, h100: true, 'pointer-events': 'none' }, { tag: 'canvas', id: 'canvas1', width: w, height: h })
  return [d, cv];
}
function mAreas(dParent, areas, gridCols, gridRows) {
  mClear(dParent); mStyle(dParent, { padding: 0 })
  let names = arrNoDuplicates(toWords(areas));
  let dg = mDom(dParent, { w100: true, h100: true, box: true });
  for (const name of names) {
    let d = mDom(dg, { family: 'opensans' }, { id: name });
    d.style.gridArea = name;
  }
  mStyle(dg, { display: 'grid', gridCols, gridRows });
  dg.style.gridTemplateAreas = areas;
  return names;
}
function mButton(caption, handler, dParent, styles, classes, id) {
  let x = mCreate('button');
  x.innerHTML = caption;
  if (isdef(handler)) x.onclick = handler;
  if (isdef(dParent)) toElem(dParent).appendChild(x);
  if (isdef(styles)) mStyle(x, styles);
  if (isdef(classes)) mClass(x, classes);
  if (isdef(id)) x.id = id;
  return x;
}
function mButtonList(dParent, di) {
  dParent = toElem(dParent);
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.alignItems = 'center';
  container.style.width = '100%';
  for (const key in di) {
    const btn = document.createElement('button');
    btn.textContent = key;
    btn.style.margin = '5px';
    btn.style.alignSelf = 'stretch'; // Stretch button to container width
    btn.onclick = () => di[key]();
    container.appendChild(btn);
  }
  dParent.appendChild(container);
}
function mButtonX(dParent, handler = null, sz = 22, offset = 5, color = 'contrast') {
  mIfNotRelative(dParent);
  let [top, right] = [-3 + offset, offset - 3];
  let bx = mDom(dParent, { position: 'absolute', top, right, w: sz, h: sz, cursor: 'pointer' }, { className: 'hop1' });
  bx.onclick = ev => { evNoBubble(ev); if (!handler) dParent.remove(); else handler(ev); }
  let o = M.superdi.xmark;
  let bg = mGetStyle(dParent, 'bg'); if (isEmpty(bg)) bg = 'white';
  let fg = color == 'contrast' ? colorIdealText(bg, true) : color;
  el = mDom(bx, { fz: sz, hline: sz, family: 'fa6', fg, display: 'inline' }, { html: String.fromCharCode('0x' + o.fa6) });
}
function mBy(id, what, elem) {
  if (nundef(elem)) elem = document;
  if (nundef(what)) return elem.getElementById(id);
  switch (what) {
    case 'class': return Array.from(elem.getElementsByClassName(id)); break;
    case 'tag': return Array.from(elem.getElementsByTagName(id)); break;
    case 'name': return Array.from(elem.getElementsByName(id)); break;
    case 'query': return Array.from(elem.querySelectorAll(id)); break;
    default: return elem.getElementById(id);
  }
}
function mByAttr(key, val) {
  const selector = val ? `[${key}="${val}"]` : `[${key}]`;
  let list = Array.from(document.querySelectorAll(selector));
  return (list.length == 1) ? list[0] : list;
}
function mByTag(tag) { return document.getElementsByTagName(tag)[0]; }
function mCheckbox(dg, name, value) {
  let di = mDom(dg, { display: 'inline-block' });
  let chk = mDom(di, {}, { tag: 'input', type: 'checkbox', id: getUID('c'), name: name });
  if (isdef(value)) chk.checked = value;
  let label = mDom(di, {}, { tag: 'label', html: name, for: chk.id });
  return di;
}
function mClass(d) {
  d = toElem(d);
  if (arguments.length == 2) {
    let arg = arguments[1];
    if (isString(arg) && arg.indexOf(' ') > 0) { arg = toWords(arg); }
    else if (isString(arg)) arg = [arg];
    if (isList(arg)) {
      for (let i = 0; i < arg.length; i++) {
        d.classList.add(arg[i]);
      }
    }
  } else for (let i = 1; i < arguments.length; i++) d.classList.add(arguments[i]);
}
function mClassRemove(d) { d = toElem(d); for (let i = 1; i < arguments.length; i++) d.classList.remove(arguments[i]); }
function mClassToggle(d, classes) {
  let wlist = toWords(classes);
  d = toElem(d);
  for (const c of wlist) if (d.classList.contains(c)) mClassRemove(d, c); else mClass(d, c);
}
function mClear(d) {
  d = toElem(d); if (d) d.innerHTML = '';
}
function mClearAllSelections() {
  let arr = Array.from(document.getElementsByClassName('framedPicture'));//find all visible uis for selected images
  arr.forEach(mUnselect);
  UI.selectedImages = [];
}
function mClip(shape, d) {
  if (shape == 'circle' || shape == 'ellipse') mStyle(d, { rounding: '50%' });
  else mStyle(d, { 'clip-path': PolyClips[shape] });
}
function mCluster(olist, func, fout) {
  let res = {};
  if (nundef(fout)) fout = x => x
  for (const o of olist) {
    for (const x of func(o)) { lookupAddIfToList(res, [x], fout(o)) }
  }
  return res;
}
function mColFlex(dParent, chflex = [1, 5, 1], bgs) {
  let styles = { opacity: 1, display: 'flex', aitems: 'stretch', 'flex-flow': 'nowrap' };
  mStyle(dParent, styles);
  let res = [];
  for (let i = 0; i < chflex.length; i++) {
    let bg = isdef(bgs) ? bgs[i] : null;
    let d1 = mDiv(dParent, { flex: chflex[i], bg: bg });
    res.push(d1);
  }
  return res;
}
async function mCollapse(divs, dParent, styles = {}) {
  function collapseOne(div) {
    let b = div.firstChild.firstChild;
    b.textContent = '+';
    let chi = arrChildren(div).slice(1);
    chi.map(x => mStyle(x, { display: 'none' }));
  }
  function expandOne(div) {
    let b = div.firstChild.firstChild;
    b.textContent = '- ';
    let chi = arrChildren(div).slice(1);
    chi.map(x => mStyle(x, { display: 'block' }));
  }
  function isCollapsedOne(div) { let chi = arrChildren(div).slice(1); return chi[0].style.display === 'none'; }
  function toggleOne(div) { if (isCollapsedOne(div)) expandOne(div); else collapseOne(div); }
  function collapseAll() { divs.map(collapseOne); }
  function expandAll() { divs.map(expandOne); }
  divs.forEach(div => {
    let d1 = div.firstChild;
    let b = mDom(d1, { margin: 5, cursor: 'pointer' }, { tag: 'span', html: '- ' }); mInsert(d1, b, 0);
    b.onclick = () => { toggleOne(div); }
  });
  let dController = null;
  if (isdef(dParent)) {
    let bExpand = await mKey('circle_chevron_down', dParent, styles, { tag: 'button', onclick: expandAll });
    let bCollapse = await mKey('circle_chevron_up', dParent, styles, { tag: 'button', onclick: collapseAll });
    dController = mToggleCompose(bExpand, bCollapse);
  }
  return { divs, dController, toggleOne, collapseOne, expandOne, isCollapsedOne, collapseAll, expandAll };
}
function mCollapseRemove(coll) {
  coll.divs.forEach(div => {
    coll.expandOne(div);
    div.firstChild.firstChild.remove();
  });
  if (isdef(coll.dController)) coll.dController.remove();
}
function mColor(d, bg, fg) { return mStyle(d, { 'background-color': bg, 'color': fg }); }
function mColorPicker(dParent, handler) {
  dParent = mDom(dParent); mFlex(dParent);
  async function mCPClick(item, board) {
    let selitems = board.items.filter(x => x.isSelected == true); selitems.map(x => toggleItemSelection(x))
    toggleItemSelection(item);
    mClassRemove(iDiv(item), 'hexframe');
    mStyle(iDiv(board), item.color);
    let dh = mBy('dHslTable');
    mClear(dh);
    hslTables(dh, item.color)
    if (isdef(handler)) handler(item.color);
  }
  async function mCPEnter(item, board) {
    mStyle(iDiv(board), { bg: item.color });
  }
  async function mCPLeave(item, board) {
    let selitem = board.items.find(x => x.isSelected == true);
    if (isdef(selitem)) mStyle(iDiv(board), { bg: selitem.color });
  }
  let board = drawHexBoard(7, 7, dParent, { bg: 'transparent', padding: 10 }, { w: 20, h: 22, classes: 'hexframe' }); //, {padding:10});
  let tables = mDom(dParent, {}, { id: 'dHslTable' });
  let colors = getColormapColors();
  let i = 0;
  for (const item of board.items) {
    let bg = colors[i++];
    item.color = bg;
    let dhex = iDiv(item);
    dhex.onmouseenter = () => mCPEnter(item, board);
    dhex.onmouseleave = () => mCPLeave(item, board);
    dhex.onclick = () => mCPClick(item, board);
    mStyle(dhex, { bg });
  }
  function getColor() { let item = board.items.find(x => x.isSelected == true); return lookup(item, ['color']); }
  function setColor() { let item = rChoose(board.items); mCPClick(item, board); return item; }
  return { board, getColor, setColor };
}
function mColorPickerHex(dParent, colors) {
  dParent = mDom(dParent);
  let board = drawHexBoard(7, 7, dParent, { bg: 'transparent', padding: 10 }, { w: 20, h: 22 });
  board.dSample = mDom(dParent, { w: 200, hmin: 40, margin: 'auto', align: 'center' });
  let i = 0;
  for (const item of board.items) {
    let bg = colors[i++];
    item.color = bg;
    let dhex = iDiv(item);
    dhex.onmouseenter = () => onenterHex(item, board);
    dhex.onmouseleave = () => onleaveHex(item, board);
    dhex.onclick = () => onclickHex(item, board);
    mStyle(dhex, { bg });
  }
  return board;
}
function mCols100(dParent, spec, gap = 4) {
  let grid = mDiv(dParent, { padding: gap, gap: gap, box: true, display: 'grid', h: '100%', w: '100%' })
  grid.style.gridTemplateColumns = spec;
  let res = [];
  for (const i of range(stringCount(spec, ' ') + 1)) {
    let d = mDiv(grid, { h: '100%', w: '100%', box: true })
    res.push(d);
  }
  return res;
}
function mCommand(dParent, key, html, opts = {}) {
  if (nundef(html)) html = capitalize(key);
  let close = valf(opts.close, () => { console.log('close', key) });
  let save = valf(opts.save, false);
  let open = valf(opts.open, window[`onclick${capitalize(key)}`]);
  let d = mDom(dParent, { display: 'inline-block' }, { key: key });
  let a = mDom(d, {}, { id: `${key}`, key: `${key}`, tag: 'a', href: '#', html: html, className: 'nav-link', onclick: onclickCommand })
  let cmd = { dParent, elem: d, div: a, key, open, close, save };
  addKeys(opts, cmd);
  return cmd;
}
function mCreate(tag, styles, id) { let d = document.createElement(tag); if (isdef(id)) d.id = id; if (isdef(styles)) mStyle(d, styles); return d; }
function mCreateFrom(htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}
function mCropResizePan(dParent, img, dButtons) {
  let [worig, horig] = [img.offsetWidth, img.offsetHeight];
  mStyle(dParent, { w: worig, h: horig, position: 'relative' });
  const cropBox = mDom(dParent, { position: 'absolute', left: 0, top: 0, w: worig, h: horig }, { className: 'crop-box' });
  const messageBox = mDom(cropBox, { bg: '#ffffff80', fg: 'black', cursor: 'move' });
  let sz = 16;
  const centerBox = mDom(cropBox, { bg: 'red', w: sz, h: sz, rounding: '50%', position: 'absolute' });
  const wHandle = mDom(cropBox, { cursor: 'ew-resize', bg: 'red', w: sz, h: sz, right: -sz / 2, top: '50%', rounding: '50%', position: 'absolute' });
  const hHandle = mDom(cropBox, { cursor: 'ns-resize', bg: 'red', w: sz, h: sz, left: '50%', bottom: -sz / 2, rounding: '50%', position: 'absolute' });
  const whHandle = mDom(cropBox, { cursor: 'nwse-resize', bg: 'red', w: sz, h: sz, right: -sz / 2, bottom: -sz / 2, rounding: '50%', position: 'absolute' });
  let isResizing = null;
  let resizeStartW;
  let resizeStartH;
  function startResize(e) {
    e.preventDefault(); evNoBubble(e);
    isResizing = e.target == wHandle ? 'w' : e.target == hHandle ? 'h' : 'wh';
    [resizeStartW, resizeStartH] = [parseInt(cropBox.style.width), parseInt(cropBox.style.height)];
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
  }
  function resize(e) {
    if (!isResizing) return;
    e.preventDefault(); evNoBubble(e);
    let newWidth, newHeight;
    if (isResizing == 'w') {
      newWidth = e.clientX;
      newHeight = img.height;
    } else if (isResizing == 'h') {
      newWidth = img.width;
      newHeight = e.clientY;
    } else if (isResizing == 'wh') {
      newHeight = e.clientY;
      let aspectRatio = img.width / img.height;
      newWidth = aspectRatio * newHeight;
    }
    [img, dParent].map(x => mStyle(x, { w: newWidth, h: newHeight }));
    setRect(0, 0, newWidth, newHeight);
  }
  function stopResize() {
    isResizing = null;
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
    let [wnew, hnew] = [parseInt(cropBox.style.width), parseInt(cropBox.style.height)]
    redrawImage(img, dParent, 0, 0, resizeStartW, resizeStartH, wnew, hnew, () => setRect(0, 0, wnew, hnew))
  }
  function resizeTo(wnew, hnew) {
    if (hnew == 0) hnew = img.height;
    if (wnew == 0) {
      let aspectRatio = img.width / img.height;
      wnew = aspectRatio * hnew;
    }
    redrawImage(img, dParent, 0, 0, img.width, img.height, wnew, hnew, () => setRect(0, 0, wnew, hnew))
  }
  let isCropping = false;
  let cropStartX;
  let cropStartY;
  function startCrop(ev) {
    ev.preventDefault();
    isCropping = true;
    let pt = getMouseCoordinates(ev);
    [cropStartX, cropStartY] = [pt.x, pt.y - 24];
    document.addEventListener('mousemove', crop); //cropCenter);
    document.addEventListener('mouseup', stopCrop);
  }
  function crop(ev) {
    ev.preventDefault();
    if (isCropping) {
      evNoBubble(ev);
      let pt = getMouseCoordinates(ev);
      let [mouseX, mouseY] = [pt.x, pt.y];
      const width = Math.abs(mouseX - cropStartX);
      const height = Math.abs(mouseY - cropStartY);
      const left = Math.min(mouseX, cropStartX);
      const top = Math.min(mouseY, cropStartY);
      setRect(left, top, width, height);
    }
  }
  function cropX(e) {
    e.preventDefault();
    if (isCropping) {
      const mouseX = e.clientX - dParent.offsetLeft;
      const mouseY = e.clientY - dParent.offsetTop;
      const width = Math.abs(mouseX - cropStartX);
      const height = 300;
      const left = Math.min(mouseX, cropStartX);
      const top = 0;
      setRect(left, top, width, height);
    }
  }
  function cropCenter(e) {
    e.preventDefault();
    if (isCropping) {
      const mouseX = e.clientX - dParent.offsetLeft;
      const mouseY = e.clientY - dParent.offsetTop;
      const radiusX = Math.abs(mouseX - cropStartX);
      const radiusY = Math.abs(mouseY - cropStartY);
      const centerX = cropStartX;
      const centerY = cropStartY;
      const width = radiusX * 2;
      const height = radiusY * 2;
      const left = centerX - radiusX;
      const top = centerY - radiusY;
      setRect(left, top, width, height);
    }
  }
  function stopCrop() {
    isCropping = false;
    document.removeEventListener('mousemove', crop);
    document.removeEventListener('mouseup', stopCrop);
  }
  function cropImage() {
    let [x, y, w, h] = ['left', 'top', 'width', 'height'].map(x => parseInt(cropBox.style[x]));
    redrawImage(img, dParent, x, y, w, h, w, h, () => setRect(0, 0, w, h))
  }
  function cropTo(wnew, hnew) {
    let [x, y, w, h] = ['left', 'top', 'width', 'height'].map(x => parseInt(cropBox.style[x]));
    let xnew = x + (wnew - w) / 2;
    let ynew = y + (hnew - h) / 2;
    redrawImage(img, dParent, xnew, ynew, wnew, wnew, wnew, hnew, () => setRect(0, 0, wnew, hnew))
  }
  let isPanning = false;
  let panStartX;
  let panStartY;
  let cboxX;
  let cboxY;
  function startPan(e) {
    e.preventDefault(); evNoBubble(e);
    isPanning = true;
    panStartX = e.clientX - dParent.offsetLeft;
    panStartY = e.clientY - dParent.offsetTop;
    cboxX = parseInt(cropBox.style.left)
    cboxY = parseInt(cropBox.style.top)
    document.addEventListener('mousemove', pan); //cropCenter);
    document.addEventListener('mouseup', stopPan);
  }
  function pan(e) {
    e.preventDefault();
    if (isPanning) {
      evNoBubble(e);
      const mouseX = e.clientX - dParent.offsetLeft;
      const mouseY = e.clientY - dParent.offsetTop;
      let diffX = panStartX - mouseX;
      let diffY = panStartY - mouseY;
      const left = cboxX - diffX
      const top = cboxY - diffY
      setRect(left, top, parseInt(cropBox.style.width), parseInt(cropBox.style.height));
    }
  }
  function stopPan() {
    isPanning = false;
    document.removeEventListener('mousemove', crop);
    document.removeEventListener('mouseup', stopCrop);
  }
  function getRect() { return ['left', 'top', 'width', 'height'].map(x => parseInt(cropBox.style[x])); }
  function setRect(left, top, width, height) {
    mStyle(cropBox, { left: left, top: top, w: width, h: height });
    messageBox.innerHTML = `size: ${Math.round(width)} x ${Math.round(height)}`;
    mStyle(centerBox, { left: width / 2 - 5, top: height / 2 - 5 });
  }
  function show_cropbox() { cropBox.style.display = 'block' }
  function hide_cropbox() { cropBox.style.display = 'none' }
  function setSize(wnew, hnew) {
    if (isList(wnew)) [wnew, hnew] = wnew;
    if (wnew == 0 || hnew == 0) {
      setRect(0, 0, worig, horig);
      return;
    }
    let [x, y, w, h] = getRect();
    let [cx, cy] = [x + w / 2, y + h / 2];
    let [xnew, ynew] = [cx - (wnew / 2), cy - (hnew / 2)];
    setRect(xnew, ynew, wnew, hnew);
  }
  wHandle.addEventListener('mousedown', startResize);
  hHandle.addEventListener('mousedown', startResize);
  whHandle.addEventListener('mousedown', startResize);
  cropBox.addEventListener('mousedown', startCrop);
  messageBox.addEventListener('mousedown', startPan);
  setRect(0, 0, worig, horig);
  return {
    cropBox: cropBox,
    dParent: dParent,
    elem: cropBox,
    img: img,
    messageBox: messageBox,
    crop: cropImage,
    getRect: getRect,
    hide: hide_cropbox,
    resizeTo: resizeTo,
    setRect: setRect,
    setSize: setSize,
    show: show_cropbox,
  }
}
function mDataTable(reclist, dParent, rowstylefunc, headers, id, showheaders = true) {
  if (nundef(headers)) headers = Object.keys(reclist[0]);
  let t = mTable(dParent, headers, showheaders);
  if (isdef(id)) t.id = `t${id}`;
  let rowitems = [];
  let i = 0;
  for (const u of reclist) {
    let rid = isdef(id) ? `r${id}_${i}` : null;
    r = mTableRow(t, u, headers, rid);
    if (isdef(rowstylefunc)) mStyle(r.div, rowstylefunc(u));
    rowitems.push({ div: r.div, colitems: r.colitems, o: u, id: rid, index: i });
    i++;
  }
  return { div: t, rowitems: rowitems };
}
function mDatalist(dParent, list, opts = {}) {
  var mylist = list;
  var opts = opts;
  addKeys({ alpha: true, filter: 'contains' }, opts);
  let d = mDom(toElem(dParent));
  let optid = getUID('dl');
  let inp = mDom(d, { w: 180, maleft: 4 }, { tag: 'input', className: 'input', placeholder: valf(opts.placeholder, '') });
  if (isdef(opts.value)) inp.value = opts.value;
  let datalist = mDom(d, {}, { tag: 'datalist', id: optid, className: 'datalist' });
  var elem = d;
  for (const w of mylist) { mDom(datalist, {}, { tag: 'option', value: w }); }
  inp.setAttribute('list', optid);
  if (opts.onupdate) {
    inp.addEventListener('keyup', opts.onupdate);
  } else if (isdef(opts.edit)) {
    inp.onmousedown = () => inp.value = '';
  } else {
    inp.onblur = () => {
      const isValueSelected = list.includes(inp.value);
      if (!isValueSelected) {
        inp.value = inp.getAttribute('prev_value'); // Restore the previous value if no selection is made
      }
    }
    inp.onmousedown = () => { inp.setAttribute('prev_value', inp.value); inp.value = ''; }
  }
  return {
    list: mylist,
    elem: elem,
    inpElem: inp,
    listElem: datalist,
    opts: opts,
  }
}
function mDiv(dParent, styles, id, inner, classes, sizing) {
  dParent = toElem(dParent);
  let d = mCreate('div');
  if (dParent) mAppend(dParent, d);
  if (isdef(styles)) mStyle(d, styles);
  if (isdef(classes)) mClass(d, classes);
  if (isdef(id)) d.id = id;
  if (isdef(inner)) d.innerHTML = inner;
  if (isdef(sizing)) { setRect(d, sizing); }
  return d;
}
function mDom(dParent, styles = {}, opts = {}) {
  let tag = valf(opts.tag, 'div');
  let d = document.createElement(tag);
  if (tag == 'textarea') styles.wrap = 'hard';
  mStyle(d, styles);
  applyOpts(d, opts);
  if (isdef(dParent)) mAppend(dParent, d);
  return d;
}
function mDom100(dParent, styles = {}, opts = {}) { copyKeys({ w100: true, h100: true, box: true }, styles); return mDom(dParent, styles, opts); }
function mDraggable(item) {
  let d = iDiv(item);
  d.draggable = true;
  d.ondragstart = drag;
}
function mDropZone(dropZone, onDrop) {
  dropZone.setAttribute('allowDrop', true)
  dropZone.addEventListener('dragover', function (event) {
    event.preventDefault();
    dropZone.style.border = '2px dashed #007bff';
  });
  dropZone.addEventListener('dragleave', function (event) {
    event.preventDefault();
    dropZone.style.border = '2px dashed #ccc';
  });
  dropZone.addEventListener('drop', function (event) {
    event.preventDefault();
    dropZone.style.border = '2px dashed #ccc';
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const reader = new FileReader();
      reader.onload = ev => {
        onDrop(ev.target.result);
      };
      reader.readAsDataURL(files[0]);
    }
  });
  return dropZone;
}
function mDropZone1(dropZone, onDrop) {
  dropZone.addEventListener('dragover', function (event) {
    event.preventDefault();
    dropZone.style.border = '2px dashed #007bff';
  });
  dropZone.addEventListener('dragleave', function (event) {
    event.preventDefault();
    dropZone.style.border = '2px dashed #ccc';
  });
  dropZone.addEventListener('drop', function (evDrop) {
    evDrop.preventDefault();
    dropZone.style.border = '2px dashed #ccc';
    const files = evDrop.dataTransfer.files;
    if (files.length > 0) {
      const reader = new FileReader();
      reader.onload = evReader => {
        onDrop(evReader.target.result, dropZone);
      };
      reader.readAsDataURL(files[0]);
    }
  });
  return dropZone;
}
function mDroppable(item, handler, dragoverhandler) {
  function allowDrop(ev) { ev.preventDefault(); }
  let d = iDiv(item);
  d.ondragover = isdef(dragoverhandler) ? dragoverhandler : allowDrop;
  d.ondrop = handler;
}
function mDummyFocus() {
  if (nundef(mBy('dummy'))) mDom(document.body, { position: 'absolute', top: 0, left: 0, opacity: 0, h: 0, w: 0, padding: 0, margin: 0, outline: 'none', border: 'none', bg: 'transparent' }, { tag: 'button', id: 'dummy', html: 'dummy' }); //addDummy(document.body); //, 'cc');
  mBy('dummy').focus();
}
function mExists(d) { return isdef(toElem(d)); }
async function mFlaskUrl() {
  console.log(DA);
  let session = detectSessionType();
  let server = sessionType == 'fastcomet' ? 'https://moxito.online/' : sessionType == 'telecave' ? 'https://www.telecave.net/' : `http://localhost:8080/${DA.serverdir}/`;
  return server + `${projectName}/php/`;
}
function mFlex(d, wrap = true, halign = 'start', valign = 'center', row = true) {
  d = toElem(d);
  mStyle(d, {
    display: 'flex',
    'flex-wrap': wrap ? 'wrap' : 'nowrap',
    'flex-direction': row ? 'row' : 'column',
    'align-items': row ? valign : halign,
    'justify-content': row ? halign : valign
  });
}
function mFlexBaseline(d) { mStyle(d, { display: 'flex', 'align-items': 'baseline' }); }
function mFlexLR(d) { mStyle(d, { display: 'flex', 'justify-content': 'space-between', 'align-items': 'center' }); }
function mFlexLine(d, startEndCenter = 'center') { mStyle(d, { display: 'flex', 'justify-content': startEndCenter, 'align-items': 'center' }); }
function mFlexSpacebetween(d) { mFlexLR(d); }
function mFlexV(d) { mStyle(d, { display: 'flex', 'align-items': 'center' }); }
function mFlexVWrap(d) { mStyle(d, { display: 'flex', 'align-items': 'center', 'flex-flow': 'row wrap' }); }
function mFlexWrap(d) { mFlex(d, 'w'); }
function mGather(f, d, styles = {}, opts = {}) {
  return new Promise((resolve, _) => {
    let dShield = mShield();
    let fCancel = _ => { dShield.remove(); hotkeyDeactivate('Escape'); resolve(null) };
    let fSuccess = val => { dShield.remove(); hotkeyDeactivate('Escape'); resolve(val) };
    dShield.onclick = fCancel;
    hotkeyActivate('Escape', fCancel);
    let [box, inp] = mInBox(f, dShield, styles, { w100: true }, dictMerge(opts, { fSuccess }));
    let align = opts.align || 'bl';
    mAlign(box, d, { align, offx: -24 });
    inp.focus();
  });
}
function mGetAttr(elem, prop) { return elem.getAttribute(prop); }
async function mGetFiles(dir) {
  let res = await mPhpPost('all', { action: 'dir', dir });
  return res;
}
async function mGetJsonCors(url) {
  let res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    mode: 'cors' // Set CORS mode to enable cross-origin requests
  });
  let json = await res.json();
  return json;
}
async function mGetRoute(route, o = {}, port = 3000) {
  let server = getServerurl(port);
  server += `/${route}?`;
  for (const k in o) { server += `${k}=${o[k]}&`; }
  const response = await fetch(server, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    mode: 'cors',
  });
  return tryJSONParse(await response.text());
}
function mGetStyle(elem, prop) {
  let val;
  elem = toElem(elem);
  if (prop == 'bg') { val = getStyleProp(elem, 'background-color'); if (isEmpty(val)) return getStyleProp(elem, 'background'); }
  else if (isdef(STYLE_PARAMS_2[prop])) { val = getStyleProp(elem, STYLE_PARAMS_2[prop]); }
  else {
    switch (prop) {
      case 'vMargin': val = stringBefore(elem.style.margin, ' '); break;
      case 'hMargin': val = stringAfter(elem.style.margin, ' '); break;
      case 'vPadding': val = stringBefore(elem.style.padding, ' '); break;
      case 'hPadding': val = stringAfter(elem.style.padding, ' '); break;
      case 'box': val = elem.style.boxSizing; break;
      case 'dir': val = elem.style.flexDirection; break;
    }
  }
  if (nundef(val)) val = getStyleProp(elem, prop);
  if (val.endsWith('px')) return firstNumber(val); else return val;
}
function mGetStyles(elem, proplist) {
  let res = {};
  for (const p of proplist) { res[p] = mGetStyle(elem, p) }
  return res;
}
function mGrid(rows, cols, dParent, styles = {}, opts = {}) {
  [rows, cols] = [Math.ceil(rows), Math.ceil(cols)]
  addKeys({ display: 'inline-grid', gridCols: 'repeat(' + cols + ',1fr)' }, styles);
  if (rows) styles.gridRows = 'repeat(' + rows + ',auto)';
  else styles.overy = 'auto';
  let d = mDom(dParent, styles, opts);
  return d;
}
function mGridFromElements(dParent, elems, maxHeight, numColumns) {
  dParent.innerHTML = '';
  let cols = `repeat(${numColumns}, 1fr)`; //'repeat(auto-fill, minmax(0, 1fr))';
  let grid = mDom(dParent, { display: 'inline-grid', gridCols: cols, gap: 10, padding: 4, overy: 'auto', hmax: maxHeight })
  elems.forEach(x => mAppend(grid, x));
  return grid;
}
function mGridFromItems(dParent, items, maxHeight, numColumns) { return mGridFromElements(dParent, items.map(x => iDiv(x)), maxHeight, numColumns); }
function mHasClass(el, className) {
  if (el.classList) return el.classList.contains(className);
  else {
    let x = !!el.className;
    return isString(x) && !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
  }
}
function mHomeLogo(d, key, styles = {}, handler = null, menu = null) {
  addKeys({ display: 'flex', align: 'center', justifyContent: 'center' }, styles);
  let ui = mKey(key, d, { maright: 12, fz: 30, cursor: 'pointer' }, { onclick: handler, menu });
  return ui;
}
function mIfNotRelative(d) { d = toElem(d); if (isEmpty(d.style.position)) d.style.position = 'relative'; }
async function mImageAudioDropper(d) {
  let fileInput = mDom(d, {}, { tag: 'input', type: 'file', accept: 'image/*,audio/*' }); //,{onchange:onchangeFileInput});
  let dropZone = mDom(d, { w: 500, hmin: 300, border: 'white 1px dashed', align: 'center' }); //, { html: 'Drop image here' });
  let bAccept = mDom(d, { margin: 10, display: 'none' }, { tag: 'button', html: 'Accept', onclick: onAccept });
  let bCancel = mDom(d, { margin: 10, display: 'none' }, { tag: 'button', html: 'Cancel', onclick: onCancel });
  function checkIfFromOwnServer(url) {
    const ownOrigin = window.location.origin;
    if (url.startsWith(ownOrigin)) {
      console.log('Dropped from inside the project (server):', url); return true;
    } else {
      console.log('Dropped from external website:', url); return false;
    }
  }
  async function onAccept(ev) {
    let item = DA.droppedElement;
    if (item && item.elem) {
      replaceElement(fileInput, item.elem);
      fileInput.remove();
      dropZone.remove();
      bAccept.remove();
      bCancel.remove();
    }
  }
  async function onCancel(ev) {
    delete DA.droppedElement;
    fileInput.remove();
    dropZone.remove();
    bAccept.remove();
    bCancel.remove();
  }
  async function ondropSomething(ev) {
    console.log('ondropSomething', ev);
    let item = ev.dataTransfer.items[0]; console.log('item', item);
    let file = item.getAsFile();
    if (file) {
      let type = file.type; console.log('file', file, 'type', type);
      let src = URL.createObjectURL(file); console.log('src', src);
      let o = DA.droppedElement = { type, file, src };
      if (type.startsWith('image')) {
        o.elem = await displayImagedata(src);
      } else if (type.startsWith('video')) {
        let player = o.elem = mDom(dropZone, { w: 500, h: 300 }, { tag: 'video', src, controls: true });
        player.play();
      } else if (type.startsWith('audio')) {
        let player = o.elem = mDom(dropZone, {}, { tag: 'audio', src, controls: true });
        player.play();
      } else if (type === 'text/plain') {
        let response = await fetch(URL.createObjectURL(file));
        let text = await response.text();
        o.elem = mDom(dropZone, { margin: 10, rounding: 10, align: 'left', bg: 'white', fg: 'black', padding: 10 }, { tag: 'pre', html: text });
        o.text = text;
      } else {
        mDom(dropZone, {}, { html: 'Unsupported file type or URL' });
      }
    } else {
      file = ev.dataTransfer.files[0];
      const url = await new Promise(resolve => item.getAsString(resolve));
      let type = isdef(file) ? file.type : url.includes('youtube') ? 'video' : 'string';
      console.log('Dropped from website:', url, 'file', file, 'type', type);
      return;
      let isOwnServer = checkIfFromOwnServer(url);
      if (isOwnServer) {
        if (type.startsWith('image')) {
          o.elem = await displayImagedata(src);
        } else if (type.startsWith('video')) {
          let player = o.elem = mDom(dropZone, { w: 500, h: 300 }, { tag: 'video', src, controls: true });
          player.play();
        } else if (type.startsWith('audio')) {
          let player = o.elem = mDom(dropZone, {}, { tag: 'audio', src, controls: true });
          player.play();
        } else if (type === 'text/plain') {
          let response = await fetch(URL.createObjectURL(file));
          let text = await response.text();
          o.elem = mDom(dropZone, { margin: 10, rounding: 10, align: 'left', bg: 'white', fg: 'black', padding: 10 }, { tag: 'pre', html: text });
          o.text = text;
        } else {
          mDom(dropZone, {}, { html: 'Unsupported file type or URL' });
        }
      } else {
        if (url.includes('youtube')) {
          let name = `aud${getNow()}`;
          name = await mGather(mInput, 'dTop', { bg: 'pink', padding: 4 }, { value: name }); console.log('you entered', name);
          mPhpPostAudio(src, `zdata/downloads/${name}`)
          let player = o.elem = mDom(dropZone, { w: 500, h: 300 }, { tag: 'video', src, controls: true });
          player.play();
        } else if (type.startsWith('data:image')) {
          let { dataUrl, width, height } = await resizeImage(file, 500, 1000);
          o.elem = await displayImagedata(dataUrl);
          let name = `img${getNow()}`;
          name = await mGather(mInput, 'dTop', { bg: 'pink', padding: 4 }, { value: name }); console.log('you entered', name);
          console.log(width, height, name);
          uploadImage(dataUrl, `zdata/downloads/${name}.${stringAfter(file.name, '.')}`);
        } else if (type.startsWith('audio')) {
          let name = `aud${getNow()}`;
          name = await mGather(mInput, 'dTop', { bg: 'pink', padding: 4 }, { value: name }); console.log('you entered', name);
          mPhpPostAudio(src, `zdata/downloads/${name}`)
          let player = o.elem = mDom(dropZone, {}, { tag: 'audio', src, controls: true });
          player.play();
        } else if (type === 'text/plain') {
          let response = await fetch(URL.createObjectURL(file));
          let text = await response.text();
          o.elem = mDom(dropZone, { margin: 10, rounding: 10, align: 'left', bg: 'white', fg: 'black', padding: 10 }, { tag: 'pre', html: text });
          o.text = text;
        } else {
          mDom(dropZone, {}, { html: 'Unsupported file type or URL' });
        }
      }
    }
    mStyle(bAccept, { display: 'inline-block' });
    mStyle(bCancel, { display: 'inline-block' });
  }
  async function onchangeFileinput(ev) {
    let files = ev.target.files;
    let file = files[0]; console.log(file);
    let src = URL.createObjectURL(file); console.log(src);
    await displayImagedata(src);
  }
  async function displayImagedata(src) {
    mClear(dropZone);
    let img = await mLoadImgAsync(dropZone, { wmax: 500 }, { tag: 'img', src: src });
    console.log('img dims', img.width, img.height);
    return img;
  }
  function preventDefaults(ev) { ev.preventDefault(); ev.stopPropagation(); }
  function highlight(ev) { mClass(ev.target, 'framedPicture'); }
  function unhighlight(ev) { mClassRemove(ev.target, 'framedPicture'); }
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evname => {
    dropZone.addEventListener(evname, preventDefaults, false);
    document.body.addEventListener(evname, preventDefaults, false);
  });
  ['dragenter', 'dragover'].forEach(evname => { dropZone.addEventListener(evname, highlight, false); });
  ['dragleave', 'drop'].forEach(evname => { dropZone.addEventListener(evname, unhighlight, false); });
  dropZone.addEventListener('drop', ondropSomething, false);
  fileInput.addEventListener('change', onchangeFileinput, false);
}
async function mImageDropper(d) {
  let fileInput = mDom(d, {}, { tag: 'input', type: 'file', accept: 'image/*' }); //,{onchange:onchangeFileInput});
  let dropZone = mDom(d, { w: 500, hmin: 300, border: 'white 1px dashed', align: 'center' }, { html: 'Drop image here' });
  function checkIfFromOwnServer(url) {
    const ownOrigin = window.location.origin;
    if (url.startsWith(ownOrigin)) {
      console.log('Dropped from inside the project (server):', url); return true;
    } else {
      console.log('Dropped from external website:', url); return false;
    }
  }
  async function ondropImage(ev) {
    console.log('ondropImage', ev);
    let item = ev.dataTransfer.items[0]; console.log(item);
    let file = item.getAsFile(); console.log(file);
    if (file) await displayImagedata(URL.createObjectURL(file));
    else {
      file = ev.dataTransfer.files[0];
      const url = await new Promise(resolve => item.getAsString(resolve));
      console.log('Dropped from website:', url);
      let isOwnServer = checkIfFromOwnServer(url);
      if (isOwnServer) {
        await displayImagedata(url);
      } else {
        let { dataUrl, width, height } = await resizeImage(file, 500, 1000);
        await displayImagedata(dataUrl);
        let name = `img${getNow()}`;
        name = await mGather(mInput, 'dTop', { bg: 'pink', padding: 4 }, { value: name }); console.log('you entered', name);
        console.log(width, height, name);
        uploadImage(dataUrl, `zdata/downloads/${name}.${stringAfter(file.name, '.')}`);
      }
    }
  }
  async function onchangeFileinput(ev) {
    let files = ev.target.files;
    let file = files[0];
    let src = URL.createObjectURL(file);
    await displayImagedata(src);
  }
  async function displayImagedata(src) {
    mClear(dropZone);
    let img = await mLoadImgAsync(dropZone, { wmax: 500 }, { tag: 'img', src: src });
    console.log('img dims', img.width, img.height);
  }
  function preventDefaults(ev) { ev.preventDefault(); ev.stopPropagation(); }
  function highlight(ev) { mClass(ev.target, 'framedPicture'); }
  function unhighlight(ev) { mClassRemove(ev.target, 'framedPicture'); }
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evname => {
    dropZone.addEventListener(evname, preventDefaults, false);
    document.body.addEventListener(evname, preventDefaults, false);
  });
  ['dragenter', 'dragover'].forEach(evname => { dropZone.addEventListener(evname, highlight, false); });
  ['dragleave', 'drop'].forEach(evname => { dropZone.addEventListener(evname, unhighlight, false); });
  dropZone.addEventListener('drop', ondropImage, false);
  fileInput.addEventListener('change', onchangeFileinput, false);
}
async function mImageMusicDropper(d) {
  d = toElem(d);
  mFlexWrap(d);
  let fileInput = mDom(d, { bg: 'blue', h: 50 }, { tag: 'input', type: 'file', accept: 'image/*,audio/*' });
  mLinebreak(d);
  let dropZone = mDom(d, { w: 500, hmin: 300, border: 'white 1px dashed', align: 'center' }, { html: 'Drop image here' });
  function checkIfFromOwnServer(url) {
    const ownOrigin = window.location.origin;
    if (url.startsWith(ownOrigin)) {
      console.log('Dropped from inside the project (server):', url); return true;
    } else {
      console.log('Dropped from external website:', url); return false;
    }
  }
  async function ondropImage(ev) {
    console.log('ondropImage', ev);
    let item = ev.dataTransfer.items[0]; console.log(item);
    let file = item.getAsFile(); console.log(file);
    if (file) await displayImagedata(URL.createObjectURL(file));
    else {
      file = ev.dataTransfer.files[0];
      const url = await new Promise(resolve => item.getAsString(resolve));
      console.log('Dropped from website:', url);
      let isOwnServer = checkIfFromOwnServer(url);
      if (isOwnServer) {
        await displayImagedata(url);
      } else {
        let { dataUrl, width, height } = await resizeImage(file, 500, 1000);
        await displayImagedata(dataUrl);
        let name = `img${getNow()}`;
        name = await mGather(mInput, 'dTop', { bg: 'pink', padding: 4 }, { value: name }); console.log('you entered', name);
        console.log(width, height, name);
        uploadImage(dataUrl, `zdata/downloads/${name}.${stringAfter(file.name, '.')}`);
      }
    }
  }
  async function onchangeFileinput(ev) {
    let files = ev.target.files;
    let file = files[0];
    let src = URL.createObjectURL(file);
    await displayImagedata(src);
  }
  async function displayImagedata(src) {
    mClear(dropZone);
    let img = await mLoadImgAsync(dropZone, { wmax: 500 }, { tag: 'img', src: src });
    console.log('img dims', img.width, img.height);
  }
  function preventDefaults(ev) { ev.preventDefault(); ev.stopPropagation(); }
  function highlight(ev) { mClass(ev.target, 'framedPicture'); }
  function unhighlight(ev) { mClassRemove(ev.target, 'framedPicture'); }
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evname => {
    dropZone.addEventListener(evname, preventDefaults, false);
    document.body.addEventListener(evname, preventDefaults, false);
  });
  ['dragenter', 'dragover'].forEach(evname => { dropZone.addEventListener(evname, highlight, false); });
  ['dragleave', 'drop'].forEach(evname => { dropZone.addEventListener(evname, unhighlight, false); });
  dropZone.addEventListener('drop', ondropImage, false);
  fileInput.addEventListener('change', onchangeFileinput, false);
}
function mImg(src, d, styles = {}, opts = {}) {
  let [w, h] = mSizeSuccession(styles, 40);
  addKeys({ w, h, 'object-fit': 'cover', 'object-position': 'center center' }, styles);
  addKeys({ tag: 'img', src }, opts)
  let img = mDom(d, styles, opts);
  return img;
}
function mImgAsync(d, styles = {}, opts = {}, callback = null) {
  return new Promise((resolve, reject) => {
    let img = document.createElement('img');
    mAppend(d, img);
    let [w, h] = mSizeSuccession(styles, 40);
    addKeys({ w, h, 'object-fit': 'cover', 'object-position': 'center center' }, styles);
    addKeys({ tag: 'img' }, opts);
    mStyle(img, styles, opts);
    img.onload = async () => {
      if (callback) callback(img);
      resolve(img);
    };
    img.onerror = (error) => {
      reject(error);
    };
    img.src = opts.src;
  });
}
function mInBox(f, dParent, boxStyles = {}, inpStyles = {}, opts = {}) {
  let dbox = mDom(dParent, boxStyles);
  let dinp = f(dbox, inpStyles, opts);
  return [dbox, dinp];
}
function mInput(dParent, styles = {}, opts = {}) {
  addKeys({ tag: 'input', id: getUID(), placeholder: '', autocomplete: "off", value: '', selectOnClick: true, type: "text" }, opts);
  let d = mDom(dParent, styles, opts);
  d.onclick = opts.selectOnClick ? ev => { evNoBubble(ev); d.select(); } : ev => { evNoBubble(ev); };
  d.onkeydown = ev => {
    if (ev.key == 'Enter' && isdef(opts.fSuccess)) { evNoBubble(ev); opts.fSuccess(d.value); }
    else if (ev.key == 'Escape' && isdef(opts.fCancel)) { evNoBubble(ev); opts.fCancel(); }
  }
  return d;
}
function mInsert(dParent, elem, index = 0) {
  dParent = toElem(dParent)
  if (dParent.childNodes.length <= index) {
    dParent.appendChild(elem);
  } else {
    dParent.insertBefore(elem, dParent.childNodes[index]);
  }
  return elem;
}
function mItem(liveprops = {}, opts = {}) {
  let id = valf(opts.id, getUID());
  let item = opts;
  item.live = liveprops;
  item.id = id;
  let d = iDiv(item); if (isdef(d)) d.id = id;
  Items[id] = item;
  return item;
}
function mKey(imgKey, d, styles = {}, opts = {}) {
  styles = jsCopy(styles);
  let o = imgKey.includes('.') ? { src: imgKey } : opts.prefer == 'plain' ? { plain: imgKey } : lookup(M.superdi, [imgKey]);
  let type = opts.prefer;
  let types = ['src', 'img', 'photo', 'uni', 'emo', 'fa6', 'fa', 'ga', 'plain'];
  if (nundef(o[type])) type = types.find(x => isdef(o[x]));
  let d0 = mDom(d, styles, opts);
  let [w, h] = mSizeSuccession(styles, 100);
  if (['img', 'src', 'photo'].includes(type)) {
    let astyle = { w, h, fit: o && o.cats.includes('card') ? 'contain' : 'cover', 'object-position': 'center center' };
    mDom(d0, astyle, { ...opts, tag: 'img', src: o[type], alt: imgKey });
  } else if (type == 'plain') {
    let [family, fz] = [valf(styles.family, 'opensans'), valf(styles.fz, 12)]; //console.log('fz', fz)
    mStyle(d0, { family, fz }, { html: o[type] });
    let x = mDom(d0, { family, fz }, { ...opts, html: o[type] }); //console.log(x)
  } else {
    let family = Families[type] || 'inherit';
    let text = ['fa6', 'fa', 'ga'].includes(type) ? `&#x${o[type]};` : o[type];
    let fz = styles.fz;
    let astyles = { fz, family, };
    mStyle(d0, astyles, { html: text });
  }
  if (isdef(opts.label)) mDom(d0, { fz: 18, family: 'opensans', align: 'center' }, { html: opts.label });
  return d0;
}
function mLMR(dParent) {
  dParent = toElem(dParent);
  let d = mDom(dParent, { display: 'flex', 'align-items': 'center', 'justify-content': 'space-between', 'flex-flow': 'row nowrap' });
  let stflex = { gap: 10, display: 'flex', 'align-items': 'center' };
  let [l, m, r] = [mDom(d, stflex), mDom(d, stflex), mDom(d, stflex)];
  return [d, l, m, r];
}
function mLacunaCirles(dParent, n = 49, neach = 7, sz = 10, rand = .7) {
  let [w, h] = [mGetStyle(dParent, 'w'), mGetStyle(dParent, 'h')];
  let clist = lacunaColors();
  let points = generateRandomPointsRect(n, w, h, rand);
  let colors = generateRepeatedColors(n, neach, clist); arrShuffle(colors);
  for (let i = 0; i < n; i++) { points[i].bg = colors[i]; points[i].sz = sz; points[i].id = getUID(); }
  return points;
}
function mLayout(dParent, rowlist, colt, rowt, styles = {}, opts = {}) {
  dParent = toElem(dParent);
  mStyle(dParent, styles);
  rowlist = rowlist.map(x => x.replaceAll('@', valf(opts.suffix, ''))); //console.log(rowlist);
  rowt = rowt.replaceAll('@', valf(opts.hrow, 30));
  colt = colt.replaceAll('@', valf(opts.wcol, 30));
  let areas = `'${rowlist.join("' '")}'`;
  if (nundef(DA.divNames)) DA.divNames = [];
  if (nundef(DA.divShaded)) DA.divShaded = [];
  let newNames = mAreas(dParent, areas, colt, rowt);
  let names = DA.divNames = Array.from(new Set(DA.divNames.concat(newNames)));
  if (nundef(styles.bgSrc)) {newNames.map(x=>addIf(DA.divShaded,x)); mShade(newNames, 2, 1);}
  return names.map(x => mBy(x));
}
function mLayoutLM(dParent, styles = {}, opts = {}) {
  let rowlist = [`dLeft@ dMain@`];
  let colt = `auto 1fr`;
  let rowt = `1fr`;
  return mLayout(dParent, rowlist, colt, rowt, styles, opts);
}
function mLayoutLMR(dParent, styles = {}, opts = {}) {
  let rowlist = [`dLeft@ dMain@ dRight@`];
  let colt = `minmax(@px, auto) 1fr minmax(@px, auto)`;
  let rowt = `1fr`;
  return mLayout(dParent, rowlist, colt, rowt, styles, opts);
}
function mLayoutLR(dParent, styles = {}, opts = {}) {
  let rowlist = [`dLeft@ dRight@`];
  let colt = `auto 1fr`;
  let rowt = `1fr`;
  return mLayout(dParent, rowlist, colt, rowt, styles, opts);
}
function mLayoutM(dParent, styles = {}, opts = {}) {
  let rowlist = [`dMain@`];
  let colt = `1fr`;
  let rowt = `1fr`;
  return mLayout(dParent, rowlist, colt, rowt, styles, opts);
}
function mLayoutMR(dParent, styles = {}, opts = {}) {
  let rowlist = [`dMain@ dRight@`];
  let colt = `minmax(auto, @px) 1fr`;
  let rowt = `1fr`;
  return mLayout(dParent, rowlist, colt, rowt, styles, opts);
}
function mLayoutTLM(dParent, styles = {}, opts = {}) {
  let rowlist = [`dTop@ dTop@`, `dLeft@ dMain@`];
  let colt = `minmax(@px, auto) 1fr`;
  let rowt = `minmax(@px, auto) 1fr`;
  return mLayout(dParent, rowlist, colt, rowt, styles, opts);
}
function mLayoutTLMR(dParent, styles = {}, opts = {}) {
  let rowlist = [`dTop@ dTop@ dTop@`, `dLeft@ dMain@ dRight@`];
  let colt = `minmax(@px, auto) 1fr minmax(@px, auto)`;
  let rowt = `minmax(@px, auto) 1fr`;
  return mLayout(dParent, rowlist, colt, rowt, styles, opts);
}
function mLayoutTLMRS(dParent, styles = {}, opts = {}) {
  let rowlist = [`dTop@ dTop@ dTop@`, `dLeft@ dMain@ dRight@`, `dStatus@ dStatus@ dStatus@`];
  let colt = `minmax(@px, auto) 1fr minmax(@px, auto)`;
  let rowt = `minmax(@px, auto) 1fr minmax(@px, auto)`;
  return mLayout(dParent, rowlist, colt, rowt, styles, opts);
}
function mLayoutTLMS(dParent, styles = {}, opts = {}) {
  let rowlist = [`dTop@ dTop@`, `dLeft@ dMain@`, `dStatus@ dStatus@`];
  let colt = `minmax(@px, auto) 1fr`;
  let rowt = `minmax(@px, auto) 1fr minmax(@px, auto)`;
  return mLayout(dParent, rowlist, colt, rowt, styles, opts);
}
function mLayoutTM(dParent, styles = {}, opts = {}, hrow = 30) {
  let rowlist = [`dTop@`, `dMain@`];
  let colt = `1fr`;
  let rowt = `minmax(@px, auto) 1fr`;
  return mLayout(dParent, rowlist, colt, rowt, styles, opts);
}
function mLayoutTMS(dParent, styles = {}, opts = {}, hrow = 30) {
  let rowlist = [`dTop@`, `dMain@`, `dStatus@`];
  let colt = `1fr`;
  let rowt = `minmax(@px, auto) 1fr minmax(@px, auto)`;
  return mLayout(dParent, rowlist, colt, rowt, styles, opts);
}
function mLinebreak(dParent, gap = 0) {
  dParent = toElem(dParent);
  let display = getComputedStyle(dParent).display;
  if (display == 'flex') {
    d = mDom(dParent, { 'flex-basis': '100%', h: gap, hline: gap, w: '100%' }, { html: '' });
  } else {
    d = mDom(dParent, { hline: gap, h: gap }, { html: '&nbsp;' });
  }
  return d;
}
function mLoadImgAsync(d, styles = {}, opts = {}, callback = null) {
  return new Promise((resolve, reject) => {
    let img = document.createElement('img');
    mAppend(d, img);
    mStyle(img, styles, opts);
    img.onload = async () => {
      if (callback) callback(img);
      resolve(img);
    };
    img.onerror = (error) => {
      reject(error);
    };
    img.src = opts.src;
  });
}
function mMagnify(elem, scale = 5) {
  elem.classList.add(`topmost`);
  MAGNIFIER_IMAGE = elem;
  const rect = elem.getBoundingClientRect();
  let [w, h] = [rect.width * scale, rect.height * scale];
  let [cx, cy] = [rect.width / 2 + rect.left, rect.height / 2 + rect.top];
  let [l, t, r, b] = [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2];
  let originX = 'center';
  let originY = 'center';
  let [tx, ty] = [0, 0];
  if (l < 0) { tx = -l / scale; }
  if (t < 0) { ty = -t / scale; }
  if (r > window.innerWidth) { tx = -(r - window.innerWidth) / scale; }
  if (b > window.innerHeight) { ty = -(b - window.innerHeight) / scale; }
  elem.style.transform = `scale(${scale}) translate(${tx}px,${ty}px)`;
  elem.style.transformOrigin = `${originX} ${originY}`;
}
function mMagnifyOff() {
  if (!MAGNIFIER_IMAGE) return;
  let elem = MAGNIFIER_IMAGE;
  MAGNIFIER_IMAGE = null;
  elem.classList.remove(`topmost`);
  elem.style.transform = null;
}
async function mMediaDropper(d) {
  let fileInput = mDom(d, {}, { tag: 'input', type: 'file', accept: 'image/*,video/*,audio/*,.txt' });
  let dropZone = mDom(d, { w: 500, hmin: 300, border: 'white 1px dashed', align: 'center' }, { html: 'Drop media or YouTube link here' });
  function checkIfFromOwnServer(url) {
    const ownOrigin = window.location.origin;
    if (url.startsWith(ownOrigin)) {
      console.log('Dropped from inside the project (server):', url);
      return true;
    } else {
      console.log('Dropped from external website:', url);
      return false;
    }
  }
  function extractYouTubeID(url) {
    let match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    return match ? match[1] : null;
  }
  async function ondropMedia(ev) {
    ev.preventDefault();
    let item = ev.dataTransfer.items[0];
    let file = item?.getAsFile();
    let url = await new Promise(resolve => item.getAsString(resolve));
    if (url) {
      let ytID = extractYouTubeID(url);
      if (ytID) {
        await displayYouTubeVideo(ytID);
      } else {
        let isOwnServer = checkIfFromOwnServer(url);
        await displayMediaData(url, 'unknown');
      }
    } else if (file) {
      await displayMediaData(URL.createObjectURL(file), file.type);
    }
  }
  async function onchangeFileinput(ev) {
    let file = ev.target.files[0];
    if (file) {
      await displayMediaData(URL.createObjectURL(file), file.type);
    }
  }
  async function displayMediaData(src, type) {
    mClear(dropZone);
    if (type.startsWith('image')) {
      mLoadImgAsync(dropZone, { wmax: 500 }, { tag: 'img', src: src });
    } else if (type.startsWith('video')) {
      mDom(dropZone, { w: 500 }, { tag: 'video', src: src, controls: true });
    } else if (type.startsWith('audio')) {
      mDom(dropZone, {}, { tag: 'audio', src: src, controls: true });
    } else if (type === 'text/plain') {
      let response = await fetch(src);
      let text = await response.text();
      mDom(dropZone, {}, { tag: 'pre', html: text });
    } else {
      mDom(dropZone, {}, { html: 'Unsupported file type or URL' });
    }
  }
  async function displayYouTubeVideo(videoID) {
    mClear(dropZone);
    let iframe = mDom(dropZone, { w: 500, h: 300 }, {
      tag: 'iframe',
      src: `https://www.youtube.com/embed/${videoID}`,
      allow: 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture',
      allowfullscreen: true
    });
  }
  function preventDefaults(ev) { ev.preventDefault(); ev.stopPropagation(); }
  function highlight(ev) { mClass(ev.target, 'framedPicture'); }
  function unhighlight(ev) { mClassRemove(ev.target, 'framedPicture'); }
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evname => {
    dropZone.addEventListener(evname, preventDefaults, false);
    document.body.addEventListener(evname, preventDefaults, false);
  });
  ['dragenter', 'dragover'].forEach(evname => { dropZone.addEventListener(evname, highlight, false); });
  ['dragleave', 'drop'].forEach(evname => { dropZone.addEventListener(evname, unhighlight, false); });
  dropZone.addEventListener('drop', ondropMedia, false);
  fileInput.addEventListener('change', onchangeFileinput, false);
}
function mMenu(dParent, key) { let [d, l, m, r] = mLMR(dParent); return { dParent, elem: d, l, m, r, key, cur: null }; }
function mMenuH(d, text, styles = {}, handler = null, menu = null, kennzahl = null) {
  if (nundef(kennzahl)) kennzahl = getUID();
  addKeys({ deco: 'none', className: 'a', rounding: 10, wmin: 100, margin: 4, align: 'center' }, styles)
  let ui = mDom(d, styles, { tag: 'a', html: text, href: '#', onclick: handler, kennzahl, menu });
  return ui;
}
function mMenuV(d, text, styles = {}, handler = null, menu = null, kennzahl = null) {
  if (nundef(kennzahl)) kennzahl = getUID();
  addKeys({ display: 'block', deco: 'none', className: 'a', rounding: 10, margin: 4, align: 'center' }, styles)
  let ui = mDom(d, styles, { tag: 'a', html: text, href: '#', onclick: handler, kennzahl, menu });
  return ui;
}
function mNewline(d, gap = 1) { mDom(d, { h: gap }); }
function mNode(o, dParent, title, isSized = false) {
  let d = mCreate('div');
  mYaml(d, o);
  let pre = d.getElementsByTagName('pre')[0];
  pre.style.fontFamily = 'inherit';
  if (isdef(title)) mInsert(d, mText(title));
  if (isdef(dParent)) mAppend(dParent, d);
  if (isDict(o)) d.style.textAlign = 'left';
  if (isSized) addClass(d, 'centered');
  return d;
}
async function mNodeUrl() {
  console.log(DA);
  let session = detectSessionType();
  let server = sessionType == 'fastcomet' ? 'https://moxito.online/' : sessionType == 'telecave' ? 'https://www.telecave.net/' : `http://localhost:8080/${DA.serverdir}/`;
  return server + `${projectName}/php/`;
}
function mOnEnter(elem, handler) {
  elem.addEventListener('keydown', ev => {
    if (ev.key == 'Enter') {
      ev.preventDefault();
      mDummyFocus();
      if (handler) handler(ev);
    }
  });
}
function mOnEnterInput(elem, handler) {
  elem.addEventListener('keydown', ev => {
    if (ev.key == 'Enter') {
      ev.preventDefault();
      mDummyFocus();
      if (handler) handler(ev.target.value);
    }
  });
}
async function mPalette(dParent, src, showPal = true, showImg = false) {
  async function getPaletteFromCanvas(canvas, n) {
    if (nundef(ColorThiefObject)) ColorThiefObject = new ColorThief();
    const dataUrl = canvas.toDataURL();
    const img = new Image();
    img.src = dataUrl;
    return new Promise((resolve, reject) => {
      img.onload = () => {
        const palette = ColorThiefObject.getPalette(img, n);
        resolve(palette ? palette.map(x => colorFrom(x)) : ['black', 'white']);
      };
      img.onerror = () => {
        reject(new Error('Failed to load the image from canvas.'));
      };
    });
  }
  let dc = mDom(dParent, { display: showImg ? 'inline' : 'none' })
  let ca = await getCanvasCtx(dc, { w: 100, h: 100, fill: 'white' }, { src });
  let palette = await getPaletteFromCanvas(ca.cv);
  if (!showImg) dc.remove();
  if (showPal) showPaletteMini(dParent, palette);
  return palette;
}
async function mPhpPost(cmd, o, jsonResult = true) {
  let server = await getDA('phpUrl');
  if (isdef(o.path) && (o.path.startsWith('zdata') || o.path.startsWith('y'))) o.path = '../../' + o.path;
  if (VERBOSE) console.log('to php:', server + `${cmd}.php`, o);
  let res = await fetch(server + `${cmd}.php`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(o),
    }
  );
  let text;
  try {
    text = await res.text();
    if (!jsonResult) {
      return text;
    }
    let obj = JSON.parse(text);
    if (VERBOSE) console.log('from php:\n', obj);
    let mkeys = ["config", "superdi", "users", "details"];
    for (const k of mkeys) {
      if (isdef(obj[k])) {
        M[k] = obj[k];
        if (k == "superdi") {
          loadSuperdiAssets();
        } else if (k == "users") {
          loadUsers();
        }
      }
    }
    return obj;
  } catch (e) {
    return isString(text) ? text : e;
  }
}
function mPickOneOfGrid(dParent, styles = {}, opts = {}) {
  let d0 = mDom(dParent, dictMerge(styles, { gap: 6 }), opts);
  mGrid(d0);
  function onclick(ev) {
    evNoBubble(ev);
    if (isdef(opts.fSuccess)) opts.fSuccess(ev.target.innerHTML);
  }
  for (const html of opts.list) {
    mDom(d0, {}, { tag: 'button', html, onclick });
  }
  return d0;
}
function mPizza(dParent, sz) {
  let args = Array.from(arguments).slice(2);
  args = args.map(x => colorFrom(x))
  if (args.lenght == 0) return mDom(dParent, { w: sz, h: sz, border: 'silver', round: true });
  else if (args.length == 1) return mDom(dParent, { bg: args[0], w: sz, h: sz, border: 'silver', round: true });
  let html = generatePizzaSvg(sz, ...args);
  let el = mCreateFrom(html);
  let d = mDom(dParent, { patop: 4 }); //,{patop:4});
  mAppend(d, el);
  return el;
}
function mPlace(elem, pos, offx, offy) {
  elem = toElem(elem);
  pos = pos.toLowerCase();
  let dParent = elem.parentNode; mIfNotRelative(dParent);
  let hor = valf(offx, 0);
  let vert = isdef(offy) ? offy : hor;
  if (pos[0] == 'c' || pos[1] == 'c') {
    let dpp = dParent.parentNode;
    let opac = mGetStyle(dParent, 'opacity'); //console.log('opac', opac);
    if (nundef(dpp)) { mAppend(document.body, dParent); mStyle(dParent, { opacity: 0 }) }
    let rParent = getRect(dParent);
    let [wParent, hParent] = [rParent.w, rParent.h];
    let rElem = getRect(elem);
    let [wElem, hElem] = [rElem.w, rElem.h];
    if (nundef(dpp)) { dParent.remove(); mStyle(dParent, { opacity: valf(opac, 1) }) }
    switch (pos) {
      case 'cc': mStyle(elem, { position: 'absolute', left: hor + (wParent - wElem) / 2, top: vert + (hParent - hElem) / 2 }); break;
      case 'tc': mStyle(elem, { position: 'absolute', left: hor + (wParent - wElem) / 2, top: vert }); break;
      case 'bc': mStyle(elem, { position: 'absolute', left: hor + (wParent - wElem) / 2, bottom: vert }); break;
      case 'cl': mStyle(elem, { position: 'absolute', left: hor, top: vert + (hParent - hElem) / 2 }); break;
      case 'cr': mStyle(elem, { position: 'absolute', right: hor, top: vert + (hParent - hElem) / 2 }); break;
    }
    return;
  }
  let di = { t: 'top', b: 'bottom', r: 'right', l: 'left' };
  elem.style.position = 'absolute';
  let kvert = di[pos[0]], khor = di[pos[1]];
  elem.style[kvert] = vert + 'px'; elem.style[khor] = hor + 'px';
}
function mPopup(dParent, styles = {}, opts = {}) {
  if (nundef(dParent)) dParent = document.body;
  if (isdef(mBy(opts.id))) mRemove(opts.id);
  mIfNotRelative(dParent);
  let animation = 'diamond-in-center .5s ease-in-out'; let transition = 'opacity .5s ease-in-out';
  addKeys({ animation, bg: 'white', fg: 'black', padding: 20, rounding: 12, top: 50, left: '50%', transform: 'translateX(-50%)', position: 'absolute' }, styles);
  let popup = mDom(dParent, styles, opts);
  mButtonX(popup);
  return popup;
}
function mPos(d, x, y, offx = 0, offy = 0, unit = 'px') {
  let dParent = d.parentNode; mIfNotRelative(dParent);
  mStyle(d, { left: `${x + offx}${unit}`, top: `${y + offy}${unit}`, position: 'absolute' });
}
async function mPostRoute(route, o = {}) {
  let server = getServerurl();
  server += `/${route}`;
  const response = await fetch(server, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    mode: 'cors',
    body: JSON.stringify(o)
  });
  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    return 'ERROR 1';
  }
}
async function mPostYaml(o, path) {
  return await mPostRoute('postYaml', { o, path });
}
function mRadio(label, val, name, dParent, styles = {}, onchangeHandler, group_id, is_on) {
  let cursor = styles.cursor; delete styles.cursor;
  let d = mDom(dParent, styles, { id: group_id + '_' + val });
  let id = isdef(group_id) ? `i_${group_id}_${val}` : getUID();
  let type = isdef(group_id) ? 'radio' : 'checkbox';
  let checked = isdef(is_on) ? is_on : false;
  let inp = mCreateFrom(`<input class='radio' id='${id}' type="${type}" name="${name}" value="${val}">`);
  if (checked) inp.checked = true;
  let text = mCreateFrom(`<label for='${inp.id}'>${label}</label>`);
  if (isdef(cursor)) { inp.style.cursor = text.style.cursor = cursor; }
  mAppend(d, inp);
  mAppend(d, text);
  if (isdef(onchangeHandler)) {
    inp.onchange = ev => {
      ev.cancelBubble = true;
      if (onchangeHandler == 'toggle') {
      } else if (isdef(onchangeHandler)) {
        onchangeHandler(ev.target.checked, name, val);
      }
    };
  }
  return d;
}
function mRadioGroup(dParent, styles, id, legend, legendstyles = {}) {
  let dOuter = mDom(dParent, { bg: 'white', rounding: 10, margin: 4 })
  let f = mCreate('fieldset');
  f.id = id;
  if (isdef(styles)) mStyle(f, styles);
  if (isdef(legend)) {
    let l = mCreate('legend');
    l.innerHTML = legend;
    mAppend(f, l);
    if (isdef(legendstyles)) { mStyle(l, legendstyles); }
  }
  mAppend(dOuter, f);
  return f;
}
function mRemove(elem) {
  elem = toElem(elem); if (nundef(elem)) return;
  var a = elem.attributes, i, l, n;
  if (a) {
    for (i = a.length - 1; i >= 0; i -= 1) {
      n = a[i].name;
      if (typeof elem[n] === 'function') {
        elem[n] = null;
      }
    }
  }
  a = elem.childNodes;
  if (a) {
    l = a.length;
    for (i = a.length - 1; i >= 0; i -= 1) {
      mRemove(elem.childNodes[i]);
    }
  }
  elem.remove();
}
function mRemoveClass(d) { for (let i = 1; i < arguments.length; i++) d.classList.remove(arguments[i]); }
function mRemoveIfExists(d) { d = toElem(d); if (isdef(d)) d.remove(); }
function mRemoveStyle(d, styles) { for (const k of styles) d.style[k] = null; }
function mRise(d, ms = 800) {
  toElem(d).animate([{ opacity: 0, transform: 'translateY(50px)' }, { opacity: 1, transform: 'translateY(0px)' },], { fill: 'both', duration: ms, easing: 'ease' });
}
function mRows100(dParent, spec, gap = 4) {
  let grid = mDiv(dParent, { padding: gap, gap: gap, box: true, display: 'grid', h: '100%', w: '100%' })
  grid.style.gridTemplateRows = spec;
  let res = [];
  for (const i of range(stringCount(spec, ' ') + 1)) {
    let d = mDiv(grid, { h: '100%', w: '100%', box: true })
    res.push(d);
  }
  return res;
}
function mScrollBehavior(container, hScroll, hSnapp) {
  let isScrolling = false;
  container.tabIndex = 0;
  let isUserScrolling = false;
  let scrollTimeout;
  container.addEventListener('keydown', (e) => {
    if (e.key === 'PageDown' || e.key === 'PageUp') {
      e.preventDefault();
      const direction = e.key === 'PageDown' ? 1 : -1;
      smoothScrollBy(container, direction * hScroll);
    }
  });
  let wheelScrolling = false;
  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (wheelScrolling) return;
    wheelScrolling = true;
    const direction = e.deltaY > 0 ? 1 : -1;
    smoothScrollBy(container, direction * hScroll);
    setTimeout(() => {
      wheelScrolling = false;
    }, 340);
  }, { passive: false });
  container.addEventListener('scroll', () => {
    isUserScrolling = true;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      snapScroll(container);
      isUserScrolling = false;
    }, 150);
  });
  function smoothScrollBy(element, distance) {
    element.scrollBy({
      top: distance,
      behavior: 'smooth'
    });
  }
  function snapScroll(element) {
    const pageHeight = hSnapp;
    const currentScroll = element.scrollTop;
    const pageIndex = Math.round(currentScroll / pageHeight);
    const targetScroll = pageIndex * pageHeight;
    if (Math.abs(targetScroll - currentScroll) > 2) {
      element.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    }
  }
}
function mSelect(dParent, styles = {}, opts = {}) {
  let d0 = mDom(dParent, dictMerge(styles, { gap: 6 }), opts);
  mCenterCenterFlex(d0);
  function onclick(ev) {
    evNoBubble(ev);
    if (isdef(opts.fSuccess)) opts.fSuccess(ev.target.innerHTML);
  }
  for (const html of opts.list) {
    mDom(d0, {}, { tag: 'button', html, onclick });
  }
  return d0;
}
function mSetAttr(elem, prop, val) { elem.setAttribute(prop, val); }
function mShade(names, offset = 1, contrast = 1) {
  let palette = paletteTransWhiteBlack(names.length * contrast + 2 * offset).slice(offset);
  //console.log('shading',names);
  for (const name of names) {
    let d = toElem(name);
    mStyle(d, { bg: palette.shift(), fg: 'contrast', box: true });
  }
}
function mShape(shape, dParent, styles = {}, opts = {}) {
  styles = jsCopy(styles);
  styles.display = 'inline-block';
  let [w, h] = mSizeSuccession(styles, 100);
  addKeys({ w, h }, styles);
  let clip = PolyClips[shape];
  if (nundef(clip)) styles.round = true; else styles.clip = clip;
  let d = mDom(dParent, styles, opts);
  if (isdef(opts.pos)) { mPlace(d, opts.pos); }
  else if (isdef(opts.center)) centerAt(d, opts.center.x, opts.center.y);
  return d;
}
function mShapeR(shape = 'hex', dParent = null, styles = {}, pos, classes) {
  let x;
  let bg = isdef(styles.bg) ? computeColorX(styles.bg) : 'conic-gradient(green,pink,green)';
  let sz = isdef(styles.sz) ? styles.sz : isdef(styles.w) ? styles.w : isdef(styles.h) ? styles.h : null;
  if (isdef(PolyClips[shape])) {
    sz = valf(sz, 80);
    let html = `<div style=
    "--b:${bg};
    --clip:${PolyClips[shape]};
    --patop:100%;
    --w:${sz}px;
    "></div>`;
    x = createElementFromHtml(html);
  } else {
    x = mShape(shape, dParent, styles, pos, classes);
    return x;
  }
  if (sz) {
    bvar = sz > 120 ? 8 : sz > 80 ? 5 : sz > 50 ? 3 : 1;
    mClass(x, "weired" + bvar);
    mStyle(x, { w: sz });
  }
  if (isdef(dParent)) mAppend(dParent, x);
  if (isdef(classes)) mClass(x, classes);
  if (isdef(pos)) { mPlace(x, pos); }
  return x;
}
function mShield(dParent, styles = {}, opts = {}) {
  addKeys({ bg: '#00000080' }, styles);
  addKeys({ id: 'shield' }, opts);
  dParent = valf(toElem(dParent), document.body);
  let d = mDom(dParent, styles, opts);
  mIfNotRelative(dParent);
  mStyle(d, { position: 'absolute', left: 0, top: 0, w: '100%', h: '100%' });
  mClass(d, 'topmost');
  return d;
}
function mShortestPath(elem1, elem2) {
  if (elem1 === elem2) return [elem1];
  const queue = [elem1];
  const visited = new Set([elem1]);
  const parentMap = new Map();
  while (queue.length > 0) {
    const current = queue.shift();
    const nbrs = getPolyNeighbors(current) || [];
    for (const nbr of nbrs) {
      if (!visited.has(nbr)) {
        visited.add(nbr);
        parentMap.set(nbr, current);
        if (nbr === elem2) {
          const path = [];
          let f = elem2;
          while (f !== undefined) {
            path.push(f);
            f = parentMap.get(f);
          }
          return path.reverse();
        }
        queue.push(nbr);
      }
    }
  }
  return null;
}
function mSidebar(dParent = 'dLeft', wmin = 170, styles = {}, opts = {}) {
  dParent = toElem(dParent);
  mStyle(dParent, { wmin: wmin, patop: 25 });
  let d = mDom(dParent, styles, opts);
  return { wmin, d }
}
function mSizeSuccession(styles = {}, szDefault = 100, fromWidth = true) {
  let [w, h] = [styles.w, styles.h];
  if (fromWidth) {
    w = valf(w, styles.sz, h, szDefault);
    h = valf(h, styles.sz, w, szDefault);
  } else {
    h = valf(h, styles.sz, w, szDefault);
    w = valf(w, styles.sz, h, szDefault);
  }
  return [w, h];
}
function mSleep(ms = 1000) {
  return new Promise(
    (res, rej) => {
      if (ms > 10000) { ms = 10000; }
      if (isdef(TO.SLEEPTIMEOUT)) clearTimeout(TO.SLEEPTIMEOUT);
      TO.SLEEPTIMEOUT = setTimeout(res, ms);
    });
}
function mSortable(divs) {
  let draggedElement = null;
  let lastHighlighted = null;
  divs.forEach(container => {
    container.querySelectorAll('img').forEach(el => {
      el.draggable = true;
      el.addEventListener('dragstart', ev => {
        draggedElement = el;
        ev.dataTransfer.effectAllowed = 'move';
      });
      enableAutoScrollOnDrag(el)
    });
    container.querySelectorAll('img,div').forEach(el => {
      el.addEventListener('dragover', ev => {
        ev.preventDefault();
        if (el !== draggedElement) {
          if (lastHighlighted) lastHighlighted.style.outline = '';
          el.style.outline = '2px solid yellow';
          lastHighlighted = el;
        }
      });
      el.addEventListener('dragleave', () => {
        if (el === lastHighlighted) {
          el.style.outline = '';
          lastHighlighted = null;
        }
      });
      el.addEventListener('drop', ev => {
        ev.preventDefault();
        lastHighlighted.style.outline = '';
        let newParent = lastHighlighted.parentNode;
        if (draggedElement && draggedElement !== lastHighlighted) {
          console.log('dropped', draggedElement);
          draggedElement.style.outline = '';
          console.log(lastHighlighted, draggedElement)
          newParent.insertBefore(draggedElement, lastHighlighted);
        } else {
          const files = ev.dataTransfer.files;
          if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) { // Check if the dropped file is an image
              const reader = new FileReader();
              reader.onload = async (evReader) => {
                let data = evReader.target.result;
                ondropUrl(newParent, data);
              };
              reader.readAsDataURL(file);
            }
          }
        }
        draggedElement = null;
        lastHighlighted = null;
      });
    });
  })
}
function mStyle(elem, styles = {}, opts = {}) {
  elem = toElem(elem);
  let styles1 = mStyles(styles);
  for (const key in styles1) {
    elem.style.setProperty(key, styles1[key]);
  }
  applyOpts(elem, opts);
}
function mStyle_old(elem, styles = {}, opts = {}) {
  elem = toElem(elem);
  styles = jsCopy(styles);
  let noUnit = ['opacity', 'flex', 'grow', 'shrink', 'grid', 'z', 'iteration', 'count', 'orphans', 'widows', 'weight', 'order', 'index'];
  const STYLE_PARAMS_3 = {
    autoCols: (elem, v) => elem.style.gridTemplateColumns = isNumber(v) ? `repeat(auto-fill,${v}px)` : v,
    autoRows: (elem, v) => elem.style.gridTemplateRows = isNumber(v) ? `repeat(auto-fill,${v}px)` : v,
    border: (elem, v) => { elem.style.border = v.includes('px') ? v : v.includes(' ') ? `${v.split(' ')[1]}px solid ${v.split(' ')[0]}` : v },
    outline: (elem, v) => elem.style.outline = v.includes(' ') ? v : `1px solid ${v}`,
    box: (elem, v) => elem.style.boxSizing = v ? 'border-box' : 'content-box',
    bgSrc: (elem, v) => elem.style.backgroundImage = `url(${v})`,
    breakWord: (elem, v) => elem.style.overflowWrap = 'break-word',
    gridCols: (elem, v) => elem.style.gridTemplateColumns = isNumber(v) ? `repeat(${v},1fr)` : v,
    gridRows: (elem, v) => elem.style.gridTemplateRows = isNumber(v) ? `repeat(${v},1fr)` : v,
    hCenter: elem => elem.style.justifyContent = 'center',
    h100: elem => elem.style.height = '100%',
    hEnd: elem => elem.style.alignContent = 'center',
    hMargin: (elem, v) => elem.style.margin = `0 ${v}px`,
    hPadding: (elem, v) => elem.style.padding = `0 ${v}px`,
    html: (elem, v) => elem.innerHTML = v,
    round: elem => elem.style.borderRadius = '50%',
    vBaseline: elem => elem.style.alignItems = 'baseline',
    vCenter: elem => elem.style.alignItems = 'center',
    vMargin: (elem, v) => elem.style.margin = `${v}px ${valf(styles.hMargin, 0)}px`,
    vPadding: (elem, v) => elem.style.padding = `${v}px ${valf(styles.hPadding, 0)}px`,
    vStretch: elem => elem.style.alignItems = 'stretch',
    w100: elem => elem.style.width = '100%',
    wrap: (elem, v) => { if (v == 'hard') elem.setAttribute('wrap', 'hard'); else elem.style.flexWrap = 'wrap'; }
  };
  for (const k in styles) {
    let v = styles[k];
    let key = STYLE_PARAMS_2[k];
    let val = isNumber(v) && !noUnit.some(x => k.includes(x)) || k == 'fz' ? '' + Number(v) + 'px' : v;
    if (isdef(key)) { elem.style.setProperty(key, val); continue; }
    if (v == 'contrast') { //nur bei fg verwenden!!!!
      let bg = nundef(styles.bg) ? mGetStyle(elem, 'bg') : colorFrom(styles.bg);
      elem.style.setProperty('color', colorIdealText(bg));
    } else if (k == 'bg') {
      if (v.includes('grad')) elem.style.setProperty('background', v);
      else if (v.includes('/')) elem.style.setProperty('background-image', `url(${v})`);
      else elem.style.setProperty('background-color', colorFrom(v, styles.alpha));
      continue;
    } else if (k == 'fg') {
      elem.style.setProperty('color', colorFrom(v, styles.alpha));
      continue;
    } else if (k.startsWith('class')) {
      mClass(elem, v)
      continue;
    } else if (isdef(STYLE_PARAMS_3[k])) {
      STYLE_PARAMS_3[k](elem, v);
    } else elem.style.setProperty(k, val);
  }
  applyOpts(elem, opts);
}
function mStyles(styles) {
  let res = {};
  for (const k in styles) {
    let key = k, val = styles[k];
    if (k in STYLES) {
      let dival = STYLES[k];
      if (typeof dival == 'function') {
        val = dival(val, styles.bg);
        if (isList(val)) [key, val] = val;
      }
      else if (isList(dival)) {
        [key, val] = dival;
      } else if (isString(dival)) key = dival;
      else val = dival;
    }
    let val1 = isNumber(val) && !NO_UNIT_STYLES.some(x => key.startsWith(x)) || key == 'fz' ? '' + Number(val) + 'px' : val;
    res[key] = val1;
  }
  return res;
}
function mSwitch(dParent, styles = {}, opts = {}) {
  addKeys({ id: 'dSwitch', val: '' }, opts);
  let inpid = `inp${opts.id}`
  let html = `
      <label class="switch">
        <input id='${inpid}' type="checkbox" ${opts.val}>
        <span class="slider round"></span>
      </label>
    `;
  opts.html = html
  let d = mDom(dParent, styles, opts);
  return { div: d, inp: mBy(inpid) };
}
function mSym(key, dParent, styles = {}, pos, classes) {
  let info = Syms[key];
  styles.display = 'inline-block';
  let family = info.family;
  styles.family = family;
  let sizes;
  if (isdef(styles.sz)) { sizes = mSymSizeToBox(info, styles.sz, styles.sz); }
  else if (isdef(styles.w) && isdef(styles.h)) { sizes = mSymSizeToBox(info, styles.w, styles.h); }
  else if (isdef(styles.fz)) { sizes = mSymSizeToFz(info, styles.fz); }
  else if (isdef(styles.h)) { sizes = mSymSizeToH(info, styles.h); }
  else if (isdef(styles.w)) { sizes = mSymSizeToW(info, styles.w); }
  else { sizes = mSymSizeToFz(info, 25); }
  styles.fz = sizes.fz;
  styles.w = sizes.w;
  styles.h = sizes.h;
  styles.align = 'center';
  if (isdef(styles.bg) && info.family != 'emoNoto') { styles.fg = styles.bg; delete styles.bg; }
  let x = mDiv(dParent, styles, null, info.text);
  if (isdef(classes)) mClass(x, classes);
  if (isdef(pos)) { mPlace(x, pos); }
  return x;
}
function mSymSizeToBox(info, w, h) {
  let fw = w / info.w;
  let fh = h / info.h;
  let f = Math.min(fw, fh);
  return { fz: 100 * f, w: info.w * f, h: info.h * f };
}
function mSymSizeToFz(info, fz) { let f = fz / 100; return { fz: fz, w: info.w * f, h: info.h * f }; }
function mSymSizeToH(info, h) { let f = h / info.h; return { fz: 100 * f, w: info.w * f, h: h }; }
function mSymSizeToW(info, w) { let f = w / info.w; return { fz: 100 * f, w: w, h: info.h * f }; }
function mTable(dParent, headers, showheaders, styles = { mabottom: 0 }, className = 'table') {
  let d = mDom(dParent);
  let t = mCreate('table');
  mAppend(d, t);
  if (isdef(className)) mClass(t, className);
  if (isdef(styles)) mStyle(t, styles);
  if (showheaders) {
    let code = `<tr>`;
    for (const h of headers) {
      code += `<th>${h}</th>`
    }
    code += `</tr>`;
    t.innerHTML = code;
  }
  return t;
}
function mTableCol(r, val) {
  let col = mCreate('td');
  mAppend(r, col);
  if (isdef(val)) col.innerHTML = val;
  return col;
}
function mTableCommandify(rowitems, di) {
  for (const item of rowitems) {
    for (const index in di) {
      let colitem = item.colitems[index];
      colitem.div.innerHTML = di[index](item, colitem.val);
    }
  }
}
function mTableRow(t, o, headers, id) {
  let elem = mCreate('tr');
  if (isdef(id)) elem.id = id;
  mAppend(t, elem);
  let colitems = [];
  for (const k of headers) {
    let val = isdef(o[k]) ? isDict(o[k]) ? JSON.stringify(o[k]) : isList(o[k]) ? o[k].join(', ') : o[k] : '';
    let col = mTableCol(elem, val);
    colitems.push({ div: col, key: k, val: val });
  }
  return { div: elem, colitems: colitems };
}
function mTableStylify(rowitems, di) {
  for (const item of rowitems) {
    for (const index in di) {
      let colitem = item.colitems[index];
      mStyle(colitem.div, di[index]);
    }
  }
}
function mText(text, dParent, styles, classes) {
  if (!isString(text)) text = text.toString();
  let d = mDom(dParent);
  if (!isEmpty(text)) { d.innerHTML = text; }
  if (isdef(styles)) mStyle(d, styles);
  if (isdef(classes)) mClass(d, classes);
  return d;
}
function mTextArea100(dParent, styles = {}) {
  mCenterCenterFlex(dParent)
  let html = `<textarea style="width:100%;height:100%;box-sizing:border-box" wrap="hard"></textarea>`;
  let t = mCreateFrom(html);
  mStyle(t, styles);
  mAppend(dParent, t);
  return t;
}
function mToggle(ev) {
  let key = ev.target.getAttribute('data-toggle');
  let t = DA.toggle[key];
  let prev = t.state;
  t.state = (t.state + 1) % t.seq.length;
  let html = t.seq[t.state];
  mStyle(t.elem, { bg: t.states[html] }, { html });
  if (isdef(t.handler)) t.handler(key, prev, t.state);
}
async function mToggleButton(dParent, styles = {}) {
  addKeys({ display: 'flex', wrap: 'wrap', alignItems: 'center' }, styles)
  let d1 = mDom(dParent, styles, { tag: 'button' });
  let list = Array.from(arguments).slice(2);
  let buttons = [];
  let style = { className: 'no_select', display: 'flex', 'flex-wrap': 'nowrap', alignItems: 'center', cursor: 'pointer' };
  let words = list.map(x => x.label);
  let hasKey = list.some(x => x.key);
  let w = getMaxWordWidth(words, d1) + (hasKey ? valf(styles.h, 30) * 1.35 + 2 : 10); //console.log(w);
  mStyle(d1, { w, justifyContent: 'center' });
  for (const l of list) {
    let b = mDom(d1, style, { onclick: l.onclick });
    mDom(b, { maright: 6, 'white-space': 'nowrap' }, { html: l.label });
    if (l.key) await mKey(l.key, b, { h: styles.h, w: styles.h, fz: styles.h }); //:fz:valf(styles.h,50) });
    buttons.push(b);
  }
  return mToggleCompose(...buttons);
}
function mToggleCompose() {
  let list = Array.from(arguments);
  if (isEmpty(list)) return;
  let dParent = list[0].parentNode;
  let tb = mDom(dParent);
  let n = list.length;
  let i = 0;
  for (const b of list) {
    mAppend(tb, b);
    b.setAttribute('idx', i++);
    if (i < n) mStyle(b, { display: 'none' });
  }
  tb.onclick = ev => {
    let idx = Number(evToAttr(ev, 'idx'));
    let inew = (idx + 1) % n;
    let b = list[inew];
    list.map(x => mStyle(x, { display: 'none' }));
    mStyle(b, { display: 'flex' });
  }
  return tb;
}
function mToggleElem(elem, key, states, seq, i, handler) {
  if (nundef(DA.toggle)) DA.toggle = {};
  let t = DA.toggle[key] = { handler, key, elem, state: i, states, seq };
  elem.setAttribute('data-toggle', key);
  mStyle(elem, { cursor: 'pointer' });
  let html = seq[i];
  mStyle(elem, { bg: states[html] }, { html });
  elem.onclick = mToggle;
  return t;
}
function mUnselect(elem) { mClassRemove(elem, 'framedPicture'); }
function mYaml(d, js) {
  d.innerHTML = '<pre>' + jsonToYaml(js) + '</pre>';
}
function mYesNo(dParent, styles = {}, opts = {}) {
  return mSelect(dParent, styles, dictMerge(opts, { list: ['yes', 'no'] }));
}
function makeArrayWithParts(keys) {
  let arr = []; keys[0].split('_').map(x => arr.push([]));
  for (const key of keys) {
    let parts = key.split('_');
    for (let i = 0; i < parts.length; i++) arr[i].push(parts[i]);
  }
  return arr;
}
function makeDefaultPool(fromData) {
  if (nundef(fromData) || isEmpty(fromData.table) && isEmpty(fromData.players)) return {};
  if (nundef(fromData.table)) fromData.table = {};
  let data = jsCopy(fromData.table);
  for (const k in fromData.players) {
    data[k] = jsCopy(fromData.players[k]);
  }
  return data;
}
function makeEditable(elem) {
  elem.setAttribute('contenteditable', 'true');
  elem.style.border = '1px solid #ccc'; // Optional: Visual indication
  elem.style.padding = '5px';          // Optional: Add some padding
}
function makeElemDraggableTo(elem, target, key) {
  if (isdef(key)) {
    if (nundef(target.ddKeys)) target.ddKeys = [];
    if (nundef(elem.ddKeys)) elem.ddKeys = [];
    addIf(target.ddKeys, key);
    addIf(elem.ddKeys, key);
  }
  if (nundef(elem.id)) elem.id = getUID();
  elem.draggable = true;
  elem.ondragstart = isdef(key) ? dragKey : drag;
  target.ondragover = isdef(key) ? allowDropKey : allowDrop;
  target.ondrop = isdef(key) ? dropKey : drop;
}
async function makeMove(gameId, move) {
  return await api('POST', `/make_move/${gameId}`, { move });
}
function makePool(cond, source, R) {
  if (nundef(cond)) return [];
  else if (cond == 'all') return source;
  let pool = [];
  for (const oid of source) {
    let o = R.getO(oid);
    if (!evalConds(o, cond)) continue;
    pool.push(oid);
  }
  return pool;
}
function makeSelectedMove() {
  const gameId = document.getElementById("gameIdInput").value;
  let moveText = document.getElementById("moveInput").value;
  try {
    const move = JSON.parse(moveText);
    makeMove(gameId, move);
  } catch (err) {
    alert("Invalid move JSON");
  }
}
function makeUnitString(nOrString, unit = 'px', defaultVal = '100%') {
  if (nundef(nOrString)) return defaultVal;
  if (isNumber(nOrString)) nOrString = '' + nOrString + unit;
  return nOrString;
}
function mapRange(value, inMin, inMax, outMin, outMax) {
  return Math.round((value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin);
}
function measureActualTextWidth(text, styles = {}) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  function getFontString(styles) {
    const fontSize = styles.fz || 16;
    const fontFamily = styles.family || 'sans-serif'; // Default font family
    return styles.font || `${fontSize}px ${fontFamily}`; // Use full font if available
  }
  context.font = getFontString(styles);
  const metrics = context.measureText(text);
  const textWidth = metrics.width;
  canvas.width = Math.ceil(textWidth);
  canvas.height = Math.ceil(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent);
  context.font = getFontString(styles);
  context.textBaseline = 'top'; // Align text to the top for simplicity
  context.fillText(text, 0, 0);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
  let startX = canvas.width;
  let endX = 0;
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const alpha = imageData[(y * canvas.width + x) * 4 + 3];
      if (alpha > 0) {
        startX = Math.min(startX, x);
        endX = Math.max(endX, x);
      }
    }
  }
  const actualWidth = endX - startX + 1;
  return actualWidth;
}
function measureCharCodeInFont(charCode, fontSize, fontFamily, fontWeight = "normal") {
  const char = String.fromCharCode(charCode);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  const metrics = ctx.measureText(char);
  return {
    width: metrics.width,
    actualBoundingBoxLeft: metrics.actualBoundingBoxLeft,
    actualBoundingBoxRight: metrics.actualBoundingBoxRight,
    actualBoundingBoxAscent: metrics.actualBoundingBoxAscent,
    actualBoundingBoxDescent: metrics.actualBoundingBoxDescent,
    height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
  };
}
function measureCharacterBounds(char, fontSize, fontFamily) {
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  container.style.fontSize = `${fontSize}px`;
  container.style.fontFamily = fontFamily;
  container.style.lineHeight = "normal";
  container.style.padding = "0";
  container.style.margin = "0";
  container.style.border = "none";
  container.textContent = char;
  document.body.appendChild(container);
  const rect = container.getBoundingClientRect();
  document.body.removeChild(container);
  return {
    width: rect.width,
    height: rect.height,
    top: rect.top,
    left: rect.left
  };
}
function measureElement(el) {
  let info = window.getComputedStyle(el, null);
  return { w: info.width, h: info.height };
}
function measureFieldset(fs) {
  let legend = fs.firstChild;
  let r = getRect(legend);
  let labels = fs.getElementsByTagName('label');
  let wmax = 0;
  for (const l of labels) {
    let r1 = getRect(l);
    wmax = Math.max(wmax, r1.w);
  }
  let wt = r.w;
  let wo = wmax + 24;
  let diff = wt - wo;
  if (diff >= 10) {
    for (const l of labels) { let d = l.parentNode; mStyle(d, { maleft: diff / 2 }); }
  }
  let wneeded = Math.max(wt, wo) + 10;
  mStyle(fs, { wmin: wneeded });
  for (const l of labels) { let d = l.parentNode; mStyle(l, { display: 'inline-block', wmin: 50 }); mStyle(d, { wmin: wneeded - 40 }); }
}
function measureHeight(elem) { return mGetStyle(elem, 'h') }
function measureHeightOfTextStyle(dParent, styles = {}) {
  let d = mDom(dParent, styles, { html: 'Hql' });
  let s = measureElement(d);
  d.remove();
  return firstNumber(s.h);
}
function measureText(text, styles = {}, cx = null) {
  function getTextWidth(text, font) {
    var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
    var context = canvas.getContext('2d');
    context.font = font;
    var metrics = context.measureText(text);
    return metrics.width;
  }
  if (!cx) {
    var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
    cx = canvas.getContext('2d');
  }
  cx.font = isdef(styles.font) ? styles.font : `${styles.fz}px ${styles.family}`;
  var metrics = cx.measureText(text);
  return [metrics.width, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent];
}
function measureTextInFont(text, fontSize, fontFamily, fontWeight = "normal") {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  const metrics = ctx.measureText(text);
  return {
    width: metrics.width,
    actualBoundingBoxLeft: metrics.actualBoundingBoxLeft,
    actualBoundingBoxRight: metrics.actualBoundingBoxRight,
    actualBoundingBoxAscent: metrics.actualBoundingBoxAscent,
    actualBoundingBoxDescent: metrics.actualBoundingBoxDescent,
    height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
  };
}
async function measureUsedAreaOfDiv(div) {
  const canvas = await html2canvas(div, {
    backgroundColor: null, // preserve transparency
    scale: 1
  });
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height).data;
  let minX = width, minY = height, maxX = 0, maxY = 0;
  let hasContent = false;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const alpha = imageData[index + 3];
      if (alpha > 0) {
        hasContent = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (!hasContent) return null;
  return {
    left: minX,
    top: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1
  };
}
function measureWidth(elem) { return mGetStyle(elem, 'w') }
function mergeArrays(target, source) {
  function getKey(item) { return item.key || item.id || item.name; }
  const merged = Array.from(target);
  const keyMap = {};
  target.forEach((item, index) => {
    const k = getKey(item);
    if (k) keyMap[k] = index;
  });
  source.forEach((item) => {
    const k = getKey(item);
    if (k && keyMap[k] !== undefined) {
      merged[keyMap[k]] = deepMerge(target[keyMap[k]], item);
    } else {
      merged.push(item);
    }
  });
  return merged;
}
function mergeDynSetNodes(o) {
  let merged = {};
  let interpool = null;
  for (const nodeId in o.RSG) {
    let node = jsCopy(dynSpec[nodeId]);
    let pool = node.pool;
    if (pool) {
      if (!interpool) interpool = pool;
      else interpool = intersection(interpool, pool);
    }
    merged = deepmerge(merged, node);
  }
  merged.pool = interpool;
  return merged;
}
function mergeIncludingPrototype(oid, o) {
  let merged = mergeDynSetNodes(o);
  merged.oid = oid;
  let t = merged.type;
  let info;
  if (t && PROTO[t]) {
    info = deepmerge(merged, jsCopy(PROTO[t]));
  } else info = merged;
  return info;
}
function mergeObject(target, source, optionsArgument) {
  var destination = {}
  if (isMergeableObject(target)) {
    Object.keys(target).forEach(function (key) {
      destination[key] = cloneIfNecessary(target[key], optionsArgument)
    })
  }
  Object.keys(source).forEach(function (key) {
    if (!isMergeableObject(source[key]) || !target[key]) {
      destination[key] = cloneIfNecessary(source[key], optionsArgument)
    } else {
      destination[key] = deepmerge(target[key], source[key], optionsArgument)
    }
  })
  return destination;
}
function mergeOverride(base, drueber) { return _deepMerge(base, drueber, { arrayMerge: _overwriteMerge }); }
function mergeOverrideArrays(base, drueber) {
  return deepmerge(base, drueber, { arrayMerge: overwriteMerge });
}
function mimali(c, m) {
  let seasonColors = 'winter_blue midnightblue light_azure capri spring_frost light_green deep_green summer_sky yellow_pantone orange pale_fallen_leaves timberwolf'.split(' ');
  let c2 = seasonColors[m - 1];
  let colors = paletteMix(c, c2, 6).slice();
  let wheel = [];
  for (const x of colors) {
    let pal1 = paletteShades(x);
    for (const i of range(7)) wheel.push(pal1[i + 2]);
  }
  return wheel;
}
function miniClearMain() {
  clearTimeouts();
  clearEvents();
  clearMessage(true);
  staticTitle();
  mClear('dTitle');
  mClear('dHidden');
}
function mixColors(c1, c2, c2Weight01) {
  let [color1, color2] = [colorFrom(c1), colorFrom(c2)]
  const hex1 = color1.substring(1);
  const hex2 = color2.substring(1);
  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);
  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);
  const r = Math.floor(r1 * (1 - c2Weight01) + r2 * c2Weight01);
  const g = Math.floor(g1 * (1 - c2Weight01) + g2 * c2Weight01);
  const b = Math.floor(b1 * (1 - c2Weight01) + b2 * c2Weight01);
  const hex = colorRgbArgsToHex79(r, g, b);
  return hex;
}
function modifyStat(name, prop, val) {
  let id = `stat_${name}_${prop}`;
  console.log('id', id)
  let ui = mBy(id);
  console.log('ui', ui)
  if (isdef(ui)) ui.innerHTML = val;
}
function msKey(key, d, styles = {}, opts = {}) {
  styles = jsCopy(styles);
  let o = key.includes('.') ? { src: key } : opts.prefer == 'plain' ? { plain: key } : lookup(M.superdi, [key]);
  let type = opts.prefer;
  let types = ['src', 'img', 'photo', 'uni', 'emo', 'fa6', 'fa', 'ga', 'plain'];
  if (nundef(o[type])) type = types.find(x => isdef(o[x]));
  let d0;
  if (['img', 'src', 'photo'].includes(type)) {
    d0 = mDom(d, { ...styles, h: 100 }, { ...opts, tag: 'img', src: o[type], alt: key });
  } else if (type == 'plain') {
    d0 = mDom(d, { styles, className: 'label' }, { ...opts, html: o[type], title: o[type] });
  } else {
    let family = Families[type] || 'inherit';
    let text = ['fa6', 'fa', 'ga'].includes(type) ? `&#x${o[type]};` : o[type];
    d0 = mDom(d, { ...styles, family }, { ...opts, html: text });
  }
  return d0;
}
function name2id(name) { return 'd_' + name.split(' ').join('_'); }
function nextBar(ctx, rest, color) {
  list = rest;
  let val = findMostFrequentVal(list, 'x');
  rest = list.filter(p => !isWithinDelta(p.x, val, 2));
  let line = getBar(ctx, list, val);
  line.map(p => drawPix(ctx, p.x, p.y, color));
  return { val, line, rest, color };
}
function nextLine(ctx, rest, color) {
  list = rest;
  let val = findMostFrequentVal(list, 'y');
  rest = list.filter(p => !isWithinDelta(p.y, val, 2));
  let line = getLine(ctx, list, val);
  if (line) line.map(p => drawPix(ctx, p.x, p.y, color));
  return { val, line, rest, color };
}
function normalSegmentThroughMidpoint(x1, y1, x2, y2, length) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  let nx = -dy;
  let ny = dx;
  const norm = Math.hypot(nx, ny);
  if (norm === 0) {
    throw new Error("The two points are identical; cannot compute a normal.");
  }
  nx /= norm;
  ny /= norm;
  const halfLen = length / 2;
  const xA = mx + nx * halfLen;
  const yA = my + ny * halfLen;
  const xB = mx - nx * halfLen;
  const yB = my - ny * halfLen;
  return [
    { x: xA, y: yA },
    { x: xB, y: yB }
  ];
}
function normalThroughMidpoint(x1, y1, x2, y2) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  let slope, normalSlope, intercept;
  if (dx === 0) {
    normalSlope = 0;
    intercept = my;
  } else if (dy === 0) {
    normalSlope = Infinity;
    intercept = mx;
  } else {
    const originalSlope = dy / dx;
    normalSlope = -1 / originalSlope;
    intercept = my - normalSlope * mx;
  }
  return {
    midpoint: { x: mx, y: my },
    normalLine: {
      slope: normalSlope,
      intercept: intercept,
      form: normalSlope === Infinity
        ? `x = ${intercept}`
        : `y = ${normalSlope}x + ${intercept}`
    }
  };
}
function normalizeString(s, opts = {}) {
  let sep = valf(opts.sep, '_');
  let keep = valf(opts.keep, []);
  let lowercase = isdef(opts.lowercase) ? opts.lowercase : true;
  s = lowercase ? s.toLowerCase().trim() : s.trim();
  let res = '';
  for (let i = 0; i < s.length; i++) { if (isAlphaNum(s[i]) || keep.includes(s[i])) res += s[i]; else if (last(res) != sep) res += sep; }
  return res;
}
function nundef(x) { return x === null || x === undefined || x === 'undefined'; }
function onHoverMagnify(d, controlkey = null, ms = 1000, scale = 5) {
  d = toElem(d);
  d.onmouseenter = function () { if (controlkey && !isKeyDown(controlkey)) return; clearTimeout(TO.onhover); TO.onhover = setTimeout(() => mMagnify(d, scale), ms); };
  d.onmouseleave = function () { clearTimeout(TO.onhover); TO.onhover = null; mMagnifyOff(); };
}
function onHoverTooltip(d, text, controlkey = null, ms = 2000, xfactor = 0.7, yfactor = 0.5) {
  d = toElem(d);
  mClass(d.parentNode, 'tooltip-container');
  if (nundef(DA.tooltip)) DA.tooltip = mDom('dPage', { className: 'tooltip' }, { tag: 'span', html: 'this is a tooltip' }); //return;
  d.addEventListener('mouseenter', () => {
    if (controlkey && !isKeyDown(controlkey)) return;
    if (DA.tooltip.innerHTML == text) return;
    TO.onhover = setTimeout(() => {
      DA.tooltip.innerHTML = text;
      DA.tooltip.style.visibility = 'visible';
      DA.tooltip.style.opacity = '1';
      const rect = d.getBoundingClientRect();
      DA.tooltip.style.left = `${rect.left + rect.width * xfactor + window.scrollX}px`;
      DA.tooltip.style.top = `${rect.top + rect.height * yfactor + window.scrollY}px`; // Add 5px spacing
    }, ms);
  });
  d.addEventListener('mouseleave', () => {
    clearTimeout(TO.onhover); TO.onhover = null;
    DA.tooltip.style.visibility = 'hidden';
    DA.tooltip.style.opacity = '0';
    DA.tooltip.innerHTML = '';
  });
}
function onMouseMoveLine(ev) {
  let d = mBy('dCanvas'); //ev.target;
  let b = mGetStyle(d, 'border-width'); //if (VERBOSE) console.log(b);
  const mouseX = ev.clientX - d.offsetLeft - b;
  const mouseY = ev.clientY + 2 - d.offsetTop - b;
  B.lines.forEach(line => {
    const x1 = parseFloat(iDiv(line).dataset.x1);
    const y1 = parseFloat(iDiv(line).dataset.y1);
    const x2 = parseFloat(iDiv(line).dataset.x2);
    const y2 = parseFloat(iDiv(line).dataset.y2);
    const thickness = B.triggerThreshold;
    const distance = pointToLineDistance(mouseX, mouseY, x1, y1, x2, y2);
    if (distance <= thickness / 2) {
      mStyle(iDiv(line), { opacity: 1, bg: 'red' });
    } else {
      mStyle(iDiv(line), { opacity: .1, bg: 'white' });
    }
  });
}
async function onPoll() {
  while (isBusy()) await mSleep(100);
  assertion()
}
async function onchangeAutoSwitch() {
  if (DA.autoSwitch === true) {
    DA.autoSwitch = false
  } else {
    DA.autoSwitch = true
  }
}
async function onclickClearPlayers() {
  let me = UGetName();
  DA.playerList = [me];
  for (const name in DA.allPlayers) {
    if (name != me) unselectPlayerItem(DA.allPlayers[name]);
  }
  assertion(!isEmpty(DA.playerList), "uname removed from playerList!!!!!!!!!!!!!!!")
  DA.lastName = me;
  mRemoveIfExists('dPlayerOptions')
}
async function onclickGameMenuItem(ev) {
  evNoBubble(ev);
  let prev = document.querySelector('.framedPicture');
  if (isdef(prev)) mClassRemove(prev, 'framedPicture');
  let elem = evToAttrElem(ev, 'gamename').elem; //console.log('elem', elem);
  mClass(elem, 'framedPicture');
  let gamename = evToAttr(ev, 'gamename');
  pollOff();
  await showGameMenu(gamename);
}
async function onclickGameMenuPlayer(ev) {
  let name = evToAttr(ev, 'username'); //console.log('name',name); return;
  let shift = ev.shiftKey;
  await showGameMenuPlayerDialog(name, shift);
}
async function onclickGameStart() {
  let options = collectOptions();
  let players = collectPlayers();
  mRemove('dGameMenu');
  let table = tableCreate(DA.gamename, players, options, 'open');
  setTableToStarted(table);
  await tableSave(table);
  DA.tid = table.id;
  await switchToMenu('table');
}
async function onclickModifyGameState() {
  let o = DAGetTable();
  let onew = pickFromObject(o, ['owner', 'turn', 'game', 'status', 'id', 'name', 'modified', 'friendly', 'game_friendly', 'playerNames']);
  onew.msg = 'HAAAAAAAAAAAAALLLLO ' + getNow();
  await tableSave(onew);
  await updateMain();
}
async function onclickMoreUsers() {
  let dPopup = mDom('dPage', { position: 'absolute', top: 0, left: 0, w: '100vw', h: '100vh', z: 10000, bg: 'rgba(0,0,0,0.5)' }, { className: 'flexCS' });
  let dParent = mDom(dPopup, { hmin: 200, wmax: 700, gap: 10, w: '70%', rounding: 20, matop: '10%', patop: 20, bg: 'white' },
    { className: 'flexCC' });
  for (const name in M.users) { showUser(dParent, name, async () => { dPopup.remove(); await switchToUser(name); }); }
  let dinp = mDom(dParent, { fz: 20, maleft: 12, bg: 'lightgray', fg: 'black', border: '1px solid dimgray', align: 'center', w: 120, rounding: 8 }, { tag: 'input', type: 'text', placeholder: '<new user>' });
  dinp.onchange = async ev => {
    let uname = ev.target.value.trim();
    if (isEmpty(uname) || !isAlphaNum(uname)) {
      console.log(`cannot switch to user ${uname}!`);
      return;
    }
    dPopup.remove();
    await switchToUser(uname);
  };
  dinp.onclick = ev => {
    ev.stopPropagation();
  };
  dPopup.onclick = ev => { evNoBubble(ev); mRemove(dPopup) };
}
async function onclickOpenToJoinGame() {
  let options = collectOptions();
  let players = collectPlayers();
  mRemove('dGameMenu');
  let table = tableCreate(DA.gamename, players, options, 'open');
  await tableSave(table);
  await updateMain();
  if (!TESTING) pollOn();
}
function onclickPoll() { pollAndShow(); }
function onclickPollToggle() { pollToggle(); }
async function onclickReload() {
  console.log('reload!!!')
  location.reload();
}
async function onclickTable(id) { DA.tid = id; await switchToMenu('table'); }
async function onclickTableDelete(id) {
  if (localStorage.getItem('tid') == id) {
    localStorage.removeItem('tid');
    DA.tid = null;
  }
  let res = await mPhpPost('all', { action: 'deletey', file: `tables/${id}` });
  await updateMain();
}
async function onclickTableJoin(id) {
  let t = DAGetTable(id);
  let me = UGetName(); console.log('me', me)
  assertion(t.status == 'open', 'too late to join! game has already started!')
  assertion(!t.playerNames.includes(me), `${me} already joined!!!`);
  t.players[me] = userToPlayer(me, t.game);
  t.playerNames.push(me);
  await tableSave(t);
  await updateMain();
}
async function onclickTableLeave(id) {
  let t = DAGetTable(id);
  let me = UGetName();
  assertion(t.status == 'open', 'too late to leave! game has already started!')
  assertion(t.playerNames.includes(me), `${me} NOT in joined players!!!!`);
  delete t.players[me];
  removeInPlace(t.playerNames, me);
  let res = await mPhpPost('all', { action: 'savey', file: `tables/${id}`, o: t });
  await updateMain();
}
async function onclickTableStart(id) {
  console.log('onclickTableStart', id);
  let table = DA.tableDict[id];
  if (!table) { showMessage('table missing!'); return await updateMain(); }
  table = setTableToStarted(table);
  await tableSave(table);
  DA.tid = id;
  await switchToMenu('table');
}
async function onclickUser() {
  await onclickMoreUsers(); 
}
async function ondropPreviewImage(dParent, url, key) {
  if (isdef(key)) {
    let o = M.superdi[key];
    UI.imgColl.value = o.cats[0];
    UI.imgName.value = o.friendly;
  }
  assertion(dParent == UI.dDrop, `problem bei ondropPreviewImage parent:${dParent}, dDrop:${UI.dDrop}`)
  dParent = UI.dDrop;
  let dButtons = UI.dButtons;
  let dTool = UI.dTool;
  dParent.innerHTML = '';
  dButtons.innerHTML = '';
  dTool.innerHTML = '';
  let img = UI.img = mDom(dParent, {}, { tag: 'img', src: url });
  img.onload = async () => {
    img.onload = null;
    UI.img_orig = new Image(img.offsetWidth, img.offsetHeight);
    UI.url = url;
    let tool = UI.cropper = mCropResizePan(dParent, img);
    addToolX(tool, dTool)
    mDom(dButtons, { w: 120 }, { tag: 'button', html: 'Upload', onclick: onclickUpload, className: 'input' })
    mButton('Restart', () => ondropPreviewImage(url), dButtons, { w: 120, maleft: 12 }, 'input');
  }
}
async function ondropShowImage(url, dDrop) {
  mClear(dDrop);
  let img = await imgAsync(dDrop, { hmax: 300 }, { src: url });
  console.log('img dims', img.width, img.height); //works!!!
  mStyle(dDrop, { w: img.width, h: img.height + 30, align: 'center' });
  mDom(dDrop, { fg: colorContrastPickFromList(dDrop, ['blue', 'lime', 'yellow']) }, { className: 'blink', html: 'DONE! now click on where you think the image should be centered!' })
  console.log('DONE! now click on where you think the image should be centered!')
  img.onclick = storeMouseCoords;
}
function ondropUrl(elem, url) {
  let w = 500;
  let parent = elem;
  mDom(parent, { w }, { tag: 'img', src: url });
}
function onenterHex(item, board) {
  colorSample(board.dSample, item.color);
}
function onenterPoly(ev) {
  console.log('Polygon enter:', ev.target);
  ev.target.style.fill = rColor();
}
function onleaveHex(item, board) {
  let selitem = board.items.find(x => x.isSelected == true);
  if (nundef(selitem)) return;
  colorSample(board.dSample, selitem.color);
}
function onleavePoly(ev) {
  console.log('Polygon leave:', ev.target);
  ev.target.style.fill = rColor();
}
function openGameMenuFor(gamename) { clickOnElemWithAttr('gamename', gamename); }
function openPopup(name = 'dPopup') {
  closePopup();
  let popup = document.createElement('div');
  popup.id = name;
  let defStyle = { padding: 25, bg: 'white', fg: 'black', zIndex: 100000, rounding: 12, position: 'fixed', boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)', wmin: 300, hmin: 100, border: '1px solid #ccc', };
  mStyle(popup, defStyle);
  mButtonX(popup, null, 25, 4);
  document.body.appendChild(popup);
  return popup;
}
function overwriteMerge(destinationArray, sourceArray, options) { return sourceArray }
function p5ClearAll() { clearTimeouts(); clearMain(); DA.stopwatch = null; }
function pListOf(what) { return 'list of 100 ' + what.toLowerCase(); }
function pSBC(p, c0, c1, l) {
  let r, g, b, P, f, t, h, i = parseInt, m = Math.round, a = typeof c1 == 'string';
  if (typeof p != 'number' || p < -1 || p > 1 || typeof c0 != 'string' || (c0[0] != 'r' && c0[0] != '#') || (c1 && !a)) return null;
  h = c0.length > 9;
  h = a ? (c1.length > 9 ? true : c1 == 'c' ? !h : false) : h;
  f = pSBCr(c0);
  P = p < 0;
  t = c1 && c1 != 'c' ? pSBCr(c1) : P ? { r: 0, g: 0, b: 0, a: -1 } : { r: 255, g: 255, b: 255, a: -1 };
  p = P ? p * -1 : p;
  P = 1 - p;
  if (!f || !t) return null;
  if (l) { r = m(P * f.r + p * t.r); g = m(P * f.g + p * t.g); b = m(P * f.b + p * t.b); }
  else { r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5); g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5); b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5); }
  a = f.a;
  t = t.a;
  f = a >= 0 || t >= 0;
  a = f ? (a < 0 ? t : t < 0 ? a : a * P + t * p) : 0;
  if (h) return 'rgb' + (f ? 'a(' : '(') + r + ',' + g + ',' + b + (f ? ',' + m(a * 1000) / 1000 : '') + ')';
  else return '#' + (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0)).toString(16).slice(1, f ? undefined : -2);
}
function pSBCr(d) {
  let i = parseInt, m = Math.round, a = typeof c1 == 'string';
  let n = d.length,
    x = {};
  if (n > 9) {
    ([r, g, b, a] = d = d.split(',')), (n = d.length);
    if (n < 3 || n > 4) return null;
    (x.r = parseInt(r[3] == 'a' ? r.slice(5) : r.slice(4))), (x.g = parseInt(g)), (x.b = parseInt(b)), (x.a = a ? parseFloat(a) : -1);
  } else {
    if (n == 8 || n == 6 || n < 4) return null;
    if (n < 6) d = '#' + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (n > 4 ? d[4] + d[4] : '');
    d = parseInt(d.slice(1), 16);
    if (n == 9 || n == 5) (x.r = (d >> 24) & 255), (x.g = (d >> 16) & 255), (x.b = (d >> 8) & 255), (x.a = m((d & 255) / 0.255) / 1000);
    else (x.r = d >> 16), (x.g = (d >> 8) & 255), (x.b = d & 255), (x.a = -1);
  }
  return x;
}
function pYamlDetails(keyword, type, props) {
  if (nundef(props)) {
    switch (type) {
      case 'animal': props = 'class, color, food, habitat, lifespan, name, offsprings, reproduction, size, species, weight'; break;
      case 'location': props = 'population, size, longitude, latitude'; break;
      default: props = 'definition, synonyms, antonyms, german, spanish, french'; break;
    }
  }
  let p = `information about ${keyword}, formatted as yaml object with the following properties: `;
  p += props + '.';
  p += `property values should if possible contain numeric information in scientific (European) metrics.`
  return p;
}
function paletteAddDistanceTo(pal, color, key, distfunc = colorGetContrast) {
  let opal = isDict(pal[0]) ? pal : paletteToObjects(pal);
  for (let i = 0; i < pal.length; i++) {
    let o = opal[i];
    o[`dist_${key}`] = distfunc(o.hex, color);
  }
  return opal;
}
function paletteContrastVariety(pal, n = 20) {
  pal = pal.map(x => colorO(x));
  let res = [];
  ['white', 'black'].map(x => res.push(colorO(x)));
  let o = paletteGetBestContrasting(pal, pal[0], pal[1]).best;
  res.push(o)
  let pal2 = jsCopy(pal).filter(x => x.hex != o.hex);
  res.push(colorO(colorGetPureHue(o)));
  let o2 = paletteGetBestContrasting(pal2, pal[0], pal[1]).best;
  res.push(o2)
  res.push(colorO(colorGetPureHue(o2)))
  res.push(colorO(colorComplement(pal[0].hex)));
  res.push(colorO(colorComplement(pal[1].hex)));
  [60, 120, 180, 240, 300].map(x => {
    res.push(colorO(colorTurnHueBy(pal[0].hex, x)));
    res.push(colorO(colorTurnHueBy(pal[1].hex, x)));
  });
  ['silver', 'dimgray', '#ff0000', '#ffff00'].map(x => res.push(colorO(x)));
  res = res.map(x => x.hex); res = arrRemoveDuplicates(res);
  let palContrast = res.slice(0, 2);
  let sorted = colorSortByLightness(res.slice(2));
  let i = 0;
  while (i < sorted.length) {
    let hex = sorted[i];
    let ok = true;
    for (const h1 of palContrast) {
      let d = colorDistance(hex, h1);
      if (d < 70) { ok = false; break; }
    }
    if (ok) palContrast.push(hex);
    i++;
  }
  if (n < palContrast.length) palContrast = palContrast.slice(0, n)
  return palContrast;
}
function paletteGetBestContrasting(pal) {
  let clist = Array.from(arguments).slice(1).map(x => colorO(x));
  pal = pal.map(x => colorO(x));
  let best = null, dbest = 0;
  for (const p of pal) {
    let arr = clist.map(x => colorDistanceHue(p, x));
    let dmax = arrMinMax(arr).min;
    if (dmax > dbest) {
      best = p; dbest = dmax;
    }
  }
  if (dbest == 0) best = pal[4];
  return { best, dbest };
}
function paletteMix(startColor, endColor, numSteps) {
  const colors = [];
  let step = 0;
  while (step < numSteps) {
    const currentColor = mixColors(startColor, endColor, step / numSteps);
    colors.push(currentColor);
    step++;
  }
  return colors;
}
function palettePureHue(pal) {
  let p2 = pal.map(x => colorGetPureHue(x));
  return pal.map(x => colorO(colorGetPureHue(x)));
}
function paletteShades(color, from = -0.8, to = 0.8, step = 0.2) {
  let res = [];
  for (let frac = from; frac <= to; frac += step) {
    let c = colorCalculator(frac, color, undefined, true);
    res.push(c);
  }
  return res;
}
function paletteShadesBi(color, turnHueBy = 180, from = -0.8, to = 0.8, step = 0.4) {
  let bi = [color, colorTurnHueBy(color, turnHueBy)];
  let res = jsCopy(bi);
  for (const c1 of bi) {
    for (let frac = from; frac <= to; frac += step) {
      let c = colorCalculator(frac, c1, undefined, true);
      addIf(res, c);
    }
  }
  return res;
}
function paletteShadesHues(color, n = 2, turnHueBy = 30, from = -0.5, to = 0.5, step = 0.5) {
  let list = [color];
  for (let i = 1; i < n; i++) list.push(colorTurnHueBy(color, i * turnHueBy))
  let res = jsCopy(list);
  if (n == 2) { from = -.8; to = .8; step = .4; }
  for (const c1 of list) {
    for (let frac = from; frac <= to; frac += step) {
      let c = colorCalculator(frac, c1, undefined, true);
      addIf(res, c);
    }
  }
  return res;
}
function paletteShadesQuad(color, from = -0.5, to = 0.5, step = 0.5) {
  let tri = [color, colorTurnHueBy(color, 90), colorTurnHueBy(color, 180), colorTurnHueBy(color, 270)];
  let res = jsCopy(tri);
  for (const c1 of tri) {
    for (let frac = from; frac <= to; frac += step) {
      let c = colorCalculator(frac, c1, undefined, true);
      addIf(res, c);
    }
  }
  return res;
}
function paletteShadesTri(color, from = -0.5, to = 0.5, step = 0.5) {
  let tri = [color, colorTurnHueBy(color, 120), colorTurnHueBy(color, 240)];
  let res = jsCopy(tri);
  for (const c1 of tri) {
    for (let frac = from; frac <= to; frac += step) {
      let c = colorCalculator(frac, c1, undefined, true);
      addIf(res, c);
    }
  }
  return res;
}
function paletteToObjects(pal) { return pal.map(x => colorO(x)); }
function paletteTrans(color, from = 0.1, to = 1, step = 0.2) {
  let res = [];
  for (let frac = from; frac <= to; frac += step) {
    let c = colorTrans(color, frac);
    res.push(c);
  }
  return res;
}
function paletteTransWhiteBlack(n = 9) {
  let c = 'white';
  let pal = [c];
  let [iw, ib] = [Math.floor(n / 2), Math.floor((n - 1) / 2)];
  let [incw, incb] = [1 / (iw + 1), 1 / (ib + 1)];
  for (let i = 1; i < iw; i++) {
    let alpha = 1 - i * incw;
    pal.push(colorTrans(c, alpha));
  }
  pal.push('transparent');
  c = 'black';
  for (let i = 1; i < ib; i++) {
    let alpha = i * incb;
    pal.push(colorTrans(c, alpha));
  }
  pal.push(c);
  return pal;
}
function parseDate(dateStr) {
  const [month, day, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
}
function pathFromBgImage(bgImage) { return bgImage.substring(5, bgImage.length - 2); }
function pentagonTessellationCenters(rows, cols, w, h) {
  const centers = [];
  for (let r = 0; r < rows; r++) {
    const y = r * h;
    const xOffset = (r % 2) * (w / 2);
    for (let c = 0; c < cols; c++) {
      const x = c * w + xOffset;
      centers.push({ x, y });
    }
  }
  return centers;
}
function pickFromObject(obj, keys) {
  return Object.fromEntries(
    keys.filter(key => key in obj).map(key => [key, obj[key]])
  );
}
function placeCircle(dParent, cx, cy, sz, bg = 'red') {
  let o = { cx, cy, sz };
  let [w, h] = [sz, sz];
  o.div = mDom(dParent, { w, h, position: 'absolute', round: true, x: cx - sz / 2, y: cy - sz / 2, bg });
  return o;
}
function placeCircles(dParent, n, sz, color) {
  let [w, h] = [mGetStyle(dParent, 'w'), mGetStyle(dParent, 'h')];
  let [radx, rady] = [w / 2, h / 2];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const circles = [];
  for (let i = 0; i < n; i++) {
    const angle = i * goldenAngle;
    const distance = Math.sqrt(i / n);
    let x = radx + distance * radx * Math.cos(angle);
    let y = rady + distance * rady * Math.sin(angle);
    let o = placeCircle(dParent, x, y, sz, color);
    circles.push(o);
  }
  return circles;
}
function placeCirclesRandom(dParent, n, sz, color, rand = 0.2) {
  let [w, h] = [mGetStyle(dParent, 'w'), mGetStyle(dParent, 'h')];
  let [radx, rady] = [w / 2, h / 2];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const circles = [];
  for (let i = 0; i < n; i++) {
    const angle = i * goldenAngle + (Math.random() - 0.5) * goldenAngle * rand;
    const distance = Math.sqrt(i / n);
    let x = radx + distance * radx * Math.cos(angle);
    let y = rady + distance * rady * Math.sin(angle);
    let o = placeCircle(dParent, x, y, sz, color);
    circles.push(o);
  }
  return circles;
}
async function placeYourMeeple(ev) {
  let d = mBy('dCanvas');
  document.onclick = null;
  d.onmousemove = null;
  let sz = rChoose(range(10, 40));
  let b = mGetStyle(d, 'border-width'); //console.log(b);
  let p = mGetStyle(d, 'padding'); console.log(p);
  x = ev.clientX - d.offsetLeft - b - sz;
  y = ev.clientY - d.offsetTop - b - sz;
  let pMeeple = { x, y, sz, bg: 'red', border: 'gold', id: getUID(), owner: 'hallo' };
  drawMeeple(d, pMeeple);
  lookupAddToList(B, ['meeples'], pMeeple);
  let linesActivated = B.linesActivated = getActivatedLines(B.lines);
  console.log('linesActivated', linesActivated);
  B.selectedPoints = [];
  B.endPoints = [];
  B.possiblePairs = [];
  if (linesActivated.length == 1) {
    B.selectedPoints.push(linesActivated[0].p1.id);
    B.selectedPoints.push(linesActivated[0].p2.id);
    let res = await lacunaMoveComplete(B.selectedPoints); console.log('res', res);
  } else {
    animateEndpointsOfActivatedLines();
  }
}
async function placeYourMeepleGame(ev) {
  let [fen, players, pl] = [T.fen, T.players, T.players[getUname()]]
  stopPulsing();
  d = mBy('dCanvas');
  d.onmousemove = null;
  d.onclick = null;
  for (const p of B.hotspotList) { mStyle(p.div, { z: 0 }) }
  for (const p of B.points) { p.div.style.zIndex = 1000; }
  let sz = 20;
  x = ev.clientX - d.offsetLeft - d.parentNode.offsetLeft;
  y = ev.clientY - d.offsetTop - d.parentNode.offsetTop;
  let pMeeple = { x: x - sz / 2, y: y - sz / 2, sz, bg: 'black', border: getPlayerProp('color'), id: getUID(), owner: getUname() };
  fen.meeples.push(jsCopy(pMeeple));
  showMeeple(d, pMeeple);
  B.meeples.push(pMeeple);
  if (B.endPoints.length == 0) {
    await lacunaMoveCompletedME([]);
  } else if (B.endPoints.length == 2) {
    B.selectedPoints.push(B.endPoints[0]);
    B.selectedPoints.push(B.endPoints[1]);
    await lacunaMoveCompletedME(B.selectedPoints);
  } else lacunaMakeSelectableME();
}
async function placeYourMeepleME(ev) {
  let [fen, players, pl] = [T.fen, T.players, T.players[getUname()]]
  stopPulsing();
  d = mBy('dCanvas');
  d.onmousemove = null;
  d.onclick = null;
  for (const p of B.hotspotList) { mStyle(p.div, { z: 0 }) }
  for (const p of B.points) { p.div.style.zIndex = 1000; }
  let sz = 20;
  x = ev.clientX - d.offsetLeft - d.parentNode.offsetLeft;
  y = ev.clientY - d.offsetTop - d.parentNode.offsetTop;
  let pMeeple = { x: x - sz / 2, y: y - sz / 2, sz, bg: 'black', border: getPlayerProp('color'), id: getUID(), owner: getUname() };
  fen.meeples.push(jsCopy(pMeeple));
  showMeeple(d, pMeeple);
  B.meeples.push(pMeeple);
  if (B.endPoints.length == 0) {
    await lacunaMoveCompletedME([]);
  } else if (B.endPoints.length == 2) {
    B.selectedPoints.push(B.endPoints[0]);
    B.selectedPoints.push(B.endPoints[1]);
    await lacunaMoveCompletedME(B.selectedPoints);
  } else lacunaMakeSelectableME();
}
function planeFunction(u, v) {
  return [u, v, 0];
}
function playMusicFile() {
  document.getElementById('fileInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
      const audioURL = URL.createObjectURL(file);
      const audioPlayer = document.getElementById('audioPlayer');
      audioPlayer.src = audioURL;
      audioPlayer.play();
    }
  });
}
function playYouTubeVideo(url, containerId) {
  const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]+)/);
  if (!videoIdMatch) {
    console.error("Invalid YouTube URL");
    return;
  }
  const videoId = videoIdMatch[1];
  const iframe = document.createElement("iframe");
  iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  iframe.width = "560";
  iframe.height = "315";
  iframe.frameBorder = "0";
  iframe.allow = "autoplay; encrypted-media";
  iframe.allowFullscreen = true;
  const container = document.getElementById(containerId);
  if (!container) {
    console.error("Container not found");
    return;
  }
  container.innerHTML = ""; // Clear previous video
  container.appendChild(iframe);
}
function playerStatCount(key, n, dParent, styles = {}, opts = {}) {
  let sz = valf(styles.sz, 22);
  addKeys({ display: 'flex', margin: 4, dir: 'column', 'align-content': 'center', fz: sz, align: 'center' }, styles);
  let d = mDiv(dParent, styles);
  let o = M.superdi[key];
  if (typeof key == 'function') key(d, { w: '100%', fg: 'grey' });
  else if (isFilename(key)) {
    mKey(key, d, { w: '100%', fg: 'grey' }, opts);
  }
  else if (isColor(key)) mDom(d, { bg: key, fz: sz, w: '100%', fg: key }, { html: ' ' });
  else if (isdef(o)) {
    mKey(key, d, { fz: sz, h: sz, fg: 'grey' }, opts);
  }
  else mText(key, d, { fz: sz, w: '100%' });
  d.innerHTML += `<span ${isdef(opts.id) ? `id='${opts.id}'` : ''} style="font-weight:bold;color:inherit">${n}</span>`;
  return d;
}
function pluralOf(s, n) {
  di = { food: '', child: 'ren' };
  return s + (n == 0 || n > 1 ? valf(di[s.toLowerCase()], 's') : '');
}
function pointAddMargin(p, margin) {
  return { x: p.x + margin, y: p.y + margin, type: p.type, owner: p.owner };
}
function pointFromFenRaw(pfen) {
  const [x, y, type, owner] = pfen.split('_').map(val => isNaN(val) ? val : parseInt(val, 10));
  return { x, y, type, owner: nundef(owner) ? null : owner };
}
function pointToFen(p) {
}
function pointToLineDistance(x, y, x1, y1, x2, y2) {
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  const dot = A * C + B * D;
  const len_sq = C * C + D * D;
  const param = len_sq !== 0 ? dot / len_sq : -1;
  let xx, yy;
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }
  const dx = x - xx;
  const dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}
function pollAndShow() { console.log(`poll: ${DA.pollCounter++}`); updateMain(); }
function pollInit() {
  let pollStates = DA.pollStates = {
    games: {
      OFF: { color: 'red', text: 'OFF', blink: false, interval: 0, index: 0, ison: false },
      ON: { color: 'green', text: 'ON', blink: false, interval: 3000, index: 1, ison: true },
    },
    table: {
      OFF: { color: 'red', text: 'OFF', blink: false, interval: 0, index: 2, ison: false },
      ON: { color: 'green', text: 'ON', blink: false, interval: 1500, index: 3, ison: true },
    },
    settings: {
      OFF: { color: 'red', text: 'OFF', blink: false, interval: 0, index: 0, ison: false },
      ON: { color: 'green', text: 'ON', blink: false, interval: 3000, index: 1, ison: true },
    },
  };
  if (TESTING || DEV) {
    let d = mBy('dTestLeft');
    let bPollNow = mDom(d, {}, { tag: 'button', html: 'poll', onclick: onclickPoll, id: 'bPollNow' });
    let bPollToggle = mDom(d, {}, { tag: 'button', html: 'polling', id: 'bPollToggle', onclick: onclickPollToggle });
    DA.pollMode = 'manual';
  } else DA.pollMode = 'auto';
  document.addEventListener("visibilitychange", handleVisibilityChange);
  if (DA.pollMode == 'manual') pollSetState(DA.pollStates[DA.menu]['OFF']); else pollSetState(DA.pollStates[DA.menu]['ON']);
}
function pollIsOn() { return DA.pollState && DA.pollState.ison; }
function pollOff() {
  assertion(DA.menu, 'pollOff: DA.menu not defined!!!')
  pollSetState(DA.pollStates[DA.menu]['OFF'])
}
function pollOn(force = false) {
  if (pollIsOn() || !force && DA.pollMode == 'manual') return;
  assertion(DA.menu, 'pollOn: DA.menu not defined!!!')
  pollSetState(DA.pollStates[DA.menu]['ON'])
}
function pollSetState(pollState) {
  if (DA.pollState == pollState) return;
  DA.pollState = pollState;
  DA.pollInterval = pollState.interval;
  DA.pollCounter = 0;
  let bPollToggle = mBy('bPollToggle');
  if (isdef(bPollToggle)) {
    mStyle(bPollToggle, { color: pollState.color }, { html: `${pollState.text + (pollState.interval ? (':') + pollState.interval : '')}` });
    if (pollState.blink) {
      bPollToggle.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, iterations: Infinity });
    } else {
      bPollToggle.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500 });
    }
  }
  if (pollState.text == 'ON' && !DA.TOPOLL) {
    assertion(DA.pollInterval >= 500, `poll interval to small!!! ${DA.pollInterval}`);
    DA.TOPOLL = setInterval(pollAndShow, DA.pollInterval);
  } else if (DA.TOPOLL) { clearTimeout(DA.TOPOLL); DA.TOPOLL = null; }
}
function pollToggle() {
  let menu = DA.menu;
  let pollStates = DA.pollStates[menu];
  let pollState = pollStates[DA.pollState == pollStates.ON ? 'OFF' : 'ON'];
  pollSetState(pollState);
}
function polyPointsFrom(w, h, x, y, pointArr) {
  x -= w / 2;
  y -= h / 2;
  let pts = pointArr.map(p => [p.X * w + x, p.Y * h + y]);
  let newpts = [];
  for (const p of pts) {
    newp = { X: p[0], Y: Math.round(p[1]) };
    newpts.push(newp);
  }
  pts = newpts;
  let sPoints = pts.map(p => '' + p.X + ',' + p.Y).join(' ');
  return sPoints;
}
function posXY(d1, dParent, x, y, unit = 'px', position = 'absolute') {
  if (nundef(position)) position = 'absolute';
  if (dParent && !dParent.style.position) dParent.style.setProperty('position', 'relative');
  d1.style.setProperty('position', position);
  if (isdef(x)) d1.style.setProperty('left', makeUnitString(x, unit));
  if (isdef(y)) d1.style.setProperty('top', makeUnitString(y, unit));
}
async function postImage(img, path) {
  let dataUrl = imgToDataUrl(img);
  let o = { image: dataUrl, filename: path };
  let resp = await mPostRoute('postImage', o);
}
async function postUsers() {
  let res = await mPhpPost('all', { action: 'savey', file: 'users', o: M.users });
}
function precomputePolygonNeighbors(groupElement) {
  if (!groupElement || !(groupElement instanceof SVGGElement)) {
    console.error("Invalid group element.");
    return;
  }
  const polygons = Array.from(groupElement.querySelectorAll('polygon'));
  polygons.forEach((polygon, i) => {
    if (!polygon.id) {
      polygon.id = `poly-${i}`;
    }
  });
  function getPointSet(polygon) {
    return new Set(
      polygon.getAttribute('points')
        .trim()
        .split(/\s+/)
        .map(p => p.trim())
    );
  }
  const pointSets = new Map();
  polygons.forEach(p => {
    pointSets.set(p.id, getPointSet(p));
  });
  polygons.forEach(p1 => {
    const id1 = p1.id;
    const set1 = pointSets.get(id1);
    const neighbors = [];
    polygons.forEach(p2 => {
      const id2 = p2.id;
      if (id1 === id2) return;
      const set2 = pointSets.get(id2);
      const shared = [...set1].filter(point => set2.has(point));
      if (shared.length >= 2) {
        neighbors.push(id2);
      }
    });
    p1.dataset.neighbors = neighbors.join(',');
  });
}
function precomputePolygonNeighborsFromSvg(groupElement) {
  if (!groupElement || !(groupElement instanceof SVGGElement)) {
    console.error("Invalid group element.");
    return;
  }
  const polygons = Array.from(groupElement.querySelectorAll('polygon'));
  let nei = {};
  polygons.forEach((polygon, i) => {
    if (!polygon.id) {
      polygon.id = `poly-${i}`;
      nei[i] = [];
    }
  });
  function getPointSet(polygon) {
    return new Set(
      polygon.getAttribute('points')
        .trim()
        .split(/\s+/)
        .map(p => p.trim())
    );
  }
  const pointSets = new Map();
  polygons.forEach(p => {
    pointSets.set(p.id, getPointSet(p));
  });
  polygons.forEach(p1 => {
    const id1 = p1.id;
    const set1 = pointSets.get(id1);
    const neighbors = [];
    polygons.forEach(p2 => {
      const id2 = p2.id;
      if (id1 === id2) return;
      const set2 = pointSets.get(id2);
      const shared = [...set1].filter(point => set2.has(point));
      if (shared.length >= 2) {
        neighbors.push(id2);
      }
    });
    let i = Number(id1.split('-')[1]);
    nei[i] = neighbors.map(x => Number(x.split('-')[1]));
    p1.dataset.neighbors = neighbors.join(',');
  });
  return nei;
}
async function preloadImages(imageUrls) {
  const promises = imageUrls.map(async (url) => {
    const img = new Image();
    return new Promise((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = (error) => reject(error);
      img.src = url;
    });
  });
  return await Promise.all(promises);
}
function prepInstruction(table) {
  if (isdef('dInstruction')) mRemove('dInstruction');
  let myTurn = isMyTurn(table);
  if (!myTurn) staticTitle(table); else animatedTitle();
  let d = mBy('dExtra');
  let style = { matop: 2, bg: 'white', fg: 'black', w100: true, box: true, display: 'flex', 'justify-content': 'center', 'align-items': 'center' };
  let dInst = mDom(d, style, { id: 'dInstruction' });
  let html;
  if (myTurn) {
    html = `
        ${getWaitingHtml(14)}
        <span style="color:red;font-weight:bold;max-height:25px">You</span>
        &nbsp;<span id='dInstructionText'></span>
        `;
  } else { html = `waiting for: ${getTurnPlayers(table)}` }
  dInst.innerHTML = html;
}
function present() {
  if (Settings.perspective == 'me') presentFor(me);
  else presentAll();
}
function presentAll() {
  clearZones();
  for (const pl of T.players) {
    let zone = Zones[pl.id];
    pl.hand.showDeck(zone.dData, 'right', 0, false);
  }
  showTrick();
}
function presentBgaRoundTable() {
  let d0 = mDom('dMain');
  let [dl, dr] = mColFlex(d0, [4, 1]);
  d = mDom(dl); mCenterFlex(d);
  if (nundef(mBy('dInstruction'))) mDom(d, { className: 'instruction' }, { id: 'dInstruction' }); mLinebreak(d); // instruction
  let minTableSize = 400;
  let dTable = mDom(d, { hmin: minTableSize, wmin: minTableSize, hmargin: 20, round: true, className: 'wood' }, { id: 'dTable' });
  mCenterCenter(dTable);
  let dstats = mDom(dr, {}, { id: 'dStats' });
  return dTable;
}
function presentExtraWorker(item, dParent, styles = {}) {
  let sz = styles.sz;
  addKeys({ paright: 10, bg: 'white', rounding: '50%', hmargin: 8, h: 30, position: 'relative' }, styles)
  let d = mDom(dParent, styles); mFlex(d);
  let img = mDom(d, { h: '100%' }, { tag: 'img', src: '../assets/games/nations/templates/worker.png' })
  let img2 = mDom(d, { h: sz * 2 / 3, w: sz * 2 / 3, position: 'absolute', top: '17%', left: '40%' }, { tag: 'img', src: `../assets/games/nations/templates/${item.o.res}.png` });
  return d;
}
function presentFor(me) {
  clearElement(dTable);
  let others = arrWithout(T.players, [me]);
  for (const pl of others) {
    pl.hand.showDeck(dTable, 'right', 0, false);
  }
  mLinebreak(dTable);
  T.trick.showDeck(dTable, 'right', 20, true);
  mLinebreak(dTable);
  me.hand.showDeck(dTable, 'right', 0, false);
  showFleetingMessage('click to play a card!');
}
function presentImageCropper(url) {
  let d = mDom('dMain', { position: 'absolute', h: 500, w: 500, bg: 'navy' });
  let img = mDom(d, { w: 300, h: 300, 'object-fit': 'cover', 'object-position': 'center center' }, { tag: 'img', src: url });
}
function presentStandardBGA() {
  let dTable = mDom('dMain');
  mClass('dPage', 'wood');
  let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dTable); mFlexWrap(dOpenTable)
  mDom(dRechts, {}, { id: 'dStats' });
}
function proceed(nextLevel) {
  if (nundef(nextLevel)) nextLevel = currentLevel;
  if (nextLevel > MAXLEVEL) {
    let iGame = gameSequence.indexOf(currentGame) + 1;
    if (iGame == gameSequence.length) {
      soundGoodBye();
      mClass(document.body, 'aniSlowlyDisappear');
      show(dLevelComplete);
      dLevelComplete.innerHTML = 'CONGRATULATIONS! You are done!';
    } else {
      let nextGame = gameSequence[iGame];
      setGoal(nextGame);
    }
  } else if (LevelChange) startLevel(nextLevel);
  else startRound();
}
async function pyStartGame(gamename, players, options = {}) {
  const data = {
    gamename: valf(gamename, 'tictactoe'),
    players: valf(players, ['felix', 'mimi']),
    options
  };
  return await api('POST', '/start_game', data);
}
function qsort(arr) {
  if (arr.length <= 1) return arr
  let x = arr[0]
  let lower = [], upper = []
  for (i = 1; i < arr.length; i++)
    if (arr[i] < x) lower.push(arr[i])
    else upper.push(arr[i])
  return qsort(lower).concat([x]).concat(qsort(upper));
}
function quadCenters(rows, cols, wCell, hCell) {
  let offX = wCell / 2, offY = hCell / 2;
  let centers = [];
  let x = 0; y = 0;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let center = { x: x + offX, y: y + offY };
      centers.push(center);
      x += wCell;
    }
    y += hCell; x = 0;
  }
  return [centers, wCell * cols, hCell * rows];
}
function quickUi(dParent) {
  dParent = toElem(dParent);
  let html = `
    <div>
      <h1>Game Interface</h1>
      <section>
        <h2>Start a Game</h2>
        <label for="gameSelect">Game:</label>
        <select id="gameSelect"></select>
        <button id="startGameBtn">Start</button>
      </section>
      <section>
        <h2>Make a Move</h2>
        <label for="gameIdInput">Game ID:</label>
        <input type="text" id="gameIdInput" placeholder="Enter game ID" />
        <label for="moveInput">Move (JSON):</label>
        <input type="text" id="moveInput" value='{"row":0,"col":1}' />
        <button id="makeMoveBtn">Submit Move</button>
      </section>
      <section>
        <h2>Game State</h2>
        <label for="stateGameId">Game ID:</label>
        <input type="text" id="stateGameId" />
        <button id="fetchStateBtn">Get State</button>
        <pre id="gameState"></pre>
      </section>
      <section>
        <h2>Global Chat</h2>
        <div id="chatBox" style="border:1px solid #ccc; height:150px; overflow-y:scroll; padding:5px;"></div>
        <input type="text" id="chatInput" placeholder="Say something..." />
        <button id="sendChatBtn">Send</button>
      </section>
    </div>
    `;
  dParent.innerHTML = html;
}
function rBgFor() { for (const d of Array.from(arguments)) { mStyle(d, { bg: rColor() }) } }
function rBlend() { return rBlendCanvas(); }
function rBlendCSS() { return rChoose(getBlendModesCSS()); }
function rBlendCanvas() { return rChoose(getBlendModesCanvas()); }
function rChoose(arr, n = 1, func = null, exceptIndices = null) {
  if (isDict(arr)) arr = dict2list(arr, 'key');
  let indices = arrRange(0, arr.length - 1);
  if (isdef(exceptIndices)) {
    for (const i of exceptIndices) removeInPlace(indices, i);
  }
  if (isdef(func)) indices = indices.filter(x => func(arr[x]));
  if (n == 1) {
    let idx = Math.floor(Math.random() * indices.length);
    return arr[indices[idx]];
  }
  arrShuffle(indices);
  return indices.slice(0, n).map(x => arr[x]);
}
function rColor(lum100OrAlpha01 = 1, alpha01 = 1, hueVari = 60) {
  let c;
  if (lum100OrAlpha01 <= 1) {
    c = '#';
    for (let i = 0; i < 6; i++) { c += rChoose(['f', 'c', '9', '6', '3', '0']); }
    alpha01 = lum100OrAlpha01;
  } else {
    let hue = rHue(hueVari);
    let sat = 100;
    let b = isNumber(lum100OrAlpha01) ? lum100OrAlpha01 : lum100OrAlpha01 == 'dark' ? 25 : lum100OrAlpha01 == 'light' ? 75 : 50;
    c = colorHsl360ArgsToHex79(hue, sat, b);
  }
  return alpha01 < 1 ? colorTrans(c, alpha01) : c;
}
function rColorName(n = 1) { return rChoose(M.colorNames, n); }
function rCommand(n = 1) { return rChoose(commandWords, n); }
function rHue(vari = 36) { return (rNumber(0, vari) * Math.round(360 / vari)) % 360; }
function rKeyType() { return rChoose(getKeyTypes()); }
function rLetter(except) { return rLetters(1, except)[0]; }
function rLetters(n, except = []) {
  let all = 'abcdefghijklmnopqrstuvwxyz';
  for (const l of except) all = all.replace(l, '');
  return rChoose(toLetters(all), n);
}
function rNumber(min = 0, max = 100) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function rTexture() { return rChoose(valf(M.textures, [])); }
function rUniqueId(prefix = '', n = 10) { return prefix + rChoose(toLetters('0123456789abcdefghijklmnopqABCDEFGHIJKLMNOPQRSTUVWXYZ_'), n).join(''); }
function rWord(n = 6) { return rLetters(n).join(''); }
function rWords(n = 1) {
  let words = getColorNames().map(x => x.toLowerCase());
  let arr = rChoose(words, n);
  return arr;
}
function randomColor() { return rColor(); }
function randomIndex(array) { return randomRange(0, array.length) | 0 }
function randomNumber(min = 0, max = 100) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomRange(min, max) { return min + Math.random() * (max - min) }
function range(f, t, st = 1) {
  if (nundef(t)) {
    t = f - 1;
    f = 0;
  }
  let arr = [];
  for (let i = f; i <= t; i += st) {
    arr.push(i);
  }
  return arr;
}
function recFlatten(o) {
  if (isLiteral(o)) return o;
  else if (isList(o)) return o.map(x => recFlatten(x)).join(', ');
  else if (isDict(o)) {
    let valist = [];
    for (const k in o) { let val1 = recFlatten(o[k]); valist.push(`${k}: ${val1}`); }
    return valist.join(', ');
  }
}
function recPollEvent() { DA.prevEvPoll = DA.evPoll; DA.evPoll = getNow(); DA.evList.push({ poll: DA.evPoll }); }
function recServerEvent() { DA.prevEvServer = DA.evServer; DA.evServer = getNow(); DA.evList.push({ server: DA.evServer }); }
function recSysEvent() { DA.prevEvSys = DA.evSys; DA.evSys = getNow(); DA.evList.push({ sys: DA.evSys }); }
function recUserEvent() { DA.prevEvUser = DA.evUser; DA.evUser = getNow(); DA.evList.push({ user: DA.evUser }); }
function redrawImage(img, dParent, x, y, wold, hold, w, h, callback) {
  let canvas = mDom(null, {}, { tag: 'canvas', width: w, height: h });
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, x, y, wold, hold, 0, 0, w, h);
  const imgDataUrl = canvas.toDataURL('image/png'); // Change format as needed
  img.onload = () => {
    img.onload = null;
    img.width = w;
    img.height = h;
    mStyle(img, { w: w, h: h });
    mStyle(dParent, { w: w, h: h });
    callback();
  }
  img.src = imgDataUrl;
  return imgDataUrl;
}
function registerAction(key, fromState, toState) {
  let t1 = getNow();
  let t = DA.toggle[key];
  if (nundef(t.timer)) {
    t.timer = mDom(t.elem.parentNode, { bg: 'white', fg: 'black', wmin: 200, }, { html: '&nbsp;' });
  }
}
function reload() {
  console.log('reload!!!')
  if (radio_contacts.checked == true) get_contacts();
  else if (radio_chat.checked == true) get_chats();
  else if (radio_games.checked == true) get_games();
  else if (radio_play.checked == true) get_play();
}
async function reloadTable() {
  if (nundef(DA.tid)) DA.tid = localStorage.getItem('tid') || DA.tableDict ? arrLast(Object.keys(DA.tableDict)) : null;
  if (!DA.tid) return true;
  localStorage.setItem('tid', DA.tid);
  let x = await loadStaticYaml(`y/tables/${DA.tid}.yaml`); //console.log('server table: x', x);
  let clientTable = DAGetTable();
  let hasChanges = !clientTable || !x || x.modified != clientTable.modified;
  if (hasChanges) {
    DA.oldTable = clientTable;
    DA.tableDict[DA.tid] = x;
  }
  return hasChanges;
}
async function reloadTables() {
  let res = await mGetFiles('tables'); //console.log('res', res);
  DA.tableFilenames = res.dir.map(x => x.name);
  DA.tableInfo = res.dir;
  let tables = {}, hasChanges = false;
  for (const f of DA.tableInfo) {
    let id = stringBefore(f.name, '.yaml');
    let ts = f.modified;
    let tOld = lookup(DA, ['tableDict', id]); //DA.tableDict[name];
    if (isdef(tOld) && tOld.modified === ts) { tables[id] = tOld; continue; }
    hasChanges = true;
    let tNew = await loadStaticYaml(`y/tables/${id}.yaml`);
    tNew.modified = ts;
    tables[id] = tNew;
  }
  hasChanges = hasChanges || nundef(DA.tableDict) || Object.keys(DA.tableDict) != Object.keys(tables);
  DA.tableDict = tables;
  return hasChanges;
}
function removeAllEvents(elem) {
  const newElement = elem.cloneNode(true);
  elem.parentNode.replaceChild(newElement, elem);
  return newElement;
}
function removeCommentLines(text, cstart, cend) {
  let lines = text.split('\n');
  let inComment = false, res = '';
  for (const line of lines) {
    let lt = line.trim();
    if (lt.startsWith(cstart) && lt.endsWith(cend)) { continue; }
    if (lt.startsWith(cstart)) { inComment = true; continue; }
    if (lt.endsWith(cend)) { inComment = false; continue; }
    res += line + '\n';
  }
  return res;
}
function removeDuplicates(keys, prop) {
  let di = {};
  let res = [];
  let items = keys.map(x => Syms[x]);
  for (const item of items) {
    if (isdef(di[item.best])) { continue; }
    res.push(item);
    di[item.key] = true;
  }
  return res.map(x => x.key);
}
function removeFromArray(array, i) { return array.splice(i, 1)[0] }
function removeInPlace(arr, el) {
  arrRemovip(arr, el);
}
function removeItemFromArray(array, item) { return removeFromArray(array, array.indexOf(item)) }
function removePeepFromCrowd(peep) {
  removeItemFromArray(crowd, peep)
  availablePeeps.push(peep)
}
function removeRandomFromArray(array) { return removeFromArray(array, randomIndex(array)) }
function removeTrailingComments(line) {
  let icomm = line.indexOf('//');
  let ch = line[icomm - 1];
  if (icomm <= 0 || ch == "'" || ':"`'.includes(ch)) return line;
  if ([':', '"', "'", '`'].some(x => line.indexOf(x) >= 0 && line.indexOf(x) < icomm)) return line;
  return line.substring(0, icomm);
}
function renderBoard() {
  let boardDiv = document.getElementById("board");
  boardDiv.innerHTML = "";
  boardDiv.style.gridTemplateColumns = `repeat(${boardState[0].length}, 50px)`;
  boardState.forEach((row, y) => {
    row.forEach((cell, x) => {
      let div = document.createElement("div");
      div.className = "cell";
      div.innerText = cell;
      div.onclick = () => makeMove(x, y);
      boardDiv.appendChild(div);
    });
  });
}
function renderCard(key, color, border, bg = 'silver') {
  let svg = __cardSvgs[key];
  let parts = svg.split("fill='white' stroke='black'");
  svg = replaceColorsInCard(parts[0], color) + ` fill='${bg}' stroke='${border}' ` + replaceColorsInCard(parts[1], color);
  return svg;
}
function replaceAll(str, search, replacement) {
  return str.split(search).join(replacement);
}
function replaceAllSpecialChars(str, sSub, sBy) { return str.split(sSub).join(sBy); }
function replaceAllSpecialCharsFromList(str, list, sBy, removeConsecutive = true) {
  for (const sSub of list) {
    str = replaceAllSpecialChars(str, sSub, sBy);
  }
  if (removeConsecutive) {
    let sresult = '';
    while (str.length > 0) {
      let sSub = str.substring(0, sBy.length);
      str = stringAfter(str, sSub);
      if (sSub == sBy && sresult.endsWith(sBy)) continue;
      sresult += sSub;
      if (str.length < sBy.length) { sresult += str; break; }
    }
    str = sresult;
  }
  return str;
}
function replaceCardLabel(svgStr, newLabel) {
  svgStr = svgStr.replace(
    /<symbol id='VD2'[^>]*>[\s\S]*?<\/symbol>/,
    `<symbol id='VD2' viewBox='-500 -500 1000 1000' preserveAspectRatio='xMinYMid'>
      <text x='-200' y='300' font-size='800' font-family='serif' fill='red'>${newLabel}</text>
    </symbol>`
  );
  return svgStr;
}
function replaceCardRank(svgStr, newLabel) {
  const match = svgStr.match(/<symbol id='(VD[^']*)'/);
  if (!match) return svgStr;
  const symbolId = match[1]; console.log('symbolId', symbolId)
  const updatedSvg = svgStr.replace(
    new RegExp(`<symbol id='${symbolId}'[^>]*>[\\s\\S]*?<\\/symbol>`),
    `<symbol id='${symbolId}' viewBox='-500 -500 1000 1000' preserveAspectRatio='xMinYMid'>
       <text x='-200' y='300' font-size='800' font-family='serif' fill='red'>${newLabel}</text>
     </symbol>`
  );
  return updatedSvg;
}
function replaceColor(svgString, attr, fromColor, toColor) {
  const regex = new RegExp(`${attr}=['"]${fromColor}['"]`, 'g');
  return svgString.replace(regex, `${attr}='${toColor}'`);
}
function replaceColorsInCard(svg, newColor) {
  const colorsToReplace = ['red', 'black'];
  const attrs = ['fill', 'stroke'];
  for (const attr of attrs) {
    for (const color of colorsToReplace) {
      svg = replaceColor(svg, attr, color, newColor);
    }
  }
  return svg;
}
function replaceElement(elem, newElem) {
  elem.parentNode.replaceChild(newElem, elem);
  return newElem;
}
function resetPeep({ stage, peep }) {
  const direction = Math.random() > 0.5 ? 1 : -1
  const offsetY = 100 - 250 * gsap.parseEase('power2.in')(Math.random())
  const startY = stage.height - peep.height + offsetY
  let startX
  let endX
  if (direction === 1) {
    startX = -peep.width
    endX = stage.width
    peep.scaleX = 1
  } else {
    startX = stage.width + peep.width
    endX = 0
    peep.scaleX = -1
  }
  peep.x = startX
  peep.y = startY
  peep.anchorY = startY
  return {
    startX,
    startY,
    endX
  }
}
function resetRound() {
  clearTimeouts();
  clearFleetingMessage();
  clearEvents();
}
function resize() {
  stage.width = Canvas.clientWidth
  stage.height = Canvas.clientHeight
  Canvas.width = stage.width * devicePixelRatio
  Canvas.height = stage.height * devicePixelRatio
  crowd.forEach((peep) => {
    peep.walk.kill()
  })
  crowd.length = 0
  availablePeeps.length = 0
  availablePeeps.push(...allPeeps)
  initCrowd()
}
function resizeImage(file, maxWidth, maxHeight) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const scale = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        const resizedDataUrl = canvas.toDataURL("image/jpeg", 0.8); // Quality: 0.8 (optional)
        resolve({ dataUrl: resizedDataUrl, width, height });
      };
      img.onerror = () => {
        console.error("Error loading image.");
        reject("Error loading image.");
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      console.error("Error reading file.");
      callback(null);
    };
    reader.readAsDataURL(file);
  });
}
function resizeTo(tool, wnew, hnew) {
  let [img, dParent, cropBox, setRect] = [tool.img, tool.dParent, tool.cropBox, tool.setRect];
  if (hnew == 0) hnew = img.height;
  if (wnew == 0) {
    let aspectRatio = img.width / img.height;
    wnew = aspectRatio * hnew;
  }
  redrawImage(img, dParent, 0, 0, img.width, img.height, wnew, hnew, () => setRect(0, 0, wnew, hnew))
}
async function restartGame() {
  return await api('POST', '/restart');
}
function root(areaName) {
  setTableSize(areaName, 400, 300);
  UIROOT = jsCopy(SPEC.staticSpec.root);
  for (const k in AREAS) delete AREAS[k];
  PROTO = {};
  INFO = {};
  staticArea(areaName, UIROOT);
  addAREA('root', UIROOT);
}
async function rotateAndWriteAge(img, card) {
  let diStage = { 0: 'I', 1: 'I', 2: 'II', 3: 'III', 4: 'II II' };
  let [w, h] = [img.width, img.height];
  mDom('dExtra', { h: 4 })
  let cv2 = mDom('dExtra', {}, { tag: 'canvas', width: h, height: w });
  let ctx2 = cv2.getContext('2d');
  ctx2.translate(h, 0)
  ctx2.rotate(90 * Math.PI / 180);
  ctx2.drawImage(img, 0, 0, w, h);
  mDom('dExtra', { h: 4 })
  let cv3 = mDom('dExtra', {}, { tag: 'canvas', width: h, height: w });
  let ctx3 = cv3.getContext('2d');
  ctx3.drawImage(cv2, 0, 0);
  let x = cv3.width / 2;
  let y = cv3.height;
  ctx3.fillStyle = 'white';
  ctx3.font = '20px Arial';
  ctx3.textAlign = 'center';
  let text = diStage(card.age);
  ctx3.fillText(text, x, y);
  return cv3;
}
function roundIfTransparentCorner(img) {
  let c = getPixTL(img);
  if (c.a != 0) {
    let parent = img.parentNode;
    if (arrChildren(parent).length <= 1) {
      let r = getRect(img.parentNode);
      mStyle(img, { round: true, h: r.h - 8, w: r.w - 8 });
    } else mStyle(img, { round: true });
  }
}
function roundToNearestMultiples(n, x = 10) {
  const lower = Math.floor(n / x) * x;
  const higher = Math.ceil(n / x) * x;
  return { lower, higher };
}
function sameList(l1, l2) {
  if (l1.length != l2.length) return false;
  for (const s of l1) {
    if (!l2.includes(s)) return false;
  }
  return true;
}
async function saveAndUpdatePlayerOptions(allPl, gamename) {
  let name = allPl.name;
  let poss = jsCopy(MGetGamePlayerOptionsAsDict(gamename)); delete poss.playmode;
  if (nundef(poss)) return;
  let opts = {};
  for (const p in poss) { allPl[p] = getRadioValue(p); if (p != 'playmode') opts[p] = allPl[p]; }
  let id = 'dPlayerOptions'; mRemoveIfExists(id); //dont need UI anymore
  let oldOpts = valf(MGetUserOptionsForGame(name, gamename), {});
  let changed = false;
  for (const p in poss) {
    if (p == 'playmode') continue;
    if (oldOpts[p] != opts[p]) {
      changed = true;
      break;
    }
  }
  if (changed) {
    console.log('CHANGED!!!!!!!!!!!!!!!!!!!!!!!!!', name, gamename, opts, oldOpts);
    let games = valf(MGetUser(name).games, {});
    games[gamename] = opts;
    let res = await postUsers();
  }
}
function saveBase64Image(imgElement, filename) {
  if (!imgElement || !imgElement.src.startsWith('data:image/jpeg;base64,')) {
    console.error('Invalid image element or source.');
    return;
  }
  const base64Data = imgElement.src.split(',')[1];
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'image/jpeg' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
async function saveDataFromPlayerOptionsUI(gamename) {
  let id = 'dPlayerOptions';
  let lastAllPl = DA.lastAllPlayerItem;
  let dold = mBy(id);
  if (isdef(dold)) { await saveAndUpdatePlayerOptions(lastAllPl, gamename); dold.remove(); }
}
function saveFileAtClient(name, type, data) {
  if (data != null && navigator.msSaveBlob) return navigator.msSaveBlob(new Blob([data], { type: type }), name);
  let a = document.createElement('a');
  a.style.display = 'none';
  let url = window.URL.createObjectURL(new Blob([data], { type: type }));
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  simulateClick(a);
  setTimeout(function () {
    window.URL.revokeObjectURL(url);
    a.remove();
  }, 500);
}
async function saveGame(gameId, data) {
  return await api('POST', `/save_game/${gameId}`, data);
}
function savePanZoomCanvas(canvas) {
  if (canvas) {
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'canvas-image.png';
    link.click();
  }
}
function scaleAnimation(elem) {
  elem = toElem(elem);
  let ani = elem.animate([
    { transform: 'scale(1)' },
    { transform: 'scale(1.3)', color: 'red', backgroundColor: 'yellow' },
  ], {
    duration: 500,
    easing: 'ease-in',
    iterations: 2,
    direction: 'alternate'
  });
  return ani;
}
function sectionTitle(dParent, title) {
  mText(title, dParent, { fz: '150%', weight: 'bold', margin: 12, matop: 0 });
}
function selPrep(fen, autosubmit = false) {
  A = { level: 0, di: {}, ll: [], items: [], selected: [], tree: null, breadcrumbs: [], sib: [], command: null, autosubmit: autosubmit };
}
function selectAddItems(items, callback = null, instruction = null) {
  let fen = T.fen;
  A.level++; A.items = items; A.callback = callback; A.selected = []; A.di = {};
  let dInstruction = mBy('dSelections0');
  mClass(dInstruction, 'instruction');
  mCenterCenterFlex(dInstruction);
  mStyle(dInstruction, { 'align-content': 'center', 'justify-content': 'center' })
  dInstruction.innerHTML = (isMyTurn(table) ? `${getWaitingHtml()}<span style="color:red;font-weight:bold;max-height:25px">You</span>` + "&nbsp;" + instruction : `waiting for: ${getTurnPlayers(table)}`);
  let buttonstyle = { maleft: 25, vmargin: 2, rounding: 6, padding: '4px 12px 5px 12px', border: '0px solid transparent', outline: 'none' }
  for (const item of A.items) {
    let type = item.itemtype = isdef(item.itemtype) ? item.itemtype : is_card(item) ? 'card' : isdef(M.superdi[item.key]) ? 'sym' : isdef(item.o) ? 'container' : isdef(item.src) ? 'img' : 'string';
    let [el, o, d1, fz, fg] = [null, item.o, dInstruction, 30, 'grey'];
    if (type == 'sym') {
      if (isdef(o.img)) { el = mDom(d1, { h: fz, hmargin: 8, 'object-fit': 'cover', 'object-position': 'center center' }, { tag: 'img', src: `${o.img}` }); }
      else if (isdef(o.text)) el = mDom(d1, { hmargin: 8, fz: fz, hline: fz, family: 'emoNoto', fg: fg, display: 'inline' }, { html: o.text });
      else if (isdef(o.fa6)) el = mDom(d1, { hmargin: 8, fz: fz - 2, hline: fz, family: 'fa6', bg: 'transparent', fg: fg, display: 'inline' }, { html: String.fromCharCode('0x' + o.fa6) });
      else if (isdef(o.fa)) el = mDom(d1, { hmargin: 8, fz: fz, hline: fz, family: 'pictoFa', bg: 'transparent', fg: fg, display: 'inline' }, { html: String.fromCharCode('0x' + o.fa) });
      else if (isdef(o.ga)) el = mDom(d1, { hmargin: 8, fz: fz, hline: fz, family: 'pictoGame', bg: 'beige', fg: fg, display: 'inline' }, { html: String.fromCharCode('0x' + o.ga) });
    } else if (isdef(item.present)) {
      el = item.present(item, d1, { sz: fz, fg: fg });
    } else assertion(false, `WRONG ITEM TYPE ${type}`)
    mStyle(el, { cursor: 'pointer' })
    el.id = getUID(); A.di[el.id] = item;
    el.onclick = callback;
  }
}
function selectCivSpot(d) {
  if (isdef(M.selectedCivSpot)) mClassRemove(M.selectedCivSpot, 'shadow');
  M.selectedCivSpot = d;
  mClass(d, 'shadow')
}
function selectExtraWorker(item) {
}
function selectText(el) {
  if (el instanceof HTMLTextAreaElement) { el.select(); return; }
  var sel, range;
  if (window.getSelection && document.createRange) {
    sel = window.getSelection();
    if (sel.toString() == '') {
      window.setTimeout(function () {
        range = document.createRange();
        range.selectNodeContents(el);
        sel.removeAllRanges();
        sel.addRange(range);
      }, 1);
    }
  } else if (document.selection) {
    sel = document.selection.createRange();
    if (sel.text == '') {
      range = document.body.createTextRange();
      range.moveToElementText(el);
      range.select();
    }
  }
}
function sendChat() {
  const input = document.getElementById("chatInput");
  const msg = input.value.trim();
  console.log("Sending chat message:", msg);
  if (msg) {
    DA.socket.emit("chat_message", msg);
    input.value = "";
  }
}
function setCssVar(varname, val) { document.body.style.setProperty(varname, val); }
function setDropPosition(ev, elem, targetElem, dropPos) {
  if (dropPos == 'mouse') {
    var elm = $(targetElem);
    x = ev.pageX - elm.offset().left - dragStartOffset.x;
    y = ev.pageY - elm.offset().top - dragStartOffset.y;
    posXY(elem, targetElem, x, y);
  } else if (dropPos == 'none') {
    return;
  } else if (dropPos == 'center') {
    elem.style.position = elem.style.left = elem.style.top = '';
    elem.classList.add('centeredTL');
  } else if (dropPos == 'centerCentered') {
    elem.style.position = elem.style.left = elem.style.top = '';
    elem.classList.add('centerCentered');
  } else {
    dropPos(ev, elem, targetElem);
  }
}
function setGoal(index) {
  if (nundef(index)) {
    let rnd = G.numPics < 2 ? 0 : randomNumber(0, G.numPics - 2);
    if (G.numPics >= 2 && rnd == lastPosition && coin(70)) rnd = G.numPics - 1;
    index = rnd;
  }
  lastPosition = index;
  Goal = Pictures[index];
}
function setInstruction(s) { mBy('dInstructionText').innerHTML = s; }
function setKeys({ allowDuplicates, nMin = 25, lang, key, keySets, filterFunc, param, confidence, sortByFunc } = {}) {
  let keys = jsCopy(keySets[key]);
  if (isdef(nMin)) {
    let diff = nMin - keys.length;
    let additionalSet = diff > 0 ? nMin > 100 ? firstCondDictKeys(keySets, k => k != key && keySets[k].length > diff) : 'best100' : null;
    if (additionalSet) KeySets[additionalSet].map(x => addIf(keys, x));
  }
  let primary = [];
  let spare = [];
  for (const k of keys) {
    let info = Syms[k];
    info.best = info[lang];
    if (nundef(info.best)) {
      let ersatzLang = (lang == 'D' ? 'D' : 'E');
      let klang = 'best' + ersatzLang;
      if (nundef(info[klang])) info[klang] = lastOfLanguage(k, ersatzLang);
    }
    let isMatch = true;
    if (isdef(filterFunc)) isMatch = isMatch && filterFunc(param, k, info.best);
    if (isdef(confidence)) isMatch = info[klang + 'Conf'] >= confidence;
    if (isMatch) { primary.push(k); } else { spare.push(k); }
  }
  if (isdef(nMin)) {
    let len = primary.length;
    let nMissing = nMin - len;
    if (nMissing > 0) { let list = choose(spare, nMissing); spare = arrMinus(spare, list); primary = primary.concat(list); }
  }
  if (isdef(sortByFunc)) { sortBy(primary, sortByFunc); }
  if (isdef(nMin)) console.assert(primary.length >= nMin);
  if (nundef(allowDuplicates)) {
    primary = removeDuplicates(primary);
  }
  return primary;
}
function setLanguage(x) { currentLanguage = x; startLevel(); }
async function setPlayerNotPlaying(item, gamename) {
  await saveDataFromPlayerOptionsUI(gamename);
  removeInPlace(DA.playerList, item.name);
  mRemoveIfExists('dPlayerOptions');
  unselectPlayerItem(item);
}
async function setPlayerPlaying(allPlItem, gamename) {
  let name = allPlItem.name;
  addIf(DA.playerList, name);
  highlightPlayerItem(allPlItem);
  await saveDataFromPlayerOptionsUI(gamename);
  DA.lastAllPlayerItem = allPlItem;
  let poss = MGetGamePlayerOptions(gamename);
  if (!poss) return;
  let dParent = mBy('dGameMenu');
  let bg = MGetUserColor(name);
  let d1 = mDom(dParent, { bg: colorLight(bg, 50), border: `solid 2px ${bg}`, rounding: 6, display: 'inline-block', hPadding: 3 }, { id: 'dPlayerOptions' });
  mDom(d1, { maleft: 5, matop: -2 }, { html: name });
  let d = mDom(d1, flexCenterCenter());
  for (const [key, val] of Object.entries(poss)) {
    if (!isString(val)) continue;
    let list = val.split(',');
    let fs = mRadioGroup(d, { fg: 'black' }, `d_${key}`, formatLegend(key));
    for (const v of list) {
      let val = isNumber(v) ? Number(v) : v;
      let radio = mRadio(v, val, key, fs, { cursor: 'pointer' }, null, key, false);
      radio.firstChild.onchange = () => {
        lookupSetOverride(DA.allPlayers, [name, key], val);
        if (key === 'playmode') updateUserImageToBotHuman(name, val);
      };
    }
    let userval = lookup(DA.allPlayers, [name, key]);
    for (const ch of fs.children) {
      if (!ch.id) continue;
      let rval = stringAfterLast(ch.id, '_');
      if (isNumber(rval)) rval = Number(rval);
      ch.firstChild.checked = userval == rval || (nundef(userval) && `${rval}` == arrLast(list));
    }
    measureFieldset(fs);
  }
  let [r, rp] = [getRectInt(allPlItem.div, dParent), getRectInt(d1)];
  let x = Math.min(Math.max(r.x - rp.w / 2 + r.w / 2, 0), window.innerWidth - rp.w - 100);
  mIfNotRelative(dParent);
  mPos(d1, x, r.y - rp.h - 4);
  const cleanup = () => {
    document.removeEventListener('mousedown', handleClickOutside);
    document.removeEventListener('keydown', handleEscape);
  };
  const saveAndClose = () => {
    saveAndUpdatePlayerOptions(allPlItem, gamename);
    cleanup();
    d1.remove();
  };
  const handleClickOutside = ev => {
    if (ev.target.closest('#dMenuPlayers') || ev.target.closest('#dPlayerOptions')) return;
    saveAndClose();
  };
  const handleEscape = ev => {
    if (ev.key === 'Escape') saveAndClose();
  };
  setTimeout(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
  }, 0);
  mButtonX(d1, saveAndClose, 18, 2, 'dimgray');
}
function setPlayersToMulti() {
  for (const name in DA.allPlayers) {
    lookupSetOverride(DA.allPlayers, [name, 'playmode'], 'human');
    updateUserImageToBotHuman(name, 'human');
  }
  setRadioValue('playmode', 'human');
}
function setPlayersToSolo() {
  let me = UGetName();
  for (const name in DA.allPlayers) {
    let val = name == me ? 'human' : 'bot';
    lookupSetOverride(DA.allPlayers, [name, 'playmode'], val);
    updateUserImageToBotHuman(name, val);
  }
  let popup = mBy('dPlayerOptions');
  if (isdef(popup)) {
    let val = popup.firstChild.innerHTML.includes(UGetName()) ? 'human' : 'bot';
    setRadioValue('playmode', 'bot');
  }
}
function setRadioValue(prop, val) {
  let input = mBy(`i_${prop}_${val}`);
  if (nundef(input)) return;
  input.checked = true;
}
function setRect(elem, options) {
  let r = getRect(elem);
  elem.rect = r;
  elem.setAttribute('rect', `${r.w} ${r.h} ${r.t} ${r.l} ${r.b} ${r.r}`);
  if (isDict(options)) {
    if (options.hgrow) mStyle(elem, { hmin: r.h });
    else if (options.hfix) mStyle(elem, { h: r.h });
    else if (options.hshrink) mStyle(elem, { hmax: r.h });
    if (options.wgrow) mStyle(elem, { wmin: r.w });
    else if (options.wfix) mStyle(elem, { w: r.w });
    else if (options.wshrink) mStyle(elem, { wmax: r.w });
  }
  return r;
}
function setScoresSameOrHigher(told, tnew) {
  if (nundef(told)) return true;
  let [plold, plnew] = [told.players, tnew.players];
  for (const name in plnew) {
    if (plold[name].score + plold[name].incScore != plnew[name].score) return false;
    plnew[name].incScore = 0;
  }
  return true;
}
function setTableSize(w, h, unit = 'px') {
  let d = mBy('areaTable');
  mStyle(d, { 'min-width': w, 'min-height': h }, unit);
}
function setTableToStarted(table) {
  table.status = 'started';
  table.step = 0;
  table.moves = [];
  table.fen = DA.funcs[table.game].setup(table);
  assertion(table.turn)
  return table;
}
function setTexture(item) {
  if (nundef(item.texture)) {
    let d = mBy('dPage');
    d.style.backgroundImage = '';
    d.style.backgroundSize = '';
    d.style.backgroundBlendMode = '';
    d.style.backgroundRepeat = '';
    return;
  }
  let bgImage = valf(item.bgImage, bgImageFromPath(item.texture), '');
  let bgBlend = valf(item.bgBlend, item.blendMode, '');
  let bgSize = bgImage.includes('marble') || bgImage.includes('wall') ? '100vw 100vh' : '';
  let bgRepeat = 'repeat';
  mStyle('dPage', { bgImage, bgBlend, bgSize, bgRepeat });
}
function setTheme(item) {
  if (nundef(item)) item = U;
  setColors(item);
  setTexture(item);
}
function setUserTheme() {
  setColors(U.color, U.fg);
  setTexture(U);
  settingsCheck();
}
function setupCloseHandlers(elem, onClose, excludeElemId) {
  const cleanup = () => {
    document.removeEventListener('click', handleClickOutside);
    document.removeEventListener('keydown', handleEscape);
  };
  const handleClickOutside = ev => {
    if (mBy(excludeElemId).contains(ev.target)) return;
    onClose();
    cleanup();
  };
  const handleEscape = ev => {
    if (ev.key === 'Escape') {
      onClose();
      cleanup();
    }
  };
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
  }, 0);
}
function setupPopupClose(popup, saveHandler, menuId = 'dMenuPlayers') {
  const cleanup = () => {
    document.removeEventListener('click', handleClickOutside);
    document.removeEventListener('keydown', handleEscape);
  };
  const handleClickOutside = ev => {
    if (mBy(menuId).contains(ev.target)) return;
    saveHandler();
    cleanup();
  };
  const handleEscape = ev => {
    if (ev.key === 'Escape') {
      saveHandler();
      cleanup();
    }
  };
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
  }, 0);
}
function show(elem, isInline = false) {
  if (isString(elem)) elem = document.getElementById(elem);
  if (isSvg(elem)) {
    elem.setAttribute('style', 'visibility:visible');
  } else {
    elem.style.display = isInline ? 'inline-block' : null;
  }
  return elem;
}
async function showBlendMode(dParent, blendCSS) {
  let src = U.texture;
  let fill = U.color;
  let bgBlend = getBlendCanvas(blendCSS);
  let d1 = mDom(dParent);
  let ca = await getCanvasCtx(d1, { w: 300, h: 200, fill, bgBlend }, { src });
  let palette = await getPaletteFromCanvas(ca.cv);
  palette.unshift(fill); palette.splice(8);
  showPaletteMini(d1, palette);
  d1.onclick = async () => {
    U.palette = palette;
    U.blendMode = blendCSS;
    await updateUserTheme();
  }
}
async function showBlendModes() {
  let d = mBy('dSettingsMenu'); mClear(d);
  let dParent = mDom(d, { padding: 10, gap: 10 }); mFlexWrap(dParent);
  let list = arrMinus(getBlendModesCSS(), ['saturation', 'color']);
  for (const blendMode of list) { await showBlendMode(dParent, blendMode); }
}
function showBox(d, x, y) {
  let sz = rNumber(10, 50);
  mDom(d, { w: sz, h: sz, bg: 'red', position: 'absolute', left: x, top: y });
}
async function showCalendarApp() {
  if (!U) { console.log('you have to be logged in to use this menu!!!'); return; }
  showTitle('Calendar');
  let d1 = mDom('dMain', { w: 800, h: 800, margin: 20 }); //, bg: 'white' })
  let x = DA.calendar = await uiTypeCalendar(d1);
}
function showChatMessage(data) {
  var chatBox = document.getElementById("chatBox");
  var newMessage = document.createElement("div");
  newMessage.textContent = data.username + ": " + data.message;
  chatBox.appendChild(newMessage);
  chatBox.scrollTop = chatBox.scrollHeight;
}
function showChatWindow() {
  let dChat = mDom('dRight', { padding: 10, fg: 'white', box: true }, { id: 'dChat', html: 'Chatbox' });
  UI.chatInput = mInput(dChat, { w: 260 }, 'inpChat', '<your message>', 'input', 1);
  UI.chatWindow = mDom(dChat, {}, { id: 'dChatWindow' });
  mOnEnter(UI.chatInput, ev => {
    let inp = ev.target;
    Socket.emit('message', { user: UGetName(), msg: ev.target.value });
    ev.target.value = '';
  });
}
function showCollection(ev) {
  let name = ev.target.innerHTML;
  let keys = M.byCat[name];
  showKeys(keys, 'dMain');
}
function showColor(dParent, c) {
  let [bg, name, bucket] = isDict(c) ? [c.hex, c.name, c.bucket] : [c, c, c];
  return mDom(dParent, { align: 'center', wmin: 120, padding: 2, bg, fg: colorIdealText(bg) }, { html: name + (bg != name ? `<br>${bg}` : '') });
}
function showColorBox(c, skeys = 'name hex hue sat lum', dParent = null, styles = {}) {
  let bg = c.hex;
  let fg = colorIdealText(bg);
  let keys = toWords(skeys);
  let st = jsCopy(styles)
  addKeys({ bg, fg, align: 'center' }, st);
  let textStyles = { weight: 'bold' };
  let d2 = mDom(dParent, st, { class: 'colorbox', dataColor: bg });
  mDom(d2, textStyles, { html: c[keys[0]] });
  let html = '';
  for (let i = 1; i < keys.length; i++) {
    let key = keys[i];
    let val = c[key];
    if (isNumber(val)) val = Number(val);
    if (val <= 1) val = from01ToPercent(val);
    html += `${key}:${val}<br>`;
  }
  let dmini = mDom(d2, {}, { html });
  let item = jsCopy(c);
  item.div = dmini;
  item.dOuter = d2;
  return item;
}
function showColorBoxes(w3extlist, skeys, dParent, styles = {}) {
  let d1 = mDom(dParent, { gap: 12, padding: 12 }); mFlexWrap(d1);
  let items = [];
  for (var c of w3extlist) {
    let item = showColorBox(c, skeys, d1, styles); items.push(item);
    items.push(item);
  }
  return items;
}
function showColorFromHue(dParent, hue, s = 100, l = 50) {
  let c = colorHsl360ArgsToHex79(hue, s, l);
  let w3 = colorNearestNamed(c, M.colorList);
  let d1 = showObject(w3, ['name', 'hex', 'bucket', 'hue'], dParent, { bg: w3.hex, wmin: 120 });
  d1.innerHTML += colorGetBucket(w3.hex);
}
async function showColors() {
  let d = mBy('dSettingsMenu'); mClear(d);
  let di = M.dicolor;
  let bucketlist = 'yellow orangeyellow orange orangered red magentapink magenta bluemagenta blue cyanblue cyan greencyan green yellowgreen'.split(' ');
  bucketlist = arrCycle(bucketlist, 8);
  for (const bucket of bucketlist) {
    let list = dict2list(di[bucket]);
    let clist = [];
    for (const c of list) {
      let o = w3color(c.value);
      o.name = c.id;
      o.hex = c.value;
      clist.push(o);
    }
    let sorted = sortByFunc(clist, x => -x.lightness);
    _showPaletteNames(d, sorted);
  }
  let divs = document.getElementsByClassName('colorbox');
  for (const div of divs) {
    mStyle(div, { cursor: 'pointer' })
    div.onclick = async () => onclickColor(div.getAttribute('dataColor'));
  }
}
async function showDashboard() {
  let me = UGetName();
  if (me == 'guest') { mDom('dMain', { align: 'center', className: 'section' }, { html: 'click username in upper right corner to log in' }); return; }
  homeSidebar(150);
  mAdjustPage(150);
  let div = mDom100('dMain');
  let d1 = mDom(div); mCenterFlex(d1)
  let dta = mDom(d1, { gap: 10, padding: 12 }, { className: 'section' });
  let dblog = mDom(d1, { w100: true, align: 'center' });
  let blog = U.blog;
  if (nundef(blog)) return;
  for (const bl of blog) {
    let dx = mDom(dblog, {}, { className: 'section', html: bl.text });
  }
}
function showDeck(keys, dParent, splay, w, h) {
  let d = mDom(dParent);
  mStyle(d, { display: 'block', position: 'relative', bg: 'green', padding: 25 });
  let gap = 10;
  let ovPercent = 20;
  let overlap = w * ovPercent / 100;
  let x = y = gap;
  for (let i = 0; i < keys.length; i++) {
    let k = keys[i];
    let c = zInno(k, d);
    mAppend(d, c.div);
    mStyle(c.div, { position: 'absolute', left: x, top: y });
    c.row = 0;
    c.col = i;
    x += overlap;
    Pictures.push(c);
  }
  d.style.width = (x - overlap + w) + 'px';
  console.log(Pictures[0])
  console.log(Pictures[0].div)
  d.style.height = firstNumber(Pictures[0].div.style.height) + 'px';
}
function showDetailsAndMagnify(elem) {
  let key = elem.firstChild.getAttribute('key'); //console.log('key',key)
  if (nundef(key)) return;
  let o = getDetailedSuperdi(key);
  MAGNIFIER_IMAGE = elem;
  if (nundef(o)) { mMagnify(elem); return; }
  let d = mPopup(null, {}, { id: 'hallo' });
  let title = fromNormalized(valf(o.name, o.friendly));
  mDom(d, {}, { tag: 'h1', html: title });
  mDom(d, {}, { tag: 'img', src: valf(o.photo, o.img) });
  showDetailsPresentation(o, d);
}
function showDetailsPresentation(o, dParent) {
  let onew = {};
  let nogo = ['longSpecies', 'ooffsprings', 'name', 'cats', 'colls', 'friendly', 'ga', 'fa', 'fa6', 'text', 'key', 'nsize', 'nweight', 'img', 'photo']
  for (const k in o) {
    if (nogo.includes(k)) continue;
    let val = o[k];
    let knew = k == 'ofoodtype' ? 'foodtype' : k;
    if (isString(val)) {
      val = replaceAll(val, '>-', '');
      val = val.trim();
      if (val.startsWith("'")) val = val.substring(1);
      if (val.endsWith("'")) val = val.substring(0, val.length - 1);
      if (val.includes(':')) val = stringAfter(val, ':')
      onew[knew] = capitalize(val.trim());
    }
    if (k == 'food') console.log(onew[knew])
  }
  onew = sortDictionary(onew);
  return showObjectInTable(onew, dParent, { w: window.innerWidth * .8 });
}
async function showDirPics(dir, dParent) {
  let imgs = await mGetFiles(dir);
  for (const fname of imgs) {
    let src = `${dir}/${fname}`;
    let sz = 200;
    let styles = { 'object-position': 'center top', 'object-fit': 'cover', h: sz, w: sz, round: true, border: `${rColor()} 2px solid` }
    let img = mDom(dParent, styles, { tag: 'img', src });
  }
}
function showDiv(d) { mStyle(d, { bg: rColor() }); console.log(d, mGetStyle(d, 'w')); }
function showEventOpen(id) {
  let e = Items[id];
  if (!e) return;
  let date = new Date(Number(e.day));
  let [day, month, year] = [date.getDate(), date.getMonth(), date.getFullYear()];
  let time = e.time;
  let popup = openPopup();
  let d = mBy(id);
  let [x, y, w, h, wp, hp] = [d.offsetLeft, d.offsetTop, d.offsetWidth, d.offsetHeight, 300, 180];
  let [left, top] = [Math.max(10, x + w / 2 - wp / 2), Math.min(window.innerHeight - hp - 60, y + h / 2 - hp / 2)]
  mStyle(popup, { left: left, top: top, w: wp, h: hp });
  let dd = mDom(popup, { display: 'inline-block', fz: '80%', maleft: 3, pabottom: 4 }, { html: `date: ${day}.${month + 1}.${year}` });
  let dt = mDom(popup, { display: 'inline-block', fz: '80%', maleft: 20, pabottom: 4 }, { html: `time:` });
  let inpt = mDom(popup, { fz: '80%', maleft: 3, mabottom: 4, w: 60 }, { tag: 'input', value: e.time });
  mOnEnter(inpt);
  let ta = mDom(popup, { rounding: 4, matop: 7, box: true, w: '100%', vPadding: 4, hPadding: 10, }, { tag: 'textarea', rows: 7, value: e.text });
  let line = mDom(popup, { matop: 6, w: '100%' }); //,'align-items':'space-between'});
  let buttons = mDom(line, { display: 'inline-block' });
  let bsend = mButton('Save', () => onEventEdited(id, ta.value, inpt.value), buttons);
  mButton('Cancel', () => closePopup(), buttons, { hMargin: 10 })
  mButton('Delete', () => { deleteEvent(id); closePopup(); }, buttons, { fg: 'red' })
  mDom(line, { fz: '90%', maright: 5, float: 'right', }, { html: `by ${e.user}` });
}
function showFleetingMessage(msg, dParent, styles = {}, ms = 3000, msDelay = 0, fade = true) {
  clearFleetingMessage();
  dFleetingMessage = mDom(dParent);
  if (msDelay) {
    TOFleetingMessage = setTimeout(() => fleetingMessage(msg, dFleetingMessage, styles, ms, fade), msDelay);
  } else {
    TOFleetingMessage = setTimeout(() => fleetingMessage(msg, dFleetingMessage, styles, ms, fade), 10);
  }
}
async function showGameMenu(gamename) {
  let users = M.users = await loadStaticYaml('y/users.yaml'); //console.log('users',users); return;
  mRemoveIfExists('dGameMenu');
  let dMenu = mDom('dMain', {}, { className: 'section', id: 'dGameMenu' });
  sectionTitle('dGameMenu', 'game options');
  let style = { display: 'flex', justifyContent: 'center', w: '100%', gap: 10, matop: 6 };
  let dPlayers = mDom(dMenu, style, { id: 'dMenuPlayers' }); //mCenterFlex(dPlayers);
  let dOptions = mDom(dMenu, style, { id: 'dMenuOptions' }); //'dMenuOptions'); //mCenterFlex(dOptions);
  let dButtons = mDom(dMenu, style, { id: 'dMenuButtons' }); //'dMenuButtons');
  DA.gamename = gamename;
  DA.gameOptions = {};
  DA.playerList = [];
  DA.allPlayers = {};
  DA.lastName = null;
  await showGamePlayers(dPlayers, users);
  await showGameOptions(dOptions, gamename);
  let astart = mButton('Start', onclickGameStart, dButtons, {}, ['button', 'input']);
  let ajoin = mButton('Open to Join', onclickOpenToJoinGame, dButtons, {}, ['button', 'input']);
  let acancel = mButton('Cancel', () => mClear(dMenu), dButtons, {}, ['button', 'input']);
  let bclear = mButton('Clear Players', onclickClearPlayers, dButtons, {}, ['button', 'input']);
}
async function showGameMenuPlayerDialog(name, shift = false) {
  let allPlItem = DA.allPlayers[name];
  let gamename = DA.gamename;
  let da = iDiv(allPlItem);
  if (!DA.playerList.includes(name)) await setPlayerPlaying(allPlItem, gamename);
  else await setPlayerNotPlaying(allPlItem, gamename);
}
async function showGameOptions(dParent, gamename) {
  let poss = MGetGameOptions(gamename);
  if (nundef(poss)) return;
  for (const p in poss) {
    let key = p;
    let val = poss[p];
    if (isString(val)) {
      let list = val.split(',');
      let legend = formatLegend(key);
      let fs = mRadioGroup(dParent, { fg: 'black' }, `d_${key}`, legend);
      for (const v of list) { mRadio(v, isNumber(v) ? Number(v) : v, key, fs, { cursor: 'pointer' }, null, key, true); }
      measureFieldset(fs);
    }
  }
  let inpsolo = mBy(`i_gamemode_solo`);//console.log('HALLO',inpsolo)
  let inpmulti = mBy(`i_gamemode_multi`);
  let inphotseat = mBy(`i_gamemode_hotseat`);
  if (isdef(inpsolo)) inpsolo.onclick = setPlayersToSolo;
  if (isdef(inpmulti)) inpmulti.onclick = setPlayersToMulti;
  if (isdef(inphotseat)) inphotseat.onclick = setPlayersToMulti;
}
async function showGamePlayers(dParent, users) {
  let me = UGetName();
  mStyle(dParent, { flexWrap: 'wrap' });
  let userlist = ['amanda', 'felix', 'mimi'];
  for (const name in users) addIf(userlist, name);
  for (const name of userlist) {
    let d = showUser(dParent, name, onclickGameMenuPlayer);
    let item = userToPlayer(name, DA.gamename); item.div = d; item.isSelected = false;
    DA.allPlayers[name] = item;
  }
  await setPlayerPlaying(DA.allPlayers[me], DA.gamename);
}
function showGameover(t) {
  let winners = t.winners;
  let msg = winners.length > 1 ? `GAME OVER - The winners are ${winners.join(', ')}!!!` : `GAME OVER - The winner is ${winners[0]}!!!`;
  let dh = mBy('dHidden');
  mClear(dh);
  let dh1 = mDom(dh, { fz: 30, pav: 20, align: 'center', w100: true, bg: U.color }, { html: msg }); //mStyle(dex,{h:100,bg})
  let bg = U.color;
  dh1.style.background = `linear-gradient(45deg, ${bg},white, ${bg})`;
  mLinebreak(dh1);
  mDom(dh1, { bg: '#00000080', fg: 'white', matop: 10 }, { tag: 'button', html: 'play again!', onclick: () => onclickTableStart(t.id) });
}
function showGames(dParent) {
  sectionTitle(dParent, 'games');
  let gameMenu = createCardContainer(dParent, {}, 'game_menu');
  for (const gname of DA.gamelist) {
    let g = MGetGame(gname);
    g.name = gname;
    createGameCard(gameMenu, g);
  }
}
function showGamesAndTables() {
  let tables = dict2list(DA.tableDict);
  tables.sort((a, b) => a.modified < b.modified ? 1 : -1);
  let me = UGetName();
  let dTableList = mBy('dTableList') || mDom('dMain', {}, { className: 'section', id: 'dTableList' });
  mClear(dTableList);
  showTables(dTableList, tables, me);
  let dGameList = mBy('dGameList') || mDom('dMain', {}, { className: 'section', id: 'dGameList' });
  mClear(dGameList);
  showGames(dGameList);
  let dGameMenu = mBy('dGameMenu');
  if (isdef(dGameMenu)) {
    console.log('removing old game menu');
    mRemove(dGameMenu);
  }
}
function showGamesList(games) {
  console.log("Games list:", games);
  let dsel = mDom('dMain', {}, { tag: 'select' })
  const sel = document.getElementById("gameSelect");
  sel.innerHTML = "";
  console.log('games', games)
  games.forEach(g => {
    const opt = document.createElement("option");
    opt.value = g;
    opt.textContent = g;
    sel.appendChild(opt);
  });
  if (games.length > 0) {
    sel.value = arrLast(games);
  }
}
function showImage(key, dParent, styles = {}, useSymbol = false) {
  let o = M.superdi[key];
  if (nundef(o)) { console.log('showImage:key not found', key); return; }
  let [w, h] = [valf(styles.w, styles.sz), valf(styles.h, styles.sz)];
  if (nundef(w)) {
    mClear(dParent);
    [w, h] = [dParent.offsetWidth, dParent.offsetHeight];
  } else {
    addKeys({ w: w, h: h }, styles)
    dParent = mDom(dParent, styles);
  }
  let [sz, fz, fg] = [.9 * w, .8 * h, valf(styles.fg, rColor())];
  let hline = valf(styles.hline * fz, fz);
  let d1 = mDom(dParent, { position: 'relative', h: fz, overflow: 'hidden' });
  mCenterCenterFlex(d1)
  let el = null;
  if (!useSymbol && isdef(o.img)) el = mDom(d1, { w: '100%', h: '100%', 'object-fit': 'cover', 'object-position': 'center center' }, { tag: 'img', src: `${o.img}` });
  else if (isdef(o.text)) el = mDom(d1, { fz: fz, hline: hline, family: 'emoNoto', fg: fg, display: 'inline' }, { html: o.text });
  else if (isdef(o.fa6)) el = mDom(d1, { fz: fz - 2, hline: hline, family: 'fa6', bg: 'transparent', fg: fg, display: 'inline' }, { html: String.fromCharCode('0x' + o.fa6) });
  else if (isdef(o.fa)) el = mDom(d1, { fz: fz, hline: hline, family: 'pictoFa', bg: 'transparent', fg: fg, display: 'inline' }, { html: String.fromCharCode('0x' + o.fa) });
  else if (isdef(o.ga)) el = mDom(d1, { fz: fz, hline: hline, family: 'pictoGame', bg: valf(styles.bg, 'beige'), fg: fg, display: 'inline' }, { html: String.fromCharCode('0x' + o.ga) });
  else if (isdef(o.img)) el = mDom(d1, { w: '100%', h: '100%', 'object-fit': 'contain', 'object-position': 'center center' }, { tag: 'img', src: `${o.img}` });
  assertion(el, 'PROBLEM mit' + key);
  mStyle(el, { cursor: 'pointer' })
  return d1;
}
function showImagePartial(dParent, image, x, y, w, h, left, top, wShow, hShow, wCanvas, hCanvas) {
  mClear(dParent)
  let canvas = mDom(dParent, {}, { tag: 'canvas' }); //console.log('left', left, 'top', top)
  const ctx = canvas.getContext('2d');
  canvas.width = wCanvas;
  canvas.height = hCanvas;
  ctx.drawImage(image, x, y, w, h, left, top, wShow, hShow);
}
async function showKeys(keys, d) {
  let centered = { display: 'flex', alignItems: 'center', justifyContent: 'center', baseline: 'middle' };
  mClear(d);
  let [gap, w, h] = [10, 100, 100];
  let dGrid = mDom(d, { display: 'flex', fg: 'black', gap, padding: gap, wrap: true });
  let i = 0;
  let n = Math.floor(window.innerWidth / (w + gap)) * Math.floor(window.innerHeight / (h + gap)); console.log('n', n);
  for (const k of keys) {
    let d = mDom(dGrid, { bg: 'silver', padding: gap, cursor: 'pointer' }, { id: getUID(), onclick: onclickItem });
    let x = mKey(k, d, { w, h, fz: h, hline: h, box: true, fg: 'black', bg: 'white' }, { special: true });
    mDom(d, { w, fg: 'black', 'text-overflow': 'ellipsis', 'white-space': 'nowrap', overflow: 'hidden', fz: 16, align: 'center' }, { html: k, title: k });
    DA.items[d.id] = { div: d, key: k };
    if (0 === ++i % n) await mSleep(20);
  }
}
function showMeeple(d, pMeeple) {
  lacunaDrawPoints(d, [pMeeple], false);
  let color = getPlayerProp('color', pMeeple.owner); //console.log('color', color)
  let letter = pMeeple.owner[0].toUpperCase();
  mStyle(iDiv(pMeeple), { border: `${color} 5px solid` });
  iDiv(pMeeple).innerHTML = letter;
}
function showMessage(msg, ms = 3000, callback = null) {
  clearTimeout(TO.message);
  let d = mPopup('dMain', { left: 10, top: 10, transform: 'unset' }, { id: 'dMessage' });
  d.innerHTML = msg;
  if (ms > 0) TO.message = setTimeout(() => { clearMessage(true); if (callback) callback(); }, ms)
}
function showNavbar() {
  let nav = mMenu('dNav');
  let commands = {};
  commands.home = menuCommand(nav.l, 'nav', 'home', 'HOME', showDashboard, menuCloseHome);
  commands.settings = menuCommand(nav.l, 'nav', 'settings', null, showSettings, menuCloseSettings);
  commands.simple = menuCommand(nav.l, 'nav', 'simple', 'Collection', onclickSimple, menuCloseSimple);
  commands.play = menuCommand(nav.l, 'nav', 'play', 'Games', onclickPlay, menuCloseGames);
  commands.table = menuCommand(nav.l, 'nav', 'table', 'Table', onclickTableMenu, menuCloseTable);
  commands.plan = menuCommand(nav.l, 'nav', 'plan', 'Calendar', onclickPlan, menuCloseCalendar);
  nav.commands = commands;
  return nav;
}
function showObject(o, keys, dParent, styles = {}, opts = {}) {
  if (nundef(keys)) { keys = Object.keys(o); opts.showKeys = true; styles.align = 'left' }
  addKeys({ align: 'center', padding: 2, bg: 'dimgrey', fg: 'contrast' }, styles);
  let d = mDom(dParent, styles, opts);
  let onew = {};
  for (const k of keys) onew[k] = o[k];
  mNode(onew, d, opts.title);
  return d;
}
function showObjectInTable(onew, dParent, styles = {}, opts = {}) {
  let d = mDom(dParent, styles);
  let t = mTable(d);
  for (const k in onew) {
    let r = mCreate('tr');
    mAppend(t, r);
    let col = mCreate('td'); mAppend(r, col); col.innerHTML = `${k}: `;
    col = mCreate('td'); mAppend(r, col); mDom(col, {}, { html: `${onew[k]}` });
  }
  return t;
}
function showPairs(pairlist) {
  let s = '';
  for (const pair of pairlist) {
    s += `${pair[0].id},${pair[1].id} `; //pair[0].id+','+pair[1].id;
  }
  return s;
}
function showPalette(dParent, colors) {
  let d1 = mDom(dParent, { display: 'flex', dir: 'column', wrap: true, gap: 2, hmax: '100vh' });
  for (var c of colors) {
    if (isDict(c)) c = c.hex;
    let html = `${c}<br>hue:${w3color(c).hue}<br>sat:${Math.round(w3color(c).sat * 100)}<br>lum:${Math.round(w3color(c).lightness * 100)}`
    let dmini = mDom(d1, { wmin: 40, hmin: 40, padding: 2, bg: c, fg: colorIdealText(c) }, { html });
  }
}
async function showPaletteFor(dParent, src, color, blendMode) {
  let fill = color;
  let bgBlend = getBlendCanvas(blendMode);
  let d = mDom(dParent, { w100: true, gap: 4 }); mCenterFlex(d);
  let palette = [color];
  if (isdef(src)) {
    let ca = await getCanvasCtx(d, { w: 500, h: 300, fill, bgBlend }, { src });
    palette = await getPaletteFromCanvas(ca.cv);
    palette.unshift(fill);
  } else {
    let ca = mDom(d, { w: 500, h: 300 });
    palette = arrCycle(paletteShades(color), 4);
  }
  let dominant = palette[0];
  let palContrast = paletteContrastVariety(palette, palette.length);
  mLinebreak(d);
  showPaletteMini(d, palette);
  mLinebreak(d);
  showPaletteMini(d, palContrast);
  mLinebreak(d);
  return [palette.map(x => colorO(x)), palContrast];
}
function showPaletteMini(dParent, colors, sz = 30) {
  let d1 = mDom(dParent, { display: 'flex', wrap: true, gap: 2 }); //, hmax: '100vh', dir: 'column' });
  let items = [];
  for (var c of colors) {
    if (isDict(c)) c = c.hex;
    let fg = 'dimgray'; //colorIdealText(c); if (fg == 'white') fg='silver';
    let dc = mDom(d1, { w: sz, h: sz, bg: c, fg, border: `${fg} solid 3px` });
    items.push({ div: dc, bg: c })
  }
  return items;
}
function showPaletteNames(dParent, colors) {
  let d1 = mDom(dParent, { gap: 12 }); mFlexWrap(d1);
  let items = [];
  for (var c of colors) {
    let bg = c.hex;
    let d2 = mDom(d1, { wmin: 250, bg, fg: colorIdealText(bg), padding: 20 }, { class: 'colorbox', dataColor: bg });
    mDom(d2, { weight: 'bold', align: 'center' }, { html: c.name });
    let html = `<br>${bg}<br>hue:${c.hue}<br>sat:${Math.round(c.sat * 100)}<br>lum:${Math.round(c.lightness * 100)}`
    let dmini = mDom(d2, { align: 'center', wmin: 120, padding: 2, bg, fg: colorIdealText(bg) }, { html });
    let item = jsCopy(c);
    item.div = dmini;
    item.dOuter = d2;
    items.push(item)
  }
  return items;
}
function showPaletteText(dParent, list) {
  let d1 = mDom(dParent, { display: 'flex', wrap: true, gap: 2 }); //, hmax: '100vh', dir: 'column' });
  let items = [];
  for (var c of list) {
    let dc = mDom(d1, { bg: 'black', fg: 'white' }, { html: c });
    items.push({ div: dc, text: c })
  }
  return items;
}
function showPlaetze(dCard, item, gap, color = 'silver') {
  let n = item.ooffsprings.num;
  let sym = item.class == 'mammal' ? 'paw' : 'big_egg';
  let html = wsGetChildInline(item, color);
  let plaetze = nundef(n) ? 2 : n == 0 ? 0 : n == 1 ? 1 : n < 8 ? 2 : n < 25 ? 3 : n < 100 ? 4 : n < 1000 ? 5 : 6;
  let [rows, cols, w] = [3, plaetze <= 3 ? 1 : 2, plaetze <= 3 ? gap : 3 * gap]
  let dgrid = mGrid(3, cols, dCard, { gap: gap * .8 });//{w,h:5*gap,gap:gap/2});
  for (const i of range(plaetze)) { mDom(dgrid, { w: gap, h: gap, fg: color }, { html }); }
  return dgrid;
}
function showSvg(dParent, gCode) {
  dParent = toElem(dParent);
  mClear(dParent);
  let html = `
        <svg id="svg2" width="800" height="500" viewBox="-0.1 -0.1 1.2 1.2" xmlns="http://www.w3.org/2000/svg" stroke="orange"
            fill="gold" stroke-width="0.005">
            ${gCode}
        </svg>
        `;
  dParent.innerHTML = html;
}
function showTable() {
  if (!DA.tid) { showMessage('No table available!!!', 4000, () => switchToMenu('games')); return; }
  if (!TESTING) pollOn();
  console.log('old table', DA.oldTable);
  let t = DAGetTable();
  G = DA.funcs[t.game];
  G.prepareTable(t);
  G.stats(t);
  G.present(t);
  G.present(t);
  if (t.status == 'over') { showGameover(t); } else if (t.status == 'started') { G.activate(); }
}
function showTables(dParent, tables, me) {
  sectionTitle(dParent, 'tables');
  if (isEmpty(tables)) return mDom(dParent, { maleft: 12, fg: 'blue' }, { html: 'no active game tables' });
  let t = mDataTable(tables, dParent, null, ['friendly', 'game_friendly', 'playerNames'], 'tables', false);
  mTableCommandify(t.rowitems.filter(ri => ri.o.status != 'open'), {
    0: (item, val) => hFunc(val, 'onclickTable', item.o.id, item.id),
  });
  mTableStylify(t.rowitems.filter(ri => ri.o.status == 'open'), { 0: { fg: 'blue' } });
  for (const ri of t.rowitems) {
    let r = iDiv(ri), id = ri.o.id, status = ri.o.status, owner = ri.o.owner, playerNames = ri.o.playerNames;
    if (ri.o.prior == 1) mDom(r, {}, { tag: 'td', html: getWaitingHtml(24) });
    if (status == 'open') {
      if (playerNames.includes(me)) {
        if (owner != me) mAppend(r, mCreate('td')).innerHTML = hFunc('leave', 'onclickTableLeave', id);
      } else mAppend(r, mCreate('td')).innerHTML = hFunc('join', 'onclickTableJoin', id);
    }
    if (owner == me) {
      mAppend(r, mCreate('td')).innerHTML = hFunc('delete', 'onclickTableDelete', id);
      if (status == 'open') mAppend(r, mCreate('td')).innerHTML = hFunc('start', 'onclickTableStart', id);
    }
  }
}
async function showTessellation(ev) {
  let name = ev.target.innerHTML;
  const response = await fetch(`http://localhost:5000/tesvg?u=${2}&v=${2}&shape=${name}`);
  const res = await response.text();
  console.log(res)
  mClear('dMain')
  let d = mBy('dMain');
  let html = `
        <svg id="svg2" width="500" height="500" viewBox="0 0 1 1" xmlns="http://www.w3.org/2000/svg" stroke="black"
            fill="lightblue" stroke-width="0.005">
            ${res}
        </svg>
        `;
  d.innerHTML = html;
  const gElement = document.querySelector('g');
  precomputePolygonNeighbors(gElement);
  addPolygonNeighborClick(gElement);
}
function showText(dParent, text, bg = 'black') {
  return mDom(dParent, { align: 'center', wmin: 120, padding: 2, bg, fg: colorIdealText(bg) }, { html: text });
}
async function showTextColors() {
  let d = mBy('dSettingsMenu'); mClear(d);
  let d1 = mDom(d, { gap: 12, padding: 10 }); mFlexWrap(d1);
  let colors = ['white', 'silver', 'dimgray', 'black'].map(x => w3color(x)); //, getCSSVariable('--fgButton'), getCSSVariable('--fgButtonHover')].map(x => w3color(x));
  for (var c of colors) {
    let bg = 'transparent';
    let fg = c.hex = c.toHexString();
    let d2 = mDom(d1, { border: fg, wmin: 250, bg, fg, padding: 20 }, { class: 'colorbox', dataColor: fg });
    mDom(d2, { weight: 'bold', align: 'center' }, { html: 'Text Sample' });
    let html = `<br>${fg}<br>hue:${c.hue}<br>sat:${Math.round(c.sat * 100)}<br>lum:${Math.round(c.lightness * 100)}`
    let dmini = mDom(d2, { align: 'center', wmin: 120, padding: 2, bg, fg }, { html });
  }
  let divs = document.getElementsByClassName('colorbox');
  for (const div of divs) {
    div.onclick = async () => onclickTextColor(div.getAttribute('dataColor'));
  }
}
async function showTextures() {
  let d = mBy('dSettingsMenu'); mClear(d);
  let dTheme = mDom(d, { padding: 12, gap: 10 }); mFlexWrap(dTheme);
  let list = M.textures;
  if (colorGetLum(U.color) > 75) list = list.filter(x => !x.includes('ttrans'));
  let itemsTexture = [];
  for (const t of list) {
    let bgRepeat = t.includes('marble_') || t.includes('wall') ? 'no-repeat' : 'repeat';
    let bgSize = t.includes('marble_') || t.includes('wall') ? `cover` : t.includes('ttrans') ? '' : 'auto';
    let bgImage = `url('${t}')`;
    let recommendedMode = t.includes('ttrans') ? 'normal' : (t.includes('marble_') || t.includes('wall')) ? 'luminosity' : 'multiply';
    let dc = mDom(dTheme, { bg: U.color, bgImage, bgSize, bgRepeat, bgBlend: 'normal', cursor: 'pointer', border: 'white', w: '30%', wmax: 300, h: 170 });
    let item = { div: dc, path: t, bgImage, bgRepeat, bgSize, bgBlend: recommendedMode, isSelected: false };
    itemsTexture.push(item);
    dc.onclick = async () => onclickTexture(item, itemsTexture);
  }
  return itemsTexture;
}
function showTimeSince(t, msg = 'now') {
  let tNew = getNow();
  let ms = tNew - t;
  console.log('::time:', msg + ':', ms);
  return tNew;
}
function showTitle(title, dParent = 'dTitle') {
  mClear(dParent);
  return mDom(dParent, { maleft: 20 }, { tag: 'h1', html: title, classes: 'title' });
}
function showTitleGame(table, d) {
  if (nundef(d)) { d = mBy('dTitle'); }
  //console.log(d)
  mClear(d);
  let html = `${fromNormalized(MGetGame(table.game).friendly.toUpperCase())}: ${fromNormalized(table.friendly)}`;
  mDom(d, { margin: 10, family: 'algerian', fz: 20 }, { html });
}
function showTrick() {
  let dZone = Zones.table.dData;
  let d = mDom(dZone);
  mStyle(d, { display: 'flex', position: 'relative' });
  let zIndex = 1;
  for (let i = 0; i < T.trick.length; i++) {
    let c = T.trick[i];
    let direction = i == 0 ? { x: 0, y: -1 } : { x: 0, y: 1 };
    let displ = 10;
    let offset = { x: -35 + direction.x * displ, y: direction.y * displ };
    let d1 = c.div;
    mAppend(d, d1);
    mStyle(d1, { position: 'absolute', left: offset.x, top: offset.y, z: zIndex });
    zIndex += 1;
  }
}
function showUser(dParent, name, func) {
  let d = mDom(dParent, { align: 'center', padding: 2, cursor: 'pointer', border: `transparent` });
  let img = showUserImage(name, d, 40);
  let label = mDom(d, { matop: -4, fz: 12, fg: 'black', hline: 12 }, { html: name });
  d.setAttribute('username', name);
  if (isdef(func)) d.onclick = func;
  return d;
}
function showUserImage(uname, d, sz = 40) {
  let u = MGetUser(uname);
  let key = u.imgKey;
  let m = M.superdi[key];
  if (nundef(m)) {
    key = 'unknown_user';
  }
  let img = mDom(d, { h: sz, w: sz, round: true, border: `${u.color} 3px solid` }, { tag: 'img', src: m.img });
  return img;
}
function showValidMoves(table) {
  if (nundef(table.moves)) { console.log('no moves yet!'); return; }
  console.log('________', table.step)
  for (const m of table.moves) {
    console.log(`${m.step} ${m.name}: ${m.move.map(x => x.substring(0, 5)).join(',')} (${m.change})=>${m.score}`);
  }
}
function showYaml(o, title, dParent, styles = {}, opts = {}) {
}
function showim2(imgKey, d, styles = {}, opts = {}) {
  let o = lookup(M.superdi, [imgKey]);
  let src;
  if (isFilename(imgKey)) src = imgKey;
  else if (isdef(o) && isdef(opts.prefer)) src = valf(o[opts.prefer], o.img);
  else if (isdef(o)) src = valf(o.img, o.photo)
  let [w, h] = mSizeSuccession(styles, 40);
  addKeys({ w, h }, styles);
  if (nundef(o) && nundef(src)) src = rChoose(M.allImages).path;
  if (isdef(src)) return mDom(d, styles, { tag: 'img', src });
  fz = .8 * h;
  let [family, html] = isdef(o.text) ? ['emoNoto', o.text] : isdef(o.fa) ? ['pictoFa', String.fromCharCode('0x' + o.fa)] : isdef(o.ga) ? ['pictoGame', String.fromCharCode('0x' + o.ga)] : isdef(o.fa6) ? ['fa6', String.fromCharCode('0x' + o.fa6)] : ['algerian', o.friendly];
  addKeys({ family, fz, hline: fz, display: 'inline' }, styles);
  let el = mDom(d, styles, { html }); mCenterCenterFlex(el);
  return el;
  if (isdef(o.text)) el = mDom(d, { fz: fz, hline: fz, family: 'emoNoto', fg: rColor(), display: 'inline' }, { html: o.text });
  else if (isdef(o.fa)) el = mDom(d, { fz: fz, hline: fz, family: 'pictoFa', bg: 'transparent', fg: rColor(), display: 'inline' }, { html: String.fromCharCode('0x' + o.fa) });
  else if (isdef(o.ga)) el = mDom(d, { fz: fz, hline: fz, family: 'pictoGame', bg: 'beige', fg: rColor(), display: 'inline' }, { html: String.fromCharCode('0x' + o.ga) });
  else if (isdef(o.fa6)) el = mDom(d, { fz: fz, hline: fz, family: 'fa6', bg: 'transparent', fg: rColor(), display: 'inline' }, { html: String.fromCharCode('0x' + o.fa6) });
  return el;
}
function shuffle(arr) { if (isEmpty(arr)) return []; else return fisherYates(arr); }
function simpleCheckCommands() {
  if (nundef(UI.selectedImages)) UI.selectedImages = [];
  let n = UI.selectedImages.length;
  for (const k in UI.commands) {
    let cmd = UI.commands[k];
    if (nundef(cmd) || nundef(iDiv(cmd)) || nundef(mBy(k))) continue;
    if (nundef(cmd.fSel) || cmd.fSel(n)) cmdEnable(k); else cmdDisable(k);
  }
}
function simpleClearSelections() {
  mClearAllSelections();
  simpleCheckCommands();
}
async function simpleFinishEditing(canvas, dPopup, inpFriendly, inpCats, sisi) {
  const dataUrl = canvas.toDataURL('image/png'); //davon jetzt die dataUrl!
  if (isEmpty(inpFriendly.value)) inpFriendly.value = 'pic'
  let friendly = inpFriendly.value;
  let [name, imgname] = findUniqueSuperdiKey(friendly);
  console.log('key name will be', name, imgname);
  let key = name, filename = name + '.png';
  let o = { image: dataUrl, coll: sisi.name, filename };
  let resp = await mPostRoute('postImage', o); //console.log('resp', resp); //sollte path enthalten!
  filename = resp.filename;
  let imgPath = `../assets/img/${sisi.name}/${filename}`;
  let cats = extractWords(valf(inpCats.value, ''));
  let item = isdef(M.superdi[key]) ? jsCopy(M.superdi[key]) : { key, friendly, cats, colls: [] };
  item[valf(imgname, 'img')] = imgPath;
  dPopup.remove();
  await simpleOnDroppedItem(item, key, sisi);
}
function simpleInit(name, sisi) {
  if (nundef(name) && isdef(UI.simple)) { sisi = UI.simple; name = sisi.name; }
  let isReload = isdef(sisi.index) && sisi.name == name;
  if (!isReload) { sisi.index = 0; sisi.pageIndex = 1; sisi.name = name; sisi.filter = null; }
  let list = [];
  if (name == 'all' || isEmpty(name)) { list = Object.keys(M.superdi); }
  else if (isdef(M.byCollection[name])) { list = M.byCollection[name]; }
  else list = [];
  localStorage.setItem('sisi', name)
  let dMenu = sisi.dMenu;
  mClear(dMenu);
  let d = mDom(dMenu); mFlexV(d);
  mDom(d, { fz: 24, weight: 'bold' }, { html: 'Collection:' });
  let collNames = M.collections;
  let dlColl = mDatalist(d, collNames, { placeholder: "<select from list>" });
  dlColl.inpElem.oninput = ev => { console.log(sisi.name, ev.target.value); simpleInit(ev.target.value, sisi); }
  dlColl.inpElem.value = name;
  list = sortByFunc(list, x => M.superdi[x].friendly);
  sisi.masterKeys = list;
  sisi.keys = sisi.filter ? collFilterImages(sisi, sisi.filter) : list;
  let cats = collectCats(sisi.keys);
  cats.sort();
  d = mDom(dMenu); mFlexV(d);
  let wLabel = sisi.cols < 6 ? 117 : 'auto';
  mDom(d, { fz: 24, weight: 'bold', w: wLabel, align: 'right' }, { edit: true, html: 'Filter:' });
  let dlCat = mDatalist(d, cats, { edit: false, placeholder: "<enter value>", value: sisi.filter });
  dlCat.inpElem.oninput = ev => {
    let coll = UI.simple;
    let s = ev.target.value.toLowerCase().trim();
    let list = collFilterImages(coll, s);
    coll.keys = list;
    coll.filter = s;
    coll.index = 0; coll.pageIndex = 1; simpleClearSelections();
    simpleShowImageBatch(coll, 0, false);
  };
  d = mDom(dMenu, { gap: 10, align: 'right' });
  mButton('prev', () => simpleShowImageBatch(sisi, -1), d, { w: 70, margin: 0, maleft: 10 }, 'input', 'bPrev');
  mButton('next', () => simpleShowImageBatch(sisi, 1), d, { w: 70, margin: 0, maleft: 10 }, 'input', 'bNext');
  simpleClearSelections();
  simpleShowImageBatch(sisi);
}
function simpleLocked(collname) {
  if (nundef(collname)) collname = lookup(UI, ['simple', 'name']);
  if (!collname) return true;
  return getUname() != '_unsafe' && ['all', 'emo', 'fa6', 'icon', 'nations', 'users'].includes(collname);
}
async function simpleOnDropImage(ev, elem) {
  let dt = ev.dataTransfer;
  if (dt.types.includes('itemkey')) {
    let data = ev.dataTransfer.getData('itemkey');
    await simpleOnDroppedItem(data);
  } else {
    const files = ev.dataTransfer.files;
    if (files.length > 0) {
      const reader = new FileReader();
      reader.onload = async (evReader) => {
        let data = evReader.target.result;
        await simpleOnDroppedUrl(data, UI.simple);
      };
      reader.readAsDataURL(files[0]);
    }
  }
}
async function simpleOnDroppedItem(itemOrKey, key, sisi) {
  if (nundef(sisi)) sisi = UI.simple;
  let item;
  if (isString(itemOrKey)) { key = itemOrKey; item = M.superdi[key]; } else { item = itemOrKey; }
  assertion(isdef(key), 'NO KEY!!!!!');
  lookupAddIfToList(item, ['colls'], sisi.name);
  let o = M.superdi[key];
  if (isdef(o)) {
    console.log(`HA! ${key} already there`);
    let changed = false;
    for (const k in item) {
      let val = item[k];
      if (isLiteral(val) && o[k] != item[k]) { changed = true; break; }
      else if (isList(val) && !sameList(val, o[k])) { changed = true; break; }
    }
    if (!changed) return;
  }
  console.log(`........But changed!!!`);
  let di = {}; di[key] = item;
  await updateSuperdi(di);
  simpleInit(sisi.name, sisi)
}
async function simpleOnDroppedUrl(src, sisi) {
  let sz = 400;
  let dPopup = mDom(document.body, { position: 'fixed', top: 40, left: 0, wmin: sz, hmin: sz, bg: 'pink' });
  let dParent = mDom(dPopup);
  let d = mDom(dParent, { w: sz, h: sz, border: 'dimgray', margin: 10 });
  let canvas = createPanZoomCanvas(d, src, sz, sz);
  let instr = mDom(dPopup, { align: 'center', mabot: 10 }, { html: `- panzoom image to your liking -` })
  let dinp = mDom(dPopup, { padding: 10, align: 'right', display: 'inline-block' })
  mDom(dinp, { display: 'inline-block' }, { html: 'Name: ' });
  let inpFriendly = mDom(dinp, { outline: 'none', w: 200 }, { className: 'input', name: 'friendly', tag: 'input', type: 'text', placeholder: `<enter name>` });
  let defaultName = '';
  let iDefault = 1;
  let k = sisi.masterKeys.find(x => x == `${sisi.name}${iDefault}`);
  while (isdef(k)) { iDefault++; k = sisi.masterKeys.find(x => x == `${sisi.name}${iDefault}`); }
  defaultName = `${sisi.name}${iDefault}`;
  inpFriendly.value = defaultName;
  mDom(dinp, { h: 1 });
  mDom(dinp, { display: 'inline-block' }, { html: 'Categories: ' })
  let inpCats = mDom(dinp, { outline: 'none', w: 200 }, { className: 'input', name: 'cats', tag: 'input', type: 'text', placeholder: `<enter categories>` });
  let db2 = mDom(dPopup, { padding: 10, display: 'flex', gap: 10, 'justify-content': 'end' });
  mButton('Cancel', () => dPopup.remove(), db2, { w: 70 }, 'input');
  mButton('Save', () => simpleFinishEditing(canvas, dPopup, inpFriendly, inpCats, sisi), db2, { w: 70 }, 'input');
}
async function simpleOnclickItem(ev) {
  let id = evToId(ev);
  let item = UI.simple.items[id]; if (nundef(item)) return;
  let selkey = item.key;
  toggleSelectionOfPicture(iDiv(item), selkey, UI.selectedImages);
  simpleCheckCommands();
}
async function simpleOnclickLabel(ev) {
  evNoBubble(ev);
  let id = evToId(ev); console.log('id', id)
  let o = lookup(UI.simple, ['items', id]);
  if (!o) return;
  console.log('clicked label of', o);
  let [key, elem, collname] = [o.key, o.name, iDiv(o)];
  let newfriendly = await mGather(ev.target);
  if (!newfriendly) return;
  if (isEmpty(newfriendly)) {
    showMessage(`ERROR: name invalid: ${newfriendly}`);
    return;
  }
  console.log('rename friendly to', newfriendly)
  let item = M.superdi[key];
  item.friendly = newfriendly;
  let di = {};
  di[key] = item;
  let res = await mPostRoute('postUpdateSuperdi', { di });
  console.log('postUpdateSuperdi', res)
  await loadAssets();
  ev.target.innerHTML = newfriendly;
}
async function simpleSetAvatar(key) {
  U.imgKey = key;
  let res = await postUserChange(U);
}
function simpleShowImageBatch(sisi, inc = 0, alertEmpty = false) {
  let [keys, index, numCells] = [sisi.keys, sisi.index, sisi.rows * sisi.cols];
  if (isEmpty(keys) && alertEmpty) showMessage('nothing has been added to this collection yet!');
  if (keys.length <= numCells) inc = 0;
  let newPageIndex = sisi.pageIndex + inc;
  let numItems = keys.length;
  let maxPage = Math.max(1, Math.ceil(numItems / numCells));
  if (newPageIndex > maxPage) newPageIndex = 1;
  if (newPageIndex < 1) newPageIndex = maxPage;
  index = numCells * (newPageIndex - 1);
  let list = arrTakeFromTo(keys, index, index + numCells);
  sisi.index = index; sisi.pageIndex = newPageIndex;
  sisi.items = {};
  let name = sisi.name;
  for (let i = 0; i < list.length; i++) {
    let key = list[i];
    let d = sisi.cells[i];
    mStyle(d, { opacity: 1 });
    mClass(d, 'magnifiable')
    let id = getUID();
    let d1 = simpleShowImageInBatch(key, d, {}, { prefer: sisi.name == 'emo' ? 'img' : 'photo' });
    d1.id = id;
    let item = { div: d1, key, name, id, index: i, page: newPageIndex };
    sisi.items[id] = item;
    if (isList(UI.selectedImages) && UI.selectedImages.includes(key)) mSelect(d1);
  }
  for (let i = list.length; i < numCells; i++) {
    mStyle(sisi.cells[i], { opacity: 0 })
  }
  sisi.dPageIndex.innerHTML = `page ${sisi.pageIndex}/${maxPage}`;
  let [dNext, dPrev] = [mBy('bNext'), mBy('bPrev')];
  if (maxPage == 1) { mClass(dPrev, 'disabled'); mClass(dNext, 'disabled'); }
  else { mClassRemove(dPrev, 'disabled'); mClassRemove(dNext, 'disabled'); }
}
function simpleShowImageInBatch(key, dParent, styles = {}, opts = {}) {
  let o = M.superdi[key]; o.key = key;
  addKeys({ bg: rColor() }, styles);
  mClear(dParent);
  [w, h] = [dParent.offsetWidth, dParent.offsetHeight];
  let [sz, fz] = [.9 * w, .8 * h];
  let d1 = mDiv(dParent, { position: 'relative', w: '100%', h: '100%', padding: 11, box: true });//overflow: 'hidden', 
  mCenterCenterFlex(d1)
  let el = null;
  let src = (opts.prefer == 'photo' && isdef(o.photo)) ? o.photo : valf(o.img, null);
  if (isdef(src)) {
    if (o.cats.includes('card')) {
      el = mDom(d1, { h: '100%', 'object-fit': 'cover', 'object-position': 'center center' }, { tag: 'img', src });
      mDom(d1, { h: 1, w: '100%' })
    } else {
      el = mDom(d1, { w: '100%', h: '100%', 'object-fit': 'cover', 'object-position': 'center center' }, { tag: 'img', src });
    }
  }
  else if (isdef(o.text)) el = mDom(d1, { fz: fz, hline: fz, family: 'emoNoto', fg: rColor(), display: 'inline' }, { html: o.text });
  else if (isdef(o.fa)) el = mDom(d1, { fz: fz, hline: fz, family: 'pictoFa', bg: 'transparent', fg: rColor(), display: 'inline' }, { html: String.fromCharCode('0x' + o.fa) });
  else if (isdef(o.ga)) el = mDom(d1, { fz: fz, hline: fz, family: 'pictoGame', bg: 'beige', fg: rColor(), display: 'inline' }, { html: String.fromCharCode('0x' + o.ga) });
  else if (isdef(o.fa6)) el = mDom(d1, { fz: fz, hline: fz, family: 'fa6', bg: 'transparent', fg: rColor(), display: 'inline' }, { html: String.fromCharCode('0x' + o.fa6) });
  assertion(el, 'PROBLEM mit' + key);
  let label = mDom(d1, { fz: 11, cursor: 'pointer' }, { html: o.friendly, className: 'ellipsis hoverHue' });
  label.onclick = simpleOnclickLabel;
  mStyle(d1, { cursor: 'pointer' });
  d1.onclick = simpleOnclickItem;
  d1.setAttribute('key', key);
  d1.setAttribute('draggable', true)
  d1.ondragstart = ev => { ev.dataTransfer.setData('itemkey', key); }
  return d1;
}
function simpleSidebar(wmin) {
  mStyle('dLeft', { wmin });
  let d = mDom('dLeft', { wmin: wmin - 10, matop: 20, h: window.innerHeight - getRect('dLeft').y - 102 }); //, bg:'#00000020'  }); 
  let gap = 5;
  let stylesTitles = { matop: 10, bg: '#ffffff80', fg: 'black' };
  let cmds = {};
  cmds.simpleNew = mCommand(d, 'simpleNew', 'New'); mNewline(d, gap);
  mDom(d, stylesTitles, { html: 'Selection:' })
  cmds.simpleSelectAll = mCommand(d, 'simpleSelectAll', 'Select All'); mNewline(d, gap);
  cmds.simpleSelectPage = mCommand(d, 'simpleSelectPage', 'Select Page'); mNewline(d, gap);
  cmds.simpleClearSelections = mCommand(d, 'simpleClearSelections', 'Clear Selection', { fSel: x => x >= 1 }); mNewline(d, gap);
  mDom(d, stylesTitles, { html: 'Item:' })
  cmds.setAvatar = mCommand(d, 'setAvatar', 'Set Avatar', { fSel: x => x == 1 }); mNewline(d, gap);
  cmds.editDetails = mCommand(d, 'editDetails', 'Edit Details', { fSel: x => x == 1 }); mNewline(d, gap);
  mDom(d, stylesTitles, { html: 'Items:' })
  cmds.addSelected = mCommand(d, 'addSelected', 'Add To', { fSel: x => (x >= 1) }); mNewline(d, gap);
  cmds.simpleRemove = mCommand(d, 'simpleRemove', 'Remove', { fSel: x => (!simpleLocked() && x >= 1) }); mNewline(d, gap);
  UI.commands = cmds;
  simpleCheckCommands();
}
async function simpleUpload(route, o) {
  let server = getServerurl();
  server += `/${route}`;
  const response = await fetch(server, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    mode: 'cors',
    body: JSON.stringify(o)
  });
  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    return 'ERROR 1';
  }
}
function simulateClick(elem) {
  var evt = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
  var canceled = !elem.dispatchEvent(evt);
}
function size2hex(w = 100, h = 0, x = 0, y = 0) {
  let hexPoints = [{ X: 0.5, Y: 0 }, { X: 1, Y: 0.25 }, { X: 1, Y: 0.75 }, { X: 0.5, Y: 1 }, { X: 0, Y: 0.75 }, { X: 0, Y: 0.25 }];
  if (h == 0) {
    h = (2 * w) / 1.73;
  }
  return polyPointsFrom(w, h, x, y, hexPoints);
}
function sleep() { return new Promise(r => setTimeout(r, m)) }
function sockInit() {
  let server = getServerurl();
  Socket = io(server);
  Socket.on('config', onsockConfig);
  Socket.on('disconnect', x => console.log('::SOCK disconnect:', x));
  Socket.on('event', onsockEvent);
  Socket.on('message', showChatMessage);
  Socket.on('merged', onsockMerged);
  Socket.on('pending', onsockPending);
  Socket.on('table', onsockTable);
  Socket.on('tables', onsockTables);
  Socket.on('superdi', onsockSuperdi);
}
function sockPostUserChange(oldname, newname) {
  Socket.emit('userChange', { oldname, newname });
}
function someOtherPlayerName(table) {
  return rChoose(arrWithout(table.playerNames, getUname()));
}
function sortBy(arr, key) {
  function fsort(a, b) {
    let [av, bv] = [a[key], b[key]];
    if (isNumber(av) && isNumber(bv)) return Number(av) < Number(bv) ? -1 : 1;
    if (isEmpty(av)) return -1;
    if (isEmpty(bv)) return 1;
    return av < bv ? -1 : 1;
  }
  arr.sort(fsort);
  return arr;
}
function sortByDescending(arr, key) {
  function fsort(a, b) {
    let [av, bv] = [a[key], b[key]];
    if (isNumber(av) && isNumber(bv)) return Number(av) > Number(bv) ? -1 : 1;
    if (isEmpty(av)) return 1;
    if (isEmpty(bv)) return -1;
    return av > bv ? -1 : 1;
  }
  arr.sort(fsort);
  return arr;
}
function sortByEmptyLast(arr, key) {
  function fsort(a, b) {
    let [av, bv] = [a[key], b[key]];
    if (isNumber(av) && isNumber(bv)) return Number(av) < Number(bv) ? -1 : 1;
    if (isEmpty(av)) return 1;
    if (isEmpty(bv)) return -1;
    return av < bv ? -1 : 1;
  }
  arr.sort(fsort);
  return arr;
}
function sortByFunc(arr, func) { arr.sort((a, b) => (func(a) < func(b) ? -1 : 1)); return arr; }
function sortByHues(list) {
  let buckets = { red: [], orange: [], yellow: [], green: [], cyan: [], blue: [], purple: [], magenta: [], pink: [], grey: [] };
  for (const c of list) {
    let hue = c.hue;
    if (hue >= 355 || hue <= 10) buckets.red.push(c);
    if (hue >= 11 && hue <= 45) buckets.orange.push(c);
    if (hue >= 46 && hue <= 62 && c.lightness * 100 >= 45) buckets.yellow.push(c);
    if (hue >= 63 && hue <= 164) buckets.green.push(c);
    if (hue >= 165 && hue <= 199) buckets.cyan.push(c);
    if (hue >= 200 && hue <= 245) buckets.blue.push(c);
    if (hue >= 246 && hue <= 277) buckets.purple.push(c);
    if (hue >= 278 && hue <= 305) buckets.magenta.push(c);
    if (hue >= 306 && hue <= 355) buckets.pink.push(c);
  }
  for (const b in buckets) {
    sortByMultipleProperties(buckets[b], 'lightness', 'hue');
  }
  return buckets;
}
function sortByMultipleProperties(list) {
  let props = Array.from(arguments).slice(1);
  return list.sort((a, b) => {
    for (const p of props) {
      if (a[p] < b[p]) return -1;
      if (a[p] > b[p]) return 1;
    }
    return 0;
  });
}
function sortCaseInsensitive(list) {
  list.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  return list;
}
function sortCheckboxes(grid) {
  let divs = arrChildren(grid);
  divs.map(x => x.remove());
  let chyes = divs.filter(x => x.firstChild.checked == true);
  let chno = divs.filter(x => !chyes.includes(x));
  chyes = sortByFunc(chyes, x => x.firstChild.name);
  chno = sortByFunc(chno, x => x.firstChild.name);
  for (const d of chyes) { mAppend(grid, d) }
  for (const d of chno) { mAppend(grid, d) }
}
function sortDatesDescending(dates) {
  return dates.sort((a, b) => new Date(b) - new Date(a));
}
function sortDicolor(di) {
  if (nundef(di)) di = jsCopy(M.dicolor);
  let dinew = {};
  let kbucket = Object.keys(di);
  kbucket.sort();
  for (const k of kbucket) {
    let o = di[k];
    let di_bucket_new = {};
    let kc = Object.keys(o);
    kc.sort(); console.log(kc);
    for (const k1 of kc) {
      di_bucket_new[k1] = o[k1];
    }
    dinew[k] = di_bucket_new;
  }
  downloadAsYaml(dinew, 'dicolor')
}
function sortDictionary(di) {
  let keys = Object.keys(di);
  keys.sort();
  let newdi = {};
  for (const k of keys) {
    newdi[k] = di[k];
  }
  return newdi;
}
function splitAtAnyOf(s, sep) {
  let arr = [], w = '';
  for (let i = 0; i < s.length; i++) {
    let ch = s[i];
    if (sep.includes(ch)) {
      if (!isEmpty(w)) arr.push(w);
      w = '';
    } else {
      w += ch;
    }
  }
  if (!isEmpty(w)) arr.push(w);
  return arr;
}
function splitAtWhiteSpace(s) {
  return s.split(/\s+/).filter(x => x.trim() !== "");
}
function squareTo(tool, sznew = 128) {
  let [img, dParent, cropBox, setRect] = [tool.img, tool.dParent, tool.cropBox, tool.setRect];
  let [x, y, w, h] = ['left', 'top', 'width', 'height'].map(x => parseInt(cropBox.style[x]));
  if (sznew == 0) sznew = h;
  let sz = Math.max(w, h)
  let [x1, y1] = [x - (sz - w) / 2, y - (sz - h) / 2];
  redrawImage(img, dParent, x1, y1, sz, sz, sznew, sznew, () => tool.setRect(0, 0, sznew, sznew))
}
function startLevel() {
  Speech.setLanguage(Settings.language);
  getGameValues(Username, G.id, G.level);
  G.instance.startLevel();
  if (G.keys.length < G.numPics) { updateKeySettings(G.numPics + 5); }
  startRound();
}
function startPanning(ev) {
  console.log('_________startPanning!')
  const panData = {};
  function panStart(ev) {
    evNoBubble(ev);
    assertion(nundef(panData.panning), panData)
    let dc = panData.dCrop = ev.target;
    panData.cropStartSize = { w: mGetStyle(dc, 'w'), h: mGetStyle(dc, 'h') }
    panData.cropStartPos = { l: mGetStyle(dc, 'left'), t: mGetStyle(dc, 'top') }
    panData.elParent = panData.dCrop.parentNode;
    panData.img = panData.elParent.querySelector('img, canvas');//console.log('img',panData.img);
    panData.panning = true;
    panData.counter = -1;
    panData.mouseStart = getMouseCoordinatesRelativeToElement(ev, panData.elParent);
    panData.posStart = { x: mGetStyle(dc, 'left'), y: mGetStyle(dc, 'top') };
    addEventListener('mouseup', panEnd);
    panData.elParent.addEventListener('mousemove', panMove);
    console.log('panStart!', panData.mouseStart);
  }
  function panMove(ev) {
    evNoBubble(ev);
    if (!panData.panning || ++panData.counter % 3) return;
    panData.mouse = getMouseCoordinatesRelativeToElement(ev, panData.elParent);
    let [x, y] = [panData.posStart.x, panData.posStart.y];
    let [dx, dy] = [panData.mouse.x - panData.mouseStart.x, panData.mouse.y - panData.mouseStart.y];
    [dx, dy] = [Math.round(dx / 10) * 10, Math.round(dy / 10) * 10];
    adjustComplex(panData)
  }
  function panEnd(ev) {
    assertion(panData.panning == true);
    let d = evToClass(ev, 'imgWrapper');
    if (d == panData.elParent) {
      evNoBubble(ev);
      panData.mouse = getMouseCoordinatesRelativeToElement(ev, panData.elParent);
      console.log('SUCCESS!', panData.mouse)
    }
    removeEventListener('mouseup', panEnd);
    panData.elParent.removeEventListener('mousemove', panMove);
    panData.panning = false;
    console.log('* THE END *', panData)
  }
  panStart(ev);
}
function startPulsing(idlist) {
  idlist.map(x => B.diPoints[x].div.classList.add('pulseFastInfinite'));
}
function startRound() {
  if (G.addonActive != true && isTimeForAddon()) {
    G.addonActive = true;
    exitToAddon(startRound); return;
  } else G.addonActive = false;
  resetRound();
  uiActivated = false;
  G.instance.startRound();
  TOMain = setTimeout(() => prompt(), 300);
}
function startSelectedGame() {
  const game = document.getElementById("gameSelect").value;
  startGame(game, ["Alice", "Bob"]);
}
function startsWith(s, sSub) {
  return s.substring(0, sSub.length) == sSub;
}
function staticArea(areaName, oSpec) {
  func = correctFuncName(oSpec.type);
  oSpec.ui = window[func](areaName, oSpec);
}
function staticTitle(table) {
  clearInterval(TO.titleInterval);
  let url = window.location.href;
  let loc = url.includes('moxito') ? '' : '(local)';
  let game = isdef(table) ? lastWord(table.friendly) : '♠ Moxito ♠';
  document.title = `${loc} ${game}`;
}
function stdRowsColsContainer(dParent, cols, styles = {}) {
  addKeys({
    margin: 'auto',
    padding: 10,
    gap: 10,
    display: 'grid',
    bg: 'green',
    'grid-template-columns': `repeat(${cols}, 1fr)`
  }, styles);
  return mDiv(dParent, styles);
}
function stickyHeaderCode() {
  const header = document.querySelector('.sticky_header');
  const contentArea = document.querySelector('.content_area');
  const setContentAreaHeight = () => {
    const headerHeight = header.offsetHeight;
    contentArea.style.height = `calc(100vh - ${headerHeight}px)`;
  };
  setContentAreaHeight();
  window.addEventListener('resize', setContentAreaHeight);
}
function stopAutobot() {
  if (isdef(TO.SLEEPTIMEOUT)) clearTimeout(TO.SLEEPTIMEOUT);
  DA.stopAutobot = true;
}
function stopPulsing(idExcept = []) {
  let drem = document.querySelectorAll('.pulseFastInfinite');
  for (const d of drem) {
    if (idExcept.includes(d.id)) continue;
    d.classList.remove('pulseFastInfinite');
  }
}
function strRemoveTrailing(s, sub) {
  return s.endsWith(sub) ? stringBeforeLast(s, sub) : s;
}
function strSameCaseInsensitive(s1, s2) { return s1.toLowerCase() == s2.toLowerCase(); }
function stringAfter(sFull, sSub) {
  let idx = sFull.indexOf(sSub);
  if (idx < 0) return '';
  return sFull.substring(idx + sSub.length);
}
function stringAfterLast(sFull, sSub) {
  let parts = sFull.split(sSub);
  return arrLast(parts);
}
function stringBefore(sFull, sSub) {
  let idx = sFull.indexOf(sSub);
  if (idx < 0) return sFull;
  return sFull.substring(0, idx);
}
function stringBeforeLast(sFull, sSub) {
  let parts = sFull.split(sSub);
  return sFull.substring(0, sFull.length - arrLast(parts).length - 1);
}
function stringBetween(sFull, sStart, sEnd) {
  return stringBefore(stringAfter(sFull, sStart), isdef(sEnd) ? sEnd : sStart);
}
function stringBetweenLast(sFull, sStart, sEnd) {
  let s1 = stringBeforeLast(sFull, isdef(sEnd) ? sEnd : sStart);
  return stringAfterLast(s1, sStart);
}
function stringCSSToCamelCase(s) {
  let parts = s.split('-');
  let res = parts[0];
  for (let i = 1; i < parts.length; i++) { res += capitalize(parts[i]) }
  return res;
}
function stringCount(s, sSub, caseInsensitive = true) {
  let n = 0;
  for (let i = 0; i < s.length; i++) {
    if (s.slice(i).startsWith(sSub)) n++;
  }
  return n;
  let m = new RegExp(sSub, 'g' + (caseInsensitive ? 'i' : ''));
  let s1 = s.match(m);
  return s1 ? s1.length : 0;
}
function stringSplit(input) {
  return input.split(/[\s,]+/);
}
function styleBgFg(elem, bg, fg) {
  let st = mGetStyles(elem, ['bg', 'fg']);
  console.log('styles', st);
}
function styler(elem, k, v) {
  let key = STYLE_PARAMS_2[k];
  let val = isNumber(v) ? '' + Number(v) + 'px' : v;
  if (isdef(key)) { elem.style.setProperty(key, val); return true; }
  let STYLER = {
    bg: 'background-color',
    fg: 'color',
    gridCols: 'grid-template-columns',
    gridRows: 'grid-template-rows',
  }
}
function superTrim(s) {
  s = s.replace(/[\t\n]/g, ' ').trim();
  s = s.replace(/\s\s+/g, ' ');
  if (s.endsWith(';')) {
    s = s.slice(0, -1);
  }
}
async function switchToOtherUser() {
  let uname = await mGetRoute('otherUser', arguments);
  await switchToUser(uname);
}
async function switchToTables() { return await switchToMainMenu('play'); }
function sysBusy() { DA.prevSysState = DA.sysState; DA.sysState = 'idle'; }
function sysIdle() { DA.prevSysState = DA.sysState; DA.sysState = 'busy'; }
function sysInit() {
  DA.evList = [];
  DA.pollms = { lobby: 3000, table: { myMove: 1000, otherMove: 2000 } };
  DA.pollCounter = 0;
}
function sysPolling() { DA.prevSysState = DA.sysState; DA.sysState = 'polling'; }
function tableCreate(gamename, players, options, status) {
  if (nundef(gamename)) gamename = "setgame";
  if (nundef(players)) players = { mimi: userToPlayer('mimi', gamename), felix: userToPlayer('felix', gamename), amanda: userToPlayer('amanda', gamename) };
  if (nundef(options)) options = MGetGameOptions(gamename);
  let me = UGetName();
  let playerNames = [me];
  assertion(me in players, "_createOpenTable without owner!!!!!")
  for (const name in players) { addIf(playerNames, name); }
  let table = {
    status,
    id: generateTableId(gamename, me),
    fen: null,
    game: gamename,
    game_friendly: capitalize(MGetGameFriendly(gamename)),
    owner: playerNames[0],
    friendly: generateTableName(playerNames.length, []),
    players,
    playerNames: playerNames,
    options
  };
  return table;
}
function tableGameover() { DA.prevTableState = DA.tableState; DA.tableState = 'gameOver'; }
async function tableHasChanged() {
}
function tableLayoutMR(dParent, m = 7, r = 1) {
  let ui = UI; ui.players = {};
  clearElement(dParent);
  let bg = 'transparent';
  let [dMiddle, dRechts] = [ui.dMiddle, ui.dRechts] = mColFlex(dParent, [m, r], [bg, bg]);
  mCenterFlex(dMiddle, false);
  let dOben = ui.dOben = mDiv(dMiddle, { w: '100%', display: 'block' }, 'dOben');
  let dSelections = ui.dSelections = mDiv(dOben, {}, 'dSelections');
  for (let i = 0; i <= 5; i++) { ui[`dSelections${i}`] = mDiv(dSelections, {}, `dSelections${i}`); }
  let dActions = ui.dActions = mDiv(dOben, { w: '100%' });
  for (let i = 0; i <= 5; i++) { ui[`dActions${i}`] = mDiv(dActions, { w: '100%' }, `dActions${i}`); }
  ui.dError = mDiv(dOben, { w: '100%', bg: 'red', fg: 'yellow', hpadding: 12, box: true }, 'dError');
  let dSubmitOrRestart = ui.dSubmitOrRestart = mDiv(dOben, { w: '100%' });
  let dOpenTable = ui.dOpenTable = mDiv(dMiddle, { w: '100%', padding: 10 }); mFlexWrap(dOpenTable);
  return [dOben, dOpenTable, dMiddle, dRechts];
}
function tableMyMove() { DA.prevTableState = DA.tableState; DA.tableState = 'mymove'; }
function tableNone() { DA.prevTableState = DA.tableState; DA.tableState = 'none'; }
function tableOpen() { DA.prevTableState = DA.tableState; DA.tableState = 'open'; }
function tableOtherMove() { DA.prevTableState = DA.tableState; DA.tableState = 'othermove'; }
function tablePresent(t) {
  console.log('PRESENT!!!!');
  let title = fromNormalized(t.friendly);
  mClear('dTopLeft');
  mDom('dTopLeft', { family: 'algerian', maleft: 10 }, { html: title });
  mClear('dMain')
  mDom('dMain', { bg: 'white', fg: 'black' }, { tag: 'pre', html: jsonToYaml(t) });
}
async function tableSave(table) {
  table.modified = getNow();
  let id = table.id;
  let res = await mPhpPost('all', { action: 'savey', file: `tables/${id}`, o: table });
}
async function tableSaveRace(newTable, move) {
  newTable.modified = getNow();
  let id = newTable.id;
  let res = await mPhpPost('all', { action: 'saverace', file: `tables/${id}`, newTable, move });
  await updateMain();
  return res;
}
async function tablesDeleteAll() {
  let res = await mPhpPost('all', { action: 'delete_dir', dir: 'tables' });
  if (VERBOSE) console.log('res', res);
  DA.tid = null;
  localStorage.removeItem('tid');
  await switchToMenu('games');
}
function tabtitleUpdate() {
}
function takeFromTo(ad, from, to) {
  if (isDict(ad)) {
    let keys = Object.keys(ad);
    return keys.slice(from, to).map(x => (ad[x]));
  } else return ad.slice(from, to);
}
async function test0() {
  await loadAssetsStatic(); console.log(M);
  let files = await mGetFilenames('tables'); console.log('files', files);
  let [dTop, dMain] = mLayoutTM('dPage');
  mStyle('dMain', { overy: 'auto', padding: 0 }); //,grid: '1fr / 1fr', gap: 10, padding: 10 });
  let d = mDom(dMain, { gap: 10, padding: 10, bg: 'red', wrap: true });  //,{className:'flex0'}); mFlex(d) //, { padding:10,flex:'center center row', wrap:true});//display: 'grid', gridCols: 2,gap:10, padding:10, bg: rColor() });
  mClass(d, 'flexCC')
  for (const i of range(10)) {
    showObject(DA, null, d, { bg: rColor() });
  }
}
function test1(map) {
  var baseballIcon = L.icon({
    iconUrl: '../leaf94/baseball-marker.png',
    iconSize: [32, 37],
    iconAnchor: [16, 37],
    popupAnchor: [0, -28]
  });
  function onEachFeature(feature, layer) {
    var popupContent = '<p>I started out as a GeoJSON ' +
      feature.geometry.type + ", but now I'm a Leaflet vector!</p>";
    if (feature.properties && feature.properties.popupContent) {
      popupContent += feature.properties.popupContent;
    }
    layer.bindPopup(popupContent);
  }
  var bicycleRentalLayer = L.geoJSON([bicycleRental, campus], {
    style: function (feature) {
      return feature.properties && feature.properties.style;
    },
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, {
        radius: 8,
        fillColor: '#ff7800',
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
    }
  }).addTo(map);
  var freeBusLayer = L.geoJSON(freeBus, {
    filter: function (feature, layer) {
      if (feature.properties) {
        return feature.properties.underConstruction !== undefined ? !feature.properties.underConstruction : true;
      }
      return false;
    },
    onEachFeature: onEachFeature
  }).addTo(map);
  var coorsLayer = L.geoJSON(coorsField, {
    pointToLayer: function (feature, latlng) {
      return L.marker(latlng, { icon: baseballIcon });
    },
    onEachFeature: onEachFeature
  }).addTo(map);
}
function testCartesianFunctions() {
  const data = [
    { x: "a", y: 1 },
    { x: "a", y: 2 },
    { x: "b", y: 1 },
    { x: "b", y: 2 }
  ];
  const [keys, compact] = cartesianContract(data);
  const expanded = cartesianExpand(keys, compact);
  return {
    compact: [keys, compact],
    expanded: expanded
  };
}
async function testFlask() {
  let res = await pyStartGame('tictactoe', ['felix', 'amanda'], {});
  console.log('res', res);
  res = await getAllTables();
  console.log('res', res);
}
function testHelpers() {
  if (activatedTests.includes('helpers')) {
    console.log(...arguments);
  }
}
function testMouseMove(ev, pixelsByPair, ctx) {
  const mouseX = ev.clientX;
  const mouseY = ev.clientY;
  const highlightRadius = 5;
  let found = false;
  for (let i = 0; i < pixelsByPair.length; i++) {
    const pair = pixelsByPair[i];
    for (let j = 0; j < pair.pixels.length; j++) {
      const pixel = pair.pixels[j];
      const dx = mouseX - pixel.x;
      const dy = mouseY - pixel.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < highlightRadius) {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(pair.x1, pair.y1, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pair.x2, pair.y2, 5, 0, 2 * Math.PI);
        ctx.fill();
        found = true;
        break;
      }
    }
    if (found) break;
  }
  if (!found) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}
async function testOnclickBot(ev) {
  for (const b of [UI.bTestBot, UI.bTestHuman, UI.bTestHybrid]) {
    if (isdef(b)) mStyle(b, { bg: 'silver', fg: 'black' });
  }
  mStyle(UI.bTestBot, { bg: 'red', fg: 'white' });
  await onclickBot();
}
async function testOnclickHuman(ev) {
  for (const b of [UI.bTestBot, UI.bTestHuman, UI.bTestHybrid]) {
    if (isdef(b)) mStyle(b, { bg: 'silver', fg: 'black' });
  }
  mStyle(UI.bTestHuman, { bg: 'red', fg: 'white' });
  await onclickHuman();
}
async function testOnclickHybrid(ev) {
  for (const b of [UI.bTestBot, UI.bTestHuman, UI.bTestHybrid]) {
    if (isdef(b)) mStyle(b, { bg: 'silver', fg: 'black' });
  }
  mStyle(UI.bTestHybrid, { bg: 'red', fg: 'white' });
  await onclickHybrid();
}
async function testOnclickPlaymode(ev) {
  let b = UI.bPlaymode;
  let caption = b.innerHTML;
  if (caption.includes('human')) await onclickHuman();
  else await onclickBot();
}
function toCharCode(uniEmoText) {
  if (uniEmoText.endsWith(';')) uniEmoText = uniEmoText.slice(0, -1);
  return String.fromCodePoint(parseInt(uniEmoText.replace('&#', '0'), 16));
}
function toElem(d) { return isString(d) ? mBy(d) : d; }
function toFlatObject(o) {
  if (isString(o)) return { details: o };
  for (const k in o) { let val = o[k]; o[k] = recFlatten(val); }
  return o;
}
function toLetters(s) { return [...s]; }
function toNameValueList(any) {
  if (isEmpty(any)) return [];
  let list = [];
  if (isString(any)) {
    let words = toWords(any);
    for (const w of words) { list.push({ name: w, value: w }) };
  } else if (isDict(any)) {
    for (const k in any) { list.push({ name: k, value: any[k] }) };
  } else if (isList(any) && !isDict(any[0])) {
    for (const el of any) list.push({ name: el, value: el });
  } else if (isList(any) && isdef(any[0].name) && isdef(any[0].value)) {
    list = any;
  } else {
    let el = any[0];
    let keys = Object.keys(el);
    let nameKey = keys[0];
    let valueKey = keys[1];
    for (const x of any) {
      list.push({ name: x[nameKey], value: x[valueKey] });
    }
  }
  return list;
}
function toPercent(n, total) { return Math.round(n * 100 / total); }
function toWords(s, allow_ = false) {
  let arr = allow_ ? s.split(/[\W]+/) : s.split(/[\W|_]+/);
  return arr.filter(x => !isEmpty(x));
}
function toggleDevmode() {
  DEV = !DEV;
  clearTimeouts();
  clearEvents();
  staticTitle();
  mClear('dPage'); console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
  initUI();
}
function toggleItemSelection(item, classSelected = 'framedPicture', selectedItems = null) {
  if (nundef(item)) return;
  let ui = iDiv(item);
  item.isSelected = nundef(item.isSelected) ? true : !item.isSelected;
  if (item.isSelected) mClass(ui, classSelected); else mRemoveClass(ui, classSelected);
  if (isdef(selectedItems)) {
    if (item.isSelected) {
      console.assert(!selectedItems.includes(item), 'UNSELECTED PIC IN PICLIST!!!!!!!!!!!!')
      selectedItems.push(item);
    } else {
      console.assert(selectedItems.includes(item), 'PIC NOT IN PICLIST BUT HAS BEEN SELECTED!!!!!!!!!!!!')
      removeInPlace(selectedItems, item);
    }
  }
}
function toggleItemSelectionUnique(item, items) {
  let selitems = items.filter(x => x.isSelected == true); selitems.map(x => toggleItemSelection(x))
  toggleItemSelection(item);
}
function toggleSelection(id, selist, className = 'framedPicture') {
  if (selist.includes(id)) { removeInPlace(selist, id); mClassRemove(id, className); } else { selist.push(id); mClass(id, className); }
}
function toggleSelectionOfPicture(elem, selkey, selectedPics, className = 'framedPicture') {
  if (selectedPics.includes(selkey)) {
    removeInPlace(selectedPics, selkey); mUnselect(elem);
  } else {
    selectedPics.push(selkey); mSelect(elem);
  }
}
function transformColorName(s) {
  let res = replaceAll(s, ' ', '_');
  return res.toLowerCase();
}
function triangleTessellationCenters(rows, cols, w, h) {
  const centers = [];
  for (let r = 0; r < rows; r++) {
    const baseY = r * h;
    let x = 0;
    for (let c = 0; c < cols; c++) {
      const isUp = (r + c) % 2 === 0;
      const y = baseY;
      centers.push({ x, y, up: isUp });
      x = x + w / 2;
    }
  }
  return centers;
}
function trim(str) {
  return str.replace(/^\s+|\s+$/gm, '');
}
function trimQuotes(str) { return str.replace(/^['"`]+|['"`]+$/g, ''); }
function trimToAlphanum(str, allow_ = true) {
  return str.replace(/^[^a-zA-Z0-9_]+|[^a-zA-Z0-9_]+$/g, '');
}
function tryJSONParse(astext) {
  try {
    const data = JSON.parse(astext);
    return data;
  } catch {
    console.log('text', astext)
    return { message: 'ERROR', text: astext }
  }
}
function turtle() {
  background(51);
  stroke(255);
  translate(width / 2, height);
  for (let i = 0; i < sentence.length; i++) {
    let x = sentence.charAt(i);
    if ('ABF'.includes(x)) { line(0, 0, 0, -len); translate(0, -len); }
    else if (x == '+') rotate(angle);
    else if (x == '-') rotate(-angle);
    else if (x == '[') push();
    else if (x == ']') pop();
  }
}
async function txtErgebnis() {
  let txt = await loadStaticText('ymox.txt');
  txt = extractLines(txt, ['=>']);
  console.log(txt);
}
function uiAuto() { DA.prevUiState = DA.uiState; DA.uiState = 'auto'; }
function uiGadgetTypeCheckList(dParent, content, resolve, styles = {}, opts = {}) {
  addKeys({ hmax: 500, wmax: 200, bg: 'white', fg: 'black', padding: 10, rounding: 10, box: true }, styles)
  let dOuter = mDom(dParent, styles);
  let hmax = styles.hmax - 193, wmax = styles.wmax;
  let innerStyles = { hmax, wmax, box: true };
  let ui = uiTypeCheckList(content, dOuter, innerStyles, opts);
  let handler = () => resolve(getCheckedNames(ui));
  mButton('done', handler, dOuter, { classes: 'input', margin: 10 });
  return dOuter;
}
function uiGadgetTypeCheckListInput(form, content, resolve, styles, opts) {
  addKeys({ wmax: '100vw', hmax: valf(styles.hmax, 500), bg: 'white', fg: 'black', padding: 10, rounding: 10, box: true }, styles)
  let dOuter = mDom(form, styles);
  opts.handler = resolve;
  let ui = uiTypeCheckListInput(content, dOuter, styles, opts);
  return dOuter;
}
function uiGadgetTypeMulti(dParent, dict, resolve, styles = {}, opts = {}) {
  let inputs = [];
  let formStyles = opts.showLabels ? { wmin: 400, padding: 10, bg: 'white', fg: 'black' } : {};
  let form = mDom(dParent, formStyles, { tag: 'form', method: null, action: "javascript:void(0)" })
  for (const k in dict) {
    let [content, val] = [k, dict[k]];
    if (opts.showLabels) mDom(form, {}, { html: content });
    let inp = mDom(form, styles, { autocomplete: 'off', className: 'input', name: content, tag: 'input', type: 'text', value: val, placeholder: `<enter ${content}>` });
    inputs.push({ name: content, inp: inp });
    mNewline(form)
  }
  mDom(form, { display: 'none' }, { tag: 'input', type: 'submit' });
  form.onsubmit = ev => {
    ev.preventDefault();
    let di = {};
    inputs.map(x => di[x.name] = x.inp.value);
    resolve(di);
  }
  return form;
}
function uiGadgetTypeMultiText(dParent, dict, resolve, styles = {}, opts = {}) {
  let inputs = [];
  let wIdeal = 500;
  let formStyles = { maleft: 10, wmin: wIdeal, padding: 10, bg: 'white', fg: 'black' };
  let form = mDom(dParent, formStyles, {})
  addKeys({ className: 'input', tag: 'textarea', }, opts);
  addKeys({ fz: 14, family: 'tahoma', w: wIdeal, resize: 'none' }, styles);
  let df = mDom(form);
  let db = mDom(form, { vMargin: 10, align: 'right' });
  mButton('Cancel', ev => resolve(null), db, { classes: 'button', maright: 10 });
  mButton('Save', ev => {
    let di = {};
    inputs.map(x => di[x.name] = x.inp.value);
    resolve(di);
  }, db, { classes: 'button', maright: 10 });
  if (isEmpty(dict)) {
    fillFormFromObject(inputs, wIdeal, df, db, styles, opts);
  } else {
    fillMultiForm(dict, inputs, wIdeal, df, styles, opts);
  }
  return form;
}
function uiGadgetTypeSelect(dParent, content, resolve, styles = {}, opts = {}) {
  let dSelect = uiTypeSelect(content, dParent, styles, opts);
  dSelect.onclick = ev => ev.stopPropagation();
  dSelect.onchange = ev => resolve(ev.target.value);
  return dSelect;
}
function uiGadgetTypeText(dParent, content, resolve, styles = {}, opts = {}) {
  let inp = mDom(dParent, styles, { autocomplete: 'off', className: 'input', name: content, tag: 'input', type: 'text', placeholder: valf(opts.placeholder, `<enter ${content}>`) });
  mOnEnterInput(inp, resolve);
  return inp;
}
function uiGadgetTypeYesNo(dParent, content, resolve, styles = {}, opts = {}) {
  addKeys({ bg: 'white', fg: 'black', padding: 10, rounding: 10, box: true }, styles)
  let dOuter = mDom(dParent, styles)
  let dq = mDom(dOuter, { mabottom: 7 }, { html: capitalize(content) });
  let db = mDom(dOuter, { w100: true, box: true, display: 'flex', 'justify-content': 'space-between', gap: 10 })
  let bYes = mDom(db, { w: 70, classes: 'input' }, { html: 'Yes', tag: 'button', onclick: () => resolve('yes') })
  let bNo = mDom(db, { w: 70, classes: 'input' }, { html: 'No', tag: 'button', onclick: () => resolve('no') })
  return dOuter;
}
function uiManual() { DA.prevUiState = DA.uiState; DA.uiState = 'manual'; }
async function uiTypeCalendar(dParent) {
  const [wcell, hcell, gap] = [120, 100, 10];
  let outerStyles = {
    rounding: 4, patop: 4, pabottom: 4, weight: 'bold', box: true,
    paleft: gap / 2, w: wcell, hmin: hcell,
    bg: 'black', fg: 'white', cursor: 'pointer'
  }
  let innerStyles = { box: true, padding: 0, align: 'center', bg: 'beige', rounding: 4 };//, w: '95%', hmin: `calc( 100% - 24px )` }; //cellWidth - 28 };
  innerStyles.w = wcell - 11.75;
  innerStyles.hmin = `calc( 100% - 23px )`;//hcell-32
  let fz = 12;
  let h = measureHeightOfTextStyle(dParent, { fz: fz }); //console.log('h', h)
  let eventStyles = { fz: fz, hmin: h, w: '100%' };
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var dParent = toElem(dParent);
  var container = mDom(dParent, {}, { id: 'dCalendar' });
  var currentDate = new Date();
  var today = new Date();
  let dTitle = mDom(container, { w: 890, vPadding: gap, fz: 26, family: 'sans-serif', display: 'flex', justify: 'space-between', className: 'title' });
  var dWeekdays = mGrid(1, 7, container, { gap: gap });
  var dDays = [];
  var info = {};
  for (const w of weekdays) { mDom(dWeekdays, { w: wcell, className: 'subtitle' }, { html: w }); };
  var dGrid = mGrid(6, 7, container, { gap: gap });
  var dDate = mDom(dTitle, { display: 'flex', gap: gap, className: 'title' }, { id: 'dDate', html: '' });
  var dButtons = mDom(dTitle, { display: 'flex', gap: gap });
  mButton('Prev',
    async () => {
      let m = currentDate.getMonth();
      let y = currentDate.getFullYear();
      if (m == 0) setDate(12, y - 1); else await setDate(m, y);
    },
    dButtons, { w: 70, margin: 0 }, 'input');
  mButton('Next',
    async () => {
      let m = currentDate.getMonth();
      let y = currentDate.getFullYear();
      if (m == 11) setDate(1, y + 1); else await setDate(m + 2, y);
    }, dButtons, { w: 70, margin: 0 }, 'input');
  var dMonth, dYear;
  function getDayDiv(dt) {
    if (dt.getMonth() != currentDate.getMonth() || dt.getFullYear() != currentDate.getFullYear()) return null;
    let i = dt.getDate() + info.dayOffset;
    if (i < 1 || i > info.numDays) return null;
    let ui = dDays[i];
    if (ui.style.opacity === 0) return null;
    return ui.children[0];
  }
  async function setDate(m, y) {
    currentDate.setMonth(m - 1);
    currentDate.setFullYear(y);
    mClear(dDate);
    dMonth = mDom(dDate, {}, { id: 'dMonth', html: `${currentDate.toLocaleDateString('en-us', { month: 'long' })}` });
    dYear = mDom(dDate, {}, { id: 'dYear', html: `${currentDate.getFullYear()}` });
    mClear(dGrid);
    dDays.length = 0;
    let c = getNavBg();
    let dayColors = mimali(c, m).map(x => colorFrom(x))
    for (const i of range(42)) {
      let cell = mDom(dGrid, outerStyles);
      mStyle(cell, { bg: dayColors[i], fg: 'contrast' })
      dDays[i] = cell;
    }
    populate(currentDate);
    await refreshEvents();
    return { container, date: currentDate, dDate, dGrid, dMonth, dYear, setDate, populate };
  }
  function populate() {
    let dt = currentDate;
    const day = info.day = dt.getDate();
    const month = info.month = dt.getMonth();
    const year = info.year = dt.getFullYear();
    const firstDayOfMonth = info.firstDay = new Date(year, month, 1);
    const daysInMonth = info.numDays = new Date(year, month + 1, 0).getDate();
    const dateString = info.dayString = firstDayOfMonth.toLocaleDateString('en-us', {
      weekday: 'long',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    const paddingDays = weekdays.indexOf(dateString.split(', ')[0]);
    info.dayOffset = paddingDays - 1;
    for (const i of range(42)) {
      if (i < paddingDays || i >= paddingDays + daysInMonth) { mStyle(dDays[i], { opacity: 0 }); }
    }
    for (let i = paddingDays + 1; i <= paddingDays + daysInMonth; i++) {
      const daySquare = dDays[i - 1];
      let date = new Date(year, month, i - paddingDays);
      daySquare.innerText = i - paddingDays + (isSameDate(date, today) ? ' TODAY' : '');
      let d = mDom(daySquare, innerStyles, { id: date.getTime() });
      daySquare.onclick = ev => { evNoBubble(ev); onclickDay(d, eventStyles); }
    }
  }
  async function refreshEvents() {
    let events = await getEvents();
    for (const k in events) {
      let o = events[k];
      let dt = new Date(Number(o.day));
      let dDay = getDayDiv(dt);
      if (!dDay) continue;
      uiTypeEvent(dDay, o, eventStyles);
    }
    mDummyFocus();
  }
  await setDate(currentDate.getMonth() + 1, currentDate.getFullYear());
  return { container, date: currentDate, dDate, dGrid, dMonth, dYear, info, getDayDiv, refreshEvents, setDate, populate }
}
function uiTypeCheckList(any, dParent, styles = {}, opts = {}) {
  let lst = toNameValueList(any); lst.map(x => { if (x.value !== true) x.value = false; });
  addKeys({ overy: 'auto' }, styles)
  let d = mDom(dParent, styles, opts);
  lst.forEach((o, index) => {
    let [text, value] = [o.name, o.value];
    let dcheck = mDom(d, {}, { tag: 'input', type: 'checkbox', name: text, value: text, id: `ch_${index}`, checked: value });
    let dlabel = mDom(d, {}, { tag: 'label', for: dcheck.id, html: text });
    mNewline(d, 0);
  });
  return d;
}
function uiTypeCheckListInput(any, dParent, styles = {}, opts = {}) {
  let dg = mDom(dParent);
  let list = toNameValueList(any); list.map(x => { if (x.value != true) x.value = false; });
  let items = [];
  for (const o of list) {
    let div = mCheckbox(dg, o.name, o.value);
    items.push({ nam: o.name, div, w: mGetStyle(div, 'w'), h: mGetStyle(div, 'h') });
  }
  let wmax = arrMax(items, 'w'); //console.log('wmax',wmax); //measure max width of items
  let cols = 4;
  let wgrid = wmax * cols + 100;
  dg.remove();
  dg = mDom(dParent);
  let inp = mDom(dg, { w100: true, box: true, mabottom: 10 }, { className: 'input', tag: 'input', type: 'text' });
  let db = mDom(dg, { w100: true, box: true, align: 'right', mabottom: 4 });
  mButton('cancel', () => opts.handler(null), db, {}, 'input');
  mButton('clear', ev => { onclickClear(inp, grid) }, db, { maleft: 10 }, 'input');
  mButton('done', () => opts.handler(extractWords(inp.value, ' ')), db, { maleft: 10 }, 'input');
  mStyle(dg, { w: wgrid, box: true, padding: 10 }); //, w: wgrid })
  console.log('...hmax', styles.hmax)
  let hmax = valf(styles.hmax, 450);
  let grid = mGrid(null, cols, dg, { w100: true, gap: 10, matop: 4, hmax: hmax - 150 }); //, bg:'red' });
  items.map(x => mAppend(grid, iDiv(x)));
  sortCheckboxes(grid);
  let chks = Array.from(dg.querySelectorAll('input[type="checkbox"]'));
  for (const chk of chks) {
    chk.addEventListener('click', ev => checkToInput(ev, inp, grid))
  }
  inp.value = list.filter(x => x.value).map(x => x.name).join(', ');
  inp.addEventListener('keypress', ev => inpToChecklist(ev, grid));
  return { dg, inp, grid };
}
function uiTypeEvent(dParent, o, styles = {}) {
  Items[o.id] = o;
  let id = o.id;
  let ui = mDom(dParent, styles, { id: id }); //, className:'no_events'}); //onclick:ev=>evNoBubble(ev) }); 
  mStyle(ui, { overflow: 'hidden', display: 'flex', gap: 2, padding: 2, 'align-items': 'center' }); //,'justify-items':'center'})
  let [wtotal, wbutton, h] = [mGetStyle(dParent, 'w'), 17, styles.hmin];
  let fz = 15;
  let stInput = { overflow: 'hidden', hline: fz * 4 / 5, fz: fz, h: h, border: 'solid 1px silver', box: true, margin: 0, padding: 0 };
  let inp = mDom(ui, stInput, { html: o.text, tag: 'input', className: 'no_outline', onclick: ev => { evNoBubble(ev) } }); //;selectText(ev.target);}});
  inp.value = getEventValue(o);
  inp.addEventListener('keyup', ev => { if (ev.key == 'Enter') { mDummyFocus(); onEventEdited(id, inp.value); } });
  fz = 14;
  let stButton = { overflow: 'hidden', hline: fz * 4 / 5, fz: fz, box: true, fg: 'silver', bg: 'white', family: 'pictoFa', display: 'flex' };
  let b = mDom(ui, stButton, { html: String.fromCharCode('0x' + M.superdi.pen_square.fa) });
  ui.onclick = ev => { evNoBubble(ev); onclickExistingEvent(ev); }
  mStyle(inp, { w: wtotal - wbutton });
  return { ui: ui, inp: inp, id: id };
}
function uiTypeExtraWorker(w) {
  let [res, n] = [stringBefore(w, ':'), Number(stringAfter(w, ':'))];
  let s = `worker (cost:${res} ${n})`
  let present = presentExtraWorker;
  let select = selectExtraWorker;
  return { itemtype: 'worker', a: s, key: `worker_${res}`, o: { res: res, n: n }, friendly: s, present, select }
}
async function uiTypePalette(dParent, color, fg, src, blendMode) {
  let fill = color;
  let bgBlend = getBlendModeForCanvas(blendMode);
  let d = mDom(dParent, { box: true }); //, { w100: true, gap: 4 }); //mFlex(d);
  let NewValues = { fg, bg: color };
  let palette = [color];
  let w = 350;
  let dContainer = mDom(d, { w, padding: 0, box: true });
  if (isdef(src)) {
    let ca = await getCanvasCtx(dContainer, { w, fill, bgBlend }, { src });
    palette = await getPaletteFromCanvas(ca.cv);
    palette.unshift(fill);
  } else {
    palette = arrCycle(paletteShades(color), 4);
  }
  let dominant = palette[0];
  let palContrast = paletteContrastVariety(palette, palette.length);
  mLinebreak(d);
  let bgItems = showPaletteMini(d, palette);
  mLinebreak(d);
  let fgItems = showPaletteMini(d, palContrast);
  mLinebreak(d);
  for (const item of fgItems) {
    let div = iDiv(item);
    mStyle(div, { cursor: 'pointer' });
    div.onclick = () => {
      mStyle(dText, { fg: item.bg });
      NewValues.fg = item.bg;
      console.log('NewValues', NewValues);
    }
  }
  for (const item of bgItems) {
    let div = iDiv(item);
    mStyle(div, { cursor: 'pointer' });
    div.onclick = async () => {
      if (isdef(src)) {
        mClear(dContainer);
        let fill = item.bg;
        await getCanvasCtx(dContainer, { w: 500, h: 300, fill, bgBlend }, { src });
      }
      mStyle(dParent, { bg: item.bg });
      NewValues.bg = item.bg;
    }
  }
}
function uiTypePlayerStats(table, me, dParent, layout, styles = {}) {
  let dOuter = mDom(dParent, { margin: 10 }); dOuter.setAttribute('inert', true); //console.log(dOuter);
  if (layout == 'rowflex') mStyle(dOuter, { display: 'flex', justify: 'center' });
  else if (layout == 'col') mStyle(dOuter, { display: 'flex', dir: 'column' });
  addKeys({ hmin: 120, rounding: 10, bg: '#00000050', margin: 8, box: true, 'border-style': 'solid', 'border-width': 7 }, styles);
  let show_first = me;
  let order = arrCycle(table.plorder, table.plorder.indexOf(show_first));
  let items = {};
  addKeys(flexCenterTop(), styles);
  for (const name of order) {
    let pl = table.players[name];
    let chex = colorFrom(pl.color);
    let [h, s, l] = colorHexToHsl01Array(chex);
    l = clamp(l, 0.35, 0.65);
    let cFinal = colorFromHsl(h, s, l);
    styles['border-color'] = cFinal; //'red'; //pl.color;
    styles.outline = `solid 1px #ffffff40`;
    let d = mDom(dOuter, styles, { id: name2id(name) }); //console.log('d', d, styles);
    let img = showUserImage(name, d, 40); mStyle(img, { box: true });
    mLinebreak(d);
    mDom(d, { padding:0,margin:0,fz:14,display: 'flex', 'flex-direction': 'column', align: 'center' }, { html: name });
    items[name] = { div: d, img, name };
  }
  return items;
}
function uiTypeRadios(lst, d, styles = {}, opts = {}) {
  let rg = mRadioGroup(d, {}, 'rSquare', 'Resize (cropped area) to height: '); mClass(rg, 'input');
  let handler = x => squareTo(cropper, x);
  mRadio(`${'just crop'}`, 0, 'rSquare', rg, {}, cropper.crop, 'rSquare', false)
  for (const h of [128, 200, 300, 400, 500, 600, 700, 800]) {
    mRadio(`${h}`, h, 'rSquare', rg, {}, handler, 'rSquare', false)
  }
  return rg;
}
function uiTypeSelect(any, dParent, styles = {}, opts = {}) {
  let list = toNameValueList(any);
  addKeys({ tag: 'select' }, opts);
  let d0 = mDom(dParent, styles, opts);
  let dselect = mDom(d0, {}, { tag: 'select' });
  for (const el of list) { mDom(dselect, {}, { tag: 'option', html: el.name, value: el.value }); }
  dselect.value = '';
  return [d0, dselect];
}
function uid() {
  UID += 1;
  return 'a' + UID;
}
function unfoldCartesianProduct(dicts) {
  if (!dicts.length) return [];
  const keys = Object.keys(dicts[0]);
  const sets = Object.fromEntries(keys.map(k => [k, new Set()]));
  dicts.forEach(obj => {
    keys.forEach(k => sets[k].add(obj[k]));
  });
  return keys.map(k => Array.from(sets[k]));
}
function unionOfArrays() {
  let arrs = arguments[0];
  if (!arrs.every(Array.isArray)) arrs = Array.from(arguments);
  const flattenedArray = arrs.flat();
  return [...new Set(flattenedArray)];
}
function unlock() {
  DA.LengthyProcessRunning = false;
  console.log('UNLOCK!!!!!!!!!!!!!!!!!!!!!!');
}
function unlockLengthyProcess() {
  try {
    if (DA.Interrupt === true && DA.LengthyProcessRunning === true) {
      DA.LengthyProcessRunning = false;
      console.log('INTERRUPT!!!!!!!!!!!!!!!!!!!!!!');
      throw 1;
    }
  }
  catch (err) { }
}
function unselectPlayerItem(item) { mStyle(iDiv(item), { bg: 'transparent', fg: 'black', border: `transparent` }); }
function updateCardValue(svgStr, newLabel, index = 0) {
  const symbolIdMatches = [...svgStr.matchAll(/<symbol id='([^']+)'/g)];
  const symbolIds = symbolIdMatches.map(match => match[1]);
  console.log('symbolIds', symbolIds); //return;
  const valueSymbolId = symbolIds[index];
  if (!valueSymbolId) return svgStr;
  const updatedSvg = svgStr.replace(
    new RegExp(`<symbol id='${valueSymbolId}'[^>]*>[\\s\\S]*?<\\/symbol>`),
    `<symbol id='${valueSymbolId}' viewBox='-500 -500 1000 1000' preserveAspectRatio='xMinYMid'>
       <text x='-200' y='300' font-size='800' font-family='serif' fill='red'>${newLabel}</text>
     </symbol>`
  );
  return updatedSvg;
}
async function updateClientData() {
}
async function updateData() {
  switch (DA.menu) {
    case 'games': return await reloadTables();
    case 'table': return await reloadTable();
    default: return false;
  }
}
async function updateDetails(di, key) {
  let res = await mPostRoute('postUpdateDetails', { key, di });
  await loadAssets();
}
async function updateExtra() {
  mClear('dExtra');
  let d = mDom('dExtra');
  mStyle(d, { display: 'flex', justify: 'space-between' });
  let [left, right] = [mDom(d, {}, { id: 'dExtraLeft' }), mDom(d, {}, { id: 'dExtraRight' })];
  if (TESTING) await updateTestButtonsLogin();
}
function updateGameState(state) {
  document.getElementById("gameState").textContent = JSON.stringify(state, null, 2);
}
function updateKeySettings(nMin) {
  if (nundef(G)) return;
  G.keys = setKeys({ nMin, lang: Settings.language, keysets: KeySets, key: Settings.vocab });
}
async function updateMain(forceUI = false) {
  let hasChanges = await updateData();
  if (!hasChanges && !forceUI) { console.log('data unchanged'); return; }
  updateUI();
}
function updateRank(svgStr, newLabel) { return updateCardValue(svgStr, newLabel, 0); }
async function updateState() {
  clearTimeout(TO.system); TO.system = null;
  await mSleep(100);
  showState();
  TO.system = setTimeout(updateState, 1000);
}
function updateSuit(svgStr, newLabel) { return updateCardValue(svgStr, newLabel, 1); }
async function updateSuperdi(di, key) {
  let res = await mPostRoute('postUpdateSuperdi', { di });
  await loadAssets();
}
async function updateTestButtonsLogin(names) {
  if (nundef(names)) names = ['amanda', 'felix', 'lauren', 'mimi', 'gul'];
  let d = mBy('dExtraRight'); mClear(d);
  let me = getUname();
  for (const name of names) {
    let idname = getButtonCaptionName(name);
    let b = UI[idname] = mButton(name, async () => await switchToUser(name), d, { maleft: 4, hpadding: 3, wmin: 50, className: 'button' });
    if (me == name) mStyle(b, { bg: 'red', fg: 'white' });
  }
}
function updateUI() {
  miniClearMain(); mClear('dMain');
  switch (DA.menu) {
    case 'games': showGamesAndTables(); break;
    case 'table': showTable(); break;
    case 'settings': showSettings(); break;
  }
}
function updateUserImageToBotHuman(playername, value) {
  function doit(checked, name, val) {
    let du = mByAttr('username', playername);
    let img = du.getElementsByTagName('img')[0];
    if (checked == true) if (val == 'human') mStyle(img, { round: true }); else mStyle(img, { rounding: 2 });
  }
  if (isdef(value)) doit(true, 0, value); else return doit;
}
function uploadImage(dataUrl, path) {
  if (isdef(path) && (path.startsWith('zdata') || path.startsWith('y'))) path = '../../' + path;
  let sessionType = detectSessionType();
  let server = sessionType == 'fastcomet' ? 'https://moxito.online/' : 'http://localhost:8080/fastcomet/';
  fetch(server + 'ilms/php/upload_image.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: dataUrl, path })
  })
    .then(response => response.text())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
}
function uploadImg(img, unique, coll, name) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append('image', blob, unique + '.png');
      formData.append('collection', coll);
      formData.append('name', name);
      let server = getServerurl();
      server += '/upload';
      try {
        const response = await fetch(server, {
          method: 'POST',
          mode: 'cors',
          body: formData
        });
        if (response.ok) {
          const data = await response.json();
          resolve(data);
        } else {
          reject(response.statusText);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        reject(error);
      }
    });
  });
}
function userToPlayer(name, gamename, playmode = 'human') {
  let user = MGetUser(name);
  let pl = jsCopyExceptKeys(user, ['games']);
  let options = valf(MGetUserOptionsForGame(name, gamename), {});
  addKeys(options, pl);
  pl.playmode = playmode || 'human';
  let poss = MGetGamePlayerOptions(gamename);
  for (const p in poss) {
    if (isdef(pl[p])) continue;
    let val = poss[p];
    let defval = arrLast(val.split(','));
    if (isNumber(defval)) defval = Number(defval);
    pl[p] = defval;
  }
  return pl;
}
function valf() {
  for (const arg of arguments) if (isdef(arg)) return arg;
  return null;
}
function valnwhite() {
  for (const arg of arguments) {
    if (nundef(arg) || isEmpty(arg) || isWhiteSpace(arg)) {
      continue;
    }
    return arg;
  }
  return null;
}
function weiredChromeCheck() {
  if (isdef(chrome.runtime)) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.type === 'getData') {
        fetchSomeData().then(data => {
          sendResponse({ data });
        }).catch(err => {
          sendResponse({ error: err.message });
        });
        return true;
      }
    });
  }
}
function where(o) {
  let fname = getFunctionsNameThatCalledThisFunction();
}
function without(arr, elementToRemove) {
  return arr.filter(function (el) {
    return el !== elementToRemove;
  });
}
function wordAfter(arr, w) {
  if (isString(arr)) arr = toWords(arr);
  let i = arr.indexOf(w);
  return i >= 0 && arr.length > i ? arr[i + 1] : null;
}
function wsCard(d, w, h) {
  let card = cBlank(d, { h, w, border: 'silver' }); //return;
  let dCard = iDiv(card);
  return [card, dCard];
}
function wsFenFromItem(item) {
  return `${item.key}@${item.valueFactor}@${normalizeString(item.power, '_', [':', '.'])}@${item.colorPower}@${item.abstract}@${item.colorSym}@${item.op}`;
}
function wsFood(tokens, op, dtop, sz) {
  let d = mDom(dtop); mCenterCenterFlex(d);
  let ch = op;
  for (let i = 0; i < tokens.length; i++) {
    let t = tokens[i];
    let d1 = wsPrintSymbol(d, sz, t);
    if (i < tokens.length - 1) mDom(d, { fz: sz * .7, weight: 'bold' }, { html: ch });
  }
}
function wsFromNormalized(s, sep = '_') {
  let x = replaceAll(s, sep, ' '); return x;
}
function wsGenerateCardInfo(key) {
  let bg = rChoose(['white', 'sienna', 'pink', 'lightblue']);
  let palette = wsGetColorRainbow();
  let fg = rChoose(palette);
  sym = getAbstractSymbol([2, 8, 10, 23, 26]);
  power = wsGetPower(bg);
  valueFactor = rChoose(range(1, 3));
  op = rChoose(['+', '/']); //console.log('op',op)
  return wsFenFromItem({ key, valueFactor, power, colorPower: bg, abstract: sym, colorSym: fg, op });
}
function wsGetChildInline(item, color) {
  let type = item.class;
  let key = type == 'mammal' ? 'paw' : 'big_egg';
  let o = M.superdi[key];
  let [fam, sym] = isdef(o.fa6) ? ['fa6', 'fa6'] : isdef(o.fa) ? ['pictoFa', 'fa'] : ['pictoGame', 'ga'];
  let fg = valf(color, colorIdealText(item.colorPower, true));
  return `<span style="color:${fg};vertical-align:middle;line-height:80%;font-size:${item.fz * 1.5}px;font-family:${fam}">${String.fromCharCode('0x' + M.superdi[key][sym])}</span>`;
}
function wsGetColorRainbow() { return ['gold', 'limegreen', 'orangered', 'dodgerblue', 'indigo', 'hotpink']; }
function wsGetColorRainbowText(color) { return { gold: 'gold', limegreen: 'green', orangered: 'red', hotpink: 'pink', indigo: 'violet', dodgerblue: 'blue' }[color]; }
function wsGetFoodlist() { return ['cherries', 'fish', 'grain', 'mouse', 'seedling', 'worm'] }
function wsGetIcon(sym, sz = 30) {
  let html;
  if (nundef(sym)) sym = 'leaf';//rChoose(['omni', 'fish', 'mouse', 'wheat', 'worm', 'cherry']);
  if (sym == 'omni') {
    let colors = toWords('british_racing_green yellow sangria azure gray', true).map(x => colorFrom(x));
    html = generatePizzaSvg(sz, ...colors);
  } else if (sym == 'fish') {
    html = `
      <svg width="${sz}" height="${sz}" viewBox="0 0 200 200" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
          <g transform="matrix(1,0,0,1,-700,-300)">
              <g transform="matrix(-10.1636,-1.24469e-15,1.24469e-15,-10.1636,756.948,402.109)">
                  <g id="ws-4">
                      <path id="fish" d="M0,0.092C0,-0.238 0.267,-0.506 0.598,-0.506C0.927,-0.506 1.195,-0.238 1.195,0.092C1.195,0.422 0.927,0.69 0.598,0.69C0.267,0.69 0,0.422 0,0.092M-11.442,-1.15L-11.442,-1.088C-11.442,-1.037 -11.42,-0.992 -11.408,-0.945C-11.275,-0.465 -10.779,-0.016 -10.771,0.305C-10.756,0.912 -11.504,1.256 -11.586,1.625C-11.586,1.625 -11.667,1.904 -11.559,2.025C-11.499,2.092 -11.42,2.102 -11.337,2.094C-9.921,1.954 -8.259,1.047 -7.839,1.24C-7.419,1.433 -5.796,3.438 -2.936,3.63C-1.327,3.738 1.139,3.412 2.135,2.096C2.368,1.819 2.579,1.517 2.783,1.224C2.876,1.09 2.97,0.957 3.065,0.825C3.225,0.596 3.097,0.387 3.056,0.337C2.902,0.146 2.75,-0.056 2.602,-0.253C2.27,-0.693 1.927,-1.148 1.529,-1.524C-0.167,-3.129 -2.469,-3.646 -4.806,-2.897C-5.842,-2.565 -7.774,-0.907 -7.775,-0.907C-8.289,-0.579 -10.235,-1.284 -11.139,-1.405C-11.214,-1.415 -11.286,-1.421 -11.346,-1.37C-11.406,-1.32 -11.442,-1.237 -11.442,-1.15" style="fill:rgb(0,121,159);fill-rule:nonzero;"/>
                  </g>
              </g>
          </g>
      </svg>
    `;
  } else if (sym == 'mouse') {
    html = `
        <svg width="${sz}" height="${sz}" viewBox="0 0 200 200" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
            <g transform="matrix(1,0,0,1,-500,-300)">
                <g transform="matrix(9.09451,0,0,9.09451,670.98,392.954)">
                    <g id="ws-5">
                        <path id="mouse" d="M0,0.136C-0.705,-0.412 -2.127,-0.236 -2.867,-0.095C-2.803,-2.905 -7.442,-5.024 -10.299,-2.45L-11.797,-2.233C-11.131,-3.613 -12.9,-3.994 -13.312,-2.346L-15.426,-0.406C-16.451,0.4 -16.105,1.031 -15.189,1.031C-14.876,1.031 -11.897,1.617 -11.472,2.094C-11.535,2.206 -11.852,2.384 -11.773,2.995L-5.978,3.179C-4.286,2.679 -3.368,1.772 -3.023,0.768C-2.195,0.57 -0.921,0.449 -0.497,0.777C-0.434,0.826 -0.369,0.899 -0.369,1.063C-0.369,1.549 -0.767,1.699 -1.744,1.949C-2.445,2.129 -3.24,2.332 -3.749,2.912C-4.156,3.376 -4.309,3.827 -4.202,4.25C-4.05,4.859 -3.429,5.107 -3.359,5.134C-3.312,5.152 -3.264,5.16 -3.216,5.16C-3.052,5.16 -2.897,5.059 -2.837,4.896C-2.758,4.687 -2.864,4.452 -3.074,4.374C-3.131,4.352 -3.371,4.228 -3.415,4.053C-3.452,3.907 -3.354,3.692 -3.139,3.447C-2.796,3.057 -2.159,2.893 -1.542,2.735C-0.658,2.509 0.442,2.227 0.442,1.063C0.442,0.681 0.289,0.36 0,0.136" style="fill:rgb(116,100,91);fill-rule:nonzero;"/>
                    </g>
                </g>
            </g>
        </svg>
      `;
  } else if (sym == 'worm') {
    html = `
        <svg width="${sz}" height="${sz}" viewBox="0 0 200 200" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
            <g transform="matrix(1,0,0,1,-300,-100)">
                <g transform="matrix(7.14802,0,0,7.14802,-2977.16,-1174.38)">
                    <g id="ws-1">
                        <g id="worm">
                            <g transform="matrix(1,0,0,1,467.653,195.772)">
                                <path d="M0,-8.535C-0.018,-8.351 -0.038,-8.047 -0.036,-7.798C-0.033,-7.536 -0.021,-7.275 0.007,-7.021C0.06,-6.511 0.179,-6.031 0.35,-5.619C0.432,-5.41 0.538,-5.226 0.648,-5.059C0.75,-4.905 0.789,-4.895 0.869,-4.838C1.013,-4.757 1.318,-4.665 1.782,-4.653C2.239,-4.635 2.789,-4.679 3.406,-4.729C3.718,-4.754 4.049,-4.779 4.42,-4.788C4.792,-4.794 5.204,-4.792 5.732,-4.686C6.694,-4.473 7.445,-4.057 8.093,-3.608C8.416,-3.38 8.716,-3.139 8.999,-2.886C9.14,-2.758 9.278,-2.629 9.413,-2.493C9.556,-2.348 9.664,-2.238 9.84,-2.031L9.993,-1.85C10.704,-1.01 10.599,0.248 9.758,0.959C8.918,1.67 7.66,1.564 6.95,0.724C6.866,0.626 6.79,0.513 6.729,0.404C6.711,0.373 6.616,0.251 6.548,0.17C6.473,0.08 6.394,-0.009 6.313,-0.096C6.152,-0.269 5.983,-0.43 5.815,-0.575C5.479,-0.863 5.134,-1.063 4.895,-1.148C4.821,-1.18 4.615,-1.217 4.37,-1.231C4.125,-1.248 3.839,-1.252 3.535,-1.254C2.922,-1.259 2.237,-1.25 1.464,-1.348C0.709,-1.447 -0.233,-1.666 -1.075,-2.345C-1.479,-2.669 -1.84,-3.145 -2.029,-3.534C-2.22,-3.903 -2.374,-4.283 -2.48,-4.66C-2.701,-5.417 -2.79,-6.164 -2.792,-6.886C-2.795,-7.247 -2.774,-7.603 -2.74,-7.957C-2.701,-8.323 -2.657,-8.633 -2.563,-9.056C-2.408,-9.76 -1.711,-10.205 -1.007,-10.049C-0.355,-9.906 0.075,-9.297 0.011,-8.649L0,-8.535Z" style="fill:rgb(0,95,82);fill-rule:nonzero;"/>
                            </g>
                            <g transform="matrix(-0.516885,-0.856055,-0.856055,0.516885,474.654,198.339)">
                                <path d="M-0.369,-0.653C-0.561,-0.652 -0.716,-0.461 -0.716,-0.223C-0.716,0.015 -0.561,0.208 -0.369,0.208C-0.177,0.208 -0.021,0.016 -0.021,-0.223C-0.021,-0.46 -0.177,-0.653 -0.369,-0.653" style="fill:rgb(0,95,82);fill-rule:nonzero;"/>
                            </g>
                            <g transform="matrix(1,0,0,1,474.892,196.692)">
                                <path d="M0,1.752C0.014,1.561 0.041,1.419 0.072,1.26C0.114,1.108 0.14,0.954 0.209,0.811C0.272,0.66 0.356,0.52 0.439,0.401C0.515,0.27 0.593,0.149 0.661,0L1.046,0.377C0.917,0.433 0.806,0.524 0.705,0.613C0.614,0.715 0.525,0.806 0.489,0.922C0.451,1.042 0.417,1.168 0.427,1.297C0.431,1.42 0.458,1.564 0.518,1.653L0,1.752Z" style="fill:rgb(0,95,82);fill-rule:nonzero;"/>
                            </g>
                            <g transform="matrix(0.516885,0.856055,0.856055,-0.516885,479.321,195.111)">
                                <path d="M0.369,-0.208C0.561,-0.208 0.716,-0.015 0.716,0.222C0.716,0.461 0.56,0.653 0.369,0.653C0.176,0.653 0.021,0.46 0.021,0.222C0.021,-0.016 0.177,-0.208 0.369,-0.208" style="fill:rgb(0,95,82);fill-rule:nonzero;"/>
                            </g>
                            <g transform="matrix(1,0,0,1,479.355,194.874)">
                                <path d="M0,0.679C-0.051,0.585 -0.166,0.495 -0.273,0.434C-0.382,0.364 -0.51,0.336 -0.633,0.314C-0.753,0.293 -0.874,0.329 -1.008,0.362C-1.134,0.41 -1.266,0.465 -1.375,0.554L-1.53,0.038C-1.367,0.047 -1.223,0.034 -1.072,0.028C-0.927,0.01 -0.764,0 -0.602,0.015C-0.443,0.02 -0.295,0.069 -0.14,0.102C0.015,0.148 0.152,0.191 0.329,0.267L0,0.679Z" style="fill:rgb(0,95,82);fill-rule:nonzero;"/>
                            </g>
                        </g>
                    </g>
                </g>
            </g>
        </svg>
        `;
  } else if (sym == 'wheat') {
    html = `
        <svg width="${sz}" height="${sz}" viewBox="0 0 200 200" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
            <g transform="matrix(1,0,0,1,-300,-500)">
                <g transform="matrix(7.70232,0,0,7.70232,-3403,-873.691)">
                    <g id="ws-6">
                        <g id="wheat">
                            <g transform="matrix(1,0,0,1,487.796,189.11)">
                                <path d="M0,-2.293C0.445,-1.498 1.102,-0.729 1.282,-0.522C1.462,-0.316 3.41,-0.035 4.113,0.01C3.948,-0.403 3.671,-0.749 3.079,-1.281C2.586,-1.724 2.109,-1.963 1.47,-2.084C1.11,-2.152 0.279,-2.303 0,-2.293" style="fill:rgb(195,116,45);fill-rule:nonzero;"/>
                            </g>
                            <g transform="matrix(0.807192,0.590289,0.590289,-0.807192,489.51,186.325)">
                                <path d="M0.599,0.015C0.869,0.113 1.467,0.126 1.68,0.173C1.017,0.749 0.85,1.614 0.599,1.67C0.348,1.727 -0.747,1.767 -1.127,1.674C-1.066,1.536 -0.423,0.405 0.599,0.015" style="fill:rgb(195,116,45);fill-rule:nonzero;"/>
                            </g>
                            <g transform="matrix(1,0,0,1,493.462,188.018)">
                                <path d="M0,-0.85C-0.107,-1.338 -1.235,-2.168 -1.841,-2.459C-1.935,-2.155 -2.079,-1.594 -2.053,-1.056C-2.024,-0.467 -1.76,0.211 -1.407,0.615C-1.055,1.019 -0.183,1.515 0.13,1.609C0.128,1.597 0.126,1.586 0.124,1.574C-0.042,0.499 0.107,-0.361 0,-0.85" style="fill:rgb(195,116,45);fill-rule:nonzero;"/>
                            </g>
                            <g transform="matrix(1,0,0,1,493.524,194.883)">
                                <path d="M0,-2.513C-1.031,-2.522 -1.653,-2.448 -2.565,-2.524C-2.161,-1.814 -1.315,-0.599 -0.557,-0.253C0.201,0.094 1.4,-0.3 2.482,-0.291C2.697,-0.289 3.439,-0.2 3.657,-0.152C3.551,-0.509 3.087,-1.833 2.6,-2.147C1.889,-2.607 1.577,-2.5 0,-2.513" style="fill:rgb(195,116,45);fill-rule:nonzero;"/>
                            </g>
                            <g transform="matrix(1,0,0,1,496.22,189.606)">
                                <path d="M0,-0.012C-0.375,-1.259 -1.609,-2.115 -2.317,-2.551C-2.342,-1.879 -2.343,-1.374 -2.21,-0.514C-2.049,0.535 -1.946,0.574 -1.451,1.053C-1.175,1.319 -0.283,2.43 0.145,2.539C0.145,2.539 0.144,0.467 0,-0.012" style="fill:rgb(195,116,45);fill-rule:nonzero;"/>
                            </g>
                            <g transform="matrix(-0.506442,0.862274,0.862274,0.506442,497.305,197.132)">
                                <path d="M-1.454,-1.812C-0.793,-3.066 -0.232,-3.44 0.202,-4.508C0.816,-2.36 0.396,0.388 -1.454,1.136C-1.693,1.232 -0.925,0.982 -1.454,1.136C-1.409,0.584 -2.027,-0.726 -1.454,-1.812" style="fill:rgb(195,116,45);fill-rule:nonzero;"/>
                            </g>
                            <g transform="matrix(1,0,0,1,496.942,193.86)">
                                <path d="M0,-2.164C-0.197,-0.955 0.514,0.481 0.88,0.901C1.246,1.32 1.926,2.192 2.218,2.336C3.808,0.963 1.265,-2.639 0.213,-3.845C0.017,-4.069 -0.193,-4.287 -0.415,-4.5C-0.415,-4.5 -0.002,-3.337 0,-2.164" style="fill:rgb(195,116,45);fill-rule:nonzero;"/>
                            </g>
                            <g transform="matrix(0.658061,-0.752964,-0.752964,-0.658061,489.682,185.285)">
                                <path d="M-1.083,-0.492C-0.929,-0.19 -0.7,0.149 -0.362,0.372C-0.023,0.597 -1.083,2.385 -1.083,2.385C-1.083,2.385 -1.281,0.976 -1.678,0.238C-1.494,0.048 -1.282,-0.197 -1.083,-0.492" style="fill:rgb(195,116,45);fill-rule:nonzero;"/>
                            </g>
                            <g transform="matrix(1,0,0,1,493.645,189.424)">
                                <path d="M0,2.503C0.135,2.509 1.42,2.539 1.55,2.55C1.235,2.005 0.612,1.245 0.031,0.771C-0.532,0.313 -1.45,0.27 -2.369,0.204C-2.97,0.161 -3.964,-0.039 -4.563,-0.047C-4.309,0.6 -3.575,1.878 -3.04,2.181C-2.504,2.485 -1.165,2.457 0,2.503" style="fill:rgb(195,116,45);fill-rule:nonzero;"/>
                            </g>
                            <g transform="matrix(1,0,0,1,498.162,197.672)">
                                <path d="M0,-0.974C0.138,-0.91 0.295,-0.809 0.427,-0.701C0.564,-0.594 0.684,-0.467 0.803,-0.344C0.906,-0.218 0.995,-0.088 1.06,0.052C1.119,0.181 1.236,0.44 1.251,0.547L2.018,-0.089C1.867,-0.346 1.481,-0.74 1.316,-0.866C0.983,-1.134 0.56,-1.408 0.317,-1.521L0,-0.974Z" style="fill:rgb(195,116,45);fill-rule:nonzero;"/>
                            </g>
                        </g>
                    </g>
                </g>
            </g>
        </svg>
      `;
  } else if (sym == 'mouse') {
    html = `
              <svg width="${sz}" height="${sz}" viewBox="0 0 200 200" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
                  <g transform="matrix(1,0,0,1,-500,-300)">
                      <g transform="matrix(9.09451,0,0,9.09451,670.98,392.954)">
                          <g id="ws-5">
                              <path id="mouse" d="M0,0.136C-0.705,-0.412 -2.127,-0.236 -2.867,-0.095C-2.803,-2.905 -7.442,-5.024 -10.299,-2.45L-11.797,-2.233C-11.131,-3.613 -12.9,-3.994 -13.312,-2.346L-15.426,-0.406C-16.451,0.4 -16.105,1.031 -15.189,1.031C-14.876,1.031 -11.897,1.617 -11.472,2.094C-11.535,2.206 -11.852,2.384 -11.773,2.995L-5.978,3.179C-4.286,2.679 -3.368,1.772 -3.023,0.768C-2.195,0.57 -0.921,0.449 -0.497,0.777C-0.434,0.826 -0.369,0.899 -0.369,1.063C-0.369,1.549 -0.767,1.699 -1.744,1.949C-2.445,2.129 -3.24,2.332 -3.749,2.912C-4.156,3.376 -4.309,3.827 -4.202,4.25C-4.05,4.859 -3.429,5.107 -3.359,5.134C-3.312,5.152 -3.264,5.16 -3.216,5.16C-3.052,5.16 -2.897,5.059 -2.837,4.896C-2.758,4.687 -2.864,4.452 -3.074,4.374C-3.131,4.352 -3.371,4.228 -3.415,4.053C-3.452,3.907 -3.354,3.692 -3.139,3.447C-2.796,3.057 -2.159,2.893 -1.542,2.735C-0.658,2.509 0.442,2.227 0.442,1.063C0.442,0.681 0.289,0.36 0,0.136" style="fill:rgb(116,100,91);fill-rule:nonzero;"/>
                          </g>
                      </g>
                  </g>
              </svg>
            `;
  } else if (sym == 'leaf') {
    html = `<img width="${sz}" height="${sz}" src='../assets/img/emo/seedling.png' />`;
  } else {
    html = `
        <svg width="${sz}" height="${sz}" viewBox="0 0 200 200" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
            <g transform="matrix(1,0,0,1,-300,-300)">
                <g transform="matrix(8.59167,0,0,8.59167,432.85,422.626)">
                    <g id="ws-3">
                        <path id="berries" d="M0,-5.356C-0.427,-5.356 -0.825,-5.247 -1.184,-5.07L-1.487,-6.86C-1.18,-7.11 -0.839,-7.331 -0.47,-7.508C0.341,-7.901 1.273,-8.154 2.148,-8.241L2.17,-8.243C2.227,-8.249 2.283,-8.262 2.338,-8.282C2.695,-8.415 2.877,-8.811 2.745,-9.168C2.612,-9.524 2.216,-9.706 1.859,-9.574C0.872,-9.208 -0.018,-8.809 -0.897,-8.288C-1.327,-8.022 -1.751,-7.73 -2.127,-7.365C-2.478,-7.028 -2.813,-6.676 -3.154,-6.309C-3.37,-6.078 -3.566,-5.826 -3.752,-5.566C-3.756,-5.566 -3.759,-5.568 -3.763,-5.568L-5.106,-5.582C-5.308,-6.864 -6.41,-7.847 -7.749,-7.847C-9.233,-7.847 -10.435,-6.645 -10.435,-5.162C-10.435,-3.679 -9.233,-2.476 -7.749,-2.476C-6.304,-2.476 -5.134,-3.62 -5.074,-5.051L-4.184,-4.886C-4.394,-4.515 -4.579,-4.131 -4.719,-3.739C-4.942,-3.129 -5.117,-2.511 -5.27,-1.883C-6.879,-1.753 -8.148,-0.421 -8.148,1.221C-8.148,2.949 -6.748,4.35 -5.019,4.35C-3.291,4.35 -1.89,2.949 -1.89,1.221C-1.89,-0.297 -2.973,-1.562 -4.408,-1.846C-4.278,-2.39 -4.122,-2.933 -3.938,-3.457C-3.647,-4.336 -3.233,-5.136 -2.609,-5.816C-2.452,-5.994 -2.279,-6.162 -2.1,-6.327L-1.724,-4.714C-2.307,-4.221 -2.686,-3.493 -2.686,-2.67C-2.686,-1.187 -1.483,0.016 0,0.016C1.484,0.016 2.686,-1.187 2.686,-2.67C2.686,-4.153 1.484,-5.356 0,-5.356" style="fill:rgb(152,21,49);fill-rule:nonzero;"/>
                    </g>
                </g>
            </g>
        </svg>
      `;
  }
  return mCreateFrom(html);
}
function wsGetMission() {
  let missions = {
    class: [],
    food_only: [],
    food_specific: [],
    size_atMost: [],
    size_arLeast: [],
    weight_AtMost: [],
    weight_AtLeast: [],
    cards_hand: [],
    cards_board: [],
    cards_habitat: [],
    habitat_only: [],
    tuck: [],
    powerColor: [],
  }
  return rChoose(Object.keys(missions));
}
function wsGetPower(colorOrKey, prop) {
  let powers = {
    _child_1_sym: [],
    _child_2_sym: [],
    _child_1_class: [],
    _child_2_class: [],
    _child_1_color: [],
    _child_2_color: [],
    _draw_1_card_deck: [],
    _draw_2_card_return_1: [],
    _draw_2_card_1: [],
    _tuck_1_pick_feeder: [],
    _tuck_1_pick_supply: [],
    _tuck_1_draw_tray: [],
    _tuck_1_draw_deck: [],
    _tuck_1_place: [],
    _food_1_supply: [],
    _food_1_feeder: [],
    _food_2_supply: [],
    _food_2_tray: [],
    _discard_1_child_pick_2_food_feeder: [],
    _discard_1_child_pick_1_food_supply: [],
    _discard_1_child_draw_2_card: [],
    _discard_1_food_draw_1_card: [],
    _discard_1_card_pick_1_food_supply: [],
    _repeat: [],
    _hunt_food_mouse: [],
    _hunt_food_fish: [],
    _hunt_card_sym: [],
    pink_draw_mission_pick_1_food_feeder: [],
    pink_place_child_pick_1_food_feeder: [],
    pink_hunt_successfully_pick_1_food_feeder: [],
    pink_draw_mission_draw_1_card_deck: [],
    pink_place_child_draw_1_card_deck: [],
    pink_hunt_successfully_draw_1_card_deck: [],
    white_draw_2_mission_return_1: [],
    white_collect_fish: [],
    white_collect_mouse: [],
    white_collect_worm: [],
    white_collect_cherries: [],
    white_child_sym: [],
    white_child_color: [],
    white_child_class: [],
    lightblue_feeder: [],
    lightblue_tray: [],
  };
  let list = Object.keys(powers);
  if (isColor(colorOrKey)) return rChoose(list.filter(x => colorOrKey == 'sienna' ? x.startsWith('_') : x.startsWith(colorOrKey)));
  else if (nundef(colorOrKey)) return rChoose(list);
  else if (nundef(prop)) return powers[colorOrKey];
  else return lookup(powers, [colorOrKey, prop]);
}
function wsGetRandomCards(n = 1, deck = null) {
  if (!deck) deck = jsCopy(M.byCollection.tierspiel).map(x => wsGenerateCardInfo(x)); console.log(deck.length);
  let list = rChoose(deck, n);
  return list.length == 1 ? wsItemFromFen(list[0]) : list.map(x => wsItemFromFen(x));
}
function wsGetSymbolFilename(key) {
  let files = {
    cherries: '../assets/games/wingspan/fruit.svg',
    fish: '../assets/games/wingspan/fish.svg',
    forest: '../assets/games/wingspan/forest1.png',
    grain: '../assets/games/wingspan/wheat.svg',
    grassland: '../assets/games/wingspan/grassland2.png',
    mouse: '../assets/games/wingspan/mouse.svg',
    omni: '../assets/games/wingspan/pie3.svg',
    seedling: '../assets/img/emo/seedling.png',
    wetland: '../assets/games/wingspan/wetland.png',
    worm: '../assets/games/wingspan/worm.svg',
  };
  return files[key];
}
function wsGetSymbolInline(key, fz) { return `&nbsp;<span style="vertical-align:middle;line-height:80%;font-size:${fz * 1.5}px;font-family:pictoGame">${String.fromCharCode('0x' + M.superdi[key].ga)}</span>`; }
function wsHabitat(tokens, dtop, sz) {
  for (let i = 0; i < tokens.length; i++) {
    let t = tokens[i];
    if (i == 2) mLinebreak(dtop);
    let d = wsPrintSymbol(dtop, sz, t);
    if (i == 2) mStyle(d, { matop: -sz * 3 / 2 });
  }
}
function wsHowMany(deck, prop, val, op) {
}
function wsItemFromFen(fen) {
  let [key, valueFactor, power, colorPower, sym, colorSym, op] = fen.split('@');
  let o = getDetailedSuperdi(key);
  let item = jsCopy(o);
  let bg = item.colorPower = colorPower;
  let palette = wsGetColorRainbow();
  let fg = item.colorSym = colorSym;
  sym = item.abstract = sym;
  item.power = power;
  valueFactor = item.valueFactor = valueFactor;
  item.op = op;
  item.value = valueFactor * (item.op == '+' ? 1 : item.foodTokens.length);
  return item;
}
function wsOffspringSymbol(dParent, styles = {}) {
  console.log(styles)
  let [w, h] = [styles.h, styles.h];
  console.log(w, h)
  let d = mDom(dParent, { w, h, box: true });//,bg:'orange'}); //w100:true,h100:true,bg:'lime'});
  let fz = styles.h; let hline = fz;
  mIfNotRelative(d);
  let o = M.superdi.big_egg;
  let [fam, sym] = isdef(o.fa6) ? ['fa6', 'fa6'] : isdef(o.fa) ? ['pictoFa', 'fa'] : ['pictoGame', 'ga'];
  let dEgg = mDom(d, { fg: 'grey', family: fam, fz, padding: 0, hline }, { html: String.fromCharCode('0x' + o[sym]) });
  o = M.superdi.paw;
  [fam, sym] = isdef(o.fa6) ? ['fa6', 'fa6'] : isdef(o.fa) ? ['pictoFa', 'fa'] : ['pictoGame', 'ga'];
  let dPaw = mDom(d, { w100: true, fg: 'black', family: fam, fz: 8, hline }, { html: String.fromCharCode('0x' + o[sym]) });
  mCenterFlex(dPaw)
  mPlace(dPaw, 'tc')
}
async function wsOnclickCard(table, item, items) { console.log('click', item) }
function wsPowerText(item, d, styles = {}) {
  mClear(d)
  let key = item.power; if (key.startsWith('_')) key = 'sienna' + key;
  let parts = key.split('_'); //console.log(parts)
  let s = '';
  let color = parts[0];
  if (color == 'sienna') s += 'WHEN ACTIVATED: ';
  else if (color == 'pink') s += 'ONCE BETWEEN TURNS: ';
  else if (color == 'white') s += 'WHEN PLAYED: ';
  else if (color == 'lightblue') s += 'ROUND END: ';
  copyKeys({ bg: color }, styles); mStyle(d, { bg: color, fg: 'contrast' });
  let what = parts[1];
  let verb = '';
  let n = Number(parts[2]);
  if (color == 'sienna') {
    if (what == 'child') {
      verb = 'place';
      s += `${capitalize(verb)} ${n} ${pluralOf('child', n)} on any`;
      let prop = parts[3];
      switch (prop) {
        case 'color':
          s += ` ${n == 1 ? 'card' : '2 cards'} with color <span style="border-radius:${item.fz}px;padding-left:${item.fz / 2}px;padding-right:${item.fz / 2}px;background-color:white;color:${colorFrom(item.colorSym)}">${wsGetColorRainbowText(item.colorSym)}</span>.`; break;
        case 'class':
          s += ` ${item.class}.`; break;
        case 'sym':
        default:
          s += ` ${n == 1 ? 'card' : '2 cards'} with symbol ${wsGetSymbolInline(item.abstract, item.fz)}.`;
      }
      if (n == 2) s += ` Other players may place 1 ${what}.`
    } else if (what == 'draw') {
      verb = 'draw';
      what = parts[3];
      s += `${capitalize(verb)} ${n} ${pluralOf(what, n)}`;
      let prop = parts[4];
      switch (prop) {
        case 'tray':
        case 'deck': s += ` from ${prop}.`; break;
        case 'return': s += `, return 1 at the end of action.`; break;
        case '1': s += ` Other players may draw 1.`; break;
        default: s += '.'; break;
      }
    } else if (what == 'tuck') {
      verb = what;
      what = parts[3];
      s += `${capitalize(verb)} ${n} ${pluralOf('card', n)}`;
      let prop = parts[3];
      switch (prop) {
        case 'pick': s += ` to ${prop} 1 food from ${parts[4]}.`; break;
        case 'draw': s += ` to ${prop} 1 card from ${parts[4]}.`; break;
        case 'place': s += ` to ${prop} 1 child on any card.`; break;
        default:
      }
    } else if (what == 'food') {
      verb = 'pick';
      s += `${capitalize(verb)} ${n} ${what} from ${parts[3]}.`;
      if (n == 2) s += ` Other players ${verb} 1 ${what}.`
    } else if (what == 'all') {
      s += `All players ${parts[2]} ${parts[3]} ${what}.`;
    } else if (what == 'discard') {
      let n1 = Number(parts[5])
      s += `You may ${what} ${n} ${parts[3]} to ${parts[4]}`;
      if (parts.length > 5) {
        let n1 = Number(parts[5]);
        s += ` ${n1} ${pluralOf(parts[6], n1)}`;
        s += parts.length > 7 ? ` from ${parts[7]}.` : '.';
      } else s += '.';
    } else if (what == 'repeat') {
      s += `Repeat another brown power on this habitat.`;
    } else if (what == 'hunt') {
      let verb = what; what = parts[2];
      if (what == 'food') {
        s += `Roll dice in feeder. If there is a ${parts[3]}, keep it.`;
      } else if (what == 'card') {
        s += `Draw a card. `;
        switch (parts[3]) {
          case 'sym':
          default: s += `If it has symbol ${wsGetSymbolInline(item.abstract, item.fz)}, tuck it.`; break;
        }
      }
    }
  }
  if (color == 'pink') {
    let [verb1, what1, verb2, n, what2, from] = parts.slice(1);
    s += `When another player ${verb1}s ${what1}, ${verb2} ${n} ${what2}`;
    s += isdef(from) ? ` from ${from}.` : '.';
  }
  if (color == 'white') {
    if (what == 'draw') {
      verb = 'draw';
      what = parts[3];
      s += `${capitalize(verb)} ${n} ${pluralOf(what, n)}`;
      let prop = parts[4];
      switch (prop) {
        case 'tray':
        case 'deck': s += ` from ${prop}.`; break;
        case 'return': s += `, return 1`; s += what == 'card' ? ` at the end of action.` : '.'; break;
        case '1': s += ` Other players may draw 1.`; break;
        default: s += '.'; break;
      }
    } else if (what == 'collect') {
      s += `Collect all ${parts[2]} from feeder.`
    } else if (what == 'child') {
      s += `Place 1 child on each of your cards with `;
      what = parts[2];
      switch (what) {
        case 'sym': s += `symbol ${wsGetSymbolInline(item.abstract, item.fz)}.`; break;
        case 'class': s += `class ${item.class}.`; break;
        case 'color': s += `color <span style="color:${colorFrom(item.colorSym)}">${wsGetColorRainbowText(item.colorSym)}</span>.`; break;
      }
    }
  }
  if (color == 'lightblue') {
    if (what == 'feeder') s += `Collect all food in feeder.`
    else if (what == 'tray') s += `Collect a card from tray.`
  }
  s = replaceAll(s, 'child', wsGetChildInline(item));
  d.innerHTML = s;
  return d;
}
async function wsPreAction(table, items) {
  let [fen, me] = [table.fen, getUname()]
  let [phase, stage, round, pl, plorder, turn] = [fen.phase, fen.stage, fen.round, table.players[me], table.plorder, table.turn];
  console.log()
}
function wsPresent(table) {
  presentStandardBGA();
  return;
  let fen = table.fen;
  let me = getUname();
  let pl = table.players[me];
  let d = mBy('dTable');
  d.style = '';
  d.className = '';
  mStyle(d, { hmin: 500, w: '90%', margin: 20 });
  d.innerHTML = ' '; mCenterFlex(d)
  let dCards = mDom(d, { gap: 8 }); mCenterFlex(dCards);
  let items = [];
  for (const fencard of pl.cards) {
    let ocard = wsItemFromFen(fencard);
    wsShowCardItem(ocard, dCards, .5);
    items.push(ocard);
  }
  mLinebreak(d, 25)
  let [w, h] = [1467, 1235].map(x => x * .67);
  let bg = U.color;
  let db = mDom(d, { w, h, bg, padding: 10, position: 'relative' });
  let da = mDom(db, { 'transform-origin': 'center', transform: 'rotate( -.3deg )', position: 'relative', w, h });
  let ibg = mDom(da, { position: 'absolute', left: 0, top: 0, w, h }, { tag: 'img', src: '../ode/wsboard1.jpg' });
  let dBoard = mDom(db, { position: 'absolute', left: -2, top: 0, w: w - 18, h: h - 12, wbox: true, border: `20px ${bg} solid` });
  let gap = 12;
  let grid = mGrid(3, 5, dBoard, { paleft: gap / 2, patop: gap, w: w - 52 }); //,position:'absolute'});
  let sym = ['food', 'child', 'card'];
  let n = [1, 1, 2, 2, 3];
  let cost = [0, 1, 1, 2, 2];
  let addon = [0, 1, 0, 1, 0];
  let list = wsGetRandomCards(15, fen.deck);
  for (const i of range(3)) {
    for (const j of range(5)) {
      let d = mDom(grid, { w: 172, h: 250, bg: rColor(), mabottom: 20 }); //,{html:'card'});
      let item = wsShowCardItem(list[i + 3 * j], d, .5)
    }
  }
  return items;
}
function wsPrintSymbol(dParent, sz, key) {
  let files = {
    cherries: '../assets/games/wingspan/fruit.svg',
    fish: '../assets/games/wingspan/fish.svg',
    forest: '../assets/games/wingspan/forest1.png',
    grain: '../assets/games/wingspan/wheat.svg',
    grassland: '../assets/games/wingspan/grassland2.png',
    mouse: '../assets/games/wingspan/mouse.svg',
    omni: '../assets/games/wingspan/pie3.svg',
    seedling: '../assets/img/emo/seedling.png',
    wetland: '../assets/games/wingspan/wetland.png',
    worm: '../assets/games/wingspan/worm.svg',
  };
  let keys = Object.keys(files);
  let styles = { w: sz, h: sz, };
  if (['wetland', 'grassland', 'forest'].includes(key)) styles['clip-path'] = PolyClips.diamond;
  if (key == 'wetland') styles.bg = 'lightblue';
  else if (key == 'grassland') styles.bg = 'goldenrod';
  else if (key == 'forest') styles.bg = 'emerald';
  let src = valf(files[key], key == 'food' ? files[rChoose(keys)] : null);
  if (src) return mDom(dParent, styles, { tag: 'img', width: sz, height: sz, src: files[valf(key, rChoose(keys))] });
  let o = M.superdi[key];
  return showim2(key, dParent, styles);
}
function wsSetup(table) {
  let fen = {};
  fen.deck = jsCopy(M.byCollection.tierspiel).map(x => wsGenerateCardInfo(x));
  arrShuffle(fen.deck);
  for (const name in table.players) {
    let pl = table.players[name];
    pl.score = 0;
    pl.cards = deckDeal(fen.deck, 5);
    pl.missions = [];
    pl.offsprings = 0;
    wsGetFoodlist().map(x => pl[x] = 0);
    pl.forest = [];
    pl.grassland = [];
    pl.wetland = [];
  }
  fen.round = 0;
  fen.phase = 'init';
  fen.stage = 'pick_cards';
  table.plorder = jsCopy(table.playerNames);
  table.turn = jsCopy(table.playerNames);
  return fen;
}
function wsShowCardItem(item, d, fa) {
  let [w, h, sztop, sz, gap, fz] = [340, 500, 100, 30, 8, 16].map(x => x * fa);
  item.fz = fz;
  let [card, dCard] = wsCard(d, w, h);
  let dtop = wsTopLeft(dCard, sztop, card.rounding);
  addKeys(card, item);
  let [bg, fg] = [item.colorPower, item.colorSym];
  wsHabitat(item.habTokens, dtop, sz * 1.1); mLinebreak(dtop, sz / 5);
  wsFood(item.foodTokens, item.op, dtop, sz * .8);
  wsTitle(item, dCard, sztop, fz, gap);
  let [szPic, yPic] = [h / 2, sztop + gap]
  let d1 = showim2(item.key, dCard, { rounding: 12, w: szPic, h: szPic }, { prefer: 'photo' });
  mPlace(d1, 'tr', gap, yPic);
  let leftBorderOfPic = w - (szPic + gap);
  let dleft = mDom(dCard, { w: leftBorderOfPic, h: szPic }); mPlace(dleft, 'tl', gap / 2, sztop + gap);
  mCenterCenterFlex(dleft);
  let dval = mDom(dleft, { fg, w: sz * 1.2, align: 'center', fz: fz * 1.8, weight: 'bold' }, { html: item.value });
  mLinebreak(dleft, 2 * gap)
  let szSym = sz * 1.5;
  let a = showim2(item.abstract, dleft, { w: szSym, h: szSym, fg });
  mLinebreak(dleft, 3 * gap)
  let dPlaetze = item.live.dPlaetze = showPlaetze(dleft, item, gap * 2);
  item.dpower = mDom(dCard, { fz: fz * 1.2, padding: gap, matop: sztop + szPic + gap * 3, w100: true, bg, fg: 'contrast', box: true });
  wsPowerText(item, item.dpower, { fz: item.fz })
  let dinfo = mDom(dCard, { fz, hpadding: gap, box: true, w100: true });
  mPlace(dinfo, 'bl'); mFlexLine(dinfo, 'space-between');
  mDom(dinfo, {}, { html: item.class });
  mDom(dinfo, {}, { html: item.olifespan.text });
  mDom(dinfo, {}, { html: item.osize.text });
  return item;
}
function wsShowTitle(dCard, title, fz, szlt) {
  let margin = szlt / 12;
  let dtitle = mDom(dCard, { fz, margin, display: 'inline', weight: 'bold' }, { html: title });
  mPlace(dtitle, 'tl', szlt + margin / 2, 0); //, 0, yTitle);
}
function wsStats(table) {
  let [me, players] = [getUname(), table.players];
  let style = { patop: 8, mabottom: 20, bg: 'beige', fg: 'contrast' };
  let player_stat_items = uiTypePlayerStats(table, me, 'dStats', 'colflex', style)
  for (const plname in players) {
    let pl = players[plname];
    let item = player_stat_items[plname];
    if (pl.playmode == 'bot') { mStyle(item.img, { rounding: 0 }); }
    let d = iDiv(item);
    mStyle(d, { wmin: 200, padding: 12 })
    mCenterFlex(d); mLinebreak(d); mIfNotRelative(d);
    let d1 = mDom(d); mCenterFlex(d1);
    wsGetFoodlist().map(x => playerStatCount(wsGetSymbolFilename(x), pl[x], d1));
    mLinebreak(d, 10);
    let d2 = mDom(d); mCenterFlex(d2);
    playerStatCount('star', pl.score, d2, null, { useSymbol: true }); //, {}, {id:`stat_${plname}_score`});
    playerStatCount('hand_with_fingers_splayed', pl.cards.length, d2, null, { useSymbol: true });
    playerStatCount(wsOffspringSymbol, pl.offsprings, d2);
    if (table.turn.includes(plname)) { mDom(d, { position: 'absolute', left: -3, top: 0 }, { html: getWaitingHtml() }); }
  }
}
function wsTitle(o, dCard, sztop, fz, gap) {
  let dtitle = mDom(dCard, { paleft: gap, wmax: sztop * 1.5 }); mPlace(dtitle, 'tl', sztop, gap)
  mDom(dtitle, { fz: fz * 1.1, weight: 'bold' }, { html: fromNormalized(o.friendly) });
  mDom(dtitle, { fz, 'font-style': 'italic' }, { html: o.species });
}
function wsTopLeft(dCard, sztop, rounding) {
  let dtop = mDom(dCard, { w: sztop, h: sztop, bg: '#ccc' });
  mPlace(dtop, 'tl');
  dtop.style.borderTopLeftRadius = dtop.style.borderBottomRightRadius = `${rounding}px`;
  mCenterCenterFlex(dtop);
  return dtop;
}
function yearsToReadable(n) {
  let di = { y: 1, m: 12, w: 52, d: 365, h: 365 * 24 };
  if (n > 1) return n.toFixed(1) + ' years';
  if (n * 12 > 1) return (n * 12).toFixed(1) + ' months';
  if (n * 52 > 1) return (n * 52).toFixed(1) + ' weeks';
  if (n * 365 > 1) return (n * 365).toFixed(1) + ' days';
  return (n * 365 * 24).toFixed(1) + ' hours';
}
function zInno(key, dParent) {
  let info = cinno[key]; info.key = key;
  console.log(info)
  let col = ColorDict[InnoDict[info.color]].c;
  info.c = colorDarker(col, info.color == 'yellow' ? .3 : .6);
  let bgCard = info.c;
  let item = { key: key, info: info };
  let d = item.div = mDom(null, { position: 'relative' });
  let color = InnoDict[info.type].fg;
  let bg = colorDarker(color, .5);
  let fg = colorLighter(color, .5);
  let dTitle = mDom(d, { margin: 5, bg: 'transparent', fg: 'white' });
  item.title = zText(key.toUpperCase(), dTitle, { display: 'inline', paleft: 10, paright: 10, weight: 'bold' });
  item.type = zInnoSymbol(info.type, dTitle, 20, 2, 0, 0, true);
  let dMain = item.dMain = mDom(d, { align: 'left' });
  let dogmas = [];
  for (const dog of info.dogmas) {
    let x = convertDogmaText(dog);
    dogmas.push(zText(x, dMain, { mabottom: 8 }));
  }
  item.dogmas = dogmas;
  let resources = [];
  for (const sym of info.resources) {
    let t =
      sym == 'None' ? zText(info.age.toString(), d, { margin: 5, w: 40, fz: 20, align: 'center', fg: 'black', bg: 'white', rounding: '50%', display: 'inline-block' }, 40, true)
        : sym == 'echo' ? zText(info.echo[0], d, { fz: 20, fg: 'white', bg: 'black' })
          : zInnoSymbol(sym, d); //zPic(InnoDict[sym].k, d, { margin: 5, padding: 4, w: 40, h: 40, bg: InnoDict[sym].bg, rounding: '10%' });
    resources.push(t);
  }
  item.resources = resources;
  posTR(dTitle);
  posTL(resources[0].div);
  posBL(resources[1].div);
  posBC(resources[2].div);
  posBR(resources[3].div);
  mStyleX(d, { margin: 4, w: 420, h: 220, padding: 50, rounding: 8, 'box-sizing': 'border-box', bg: bgCard });
  let dims = idealFontsizeX(dMain, 350, 120, 18, 8);
  item.dimsMain = dims;
  mAppend(d, dMain);
  if (isdef(dParent)) mAppend(dParent, d);
  return item;
}
function zInnoAge() { }
function zInnoRandom(n = 1) {
  return choose(Object.keys(cinno), n);
}
function zInnoSymbol(sym, d, sz = 40, margin = 5, padding = 4, rounding = '10%', reverseColors = false) {
  let color = InnoDict[sym].fg;
  let fg, bg;
  if (reverseColors) {
    fg = colorDarker(color, .5);
    bg = colorLighter(color, .5);
  } else {
    bg = colorDarker(InnoDict[sym].bg, .2);
    fg = InnoDict[sym].fg;
  }
  return zPic(InnoDict[sym].k, d, { w: sz, h: sz, margin: margin, padding: padding, bg: bg, fg: fg, rounding: rounding });
}
function zPic(itemInfoKey, dParent, styles = {}) {
  let [item, info, key] = detectItemInfoKey(itemInfoKey);
  let outerStyles = isdef(styles) ? jsCopy(styles) : {};
  outerStyles.display = 'inline-block';
  let family = info.family;
  let wInfo = info.w;
  let hInfo = info.h; if (info.type == 'icon' && hInfo == 133) hInfo = 110;
  info.fz = 100;
  let innerStyles = { family: family };
  let [padw, padh] = isdef(styles.padding) ? [styles.padding, styles.padding] : [0, 0];
  let dOuter = isdef(dParent) ? mDom(dParent) : mDom();
  let d = mDom(dOuter);
  d.innerHTML = info.text;
  let wdes, hdes, fzdes, wreal, hreal, fzreal, f;
  if (isdef(styles.w) && isdef(styles.h) && isdef(styles.fz)) {
    [wdes, hdes, fzdes] = [styles.w, styles.h, styles.fz];
    let fw = wdes / wInfo;
    let fh = hdes / hInfo;
    let ffz = fzdes / info.fz;
    f = Math.min(fw, fh, ffz);
  } else if (isdef(styles.w) && isdef(styles.h)) {
    [wdes, hdes] = [styles.w, styles.h];
    let fw = wdes / wInfo;
    let fh = hdes / hInfo;
    f = Math.min(fw, fh);
  } else if (isdef(styles.w) && isdef(styles.fz)) {
    [wdes, fzdes] = [styles.w, styles.fz];
    let fw = wdes / wInfo;
    let ffz = fzdes / info.fz;
    f = Math.min(fw, ffz);
  } else if (isdef(styles.h) && isdef(styles.fz)) {
    [hdes, fzdes] = [styles.h, styles.fz];
    let fh = hdes / hInfo;
    let ffz = fzdes / info.fz;
    f = Math.min(fh, ffz);
  } else if (isdef(styles.h)) {
    hdes = styles.h;
    f = hdes / hInfo;
  } else if (isdef(styles.w)) {
    wdes = styles.w;
    f = wdes / wInfo;
  } else {
    mStyleX(d, innerStyles);
    mStyleX(dOuter, outerStyles);
    return dOuter;
  }
  fzreal = Math.floor(f * info.fz);
  wreal = Math.round(f * wInfo);
  hreal = Math.round(f * hInfo);
  wdes = Math.round(wdes);
  hdes = Math.round(hdes);
  padw += isdef(styles.w) ? (wdes - wreal) / 2 : 0;
  padh += isdef(styles.h) ? (hdes - hreal) / 2 : 0;
  if (!(padw >= 0 && padh >= 0)) {
    console.log(info)
    console.log('\nstyles.w', styles.w, '\nstyles.h', styles.h, '\nstyles.fz', styles.fz, '\nstyles.padding', styles.padding, '\nwInfo', wInfo, '\nhInfo', hInfo, '\nfzreal', fzreal, '\nwreal', wreal, '\nhreal', hreal, '\npadw', padw, '\npadh', padh);
  }
  innerStyles.fz = fzreal;
  innerStyles.weight = 900;
  innerStyles.w = wreal;
  innerStyles.h = hreal;
  mStyleX(d, innerStyles);
  outerStyles.padding = '' + padh + 'px ' + padw + 'px';
  outerStyles.w = wreal;
  outerStyles.h = hreal;
  mStyleX(dOuter, outerStyles);
  return {
    info: info, key: info.key, div: dOuter, outerDims: { w: wdes, h: hdes, hpadding: padh, wpadding: padw },
    innerDims: { w: wreal, h: hreal, fz: fzreal }, bg: dOuter.style.backgroundColor, fg: dOuter.style.color
  };
}

