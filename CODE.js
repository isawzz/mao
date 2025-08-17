
//*************************** vio93 ************************ */
function setPresent(table, dParent) {
}
function showUserImageWithName(name, d, vert = true) {
	// let styles = { display: 'flex', 'flex-direction': 'column', align: 'center', margin: 5, padding: 5, rounding: 10, bg: '#00000050' };
	// if (name == 'bot') {
	// 	styles['border-color'] = 'red';
	// }
	// else {
	// 	let h = Math.random() * 360;
	// 	let s = 0.5 + Math.random() * 0.5;
	// 	let l = 0.3 + Math.random() * 0.4;
	// 	let cFinal = colorFromHsl(h, s, l);
	// 	styles['border-color'] = cFinal; //'red'; //pl.color;
	// }
	// let d = mDom(dOuter, styles, {  }); //console.log('d', d, styles);
	// let img = showUserImage(name, d, 40); mStyle(img, { box: true });
	// mLinebreak(d);
	// mDom(d, { padding: 0, margin: 0, fz: 14, display: 'flex', 'flex-direction': 'column', align: 'center' }, { html: name });
	// //console.log('userImageWithName', name, d);
	// return d;

	let img = showUserImage(name, d, 24);
	mStyle(img, { box: true });
	//if (vert) mLinebreak(d);
	mDom(d, { padding: 0, margin: 0, fz: 14, align: 'center' }, { html: name });
	// mDom(d, { padding: 0, margin: 0, fz: 14, display: 'flex', 'flex-direction': 'column', align: 'center' }, { html: name });

}
function setgame(table, items) {
  let _table = table;
  let _items = items;
  function setup(table) {
    _table = table;
    let fen = {};
    for (const name in table.players) {
      let pl = table.players[name];
      pl.score = 0;
    }
    let nums = allNumbers(table.options.grid_size);
    fen.numCards = nums[0] * nums[1]; console.log('nums', nums, table.options.deck_size, fen.numCards);
    fen.cols = nums[1];
    fen.deck = setCreateDeck(table.options.deck_size);
    fen.cards = deckDeal(fen.deck, fen.numCards);
    table.plorder = jsCopy(table.playerNames);
    table.turn = jsCopy(table.playerNames);
    return fen;
  }
  function prepareTable(table) {
    _table = table;
    setCssVar('--velvet-color', U.color);
    setCssVar('--fz-global', '20px');
    setCssVar('--fz-button', '25px');
    d = mDom('dMain', { rounding: 20, wmax: 800, hmin: 700, align: 'center', margin: 'auto', matop: 25 }, { className: 'velvet' });
    let d0 = mDom(d, flexCenterTop(), { id: 'dTitle' });
    let d2 = mDom(d, flexCenterCenter(), { id: 'dStats' });
    let d3 = mDom(d, flexCenterCenter(), { id: 'dTable' });
    showTitleGame(table, d0);
  }
  function stats(table) {
    _table = table;
    let [me, players] = [UGetName(), table.players];
    let style = { patop: 8, mabottom: 12, wmin: 80, hmin: 90, bg: 'beige', fg: 'contrast' };
    let player_stat_items = uiTypePlayerStats(table, me, 'dStats', 'rowflex', style);
    for (const plname in players) {
      let pl = players[plname];
      let item = player_stat_items[plname];
      if (pl.playmode == 'bot') { mStyle(item.img, { rounding: 0 }); }
      let d = iDiv(item);
      mLinebreak(d);
      playerStatCount('star', pl.score, d);
    }
  }
  function present(table) {
    _table = table;
    const colors = { red: '#e74c3c', green: '#27ae60', purple: 'indigo' };
    setLoadPatterns('dMain', colors);
    let fen = table.fen;
    let d = mDom('dTable');
    let d1 = mDom(d, { padding: 12 }, { className: 'flexRCbox', id: 'dTableButtons' });
    let d2 = mDom(d, { padding: 20 }, { className: 'flexRCbox', id: 'dTableCards' });
    let rows = Math.ceil(fen.cards.length / fen.cols);
    let gap = 10;
    let sz = rows <= 4 ? 80 : rows == 5 ? 70 : rows == 6 ? 68 : rows == 7 ? 65 : rows == 8 ? 62 : 60;
    sz *= 1.25;
    let dBoard = mGrid(rows, fen.cols, d2, { gap });
    let items = _items = [];
    for (const c of fen.cards) {
      let dc = setDrawCard(c, dBoard, colors, sz);
      let item = mItem({ div: dc }, { key: c });
      items.push(item);
    }
    let oset = setFindOneSet(items);
    return items;
  }
  function prepareCards(fen, d2, colors) {
    let rows = Math.ceil(fen.cards.length / fen.cols);
    let gap = 10;
    let scale = getRect(d2).w / 800;
    let f = n => n >= 8 ? 80 : Math.round(1.25 * n * n - 20.25 * n + 160.75); //x^2 - 20.25x + 160.75 \
    let hCard = f(rows) * scale;
    for (const n of range(1, 10)) { console.log('row', n, 'hCard', f(n)); }
    let dBoard = mGrid(rows, fen.cols, d2, { gap, mabottom: 20 });
    let items = [];
    for (const c of fen.cards) {
      let dc = setDrawCard(c, dBoard, colors, hCard);
      let item = mItem({ div: dc }, { key: c });
      items.push(item);
    }
    let oset = setFindOneSet(items);
    return items;
  }
  function activate() {
    let items = _items;
    let table = _table;
    if (!isMyTurn(table)) { return; } else animatedTitle();
    for (const item of items) {
      let d = iDiv(item);
      mStyle(d, { cursor: 'pointer' });
      d.onclick = ev => onclickCard(table, item, items);
    }
    let d1 = mBy('dTableButtons');
    mClass(d1, 'button_container');
    mStyle(d1, { padding: 20, justifyContent: 'space-between' })
    mDom(d1, { w: 100 }, { tag: 'button', id: 'bNoSet', html: 'No Set', onclick: onclickNoSet });
    mDom(d1, { w: 100 }, { tag: 'button', html: 'Cheat', onclick: onclickCheat });
    mDom(d1, { w: 100 }, { tag: 'button', id: 'bHint', html: 'Hint', onclick: onclickHint });
    if (isEmpty(table.fen.cards)) return gameoverScore(table);
    let bots = table.turn.filter(name => table.players[name].playmode == 'bot');
    if (bots.length > 0) {
      let bot = rChoose(bots);
      botMove(bot, table, items);
    }
  }
  async function botMove(name, table, items) {
    let oset = setFindOneSet(items);
    let ms = rChoose(range(5000, 10000, 500));
    if (!oset) ms += 2000;
    TO.bot = setTimeout(async () => {
      let selitems = items.filter(x => x.isSelected);
      for (const item of selitems) toggleItemSelection(item);
      if (!oset) await onclickNoSet(name, table, items);
      else {
        if (name == UGetName()) for (const item of oset.items) toggleItemSelection(item);
        TO.bot1 = setTimeout(async () => await evalMove(name, table, oset.keys), 1000);
      }
    }, rNumber(ms, ms + 2000));
  }
  function setCheckIfSet(keys) {
    let arr = makeArrayWithParts(keys);
    let isSet = arr.every(x => arrAllSameOrDifferent(x));
    return isSet;
  }
  function setCreateDeck(num) {
    let deck = [];
    ['red', 'purple', 'green'].forEach(color => {
      ['diamond', 'squiggle', 'oval'].forEach(shape => {
        [1, 2, 3].forEach(num => {
          ['solid', 'striped', 'open'].forEach(fill => {
            deck.push(`${color}_${shape}_${num}_${fill}`);
          });
        });
      });
    });
    arrShuffle(deck);
    if (isdef(num)) deck = deck.slice(0, num);
    return deck;
  }
  function setDrawCard(card, dParent, colors, sz = 100) {
    const paths = {
      diamond: "M25 0 L50 50 L25 100 L0 50 Z",
      squiggle: "M38.4,63.4c2,16.1,11,19.9,10.6,28.3c1,9.2-21.1,12.2-33.4,3.8s-15.8-21.2-9.3-38c3.7-7.5,4.9-14,4.8-20 c0-16.1-11-19.9-10.6-28.3C1,0.1,21.6-3,33.9,5.5s15.8,21.2,9.3,38C40.4,50.6,38.5,57.4,38.4,63.4z",
      oval: "M25,95C14.2,95,5.5,85.2,5.5,80V20C5.5,13.2,14.2,5.2,25,5.2S44.5,13.2,44.5,20v60 C44.5,85.2,35.8,95,25,95z"
    }
    let [color, shape, num, fill] = card.split('_');
    var attr = {
      d: paths[shape],
      fill: fill == 'striped' ? `url(#striped-${color})` : fill == 'solid' ? colors[color] : 'none',
      stroke: colors[color],
      'stroke-width': 4,
    };
    let h = sz, w = sz / .65;
    let ws = w / 4;
    let hs = 2 * ws;
    let d0 = mDom(dParent, { display: 'flex', w, h, bg: 'white', rounding: 10 });
    mStyle(d0, { justifyContent: 'center', 'align-items': 'center', gap: 6 })
    let shapeSvg = `<svg viewbox="-2 -2 54 104">` + makeSVG("path", attr) + '</svg>';
    for (const i of range(num)) {
      let d1 = mDom(d0, { h: hs, w: ws }, { html: shapeSvg });
    }
    return d0;
  }
  function setFindAllSets(items) {
    let result = [];
    for (var x = 0; x < items.length; x++) {
      for (var y = x + 1; y < items.length; y++) {
        for (var z = y + 1; z < items.length; z++) {
          assertion(items[x] != items[y], `WTF!?!?!?! ${items[x].key} ${items[y].key}`)
          let list = [items[x], items[y], items[z]];
          let keys = list.map(x => x.key);
          if (setCheckIfSet(keys)) result.push(list);
        }
      }
    }
    if (isEmpty(result)) console.log('no set!')
    return result;
  }
  function setFindOneSet(items) {
    for (var x = 0; x < items.length; x++) {
      for (var y = x + 1; y < items.length; y++) {
        for (var z = y + 1; z < items.length; z++) {
          assertion(items[x] != items[y], `WTF!?!?!?! ${items[x].key} ${items[y].key}`)
          let list = [items[x], items[y], items[z]];
          let keys = list.map(x => x.key);
          if (setCheckIfSet(keys)) return { items: list, keys };
        }
      }
    }
    return null;
  }
  function setLoadPatterns(dParent, colors) {
    dParent = toElem(dParent);
    let id = "setpatterns";
    if (isdef(mBy(id))) { return; }
    mLinebreak(dParent);
    let html = `
      <div style="max-width:50%">
      <svg style="display:hidden;" id="setpatterns" width="0" height="0">
        <!--  Define the patterns for the different fill colors  -->
        <pattern id="striped-red" patternUnits="userSpaceOnUse" width="4" height="4">
          <path d="M-1,1 H5" style="stroke:${colors.red}; stroke-width:1" />
        </pattern>
        <pattern id="striped-green" patternUnits="userSpaceOnUse" width="4" height="4">
          <path d="M-1,1 H5" style="stroke:${colors.green}; stroke-width:1" />
        </pattern>
        <pattern id="striped-purple" patternUnits="userSpaceOnUse" width="4" height="4">
          <path d="M-1,1 H5" style="stroke:${colors.purple}; stroke-width:1" />
        </pattern>
      </svg>
      </div>
      `;
    let el = mCreateFrom(html);
    mAppend(dParent, el)
  }
  async function onclickCard(table, item, items) {
    toggleItemSelection(item);
    let selitems = items.filter(x => x.isSelected);
    let [keys, m] = [selitems.map(x => x.key), selitems.length];
    if (m == 3) {
      await evalMove(getUname(), table, keys);
    }
  }
  async function onclickHint() {
    let table = _table;
    let items = _items;
    let oset = setFindOneSet(items);
    let bHint = mBy('bHint');
    disableButton('bHint');
    if (!oset) {
      ANIM.button = scaleAnimation('bNoSet');
    } else {
      let item = rChoose(oset.items);
      await onclickCard(table, item, items);
    }
  }
  async function onclickCheat() {
    let table = _table;
    let items = _items;
    let oset = setFindOneSet(items);
    let bHint = mBy('bHint');
    disableButton('bHint');
    if (!oset) {
      ANIM.button = scaleAnimation('bNoSet');
    } else {
      let candidates = rChoose(oset.items, 2);
      for (const item of candidates) await onclickCard(table, item, items);
    }
  }
  async function onclickNoSet() {
    let name = getUname();
    let table = _table;
    let items = _items;
    let success = !setFindOneSet(items);
    let newTable = jsCopy(table);
    if (success) {
      let fen = newTable.fen;
      let newCards = deckDeal(fen.deck, 1);
      if (!isEmpty(newCards)) fen.cards.push(newCards[0]); else return await gameoverScore(name, newTable, 1);
    }
    await setSendMove(name, newTable, success, 'No Set');
  }
  async function evalMove(name, table, keys) {
    let success = setCheckIfSet(keys);
    let newTable = jsCopy(table);
    if (success) {
      let fen = newTable.fen;
      let toomany = Math.max(0, fen.cards.length - fen.numCards);
      let need = Math.max(0, 3 - toomany);
      let newCards = deckDeal(fen.deck, need);
      for (let i = 0; i < 3; i++) if (i < newCards.length) arrReplace1(fen.cards, keys[i], newCards[i]); else removeInPlace(fen.cards, keys[i]);
    }
    await setSendMove(name, newTable, success, keys.join(', '));
  }
  async function gameoverScore(name, newTable, change = 0) {
    newTable.players[name].score += change;
    let step = newTable.step;
    newTable.step += 1;
    newTable.winners = getPlayersWithMaxScore(newTable);
    newTable.status = 'over';
    newTable.turn = [];
    let res = await tableSaveRace(newTable, { step, name, change: 0, prop: 'score' });
  }
  async function setSendMove(name, newTable, success, lastMove) {
    clearEvents();
    mShield('dTable', { bg: 'transparent' });
    let step = newTable.step;
    let change = success ? 1 : -1;
    if (success) { newTable.step += 1; newTable.players[name].score += change; newTable.lastMove = lastMove; }
    let res = await tableSaveRace(newTable, { step, name, change, prop: 'score', success, lastMove });
    console.log(res.table.step, res.table.players[name].score, res.message);
    assertion(isList(res.table.fen.deck), `tableSaveRace ERROR: ${res.table.fen}`);
  }
  return {
    setup, prepareTable, stats, prepareCards, present, activate,
    get table() { return _table; },
    get items() { return _items; },
  };
}

function makeSVG(tag, attrs) {
  var el = "<" + tag;
  for (var k in attrs)    el += " " + k + "=\"" + attrs[k] + "\"";
  el += ' style="color:red;" ';
  return el + "/>";
}

function makeCardSVG(color = 'red') {
	return `
    <svg viewBox="-2 -2 54 104" xmlns="http://www.w3.org/2000/svg" style="color: ${color};">
      <use href="#squiggle" />
    </svg>
  `;
}
function makeCardSVG(cssClass) {
      return `
        <svg viewBox="-2 -2 54 104"  xmlns="http://www.w3.org/2000/svg">
          <use href="#squiggle" class="card-shape ${cssClass}" />
        </svg>
      `;
    }

function setDrawCard(card, dParent, colors, sz = 100) {

	let [color, shape, num, fill] = card.split('_');
	let h = sz, w = sz / .65;
	let ws = w / 4;
	let hs = 2 * ws;
	let d0 = mDom(dParent, { display: 'flex', w, h, bg: 'white', rounding: 10 });
	mStyle(d0, { justifyContent: 'center', 'align-items': 'center', gap: 6 })
	for (const i of range(num)) {
		let d1 = mDom(d0, { h: hs, w: ws }, { html: makeCardSVG('red-striped',color) });
		//break;

	}
	return d0;
}




function prepareCards(fen, d2, colors) {
	let rows = Math.ceil(fen.cards.length / fen.cols);
	let gap = 10;
	console.log(getRectInt(d2));

	//let { w, h } = calcCardSize(rows, fen.cols, d2.w, , 1.25);

	let scale = getRect(d2).w / 800;
	let f = n => n >= 8 ? 80 : Math.round(1.25 * n * n - 20.25 * n + 160.75); //x^2 - 20.25x + 160.75 \
	let hCard = f(rows) * scale; //100-(8-rows)*5; //800/(rows*2);
	for (const n of range(1, 10)) { console.log('row', n, 'hCard', f(n)); }
	// let ratio1 = rows <= 4 ? 8 : rows == 5 ? 70 : rows == 6 ? 68 : rows == 7 ? 65 : rows == 8 ? 62 : 60;
	// let hCard = rows <= 4 ? 80 : rows == 5 ? 70 : rows == 6 ? 68 : rows == 7 ? 65 : rows == 8 ? 62 : 60;
	// hCard*=1.25;
	// let tableRect = getRectInt('dTable');
	// let ratio=getRect('dTable').w / hCard;
	// console.log('ratio', ratio.toFixed(2), 'hCard', hCard, 'tableRect',tableRect,'rows', rows, 'cols', fen.cols, 'gap', gap);
	let dBoard = mGrid(rows, fen.cols, d2, { gap, mabottom: 20 });
	let items = [];
	for (const c of fen.cards) {
		let dc = setDrawCard(c, dBoard, colors, hCard);
		let item = mItem({ div: dc }, { key: c });
		items.push(item);
	}
	let oset = setFindOneSet(items); //console.log('=>', oset ? oset.keys[0] : 'NO SET');
	return items;
}
function injectGlobalSVGDefs() {
	if (document.getElementById('svgSymbols')) return; // already injected

	const svgDefs = `
    <svg id="svgSymbols" xmlns="http://www.w3.org/2000/svg" style="position:absolute; width:0; height:0; overflow:hidden; visibility:hidden;">
      <defs>
        <pattern id="striped" patternUnits="userSpaceOnUse" width="4" height="4">
          <path d="M-1,1 H5" stroke="blue" stroke-width="1" />
        </pattern>

        <symbol id="squiggle" preserveAspectRatio="xMidYMid meet">
          <path d="M38.4,63.4
                  c2,16.1,11,19.9,10.6,28.3
                  c1,9.2-21.1,12.2-33.4,3.8
                  s-15.8-21.2-9.3-38
                  c3.7-7.5,4.9-14,4.8-20
                  c0-16.1-11-19.9-10.6-28.3
                  C1,0.1,21.6-3,33.9,5.5
                  s15.8,21.2,9.3,38
                  C40.4,50.6,38.5,57.4,38.4,63.4z"
                fill="url(#striped)"
                stroke="red"
                stroke-width="4"
          />
        </symbol>
      </defs>
    </svg>
  `;

	document.body.insertAdjacentHTML('afterbegin', svgDefs);
}

function setDrawCard(card, dParent, colors, sz = 100) {
	if (nundef(mBy('svgSymbols'))) {
		let svgSymbols = `
        <svg id="svgSymbols" xmlns="http://www.w3.org/2000/svg" style="display:none;">
          <defs>
            <pattern id="striped" patternUnits="userSpaceOnUse" width="4" height="4">
              <path d="M-1,1 H5" stroke="currentColor" stroke-width="1" />
            </pattern>
          </defs>
        </svg>  
     `;
		mBy('dMain').insertAdjacentHTML('beforeend', svgSymbols);
	}

	let [color, shape, num, fill] = card.split('_');
	let h = sz, w = sz / .65;
	let ws = w / 4;
	let hs = 2 * ws;
	let d0 = mDom(dParent, { display: 'flex', w, h, bg: 'white', rounding: 10 });
	mStyle(d0, { justifyContent: 'center', 'align-items': 'center', gap: 6 })
	let shapeSvg = `
      <svg viewBox="-2 -2 54 104" xmlns="http://www.w3.org/2000/svg" style="color: red;">
        <path d="M38.4,63.4
                c2,16.1,11,19.9,10.6,28.3
                c1,9.2-21.1,12.2-33.4,3.8
                s-15.8-21.2-9.3-38
                c3.7-7.5,4.9-14,4.8-20
                c0-16.1-11-19.9-10.6-28.3
                C1,0.1,21.6-3,33.9,5.5
                s15.8,21.2,9.3,38
                C40.4,50.6,38.5,57.4,38.4,63.4z"
              fill="url(#striped)"
              stroke="red"
              stroke-width="4"
        />
      </svg>
    
    `;
	for (const i of range(num)) {
		let d1 = mDom(d0, { h: hs, w: ws }, { html: shapeSvg });
	}
	return d0;
}

function setDrawCard(card, dParent, colors, sz = 100) {
	if (nundef(mBy('svgSymbols'))) {
		let svgSymbols = `
        <svg id="svgSymbols" xmlns="http://www.w3.org/2000/svg" style="display:none;">
          <defs>
            <pattern id="striped" patternUnits="userSpaceOnUse" width="4" height="4">
              <path d="M-1,1 H5" stroke="currentColor" stroke-width="1" />
            </pattern>
          </defs>
        </svg>  
     `;
		mBy('dMain').insertAdjacentHTML('beforeend', svgSymbols);
	}

	const paths = {
		diamond: "M25 0 L50 50 L25 100 L0 50 Z",
		squiggle: "M38.4,63.4c2,16.1,11,19.9,10.6,28.3c1,9.2-21.1,12.2-33.4,3.8s-15.8-21.2-9.3-38c3.7-7.5,4.9-14,4.8-20 c0-16.1-11-19.9-10.6-28.3C1,0.1,21.6-3,33.9,5.5s15.8,21.2,9.3,38C40.4,50.6,38.5,57.4,38.4,63.4z",
		oval: "M25,95C14.2,95,5.5,85.2,5.5,80V20C5.5,13.2,14.2,5.2,25,5.2S44.5,13.2,44.5,20v60 C44.5,85.2,35.8,95,25,95z"
	}
	let [color, shape, num, fill] = card.split('_');
	var attr = {
		d: paths[shape],
		fill: fill == 'striped' ? `url(#striped)` : fill == 'solid' ? colors[color] : 'none',
		stroke: `url(#striped)`, //colors[color],
		'stroke-width': 4,
	};
	let h = sz, w = sz / .65;
	let ws = w / 4;
	let hs = 2 * ws;
	let d0 = mDom(dParent, { display: 'flex', w, h, bg: 'white', rounding: 10 });
	mStyle(d0, { justifyContent: 'center', 'align-items': 'center', gap: 6 })
	let shapeSvg = `<svg viewbox="-2 -2 54 104">` + makeSVG("path", attr) + '</svg>';
	shapeSvg = `
      <svg viewBox="-2 -2 54 104" xmlns="http://www.w3.org/2000/svg" style="color: red;">
        <pattern id="striped" patternUnits="userSpaceOnUse" width="4" height="4">
          <path d="M-1,1 H5" stroke="currentColor" stroke-width="1" />
        </pattern>

        <path d="M38.4,63.4
                c2,16.1,11,19.9,10.6,28.3
                c1,9.2-21.1,12.2-33.4,3.8
                s-15.8-21.2-9.3-38
                c3.7-7.5,4.9-14,4.8-20
                c0-16.1-11-19.9-10.6-28.3
                C1,0.1,21.6-3,33.9,5.5
                s15.8,21.2,9.3,38
                C40.4,50.6,38.5,57.4,38.4,63.4z"
              fill="url(#striped)"
              stroke="black"
              stroke-width="4"
        />
      </svg>
    
    `;
	shapeSvg = `
      <svg viewBox="-2 -2 54 104" xmlns="http://www.w3.org/2000/svg" style="color: red;">
        <path d="M38.4,63.4
                c2,16.1,11,19.9,10.6,28.3
                c1,9.2-21.1,12.2-33.4,3.8
                s-15.8-21.2-9.3-38
                c3.7-7.5,4.9-14,4.8-20
                c0-16.1-11-19.9-10.6-28.3
                C1,0.1,21.6-3,33.9,5.5
                s15.8,21.2,9.3,38
                C40.4,50.6,38.5,57.4,38.4,63.4z"
              fill="url(#striped)"
              stroke="red"
              stroke-width="4"
        />
      </svg>
    
    `;
	console.log('shapeSvg', shapeSvg);
	for (const i of range(num)) {
		let d1 = mDom(d0, { h: hs, w: ws }, { html: shapeSvg });
	}
	return d0;
}
//#endregion

//*************************** vio94 ************************ */
function setgame(table, items) {
	// private state
	let _table = table;
	let _items = items;
	function setup(table) {
		_table = table;
		let fen = {};
		for (const name in table.players) {
			let pl = table.players[name];
			pl.score = 0;
		}
		//fen.deck_size = firstNumber(table.options.deck_size, 81);
		let nums = allNumbers(table.options.grid_size);
		fen.numCards = nums[0] * nums[1]; console.log('nums', nums, table.options.deck_size, fen.numCards);
		fen.cols = nums[1];
		fen.deck = setCreateDeck(table.options.deck_size); //console.log('deck', fen.deck);
		fen.cards = deckDeal(fen.deck, fen.numCards);
		table.plorder = jsCopy(table.playerNames);
		table.turn = jsCopy(table.playerNames);
		return fen;
	}
	function prepareTable(t) {
		_table = table;
		// d = mDom('dMain', { bg:U.color,round:true,wmax: 800, hmin:700, padding: 30,align: 'center', margin: 'auto',matop:12 }, {className:'velvet'});
		setCssVar('--velvet-color', U.color);
		d = mDom('dMain', { rounding: 20, wmax: 800, hmin: 700, padding: 12, align: 'center', margin: 'auto', matop: 25 }, { className: 'velvet' });

		let d0 = mDom(d, flexCenterTop(), { id: 'dTitle' });
		let d1 = mDom(d, flexCenterTop(), { id: 'dInstruction' });
		let d2 = mDom(d, flexCenterCenter(), { id: 'dStats' });
		let d3 = mDom(d, flexCenterCenter(), { id: 'dTable' });

		showTitleGame(t, d0);

		// mStyle(d0, { bg: 'blue' }, { html: 'Title' }); mLinebreak(d2);
		// mStyle(d1, { bg: 'yellow' }, { html: 'Instructions' }); mLinebreak(d2);
		// mStyle(d2, { bg: 'orange' }, { html: 'Stats' }); mLinebreak(d2);
		// mStyle(d3, { bg: 'red' }, { html: 'Table' }); mLinebreak(d3);
		//console.log(d)
	}
	function stats(table) {
		_table = table;
		let [me, players] = [UGetName(), table.players];
		let style = { patop: 8, mabottom: 12, wmin: 80, hmin: 90, bg: 'beige', fg: 'contrast' };
		let player_stat_items = uiTypePlayerStats(table, me, 'dStats', 'rowflex', style);
		for (const plname in players) {
			let pl = players[plname];
			let item = player_stat_items[plname];
			if (pl.playmode == 'bot') { mStyle(item.img, { rounding: 0 }); }
			let d = iDiv(item);
			mLinebreak(d);
			playerStatCount('star', pl.score, d);
		}
	}
	function present(table) {
		_table = table;
		const colors = { red: '#e74c3c', green: '#27ae60', purple: 'indigo' };
		setLoadPatterns('dMain', colors);
		let fen = table.fen;
		// let d = mDom('dTable', { padding: 50, wmin: 500, wmax: 800, ...flexCenterCenter(), gap: 10, padding: 0 }, { className: 'flexRCcontainer', id: 'dWood' }); //mCenterFlex(d);
		let d = mDom('dTable'); //mStyle('dTable', { padding: 50, wmin: 500, wmax: 800 });//, ...flexCenterCenter(), gap: 10, padding: 0 }, { className: 'flexRCcontainer', id: 'dWood' }); //mCenterFlex(d);
		// mStyle(d, { padding: 50, wmin: 500, wmax: 800 });
		let d1 = mDom(d, {}, { className: 'flexRCbox', id: 'dTableButtons' });
		let d2 = mDom(d, { padding: 20 }, { className: 'flexRCbox', id: 'dTableCards' });
		//let d3 = mDom(d, {}, { className: 'flexRCbox', id: 'dbRB' });

		let rows = Math.ceil(fen.cards.length / fen.cols);
		let gap = 10;
		let sz = rows <= 4 ? 80 : rows == 5 ? 70 : rows == 6 ? 68 : rows == 7 ? 65 : rows == 8 ? 62 : 60;
		sz *= 1.25;
		let dBoard = mGrid(rows, fen.cols, d2, { gap });
		let items = _items = [];
		for (const c of fen.cards) {
			let dc = setDrawCard(c, dBoard, colors, sz);
			let item = mItem({ div: dc }, { key: c });
			items.push(item);
		}
		let oset = setFindOneSet(items); //console.log('=>', oset ? oset.keys[0] : 'NO SET');
		return items;
	}
	function activate() {
		let items = _items;
		let table = _table; //console.log('activate', table, items);
		if (!isMyTurn(table)) { return; }
		for (const item of items) {
			let d = iDiv(item);
			mStyle(d, { cursor: 'pointer' });
			d.onclick = ev => onclickCard(table, item, items);
		}
		let d1 = mBy('dTableButtons');
		// let dParent = mDom('dTable',{hmin:200}); //.parentNode; mIfNotRelative(dParent);
		mClass(d1, 'button_container');
		mStyle(d1, { justifyContent: 'space-between' })
		mDom(d1, {}, { tag: 'button', id: 'bNoSet', html: 'No Set', onclick: onclickNoSet });
		mDom(d1, {}, { tag: 'button', html: 'Cheat', onclick: onclickCheat });
		mDom(d1, {}, { tag: 'button', id: 'bHint', html: 'Hint', onclick: onclickHint });
		// let bNoSet = mButton('No Set', () => onclickNoSet(getUname(), table, items), d1, {}, 'button', 'bNoSet');
		// let bHint = mButton('Hint', () => onclickHint(table, items), d1, {}, 'button', 'bHint');
		//mPos(bNoSet, window.innerWidth / 2 + 180, 110);
		// if (amIHuman(table) && getGameOption('use_level') == 'yes' && getPlayerProp('level') <= 2) {
		//   let bHint = mButton('Hint', () => onclickHint(table, items), dParent, {}, 'button', 'bHint');
		//   //mPos(bHint, window.innerWidth / 2 - 200 - 80, 110);
		// }
		if (isEmpty(table.fen.cards)) return gameoverScore(table);
		// if (amIHuman(table) && table.options.gamemode == 'multi') return;
		if (amIHuman(table) && (!table.options.gamemode || table.options.gamemode == 'multi')) return;
		let name = amIHuman(table) && table.options.gamemode == 'solo' ? someOtherPlayerName(table) : getUname();
		if (nundef(name)) return;
		botMove(name, table, items);
	}
	async function botMove(name, table, items) {
		//assertion(false, 'botMove not implemented!');
		let oset = setFindOneSet(items);
		let ms = rChoose(range(5000, 10000, 500));
		//let avg = calcBotLevel(table); let ms = avg ? 18000 - avg * 2000 : 1000;
		if (!oset) ms += 2000;
		TO.bot = setTimeout(async () => {
			if (!oset) await onclickNoSet(name, table, items);
			else {
				for (const item of oset.items) toggleItemSelection(item);
				TO.bot1 = setTimeout(async () => await evalMove(name, table, oset.keys), 1000);
			}
		}, rNumber(ms, ms + 2000));
	}
	function setCheckIfSet(keys) {
		let arr = makeArrayWithParts(keys);
		let isSet = arr.every(x => arrAllSameOrDifferent(x));
		return isSet;
	}
	function setCreateDeck(num) {
		let deck = [];
		['red', 'purple', 'green'].forEach(color => {
			['diamond', 'squiggle', 'oval'].forEach(shape => {
				[1, 2, 3].forEach(num => {
					['solid', 'striped', 'open'].forEach(fill => {
						deck.push(`${color}_${shape}_${num}_${fill}`);
					});
				});
			});
		});
		arrShuffle(deck);
		if (isdef(num)) deck = deck.slice(0, num); // limit to 15 cards
		return deck;
	}
	function setDrawCard(card, dParent, colors, sz = 100) {
		const paths = {
			diamond: "M25 0 L50 50 L25 100 L0 50 Z",
			squiggle: "M38.4,63.4c2,16.1,11,19.9,10.6,28.3c1,9.2-21.1,12.2-33.4,3.8s-15.8-21.2-9.3-38c3.7-7.5,4.9-14,4.8-20 c0-16.1-11-19.9-10.6-28.3C1,0.1,21.6-3,33.9,5.5s15.8,21.2,9.3,38C40.4,50.6,38.5,57.4,38.4,63.4z",
			oval: "M25,95C14.2,95,5.5,85.2,5.5,80V20C5.5,13.2,14.2,5.2,25,5.2S44.5,13.2,44.5,20v60 C44.5,85.2,35.8,95,25,95z"
		}
		let [color, shape, num, fill] = card.split('_');
		var attr = {
			d: paths[shape],
			fill: fill == 'striped' ? `url(#striped-${color})` : fill == 'solid' ? colors[color] : 'none',
			stroke: colors[color],
			'stroke-width': 4,
		};
		let h = sz, w = sz / .65;
		let ws = w / 4;
		let hs = 2 * ws;
		let d0 = mDom(dParent, { display: 'flex', w, h, bg: 'white', rounding: 10 });
		mStyle(d0, { justifyContent: 'center', 'align-items': 'center', gap: 6 })
		let shapeSvg = `<svg viewbox="-2 -2 54 104">` + makeSVG("path", attr) + '</svg>';
		for (const i of range(num)) {
			let d1 = mDom(d0, { h: hs, w: ws }, { html: shapeSvg });
		}
		return d0;
	}
	function setFindAllSets(items) {
		let result = [];
		for (var x = 0; x < items.length; x++) {
			for (var y = x + 1; y < items.length; y++) {
				for (var z = y + 1; z < items.length; z++) {
					assertion(items[x] != items[y], `WTF!?!?!?! ${items[x].key} ${items[y].key}`)
					let list = [items[x], items[y], items[z]];
					let keys = list.map(x => x.key);
					if (setCheckIfSet(keys)) result.push(list);
				}
			}
		}
		if (isEmpty(result)) console.log('no set!')
		return result;
	}
	function setFindOneSet(items) {
		for (var x = 0; x < items.length; x++) {
			for (var y = x + 1; y < items.length; y++) {
				for (var z = y + 1; z < items.length; z++) {
					assertion(items[x] != items[y], `WTF!?!?!?! ${items[x].key} ${items[y].key}`)
					let list = [items[x], items[y], items[z]];
					let keys = list.map(x => x.key);
					if (setCheckIfSet(keys)) return { items: list, keys };
				}
			}
		}
		return null;
	}
	function setLoadPatterns(dParent, colors) {
		dParent = toElem(dParent);
		let id = "setpatterns";
		if (isdef(mBy(id))) { return; }
		mLinebreak(dParent);
		let html = `
      <div style="max-width:50%">
      <svg style="display:hidden;" id="setpatterns" width="0" height="0">
        <!--  Define the patterns for the different fill colors  -->
        <pattern id="striped-red" patternUnits="userSpaceOnUse" width="4" height="4">
          <path d="M-1,1 H5" style="stroke:${colors.red}; stroke-width:1" />
        </pattern>
        <pattern id="striped-green" patternUnits="userSpaceOnUse" width="4" height="4">
          <path d="M-1,1 H5" style="stroke:${colors.green}; stroke-width:1" />
        </pattern>
        <pattern id="striped-purple" patternUnits="userSpaceOnUse" width="4" height="4">
          <path d="M-1,1 H5" style="stroke:${colors.purple}; stroke-width:1" />
        </pattern>
      </svg>
      </div>
      `;
		let el = mCreateFrom(html);
		mAppend(dParent, el)
	}
	async function onclickCard(table, item, items) {
		toggleItemSelection(item);
		let selitems = items.filter(x => x.isSelected);
		let [keys, m] = [selitems.map(x => x.key), selitems.length];
		if (m == 3) {
			await evalMove(getUname(), table, keys);
		}
	}
	async function onclickHint() {
		let table = _table;
		let items = _items;
		let oset = setFindOneSet(items);
		let bHint = mBy('bHint');
		disableButton('bHint');
		if (!oset) {
			ANIM.button = scaleAnimation('bNoSet');
		} else {
			let item = rChoose(oset.items);
			await onclickCard(table, item, items);
		}
	}
	async function onclickCheat() {
		let table = _table;
		let items = _items;
		let oset = setFindOneSet(items);
		let bHint = mBy('bHint');
		disableButton('bHint');
		if (!oset) {
			ANIM.button = scaleAnimation('bNoSet');
		} else {
			let candidates = rChoose(oset.items, 2);
			for (const item of candidates) await onclickCard(table, item, items);
		}
	}
	async function onclickNoSet() {
		let name = getUname();
		let table = _table;
		let items = _items;
		let success = !setFindOneSet(items);
		let newTable = jsCopy(table);
		if (success) {
			let fen = newTable.fen;
			//console.log('deck', fen.deck, 'cards', fen.cards);
			let newCards = deckDeal(fen.deck, 1);
			if (!isEmpty(newCards)) fen.cards.push(newCards[0]); else return await gameoverScore(name, newTable, 1);
		}
		await setSendMove(name, newTable, success);
	}
	async function evalMove(name, table, keys) {
		let success = setCheckIfSet(keys);
		let newTable = jsCopy(table);
		if (success) {
			let fen = newTable.fen;
			let toomany = Math.max(0, fen.cards.length - fen.numCards);
			let need = Math.max(0, 3 - toomany);
			//console.log('deck', fen.deck, 'cards', fen.cards, toomany, need);
			let newCards = deckDeal(fen.deck, need);
			for (let i = 0; i < 3; i++) if (i < newCards.length) arrReplace1(fen.cards, keys[i], newCards[i]); else removeInPlace(fen.cards, keys[i]);
			//if (need > 0 && isEmpty(newCards)) return await gameoverScore(name, newTable, 1);
		}
		await setSendMove(name, newTable, success);
	}
	async function gameoverScore(name, newTable, change = 0) {
		newTable.players[name].score += change;
		let step = newTable.step;
		newTable.step += 1;
		newTable.winners = getPlayersWithMaxScore(newTable);
		newTable.status = 'over';
		newTable.turn = [];
		let res = await tableSaveRace(newTable, { step, name, change: 0, prop: 'score' });
	}
	async function setSendMove(name, newTable, success) {
		clearEvents();
		mShield('dTable', { bg: 'transparent' });
		let step = newTable.step;
		let change = success ? 1 : -1;

		if (success) { newTable.step += 1; newTable.players[name].score += change; }
		let res = await tableSaveRace(newTable, { step, name, change, prop: 'score', success });
		console.log(res.table.step, res.table.players[name].score, res.message);
		assertion(isList(res.table.fen.deck), `tableSaveRace ERROR: ${res.table.fen}`);
	}

	return {
		setup, prepareTable, stats, present, activate,
		get table() { return _table; },
		get items() { return _items; },
	};
}

function mShield(dParent, styles = {}, id = null, classnames = null, hideonclick = false) {
	addKeys({ bg: '#00000020' }, styles);
	dParent = toElem(dParent);
	let d = mDiv(dParent, styles, id, classnames);
	mIfNotRelative(dParent);
	mStyle(d, { position: 'absolute', left: 0, top: 0, w: '100%', h: '100%' });
	if (hideonclick) d.onclick = ev => { evNoBubble(ev); d.remove(); };
	else d.onclick = ev => { evNoBubble(ev); };
	mClass(d, 'topmost');
	return d;
}
async function initUI() {
	mLayoutTLM('dPage', {}, { wcol: 0 });
	//console.log('DAInit', mBy('dPage'),mBy('dMain'), mBy('dTop')); //return;//, mBy('dExtra')); return;
	mStyle('dMain', { overy: 'scroll', pah: 10, height: '100%' });
	mLayoutTopTestExtraTitle('dTop');
	//console.log('DAInit', mBy('dPage'),mBy('dMain'), mBy('dOuterTop')); return;//, mBy('dExtra')); return;

	let d = mBy('dTopLeft'); mClass(d, 'button_container'); //mFlex(d); // mStyle(d, { display: 'flex', vStretch: true, gap: 10, padding: 4, box: true }); //, box:true, vStretch:true, hCenter: true, padding: 10, gap: 10 }) //mClass(d,'flex')

	faButton(d, DEV ? 'angles_up' : 'angles_down', {}, { onclick: toggleDevmode });
	let key = DEV ? 'angles_up' : 'angles_down';
	let o = lookup(M.superdi, [key]); console.log(o);
	// let html = `
	// <div class='keyButton'>
	//   <div class='keyinner'></div>
	// </div>`;
	// mDom(d, {}, { html });
	let text = `&#x${o.fa6};`
	html = `
  <div class='keyButton'>
    <div class='keyinner'>${text}</div>
  </div>`;
	mDom(d, {}, { html, onclick: toggleDevmode });
	// let key = DEV ? 'circle_chevron_up' : 'circle_chevron_down';
	// let o = lookup(M.superdi, [key]);console.log(o);
	// let dk=mDom(d,{...flexCenterCenter(),bg:'#ff0000',h:28,round:true},{html:`<i class="fas fa-heart" style="color: red; background: transparent;"></i>`});
	// let b = mDom(dk, {family:'fa6',hline:28 }, { html:`&#x${o.fa6};`,className:'keyButton',onclick: toggleDevmode });
	//mDom(d, { fg: 'white', round: true }, { tag: 'button', html: DEV ? '^' : 'v', onclick: toggleDevmode, });
	mDom(d, {}, { tag: 'button', html: 'games', onclick: switchToMenu, menu: 'top', key: 'games' });
	mDom(d, {}, { tag: 'button', html: 'table', onclick: switchToMenu, menu: 'top', key: 'table' });

	if (TESTING || DEV) {
		let d = mBy('dTestRight'); mClass(d, 'button_container'); //mFlex(d);
		let names = ['gul', 'amanda', 'felix', 'lauren', 'mimi'];
		for (const name of names) { let b = mDom(d, {}, { tag: 'button', html: name, onclick: async (ev) => await switchToUser(name) }); }
		mDom(d, {}, { tag: 'button', html: '...', onclick: onclickMoreUsers });
		d = mBy('dTestLeft');
		mClass(d, 'button_container');
		mDom(d, {}, { tag: 'button', html: 'delete all', onclick: tablesDeleteAll });
		let key = 'arrow_rotate_right';
		let b = mKey(key, d, { fz: 22, }, { tag: 'button', onclick: onclickReload });
	}

	await switchToUser();
	DA.menu = localStorage.getItem('menu') || 'games';
	pollInit();
	if (DA.menu == 'table') {
		await reloadTables();
		let t = DAGetTable(); //console.log('t', t);
		if (t) {
			DA.tid = t.id;
		} else DA.menu = 'games';
		// assertion(DA.tid, 'tid not set');
	}
	await switchToMenu(); //'games'); // table | games

}
function setgame(t) {
	table = t;
	items = [];
	function setup(table) {
		let fen = {};
		for (const name in table.players) {
			let pl = table.players[name];
			pl.score = 0;
		}
		fen.deck = setCreateDeck(); console.log('deck', fen.deck);
		fen.cards = deckDeal(fen.deck, table.options.numCards);
		table.plorder = jsCopy(table.playerNames);
		table.turn = jsCopy(table.playerNames);
		return fen;
	}
	// function prepLayout(table) { presentStandardRoundTable(table); }
	function stats(table) {
		let [me, players] = [UGetName(), table.players];
		let style = { patop: 8, mabottom: 20, wmin: 80, hmin: 90, bg: 'beige', fg: 'contrast' };
		let player_stat_items = uiTypePlayerStats(table, me, 'dStats', 'rowflex', style);
		for (const plname in players) {
			let pl = players[plname];
			let item = player_stat_items[plname];
			if (pl.playmode == 'bot') { mStyle(item.img, { rounding: 0 }); }
			let d = iDiv(item); //mCenterFlex(d); mIfNotRelative(d);
			mLinebreak(d);
			playerStatCount('star', pl.score, d); //, {}, {id:`stat_${plname}_score`});
		}
	}
	function present(table) {
		const colors = { red: '#e74c3c', green: '#27ae60', purple: 'indigo' };
		setLoadPatterns('dMain', colors);
		let fen = table.fen;
		mStyle('dTable', { padding: 50, wmin: 500 });
		let d = mDom('dTable', { ...flexCenterCenter(), gap: 10, padding: 0 }); //mCenterFlex(d);
		let rows = Math.ceil(fen.cards.length / 3);
		let gap = 10;
		let sz = rows <= 4 ? 80 : rows == 5 ? 70 : rows == 6 ? 68 : rows == 7 ? 65 : rows == 8 ? 62 : 60;
		let dBoard = mGrid(rows, 3, d, { gap });
		let items = [];
		for (const c of fen.cards) {
			let dc = setDrawCard(c, dBoard, colors, sz);
			let item = mItem({ div: dc }, { key: c });
			items.push(item);
		}
		let oset = setFindOneSet(items); console.log('=>', oset ? oset.keys[0] : 'NO SET');
		this.items = items;
		return items;
	}
	async function activate(table) {
		let items = this.items;
		if (!isMyTurn(table)) { return; }
		for (const item of items) {
			let d = iDiv(item);
			mStyle(d, { cursor: 'pointer' });
			d.onclick = ev => onclickCard(table, item, items);
		}
		let dParent = mBy('dTable').parentNode; mIfNotRelative(dParent);
		let bNoSet = mButton('No Set', () => onclickNoSet(getUname(), table, items), dParent, {}, 'button', 'bNoSet');
		mPos(bNoSet, window.innerWidth / 2 + 180, 110);
		// if (amIHuman(table) && getGameOption('use_level') == 'yes' && getPlayerProp('level') <= 2) {
		//   let bHint = mButton('Hint', () => onclickHint(table, items), dParent, {}, 'button', 'bHint');
		//   mPos(bHint, window.innerWidth / 2 - 200 - 80, 110);
		// }
		if (isEmpty(table.fen.cards)) return gameoverScore(table);
		console.log('.....', amIHuman(table), table.options.gamemode, table.options.gamemode == 'multi');
		if (amIHuman(table) && (!table.options.gamemode || table.options.gamemode == 'multi')) return;
		let name = amIHuman(table) && table.options.gamemode == 'solo' ? someOtherPlayerName(table) : getUname();
		if (nundef(name)) return;
		await botMove(name, table, items);
	}
	async function botMove(name, table, items) {
		assertion(false, 'botMove not implemented!');
		let oset = setFindOneSet(items);
		let avg = calcBotLevel(table);
		let ms = avg ? 18000 - avg * 2000 : 1000;
		if (!oset) ms += 2000;
		TO.bot = setTimeout(async () => {
			if (!oset) await onclickNoSet(name, table, items);
			else {
				for (const item of oset.items) toggleItemSelection(item);
				TO.bot1 = setTimeout(async () => await evalMove(name, table, oset.keys), 1000);
			}
		}, rNumber(ms, ms + 2000));
	}
	function setCheckIfSet(keys) {
		let arr = makeArrayWithParts(keys);
		let isSet = arr.every(x => arrAllSameOrDifferent(x));
		return isSet;
	}
	function setCreateDeck(num) {
		let deck = [];
		['red', 'purple', 'green'].forEach(color => {
			['diamond', 'squiggle', 'oval'].forEach(shape => {
				[1, 2, 3].forEach(num => {
					['solid', 'striped', 'open'].forEach(fill => {
						deck.push(`${color}_${shape}_${num}_${fill}`);
					});
				});
			});
		});
		arrShuffle(deck);
		if (isdef(num)) deck = deck.slice(0, num); // limit to 15 cards
		return deck;
	}
	function setDrawCard(card, dParent, colors, sz = 100) {
		const paths = {
			diamond: "M25 0 L50 50 L25 100 L0 50 Z",
			squiggle: "M38.4,63.4c2,16.1,11,19.9,10.6,28.3c1,9.2-21.1,12.2-33.4,3.8s-15.8-21.2-9.3-38c3.7-7.5,4.9-14,4.8-20 c0-16.1-11-19.9-10.6-28.3C1,0.1,21.6-3,33.9,5.5s15.8,21.2,9.3,38C40.4,50.6,38.5,57.4,38.4,63.4z",
			oval: "M25,95C14.2,95,5.5,85.2,5.5,80V20C5.5,13.2,14.2,5.2,25,5.2S44.5,13.2,44.5,20v60 C44.5,85.2,35.8,95,25,95z"
		}
		let [color, shape, num, fill] = card.split('_');
		var attr = {
			d: paths[shape],
			fill: fill == 'striped' ? `url(#striped-${color})` : fill == 'solid' ? colors[color] : 'none',
			stroke: colors[color],
			'stroke-width': 2,
		};
		let h = sz, w = sz / .65;
		let ws = w / 4;
		let hs = 2 * ws;
		let d0 = mDom(dParent, { display: 'flex', w, h, bg: 'white', rounding: 10 });
		mStyle(d0, { justifyContent: 'center', 'align-items': 'center', gap: 6 })
		let shapeSvg = `<svg viewbox="-2 -2 54 104">` + makeSVG("path", attr) + '</svg>';
		for (const i of range(num)) {
			let d1 = mDom(d0, { h: hs, w: ws }, { html: shapeSvg });
		}
		return d0;
	}
	function setFindAllSets(items) {
		let result = [];
		for (var x = 0; x < items.length; x++) {
			for (var y = x + 1; y < items.length; y++) {
				for (var z = y + 1; z < items.length; z++) {
					assertion(items[x] != items[y], `WTF!?!?!?! ${items[x].key} ${items[y].key}`)
					let list = [items[x], items[y], items[z]];
					let keys = list.map(x => x.key);
					if (setCheckIfSet(keys)) result.push(list);
				}
			}
		}
		if (isEmpty(result)) console.log('no set!')
		return result;
	}
	function setFindOneSet(items) {
		for (var x = 0; x < items.length; x++) {
			for (var y = x + 1; y < items.length; y++) {
				for (var z = y + 1; z < items.length; z++) {
					assertion(items[x] != items[y], `WTF!?!?!?! ${items[x].key} ${items[y].key}`)
					let list = [items[x], items[y], items[z]];
					let keys = list.map(x => x.key);
					if (setCheckIfSet(keys)) return { items: list, keys };
				}
			}
		}
		return null;
	}
	function setLoadPatterns(dParent, colors) {
		dParent = toElem(dParent);
		let id = "setpatterns";
		if (isdef(mBy(id))) { return; }
		mLinebreak(dParent);
		let html = `
      <div style="max-width:50%">
      <svg style="display:hidden;" id="setpatterns" width="0" height="0">
        <!--  Define the patterns for the different fill colors  -->
        <pattern id="striped-red" patternUnits="userSpaceOnUse" width="4" height="4">
          <path d="M-1,1 H5" style="stroke:${colors.red}; stroke-width:1" />
        </pattern>
        <pattern id="striped-green" patternUnits="userSpaceOnUse" width="4" height="4">
          <path d="M-1,1 H5" style="stroke:${colors.green}; stroke-width:1" />
        </pattern>
        <pattern id="striped-purple" patternUnits="userSpaceOnUse" width="4" height="4">
          <path d="M-1,1 H5" style="stroke:${colors.purple}; stroke-width:1" />
        </pattern>
      </svg>
      </div>
      `;
		let el = mCreateFrom(html);
		mAppend(dParent, el)
	}
	async function onclickCard(table, item, items) {
		toggleItemSelection(item);
		let selitems = items.filter(x => x.isSelected);
		let [keys, m] = [selitems.map(x => x.key), selitems.length];
		if (m == 3) {
			await evalMove(getUname(), table, keys);
		}
	}
	async function onclickHint(table, items) {
		let oset = setFindOneSet(items);
		let bHint = mBy('bHint');
		disableButton('bHint');
		if (!oset) {
			ANIM.button = scaleAnimation('bNoSet');
		} else {
			let item = rChoose(oset.items);
			await onclickCard(table, item, items);
		}
	}
	async function onclickNoSet(name, table, items) {
		let success = !setFindOneSet(items);
		let newTable = jsCopy(table);
		if (success) {
			let fen = newTable.fen;
			console.log('deck', fen.deck, 'cards', fen.cards);
			let newCards = deckDeal(fen.deck, 1);
			if (!isEmpty(newCards)) fen.cards.push(newCards[0]); else return await gameoverScore(name, newTable, 1);
		}
		await setSendMove(name, newTable, success);
	}
	async function evalMove(name, table, keys) {
		let success = setCheckIfSet(keys);
		let newTable = jsCopy(table);
		if (success) {
			let fen = newTable.fen;
			let toomany = Math.max(0, fen.cards.length - newTable.options.numCards);
			let need = Math.max(0, 3 - toomany);
			console.log('deck', fen.deck, 'cards', fen.cards, toomany, need);
			let newCards = deckDeal(fen.deck, need);
			for (let i = 0; i < 3; i++) if (i < newCards.length) arrReplace1(fen.cards, keys[i], newCards[i]); else removeInPlace(fen.cards, keys[i]);
			//if (need > 0 && isEmpty(newCards)) return await gameoverScore(name, newTable, 1);
		}
		await setSendMove(name, newTable, success);
	}
	async function gameoverScore(name, newTable, change = 0) {
		newTable.players[name].score += change;
		let step = newTable.step;
		newTable.step += 1;
		newTable.winners = getPlayersWithMaxScore(newTable);
		newTable.status = 'over';
		newTable.turn = [];
		let res = await tableSaveRace(newTable, { step, name, change: 0, prop: 'score' });
	}
	async function setSendMove(name, newTable, success) {
		clearEvents();
		mShield('dTable', { bg: 'transparent' });
		let step = newTable.step;
		let change = success ? 1 : -1;

		if (success) { newTable.step += 1; newTable.players[name].score += change; }
		let res = await tableSaveRace(newTable, { step, name, change, prop: 'score', success });
		console.log(res.table.step, res.table.players[name].score, res.message);
		assertion(isList(res.table.fen.deck), `tableSaveRace ERROR: ${res.table.fen}`);
	}
	return { table, items, setup, present, stats, activate };
}
function setgame(t) {
	table = t;
	items = [];
	function setup(table) {
		let fen = {};
		for (const name in table.players) {
			let pl = table.players[name];
			pl.score = 0;
		}
		fen.deck = setCreateDeck(); console.log('deck', fen.deck);
		fen.cards = deckDeal(fen.deck, table.options.numCards);
		table.plorder = jsCopy(table.playerNames);
		table.turn = jsCopy(table.playerNames);
		return fen;
	}
	// function prepLayout(table) { presentStandardRoundTable(table); }
	function stats(table) {
		let [me, players] = [UGetName(), table.players];
		let style = { patop: 8, mabottom: 20, wmin: 80, hmin: 90, bg: 'beige', fg: 'contrast' };
		let player_stat_items = uiTypePlayerStats(table, me, 'dStats', 'rowflex', style);
		for (const plname in players) {
			let pl = players[plname];
			let item = player_stat_items[plname];
			if (pl.playmode == 'bot') { mStyle(item.img, { rounding: 0 }); }
			let d = iDiv(item); //mCenterFlex(d); mIfNotRelative(d);
			mLinebreak(d);
			playerStatCount('star', pl.score, d); //, {}, {id:`stat_${plname}_score`});
		}
	}
	function present(table) {
		const colors = { red: '#e74c3c', green: '#27ae60', purple: 'indigo' };
		setLoadPatterns('dMain', colors);
		let fen = table.fen;
		mStyle('dTable', { padding: 50, wmin: 500 });
		let d = mDom('dTable', { ...flexCenterCenter(), gap: 10, padding: 0 }); //mCenterFlex(d);
		let rows = Math.ceil(fen.cards.length / 3);
		let gap = 10;
		let sz = rows <= 4 ? 80 : rows == 5 ? 70 : rows == 6 ? 68 : rows == 7 ? 65 : rows == 8 ? 62 : 60;
		let dBoard = mGrid(rows, 3, d, { gap });
		let items = [];
		for (const c of fen.cards) {
			let dc = setDrawCard(c, dBoard, colors, sz);
			let item = mItem({ div: dc }, { key: c });
			items.push(item);
		}
		let oset = setFindOneSet(items); console.log('=>', oset ? oset.keys[0] : 'NO SET');
		this.items = items;
		return items;
	}
	async function activate(table) {
		let items = this.items;
		if (!isMyTurn(table)) { return; }
		for (const item of items) {
			let d = iDiv(item);
			mStyle(d, { cursor: 'pointer' });
			d.onclick = ev => onclickCard(table, item, items);
		}
		let dParent = mBy('dTable').parentNode; mIfNotRelative(dParent);
		let bNoSet = mButton('No Set', () => onclickNoSet(getUname(), table, items), dParent, {}, 'button', 'bNoSet');
		mPos(bNoSet, window.innerWidth / 2 + 180, 110);
		if (amIHuman(table) && getGameOption('use_level') == 'yes' && getPlayerProp('level') <= 2) {
			let bHint = mButton('Hint', () => onclickHint(table, items), dParent, {}, 'button', 'bHint');
			mPos(bHint, window.innerWidth / 2 - 200 - 80, 110);
		}
		if (isEmpty(table.fen.cards)) return gameoverScore(table);
		if (amIHuman(table) && table.options.gamemode == 'multi') return;
		let name = amIHuman(table) && table.options.gamemode == 'solo' ? someOtherPlayerName(table) : getUname();
		if (nundef(name)) return;
		await botMove(name, table, items);
	}
	async function botMove(name, table, items) {
		assertion(false, 'botMove not implemented!');
		let oset = setFindOneSet(items);
		let avg = calcBotLevel(table);
		let ms = avg ? 18000 - avg * 2000 : 1000;
		if (!oset) ms += 2000;
		TO.bot = setTimeout(async () => {
			if (!oset) await onclickNoSet(name, table, items);
			else {
				for (const item of oset.items) toggleItemSelection(item);
				TO.bot1 = setTimeout(async () => await evalMove(name, table, oset.keys), 1000);
			}
		}, rNumber(ms, ms + 2000));
	}
	function setCheckIfSet(keys) {
		let arr = makeArrayWithParts(keys);
		let isSet = arr.every(x => arrAllSameOrDifferent(x));
		return isSet;
	}
	function setCreateDeck(num) {
		let deck = [];
		['red', 'purple', 'green'].forEach(color => {
			['diamond', 'squiggle', 'oval'].forEach(shape => {
				[1, 2, 3].forEach(num => {
					['solid', 'striped', 'open'].forEach(fill => {
						deck.push(`${color}_${shape}_${num}_${fill}`);
					});
				});
			});
		});
		arrShuffle(deck);
		if (isdef(num)) deck = deck.slice(0, num); // limit to 15 cards
		return deck;
	}
	function setDrawCard(card, dParent, colors, sz = 100) {
		const paths = {
			diamond: "M25 0 L50 50 L25 100 L0 50 Z",
			squiggle: "M38.4,63.4c2,16.1,11,19.9,10.6,28.3c1,9.2-21.1,12.2-33.4,3.8s-15.8-21.2-9.3-38c3.7-7.5,4.9-14,4.8-20 c0-16.1-11-19.9-10.6-28.3C1,0.1,21.6-3,33.9,5.5s15.8,21.2,9.3,38C40.4,50.6,38.5,57.4,38.4,63.4z",
			oval: "M25,95C14.2,95,5.5,85.2,5.5,80V20C5.5,13.2,14.2,5.2,25,5.2S44.5,13.2,44.5,20v60 C44.5,85.2,35.8,95,25,95z"
		}
		let [color, shape, num, fill] = card.split('_');
		var attr = {
			d: paths[shape],
			fill: fill == 'striped' ? `url(#striped-${color})` : fill == 'solid' ? colors[color] : 'none',
			stroke: colors[color],
			'stroke-width': 2,
		};
		let h = sz, w = sz / .65;
		let ws = w / 4;
		let hs = 2 * ws;
		let d0 = mDom(dParent, { display: 'flex', w, h, bg: 'white', rounding: 10 });
		mStyle(d0, { justifyContent: 'center', 'align-items': 'center', gap: 6 })
		let shapeSvg = `<svg viewbox="-2 -2 54 104">` + makeSVG("path", attr) + '</svg>';
		for (const i of range(num)) {
			let d1 = mDom(d0, { h: hs, w: ws }, { html: shapeSvg });
		}
		return d0;
	}
	function setFindAllSets(items) {
		let result = [];
		for (var x = 0; x < items.length; x++) {
			for (var y = x + 1; y < items.length; y++) {
				for (var z = y + 1; z < items.length; z++) {
					assertion(items[x] != items[y], `WTF!?!?!?! ${items[x].key} ${items[y].key}`)
					let list = [items[x], items[y], items[z]];
					let keys = list.map(x => x.key);
					if (setCheckIfSet(keys)) result.push(list);
				}
			}
		}
		if (isEmpty(result)) console.log('no set!')
		return result;
	}
	function setFindOneSet(items) {
		for (var x = 0; x < items.length; x++) {
			for (var y = x + 1; y < items.length; y++) {
				for (var z = y + 1; z < items.length; z++) {
					assertion(items[x] != items[y], `WTF!?!?!?! ${items[x].key} ${items[y].key}`)
					let list = [items[x], items[y], items[z]];
					let keys = list.map(x => x.key);
					if (setCheckIfSet(keys)) return { items: list, keys };
				}
			}
		}
		return null;
	}
	function setLoadPatterns(dParent, colors) {
		dParent = toElem(dParent);
		let id = "setpatterns";
		if (isdef(mBy(id))) { return; }
		mLinebreak(dParent);
		let html = `
      <div style="max-width:50%">
      <svg style="display:hidden;" id="setpatterns" width="0" height="0">
        <!--  Define the patterns for the different fill colors  -->
        <pattern id="striped-red" patternUnits="userSpaceOnUse" width="4" height="4">
          <path d="M-1,1 H5" style="stroke:${colors.red}; stroke-width:1" />
        </pattern>
        <pattern id="striped-green" patternUnits="userSpaceOnUse" width="4" height="4">
          <path d="M-1,1 H5" style="stroke:${colors.green}; stroke-width:1" />
        </pattern>
        <pattern id="striped-purple" patternUnits="userSpaceOnUse" width="4" height="4">
          <path d="M-1,1 H5" style="stroke:${colors.purple}; stroke-width:1" />
        </pattern>
      </svg>
      </div>
      `;
		let el = mCreateFrom(html);
		mAppend(dParent, el)
	}
	async function onclickCard(table, item, items) {
		toggleItemSelection(item);
		let selitems = items.filter(x => x.isSelected);
		let [keys, m] = [selitems.map(x => x.key), selitems.length];
		if (m == 3) {
			await evalMove(getUname(), table, keys);
		}
	}
	async function onclickHint(table, items) {
		let oset = setFindOneSet(items);
		let bHint = mBy('bHint');
		disableButton('bHint');
		if (!oset) {
			ANIM.button = scaleAnimation('bNoSet');
		} else {
			let item = rChoose(oset.items);
			await onclickCard(table, item, items);
		}
	}
	async function onclickNoSet(name, table, items) {
		let success = !setFindOneSet(items);
		let newTable = jsCopy(table);
		if (success) {
			let fen = newTable.fen;
			console.log('deck', fen.deck, 'cards', fen.cards);
			let newCards = deckDeal(fen.deck, 1);
			if (!isEmpty(newCards)) fen.cards.push(newCards[0]); else return await gameoverScore(name, newTable, 1);
		}
		await setSendMove(name, newTable, success);
	}
	async function evalMove(name, table, keys) {
		let success = setCheckIfSet(keys);
		let newTable = jsCopy(table);
		if (success) {
			let fen = newTable.fen;
			let toomany = Math.max(0, fen.cards.length - newTable.options.numCards);
			let need = Math.max(0, 3 - toomany);
			console.log('deck', fen.deck, 'cards', fen.cards, toomany, need);
			let newCards = deckDeal(fen.deck, need);
			for (let i = 0; i < 3; i++) if (i < newCards.length) arrReplace1(fen.cards, keys[i], newCards[i]); else removeInPlace(fen.cards, keys[i]);
			//if (need > 0 && isEmpty(newCards)) return await gameoverScore(name, newTable, 1);
		}
		await setSendMove(name, newTable, success);
	}
	async function gameoverScore(name, newTable, change = 0) {
		newTable.players[name].score += change;
		let step = newTable.step;
		newTable.step += 1;
		newTable.winners = getPlayersWithMaxScore(newTable);
		newTable.status = 'over';
		newTable.turn = [];
		let res = await tableSaveRace(newTable, { step, name, change: 0, prop: 'score' });
	}
	async function setSendMove(name, newTable, success) {
		clearEvents();
		mShield('dTable', { bg: 'transparent' });
		let step = newTable.step;
		let change = success ? 1 : -1;

		if (success) { newTable.step += 1; newTable.players[name].score += change; }
		let res = await tableSaveRace(newTable, { step, name, change, prop: 'score', success });
		console.log(res.table.step, res.table.players[name].score, res.message);
		assertion(isList(res.table.fen.deck), `tableSaveRace ERROR: ${res.table.fen}`);
	}
	return { table, items, setup, present, stats, activate };
}

async function DAInit() {
	DA.backendURL = await getDA('phpUrl'); //getServer(true) + 'simple0/php'; //'https://moxito.online/mox/simple0/php';
	DA.gamelist = ['setgame', 'button96'];
	let gamelist = 'aristo bluff button96 ferro fishgame fritz huti lacuna nations setgame spotit wise';
	DA.gamelist = gamelist = toWords(gamelist);
	DA.funcs = { setgame: setgame(), button96: button96() }; //implemented games!
	for (const gname of DA.gamelist) {
		if (isdef(DA.funcs[gname])) continue;
		DA.funcs[gname] = defaultGameFunc();
	}
	DA.evList = [];
	await loadAssetsStatic();
	mLayoutTM('dPage');
	mStyle('dMain', { overy: 'scroll', pah: 10, height: '100%' });
	mLayoutTopTestExtraTitle('dTop');
	await showMenuButtons();
	globalKeyHandling();

	// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	//   console.log("Got message:", request);
	//   sendResponse({ status: "ok" });
	//   return true; // Needed if response is async
	// });
	if (TESTING || DEV) {
		let d = mBy('dTestRight'); mClass(d, 'button_container'); //mFlex(d);
		let names = ['gul', 'amanda', 'felix', 'lauren', 'mimi'];
		for (const name of names) { let b = mDom(d, {}, { tag: 'button', html: name, onclick: async (ev) => await switchToUser(name) }); }
		mDom(d, {}, { tag: 'button', html: '...', onclick: onclickMoreUsers });

		d = mBy('dTestLeft'); mClass(d, 'button_container');
		mDom(d, {}, { tag: 'button', html: 'delete all', onclick: tablesDeleteAll });
		let key = 'arrow_rotate_right';
		let b = mKey(key, d, { fz: 22, }, { tag: 'button', onclick: onclickReload });
	}
}

function _showUserImage(uname, d, sz = 40) {
	let u = M.users[uname];
	let key = u.imgKey;
	let m = M.superdi[key];
	if (nundef(m)) {
		key = 'unknown_user';
	}
	return mKey(key, d, { 'object-position': 'center top', 'object-fit': 'cover', h: sz, w: sz, round: true, border: `${u.color} 3px solid` });
}

function showMessage(msg, ms = 3000) {
	let d = mBy('dMessage');
	let isPopup = nundef(d);
	if (nundef(d)) d = mPopup(); d.id = 'dMessage';
	//mStyle(d, { fg: 'yellow', padding:10 });
	d.innerHTML = msg;
	clearTimeout(TO.message);
	TO.message = setTimeout(() => clearMessage(isPopup), ms)
}

//*************************** vio95 ************************ */
async function reloadTables() {
	let res = await mGetFiles('tables'); //console.log('res', res); 
	DA.tableFilenames = res.dir.map(x => x.name);
	DA.tableInfo = res.dir; console.log('DA.tableInfo', DA.tableInfo);
	//if (isdef(DA.tableDict)) console.log('___tables vorher', jsCopy(DA.tableDict), jsCopy(res));
	let tables = {}, hasChanges = false;
	for (const f of DA.tableInfo) {
		let id = stringBefore(f.name, '.yaml');
		//console.log('name',name)
		let ts = f.modified; console.log('___ts', ts)
		let t = lookup(DA, ['tableDict', id]); //DA.tableDict[name];
		if (isdef(t) && t.modified === ts) { tables[id] = t; continue; } //console.log('___t unchanged',name); 
		hasChanges = true;
		t = await loadStaticYaml(`y/tables/${id}.yaml`);
		//console.log('reloadTables changing modified to',ts,t.modified)
		assertion(t.modified == ts, `modified timestamp mismatch for ${id}!`)
		tables[id] = t;
	}
	// tables already in DA.tableDict but NOT in tableInfo should be deleted from DA.tableDict
	DA.tableDict = tables;

	//mach hier lieber sortKeys nur!!! und dann return keys only
	// DA.tableKeysSorted = Object.keys(tables).sort((a, b) => tables[a].modified < tables[b].modified ? 1 : -1);
	// tables = dict2list(DA.tableDict);
	// let me = UGetName();
	// tables.map(x => {
	// 	x.prior = x.status == 'open' ? 0 : x.turn.includes(me) ? 1 : x.playerNames.includes(me) ? 2 : 3;
	// });
	// sortBy(tables, 'prior');
	// //let hasChanges = invalidTables() || !mBy('dTableList') || DA.tableList.length !== tables.length ||
	// 	tables.some((t, i) => t.playerNames.join() !== DA.tableList[i].playerNames.join() || t.status !== DA.tableList[i].status);
	// DA.tableList = tables;
	return { hasChanges };

}

function startGame(gameName, players = ["Player1"], options = {}) {
	DA.socket.emit("start_game", {
		gamename: gameName,
		players: players,
		options: options
	});
}

async function saveAndUpdatePlayerOptions(allPl, gamename) {
	let name = allPl.name;
	let poss = MGetGamePlayerOptionsAsDict(gamename);
	if (nundef(poss)) return;
	let opts = {};
	for (const p in poss) { allPl[p] = getRadioValue(p); if (p != 'playmode') opts[p] = allPl[p]; }
	let id = 'dPlayerOptions'; mRemoveIfExists(id); //dont need UI anymore
	let oldOpts = valf(MGetUserOptionsForGame(name, gamename), {});
	let changed = false;
	for (const p in poss) {
		if (p == 'playmode') continue;
		if (oldOpts[p] != opts[p]) {
			//console.log('change:', p, oldOpts[p], opts[p]); 
			changed = true;
			break;
		}
	}
	if (changed) {
		let games = valf(MGetUser(name).games, {});
		games[gamename] = opts;
		let res = await postUsers();
	}
}



function updateUserImageToBotHuman(playername, value) {
	//console.log(playername,value)
	function doit(checked, name, val) {
		let du = mByAttr('username', playername);
		let img = du.getElementsByTagName('img')[0];
		if (checked == true) if (val == 'human') mStyle(img, { round: true }); else mStyle(img, { rounding: 2 });
	}
	if (isdef(value)) doit(true, 0, value); else return doit;
}
function setPlayersToMulti() {
	//console.log('setPlayersToMulti')
	for (const name in DA.allPlayers) {
		lookupSetOverride(DA.allPlayers, [name, 'playmode'], 'human');
		updateUserImageToBotHuman(name, 'human');
	}
	let popup = mBy('dPlayerOptions');
	if (isdef(popup)) {
		setRadioValue('playmode', 'human');
	}
}
function setPlayersToSolo() {
	console.log('setPlayersToSolo')
	let me = UGetName();
	for (const name in DA.allPlayers) {
		let val = name == me ? 'human' : 'bot';
		lookupSetOverride(DA.allPlayers, [name, 'playmode'], val);
		updateUserImageToBotHuman(name, val);
	}
	let popup = mBy('dPlayerOptions');
	console.log('popup', popup);
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



async function clickOn(tag, text) {
	if (nundef(text)) {
		text = tag;
	}
	const d = [...document.querySelectorAll(tag), ...document.querySelectorAll(`[${tag}]`)].map(fs =>
		fs.value == text ||
		[...fs.querySelectorAll('*')].find(el => el.innerHTML.trim() === text)
	).find(el => el);
	if (isdef(d)) d.click();
	await mSleep(100);
	return d;
}
function clickOnTag(tag, text) {
	const d = [...document.querySelectorAll(tag)].map(fs =>
		fs.querySelector(`input[value="${text}"], select[value="${text}"]`) ||
		[...fs.querySelectorAll('*')].find(el => el.innerHTML.trim() === text)
	).find(el => el);
	if (isdef(d)) d.click();
	return d;
}
async function clickOnAttr(attribute, text) {
	const d = [...document.querySelectorAll(`[${attribute}]`)].find(el =>
		[...el.querySelectorAll('*')].some(child => child.innerHTML.trim().toLowerCase() === text.toLowerCase())
	);
	if (isdef(d)) d.click();
	return d;
}

async function clickOnTag(attribute, caption) {
	const d = [...document.querySelectorAll(`${attribute}`)].find(el =>
		[...el.querySelectorAll('*')].some(child => child.innerHTML.trim().toLowerCase() === caption.toLowerCase())
	);
	if (isdef(d)) d.click();
	return d;
}
function clickOnElemWithAttr(prop, val) {
	let d = document.querySelectorAll(`[${prop}="${val}"]`)[0];
	if (isdef(d)) d.click();
	return d;
}
async function clickOnPlayer(name) { return await showGameMenuPlayerDialog(name); }
async function clickOnGame(gamename) { await showGameMenu(gamename); }
async function clickOn(prop, val) {
	await mSleep(100);
	let elem = null;
	if (isDict(prop) && isdef(prop.tag)) elem = prop;
	else if (isString('prop') && nundef(val)) elem = findElementBy('innerHTML', prop);
	else if (isString('prop')) elem = findElementBy(prop, val);
	assertion(elem, `NO elem ${prop} ${val}`);
	elem.click();
}

async function showGamePlayers(dParent, users) {
	let me = UGetName();
	mStyle(dParent, { wrap: true });
	let userlist = ['amanda', 'felix', 'mimi'];
	for (const name in users) addIf(userlist, name);
	for (const name of userlist) {
		//let d = showUser(dParent,name,onclickGameMenuPlayer);
		let d = mDom(dParent, { align: 'center', padding: 2, cursor: 'pointer', border: `transparent` });
		let img = showUserImage(name, d, 40);
		let label = mDom(d, { matop: -4, fz: 12, hline: 12 }, { html: name });
		d.setAttribute('username', name)
		d.onclick = onclickGameMenuPlayer;
		let item = userToPlayer(name, DA.gamename); item.div = d; item.isSelected = false;
		DA.allPlayers[name] = item;
	}
	await setPlayerPlaying(DA.allPlayers[me], DA.gamename);
}
async function switchToMenu(evOrMenu) {
	let menu, prevElem, elem;
	if (isDict(evOrMenu)) {
		[prevElem, elem] = hToggleClassMenu(ev);
		menu = elem.getAttribute('key');
	} else {
		menu = isString(evOrMenu) ? evOrMenu : DA.menu || localStorage.getItem('menu') || 'games';
		assertion(menu, 'CATASTROPHIC FAILURE!!!');
		ev = { target: getElementWithAttribute('key', menu) };
		[prevElem, elem] = hToggleClassMenu(ev);
	}
	DA.menu = menu;
	localStorage.setItem('menu', menu);
	await updateMain();
}


async function showGamesAndTables(force = false) {
	let dTableList = mBy('dTableList') || mDom('dMain', {}, { className: 'section', id: 'dTableList' });
	M.tables = await MPollTables();
	let tables = dict2list(M.tables), me = UGetName();

	tables.map(x => {
		x.prior = x.status == 'open' ? 0 : x.turn.includes(me) ? 1 : x.playerNames.includes(me) ? 2 : 3;
		x.game_friendly = capitalize(MGetGameFriendly(x.game));
	});
	sortBy(tables, 'prior');

	// Check if tables have changed by comparing with previous state
	let hasChanges = !DA.tableList || force;
	if (!hasChanges) {
		hasChanges = DA.tableList.length !== tables.length ||
			tables.some((t, i) => t.playerNames.join() !== DA.tableList[i].playerNames.join() || t.status !== DA.tableList[i].status);
	}

	DA.tableList = tables;
	if (!hasChanges) return;
	console.log('YES has changed!');

	mClear(dTableList);
	showTables(dTableList, tables, me);
	let dGameList = mBy('dGameList') || mDom('dMain', {}, { className: 'section', id: 'dGameList' });
	mClear(dGameList);
	showGames(dGameList);

	let dGameMenu = mBy('dGameMenu');
	if (isdef(dGameMenu)) {
		console.log('removing old game menu');
		mRemove(dGameMenu); //remove old game menu if it exists
	}
}



async function onclickOpenToJoinGame() {
	let options = collectOptions();
	let players = collectPlayers();
	mRemove('dGameMenu');
	let table = createOpenTable(DA.gamename, players, options);
	let tid = table.id;
	let tData = table;
	let res = await mPhpPost('all', { action: 'create', tid, tData });
	if (res.tid) {
		console.log("Game Creation:", res.tid);
		let data = M.tables[tid] = await tableGetDefault(res.tid); console.log(data);
		M.tableFilenames.push(tid);
		DA.tid = tid; DA.tData = tData;
	} else {
		console.log("Game Creation failed");
		return null;
	}
	return table;
}
async function onclickOpenToJoinGame() {
	sysBusy();
	let options = collectOptions();
	let players = collectPlayers();
	mRemove('dGameMenu');
	let table = createOpenTable(DA.gamename, players, options);
	let tid = table.id;
	let tData = table;
	let res = await mPhpPost('all', { action: 'create', tid, tData });
	if (res.tid) {
		console.log("Game Creation:", res.tid);
		let data = M.tables[tid] = await tableGetDefault(res.tid); console.log(data);
		M.tableFilenames.push(tid);
		DA.tid = tid; DA.tData = tData;
	} else {
		console.log("Game Creation failed");
		return null;
	}
	sysIdle();
	return table;
}
function createOpenTable(gamename, players, options) {
	let me = UGetName();
	let playerNames = [me]; if (VERBOSE) console.log('me', me)
	assertion(me in players, "_createOpenTable without owner!!!!!")
	for (const name in players) { addIf(playerNames, name); }
	let table = {
		status: 'open',
		id: generateTableId(gamename, me),
		fen: null,
		game: gamename,
		owner: playerNames[0],
		friendly: generateTableName(playerNames.length, []),
		players,
		playerNames: playerNames,
		options
	};
	return table;
}
async function tableCreate(gamename, players, options) {
	if (nundef(gamename)) gamename = "setgame";
	if (nundef(players)) players = { mimi: userToPlayer('mimi', gamename), felix: userToPlayer('felix', gamename), amanda: userToPlayer('amanda', gamename) };
	if (nundef(options)) options = MGetGameOptions(gamename);
	console.log('tableCreate', gamename, players, options);
	let me = UGetName();
	let playerNames = [me]; console.log('me', me)
	assertion(me in players, "_createOpenTable without owner!!!!!")
	for (const name in players) { addIf(playerNames, name); }
	let table = {
		status: 'open',
		id: generateTableId(),
		fen: null,
		game: gamename,
		owner: playerNames[0],
		friendly: generateTableName(playerNames.length, []), //MGetTableNames()),
		players,
		playerNames: playerNames,
		options
	};
	let tid = table.id;
	let tData = table;
	let res = await mPhpPost('game_user', { action: 'create', tid, tData });
	if (res.tid) {
		console.log("Game Creation:", res.tid);
		let data = M.tables[tid] = await tableGetDefault(res.tid); console.log(data);
		M.tableFilenames.push(tid);
		DA.tid = tid; DA.tData = tData;
	} else {
		console.log("Game Creation failed");
		return null;
	}
	return table;
}


async function onclickMoreUsers() {
	let dParent = mDom(null, { gap: 10, w: '70%', rounding: 20, matop: '10%', patop: 20, bg: 'white' }, { className: 'flexCC' });
	for (const name in M.users) { showUser(dParent, name); }

	let dPopup = mDom('dPage', { position: 'absolute', top: 0, left: 0, w: '100vw', h: '100vh', z: 10000, bg: 'rgba(0,0,0,0.5)' }, { className: 'flexCS', onclick: () => mRemove(dPopup) });
	mAppend(dPopup, dParent);

	for (const d of dParent.children) {
		d.onclick = async () => { let name = d.getAttribute('username'); dPopup.remove(); await switchToUser(name); };
	}
}
async function onclickMoreUsers() {
	let dPopup = mPopup('dMain', { w: '70%', }, { shield: true });
	let d;
	let dParent = mDom(dPopup, { gap: 10, w100: true }, { className: 'flexCC' });
	for (const name in M.users) {
		showUser(dParent, name, async () => { dPopup.remove(); mBy('shield').remove(); await switchToUser(name); });
	}
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
	let [d1, d] = createPlayerOptionsPopup(dParent, name);

	for (const [key, val] of Object.entries(poss)) {
		if (!isString(val)) continue;
		let userval = lookup(DA.allPlayers, [name, key]);

		// Update UI without closing popup
		let onOptionChange = key == 'playmode'
			? (val) => {
				lookupSetOverride(DA.allPlayers, [name, key], val);
				updateUserImageToBotHuman(name);
			}
			: (val) => lookupSetOverride(DA.allPlayers, [name, key], val);

		createRadioGroup(d, key, val, userval, onOptionChange);
	}

	let [r, rp] = [getRectInt(allPlItem.div, dParent), getRectInt(d1)];
	let x = Math.min(Math.max(r.x - rp.w / 2 + r.w / 2, 0), window.innerWidth - rp.w - 100);
	mIfNotRelative(dParent);
	mPos(d1, x, r.y - rp.h - 4);

	// Close and save only on explicit actions
	const saveAndClose = () => {
		saveAndUpdatePlayerOptions(allPlItem, gamename);
		cleanup();
	};

	const cleanup = () => {
		document.removeEventListener('click', handleClickOutside);
		document.removeEventListener('keydown', handleEscape);
		if (mBy('dPlayerOptions')) mBy('dPlayerOptions').remove();
	};

	const handleClickOutside = ev => {
		if (mBy('dMenuPlayers').contains(ev.target) || d1.contains(ev.target)) return;
		saveAndClose();
	};

	const handleEscape = ev => {
		if (ev.key === 'Escape') saveAndClose();
	};

	setTimeout(() => {
		document.addEventListener('click', handleClickOutside);
		document.addEventListener('keydown', handleEscape);
	}, 0);

	mButtonX(d1, saveAndClose, 20, 0, 'dimgray');
}
function createRadioGroup(dParent, key, values, selectedValue, handler = null) {
	let list = values.split(',');
	let fs = mRadioGroup(dParent, { fg: 'black' }, `d_${key}`, formatLegend(key));

	for (const v of list) {
		let val = isNumber(v) ? Number(v) : v;
		mRadio(v, val, key, fs, { cursor: 'pointer' }, handler, key, false);
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

async function setPlayerPlaying(allPlItem, gamename) {
	let name = allPlItem.name;
	// ...existing initialization code...

	let dParent = mBy('dGameMenu');
	let bg = MGetUserColor(name);
	let [d1, d] = createOptionsPopup(dParent, name, bg);

	// ...existing options creation code...

	let [r, rp] = [getRectInt(allPlItem.div, dParent), getRectInt(d1)];
	let x = Math.min(Math.max(r.x - rp.w / 2 + r.w / 2, 0), window.innerWidth - rp.w - 100);
	mIfNotRelative(dParent);
	mPos(d1, x, r.y - rp.h - 4);
	mButtonX(d1, ev => saveAndUpdatePlayerOptions(allPlItem, gamename), 20, 0, 'dimgray');

	setupPopupClose(d1, () => saveAndUpdatePlayerOptions(allPlItem, gamename));
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
	let d1 = mDom(dParent, {
		bg: colorLight(bg, 50),
		border: `solid 2px ${bg}`,
		rounding: 6,
		display: 'inline-block',
		hPadding: 3
	}, { id: 'dPlayerOptions' });

	mDom(d1, {}, { html: name });
	let d = mDom(d1);
	mCenterFlex(d);

	for (const [key, val] of Object.entries(poss)) {
		if (!isString(val)) continue;
		let list = val.split(',');
		let fs = mRadioGroup(d, { fg: 'black' }, `d_${key}`, formatLegend(key));
		let handler = key == 'playmode' ? () => updateUserImageToBotHuman(name) : null;

		for (const v of list) {
			let val = isNumber(v) ? Number(v) : v;
			mRadio(v, val, key, fs, { cursor: 'pointer' }, handler, key, false);
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
	mButtonX(d1, ev => saveAndUpdatePlayerOptions(allPlItem, gamename), 20, 0, 'dimgray');

	const cleanup = () => {
		document.removeEventListener('click', handleClickOutside);
		document.removeEventListener('keydown', handleEscape);
	};

	const handleClickOutside = ev => {
		if (mBy('dMenuPlayers').contains(ev.target)) return;
		saveAndUpdatePlayerOptions(allPlItem, gamename);
		cleanup();
	};

	const handleEscape = ev => {
		if (ev.key === 'Escape') {
			saveAndUpdatePlayerOptions(allPlItem, gamename);
			cleanup();
		}
	};

	setTimeout(() => {
		document.addEventListener('click', handleClickOutside);
		document.addEventListener('keydown', handleEscape);
	}, 0);
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
	let [d1, d] = createPlayerOptionsPopup(dParent, name,
		() => saveAndUpdatePlayerOptions(allPlItem, gamename));

	for (const [key, val] of Object.entries(poss)) {
		if (!isString(val)) continue;
		let handler = key == 'playmode' ? () => updateUserImageToBotHuman(name) : null;
		let userval = lookup(DA.allPlayers, [name, key]);
		createRadioGroup(d, key, val, userval, handler);
	}

	let [r, rp] = [getRectInt(allPlItem.div, dParent), getRectInt(d1)];
	let x = Math.min(Math.max(r.x - rp.w / 2 + r.w / 2, 0), window.innerWidth - rp.w - 100);
	mIfNotRelative(dParent);
	mPos(d1, x, r.y - rp.h - 4);

	setupCloseHandlers(d1,
		() => saveAndUpdatePlayerOptions(allPlItem, gamename),
		'dMenuPlayers'
	);
}

async function showGamesAndTables(force = false) {
	let dTableList = createSection('dMain', 'dTableList');
	M.tables = await MPollTables();
	let tables = dict2list(M.tables), me = UGetName();
	// ...existing code for table processing...

	if (!changes && !force) return false;

	mClear(dTableList);
	showTables(dTableList, tables, me);
	let dGameList = createSection('dMain', 'dGameList');
	mClear(dGameList);
	showGames(dGameList);
	return true;
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
	let d1 = mDom(dParent, {
		bg: colorLight(bg, 50),
		border: `solid 2px ${bg}`,
		rounding: 6,
		display: 'inline-block',
		hPadding: 3
	}, { id: 'dPlayerOptions' });

	mDom(d1, {}, { html: name });
	let d = mDom(d1);
	mCenterFlex(d);

	for (const [key, val] of Object.entries(poss)) {
		if (!isString(val)) continue;
		let list = val.split(',');
		let fs = mRadioGroup(d, { fg: 'black' }, `d_${key}`, formatLegend(key));
		let handler = key == 'playmode' ? () => updateUserImageToBotHuman(name) : null;

		for (const v of list) {
			let val = isNumber(v) ? Number(v) : v;
			mRadio(v, val, key, fs, { cursor: 'pointer' }, handler, key, false);
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

	mIfNotRelative(dParent);
	let [r, rp] = [getRectInt(allPlItem.div, dParent), getRectInt(d1)];
	let x = Math.min(Math.max(r.x - rp.w / 2 + r.w / 2, 0), window.innerWidth - rp.w - 100);
	mPos(d1, x, r.y - rp.h - 4);
	mButtonX(d1, ev => saveAndUpdatePlayerOptions(allPlItem, gamename), 20, 0, 'dimgray');
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
	let d1 = mDom(dParent, {
		bg: colorLight(bg, 50),
		border: `solid 2px ${bg}`,
		rounding: 6,
		display: 'inline-block',
		hPadding: 3
	}, { id: 'dPlayerOptions' });

	mDom(d1, {}, { html: name });
	let d = mDom(d1);
	mCenterFlex(d);

	for (const [key, val] of Object.entries(poss)) {
		if (!isString(val)) continue;
		let list = val.split(',');
		let fs = mRadioGroup(d, { fg: 'black' }, `d_${key}`, formatLegend(key));
		let handler = key == 'playmode' ? () => updateUserImageToBotHuman(name) : null;

		for (const v of list) {
			let val = isNumber(v) ? Number(v) : v;
			mRadio(v, val, key, fs, { cursor: 'pointer' }, handler, key, false);
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
	mButtonX(d1, ev => saveAndUpdatePlayerOptions(allPlItem, gamename), 20, 0, 'dimgray');

	// Add click outside handler
	const handleClickOutside = ev => {
		if (!d1.contains(ev.target)) {
			saveAndUpdatePlayerOptions(allPlItem, gamename);
			document.removeEventListener('click', handleClickOutside);
			document.removeEventListener('keydown', handleEscape);
		}
	};

	// Add escape key handler 
	const handleEscape = ev => {
		if (ev.key === 'Escape') {
			saveAndUpdatePlayerOptions(allPlItem, gamename);
			document.removeEventListener('click', handleClickOutside);
			document.removeEventListener('keydown', handleEscape);
		}
	};

	// Small delay to avoid immediate trigger of click outside
	setTimeout(() => {
		document.addEventListener('click', handleClickOutside);
		document.addEventListener('keydown', handleEscape);
	}, 0);
}

function makeADivWithSvg0(d, x, r, sz, gap, clip, bg, territory) {
	let html = `
						<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
							<polygon
								points="50,1 100,26 100,74 50,100 1,75 1,25"
								fill="${bg}"
								stroke="${territory == 'puma' ? 'red' : territory == 'bear' ? 'silver' : bg}"
								stroke-width="2"
								${territory == 'puma' || territory == 'bear' ? 'stroke-dasharray="2,2"' : ''}
								stroke-linejoin="round"
							/>
						</svg>

			`; //vector-effect="non-scaling-stroke" points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"


	let db = mDom(d, { position: 'absolute', left: x * sz * .5, top: r * sz * .75, w: sz, h: sz }, { html });

	let shrink = 4;
	// if (territory == 'puma') { shrink = 4; mStyle(db, getDashedHexBorder('red', bg)); }
	// else if (territory == 'bear') { shrink = 4; mStyle(db, getDashedHexBorder('silver', bg)); }
	// else { shrink = 4; mStyle(db, { bg }); } //shrink=4;
	let d1 = mDom(db, { cursor: 'pointer', left: 2, top: 2, clip, position: 'absolute', w: sz - (gap + shrink), h: sz - (gap + shrink), bg: 'transparent' });

	mCenterCenterFlex(d1);
	return d1;

}

function hexWithBorder0(d, styles = {}) {
	d = toElem(d);
	let [w, h] = mSizeSuccession(styles, 100);
	html = `
		<div class="hex-wrapper">
			<div class="hex-border"></div>
			<div class="hex-content"></div>
		</div>

		<style>
		.hex-wrapper {
			position: relative;
			width: ${w}px;
			height: ${h}px; /* ~height of a hexagon with 200px width */
		}

		.hex-border,
		.hex-content {
			position: absolute;
			width: 100%;
			height: 100%;
			clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
		}

		.hex-border {
			background: repeating-linear-gradient(60deg, black 0 5px, transparent 5px 10px);
			z-index: 1;
		}

		.hex-content {
			background: white;
			z-index: 0;
		}
		</style>

		`;
	return mDom(d, {}, { html });
}

function hexWithBorder1(d, styles = {}) {
	d = toElem(d);
	let [w, h] = mSizeSuccession(styles, 100);
	html = `
		<div class="hex-wrapper">
			<svg class="hex-border" viewBox="0 0 100 100" preserveAspectRatio="none">
				<polygon points="50,0 100,25 100,75 50,100 0,75 0,25"
								fill="white" stroke="black" stroke-width="4"
								stroke-dasharray="4,4" />
			</svg>
			<div class="hex-content"></div>
		</div>

		<style>
		.hex-wrapper {
			position: relative;
			width: 200px;
			height: 173.2px; /* width * sqrt(3)/2 */
		}

		.hex-border {
			position: absolute;
			width: 100%;
			height: 104%;
			z-index: 0;
		}

		.hex-content {
			position: absolute;
			width: 96%;
			margin-left: 2%;
			height: 100%;
			background: white;
			clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
			z-index: 1;
		}
		</style>

				`;
	return mDom(d, {}, { html });
}

function hexWithBorder2(d, styles = {}) {
	d = toElem(d);
	let [w, h] = mSizeSuccession(styles, 100);
	html = `
		<div class="hex-wrapper">
			<svg class="hex-border" viewBox="0 0 100 100" preserveAspectRatio="none">
				<polygon points="50,0 100,25 100,75 50,100 0,75 0,25"
								fill="white" stroke="black" stroke-width="4"
								stroke-dasharray="4,4" />
			</svg>
		</div>

		<style>
		.hex-wrapper {
			position: relative;
			width: 200px;
			height: 173.2px; /* width * sqrt(3)/2 */
		}

		.hex-border {
			position: absolute;
			width: 100%;
			height: 100%;
			z-index: 0;
		}

		.hex-content {
			display: none;
			position: absolute;
			width: 96%;
			margin-left: 2%;
			height: 100%;
			background: white;
			clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
			z-index: 1;
		}
		</style>

				`;
	return mDom(d, {}, { html });
}

function hexWithBorder3(d, styles = {}) {
	d = toElem(d);
	let [w, h] = mSizeSuccession(styles, 100);
	html = `
		<div class="hex-wrapper">
			<svg class="hex-border" viewBox="0 0 100 100" preserveAspectRatio="none">
				<polygon points="50,4 96,27 96,73 50,96 4,73 4,27"
								fill="white" stroke="black" stroke-width="4"
								stroke-dasharray="4,4" />
			</svg>
		</div>

		<style>
		.hex-wrapper {
			position: relative;
			width: 200px;
			height: 173.2px;
		}

		.hex-border {
			position: absolute;
			width: 100%;
			height: 100%;
			display: block;
		}
		</style>
		`;
	return mDom(d, {}, { html });
}

function hexWithBorder(d, styles = {}) {
	d = toElem(d);
	let [w, h] = mSizeSuccession(styles, 100);
	html = `
		<div class="hex-wrapper">
			<svg class="hex-border" viewBox="0 0 100 100" preserveAspectRatio="none">
				<polygon
					points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
					fill="white"
					stroke="black"
					stroke-width="2"
					stroke-dasharray="2,2"
					stroke-linejoin="round"
					vector-effect="non-scaling-stroke"
				/>
			</svg>
		</div>

		<style>
		.hex-wrapper {
			width: 200px;
			height: 173.2px; /* width * sqrt(3)/2 for regular hex */
			position: relative;
		}

		.hex-border {
			width: 100%;
			height: 100%;
			display: block;
		}
		</style>
		`;
	return mDom(d, {}, { html });
}

function cryBoard1(dParent, cols, rows, sz) {
	dParent = toElem(dParent);
	let [w, h] = [sz * cols + sz + 20, (sz * .75) * cols + 40];
	//let [cols, rows, sz] = [9, 10, 80];
	// let w=sz*cols+sz+20;
	// let h=(sz*.75)*cols+40;
	let dBoard = mDom(dParent, { w, h, bg: 'black' });//(sz/.7)*rows+sz+20});//,acontent:'center',jcontent:'center' });

	let d = mDom(dBoard, { gap: 0, margin: 0, position: 'relative' });

	let clip = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';

	let dihab = { mountain: 'gray', desert: 'yellow', forest: 'green', water: 'blue', swamp: 'brown' };
	let diterr = { all: null, bear: 'black', puma: 'red' };

	let items = [];
	for (let r = 0; r < rows; r++) {
		let x = r % 2;
		let thiscols = x > 0 ? cols : cols + 1;
		for (let c = 0; c < cols; c++) {

			let gap = 0;
			let habitat = rChoose(Object.keys(dihab));
			let territory = rChoose(Object.keys(diterr));
			let bg = dihab[habitat];

			let html = `
						<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
							<polygon
								points="50,1 100,26 100,74 50,100 1,75 1,25"
								fill="${bg}"
								stroke="${territory == 'puma' ? 'red' : territory == 'bear' ? 'silver' : bg}"
								stroke-width="2"
								${territory == 'puma' || territory == 'bear' ? 'stroke-dasharray="2,2"' : ''}
								stroke-linejoin="round"
							/>
						</svg>

			`; //vector-effect="non-scaling-stroke" points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"


			let db = mDom(d, { position: 'absolute', left: x * sz * .5, top: r * sz * .75, w: sz, h: sz }, { html });

			let shrink = 4;
			// if (territory == 'puma') { shrink = 4; mStyle(db, getDashedHexBorder('red', bg)); }
			// else if (territory == 'bear') { shrink = 4; mStyle(db, getDashedHexBorder('silver', bg)); }
			// else { shrink = 4; mStyle(db, { bg }); } //shrink=4;
			let d1 = mDom(db, { cursor: 'pointer', left: 2, top: 2, clip, position: 'absolute', w: sz - (gap + shrink), h: sz - (gap + shrink), bg: 'transparent' });

			x += 2;
			mCenterCenterFlex(d1);
			items.push({ r, c, div: d1, habitat, territory })
		}
	}
	return items;
}
function cryBoard_orig(dParent, cols, rows, sz) {
	dParent = toElem(dParent);
	let [w, h] = [sz * cols + sz + 20, (sz * .75) * cols + 40];
	//let [cols, rows, sz] = [9, 10, 80];
	// let w=sz*cols+sz+20;
	// let h=(sz*.75)*cols+40;
	let dBoard = mDom(dParent, { w, h });//(sz/.7)*rows+sz+20});//,acontent:'center',jcontent:'center' });

	let d = mDom(dBoard, { gap: 10, margin: 10, position: 'relative' });

	let clip = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';

	let dihab = { mountain: 'gray', desert: 'yellow', forest: 'green', water: 'blue', swamp: 'brown' };
	let diterr = { all: null, bear: 'black', puma: 'red' };

	let items = [];
	for (let r = 0; r < rows; r++) {
		let x = r % 2;
		let thiscols = x > 0 ? cols : cols + 1;
		for (let c = 0; c < cols; c++) {
			//let db=mDom(d,{bg:'white',clip,w:sz-1, h:sz-1, position:'absolute', left:x*sz*.5, top:r*sz*.75}); //, bg:rChoose(Object.keys(dihab))})
			//let db=mDom(d,{className:'hex1',clip,w:sz-1, h:sz-1, position:'absolute', left:x*sz*.5, top:r*sz*.75}); //, bg:rChoose(Object.keys(dihab))})
			let gap = 0;
			let db = mDom(d, { clip, w: sz - gap, h: sz - gap, position: 'absolute', left: x * sz * .5, top: r * sz * .75 }); //, bg:rChoose(Object.keys(dihab))})

			let shrink = 0;
			let habitat = rChoose(Object.keys(dihab));
			let territory = rChoose(Object.keys(diterr));
			let bg = dihab[habitat];

			if (territory == 'puma') { shrink = 4; mStyle(db, getDashedHexBorder('red', bg)); }
			else if (territory == 'bear') { shrink = 4; mStyle(db, getDashedHexBorder('silver', bg)); }
			else { shrink = 4; mStyle(db, { bg }); } //shrink=4;
			let d1 = mDom(db, { left: 2, top: 2, clip, position: 'absolute', w: sz - (gap + shrink), h: sz - (gap + shrink), bg });
			//return;
			//let d1 = mDom(d, { left: x * sz *.5, top: r * sz*.75, clip, position: 'absolute', w: sz-4, h: sz-4, bg: rChoose(Object.values(dihab)) });
			//mStyle(d1,{className:'hex'})
			x += 2;
			mCenterCenterFlex(d1);
			items.push({ r, c, div: d1, habitat, territory })
		}
	}
	return items;
}
function getDashedHexBorder(color, bg = 'transparent') {
	//return {border:'2px solid white'} NO
	//return {bg:color};
	return {
		background: `repeating-linear-gradient(0deg, ${color}, ${color} 4px, ${bg} 4px, ${bg} 10px),
		repeating-linear-gradient(60deg, ${color}, ${color} 4px, ${bg} 4px, ${bg} 10px)`
	}
	bg = 'transparent';
	return {
		background: `repeating-linear-gradient(-60deg, ${color}, ${color} 4px, ${bg} 4px, ${bg} 10px),
    repeating-linear-gradient(60deg, ${color}, ${color} 4px, ${bg} 4px, ${bg} 10px),
    repeating-linear-gradient(0deg, ${color}, ${color} 4px, ${bg} 4px, ${bg} 10px)`,
		bgSize: '100% 100%'

	}
	return {
		background: `repeating-linear-gradient(-60deg, ${color}, ${color} 4px, transparent 4px, transparent 10px)`,
		// repeating - linear - gradient(
		//   60deg, red, red 4px, transparent 4px, transparent 10px
		// ),
		// repeating - linear - gradient(
		//   0deg, red, red 4px, transparent 4px, transparent 10px
		// );
		bgSize: '100% 100%'
	};
}


async function initTest1() {
	API_BASE = getBackendUrl();
	DA.items = {};
	DA.selectedImages = [];
	await loadAssetsStatic();
	stickyHeaderCode();
	let elems = mLayoutLM('dPage');
	mStyle('dMain', { overy: 'auto' });
	let dLeft = mBy('dLeft');
	mStyle(dLeft, { overy: 'auto' });

	document.addEventListener("visibilitychange", handleVisibilityChange);
	DA.pollInterval = 3000;
	DA.pollCounter = 0;
	DA.backendURL = getServer(true) + 'simple0/php'; //'https://moxito.online/mox/simple0/php';
	DA.gamelist = ['setgame', 'button96']; //'accuse aristo bluff ferro fishgame fritz huti lacuna nations setgame sheriff spotit wise'; if (DA.TEST0) gamelist += ' a_game'; gamelist = toWords(gamelist);
	DA.funcs = { setgame: setgame(), button96: button96() }; //implemented games!
	for (const gname in DA.gamelist) {
		if (isdef(DA.funcs[gname])) continue;
		DA.funcs[gname] = defaultGameFunc();
	}
	DA.evList = [];

	M.tables = await MPollTables();
	// let elems = mLayoutTM('dPage'); mStyle('dMain', { overy: 'auto', fg: 'inherit' }); mCenterFlex('dMain');
	mLayoutTopTestExtraMessageTitle('dTop');
	let username = localStorage.getItem('username') ?? 'hans';
	if (TESTING) {
		let names = ['amanda', 'felix', 'lauren', 'mimi', 'gul'];
		let d = mBy('dTestRight'); mClass(d, 'button_container'); //mFlex(d);
		for (const name of names) { let b = mDom(d, {}, { tag: 'button', html: name, onclick: async (ev) => await switchToUser(name) }); }
		username = rChoose(names);
	}
	await showMenuButtons();
	if (TESTING) await showTestButtons();

}

//#region minimax ALL

function maxNttt() {
	function maxN(state, depth, players, currentPlayerIdx, evaluate, getLegalMoves, applyMove, isTerminal) {
		if (depth === 0 || isTerminal(state)) {
			return {
				move: null,
				score: evaluate(state)
			};
		}

		const currentPlayer = players[currentPlayerIdx];
		let bestScore = null;
		let bestMove = null;

		for (const move of getLegalMoves(state, currentPlayer)) {
			const newState = applyMove(state, move, currentPlayer);
			const result = maxN(
				newState,
				depth - 1,
				players,
				(currentPlayerIdx + 1) % players.length,
				evaluate,
				getLegalMoves,
				applyMove,
				isTerminal
			);

			if (
				!bestScore ||
				result.score[currentPlayerIdx] > bestScore[currentPlayerIdx]
			) {
				bestScore = result.score;
				bestMove = move;
			}
		}

		return { move: bestMove, score: bestScore };
	}
	function getLegalMoves(board, player) {
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

	function applyMove(board, move, player) {
		const newBoard = board.map(row => row.slice()); // deep copy
		newBoard[move.row][move.col] = player;
		return newBoard;
	}

	function isTerminal(board) {
		return board.flat().every(cell => cell !== null);
	}

	function evaluate(board) {
		// Dummy evaluation: count number of cells each player owns
		const scores = {};
		for (let row of board) {
			for (let cell of row) {
				if (cell != null) {
					scores[cell] = (scores[cell] || 0) + 1;
				}
			}
		}

		// Return scores as a vector ordered by player ID
		return ['A', 'B', 'C'].map(p => scores[p] || 0);
	}
}

function minimaxAlphaBeta(board, depth, alpha, beta, isMaximizingPlayer, get_possible_moves, evaluate_board, apply_move) {
	const possibleMoves = get_possible_moves(board, isMaximizingPlayer);

	if (depth === 0 || possibleMoves.length === 0) {
		return evaluate_board(board, depth);
	}

	if (isMaximizingPlayer) {
		let maxEval = -Infinity;
		for (const move of possibleMoves) {
			// Apply the move to get a new board state
			// IMPORTANT: apply_move must return a NEW board object, not modify the original.
			const newBoard = apply_move(board, move);

			// Recursively call minimax for the opponent's turn
			const evalScore = minimaxAlphaBeta(newBoard, depth - 1, alpha, beta, false, get_possible_moves, evaluate_board, apply_move);
			maxEval = Math.max(maxEval, evalScore);
			alpha = Math.max(alpha, evalScore);

			// Alpha-Beta Pruning: if beta <= alpha, the minimizing player (parent)
			// already has a better option, so we can prune this branch.
			if (beta <= alpha) {
				break;
			}
		}
		return maxEval;
	} else { // Minimizing player
		let minEval = Infinity;
		for (const move of possibleMoves) {
			// Apply the move to get a new board state
			const newBoard = apply_move(board, move);

			// Recursively call minimax for the opponent's turn
			const evalScore = minimaxAlphaBeta(newBoard, depth - 1, alpha, beta, true, get_possible_moves, evaluate_board, apply_move);
			minEval = Math.min(minEval, evalScore);
			beta = Math.min(beta, evalScore);

			// Alpha-Beta Pruning: if beta <= alpha, the maximizing player (parent)
			// already has a better option, so we can prune this branch.
			if (beta <= alpha) {
				break;
			}
		}
		return minEval;
	}
}

function findBestMove(initialBoard, depth, get_possible_moves, evaluate_board, apply_move, isMaximizingPlayerInitially = true) {
	if (depth <= 0) {
		console.error("Search depth must be greater than 0.");
		return { move: null, score: evaluate_board(initialBoard, 0) };
	}

	let bestMove = null;
	let bestValue;

	const possibleMoves = get_possible_moves(initialBoard, isMaximizingPlayerInitially);

	if (possibleMoves.length === 0) {
		// No moves possible from the initial state (e.g., game already over)
		return { move: null, score: evaluate_board(initialBoard, depth) };
	}

	if (isMaximizingPlayerInitially) {
		bestValue = -Infinity;
		for (const move of possibleMoves) {
			const newBoard = apply_move(initialBoard, move);
			// For the next level, it's the opponent's turn (minimizing player)
			// Initial alpha is -Infinity, initial beta is Infinity for the children of the root.
			const value = minimaxAlphaBeta(newBoard, depth - 1, -Infinity, Infinity, false, get_possible_moves, evaluate_board, apply_move);
			if (value > bestValue) {
				bestValue = value;
				bestMove = move;
			}
			// Note: No alpha/beta update at the root for choosing the *best move* itself,
			// alpha/beta is for pruning *within* the minimaxAlphaBeta calls.
			// However, if you wanted to pass the root's evolving alpha/beta to its children,
			// you could, but the standard approach is to re-initialize for each child's minimax call.
		}
	} else { // Initial player is minimizing
		bestValue = Infinity;
		for (const move of possibleMoves) {
			const newBoard = apply_move(initialBoard, move);
			// For the next level, it's the opponent's turn (maximizing player)
			const value = minimaxAlphaBeta(newBoard, depth - 1, -Infinity, Infinity, true, get_possible_moves, evaluate_board, apply_move);
			if (value < bestValue) {
				bestValue = value;
				bestMove = move;
			}
		}
	}

	return { move: bestMove, score: bestValue };
}

// --- Example Placeholder Functions (User must implement these for their specific game) ---

/*
function example_get_possible_moves(board, isMaximizingPlayer) {
		// CONSOLE LOGGING FOR DEBUG PURPOSES
		// console.log(`get_possible_moves called for player: ${isMaximizingPlayer ? 'Maximizing' : 'Minimizing'} on board:`, JSON.stringify(board));

		// Implement game-specific logic to find all valid moves
		// Example for a simple linear game where moves are just numbers to add/subtract
		const moves = [];
		if (board.value < 10 && board.value > -10) { // Some arbitrary game condition
				moves.push({ action: 'add', amount: 1 });
				moves.push({ action: 'add', amount: 2 });
				if (isMaximizingPlayer) {
						 moves.push({ action: 'special_max_move', amount: 5 });
				} else {
						 moves.push({ action: 'special_min_move', amount: -3 });
				}
		}
		// console.log("Possible moves:", moves);
		return moves;
}

function example_apply_move(board, move) {
		// CONSOLE LOGGING FOR DEBUG PURPOSES
		// console.log(`apply_move called with move:`, move, `on board:`, JSON.stringify(board));

		// IMPORTANT: Create a DEEP COPY of the board to avoid modifying the original
		const newBoard = JSON.parse(JSON.stringify(board)); // Simple deep copy for object/array based boards

		// Implement game-specific logic to apply the move
		if (move.action === 'add') {
				newBoard.value += move.amount;
		} else if (move.action === 'special_max_move') {
				newBoard.value += move.amount;
				newBoard.max_used_special = true;
		} else if (move.action === 'special_min_move') {
				newBoard.value += move.amount;
				newBoard.min_used_special = true;
		}
		// console.log("New board state:", newBoard);
		return newBoard;
}

function example_evaluate_board(board, currentDepth) {
		// CONSOLE LOGGING FOR DEBUG PURPOSES
		// console.log(`evaluate_board called at depth ${currentDepth} for board:`, JSON.stringify(board));

		// Implement game-specific heuristic evaluation
		// Higher score is better for the maximizing player
		// Check for terminal states (win/loss/draw)
		if (board.value >= 10) return Infinity; // Max player wins
		if (board.value <= -10) return -Infinity; // Min player wins (Max loses)

		let score = board.value;
		// Example heuristic: give bonus for using special move
		if (board.max_used_special) score += 2;
		if (board.min_used_special) score -= 1; // Assuming this is bad for max player

		// console.log("Evaluated score:", score);
		return score;
}
*/

function setupGame() {
	// --- Example Usage (Illustrative - requires the example functions above to be uncommented and adapted) ---
	const initialBoardState = { value: 0 }; // Example board state
	const searchDepth = 3; // How many moves ahead to look

	console.log("Finding best move for Maximizing Player...");
	const resultMax = findBestMove(
		initialBoardState,
		searchDepth,
		example_get_possible_moves,
		example_evaluate_board,
		example_apply_move,
		true // isMaximizingPlayerInitially
	);
	console.log("Best move for Maximizing Player:", resultMax.move, "with score:", resultMax.score);

	/*    
	const slightlyDifferentBoard = { value: 1 };
	console.log("\nFinding best move for Minimizing Player (if they were to start)...");
	const resultMin = findBestMove(
			slightlyDifferentBoard,
			searchDepth,
			example_get_possible_moves,
			example_evaluate_board,
			example_apply_move,
			false // isMaximizingPlayerInitially
	);
	console.log("Best move for Minimizing Player:", resultMin.move, "with score:", resultMin.score);
	*/


}

//#endregion

//#region mStylesX mit Cache
// === Cached style key processing ===
const _mStyleCache = new Map();
const NO_UNIT_KEYS = ['opacity', 'flex', 'grow', 'shrink', 'grid', 'z', 'iteration', 'count', 'orphans', 'widows', 'weight', 'order', 'index'];

function mStylesX(styles) {
	let res = {};
	for (const k in styles) {
		let origKey = k, val = styles[k];

		// === Lookup + cache transformed key/value handling ===
		let cacheEntry = _mStyleCache.get(k);
		if (!cacheEntry) {
			let newKey = k, converter = null;
			if (k in STYLES) {
				const mapped = STYLES[k];
				if (typeof mapped == 'function') {
					converter = mapped;
				} else if (Array.isArray(mapped)) {
					[newKey, val] = mapped; // fixed output
					_mStyleCache.set(k, [newKey, null, true]);
					res[newKey] = val;
					continue;
				} else if (typeof mapped == 'string') {
					newKey = mapped;
				} else {
					val = mapped;
				}
			}
			const needsPx = !NO_UNIT_KEYS.some(x => newKey.includes(x)) && newKey !== 'fz';
			_mStyleCache.set(k, [newKey, converter, needsPx]);
			cacheEntry = [newKey, converter, needsPx];
		}

		let [key, fn, needsPx] = cacheEntry;
		if (fn) {
			val = fn(val);
			if (Array.isArray(val)) [key, val] = val;
		}
		if (typeof val === 'number' && needsPx) val = val + 'px';
		res[key] = val;
	}
	return res;
}

function mStyleX(elem, styles = {}, opts = {}) {
	elem = toElem(elem);
	const styleObj = mStylesX(styles);
	for (const key in styleObj) {
		elem.style.setProperty(key, styleObj[key]);
	}
	applyOpts(elem, opts);
}

//#endregion

function genttt() {
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
	function isTerminal(board, players, winLength) {
		return players.some(p => hasWon(board, p, winLength)) || getLegalMoves(board).length === 0;
	}
	function evaluate(board, players, winLength) {
		const scores = players.map(p => {
			if (hasWon(board, p, winLength)) return 1000;
			let partialLines = countPartialLines(board, p, winLength - 1);
			return partialLines;
		});
		return scores;
	}
	function hasWon(board, player, winLength) {
		const rows = board.length;
		const cols = board[0].length;

		const directions = [
			{ dr: 0, dc: 1 },   // horizontal
			{ dr: 1, dc: 0 },   // vertical
			{ dr: 1, dc: 1 },   // diagonal down-right
			{ dr: 1, dc: -1 }   // diagonal down-left
		];

		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				if (board[r][c] !== player) continue;

				for (let { dr, dc } of directions) {
					let count = 0;
					for (let k = 0; k < winLength; k++) {
						const nr = r + dr * k;
						const nc = c + dc * k;
						if (
							nr >= 0 && nr < rows &&
							nc >= 0 && nc < cols &&
							board[nr][nc] === player
						) {
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

}

function unhighlightAll() {
	if (DA.pathHighlighted) {
		DA.pathHighlighted.forEach(i => DA.polygons[i].classList.remove('highlight'));
	} else if (DA.firstSelected !== null) {
		DA.polygons[DA.firstSelected].classList.remove('highlight');
	}
	DA.firstSelected = null;
	DA.pathHighlighted = null;
}

function highlightPath(path) {
	path.forEach(i => DA.polygons[i].classList.add('highlight'));
	DA.pathHighlighted = path;
}
function shortestFacePath(neighbors, face1, face2) {
	if (face1 === face2) return [face1];

	const queue = [face1];
	const visited = new Set([face1]);
	// To reconstruct path: child face → parent face
	const parentMap = new Map();

	while (queue.length > 0) {
		const current = queue.shift();

		const nbrs = neighbors[current] || [];
		for (const nbr of nbrs) {
			if (!visited.has(nbr)) {
				visited.add(nbr);
				parentMap.set(nbr, current);
				if (nbr === face2) {
					// reconstruct path from face2 to face1
					const path = [];
					let f = face2;
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

	// No path found
	return null;
}
function onPolygonClick(clickedIndex) {
	if (DA.firstSelected === null) {
		// No selection yet, highlight clicked polygon
		DA.firstSelected = clickedIndex;
		DA.polygons[clickedIndex].classList.add('highlight');
	} else if (DA.pathHighlighted === null) {
		// One polygon selected, highlight path from DA.firstSelected to clickedIndex
		if (clickedIndex === DA.firstSelected) {
			// Clicked same polygon again: maybe do nothing or unselect
			return;
		}
		const path = shortestFacePath(neighbors, DA.firstSelected, clickedIndex);
		if (path) {
			// Remove highlight from DA.firstSelected only
			DA.polygons[DA.firstSelected].classList.remove('highlight');
			highlightPath(path);
		} else {
			// No path found, maybe alert or ignore
			console.log('No path found');
		}
	} else {
		// Path is highlighted, unhighlight everything and start over
		unhighlightAll();
		DA.firstSelected = clickedIndex;
		DA.polygons[clickedIndex].classList.add('highlight');
	}
}


class _AbstractTile extends ValueBlend {
	constructor(tessagon, options = {}) {
		super(options);
		this.tessagon = tessagon;
		this.f = tessagon.f;

		this.u_symmetric = options.u_symmetric || false;
		this.v_symmetric = options.v_symmetric || false;
		this.rot_symmetric = options.rot_symmetry || null;

		this.id = options.id || null;
		this.fingerprint = options.fingerprint || null;

		this.corners = null;
		this._initCorners(options);

		this.neighbors = { top: null, bottom: null, left: null, right: null };
		this.twist = { top: false, bottom: false, left: false, right: false };
	}

	set_neighbors(neighbors = {}) {
		for (const key of ['top', 'bottom', 'left', 'right']) {
			if (neighbors[key]) this.neighbors[key] = neighbors[key];
		}
	}

	get_neighbor_tile(neighbor_keys) {
		let tile = this;
		for (const key of this._neighbor_path(neighbor_keys)) {
			if (!tile.neighbors[key]) return null;
			tile = tile.neighbors[key];
		}
		return tile;
	}

	get left() { return this.get_neighbor_tile(['left']); }
	get right() { return this.get_neighbor_tile(['right']); }
	get top() { return this.get_neighbor_tile(['top']); }
	get bottom() { return this.get_neighbor_tile(['bottom']); }

	inspect(options = {}) {
		if (!this.id) return;
		const prefix = options.tile_number ? `Tile #${options.tile_number}` : 'Tile';
		console.log(`${prefix} (${this.constructor.name}):`);
		console.log(`  - self:      ${this.id}`);
		console.log('  - neighbors:');
		for (const key of ['top', 'left', 'right', 'bottom']) {
			const neighbor = this.neighbors[key];
			if (neighbor && neighbor.id) {
				console.log(`    - ${this._neighbor_str(key)}`);
			}
		}
		console.log(
			`  - corners: (${this.corners[2][0].toFixed(4)}, ${this.corners[2][1].toFixed(4)})  ` +
			`(${this.corners[3][0].toFixed(4)}, ${this.corners[3][1].toFixed(4)})`
		);
		console.log(
			`             (${this.corners[0][0].toFixed(4)}, ${this.corners[0][1].toFixed(4)})  ` +
			`(${this.corners[1][0].toFixed(4)}, ${this.corners[1][1].toFixed(4)})`
		);
		console.log('  - twist:', this.twist);
		if (this.fingerprint) console.log('  - fingerprint:', this.fingerprint);
		console.log('');
	}

	_get_nested_list_value(list, keys) {
		if (!Array.isArray(keys)) return list[keys];
		return keys.reduce((ref, key) => ref[key], list);
	}

	_set_nested_list_value(list, keys, value) {
		if (!Array.isArray(keys)) {
			list[keys] = value;
			return;
		}
		const lastKey = keys.pop();
		const ref = this._get_nested_list_value(list, keys);
		ref[lastKey] = value;
	}

	_neighbor_path(keys) {
		if (keys.length < 2) return keys;
		if (this._should_twist_u(keys) && ['top', 'bottom'].includes(keys[0])) {
			return [keys[1], keys[0]];
		}
		if (this._should_twist_v(keys) && ['left', 'right'].includes(keys[0])) {
			return [keys[1], keys[0]];
		}
		return keys;
	}

	_index_path(keys, neighbor_keys) {
		let path = keys;
		if (this._should_twist_u(neighbor_keys)) path = this._u_flip(path);
		if (this._should_twist_v(neighbor_keys)) path = this._v_flip(path);
		return path;
	}

	_permute_value(keys, vals) {
		if (Array.isArray(keys)) return keys.map(k => this._permute_value(k, vals));
		const i = vals.indexOf(keys);
		return i !== -1 ? vals[(i + 1) % vals.length] : keys;
	}

	_swap_value(keys, a, b) {
		return this._permute_value(keys, [a, b]);
	}

	_u_flip(keys) {
		return this.u_symmetric ? this._swap_value(keys, 'left', 'right') : keys;
	}

	_v_flip(keys) {
		return this.v_symmetric ? this._swap_value(keys, 'top', 'bottom') : keys;
	}

	_rotate_index(keys) {
		if (!this.rot_symmetric) return keys;
		if (this.rot_symmetric === 180) {
			let rotated = this._permute_value(keys, ['rotate0', 'rotate180']);
			rotated = this._permute_value(rotated, ['left', 'right']);
			rotated = this._permute_value(rotated, ['top', 'bottom']);
			return rotated;
		}
		if (this.rot_symmetric === 90) {
			return this._permute_value(keys, ['rotate0', 'rotate90', 'rotate180', 'rotate270']);
		}
		return keys;
	}

	_v_index(keys) {
		if (keys.includes('bottom')) return 'bottom';
		if (keys.includes('top')) return 'top';
		throw new Error(`No v_index in ${keys}`);
	}

	_u_index(keys) {
		if (keys.includes('left')) return 'left';
		if (keys.includes('right')) return 'right';
		throw new Error(`No u_index in ${keys}`);
	}

	_should_twist_u(keys) {
		return ['top', 'bottom'].some(k => this.twist[k] && keys.includes(k));
	}

	_should_twist_v(keys) {
		return ['left', 'right'].some(k => this.twist[k] && keys.includes(k));
	}

	_neighbor_str(key) {
		const neighbor = this.neighbors[key];
		return neighbor ? `${key}: ${neighbor.id}` : `${key}: None`;
	}
}

function precomputePolygonNeighbors(groupElement) {
	if (!groupElement || !(groupElement instanceof SVGGElement)) {
		console.error("Invalid group element.");
		return;
	}

	const polygons = Array.from(groupElement.querySelectorAll('polygon'));

	// Ensure each polygon has an ID
	polygons.forEach((polygon, i) => {
		if (!polygon.id) {
			polygon.id = `poly-${i}`;
		}
	});

	// Helper to parse points into Set of strings "x,y"
	function getPointSet(polygon) {
		return new Set(
			polygon.getAttribute('points')
				.trim()
				.split(/\s+/)
				.map(p => p.trim())
		);
	}

	// Map polygon ID to its point set
	const pointSets = new Map();
	polygons.forEach(p => {
		pointSets.set(p.id, getPointSet(p));
	});

	// Compute neighbors by comparing shared points
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
				if (neighbor) {
					neighbor.style.fill = fillColor;
				}
			});
		});

		polygon.addEventListener('mouseover', () => {
			polygon.style.cursor = 'pointer';
		});
	});
}


function onclickPoly(ev) {
	console.log('Polygon clicked:', ev.target);
	ev.target.style.fill = rColor();
}
function onenterPoly(ev) {
	console.log('Polygon enter:', ev.target);
	ev.target.style.fill = rColor();
}
function onleavePoly(ev) {
	console.log('Polygon leave:', ev.target);
	ev.target.style.fill = rColor();
}
async function showTessellation(ev) {
	let name = ev.target.innerHTML;
	const response = await fetch(`http://localhost:5000/tesvg?u=${2}&v=${2}&shape=${name}`);
	//console.log(response)
	const res = await response.text();
	console.log(res)
	//let o = JSON.parse(res);
	mClear('dMain')
	let d = mBy('dMain');
	let html = `
		<svg id="svg2" width="500" height="500" viewBox="0 0 1 1" xmlns="http://www.w3.org/2000/svg" stroke="black"
			fill="lightblue" stroke-width="0.005">
			${res}
		</svg>
		`;
	d.innerHTML = html;

	// mBy(svg2).innerHTML = res;
	// createTessellationDivs(d, o.face_list, o.vert_list);
	const gElement = document.querySelector('g');
	addPolygonNeighborClick(gElement);
	addPolygonEvents(gElement, onclickPoly, onenterPoly, onleavePoly);
	// addPolygonEvents(
	// 	gElement,
	// 	(event) => {
	// 	},
	// 	(event) => {
	// 		if (event) {
	// 			event.target.style.stroke = 'black';
	// 			event.target.style.strokeWidth = '2';
	// 		} else {
	// 			// Hover out: reset stroke
	// 			gElement.querySelectorAll('polygon').forEach(p => {
	// 				p.style.stroke = '';
	// 				p.style.strokeWidth = '';
	// 			});
	// 		}
	// 	}
	// );
}
function createTessellationDivs(container, faces, vertices, options = {}) {
	const width = options.width || 600;
	const height = options.height || 600;
	const scaleX = options.scaleX || 1;
	const scaleY = options.scaleY || 1;
	const tileClass = options.tileClass || 'tessagon-tile';
	const tileStyle = options.tileStyle || {}; // Additional styles per tile

	container.style.position = 'relative';
	container.style.width = width + 'px';
	container.style.height = height + 'px';

	// Clear previous tiles
	container.innerHTML = '';

	console.log('faces', faces)
	faces.forEach((face, i) => {
		const div = document.createElement('div');
		div.className = tileClass;

		// Build polygon clip-path from face vertex indices
		const polygonPoints = face.map(idx => {
			const [x, y] = vertices[idx];
			// Scale and convert to percentage relative to container size
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

		// Optional styling
		div.style.backgroundColor = options.backgroundColor || `hsl(${(i * 30) % 360}, 60%, 70%)`;
		div.style.border = options.border || '1px solid #333';
		div.style.boxSizing = 'border-box';

		// Apply any extra styles
		Object.entries(tileStyle).forEach(([k, v]) => div.style[k] = v);

		container.appendChild(div);
	});
}
function getPolygonCentersFromG(gElement) {
	// If input is a string, parse it to a DOM element
	if (typeof gElement === 'string') {
		const parser = new DOMParser();
		const doc = parser.parseFromString(`<svg>${gElement}</svg>`, 'image/svg+xml');
		gElement = doc.querySelector('g');
	}

	const polygons = gElement.querySelectorAll('polygon');
	const centers = [];

	polygons.forEach(polygon => {
		const pointsStr = polygon.getAttribute('points').trim();
		// Parse points into array of {x, y}
		const points = pointsStr.split(/\s+/).map(pair => {
			const [x, y] = pair.split(',').map(Number);
			return { x, y };
		});

		// Calculate centroid
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

		// if (onHoverHandler) {
		// 	polygon.addEventListener('mouseover', onHoverHandler);
		// 	polygon.addEventListener('mouseout', () => onHoverHandler(null)); // Optional: Reset on hover out
		// }
		// if (onHoverHandler) {
		// 	polygon.addEventListener('mouseenter', onHoverHandler);
		// 	polygon.addEventListener('mouseleave', () => onHoverHandler(null)); // Optional: Reset on hover out
		// }
	});
}

function _triangleTessellationCenters(rows, cols, w, h) {
	const centers = [];

	for (let r = 0; r < rows; r++) {
		const baseY = r * (h / 2); // every row is half-height offset
		const startX = (r % 2 === 1) ? w / 2 : 0; // staggered rows

		for (let c = 0; c < cols; c++) {
			const x = startX + c * w;
			const isUp = (r % 2 === 0);
			const y = baseY + (isUp ? h / 3 : (2 * h) / 3);

			centers.push({ x, y, up: isUp });
		}
	}

	return centers;
}

function _triangleTessellationCenters(rows, cols, n) {
	const centers = [];
	const h = (Math.sqrt(3) / 2) * n;

	for (let r = 0; r < rows; r++) {
		const y = r * h;
		for (let c = 0; c < cols; c++) {
			const x = c * n + ((r % 2) * n) / 2;
			const isPointingUp = (r + c) % 2 === 0;
			centers.push({ x, y: isPointingUp ? y + h / 3 : y + (2 * h) / 3, up: isPointingUp });
		}
	}

	return centers;
}
function _drawTriangleAtCenter(parent, center, n, pointingUp = true, color = 'black') {
	const h = (Math.sqrt(3) / 2) * n;
	const div = document.createElement('div');

	div.style.position = 'absolute';
	div.style.width = `${n}px`;
	div.style.height = `${h}px`;
	div.style.left = `${center.x - n / 2}px`;
	div.style.top = `${center.y - h / 2}px`;
	div.style.backgroundColor = color;
	div.style.clipPath = pointingUp
		? 'polygon(50% 0%, 0% 100%, 100% 100%)'
		: 'polygon(0% 0%, 100% 0%, 50% 100%)';

	parent.appendChild(div);
	return div;
}
//hexgrid versuche
function createHexShapedGridX(containerId, rows = 5, maxCols = 5, sz = 50, gap = 1) {
	if (rows % 2 === 0) {
		console.error("Number of rows must be odd for a symmetrical hexagon grid.");
		return;
	}

	const container = toElem(containerId);
	//const frag=document.createDocumentFragment();
	container.innerHTML = '';

	const hexWidth = sz * 2;
	const hexHeight = hexWidth; //Math.sqrt(3) * sideLength;
	const vertSpacing = hexHeight * 0.75;

	const midRow = Math.floor(rows / 2);
	const tiles = {}; // id -> tile object
	let [w, h] = [hexWidth - gap, hexHeight - gap];

	for (let r = 0; r < rows; r++) {
		const offsetFromMiddle = Math.abs(midRow - r);
		const cols = maxCols - offsetFromMiddle;
		const totalRowOffset = ((maxCols - cols) / 2) * hexWidth;
		const horizontalOffset = (r % 2 === 1) ? hexWidth / 2 : 0;
		const y = r * vertSpacing;
		for (let i = 0; i < cols; i++) {
			const x = i * hexWidth + totalRowOffset;// + horizontalOffset;
			const c = Math.round(x / (hexWidth / 2)); // GLOBAL COLUMN INDEX
			const id = `r${r}_c${c}`;

			let div = mDom(container, { className: 'hex', left: x, top: y, w, h }, { id })
			const tile = { id, div, x, y, sz, c, r, NE: null, E: null, SE: null, SW: null, W: null, NW: null };

			tiles[id] = tile;
		}

	}

	// After all tiles are created, link neighbors
	for (const id in tiles) {
		const tile = tiles[id];
		let [r, c] = [tile.r, tile.c];

		function getTile(rr, cc) { return tiles[`r${rr}_c${cc}`] || null; }
		//   if (isdef(tiles[`r${rr}_c${cc}`])) return `r${rr}_c${cc}`; //tileMap[`r${rr}_c${cc}`];
		//   else return null;
		// }

		// Neighbor lookup varies by row parity
		tile.E = getTile(r, c + 2);
		tile.W = getTile(r, c - 2);
		tile.NE = getTile(r - 1, c + 1);
		tile.NW = getTile(r - 1, c - 1);
		tile.SE = getTile(r + 1, c + 1);
		tile.SW = getTile(r + 1, c - 1);

	}

	// container.style.height = `${rows * vertSpacing + hexHeight * 0.25}px`;
	let hGrid = rows * vertSpacing + hexHeight * 0.25;
	let wGrid = maxCols * hexWidth;
	console.log(w, h)
	mStyle(container, { w: wGrid, h: hGrid }); //,bg:'skyblue'})
	//container.appendChild(frag);

	return tiles;
}
function getHexCorners(x, y, radius) {
	const corners = [];
	for (let i = 0; i < 6; i++) {
		const angle = Math.PI / 3 * i - Math.PI / 6; // -30° to make flat top
		const cornerX = x + radius * Math.cos(angle);
		const cornerY = y + radius * Math.sin(angle);
		corners.push([cornerX, cornerY]);
	}
	return corners;
}
function createHexShapedGrid(containerId, rows = 5, maxCols = 5, sideLength = 50, gap = 1) {
	if (rows % 2 === 0) {
		console.error("Number of rows must be odd for a symmetrical hexagon grid.");
		return;
	}

	const container = toElem(containerId);
	container.innerHTML = '';

	const hexWidth = sideLength * 2;
	const hexHeight = hexWidth; //Math.sqrt(3) * sideLength;
	const vertSpacing = hexHeight * 0.75;

	const midRow = Math.floor(rows / 2);
	const tiles = {}; // id -> tile object

	for (let r = 0; r < rows; r++) {
		const offsetFromMiddle = Math.abs(midRow - r);
		const cols = maxCols - offsetFromMiddle;

		for (let i = 0; i < cols; i++) {


			const horizontalOffset = (r % 2 === 1) ? hexWidth / 2 : 0;
			const totalRowOffset = ((maxCols - cols) / 2) * hexWidth;

			const x = i * hexWidth + totalRowOffset;// + horizontalOffset;
			const y = r * vertSpacing;
			const c = Math.round(x / (hexWidth / 2)); // GLOBAL COLUMN INDEX
			const id = `r${r}_c${c}`;

			// const div = document.createElement('div');
			// div.className = 'hex';
			// div.style.width = `${hexWidth - gap}px`;
			// div.style.height = `${hexHeight - gap}px`;
			// div.style.left = `${x}px`;
			// div.style.top = `${y}px`;
			// div.id = id;
			// container.appendChild(div);

			let div = mDom(container, { className: 'hex', left: x, top: y, w: hexWidth - gap, h: hexHeight - gap }, { id })
			const tile = { id, div, x, y, c, r, NE: null, E: null, SE: null, SW: null, W: null, NW: null };

			tiles[id] = tile;
		}

	}

	// After all tiles are created, link neighbors
	for (const id in tiles) {
		const tile = tiles[id];
		let [r, c] = [tile.r, tile.c];
		const isOdd = r % 2 === 1;

		function getTile(rr, cc) {
			if (isdef(tiles[`r${rr}_c${cc}`])) return `r${rr}_c${cc}`; //tileMap[`r${rr}_c${cc}`];
			else return null;
		}

		// Neighbor lookup varies by row parity
		tile.E = getTile(r, c + 2);
		tile.W = getTile(r, c - 2);
		tile.NE = getTile(r - 1, c + 1);
		tile.NW = getTile(r - 1, c - 1);
		tile.SE = getTile(r + 1, c + 1);
		tile.SW = getTile(r + 1, c - 1);

	}

	// container.style.height = `${rows * vertSpacing + hexHeight * 0.25}px`;
	let h = rows * vertSpacing + hexHeight * 0.25;
	let w = maxCols * hexWidth;
	console.log(w, h)
	mStyle(container, { w, h }); //,bg:'skyblue'})

	return tiles;
}
function addCities(container, grid, sideLength) {
	const cityMap = {}; // key: `r_c` => city object

	for (const row of grid) {
		for (const tile of row) {
			const { x, y, r, c } = tile;
			//let [tx,ty]=[x+sideLength/2,y+sideLength/2];
			for (let i = 0; i < 6; i++) {
				const angle_deg = 60 * i - 30;
				const angle_rad = Math.PI / 180 * angle_deg;
				const cx = x + sideLength * Math.cos(angle_rad);
				const cy = y + sideLength * Math.sin(angle_rad); // - sideLength / 2;

				// Determine index of the tile *below* and to the *left* of the corner
				// Here, we use angle to determine ownership
				let rowIndex = r;
				let colIndex = c;
				if (i === 2 || i === 3) rowIndex += 1; // bottom corners
				if (i === 3 || i === 4 || i === 5) colIndex -= 1; // left side

				addCity(cityMap, container, rowIndex, colIndex, 0 - 10, 0 - 10); //cx, cy);
				return;
			}
			return;
		}
	}

	return cityMap;
}

function createHexShapedGrid(containerId, rows = 5, maxCols = 5, sideLength = 50, gap = 1) {
	if (rows % 2 === 0) {
		console.error("Number of rows must be odd for a symmetrical hexagon grid.");
		return;
	}

	const container = toElem(containerId);
	container.innerHTML = '';

	const hexWidth = sideLength * 2;
	const hexHeight = hexWidth; //Math.sqrt(3) * sideLength;
	const vertSpacing = hexHeight * 0.75;

	const midRow = Math.floor(rows / 2);
	const tileMap = {}; // id -> tile object
	const boardRows = [];    // row-wise storage

	for (let r = 0; r < rows; r++) {
		const offsetFromMiddle = Math.abs(midRow - r);
		const cols = maxCols - offsetFromMiddle;
		const row = [];

		for (let i = 0; i < cols; i++) {
			const div = document.createElement('div');
			div.className = 'hex';
			div.style.width = `${hexWidth - gap}px`;
			div.style.height = `${hexHeight - gap}px`;

			const horizontalOffset = (r % 2 === 1) ? hexWidth / 2 : 0;
			const totalRowOffset = ((maxCols - cols) / 2) * hexWidth;

			const x = i * hexWidth + totalRowOffset;// + horizontalOffset;
			const y = r * vertSpacing;

			const c = Math.round(x / (hexWidth / 2)); // GLOBAL COLUMN INDEX

			div.style.left = `${x}px`;
			div.style.top = `${y}px`;

			const id = `r${r}_c${c}`;
			const tile = { id, div, x, y, c, r, NE: null, E: null, SE: null, SW: null, W: null, NW: null };

			div.addEventListener('mouseenter', () => {
				for (const dir of ['NE', 'E', 'SE', 'SW', 'W', 'NW']) {
					const neighbor = tileMap[tile[dir]];
					if (neighbor) neighbor.div.classList.add('neighbor-highlight');
				}
			});

			div.addEventListener('mouseleave', () => {
				for (const dir of ['NE', 'E', 'SE', 'SW', 'W', 'NW']) {
					const neighbor = tileMap[tile[dir]];
					if (neighbor) neighbor.div.classList.remove('neighbor-highlight');
				}
			});
			tileMap[id] = tile;
			row.push(tile);
			container.appendChild(div);
		}

		boardRows.push(row);
	}

	// After all tiles are created, link neighbors
	for (let r = 0; r < boardRows.length; r++) {
		for (let i = 0; i < boardRows[r].length; i++) {
			const tile = boardRows[r][i];
			let c = tile.c;
			const isOdd = r % 2 === 1;

			function getTile(rr, cc) {
				if (isdef(tileMap[`r${rr}_c${cc}`])) return `r${rr}_c${cc}`; //tileMap[`r${rr}_c${cc}`];
				else return null;
			}

			// Neighbor lookup varies by row parity
			tile.E = getTile(r, c + 2);
			tile.W = getTile(r, c - 2);
			tile.NE = getTile(r - 1, c + 1);
			tile.NW = getTile(r - 1, c - 1);
			tile.SE = getTile(r + 1, c + 1);
			tile.SW = getTile(r + 1, c - 1);
			// tile.E = getTile(r, c + 1);
			// tile.W = getTile(r, c - 1);
			// tile.NE = getTile(r - 1, c + (isOdd ? 0 : -1));
			// tile.NW = getTile(r - 1, c + (isOdd ? -1 : 0));
			// tile.SE = getTile(r + 1, c + (isOdd ? 0 : -1));
			// tile.SW = getTile(r + 1, c + (isOdd ? -1 : 0));

		}
	}

	container.style.height = `${rows * vertSpacing + hexHeight * 0.25}px`;

	return { boardRows, tileMap, tiles: arrFlatten(boardRows) };
}
function createHexShapedGrid(containerId, rows = 5, maxCols = 5, sideLength = 50, gap = 1) {
	if (rows % 2 === 0) {
		console.error("Number of rows must be odd for a symmetrical hexagon grid.");
		return;
	}

	const container = toElem(containerId);
	container.innerHTML = '';

	const hexWidth = sideLength * 2;
	const hexHeight = hexWidth; //Math.sqrt(3) * sideLength;
	const vertSpacing = hexHeight * 0.75;

	const midRow = Math.floor(rows / 2);

	let tiles = [];

	for (let r = 0; r < rows; r++) {
		const offsetFromMiddle = Math.abs(midRow - r);
		const cols = maxCols - offsetFromMiddle;

		for (let c = 0; c < cols; c++) {
			const hex = document.createElement('div');
			hex.className = 'hex';
			hex.style.width = `${hexWidth - gap}px`;
			hex.style.height = `${hexHeight - gap}px`;

			const horizontalOffset = (r % 2 === 1) ? hexWidth / 2 : 0;
			const totalRowOffset = ((maxCols - cols) / 2) * hexWidth;

			const x = c * hexWidth + totalRowOffset; // + horizontalOffset - (r%2 == 1?hexWidth/2:0);
			const y = r * vertSpacing;

			hex.style.left = `${x}px`;
			hex.style.top = `${y}px`;

			container.appendChild(hex);
			tiles.push({ div: hex, x, y, c, r })
		}
	}

	container.style.height = `${rows * vertSpacing + hexHeight * 0.25}px`;
	return tiles;
}
function createHexGrid(d, rows, cols, sideLength = 50) {
	const container = toElem(d)
	container.innerHTML = ''; // clear previous grid

	const hexWidth = sideLength * 2;
	const hexHeight = hexWidth; // Math.sqrt(3) * sideLength;

	for (let r = 0; r < rows; r++) {
		const row = document.createElement('div');
		row.className = 'hex-row' + (r % 2 ? ' offset' : '');
		for (let c = 0; c < cols; c++) {
			const hex = document.createElement('div');
			hex.className = 'hex';
			hex.style.width = `${hexWidth}px`;
			hex.style.height = `${hexHeight}px`;
			row.appendChild(hex);
		}
		container.appendChild(row);
	}
}
function createHexGrid(d, rows, cols, sideLength = 50) {
	const container = toElem(d);
	container.innerHTML = '';
	const hexWidth = sideLength * 2;
	const hexHeight = Math.sqrt(3) * sideLength;
	const vertSpacing = hexHeight * 0.75;

	container.style.height = `${vertSpacing * rows + hexHeight * 0.25}px`;

	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			const hex = document.createElement('div');
			hex.className = 'hex';
			hex.style.width = `${hexWidth - 1}px`;
			hex.style.height = `${hexHeight - 1}px`;

			const xOffset = (r % 2) * (hexWidth / 2);
			const x = c * hexWidth + xOffset;
			const y = r * vertSpacing;

			hex.style.left = `${x}px`;
			hex.style.top = `${y}px`;

			container.appendChild(hex);
		}
	}
}

function createHexShapedGrid(containerId, rows = 5, maxCols = 5, sideLength = 50, gap = 1) {
	if (rows % 2 === 0) {
		console.error("Number of rows must be odd for a symmetrical hexagon grid.");
		return;
	}

	const container = toElem(containerId);
	container.innerHTML = '';

	const hexWidth = sideLength * 2;
	const hexHeight = Math.sqrt(3) * sideLength;
	const vertSpacing = hexHeight * 0.75;

	const midRow = Math.floor(rows / 2);

	for (let r = 0; r < rows; r++) {
		// Number of columns in this row (symmetric)
		const offsetFromMiddle = Math.abs(midRow - r);
		const cols = maxCols - offsetFromMiddle;

		for (let c = 0; c < cols; c++) {
			const hex = document.createElement('div');
			hex.className = 'hex';
			hex.style.width = `${hexWidth}px`;
			hex.style.height = `${hexHeight}px`;

			// Center the row horizontally
			const rowOffset = ((maxCols - cols) / 2) * hexWidth + ((r % 2) * hexWidth / 2);
			const x = c * hexWidth + rowOffset;
			const y = r * vertSpacing;

			hex.style.left = `${x}px`;
			hex.style.top = `${y}px`;

			container.appendChild(hex);
		}
	}

	// Set container height and maybe width
	container.style.height = `${rows * vertSpacing + hexHeight * 0.25}px`;
}
function createHexShapedGrid(containerId, rows = 5, maxCols = 5, sideLength = 50) {
	if (rows % 2 === 0) {
		console.error("Number of rows must be odd for a symmetrical hexagon grid.");
		return;
	}

	const container = toElem(containerId);
	container.innerHTML = '';

	const hexWidth = sideLength * 2;
	const hexHeight = Math.sqrt(3) * sideLength;
	const vertSpacing = hexHeight * 0.75;

	const midRow = Math.floor(rows / 2);

	for (let r = 0; r < rows; r++) {
		const offsetFromMiddle = Math.abs(midRow - r);
		const cols = maxCols - offsetFromMiddle;

		for (let c = 0; c < cols; c++) {
			const hex = document.createElement('div');
			hex.className = 'hex';
			hex.style.width = `${hexWidth}px`;
			hex.style.height = `${hexHeight}px`;

			// CORRECTED: Even rows are offset by half a hex width
			const evenRow = r % 2 === 0;
			const centerOffset = ((maxCols - cols) / 2) * hexWidth;
			const x = c * hexWidth + centerOffset + (evenRow ? hexWidth / 2 : 0);
			const y = r * vertSpacing;

			hex.style.left = `${x}px`;
			hex.style.top = `${y}px`;

			container.appendChild(hex);
		}
	}

	container.style.height = `${rows * vertSpacing + hexHeight * 0.25}px`;
}
class _hexgridY {
	constructor({
		bid = 'gridY',
		rows = 4,
		cols = 4,
		w = 100,
		h = 100,
		gName = 'g',
		x = 0,
		y = 0,
		margin = 10,
		gap = 10,
		board = { level: 1, ipal: 2, bg: undefined, fg: undefined, shape: undefined, border: undefined, thickness: undefined },
		fields = { level: 6, ipal: 3, bg: undefined, fg: undefined, shape: 'hex', border: undefined, thickness: undefined },
		cities = { level: 6, ipal: 2, bg: undefined, fg: undefined, shape: 'circle', border: undefined, thickness: undefined },
		streets = { level: 6, ipal: 4, bg: undefined, fg: undefined, shape: 'line', border: 'blue', thickness: 10 }
	}) {
		this.prelim(bid, rows, cols, w, h, x, y, margin);
		this.createBoard(gName, x, y, board);
		this.createFields(bid, gName, rows, cols, gap, fields);
		addNodes(this, bid, gName, cities);
		addEdges(this, bid, gName, streets);
		drawElems(this.fields);
		drawElems(this.edges);
		drawElems(this.nodes);
	}
	prelim(bid, rows, cols, w, h, x, y, margin) {
		this.id = bid;
		rows = rows % 2 != 0 ? rows : rows + 1;
		this.topcols = cols;
		this.colarr = calc_hex_col_array(rows, this.topcols);
		this.maxcols = Math.max(...this.colarr);
		this.rows = rows;
		this.cols = cols;
		this.w = w;
		this.h = h;
		this.x = x;
		this.y = y;
		let wFieldMax = (w - 2 * margin) / this.maxcols;
		let hFieldMax = (h - 2 * margin) / rows;
		hFieldMax /= 0.75;
		let hField = (2 * this.wFieldMax) / 1.73;
		let hBoard = hField * 0.75 * rows;
		if (hBoard > h - 2 * margin) {
			this.hField = roundEven(hFieldMax);
			this.wField = roundEven((1.73 * hField) / 2);
		} else {
			this.wField = roundEven(wFieldMax);
			this.hField = roundEven((2 * this.wField) / 1.73);
		}
		this.wBoard = roundEven(this.wField * this.maxcols);
		this.hBoard = roundEven(this.hField * 0.75 * rows + this.hField / 4);
	}
	createBoard(gName, x, y, board) {
		this.board = makeElemY('board', null, gName, board.level, {
			w: this.wBoard,
			h: this.hBoard,
			x: x,
			y: y,
			ipal: board.ipal,
			bg: board.bg,
			fg: board.fg,
			shape: board.shape,
			border: board.border,
			thickness: board.thickness
		});
	}
	createFields(bid, gName, rows, cols, gap, fields) {
		this.fields = [];
		this.fieldsByRowCol = [];
		let imiddleRow = (rows - 1) / 2;
		for (let irow = 0; irow < this.colarr.length; irow++) {
			this.fieldsByRowCol[irow + 1] = [];
			let colstart = this.maxcols - this.colarr[irow];
			let y = this.hField * 0.75 * (irow - imiddleRow);
			for (let j = 0; j < this.colarr[irow]; j++) {
				var icol = colstart + 2 * j;
				let x = (icol * this.wField) / 2 + this.wField / 2 - this.wBoard / 2;
				let approx = 12;
				let field = makeElemY('field', bid, gName, fields.level, {
					row: irow + 1,
					col: icol + 1,
					w: this.wField,
					h: this.hField,
					gap: gap,
					x: x,
					y: y,
					ipal: fields.ipal,
					bg: fields.bg,
					fg: fields.fg,
					shape: fields.shape,
					border: fields.border,
					thickness: fields.thickness
				});
				this.fields.push(field.id);
				this.fieldsByRowCol[irow + 1][icol + 1] = field.id;
				field.edges = [];
				field.fields = [];
				field.nodes = [];
				let hex = [[0, -0.5], [0.5, -0.25], [0.5, 0.25], [0, 0.5], [-0.5, 0.25], [-0.5, -0.25]];
				field.poly = getPoly(hex, field.x, field.y, field.w, field.h);
				x += this.wField;
			}
		}
	}
	isValid(r, c) {
		return r in this.fields && c in this.fields[r];
	}
}

//scroll versuche!!!
function onPgDown(ev) {
	let container = mBy('msGrid', 'class')
	container.scrollBy({
		top: container.clientHeight,
		left: 0,
		behavior: 'smooth'  // smooth scrolling animation
	});
}
function onPgUp(ev) {
	let container = mBy('msGrid', 'class')
	container.scrollBy({
		top: -container.clientHeight,
		left: 0,
		behavior: 'smooth'  // smooth scrolling animation
	});
}
async function test0_msGrid() {
	await initTest();
	let elems = mLayoutLM('dPage'); mStyle('dMain', { overy: 'auto' }); mFlex('dMain');
	let cols = 7, w = cols * 130 + 30, h = 5 * 130 + 10;
	let container = mDom('dMain', { className: 'msGrid', bg: 'violet' }); //,w,h });
	let list = M.byType.fa6; //Object.keys(M.superdi); // M.byType.fa6; //M.byCat.transport; //M.byCat.sport; // ['circumscribed_multiplication'];//, 'circumscribed_addition', 'circumscribed_subtraction', 'circumscribed_division', 'circumscribed_exponentiation', 'circumscribed_square_root', 'circumscribed_square_root_2', 'circumscribed_square_root_3', 'circumscribed_square_root_4'];
	console.log('list', list);
	let elemStyle = {};// display: 'block', align:'center', w100: true, h100: true, box: true, fg: 'white', bg: 'grey', padding: 10, cursor: 'pointer' };
	for (const k of list) {
		let o = M.superdi[k];
		// if (isdef(o.fa6)) { d = mDom(dParent, { ...elemStyle, family: Families.fa6 }, { html: `&#x${o.fa6};` }); }
		let d = msKey(k, container);

	}
	const rowHeight = 120 + 8; // row height + vertical gap
	let isScrolling = false;
	container.tabIndex = 0;
	container.addEventListener('keydown', (e) => {
		if (e.key === 'PageDown' || e.key === 'PageUp') {
			e.preventDefault();
			const direction = e.key === 'PageDown' ? 1 : -1;
			container.scrollBy({
				top: direction * rowHeight * 5, // container.clientHeight,
				behavior: 'smooth'
			});
		}
	});

	// Handle mouse wheel: scroll one screen per wheel tick
	container.addEventListener('wheel', (e) => {
		e.preventDefault();

		if (isScrolling) return;
		isScrolling = true;

		const direction = e.deltaY > 0 ? 1 : -1;
		container.scrollBy({
			top: direction * rowHeight * 5, // container.clientHeight,
			behavior: 'smooth'
		});

		setTimeout(() => {
			isScrolling = false;
		}, 300); // adjust timeout to match animation duration
	}, { passive: false });
}
async function test0_msGrid() {
	await initTest();
	let elems = mLayoutLM('dPage'); mStyle('dMain', { overy: 'auto' }); mFlex('dMain');
	let cols = 7, w = cols * 130 + 30, h = 5 * 130 + 10;
	let grid = mDom('dMain', { className: 'msGrid', bg: 'violet' }); //,w,h });
	let list = M.byType.fa6; //Object.keys(M.superdi); // M.byType.fa6; //M.byCat.transport; //M.byCat.sport; // ['circumscribed_multiplication'];//, 'circumscribed_addition', 'circumscribed_subtraction', 'circumscribed_division', 'circumscribed_exponentiation', 'circumscribed_square_root', 'circumscribed_square_root_2', 'circumscribed_square_root_3', 'circumscribed_square_root_4'];
	console.log('list', list);
	let elemStyle = {};// display: 'block', align:'center', w100: true, h100: true, box: true, fg: 'white', bg: 'grey', padding: 10, cursor: 'pointer' };
	for (const k of list) {
		let o = M.superdi[k];
		// if (isdef(o.fa6)) { d = mDom(dParent, { ...elemStyle, family: Families.fa6 }, { html: `&#x${o.fa6};` }); }
		let d = msKey(k, grid);

	}



	const rowHeight = 120 + 8; // row height + vertical gap

	// grid.addEventListener('keydown', (e) => {
	// 	if (e.key === 'PageDown' || e.key === 'PageUp') {
	// 		e.preventDefault();

	// 		const visibleHeight = grid.clientHeight;
	// 		const rowsPerPage = Math.floor(visibleHeight / rowHeight);
	// 		const scrollAmount = rowsPerPage * rowHeight;

	// 		const direction = e.key === 'PageDown' ? 1 : -1;
	// 		const newScrollTop = Math.round(grid.scrollTop / rowHeight) * rowHeight + scrollAmount * direction;

	// 		grid.scrollTo({
	// 			top: Math.max(0, newScrollTop),
	// 			behavior: 'smooth'
	// 		});
	// 	}
	// });
	let timeout;

	//this one goes down and then corrects up: ugly
	// grid.addEventListener('scroll', () => {
	// 	clearTimeout(timeout);
	// 	timeout = setTimeout(() => {
	// 		const scrollTop = grid.scrollTop;
	// 		const snappedTop = Math.round(scrollTop / rowHeight) * rowHeight;
	// 		grid.scrollTo({ top: snappedTop, behavior: 'smooth' });
	// 	}, 100); // Snap after 100ms of no scrolling
	// });
	// Allow grid to receive keyboard events

	//this one stops breifly before correcting further down: still ugly
	// grid.addEventListener('scroll', () => {
	// 	clearTimeout(timeout);
	// 	timeout = setTimeout(() => {
	// 		const scrollTop = grid.scrollTop;

	// 		// Always round UP to the next full row (never backwards)
	// 		const snappedTop = Math.ceil(scrollTop / rowHeight) * rowHeight;

	// 		// Only scroll if we're not already aligned
	// 		if (scrollTop % rowHeight !== 0) {
	// 			grid.scrollTo({ top: snappedTop, behavior: 'smooth' });
	// 		}
	// 	}, 100); // delay after scroll ends
	// });

	//this one does not work at all!!!!
	// const grid = document.getElementById('grid-container');
	// const rowHeight = 128; // e.g., 120px row + 8px gap
	// let lastScrollTop = 0;
	// let isScrolling = false;
	// let animationFrame;

	// function smoothSnap() {
	//   const currentTop = grid.scrollTop;
	//   const delta = currentTop - lastScrollTop;
	//   lastScrollTop = currentTop;

	//   if (Math.abs(delta) < 1 && isScrolling) {
	//     // Scrolling has mostly stopped
	//     const remainder = currentTop % rowHeight;
	//     if (remainder !== 0) {
	//       const target =
	//         delta >= 0
	//           ? currentTop + (rowHeight - remainder)
	//           : currentTop - remainder;

	//       animateTo(target);
	//     }
	//     isScrolling = false;
	//     return;
	//   }

	//   isScrolling = true;
	//   animationFrame = requestAnimationFrame(smoothSnap);
	// }

	// function animateTo(target) {
	//   const start = grid.scrollTop;
	//   const distance = target - start;
	//   const duration = 300;
	//   const startTime = performance.now();

	//   function step(currentTime) {
	//     const elapsed = currentTime - startTime;
	//     const progress = Math.min(elapsed / duration, 1);
	//     const ease = easeOutCubic(progress);
	//     grid.scrollTop = start + distance * ease;
	//     if (progress < 1) requestAnimationFrame(step);
	//   }

	//   requestAnimationFrame(step);
	// }

	// function easeOutCubic(t) {
	//   return 1 - Math.pow(1 - t, 3);
	// }

	// grid.addEventListener('scroll', () => {
	//   cancelAnimationFrame(animationFrame);
	//   animationFrame = requestAnimationFrame(smoothSnap);
	// });




	grid.tabIndex = 0;
}
function loadSuperdiAssets() {
	let [di, byColl, byFriendly, byCat, allImages] = [M.superdi, {}, {}, {}, {}];
	// for (const k in Symbols) {
	// 	let kNew = isdef(di[k]) && isdef(di[k].text) ? k + '_uni' : k;
	// 	if (k == 'writing_hand') console.log(k, di[k], kNew)
	// 	if (isdef(di[k]) && nundef(di[k].text)) {
	// 		assertion(k != 'writing_hand')
	// 		let o = di[k];
	// 		if (nundef(o.colls)) o.colls = [];
	// 		o.colls.push('unicode');
	// 		if (isdef(o.text)) console.log(':text', k, o.text);
	// 		else o.text = Symbols[k];
	// 	} else di[kNew] = { key: kNew, friendly: k, text: Symbols[k], colls: ['unicode'], cats: [] };
	// }
	// for (const k of MathKeys) {
	// 	di[k].cats.push('math');
	// 	lookupAddIfToList(byCat, ['math'], k);
	// }
	for (const k in di) {
		let o = di[k];
		for (const cat of o.cats) lookupAddIfToList(byCat, [cat], k);
		//for (const coll of o.colls) lookupAddIfToList(byColl, [coll], k);
		//let friendly=
		//lookupAddIfToList(byFriendly, [o.friendly], k)
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
	//M.byCollection = byColl;
	//M.byFriendly = byFriendly;
	M.categories = Object.keys(byCat); M.categories.sort();
	//M.collections = Object.keys(byColl); M.collections.sort();
	//M.names = Object.keys(byFriendly); M.names.sort();
	let byType = {};
	for (const k in M.superdi) {
		let o = M.superdi[k];
		for (const fk in Families) {
			//console.log('fk', fk, o[fk]);
			if (isdef(o[fk])) { lookupAddIfToList(byType, [fk], k); }

		}
		//break;
	}
	M.byType = byType;
}

function mKey(imgKey, d, styles = {}, opts = {}) {
	styles = jsCopy(styles);
	let o = imgKey.includes('.') ? { src: imgKey } : opts.prefer == 'plain' ? { plain: imgKey } : lookup(M.superdi, [imgKey]);
	let type = opts.prefer;
	let types = ['src', 'img', 'photo', 'uni', 'emo', 'fa6', 'fa', 'ga', 'plain'];
	if (nundef(o[type])) type = types.find(x => isdef(o[x]));

	let d0 = mDom(d, styles, opts); //mClass(d0,'centered-text');	//mCenterCenterFlex(d0);
	let [_, h] = mSizeSuccession(styles, 100);

	if (['img', 'src', 'photo'].includes(type)) {
		let astyle = { h, fit: o && o.cats.includes('card') ? 'contain' : 'cover', 'object-position': 'center center' };

		mDom(d0, astyle, { ...opts, tag: 'img', src: o[type], alt: imgKey });

	} else {
		let family = Families[type] || 'inherit';
		let text = ['fa6', 'fa', 'ga'].includes(type) ? `&#x${o[type]};` : o[type];
		let fz = h; // h*.9;

		let astyles = {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			align: 'center',
			width: '100%',
			height: '100%',
			box: true,
			fz,
			family,
			hline: '1', // Ensure consistent vertical alignment
			'vertical-align': 'middle', // Align text vertically
			padding: '0', // Remove any padding that might affect alignment
			margin: '0' // Remove any margin that might affect alignment
		};

		// let x = mDom(d0, { family, fz, wmin: 100, align: 'center' }, { ...opts, html: text });
		let x = mDom(d0, astyles, { ...opts, html: text });


		// let data;
		// if (type != 'plain'){
		// 	let charCode = toCharCode(text);
		// 	data = measureCharCodeInFont(charCode, fz,family);
		// 	console.log('measureCharCodeInFont', charCode, fz, family, data);
		// }else {
		// 	data = measureTextInFont(text, fz, family);
		// 	console.log('measureTextInFont', text, fz, family, data);
		// }

		// mFlex(d0);
		//mStyle(x,{h:data.height});
		// mClass(x, 'centered-text');

	}
	return d0;

}
function mKey(imgKey, d, styles = {}, opts = {}) {
	//console.log('___mKey', imgKey, styles, opts);
	styles = jsCopy(styles);
	let o = imgKey.includes('.') ? { src: imgKey } : opts.prefer == 'plain' ? { plain: imgKey } : lookup(M.superdi, [imgKey]);
	let type = opts.prefer;
	let types = ['src', 'img', 'photo', 'uni', 'emo', 'fa6', 'fa', 'ga', 'plain'];
	if (nundef(o[type])) type = types.find(x => isdef(o[x]));

	let d0 = mDom(d, styles, opts); mClass(d0, 'centered-text');
	mCenterCenterFlex(d0);
	let [_, h] = mSizeSuccession(styles, 100);

	if (['img', 'src', 'photo'].includes(type)) {
		addKeys({ h, w: h, fit: o && o.cats.includes('card') ? 'contain' : 'cover', 'object-position': 'center center' }, styles);

		mDom(d0, styles, { ...opts, tag: 'img', src: o[type], alt: imgKey });

	} else {
		const families = { uni: "'Noto Sans', sans-serif", emo: 'emoNoto', fa6: 'fa6', fa: 'pictoFa', ga: 'pictoGame' };
		let family = families[type] || 'inherit';
		addKeys({ display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', width: '100%', height: '100%', fontSize: styles.fz || 'inherit', family, lineHeight: '1', verticalAlign: 'middle' }, styles);
		let html = ['fa6', 'fa', 'ga'].includes(type) ? `&#x${o[type]};` : o[type];

		mDom(d0, styles, { ...opts, html });

	}
	return d0;

}
function mKey(imgKey, d, styles = {}, opts = {}) {
	styles = jsCopy(styles);
	let o = imgKey.includes('.') ? { src: imgKey } : opts.prefer == 'plain' ? { plain: imgKey } : lookup(M.superdi, [imgKey]);
	let type = opts.prefer;
	let types = ['src', 'img', 'photo', 'uni', 'emo', 'fa6', 'fa', 'ga', 'plain'];
	if (nundef(o[type])) type = types.find(x => isdef(o[x]));

	let d0 = mDom(d, styles, opts);
	mClass(d0, 'centered-text');
	mCenterCenterFlex(d0);
	let [_, h] = mSizeSuccession(styles, 100);

	if (['img', 'src', 'photo'].includes(type)) {
		addKeys({ h, w: h, fit: o && o.cats.includes('card') ? 'contain' : 'cover', 'object-position': 'center center' }, styles);
		mDom(d0, styles, { ...opts, tag: 'img', src: o[type], alt: imgKey });
	} else {
		const families = { uni: "'Noto Sans', sans-serif", emo: 'emoNoto', fa6: 'fa6', fa: 'pictoFa', ga: 'pictoGame' };
		let family = families[type] || 'inherit';

		// Updated styles for vertical centering
		addKeys({
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			align: 'center',
			width: '100%',
			height: '100%',
			box: true,
			fz: '100%',
			family,
			hline: '1', // Ensure consistent vertical alignment
			'vertical-align': 'middle', // Align text vertically
			padding: '0', // Remove any padding that might affect alignment
			margin: '0' // Remove any margin that might affect alignment
		}, styles);

		let html = ['fa6', 'fa', 'ga'].includes(type) ? `&#x${o[type]};` : o[type];

		console.log(html, styles.fz, family)
		let x = measureCharacterBounds(html, styles.fz, family); console.log('x', x);


		return mDom(d0, styles, { ...opts, html });
	}

	return d0;
}

function fitTextToBox(div, maxWidth, maxHeight, options = {}) {
	const {
		minFontSize = 10,
		maxFontSize = 100,
		fontStep = 1,
		lineHeight = 1.2
	} = options;

	const style = window.getComputedStyle(div);
	const originalText = div.textContent;

	// Create an off-screen clone for measurement
	const testDiv = document.createElement("div");
	document.body.appendChild(testDiv);
	testDiv.style.position = "absolute";
	testDiv.style.visibility = "hidden";
	testDiv.style.whiteSpace = "pre-wrap";
	testDiv.style.wordBreak = "break-word";

	// Copy CSS that affects size
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

	// Apply the final font size to the actual div
	div.style.fontSize = `${fontSize}px`;
	div.style.lineHeight = lineHeight;

	document.body.removeChild(testDiv);
	return fontSize;
}
function fitTextToBox(text, fontFamily, maxWidth, maxHeight, options = {}) {
	const {
		minFontSize = 10,
		maxFontSize = 100,
		fontStep = 1,
		lineHeight = 1.2,
		fontWeight = "normal",
		fontStyle = "normal",
		letterSpacing = "normal",
		padding = "0"
	} = options;

	// Create a hidden measuring element
	const testDiv = document.createElement("div");
	document.body.appendChild(testDiv);
	testDiv.style.position = "absolute";
	testDiv.style.visibility = "hidden";
	testDiv.style.whiteSpace = "pre-wrap";
	testDiv.style.wordBreak = "break-word";
	testDiv.style.padding = padding;
	testDiv.style.fontFamily = fontFamily;
	testDiv.style.fontWeight = fontWeight;
	testDiv.style.fontStyle = fontStyle;
	testDiv.style.letterSpacing = letterSpacing;
	testDiv.textContent = text;

	let fontSize = maxFontSize;

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

	document.body.removeChild(testDiv);
	return fontSize;
}

function showItem(key, d, styles, opts, simpleOnclickLabel, simpleOnclickItem) {

	//mClass(d, 'magnifiable')
	let id = getUID();
	let dSym = mKey(key, d, styles, { prefer: 'emo' }); // simpleShowImageInBatch(key, d, {}, { prefer: 'photo' });
	//return;

	// mStyle(d,{position:'relative',pabottom:18});
	let dLabel = mDom(d, { align: 'center', fz: 13, cursor: 'pointer' }, { html: key, className: 'ellipsis hoverHue' });
	dLabel.onclick = simpleOnclickLabel;
	mStyle(dSym, { cursor: 'pointer' });
	dSym.onclick = simpleOnclickItem;
	dSym.setAttribute('key', key);
	dSym.setAttribute('draggable', true)
	dSym.ondragstart = ev => { ev.dataTransfer.setData('itemkey', key); }
	return dSym;


	d.id = id; //console.log('d1', d1);
	let item = { div: d, key };
	DA.items[id] = item;
	if (isList(DA.selectedImages) && DA.selectedImages.includes(key)) mSelect(d);

}
function lazyLoad(prop = 'src') {
	let dataProp = 'data-' + prop;
	let tag = prop == 'src' ? 'img' : 'div';
	const elems = document.querySelectorAll(`${tag}[${dataProp}]`);
	const observer = new IntersectionObserver((entries, obs) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				const elem = entry.target;
				elem.innerHTML = elem.dataset[prop];
				//elem[prop] = elem.dataset[prop];
				elem.removeAttribute(dataProp);
				obs.unobserve(elem);
			}
		});
	});
	elems.forEach(img => observer.observe(img));
}
async function showCollection(k, d = 'dMain', outerStyles = {}, symbolStyles = {}, labelStyles = {}, opts = {}) {

	let [w, h] = mSizeSuccession(outerStyles, 100); let gap = valf(outerStyles.gap, 10)

	mClear(d);
	let dParent = mDom(d, { display: 'flex', gap, padding: gap, wrap: true, box: true }, { id: "table", });
	mCenterFlex(dParent);
	let keys = isList(k) ? k : M.byCat[k]; console.log('keys', keys);

	outerStyles = addKeys({ w, h, 'place-items': 'center', display: 'grid', border: 'solid 2px silver', bg: 'dimgray', fg: 'contrast', padding: 10, rounding: 10 }, outerStyles);
	if (opts.onclick) outerStyles.cursor = 'pointer';

	labelStyles = addKeys({ fg: 'contrast', 'text-overflow': 'ellipsis', 'white-space': 'nowrap', overflow: 'hidden', fz: 16, align: 'center' }, labelStyles);

	symbolStyles = addKeys({ h: h - labelStyles.fz, box: true, padding: 4, fg: 'skyblue' }, symbolStyles);

	addKeys({ prefer: 'img' }, opts);
	let optsSymbol = { prefer: opts.prefer };
	let i = 0;
	let n = Math.floor(window.innerWidth / (outerStyles.w + 10)) * Math.floor(window.innerHeight / (outerStyles.h + 10));
	//console.log('n', n);
	for (const k of keys) {
		// let o = M.superdi[k];
		let d1 = mDom(dParent, outerStyles, opts);
		mKey(k, d1, symbolStyles, optsSymbol);
		mDom(d1, labelStyles, { html: k, title: k })
		if (0 === ++i % n) await mSleep(50);
	}
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


function collectCats(klist) {
	let cats = [];
	for (const k of klist) {
		M.superdi[k].cats.map(x => addIf(cats, x));
	}
	return cats;
}
function simpleShowImageInBatch(key, dParent, styles = {}, opts = {}) {
	let o = M.superdi[key]; o.key = key;
	addKeys({ bg: rColor() }, styles);
	mClear(dParent);
	[w, h] = [dParent.offsetWidth, dParent.offsetHeight];
	let [sz, fz] = [.9 * w, .8 * h];
	let d1 = mDom(dParent, { position: 'relative', w: '100%', h: '100%', padding: 11, box: true });//overflow: 'hidden', 
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
	else if (isdef(o.uni)) el = mDom(d1, { fz: fz, hline: fz, family: "'Noto Sans', sans-serif", fg: rColor(), display: 'inline' }, { html: o.uni });
	else if (isdef(o.emo)) el = mDom(d1, { fz: fz, hline: fz, family: 'emoNoto', fg: rColor(), display: 'inline' }, { html: o.emo });
	else if (isdef(o.fa)) el = mDom(d1, { fz: fz, hline: fz, family: 'pictoFa', bg: 'transparent', fg: rColor(), display: 'inline' }, { html: String.fromCharCode('0x' + o.fa) });
	else if (isdef(o.ga)) el = mDom(d1, { fz: fz, hline: fz, family: 'pictoGame', bg: 'beige', fg: rColor(), display: 'inline' }, { html: String.fromCharCode('0x' + o.ga) });
	else if (isdef(o.fa6)) el = mDom(d1, { fz: fz, hline: fz, family: 'fa6', bg: 'transparent', fg: rColor(), display: 'inline' }, { html: String.fromCharCode('0x' + o.fa6) });
	assertion(el, 'PROBLEM!!! ' + key);
	let label = mDom(d1, { fz: 11, cursor: 'pointer' }, { html: o.key, className: 'ellipsis hoverHue' });
	label.onclick = simpleOnclickLabel;
	mStyle(d1, { cursor: 'pointer' });
	d1.onclick = simpleOnclickItem;
	d1.setAttribute('key', key);
	d1.setAttribute('draggable', true)
	d1.ondragstart = ev => { ev.dataTransfer.setData('itemkey', key); }
	return d1;
}
async function simpleOnclickItem(ev) {
	let id = evToId(ev); console.log('item', id, DA.items[id]);
	let item = DA.items[id]; if (nundef(item)) return;
	let selkey = item.key;
	toggleSelectionOfPicture(iDiv(item), selkey, DA.selectedImages);
	//simpleCheckCommands();
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
function onclickItem(ev) {
	//console.log('onclickItem', ev.target);
	let id = evToId(ev); //console.log('item',id,DA.items[id]); return;
	let item = DA.items[id]; if (nundef(item)) return;
	let selkey = item.key;
	toggleSelection(iDiv(item), selkey, DA.selectedImages);
}
function toggleSelection(elem, selkey, selectedPics, className = 'framedPicture') {
	if (selectedPics.includes(selkey)) {
		removeInPlace(selectedPics, selkey); mClassRemove(elem, className);
	} else {
		selectedPics.push(selkey); mClass(elem, className);
	}
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
function findParentWithId(elem) { while (elem && !(elem.id)) { elem = elem.parentNode; } return elem; }

function evToId(ev) {
	let elem = findAncestorWith(ev.target, { id: true });
	return elem.id;
}
function showItem(key, d) {

	//mClass(d, 'magnifiable')
	let id = getUID();
	let d1 = mKey(key, d, {}, { prefer: 'emo' }); // simpleShowImageInBatch(key, d, {}, { prefer: 'photo' });
	d1.id = id; //console.log('d1', d1);
	let item = { div: d1, key };
	DA.items[id] = item;
	if (isList(DA.selectedImages) && DA.selectedImages.includes(key)) mSelect(d1);

}

function mKey(imgKey, d, styles = {}, opts = {}) {
	//console.log('___mKey', imgKey, styles, opts);
	styles = jsCopy(styles);
	let o = imgKey.includes('.') ? { src: imgKey } : opts.prefer == 'plain' ? { plain: imgKey } : lookup(M.superdi, [imgKey]);
	//console.log(o)
	let type = opts.prefer;
	let types = ['src', 'img', 'photo', 'uni', 'emo', 'fa6', 'fa', 'ga', 'plain'];
	if (nundef(o[type])) type = types.find(x => isdef(o[x]));
	//console.log(type, o)

	let d0 = mDom(d, styles, opts);
	mCenterCenterFlex(d0);

	if (['img', 'src', 'photo'].includes(type)) {
		let [_, h] = mSizeSuccession(styles, 40);
		console.log(':::IMAGE type', o[type], h);
		addKeys({ h, w: h, fit: 'cover', 'object-position': 'center center' }, styles);
		mDom(d0, styles, { ...opts, tag: 'img', src: o[type], alt: imgKey });
		// mDom(d0, {...styles, h, w:h, fit:'cover', round:true}, { ...opts, tag: 'img', src: o[type], alt: imgKey });
		//mImg(o.type, d0, { h: mSizeSuccession(styles, 40)[1] }, opts);
		//let [_, h] = mSizeSuccession(styles, 40);
		//copyKeys({ h, w:h, fit: 'cover', 'object-position': 'center center' }, styles);
		//copyKeys({ tag: 'img', src:o[type] }, opts)
		//let img = mDom(d0, styles, opts);
	} else {
		const families = { uni: "'Noto Sans', sans-serif", emo: 'emoNoto', fa6: 'fa6', fa: 'pictoFa', ga: 'pictoGame' };
		let family = families[type] || 'inherit';
		addKeys({ display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', width: '100%', height: '100%', fontSize: styles.fz || 'inherit', family, lineHeight: '1', verticalAlign: 'middle' }, styles);
		let html = ['fa6', 'fa', 'ga'].includes(type) ? `&#x${o[type]};` : o[type];
		//console.log('mKey', imgKey, type, o[type], html, styles.family);
		mDom(d0, styles, { ...opts, html });
	}
	return d0;

}

function mKey2(imgKey, d, styles = {}, opts = {}) {
	styles = jsCopy(styles);
	let o = lookup(M.superdi, [imgKey]);
	let type = determineType(o, opts.prefer);
	let src = !o ? (imgKey.includes('.') ? imgKey : null) : (type && o[type] ? o[type] : null);

	if (!o) type = src ? null : 'plain';
	else if (!type || !o[type]) type = determineType(o);

	let d0 = mDom(d, styles, opts);
	mCenterCenterFlex(d0);

	if (isdef(src)) {
		mImg(src, d0, { h: mSizeSuccession(styles, 40)[1] }, { tag: 'img', src });
	} else if (type === 'text' || type === 'uni') {
		renderContent(o.text, d0, styles, type === 'uni' ? "'Noto Sans', sans-serif" : 'emoNoto');
	} else if (type !== 'plain') {
		renderContent(`&#x${o[type]};`, d0, styles, type === 'fa6' ? 'fa6' : type === 'fa' ? 'pictoFa' : 'pictoGame');
	} else {
		mDom(d0, styles, { html: imgKey });
	}

	return d0;
}
function determineType(o, prefer) {
	return prefer == 'plain' ? prefer :
		prefer && (!o || o[prefer]) ? prefer :
			isdef(o.img) ? 'img' :
				isdef(o.photo) ? 'photo' :
					isdef(o.text) ? (o.colls.includes('unicode') ? 'uni' : 'text') :
						isdef(o.fa6) ? 'fa6' :
							isdef(o.fa) ? 'fa' :
								isdef(o.ga) ? 'ga' : 'plain';
}

function mKey0(imgKey, d, styles = {}, opts = {}) {
	styles = jsCopy(styles);
	let type = opts.prefer;
	let o = type !== 'plain' ? lookup(M.superdi, [imgKey]) : null;
	let src;

	if (!o) {
		if (imgKey.includes('.')) {
			src = imgKey;
		} else {
			type = 'plain';
		}
	} else if (!type || !o[type]) {
		console.log('o', o)
		type = isdef(o.img) ? 'img' :
			isdef(o.photo) ? 'photo' :
				isdef(o.text) ? o.colls.includes('unicode') ? 'uni' : 'text' :
					isdef(o.fa6) ? 'fa6' :
						isdef(o.fa) ? 'fa' :
							isdef(o.ga) ? 'ga' : null;
		if (type === 'img' || type === 'photo') src = o[type];
	}

	let d0 = mDom(d, styles, opts);
	mCenterCenterFlex(d0); // Ensure the container is centered
	console.log('type', type, 'imgKey', imgKey);

	if (isdef(src)) {
		let [w, h] = mSizeSuccession(styles, 40);
		let imgStyles = { h };
		let imgOpts = { tag: 'img', src };
		mImg(src, d0, imgStyles, imgOpts);
	} else if (type === 'text' || type === 'uni') {
		// Center the text inside the container
		let family = valf(styles.family, type == 'uni' ? "'Noto Sans', sans-serif" : 'emoNoto');
		let textStyles = {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			textAlign: 'center',
			width: '100%',
			height: '100%',
			fontSize: styles.fz || 'inherit',
			family,
			//fontFamily: styles.family || 'inherit',
			lineHeight: '1', // Ensure consistent vertical alignment
			verticalAlign: 'middle' // Align text vertically
		};
		mDom(d0, textStyles, { html: o.text });
	} else if (type !== 'plain') {
		//let family = type === 'fa6' ? 'Font Awesome 6 Free' : 'Font Awesome 5 Free';
		let family = type == 'fa6' ? 'fa6' : type == 'fa' ? 'pictoFa' : 'pictoGame';
		let textStyles = {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			textAlign: 'center',
			width: '100%',
			height: '100%',
			fontSize: styles.fz || 'inherit',
			family,
			//fontFamily: styles.family || 'inherit',
			lineHeight: '1', // Ensure consistent vertical alignment
			verticalAlign: 'middle' // Align text vertically
		};
		let html = `&#x${o[type]};`;
		addKeys({ family }, styles);
		mDom(d0, textStyles, { html });
	} else {
		addKeys({ html: imgKey }, opts);
		mDom(d0, styles, opts);
	}

	return d0;
}

function mKey1(imgKey, d, styles = {}, opts = {}) {
	styles = jsCopy(styles);
	let type = opts.prefer;
	let o = type !== 'plain' ? lookup(M.superdi, [imgKey]) : null;
	let src;

	// Determine the type and source
	if (!o) {
		src = imgKey.includes('.') ? imgKey : null;
		type = src ? null : 'plain';
	} else if (!type || !o[type]) {
		type = determineType1(o);
		if (type === 'img' || type === 'photo') src = o[type];
	}

	// Create the container
	let d0 = mDom(d, styles, opts);
	mCenterCenterFlex(d0);

	// Render based on type
	if (isdef(src)) {
		renderImage(src, d0, styles);
	} else if (type === 'text' || type === 'uni') {
		renderText(o.text, d0, styles, type);
	} else if (type !== 'plain') {
		renderIcon(o[type], d0, styles, type);
	} else {
		renderPlain(imgKey, d0, styles, opts);
	}

	return d0;
}

// Helper to determine the type
function determineType1(o) {
	return isdef(o.img) ? 'img' :
		isdef(o.photo) ? 'photo' :
			isdef(o.text) ? (o.colls.includes('unicode') ? 'uni' : 'text') :
				isdef(o.fa6) ? 'fa6' :
					isdef(o.fa) ? 'fa' :
						isdef(o.ga) ? 'ga' : null;
}

// Helper to render an image
function renderImage(src, d0, styles) {
	let [w, h] = mSizeSuccession(styles, 40);
	let imgStyles = { h };
	let imgOpts = { tag: 'img', src };
	mImg(src, d0, imgStyles, imgOpts);
}

// Helper to render text
function renderText(text, d0, styles, type) {
	let family = valf(styles.family, type === 'uni' ? "'Noto Sans', sans-serif" : 'emoNoto');
	let textStyles = {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		textAlign: 'center',
		width: '100%',
		height: '100%',
		fontSize: styles.fz || 'inherit',
		family,
		lineHeight: '1',
		verticalAlign: 'middle'
	};
	mDom(d0, textStyles, { html: text });
}

// Helper to render an icon
function renderIcon(iconCode, d0, styles, type) {
	let family = type === 'fa6' ? 'fa6' : type === 'fa' ? 'pictoFa' : 'pictoGame';
	let textStyles = {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		textAlign: 'center',
		width: '100%',
		height: '100%',
		fontSize: styles.fz || 'inherit',
		family,
		lineHeight: '1',
		verticalAlign: 'middle'
	};
	let html = `&#x${iconCode};`;
	mDom(d0, textStyles, { html });
}

// Helper to render plain text
function renderPlain(imgKey, d0, styles, opts) {
	addKeys({ html: imgKey }, opts);
	mDom(d0, styles, opts);
}

function mKey2(imgKey, d, styles = {}, opts = {}) {
	styles = jsCopy(styles);
	let type = opts.prefer;
	let o = type !== 'plain' ? lookup(M.superdi, [imgKey]) : null;
	let src = !o ? (imgKey.includes('.') ? imgKey : null) : (type && o[type] ? o[type] : null);

	if (!o) type = src ? null : 'plain';
	else if (!type || !o[type]) type = determineType2(o);

	let d0 = mDom(d, styles, opts);
	mCenterCenterFlex(d0);

	if (isdef(src)) {
		mImg(src, d0, { h: mSizeSuccession(styles, 40)[1] }, { tag: 'img', src });
	} else if (type === 'text' || type === 'uni') {
		renderContent(o.text, d0, styles, type === 'uni' ? "'Noto Sans', sans-serif" : 'emoNoto');
	} else if (type !== 'plain') {
		renderContent(`&#x${o[type]};`, d0, styles, type === 'fa6' ? 'fa6' : type === 'fa' ? 'pictoFa' : 'pictoGame');
	} else {
		mDom(d0, styles, { html: imgKey });
	}

	return d0;
}

function determineType2(o) {
	return isdef(o.img) ? 'img' :
		isdef(o.photo) ? 'photo' :
			isdef(o.text) ? (o.colls.includes('unicode') ? 'uni' : 'text') :
				isdef(o.fa6) ? 'fa6' :
					isdef(o.fa) ? 'fa' :
						isdef(o.ga) ? 'ga' : null;
}

function renderContent(html, d0, styles, family) {
	mDom(d0, {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		textAlign: 'center',
		width: '100%',
		height: '100%',
		fontSize: styles.fz || 'inherit',
		family,
		lineHeight: '1',
		verticalAlign: 'middle'
	}, { html });
}
function mKey0(imgKey, d, styles = {}, opts = {}) {
	styles = jsCopy(styles);
	let o = opts.prefer !== 'plain' ? lookup(M.superdi, [imgKey]) : null;
	let type = opts.prefer || (o ? determineType(o) : imgKey.includes('.') ? null : 'plain');
	let src = o && (type === 'img' || type === 'photo') ? o[type] : imgKey.includes('.') ? imgKey : null;

	let d0 = mDom(d, styles, opts);
	mCenterCenterFlex(d0);

	if (isdef(src)) {
		mImg(src, d0, { h: mSizeSuccession(styles, 40)[1] }, { tag: 'img', src });
	} else if (type === 'uni' || type === 'emo') {
		renderContent(o[type], d0, styles, type === 'uni' ? "'Noto Sans', sans-serif" : 'emoNoto');
	} else if (type !== 'plain') {
		renderContent(`&#x${o[type]};`, d0, styles, type === 'fa6' ? 'fa6' : type === 'fa' ? 'pictoFa' : 'pictoGame');
	} else {
		mDom(d0, styles, { html: imgKey });
	}

	return d0;
}

function determineType(o) {
	return isdef(o.img) ? 'img' :
		isdef(o.photo) ? 'photo' :
			isdef(o.uni) ? 'uni' :
				isdef(o.emo) ? 'emo' :
					isdef(o.fa6) ? 'fa6' :
						isdef(o.fa) ? 'fa' :
							isdef(o.ga) ? 'ga' : 'plain';
}

function renderContent(html, d0, styles, family) {
	mDom(d0, {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		textAlign: 'center',
		width: '100%',
		height: '100%',
		fontSize: styles.fz || 'inherit',
		family,
		lineHeight: '1',
		verticalAlign: 'middle'
	}, { html });
}
async function mKeyO(imgKey, d, styles = {}, opts = {}) {
	styles = jsCopy(styles);
	let type = opts.prefer;
	let o = type != 'plain' ? lookup(M.superdi, [imgKey]) : null;
	let src;
	if (nundef(o) && imgKey.includes('.')) src = imgKey;
	else if (isdef(o) && (type == 'img' || type == 'photo') && isdef(o[type])) src = o[type];
	else if (isdef(o) && isdef(o.img)) src = o.img;
	if (isdef(src)) {
		let [w, h] = mSizeSuccession(styles, 40);
		addKeys({ w, h }, styles);
		addKeys({ tag: 'img', src }, opts);
		let d0 = mDom(d, styles, opts);
		mCenterCenterFlex(d0);
		let img = await mImgAsync(d0, styles, opts, roundIfTransparentCorner);
		return d0;
	} else if (isdef(o)) {
		let [w, h] = mSizeSuccession(styles, 40);
		let sz = h;
		addKeys({ h }, styles);
		if (nundef(type)) type = isdef(o.text) ? 'text' : isdef(o.fa6) ? 'fa6' : isdef(o.fa) ? 'fa' : isdef(o.ga) ? 'ga' : null;
		let family = type == 'text' ? 'emoNoto' : type == 'fa6' ? 'fa6' : type == 'fa' ? 'pictoFa' : 'pictoGame';
		let html = type == 'text' ? o.text : String.fromCharCode('0x' + o[type]);
		addKeys({ family }, styles);
		let d0 = mDom(d, styles, opts);
		mCenterCenterFlex(d0);
		let d1 = mDom(d0, {}, { html });
		let r = getRect(d1);
		[w, h] = [r.w, r.h];
		let scale = Math.min(sz / w, sz / h);
		d1.style.transformOrigin = 'center center';
		d1.style.transform = `scale(${scale})`;
		d1.style.transform = `scale(${scale})`;
		return d0;
	} else {
		addKeys({ html: imgKey }, opts)
		let img = mDom(d, styles, opts);
		return img;
	}
	console.log('type', type)
}
async function mKey(imgKey, d, styles = {}, opts = {}) {
	styles = jsCopy(styles);
	let type = opts.prefer; console.log(type)
	let o = type != 'plain' ? lookup(M.superdi, [imgKey]) : null;
	let src;
	if (nundef(o) && imgKey.includes('.')) src = imgKey;
	else if (isdef(o) && (type == 'img' || type == 'photo') && isdef(o[type])) src = o[type];
	else if (isdef(o) && isdef(o.img) && nundef(type)) src = o.img;
	if (isdef(src)) {
		let d0 = mDom(d, styles, opts);
		mCenterCenterFlex(d0);
		let [w, h] = mSizeSuccession(styles, 40);
		let imgStyles = { h }, imgOpts = { tag: 'img', src }
		let img = await mImgAsync(d0, imgStyles, imgOpts, roundIfTransparentCorner);
		return d0;
	} else if (isdef(o)) {
		if (nundef(type)) type = isdef(o.text) ? 'text' : isdef(o.fa6) ? 'fa6' : isdef(o.fa) ? 'fa' : isdef(o.ga) ? 'ga' : null;
		let family = type == 'text' ? 'emoNoto' : type == 'fa6' ? 'fa6' : type == 'fa' ? 'pictoFa' : 'pictoGame';
		let html = type == 'text' ? o.text : String.fromCharCode('0x' + o[type]);
		addKeys({ family }, styles);
		let d0 = mDom(d, styles, opts);
		mCenterCenterFlex(d0);
		let d1 = mDom(d0, {}, { html });
		let r = getRect(d1);
		[w, h] = [r.w, r.h];
		return d0;
	} else {
		addKeys({ html: imgKey }, opts)
		let img = mDom(d, styles, opts);
		return img;
	}
}

function mKey(imgKey, d, styles = {}, opts = {}) {
	styles = jsCopy(styles);
	let type = opts.prefer;
	let o = type !== 'plain' ? lookup(M.superdi, [imgKey]) : null;
	let src;

	if (!o) {
		if (imgKey.includes('.')) {
			src = imgKey;
		} else {
			type = 'plain';
		}
	} else if (!type || !o[type]) {
		type = isdef(o.img) ? 'img' :
			isdef(o.photo) ? 'photo' :
				isdef(o.text) ? o.colls.includes('unicode') ? 'uni' : 'text' :
					isdef(o.fa6) ? 'fa6' :
						isdef(o.fa) ? 'fa' :
							isdef(o.ga) ? 'ga' : null;
		if (type === 'img' || type === 'photo') src = o[type];
	}

	let d0 = mDom(d, styles, opts);
	mCenterCenterFlex(d0); // Ensure the container is centered

	if (isdef(src)) {
		let [w, h] = mSizeSuccession(styles, 40);
		let imgStyles = { h };
		let imgOpts = { tag: 'img', src };
		mImg(src, d0, imgStyles, imgOpts);
	} else if (type === 'text') {
		// Center the text inside the container
		console.log('family', styles.family)
		let textStyles = {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			textAlign: 'center',
			width: '100%',
			height: '100%',
			fontSize: styles.fz || 'inherit',
			fontFamily: styles.family || 'inherit'
		};
		mDom(d0, textStyles, { html: o.text });
	} else if (type !== 'plain') {
		// let family = type === 'fa6' ? 'Font Awesome 6 Free' : 'Font Awesome 5 Free';
		let family = type == 'uni' ? "'Noto Sans', sans-serif" : type == 'text' ? 'emoNoto' : type == 'fa6' ? 'fa6' : type == 'fa' ? 'pictoFa' : 'pictoGame';
		//let html = type == 'text' ? o.text : String.fromCharCode('0x' + o[type]);
		let html = `&#x${o[type]};`;
		addKeys({ family }, styles);
		mDom(d0, styles, { html });
	} else {
		addKeys({ html: imgKey }, opts);
		mDom(d0, styles, opts);
	}

	return d0;
}


function mKey(imgKey, d, styles = {}, opts = {}) {
	styles = jsCopy(styles);
	let type = opts.prefer;
	let o = type !== 'plain' ? lookup(M.superdi, [imgKey]) : null;
	let src;

	if (!o) {
		if (imgKey.includes('.')) {
			src = imgKey;
		} else {
			type = 'plain';
		}
	} else if (!type || !o[type]) {
		type = isdef(o.img) ? 'img' :
			isdef(o.photo) ? 'photo' :
				isdef(o.text) ? 'text' :
					isdef(o.fa6) ? 'fa6' :
						isdef(o.fa) ? 'fa' :
							isdef(o.ga) ? 'ga' : null;
		if (type === 'img' || type === 'photo') src = o[type];
	}

	let d0 = mDom(d, styles, opts);
	mCenterCenterFlex(d0);

	if (isdef(src)) {
		let [w, h] = mSizeSuccession(styles, 40);
		let imgStyles = { h };
		let imgOpts = { tag: 'img', src };
		mImg(src, d0, imgStyles, imgOpts); // Use mImg directly for synchronous image creation
	} else if (type !== 'plain') {
		let family = type === 'text' ? 'emoNoto' :
			type === 'fa6' ? 'fa6' :
				type === 'fa' ? 'pictoFa' : 'pictoGame';
		// console.log('o', o, 'type', type, 'imgKey', imgKey);
		//let html = type === 'text' ? o.text : `&#x${o[type]};`;
		let html = type === 'text' ? o.text : String.fromCharCode('0x' + o[type]);
		addKeys({ family }, styles);
		let d1 = mDom(d0, styles, { html });
		// let r = getRect(d1);
		// let [w, h] = [r.w, r.h];
	} else {
		addKeys({ html: imgKey }, opts);
		mDom(d0, styles, opts);
	}

	return d0;
}


async function uiFilter(dParent, filter) {
	// Create a container for the filter bar
	let dFilterBar = mDom(dParent, { gap: 10, padding: 12, display: 'flex', alignItems: 'center', flexFlow: 'wrap' });

	// Collection input
	mDom(dFilterBar, { fontSize: 24, fontWeight: 'bold' }, { html: 'Collection:' });
	let collectionList = Object.keys(M.byCollection);
	let dlCollection = mDatalist(dFilterBar, collectionList, { placeholder: "<select from list>" });
	dlCollection.inpElem.oninput = ev => {
		console.log('Selected Collection:', ev.target.value);
		filter.collection = ev.target.value;
	};

	// Category input
	mDom(dFilterBar, { fontSize: 24, fontWeight: 'bold' }, { html: 'Category:' });
	let categoryList = Object.keys(M.byCat);
	let dlCategory = mDatalist(dFilterBar, categoryList, { placeholder: "<select from list>" });
	dlCategory.inpElem.oninput = ev => {
		console.log('Selected Category:', ev.target.value);
		filter.category = ev.target.value;
	};

	// Search input
	mDom(dFilterBar, { fontSize: 24, fontWeight: 'bold' }, { html: 'Search:' });
	let searchInput = mDom(dFilterBar, { width: 180, marginLeft: 4 }, { tag: 'input', className: 'input', placeholder: "<enter search term>" });
	searchInput.oninput = ev => {
		console.log('Search Term:', ev.target.value);
		filter.search = ev.target.value;
	};
}
async function uiFilter(dParent, filter) {
	// Create a container for the filter bar
	let dFilterBar = mDom(dParent, { gap: 10, padding: 12, display: 'flex', alignItems: 'center', flexFlow: 'wrap' });

	// Collection/Category input
	mDom(dFilterBar, { fontSize: 24, fontWeight: 'bold' }, { html: 'Filter By:' });
	let optionsList = [...Object.keys(M.byCollection), ...Object.keys(M.byCat)];
	let dlFilterBy = mDatalist(dFilterBar, optionsList, { placeholder: "<select collection or category>" });
	dlFilterBy.inpElem.oninput = ev => {
		console.log('Selected Filter:', ev.target.value);
		filter.filterBy = ev.target.value;
	};

	// Search input
	mDom(dFilterBar, { fontSize: 24, fontWeight: 'bold' }, { html: 'Search:' });
	let searchInput = mDom(dFilterBar, { width: 180, marginLeft: 4 }, { tag: 'input', className: 'input', placeholder: "<enter search term>" });
	searchInput.oninput = ev => {
		console.log('Search Term:', ev.target.value);
		filter.search = ev.target.value;
	};
}
async function uiFilter(dParent, filter) {
	// Create a container for the filter bar
	let dFilterBar = mDom(dParent, { gap: 10, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' });

	// Collection/Category input
	mDom(dFilterBar, { fontSize: 24, fontWeight: 'bold' }, { html: 'Filter By:' });
	let optionsList = [...Object.keys(M.byCollection), ...Object.keys(M.byCat)].sort(); // Sort alphabetically
	let dlFilterBy = mDatalist(dFilterBar, optionsList, { placeholder: "<select collection or category>" });
	dlFilterBy.inpElem.oninput = ev => {
		console.log('Selected Filter:', ev.target.value);
		filter.filterBy = ev.target.value;
	};

	// Search input
	mDom(dFilterBar, { fontSize: 24, fontWeight: 'bold', marginTop: 10 }, { html: 'Search:' });
	let searchInput = mDom(dFilterBar, { width: 180 }, { tag: 'input', className: 'input', placeholder: "<enter search term>" });
	searchInput.oninput = ev => {
		console.log('Search Term:', ev.target.value);
		filter.search = ev.target.value;
	};
}
function enableCustomTooltip() {
	// Create a tooltip element
	const tooltip = document.createElement('div');
	tooltip.style.position = 'absolute';
	tooltip.style.backgroundColor = 'black';
	tooltip.style.color = 'white';
	tooltip.style.padding = '5px';
	tooltip.style.borderRadius = '4px';
	tooltip.style.fontSize = '12px';
	tooltip.style.zIndex = '1000';
	tooltip.style.display = 'none'; // Initially hidden
	document.body.appendChild(tooltip);

	// Add event listeners to elements with a title attribute
	document.querySelectorAll('[title]').forEach(el => {
		el.addEventListener('mouseover', (event) => {
			const title = el.getAttribute('title');
			if (!title) return;

			// Show the tooltip
			tooltip.textContent = title;
			tooltip.style.display = 'block';

			// Position the tooltip
			const rect = el.getBoundingClientRect();
			const tooltipRect = tooltip.getBoundingClientRect();
			let top = rect.bottom + window.scrollY + 5; // Below the element
			let left = rect.left + window.scrollX;

			// Adjust if the tooltip goes out of the viewport
			if (left + tooltipRect.width > window.innerWidth) {
				left = window.innerWidth - tooltipRect.width - 5; // Adjust to fit within the viewport
			}
			if (top + tooltipRect.height > window.innerHeight) {
				top = rect.top + window.scrollY - tooltipRect.height - 5; // Place above the element
			}

			tooltip.style.top = `${top}px`;
			tooltip.style.left = `${left}px`;
		});

		el.addEventListener('mouseout', () => {
			// Hide the tooltip
			tooltip.style.display = 'none';
		});
	});
}
document.addEventListener('DOMContentLoaded', enableCustomTooltip);

function uiFilterElement() {
	let html = `
		<div class="title" style="gap: 10px; padding: 12px; display: flex; align-items: center; flex-flow: wrap;">
			<div style="display: flex; align-items: center;">
				<div style="font-size: 24px; font-weight: bold;">Collection:</div>
				<div><input class="input" placeholder="&lt;select from list&gt;" list="dl_1" style="width: 180px; margin-left: 4px;"><datalist id="dl_1" class="datalist">
				<option value="airports"></option>
				<option value="all"></option>
				<option value="amanda"></option><option value="birds"></option><option value="emo"></option><option value="fa6"></option><option value="icon"></option><option value="nations"></option><option value="spotit"></option><option value="story"></option><option value="tierspiel"></option><option value="users"></option></datalist></div></div><div style="display: flex; align-items: center;"><div edit="true" style="font-size: 24px; font-weight: bold; width: auto; text-align: right;">Filter:</div><div><input class="input" placeholder="&lt;enter value&gt;" list="dl_2" style="width: 180px; margin-left: 4px;"><datalist id="dl_2" class="datalist"><option value="animal"></option><option value="insect"></option></datalist></div></div><div style="gap: 10px; text-align: right;"><button class="input" id="bPrev" style="width: 70px; margin: 0px 0px 0px 10px;">prev</button><button class="input" id="bNext" style="width: 70px; margin: 0px 0px 0px 10px;">next</button></div></div>
	`;
	return html
}
async function uiFilterMenu(dParent, name = 'all') {
	if (nundef(name)) name = 'emo';
	let list = [];
	if (name == 'all' || isEmpty(name)) { list = Object.keys(M.superdi); }
	else if (isdef(M.byCollection[name])) { list = M.byCollection[name]; }
	else list = [];
	let dMenu = mDom(dParent)
	mClear(dMenu);
	let d = mDom(dMenu); mFlex(d);
	mDom(d, { fz: 24, weight: 'bold' }, { html: 'Collection:' });
	let collNames = M.collections;
	let dlColl = mDatalist(d, collNames, { placeholder: "<select from list>" });
	dlColl.inpElem.oninput = ev => { console.log(sisi.name, ev.target.value); simpleInit(ev.target.value, sisi); }
	dlColl.inpElem.value = name;
	list = sortByFunc(list, x => M.superdi[x].friendly);
	DA.masterKeys = list;
	let keys = DA.keys = DA.filter ? collFilterImages(sisi, sisi.filter) : list;
	let cats = collectCats(keys);
	cats.sort();
	d = mDom(dMenu); mFlex(d);
	let wLabel = 'auto'; //sisi.cols < 6 ? 117 : 'auto';
	mDom(d, { fz: 24, weight: 'bold', w: wLabel, align: 'right' }, { edit: true, html: 'Filter:' });
	let dlCat = mDatalist(d, cats, { edit: false, placeholder: "<enter value>", value: DA.filter });
	dlCat.inpElem.oninput = ev => {
		let coll = UI.simple;
		let s = ev.target.value.toLowerCase().trim();
		let list = collFilterImages(coll, s);
		coll.keys = list;
		coll.filter = s;
		coll.index = 0; coll.pageIndex = 1; simpleClearSelections();
		simpleShowImageBatch(coll, 0, false);
	};
	return keys;
	// d = mDom(dMenu, { gap: 10, align: 'right' });
	// mButton('prev', () => simpleShowImageBatch(sisi, -1), d, { w: 70, margin: 0, maleft: 10 }, 'input', 'bPrev');
	// mButton('next', () => simpleShowImageBatch(sisi, 1), d, { w: 70, margin: 0, maleft: 10 }, 'input', 'bNext');
	//simpleClearSelections();
	//simpleShowImageBatch(sisi);

}
async function _mKey(imgKey, d, styles = {}, opts = {}) {
	styles = jsCopy(styles);
	let type = opts.prefer;
	let o = type != 'plain' ? lookup(M.superdi, [imgKey]) : null;
	let src;
	if (nundef(o)) if (imgKey.includes('.')) src = imgKey; else type = 'plain';
	else if (nundef(type) || nundef(o[type])) {
		type = isdef(o.img) ? 'img' : isdef(o.photo) ? o.photo : isdef(o.text) ? 'text' : isdef(o.fa6) ? 'fa6' : isdef(o.fa) ? 'fa' : isdef(o.ga) ? 'ga' : null;
		if (type == 'img' || type == 'photo') src = o[type];
	}
	if (isdef(src)) {
		let d0 = mDom(d, styles, opts);
		mCenterCenterFlex(d0);
		let [w, h] = mSizeSuccession(styles, 40);
		let imgStyles = { h }, imgOpts = { tag: 'img', src }
		let img = await mImgAsync(d0, imgStyles, imgOpts, roundIfTransparentCorner);
		return d0;
	} else if (type != 'plain') {
		let family = type == 'text' ? 'emoNoto' : type == 'fa6' ? 'fa6' : type == 'fa' ? 'pictoFa' : 'pictoGame';
		let html = type == 'text' ? o.text : String.fromCharCode('0x' + o[type]);
		addKeys({ family }, styles);
		let d0 = mDom(d, styles, opts);
		mCenterCenterFlex(d0);
		let d1 = mDom(d0, {}, { html });
		let r = getRect(d1);
		[w, h] = [r.w, r.h];
		return d0;
	} else {
		addKeys({ html: imgKey }, opts)
		let img = mDom(d, styles, opts);
		return img;
	}
}

function createStickyAndContentDivs() {

	let stickyDiv = mDom(document.body, { position: 'sticky', top: 0, zIndex: 1000, padding: 10, bg: '#00000080' }, { id: 'dSticky' });
	mInsert('dPage', stickyDiv);
	// {box:true,className:'section',position:'sticky',height:'auto',top:0,zIndex:1000,padding:10,bg:'#00000080'},{id:'dSticky'}//const body = document.body;

	// Create the sticky div
	//const stickyDiv = document.createElement('div');
	// stickyDiv.id = 'dSticky';
	// stickyDiv.style.position = 'sticky';
	// stickyDiv.style.top = '0';
	// stickyDiv.style.zIndex = '1000';
	// stickyDiv.style.padding = '10px';
	// stickyDiv.innerText = 'I am a sticky div';
	//body.appendChild(stickyDiv);

	// // Create the content div
	// const contentDiv = document.createElement('div');
	// contentDiv.id = 'content';
	// contentDiv.style.padding = '20px';
	// contentDiv.innerText = 'This is the content below the sticky div.';
	// body.appendChild(contentDiv);

	// Adjust padding for the content div
	adjustContentPadding();
}
function createStickyAndContentDivs() {
	let stickyDiv = mDom(null, {
		position: 'sticky',
		top: 0,
		zIndex: 1000,
		padding: 10,
		bg: '#00000080',
		width: '100%', // Ensure it spans the full viewport width
		left: 0,        // Align to the left edge
		right: 0        // Align to the right edge
	}, { id: 'dSticky' });
	mInsert('dPage', stickyDiv);

	// Adjust padding for the content div
	adjustContentPadding();
}
function adjustContentPadding() {
	const sticky = document.getElementById('dSticky');
	const content = document.getElementById('dPage');
	if (sticky && content) {
		content.style.paddingTop = sticky.offsetHeight + 'px';
	}
}


function createCard1(rank = "10", suit = "♣", width = 240, height = 336) {
	const layout = {
		'2': [[1, 0], [1, 4]],
		'3': [[1, 0], [1, 2], [1, 4]],
		'4': [[0, 0], [2, 0], [0, 4], [2, 4]],
		'5': [[0, 0], [2, 0], [1, 2], [0, 4], [2, 4]],
		'6': [[0, 0], [2, 0], [0, 2], [2, 2], [0, 4], [2, 4]],
		'7': [[0, 0], [2, 0], [0, 2], [1, 1], [2, 2], [0, 4], [2, 4]],
		'8': [[0, 0], [2, 0], [0, 2], [1, 1], [2, 2], [0, 4], [2, 4], [1, 3]],
		'9': [[0, 0], [2, 0], [0, 2], [1, 1], [2, 2], [0, 4], [2, 4], [1, 3], [1, 2]],
		'10': [[0, 0], [2, 0], [0, 1.5], [2, 1.5], [1, 1], [1, 2], [1, 3], [0, 3.5], [2, 3.5], [0, 4]],
	};

	const card = document.createElement("div");
	card.style.position = "relative";
	card.style.width = width + "px";
	card.style.height = height + "px";
	card.style.border = "1px solid black";
	card.style.borderRadius = "12px";
	card.style.background = "white";
	card.style.fontFamily = "serif";

	const colX = [0.2, 0.5, 0.8].map(x => x * width);
	const rowY = [0.08, 0.23, 0.38, 0.53, 0.68].map(y => y * height);

	layout[rank].forEach(([col, row]) => {
		const pip = document.createElement("div");
		pip.textContent = suit;
		pip.style.position = "absolute";
		pip.style.left = (colX[col] - 10) + "px";
		pip.style.top = (rowY[row] - 12) + "px";
		pip.style.fontSize = Math.floor(height * 0.09) + "px";
		card.appendChild(pip);
	});

	// Top-left corner: rank and suit
	const top = document.createElement("div");
	top.innerHTML = `<div>${rank}</div><div style="text-align:center">${suit}</div>`;
	top.style.position = "absolute";
	top.style.left = "4px";
	top.style.top = "2px";
	top.style.fontSize = Math.floor(height * 0.08) + "px";
	card.appendChild(top);

	// Bottom-right corner (rotated)
	const bottom = top.cloneNode(true);
	bottom.style.left = "";
	bottom.style.right = "4px";
	bottom.style.top = "";
	bottom.style.bottom = "2px";
	bottom.style.transform = "rotate(180deg)";
	bottom.style.textAlign = "center";
	card.appendChild(bottom);

	return card;
}
function createCard2(rank = "10", suit = "♣", width = 240, height = 336) {
	const card = document.createElement("div");
	card.style.position = "relative";
	card.style.width = width + "px";
	card.style.height = height + "px";
	card.style.border = "1px solid black";
	card.style.borderRadius = "12px";
	card.style.background = "white";
	card.style.fontFamily = "serif";

	const centerX = width / 2;
	const colOffset = width * 0.25; // for left/right columns
	const colX = [centerX - colOffset, centerX, centerX + colOffset];

	const numRows = 4; // max for side columns
	const topMargin = height * 0.12;
	const pipSpacing = (height - 2 * topMargin) / (numRows - 1);

	// Pip positions for 10: 4-3-4 in 3 columns
	const pipData = [
		[0, [0, 1, 2, 3]],     // left column
		[1, [0.5, 2, 3.5]],    // center column (slightly staggered)
		[2, [0, 1, 2, 3]]      // right column
	];

	pipData.forEach(([col, rows]) => {
		rows.forEach(rowIndex => {
			const pip = document.createElement("div");
			pip.textContent = suit;
			pip.style.position = "absolute";
			pip.style.left = (colX[col] - width * 0.035) + "px";
			pip.style.top = (topMargin + pipSpacing * rowIndex - height * 0.045) + "px";
			pip.style.fontSize = Math.floor(height * 0.09) + "px";
			card.appendChild(pip);
		});
	});

	// Top-left: rank and suit
	const top = document.createElement("div");
	top.innerHTML = `<div>${rank}</div><div style="text-align:center">${suit}</div>`;
	top.style.position = "absolute";
	top.style.left = "6px";
	top.style.top = "4px";
	top.style.fontSize = Math.floor(height * 0.08) + "px";
	card.appendChild(top);

	// Bottom-right: rotated rank and suit
	const bottom = top.cloneNode(true);
	bottom.style.left = "";
	bottom.style.right = "6px";
	bottom.style.top = "";
	bottom.style.bottom = "4px";
	bottom.style.transform = "rotate(180deg)";
	bottom.style.textAlign = "center";
	card.appendChild(bottom);

	return card;
}
function createCard3(rank = "10", suit = "♣", width = 240, height = 336) {
	const card = document.createElement("div");
	card.style.position = "relative";
	card.style.width = width + "px";
	card.style.height = height + "px";
	card.style.border = "1px solid black";
	card.style.borderRadius = "12px";
	card.style.background = "white";
	card.style.fontFamily = "serif";

	const centerX = width / 2;
	const colOffset = width * 0.25;
	const colX = [centerX - colOffset, centerX, centerX + colOffset];

	const topMargin = height * 0.12;
	const pipSpacing = (height - 2 * topMargin) / 3;

	// Pip patterns for ranks 1 (Ace) to 10
	const pipPatterns = {
		1: [[1, [1.5]]],
		2: [[1, [0, 3]]],
		3: [[1, [0, 1.5, 3]]],
		4: [[0, [0, 3]], [2, [0, 3]]],
		5: [[0, [0, 3]], [1, [1.5]], [2, [0, 3]]],
		6: [[0, [0, 1.5, 3]], [2, [0, 1.5, 3]]],
		7: [[0, [0, 1.5, 3]], [1, [0]], [2, [0, 1.5, 3]]],
		8: [[0, [0, 1.5, 3]], [1, [0.75, 2.25]], [2, [0, 1.5, 3]]],
		9: [[0, [0, 1.5, 3]], [1, [0.5, 1.5, 2.5]], [2, [0, 1.5, 3]]],
		10: [[0, [0, 1, 2, 3]], [1, [0.5, 2, 3.5]], [2, [0, 1, 2, 3]]]
	};

	const value = parseInt(rank);
	const pipData = pipPatterns[value];
	const pipFontSize = height * 0.09;

	pipData.forEach(([col, rows]) => {
		rows.forEach(rowIndex => {
			const pip = document.createElement("div");
			pip.textContent = suit;
			pip.style.position = "absolute";
			pip.style.left = (colX[col] - pipFontSize * 0.35) + "px";
			pip.style.top = (topMargin + pipSpacing * rowIndex - pipFontSize * 0.5) + "px";
			pip.style.fontSize = pipFontSize + "px";
			card.appendChild(pip);
		});
	});

	// Top-left: rank and suit
	const top = document.createElement("div");
	top.innerHTML = `<div>${rank}</div><div style="text-align:center">${suit}</div>`;
	top.style.position = "absolute";
	top.style.left = "6px";
	top.style.top = "4px";
	top.style.fontSize = Math.floor(height * 0.08) + "px";
	card.appendChild(top);

	// Bottom-right: rotated rank and suit
	const bottom = top.cloneNode(true);
	bottom.style.left = "";
	bottom.style.right = "6px";
	bottom.style.top = "";
	bottom.style.bottom = "4px";
	bottom.style.transform = "rotate(180deg)";
	bottom.style.textAlign = "center";
	card.appendChild(bottom);

	return card;
}
function createCardGrid(rank = "10", suit = "♣", width = 240, height = 336) {
	const card = document.createElement("div");
	card.style.position = "relative";
	card.style.width = width + "px";
	card.style.height = height + "px";
	card.style.border = "1px solid black";
	card.style.borderRadius = "12px";
	card.style.background = "white";
	card.style.fontFamily = "serif";
	card.style.display = "grid";
	card.style.gridTemplateColumns = "1fr 1fr 1fr";
	card.style.gridTemplateRows = "repeat(12, 1fr)";
	card.style.boxSizing = "border-box";

	const pipFontSize = height * 0.09;

	// Left column (4 pips spanning 3 rows each)
	[0, 3, 6, 9].forEach(row => {
		const pip = document.createElement("div");
		pip.textContent = suit;
		pip.style.gridColumn = "1";
		pip.style.gridRow = `${row + 1} / span 3`;
		pip.style.fontSize = `${pipFontSize}px`;
		pip.style.display = "flex";
		pip.style.alignItems = "center";
		pip.style.justifyContent = "center";
		card.appendChild(pip);
	});

	// Right column (4 pips spanning 3 rows each)
	[0, 3, 6, 9].forEach(row => {
		const pip = document.createElement("div");
		pip.textContent = suit;
		pip.style.gridColumn = "3";
		pip.style.gridRow = `${row + 1} / span 3`;
		pip.style.fontSize = `${pipFontSize}px`;
		pip.style.display = "flex";
		pip.style.alignItems = "center";
		pip.style.justifyContent = "center";
		card.appendChild(pip);
	});

	// Center column (2 pips spanning 4 rows each, centered vertically)
	[2, 6].forEach(row => {
		const pip = document.createElement("div");
		pip.textContent = suit;
		pip.style.gridColumn = "2";
		pip.style.gridRow = `${row + 1} / span 4`;
		pip.style.fontSize = `${pipFontSize}px`;
		pip.style.display = "flex";
		pip.style.alignItems = "center";
		pip.style.justifyContent = "center";
		card.appendChild(pip);
	});

	// Top-left corner: rank and suit
	const top = document.createElement("div");
	top.innerHTML = `<div>${rank}</div><div style="text-align:center">${suit}</div>`;
	top.style.position = "absolute";
	top.style.left = "6px";
	top.style.top = "4px";
	top.style.fontSize = Math.floor(height * 0.08) + "px";
	card.appendChild(top);

	// Bottom-right corner: rotated rank and suit
	const bottom = top.cloneNode(true);
	bottom.style.left = "";
	bottom.style.right = "6px";
	bottom.style.top = "";
	bottom.style.bottom = "4px";
	bottom.style.transform = "rotate(180deg)";
	bottom.style.textAlign = "center";
	card.appendChild(bottom);

	return card;
}
function createCard343(rank = "10", suit = "♣", width = 240, height = 336) {
	const card = document.createElement("div");
	card.style.position = "relative";
	card.style.width = width + "px";
	card.style.height = height + "px";
	card.style.border = "1px solid black";
	card.style.borderRadius = "12px";
	card.style.background = "white";
	card.style.fontFamily = "serif";
	card.style.display = "grid";
	card.style.gridTemplateColumns = "1fr 1fr 1fr";
	card.style.gridTemplateRows = "repeat(12, 1fr)";
	card.style.boxSizing = "border-box";

	const pipFontSize = height * 0.09;

	// Utility to create and place a pip
	function placePip(col, row, span) {
		const pip = document.createElement("div");
		pip.textContent = suit;
		pip.style.gridColumn = col;
		pip.style.gridRow = `${row} / span ${span}`;
		pip.style.fontSize = `${pipFontSize}px`;
		pip.style.display = "flex";
		pip.style.alignItems = "center";
		pip.style.justifyContent = "center";
		card.appendChild(pip);
	}

	// Left column: 3 pips (each spans 3 rows), centered in 12 rows
	[1, 5, 9].forEach(r => placePip(1, r, 3));

	// Center column: 4 pips (each spans 2 rows), evenly spaced
	[1, 4, 7, 10].forEach(r => placePip(2, r, 2));

	// Right column: 3 pips (each spans 3 rows), same as left
	[1, 5, 9].forEach(r => placePip(3, r, 3));

	// Top-left corner: rank and suit
	const top = document.createElement("div");
	top.innerHTML = `<div>${rank}</div><div style="text-align:center">${suit}</div>`;
	top.style.position = "absolute";
	top.style.left = "6px";
	top.style.top = "4px";
	top.style.fontSize = Math.floor(height * 0.08) + "px";
	card.appendChild(top);

	// Bottom-right corner: rotated rank and suit
	const bottom = top.cloneNode(true);
	bottom.style.left = "";
	bottom.style.right = "6px";
	bottom.style.top = "";
	bottom.style.bottom = "4px";
	bottom.style.transform = "rotate(180deg)";
	bottom.style.textAlign = "center";
	card.appendChild(bottom);

	return card;
}


function showCollection(dParent, callback, styles = {}) {
	// {	container,	imageUrlCallback,   // function(index) => url	imageWidth = 300,	imageHeight = 200,	bufferPages = 1,	imagesPerRow = 3}) {
	let imageHeight = valf(styles.h, 100);
	let imageWidth = valf(styles.w, imageHeight);
	let bufferPages = 1;
	let wParent = mGetStyle(dParent, 'w'); console.log('parent width', dParent.clientWidth);
	let imagesPerRow = Math.floor(wParent / imageWidth); console.log(imagesPerRow); //10;
	let page = 0;
	let isLoading = false;
	const imagesPerPage = imagesPerRow * Math.ceil(window.innerHeight / imageHeight);

	function loadImages() {
		if (isLoading) return;
		isLoading = true;

		const fragment = document.createDocumentFragment();
		for (let i = 0; i < imagesPerPage * (1 + bufferPages); i++) {
			const index = page * imagesPerPage + i;
			const img = document.createElement("img");
			img.src = callback(index);
			img.loading = "lazy";
			img.className = "lazy-img";
			img.width = imageWidth;
			img.height = imageHeight;
			fragment.appendChild(img);
		}
		dParent.insertBefore(fragment, sentinel);
		page++;
		isLoading = false;
	}

	// Sentinel element to observe scrolling near bottom
	const sentinel = document.createElement("div");
	sentinel.style.height = "1px";
	dParent.appendChild(sentinel);

	const observer = new IntersectionObserver((entries) => {
		if (entries[0].isIntersecting) {
			loadImages();
		}
	}, {
		rootMargin: "200px"
	});

	observer.observe(sentinel);

	// Initial load
	loadImages();
}


function createLazyImageLoader({
	container,
	imageUrlCallback,   // function(index) => url
	imageWidth = 300,
	imageHeight = 200,
	bufferPages = 1,
	imagesPerRow = 3
}) {
	let page = 0;
	let isLoading = false;
	const imagesPerPage = imagesPerRow * Math.ceil(window.innerHeight / imageHeight);

	function loadImages() {
		if (isLoading) return;
		isLoading = true;

		const fragment = document.createDocumentFragment();
		for (let i = 0; i < imagesPerPage * (1 + bufferPages); i++) {
			const index = page * imagesPerPage + i;
			const img = document.createElement("img");
			img.src = imageUrlCallback(index);
			img.loading = "lazy";
			img.className = "lazy-img";
			img.width = imageWidth;
			img.height = imageHeight;
			fragment.appendChild(img);
		}
		container.insertBefore(fragment, sentinel);
		page++;
		isLoading = false;
	}

	// Sentinel element to observe scrolling near bottom
	const sentinel = document.createElement("div");
	sentinel.style.height = "1px";
	container.appendChild(sentinel);

	const observer = new IntersectionObserver((entries) => {
		if (entries[0].isIntersecting) {
			loadImages();
		}
	}, {
		rootMargin: "200px"
	});

	observer.observe(sentinel);

	// Initial load
	loadImages();
}

function _showCollection(key) {
	const imageContainer = document.getElementById("image-container");
	const imagesPerPage = 20; // Adjust depending on image size/layout
	let page = 0;
	let isLoading = false;

	function loadImages(pageNum) {
		if (isLoading) return;
		isLoading = true;

		// Simulated image URLs (replace with real source or API call)
		const urls = Array.from({ length: imagesPerPage }, (_, i) =>
			`https://picsum.photos/300/200?random=${pageNum * imagesPerPage + i}`
		);

		urls.forEach(url => {
			const img = document.createElement("img");
			img.src = url;
			img.loading = "lazy";
			img.style = "margin: 4px; width: 300px; height: 200px;";
			imageContainer.appendChild(img);
		});

		isLoading = false;
	}

	// Set up observer for triggering load when nearing bottom
	const sentinel = document.createElement("div");
	sentinel.id = "sentinel";
	imageContainer.appendChild(sentinel);

	const observer = new IntersectionObserver(entries => {
		if (entries[0].isIntersecting && !isLoading) {
			page++;
			loadImages(page);
		}
	}, {
		rootMargin: "100px" // Start loading slightly before reaching the bottom
	});

	observer.observe(sentinel);

	// Initial load: just enough to fill viewport + one more page
	function preloadInitial() {
		const viewportHeight = window.innerHeight;
		let imagesLoaded = 0;

		const tempImg = document.createElement("img");
		tempImg.src = "https://picsum.photos/300/200";
		tempImg.style.display = "none";
		document.body.appendChild(tempImg);

		tempImg.onload = () => {
			const imgHeight = tempImg.naturalHeight;
			const imagesPerViewport = Math.ceil(viewportHeight / imgHeight) * 2;

			for (let i = 0; i < imagesPerViewport; i++) {
				const url = `https://picsum.photos/300/200?random=${i}`;
				const img = document.createElement("img");
				img.src = url;
				img.loading = "lazy";
				img.style = "margin: 4px; width: 300px; height: 200px;";
				imageContainer.insertBefore(img, sentinel);
			}

			document.body.removeChild(tempImg);
		};
	}

	preloadInitial();
}


async function showCollection(key, d, styles = {}, opts = {}) {
	mClear(d);
	mClass(d, 'symbolContainer');
	mDom(d, { className: 'symbol' }, { html: '<div class="symbol">&#x2718;</div>' });
	mStyle(document.body, { className: 'symbolContainer' })

	for (const k of M.byCollection[key]) {
		let sym = M.superdi[k];
		let d1 = mDom(d, { margin: 10 });
		//mDom(d1,{},{tag:'pre',html:sym.text});
		mDom(d1, { className: 'symbol' }, { html: `<div class="symbol">${sym.text}</div>` }); //sym.text
		let dimg = await mKey(k, d1, styles, opts);
		let dlabel = mDom(d1, { align: 'center', fz: 12, bg: 'yellow', fg: 'black' }, { html: k });
	}
}

//#region generateSvgWithImage
// --- Example Usage (assuming you have an HTML element with id="svgContainer") ---
// You would call this function and inject the returned SVG string into your HTML.

/*
// Example: Generate SVG for a hypothetical image and display it
const myImageFilename = 'images/my_card_figure.png'; // Replace with your actual image path/URL
const svgContainer = document.getElementById('svgContainer'); // Replace with the ID of your container element

if (svgContainer) {
	const generatedSvg = generateSvgWithImage(myImageFilename, 150, 200); // Generate SVG with specific dimensions
	svgContainer.innerHTML = generatedSvg; // Inject the generated SVG into the HTML
} else {
	console.warn("HTML element with id 'svgContainer' not found. Cannot display example SVG.");
}
*/

// --- Example of how you might use this in your card display logic ---
/*
// Inside your displayCard function, when you determine the card requires an image:
const cardKey = rankKey + suitKey; // e.g., 'KH'
const imagePath = getImageForCard(cardKey); // You would need a function like this

if (imagePath) {
	const cardSVG = generateSvgWithImage(imagePath, 100, 140); // Adjust dimensions as needed
	// Then inject cardSVG into your card container HTML structure
	cardContainer.innerHTML = `
			<div class="card-corner ${textColorClass}">
					<span>${rank}</span>
					<span>${suit}</span>
			</div>
			<div class="card-figure">
					${cardSVG}
			</div>
			<div class="card-corner ${textColorClass} transform rotate-180">
					<span>${rank}</span>
					<span>${suit}</span>
			</div>
	`;
} else {
	// Fallback to text or handle cards without images
}

// You would need a function like this to map card keys to image paths
function getImageForCard(cardKey) {
	const imageMap = {
			'KH': 'images/king_of_hearts.png',
			'QS': 'images/queen_of_spades.png',
			// ... add paths for all your face card images
	};
	return imageMap[cardKey] || null; // Return image path or null if not found
}
*/

//#endregion


function replaceFillRedWithParam(svgString, color) {
	return svgString.replace(/fill=['"]red['"]/g, `fill='${color}'`);
}
function replaceStrokeRedWithParam(svgString, color) {
	return svgString.replace(/stroke=['"]red['"]/g, `stroke='${color}'`);
}
function replaceFillBlackWithParam(svgString, color) {
	return svgString.replace(/fill=['"]black['"]/g, `fill='${color}'`);
}
function replaceStrokeBlackWithParam(svgString, color) {
	return svgString.replace(/stroke=['"]black['"]/g, `stroke='${color}'`);
}
function replaceColorsInCard(s, by) {
	let snew = replaceFillRedWithParam(s, by);
	snew = replaceStrokeRedWithParam(snew, by);
	snew = replaceFillBlackWithParam(snew, by);
	snew = replaceStrokeBlackWithParam(snew, by);
	return snew;

}
function renderCard(key, color, border) {
	let svg = __cardSvgs[key];
	let [r, s] = key;
	if ('0123456789TA'.includes(r)) {
		let beforeRect = stringBeforeLast(svg, '<rect');
		let afterRect = stringAfterLast(svg, '/rect>');
		let between = stringBetween(svg, beforeRect, afterRect); console.log('between', between)
		svg = replaceColorsInCard(beforeRect, color) + replaceColorsInCard(between, border) + replaceColorsInCard(afterRect, color);

	} else {

	}
	return svg;
}
function renderCard(cardKey, targetDiv) {
	if (!targetDiv || !(targetDiv instanceof HTMLElement)) {
		throw new Error("Invalid target element.");
	}

	const svgHtml = getCardSvg(cardKey);
	targetDiv.innerHTML = svgHtml;
}

async function mToggleButton(dParent, styles = {}) {
	addKeys({ display: 'flex', wrap: 'wrap', aitems: 'center' }, styles)
	let d1 = mDom(dParent, styles);
	let list = Array.from(arguments).slice(2);
	let buttons = [];
	let style = { hpadding: 4, display: 'flex', 'flex-wrap': 'nowrap', 'align-items': 'center', cursor: 'pointer' };
	for (const l of list) {
		let b = mDom(d1, style, { onclick: l.onclick });
		mDom(b, { maright: 6 }, { html: l.label });
		if (l.key) await mKey(l.key, b, { h: styles.h, fz: styles.h }); //:fz:valf(styles.h,50) });
		buttons.push(b);
	}
	return mToggleCompose(...buttons);
}
async function mToggleButton(dParent, styles = {}) {
	addKeys({ display: 'flex', wrap: 'wrap', aitems: 'center' }, styles)
	let d1 = mDom(dParent, styles);
	let list = Array.from(arguments).slice(2);
	let buttons = [];
	let style = { display: 'flex', 'flex-wrap': 'nowrap', aitems: 'center', cursor: 'pointer' };

	let words = list.map(x => x.label);
	let w = getMaxWordWidth(words, d1) + styles.h * 1.25 + 2; console.log(w);
	mStyle(d1, { w });

	for (const l of list) {

		let b = mDom(d1, style, { onclick: l.onclick });
		mDom(b, { maright: 6 }, { html: l.label });
		await mKey(l.key, b, { h: styles.h, w: styles.h, fz: styles.h }); //:fz:valf(styles.h,50) });

		// let dAuto = mDom(d1,{ cursor: 'pointer'}, { onclick: uiAuto });	
		// mDom(dAuto, {}, { html: 'uiState:' });
		// await mKey('display', dAuto,{sz:24});

		buttons.push(b);

	}

	return mToggleCompose(...buttons);

}

function _mFlex(d, or = 'h') {
	d = toElem(d);
	d.style.display = 'flex';
	d.style.flexFlow = (or == 'v' ? 'column' : 'row') + ' ' + (or == 'w' ? 'wrap' : 'nowrap');
}
function _mFlexBaseline(d) { mStyle(d, { display: 'flex', 'align-items': 'baseline' }); }
function _mFlexLR(d) { mStyle(d, { display: 'flex', 'justify-content': 'space-between', 'align-items': 'center' }); }
function _mFlexLine(d, startEndCenter = 'center') { mStyle(d, { display: 'flex', 'justify-content': startEndCenter, 'align-items': 'center' }); }
function _mFlexSpacebetween(d) { mFlexLR(d); }
function _mFlexV(d) { mStyle(d, { display: 'flex', 'align-items': 'center' }); }
function _mFlexVWrap(d) { mStyle(d, { display: 'flex', 'align-items': 'center', 'flex-flow': 'row wrap' }); }
function _mFlexWrap(d) { mFlex(d, 'w'); }
async function showStateButtons(d) {
	//uiState manual or auto
	let d1 = mDom(d, { maleft: 10, bg: 'black', fg: 'white', hpadding: 4, h: 24, w: 84 }); mFlexV(d1);




	mDom(d1, {}, { html: 'uiState:' });
	let bManual = DA.bManual = await mKey('hand', d1, { h: 24, w: 24, cursor: 'pointer', round: true }, { id: 'bManual', onclick: uiAuto });
	let bAuto = DA.bAuto = await mKey('robot', d1, { h: 24, w: 24, cursor: 'pointer', round: true }, { id: 'bAuto', onclick: uiManual });
	DA.dControlUiState = mToggleButton(bAuto, bManual);

	// let bPoll = DA.bPoll = await mKey('circle_right', d, { fz:24,cursor: 'pointer', round: true, fg: 'green' }, { onclick: pollResume });
	// let bStop = DA.bStop = await mKey('circle_stop', d, { fz:24,cursor: 'pointer', round: true, fg: 'red' }, { onclick: pollStop });
	// dController = mToggleButton(bPoll, bStop);

}
async function test0_game1() {
	DA.gamelist = ['setgame', 'button96']; //'accuse aristo bluff ferro fishgame fritz huti lacuna nations setgame sheriff spotit wise'; if (DA.TEST0) gamelist += ' a_game'; gamelist = toWords(gamelist);
	DA.funcs = { setgame: setgame(), button96: button96() }; //implemented games!
	for (const gname in DA.gamelist) {
		if (isdef(DA.funcs[gname])) continue;
		DA.funcs[gname] = defaultGameFunc();
	}

	await loadAssetsStatic();
	await loadTables();

	let elems = mLayoutTM('dPage'); mStyle('dMain', { overy: 'auto' }); mCenterFlex('dMain');

	mLayoutTopTestExtraMessageTitle('dTop'); mFlexV('dTop'); //mStyle('dTop', { hmin: 32 }); mStyle('dExtra', { hmin: 32 })

	let names = ['amanda', 'felix', 'lauren', 'mimi', 'gul'];
	let d = mBy('dTestRight'); mFlexV(d);
	for (const name of names) { let b = mDom(d, { className: 'button' }, { tag: 'button', html: name, onclick: async () => await switchToUser(name) }); }

	//await mSleep(rNumber(0,2000));
	let username = rChoose(names); //['felix','lauren','diana','mimi','amanda','guest','gul']); //localStorage.getItem('username') ?? 'hans'; 
	//if (username == 'felix') username = 'mimi'; else { username = 'felix';}
	await switchToUser(username);

	d = mBy('dTestLeft'); mFlexV(d);
	// mDom(d, { className: 'button', bg: 'green' }, { tag: 'button', html: 'POLL', onclick: pollResume });
	// mDom(d, { className: 'button', bg: 'red' }, { tag: 'button', html: 'STOP', onclick: pollStop });
	let bPoll = await mKey('circle_right', d, { fz: 24, cursor: 'pointer', round: true, fg: 'green' }, { onclick: pollResume });
	let bStop = await mKey('circle_stop', d, { fz: 24, cursor: 'pointer', round: true, fg: 'red' }, { onclick: pollStop });
	// let bExpand = await mKey('circle_chevron_down', dParent, styles, { tag: 'button', onclick: expandAll });
	// let bCollapse = await mKey('circle_chevron_up', dParent, styles, { tag: 'button', onclick: collapseAll });
	dController = mToggleButton(bPoll, bStop);
	mDom(d, { className: 'button', maleft: 10 }, { tag: 'button', html: 'delete', onclick: async () => await tablesDeleteAll() });

	//await showGamesAndTables();
	//pollChangeState('lobby');


}
async function tableCreate(gamename, players, options) {
	if (nundef(gamename)) gamename = "setgame";
	if (nundef(players)) players = { mimi: userToPlayer('mimi', gamename), felix: userToPlayer('felix', gamename), amanda: userToPlayer('amanda', gamename) };
	if (nundef(options)) options = MGetGameOptions(gamename);
	console.log('tableCreate', gamename, players, options);
	let me = UGetName();
	let playerNames = [me]; console.log('me', me)
	assertion(me in players, "_createOpenTable without owner!!!!!")
	for (const name in players) { addIf(playerNames, name); }
	let table = {
		status: 'open',
		id: generateTableId(),
		fen: null,
		game: gamename,
		owner: playerNames[0],
		friendly: generateTableName(playerNames.length, []), //MGetTableNames()),
		players,
		playerNames: playerNames,
		options
	};
	let tid = table.id;
	let tData = table;
	let res = await mPhpPost('mox0', { action: 'create', tid, tData });
	if (res.tid) {
		console.log("Game Creation:", res.tid);
		let data = M.tables[tid] = await tableGetDefault(res.tid); console.log(data);
		M.tableFilenames.push(tid);
		DA.tid = tid; DA.tData = tData;
	} else {
		console.log("Game Creation failed");
		return null;
	}
	return table;
}

async function showTable(id) {
	let me = UGetName();
	DA.pollFunc = 'showTable';
	let tid = valf(id, DA.tid);
	if (nundef(tid)) tid = valf(localStorage.getItem('tid'), arrLast(Object.keys(M.tables)));
	if (nundef(tid)) { return await showTables(); }
	DA.tid = tid;
	let tData = await loadStaticYaml(`y/tables/${tid}.yaml`);
	if (!tData) { showMessage('table deleted!'); return await showTables(); }
	let changes = deepCompare(M.tables[tid], tData);
	if (!changes) { return console.log('no changes', changes, tid); }
	console.log('changes', changes);
	M.tables[tid] = DA.tData = tData;
	let func = DA.funcs[tData.game];
	T = tData;
	clearMain();
	mClassRemove('dExtra', 'p10hide');
	showTitleGame(tData);
	if (func.hasInstruction) prepInstruction(tData);
	func.prepLayout(tData);
	let items = [];
	await func.stats(tData);
	if (tData.status == 'over') { showGameover(tData, 'dTitle'); return; }
	assertion(tData.status == 'started', `showTable status ERROR ${tData.status}`);
	func.activate(tData, items);
}

async function onsockConfig(x) {
	console.log('SOCK::config', x)
	Serverdata.config = x; console.log(Serverdata.config);
}
async function onsockEvent(x) {
	console.log('SOCK::event', x)
	if (isdef(Serverdata.events)) Serverdata.events[x.id] = x;
}
async function onsockMerged(x) {
	console.log('SOCK::merged', x)
	if (!isSameTableOpen(x.id)) return;
	await showTable(x);
}
async function onsockPending(id) {
	console.log('SOCK::pending', id)
	if (!isSameTableOpen(id)) return;
	await showTable(id);
}
async function onsockSuperdi(x) {
	console.log('SOCK::superdi', x)
}
async function onsockTable(x) {
	console.log('SOCK::table', x);
	let [msg, id, turn, isNew] = [x.msg, x.id, x.turn, x.isNew];
	let menu = getMenu();
	let me = UGetName();
	console.log('menu', menu, 'me', me, 'turn', turn, 'isNew', isNew)
	if (turn.includes(me) && menu == 'play') { Tid = id; await switchToMainMenu('table'); }
	else if (isNew && menu == 'play') { Tid = id; await switchToMainMenu('table'); }
	else if (menu == 'table') await showTable(id);
	else if (menu == 'play') await showGamesAndTables();
}
async function onsockTables(x) {
	console.log('SOCK::tables', x)
	let menu = getMenu();
	if (menu == 'play') await showTables('onsockTables');
	else if (menu == 'table') {
		assertion(isdef(T), "menu table but no table!!!")
		let id = T.id;
		let exists = x.find(t => t.id == id);
		if (nundef(exists)) { Tid = T = null; await switchToMenu(UI.nav, 'play'); }
	}
}
function sockInit(port = '3000') {
	let type = detectSessionType();
	let server = type == 'live' ? `http://localhost:${port}` : type == 'fastcomet' ? `https://moxito.online:${port}` : null;//getServer(); //getServerurl();
	console.log('::sockInit:', type, server); return;
	if (!server) { console.log('::sockInit: NO SOCKETS!!!', type, server); return; }

	Socket = io(server);
	Socket.on('disconnect', x => console.log('::io disconnect:', x));
	Socket.on('connection', x => console.log('::io connect:', x));
	// Socket.on('config', onsockConfig);
	// Socket.on('event', onsockEvent);
	Socket.on('message', o => console.log('message', o)); //showChatMessage);
	// Socket.on('merged', onsockMerged);
	// Socket.on('pending', onsockPending);
	// Socket.on('table', onsockTable);
	// Socket.on('tables', onsockTables);
	// Socket.on('superdi', onsockSuperdi);
}
function sockPostUserChange(oldname, newname) {
	Socket.emit('userChange', { oldname, newname });
}
async function mPhpGetFiles(dir, projectName = 'ilms', verbose = false, jsonResult = true) {
	let server = getServer();
	if (verbose) console.log('to php:', server + `${projectName}/php/mox0.php`, dir);
	let res = await fetch(server + `${projectName}/php/list_files.php?dir=${encodeURIComponent(dir)}`,
		{
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
		}
	);
	let text;
	try {
		text = await res.text();
		if (!jsonResult) {
			return text;
		}
		let obj = JSON.parse(text);
		if (verbose) console.log('from php:\n', obj);
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
