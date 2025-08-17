
function paletteTransFromTo(cfrom,cto,n = 9) {
  let c = cfrom;
  let pal = [c];
  let [iw, ib] = [Math.floor(n / 2), Math.floor((n - 1) / 2)];
  let [incw, incb] = [1 / (iw + 1), 1 / (ib + 1)];
  for (let i = 1; i < iw; i++) {
    let alpha = 1 - i * incw;
    pal.push(colorTrans(c, alpha));
  }
  pal.push('transparent');
  c = cto;
  for (let i = 1; i < ib; i++) {
    let alpha = i * incb;
    pal.push(colorTrans(c, alpha));
  }
  pal.push(c);
  return pal;
}
function mShadeHue(bg, towards, names, offset = 1, contrast = 1) {

  let palette = paletteTransFromTo(bg,towards,names.length * contrast + 2 * offset).slice(offset);
	//console.log('palette', palette);
  //console.log('shading',names);
  for (const name of names) {
    let d = toElem(name);
    mStyle(d, { bg: palette.shift(), fg: 'contrast', box: true });
  }
}
function setColors(item) {
  let bg = item.color;
  let hue = colorGetHue(bg);
  //console.log('hue', hue);
  if (hue>=20 && hue <=80){
    //in this case dont use black for the background, turn it to red instead
		let hueGoal = 0;
		let bgGoal = '#ff3333'; //darkenColor(colorFromHue(hueGoal),50);
		//bg='orange';
		mShadeHue('white', 'red', DA.divShaded, 2, 1);
	}
  let fg = item.fg ?? colorIdealText(bg);
  mStyle('dPage', { bg, fg });
}



function calcCardSize(rows, cols, wmax, hmax, wbyhRatio = 2) {
	if (nundef(hmax)) hmax = window.innerHeight;
	if (nundef(wmax)) wmax = window.innerWidth;
	var h1 = Math.floor(hmax / rows);
	var w1 = Math.floor(wbyhRatio * h1);
	var w2 = Math.floor(wmax / cols);
	let hbywRatio = 1 / wbyhRatio;
	var h2 = Math.floor(hbywRatio * w2);
	//maintain correct ratio, take smaller of the two
	var h = Math.min(h1, h2);
	var w = Math.min(w1, w2);
	return { w, h };
}
function injectStripedPattern(color) {
	const patternId = `striped-${color.replace('#', '')}`;
	if (document.getElementById(patternId)) return patternId;

	const svgNS = "http://www.w3.org/2000/svg";
	const svg = document.getElementById('svgDefsGlobal');

	const defs = svg.querySelector('defs') || (() => {
		const d = document.createElementNS(svgNS, 'defs');
		svg.appendChild(d);
		return d;
	})();

	const pattern = document.createElementNS(svgNS, 'pattern');

	applyOpts(pattern, { id: patternId, patternUnits: 'userSpaceOnUse', width: 4, height: 4, patternTransform: 'rotate(45)' });
	pattern.innerHTML = `<path d="M-1,1 H5" style="stroke:${color}; stroke-width:1" />`;
	defs.appendChild(pattern);
	return patternId;
}
function showTable() {
	if (!DA.tid) { showMessage('No table available!!!', 4000, () => switchToMenu('games')); return; }
	if (!TESTING) pollOn();

	//console.log('old table', DA.oldTable);


	let t = DAGetTable();
	G = DA.funcs[t.game];

	G.prepareTable(t);
	G.stats(t);
	G.present(t);
	//G.present(t);
	// if (DA.oldTable) {
	// 	let d2=mDom('dTable',{h:200,w:600});
	// 	G.prepareCards(DA.oldTable.fen, d2,['red','green','purple']);

	// 	//G.present(DA.oldTable);console.log(t.lastMove);
	// }
	if (t.status == 'over') { showGameover(t); } else if (t.status == 'started') { G.activate(); }
}
function MGetUserImageKey(username) {
	let u = MGetUser(username);
	let key = u.imgKey;
	let m = M.superdi[key];
	if (nundef(m)) {
		key = 'unknown_user';
		m = M.superdi[key];
	}
	return m;

}
async function switchToUser(username) {
	if (!isEmpty(username)) username = normalizeString(username);
	if (isEmpty(username)) username = localStorage.getItem('username') || 'guest';
	let userdata = lookup(M.users, username);
	if (!userdata) {
		let imgKey = isdef(M.superdi[username]) ? username : 'unknown_user';
		let color = rColor();
		let name = username;
		userdata = { name, color, imgKey };
	}
	let res = await mPhpPost('all', { username, action: 'login', data: userdata });
	U = MGetUser(username);
	DA.tid = localStorage.getItem('tid');

	initUI();
	return;

	mClear('dTopRight');
	let d = mDom('dTopRight'); //41px button:33px
	mClear(d);
	let sz = 26;
	let m = MGetUserImageKey(username);
	let bg = U.color;
	let fg = colorIdealText(bg);
	let d1 = mDom(d, { bg, fg, display: 'flex', pah: 12, rounding: 5, alignItems: 'center', gap: 10, margin: 0 });
	let img = mDom(d1, { padding: 0, margin: 0, bg: 'beige', h: sz, w: sz, round: true, border: `${bg} 3px solid` }, { tag: 'img', src: m.img });
	let text = mDom(d1, { bg, fg, display: 'inline', }, { html: username });
	mDom(d, { maright: 10 }, { tag: 'button', html: '...', onclick: onclickMoreUsers });

	let flexStyle = { display: 'flex', 'flex-direction': 'row', alignItems: 'center', gap: 10, wrap: 'nowrap' };
	mStyle(d, flexStyle);
	//let h = getRectInt('dTopRight').h; console.log('h', h);
	localStorage.setItem('username', username);
	setTheme(U);
	updateUI();
	return;
}

function setgame(table, items) {
	let _table = table;
	let _oldFen = null;
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
		fen.deck = setCreateDeck(table.options.deck_size); //console.log('deck', fen.deck);
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
		//let d1 = mDom(d, flexCenterTop(), { id: 'dInstruction' });
		let d2 = mDom(d, flexCenterCenter(), { id: 'dStats' });
		let d3 = mDom(d, flexCenterCenter(), { id: 'dTable' });
		// [d2,d3].forEach(d => mStyle(d, { mabottom:10 }));

		showTitleGame(table, d0);

		// mStyle(d0, { bg: 'blue' }, { html: 'Title' }); mLinebreak(d2);
		// mStyle(d1, { bg: 'yellow' }, { html: 'Instructions' }); mLinebreak(d2);
		// mStyle(d2, { bg: 'orange' }, { html: 'Stats' }); mLinebreak(d2);
		// mStyle(d3, { bg: 'red' }, { html: 'Table' }); mLinebreak(d3);
		//console.log(d)
	}
	function stats(table) {
		_table = table;
		setStats(table);
		return;
		let [me, players] = [UGetName(), table.players];
		let style = { patop: 8, mabottom: 12, bg: 'beige', fg: 'contrast' };
		let player_stat_items = uiTypePlayerStats(table, me, 'dStats', 'rowflex', style);
		for (const plname in players) {
			let pl = players[plname];
			let item = player_stat_items[plname];
			if (pl.playmode == 'bot') { mStyle(item.img, { rounding: 0 }); }
			let d = iDiv(item);
			mLinebreak(d);
			mStyle(d, { wmax: 100, w: 90, box: true });
			playerStatCount('star', pl.score, d);
		}
	}
	function present(table) {
		_table = table;
		//console.log('table size',getRectInt('dTable'),getRectInt(mBy('dTable').parentNode));
		let dParent = mDom('dTable', { w100: true, h100: true });
		let fen = table.fen;

		// fen.cols = rChoose(range(3, 8));
		// fen.cards = deckDeal(fen.deck, fen.cols*rChoose(range(3, 15)));

		let rows = fen.rows = Math.ceil(fen.cards.length / fen.cols);
		// let d1 = mDom(dParent, { padding: 12 }, { className: 'flexRCbox', id: 'dTableButtons' });
		// let d2 = mDom(dParent, { padding: 20 }, { className: 'flexRCbox', id: 'dTableCards' });
		let d1 = mDom(dParent, { padding: 12 }, { id: 'dTableButtons' });
		let d2 = mDom(dParent, { padding: 20 }, { id: 'dTableCards' });

		let rect = getRectInt(d2); //console.log('d2', rect);
		let gap = 10;
		let maxHeight = window.innerHeight - rect.y - 40 - (rows - 1) * gap;
		let sz = calcCardSize(rows + 1, fen.cols, rect.w, maxHeight, 2);
		//console.log('card size', sz, 'rows', rows, 'cols', fen.cols, 'wmax', rect.w, 'hmax', maxHeight);
		let dBoard = mGrid(rows, fen.cols, d2, { gap });
		let items = [];
		for (const c of fen.cards) {
			let dc = setDrawCard(c, dBoard, sz.h);
			let item = mItem({ div: dc }, { key: c });
			items.push(item);
		}
		//let oset = setFindOneSet(items); //console.log('=>', oset ? oset.keys[0] : 'NO SET');
		_items = items;

		//present in small the previous cards and the previous set highlighted (or somehow signal that there was a set)
		if (isdef(table.oldFen)) {
			console.log('table.oldFen.prevCards', table.oldFen);
			let dPrev = mDom(dParent, { display: 'flex', flexDirection: 'row', gap: 10, padding: 10, alignItems: 'center' }, { id: 'dPreviousSet' });
			let dPrevBoard = mGrid(rows, fen.cols, dPrev, { gap });
			//let prevItems = [];
			let keys = table.oldFen.move.split(',').map(i => i.trim()); console.log('prev keys', keys);
			for (const c of table.oldFen.cards) {
				let dc = setDrawCard(c, dPrevBoard, sz.h / 4);//console.log('prev card', c,dc);
				if (keys.includes(c)) {
					mClass(dc, 'framedPicture');
				}
				// let key = dc.getAttribute('key');
				// assertion(c == key, `setPresent ERROR: card ${c} does not match key ${key}`);
				//prevItems.push(dc);
			}
			assertion(isdef(table.oldFen.move), 'table.lastMove is undefined');
			//for(const c of toWords()) {
			//find 
			console.log('last move', table.oldFen.move, keys);

		} else {
			console.log('no previous cards in table.fen.prevCards');
		}

		return items;
	}
	function activate() {
		let items = _items;
		let table = _table; //console.log('activate', table, items);
		if (!isMyTurn(table)) { return; } else animatedTitle();
		for (const item of items) {
			let d = iDiv(item);
			mStyle(d, { cursor: 'pointer' });
			d.onclick = ev => onclickCard(table, item, items);
		}
		let d1 = mBy('dTableButtons');
		mClass(d1, 'button_container');
		mStyle(d1, { padding: '16px 164px', justifyContent: 'space-between' })
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
		//assertion(false, 'botMove not implemented!');
		let oset = setFindOneSet(items);
		let ms = rChoose(range(5000, 10000, 500));
		if (!oset) ms += 2000;
		TO.bot = setTimeout(async () => {
			//first unselect items if any is selected
			let selitems = items.filter(x => x.isSelected);
			for (const item of selitems) toggleItemSelection(item);
			if (!oset) await onclickNoSet(name, table, items);
			else {
				if (name == UGetName()) for (const item of oset.items) toggleItemSelection(item);
				TO.bot1 = setTimeout(async () => await evalMove(name, table, oset.keys), 1000);
			}
		}, rNumber(ms, ms + 2000));
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
	function copyTable(table) {
		let newTable = jsCopy(table);
		_oldFen = newTable.oldFen = jsCopy(table.fen);
		return newTable;
	}
	async function onclickNoSet() {
		let name = getUname();
		let table = _table;
		let items = _items;
		let success = !setFindOneSet(items);
		let newTable = copyTable(table);
		if (success) {
			let fen = newTable.fen;
			//console.log('deck', fen.deck, 'cards', fen.cards);
			let newCards = deckDeal(fen.deck, 1);
			if (!isEmpty(newCards)) fen.cards.push(newCards[0]); else return await gameoverScore(name, newTable, 1);
		}
		await setSendMove(name, newTable, success, 'No Set');
	}
	async function evalMove(name, table, keys) {
		let success = setCheckIfSet(keys);
		let newTable = copyTable(table);
		if (success) {
			let fen = newTable.fen;
			let toomany = Math.max(0, fen.cards.length - fen.numCards);
			let need = Math.max(0, 3 - toomany);
			//console.log('deck', fen.deck, 'cards', fen.cards, toomany, need);
			let newCards = deckDeal(fen.deck, need);
			for (let i = 0; i < 3; i++) if (i < newCards.length) arrReplace1(fen.cards, keys[i], newCards[i]); else removeInPlace(fen.cards, keys[i]);
			//if (need > 0 && isEmpty(newCards)) return await gameoverScore(name, newTable, 1);
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

		if (success) {
			newTable.step += 1;
			newTable.players[name].score += change;
			newTable.oldFen.move = lastMove;
		}
		let res = await tableSaveRace(newTable, { step, name, change, prop: 'score', success, lastMove });
		console.log(res.table.step, res.table.players[name].score, res.message);
		assertion(isList(res.table.fen.deck), `tableSaveRace ERROR: ${res.table.fen}`);
	}

	return {
		setup, prepareTable, stats, present, activate,
		get table() { return _table; },
		get items() { return _items; },
	};
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
function setDrawCard(card, dParent, hCard = 100) {
	const paths = {
		diamond: "M25 0 L50 50 L25 100 L0 50 Z",
		squiggle: "M38.4,63.4c2,16.1,11,19.9,10.6,28.3c1,9.2-21.1,12.2-33.4,3.8s-15.8-21.2-9.3-38c3.7-7.5,4.9-14,4.8-20 c0-16.1-11-19.9-10.6-28.3C1,0.1,21.6-3,33.9,5.5s15.8,21.2,9.3,38C40.4,50.6,38.5,57.4,38.4,63.4z",
		oval: "M25,95C14.2,95,5.5,85.2,5.5,80V20C5.5,13.2,14.2,5.2,25,5.2S44.5,13.2,44.5,20v60 C44.5,85.2,35.8,95,25,95z"
	}
	let [color, shape, num, patt] = card.split('_');
	let wCard = hCard / .65;
	let wSymbol = wCard / 4;
	let hSymbol = 2 * wSymbol;
	let d0 = mDom(dParent, { display: 'flex', w: wCard, h: hCard, bg: 'white', rounding: 10 });
	mStyle(d0, { justifyContent: 'center', 'align-items': 'center', gap: 6 })
	for (const i of range(num)) {
		const patternId = injectStripedPattern(color);
		let fill = patt == 'striped' ? `url(#striped-${color})` : patt == 'solid' ? color : 'none'
		let html = `
				<svg viewBox="-2 -2 54 105" xmlns="http://www.w3.org/2000/svg">
					<path d="${paths[shape]}"
								fill="${fill}"
								stroke="${color}"
								stroke-width="4"
					/>
				</svg>
			`;

		let d1 = mDom(d0, { h: hSymbol, w: wSymbol }, { html });
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
function setStats(table) {
	let [me, players] = [UGetName(), table.players];
	let d = mDom('dStats', {}, { className: 'flexCC' });
	for (const plname in players) {
		let pl = players[plname];
		let sz = 26;
		let m = MGetUserImageKey(plname);
		let bg = MGetUserColor(plname);
		let fg = colorIdealText(bg);
		let d1 = mDom(d, { padding: 2,  margin: 6, wmin: 60, rounding: 8, bg, fg, box: true, border: `beige 1px solid` }, {});
		console.log('playmode', pl.playmode);
		let img = mDom(d1, { padding: 0, matop:5, bg: 'beige', h: sz, w: sz, round:pl.playmode !== 'bot'}, { tag: 'img', src: m.img });
		mDom(d1, { fz: 12, hline: 12, matop: -4 }, { html: plname });
		mDom(d1, { fz: 18, hline: 18, matop: -4 }, { html: pl.score });
	}
}









