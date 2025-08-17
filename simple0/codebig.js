
async function DAInit(TESTING = false) {
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
	await loadAssetsStatic();
	M.tables = await MPollTables();
	let elems = mLayoutTM('dPage'); mStyle('dMain', { overy: 'auto', fg: 'inherit' }); mCenterFlex('dMain');
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
async function DASaveState(state) {
	if (isdef(state)) DA.gameState = state;
	let res = await fetch(`${DA.backendURL}/save_state.php`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(DA.gameState)
	});
	let data = await res.json();
	if (VERBOSE) if (VERBOSE) console.log('Game state saved:', data, DA.gameState);
	return data;
}
function MGet() { return lookup(M, [...arguments]); }
function MGetGame(gamename) { return M.config.games[gamename]; }
function MGetGameColor(gamename) { return MGetGame(gamename).color; }
function MGetGameFriendly(gamename) { return MGetGame(gamename).friendly; }
function MGetGameOptions(gamename) { return MGetGame(gamename).options; }
function MGetGamePlayerOptions(gamename) { return MGetGame(gamename).ploptions; }
function MGetGamePlayerOptionsAsDict(gamename) { return valf(MGetGamePlayerOptions(gamename), {}); }
function MGetGameProp(prop) { return MGetGame(T.game)[prop]; }
function MGetTables() { return M.tables; }
function MGetUser(uname) { return M.users[uname]; }
function MGetUserColor(uname) { return MGetUser(uname).color; }
function MGetUserOptionsForGame(name, gamename) { return lookup(M.users, [name, 'games', gamename]); }
async function MPollTables() {
	let files = await mGetFilenames('tables'); //if (VERBOSE) console.log('files', files);
	M.tableFilenames = files.map(x => x.split('.')[0]);
	M.tables = {};
	for (const f of M.tableFilenames) {
		let t = await loadStaticYaml(`y/tables/${f}.yaml`); //if (VERBOSE) console.log(t);
		M.tables[f] = t;
	}
	return M.tables;
}
function MTGetGameProp(prop) { return MGetGame(T.game)[prop]; }
function TGetGameOption(prop) { return lookup(T, ['options', prop]); }
function UGetName() { return U.name; }
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
function addIf(arr, el) { if (!arr.includes(el)) arr.push(el); }
function addKeys(ofrom, oto) { for (const k in ofrom) if (nundef(oto[k])) oto[k] = ofrom[k]; return oto; }
function aktivateUpDownIffSelected() {
	let b = toElem('dMoveUp'); console.log(b);
	if (isEmpty(DA.selectedPart)) { mClass('dMoveUp', 'disabled'); mClass('dMoveDown', 'disabled'); return; }
	mClassRemove('dMoveUp', 'disabled');
	mClassRemove('dMoveDown', 'disabled');
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
function animatedTitle(msg = 'DU BIST DRAN!!!!!') {
	TO.titleInterval = setInterval(() => {
		let corner = CORNERS[WhichCorner++ % CORNERS.length];
		document.title = `${corner} ${msg}`; //'⌞&amp;21543;    U+231E \0xE2Fo\u0027o Bar';
	}, 1000);
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
function arrChildren(elem) { return [...toElem(elem).children]; }
function arrClear(arr) { arr.length = 0; return arr; }
function arrCycle(arr, count) { return arrRotate(arr, count); }
function arrDisjoint(ad1, ad2, prop) {
	console.log(isDict(ad1), isDict(ad2))
	if (isDict(ad1) && isDict(ad2)) return Object.keys(ad1).find(x => x in ad2);
	else return ad1.map(x => x[prop]).find(el => ad2.map(x => x[prop]) == el);
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
function arrRotate(arr, count) {
	var unshift = Array.prototype.unshift,
		splice = Array.prototype.splice;
	var len = arr.length >>> 0, count = count >> 0;
	let arr1 = jsCopy(arr);
	unshift.apply(arr1, splice.call(arr1, count % len, len));
	return arr1;
}
function arrShuffle(arr) { if (isEmpty(arr)) return []; else return fisherYates(arr); }
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
			let d = iDiv(item); mCenterFlex(d); mLinebreak(d); mIfNotRelative(d);
			playerStatCount('star', pl.score, d); //, {}, {id:`stat_${plname}_score`});
		}
	}
	function present(table) {
		let fen = table.fen;
		mStyle('dTable', { padding: 25, w: 400, h: 400 });
		let d = mDom('dTable', { gap: 10, padding: 0 }); mCenterFlex(d);
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
function calculateSecondsDifference(timestamp1, timestamp2) {
	const differenceInMilliseconds = Math.abs(timestamp1 - timestamp2);
	const differenceInSeconds = Math.ceil(differenceInMilliseconds / 1000);
	return differenceInSeconds;
}
function capitalize(s) {
	if (typeof s !== 'string') return '';
	return s.charAt(0).toUpperCase() + s.slice(1);
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
function checkState() {
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
function clearEvents() {
	for (const k in TO) { clearTimeout(TO[k]); TO[k] = null; }
	for (const k in ANIM) { if (isdef(ANIM[k])) ANIM[k].cancel(); ANIM[k] = null; }
	if (SLEEP_WATCHER) { SLEEP_WATCHER.cancel(); if (VERBOSE) console.log('clearEvents: ACHTUNG SLEEP_WATCHER!!!') }
}
function clearMain() { UI.commands = {}; staticTitle(); clearEvents(); mClear('dMain'); mClear('dTitle'); clearMessage(); }
function clearMessage(remove = false) { if (remove) mRemove('dMessage'); else mStyle('dMessage', { h: 0 }); }
function clearParent(ev) { mClear(ev.target.parentNode); }
function clearTimeouts() {
	onclick = null;
	clearTimeout(TOMain);
	clearTimeout(TOFleetingMessage);
	clearTimeout(TOTrial);
	if (isdef(TOList)) { for (const k in TOList) { TOList[k].map(x => clearTimeout(x)); } }
}
async function clickOn(prop, val) {
	let elem = null;
	if (isDict(prop) && isdef(prop.tag)) elem = prop; else elem = findElementBy(prop, val);
	assertion(elem, `NO elem ${prop} ${val}`);
	elem.click();
}
function coin(percent = 50) { return Math.random() * 100 < percent; }
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
	else if (tString && isdef(ColorDi) && lookup(ColorDi, [c])) return ColorDi[c].hex;
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
function createGamePlayer(name, gamename, opts = {}) {
	let pl = userToPlayer(name, gamename);
	copyKeys(opts, pl);
	return pl;
}
function createImageSymbol(src, id) {
	return `
      <symbol id="${id}" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
        <image href="${src}" x="0" y="0" width="100" height="100" />
      </symbol>
    `;
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
function createOpenTable(gamename, players, options) {
	let me = UGetName();
	let playerNames = [me]; if (VERBOSE) console.log('me', me)
	assertion(me in players, "_createOpenTable without owner!!!!!")
	for (const name in players) { addIf(playerNames, name); }
	let table = {
		status: 'open',
		id: generateTableId(),
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
function defaultGameFunc() {
	function setup(table) { let fen = { players: table.players, turn: [table.owner] }; delete table.players; }
	function present(dParent, table) { mClear('dMain'); } //showMessage(`BINGO!!! ${table.friendly} view ${name}: NOT IMPLEMENTED!!!!!`,1000); } 
	async function activate(table) { console.log('activate for', getUname()) }
	async function stats(table) { console.log('stats for', getUname()) }
	function checkGameover(table) { return false; }
	async function hybridMove(table) { console.log('hybrid moves for', getUname()) }
	async function botMove(table) { console.log('robot moves for', getUname()) }
	function prepLayout(table) { presentStandardRoundTable(table); }
	async function stepComplete(table, o) { console.log(`integrate if step complete for ${table.friendly}`); }
	return { stats, prepLayout, setup, activate, checkGameover, present, hybridMove, botMove, stepComplete };
}
function detectSessionType() {
	let loc = window.location.href;
	DA.sessionType =
		loc.includes('moxito.online') ? 'fastcomet' :
			loc.includes('vidulus') ? 'vps' :
				loc.includes('telecave') ? 'telecave' : loc.includes('8080') ? 'php'
					: loc.includes(':40') ? 'nodejs'
						: loc.includes(':60') ? 'flask' : 'live';
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
function drag(ev) {
	let elem = ev.target;
	dragStartOffset = getRelCoords(ev, elem);
	draggedElement = elem;
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
	let [centers, rows, maxcols] = hexBoardCenters(topside, side);
	let [w, h] = mSizeSuccession(itemStyles, 24);
	let gap = valf(styles.gap, -.5);
	let items = [];
	if (gap != 0) copyKeys({ w: w - gap, h: h - gap }, itemStyles);
	for (const c of centers) {
		let dhex = hexFromCenter(d, { x: c.x * w, y: c.y * h }, itemStyles);
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
function drawLineOnCanvas(canvas, x1, y1, x2, y2, stroke = 1) {
	const ctx = canvas.getContext('2d');
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.strokeStyle = '#000';
	ctx.lineWidth = stroke;
	ctx.stroke();
}
function drawMeeple(dParent, p) {
	let addLabel = true;
	let html = isdef(p.owner) && addLabel ? p.owner[0].toUpperCase() : ''; //p.id.substring(1) : ''
	let d1 = p.div = mDom(dParent, { fz: p.sz * .75, left: p.x + p.sz / 2, top: p.y + p.sz / 2, w: p.sz, h: p.sz, position: 'absolute', bg: p.bg, fg: 'contrast' }, { html, id: p.id });
	mCenterCenterFlex(d1);
	d1.style.cursor = 'default';
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
function drop(ev) {
	ev.preventDefault();
	let targetElem = findDragTarget(ev);
	targetElem.appendChild(draggedElement);
	setDropPosition(ev, draggedElement, targetElem, isdef(draggedElement.dropPosition) ? draggedElement.dropPosition : dropPosition);
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
function evNoBubble(ev) { ev.preventDefault(); ev.stopPropagation(); }
function evToAttr(ev, attr) {
	let elem = ev.target;
	let val = null;
	while (nundef(val) && isdef(elem)) {
		val = elem.getAttribute(attr);
		if (isdef(val)) return val;
		elem = elem.parentNode;
	}
	return null;
}
function evToClass(ev, className) {
	let elem = findAncestorWith(ev.target, { className });
	return elem;
}
function evToElem(ev, attr) {
	let elem = ev.target;
	let val = null;
	while (nundef(val) && isdef(elem)) {
		val = elem.getAttribute(attr);
		if (isdef(val)) return { val, elem };
		elem = elem.parentNode;
	}
	return null;
}
function evToId(ev) {
	let elem = findAncestorWith(ev.target, { id: true });
	return elem.id;
}
function extendRect(r4) { r4.l = r4.x; r4.t = r4.y; r4.r = r4.x + r4.w; r4.b = r4.t + r4.h; }
function extractSymbols(svgString, symbolDict) {
	const symbolRegex = /<symbol id='([^']+)'[^>]*>[\s\S]*?<\/symbol>/g;
	let match;
	while ((match = symbolRegex.exec(svgString)) !== null) {
		const id = match[1];
		const fullSymbol = match[0];
		symbolDict[id] = fullSymbol;
	}
}
function fetchGameState() {
	const gameId = document.getElementById("stateGameId").value;
	getGameState(gameId);
}
function fetchGamesList() {
	console.log("Fetching games list");
	DA.socket.emit("games_list");
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
function findDragTarget(ev) {
	let targetElem = ev.target;
	while (!targetElem.ondragover) targetElem = targetElem.parentNode;
	return targetElem;
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
function firstCond(aos, func) {
	if (nundef(aos)) return null;
	else if (isDict(aos)) for (const k in aos) { if (func(k) || func(aos[k])) return k; }
	else for (const a of aos) { if (func(a)) return a; }
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
function fishgame() {
	function setup(table) { wsSetup(table); }
	function stats(table) { wsStats(table); }
	function present(table) { wsPresent(table); }
	async function activate(table, items) {
		await showInstructionStandard(table, 'may pick your initial cards'); //browser tab and instruction if any
		for (const item of items) {
			let d = iDiv(item);
			d.onclick = wsOnclickCard;
		}
		return;
		if (!isMyTurn(table)) { return; }
		for (const item of items) {
			let d = iDiv(item);
			mStyle(d, { cursor: 'pointer' });
			d.onclick = ev => onclickCard(table, item, items);
		}
		if (isEmpty(table.fen.cards)) return gameoverScore(table);
		if (amIHuman(table) && table.options.gamemode == 'multi') return;
		let name = amIHuman(table) && table.options.gamemode == 'solo' ? someOtherPlayerName(table) : UGetName();
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
		await evalMove(UGetName(), table, item.key);
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
	return { setup, present, stats, activate };
}
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
async function forceUpdate() {
	switch (DA.pollState) {
		case 'lobby': DA.tableList = null; await showGamesAndTables(); break;
		case 'mymove':
		case 'othermove': break;
		default: break;
	}
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
function formatLegend(key) {
	return key.includes('per') ? stringBefore(key, '_') + '/' + stringAfterLast(key, '_')
		: key.includes('_') ? replaceAll(key, '_', ' ') : key;
}
function formatNow() { return new Date().toISOString().slice(0, 19).replace("T", " "); }
function fromNormalized(s, opts = {}) {
	let sep = valf(opts.sep, '_');
	let caps = isdef(opts.caps) ? opts.caps : true;
	let x = replaceAll(s, sep, ' ');
	let words = caps ? toWords(x).map(x => capitalize(x)).join(' ') : toWords(x).join(' ');
	return words;
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
function generateTableId() { return rUniqueId('G', 12); }
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
function getBackendUrl(isScript = null) {
	if (nundef(DA.backendUrl)) {
		let loc = window.location.href;
		if (VERBOSE) console.log('href', loc);
		let sessionType = DA.sessionType =
			loc.includes('moxito.online/at0') ? 'at0' :
				loc.includes('moxito.online') ? 'fastcomet' :
					loc.includes('vidulus') ? 'vps' :
						loc.includes('telecave') ? 'telecave' : loc.includes('8080') ? 'php'
							: loc.includes(':40') ? 'nodejs'
								: loc.includes(':60') ? 'flask' : 'live';
		if (VERBOSE) console.log('sessionType', sessionType);
		let backendUrl = DA.backendUrl = sessionType == 'live' ? 'http://localhost:5000' : 'at0' ? 'https://moxito.online/at0' : 'fastcomet' ? 'https://moxito.online' : isScript || sessionType == 'php' ? 'http://localhost:8080/mox' : '..';
		if (VERBOSE) console.log('backendUrl', backendUrl);
	}
	return DA.backendUrl;
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
function getCenterRelativeToParent(div) {
	const rect = div.getBoundingClientRect();
	const parentRect = div.parentNode.getBoundingClientRect();
	return {
		x: rect.left + rect.width / 2 - parentRect.left,
		y: rect.top + rect.height / 2 - parentRect.top
	};
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
function getElementWithAttribute(key, val) {
	return document.querySelector(`[${key}="${val}"]`);
}
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
function getGameState(gameId) {
	DA.socket.emit("get_state", {
		gameid: gameId
	});
}
function getHexPoly(x, y, w, h) {
	let hex = [[0, -0.5], [0.5, -0.25], [0.5, 0.25], [0, 0.5], [-0.5, 0.25], [-0.5, -0.25]];
	return getPoly(hex, x, y, w, h);
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
function getNow() { return Date.now(); }
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
function getPoly(offsets, x, y, w, h) {
	let poly = [];
	for (let p of offsets) {
		let px = Math.round(x + p[0] * w);
		let py = Math.round(y + p[1] * h);
		poly.push({ x: px, y: py });
	}
	return poly;
}
function getQuadPoly(x, y, w, h) {
	q = [[0.5, -0.5], [0.5, 0.5], [-0.5, 0.5], [-0.5, -0.5]];
	return getPoly(q, x, y, w, h);
}
function getRadioValue(prop) {
	let fs = mBy(`d_${prop}`);
	if (nundef(fs)) return null;
	let val = getCheckedRadios(fs)[0];
	return isNumber(val) ? Number(val) : val;
}
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
function getServer(isScript = null) {
	let sessionType = detectSessionType();
	let server = sessionType == 'fastcomet' ? 'https://moxito.online/' : isScript || sessionType == 'php' ? 'http://localhost:8080/mox/' : '../';
	return server;
}
function getStyleProp(elem, prop) { return getComputedStyle(elem).getPropertyValue(prop); }
function getTriangleDownPoly(x, y, w, h) {
	let tridown = [[-0.5, 0.5], [0.5, 0.5], [-0.5, 0.5]];
	return getPoly(tridown, x, y, w, h);
}
function getTriangleUpPoly(x, y, w, h) {
	let triup = [[0, -0.5], [0.5, 0.5], [-0.5, 0.5]];
	return getPoly(triup, x, y, w, h);
}
function getUID(pref = '') {
	UIDCounter += 1;
	return pref + '_' + UIDCounter;
}
function getWaitingHtml(sz = 30) { return `<img src="../assets/icons/active_player.gif" height="${sz}" style="margin:0px ${sz / 3}px" />`; }
function globalKeyHandling() {
	DA.hotkeys = {};
	DA.keysToCheck = {};
	document.addEventListener('keydown', keyDownHandler);
	document.addEventListener('keyup', keyUpHandler);
	document.addEventListener('keydown', hotkeyHandler);
}
function hFunc(content, funcname, arg1, arg2, arg3) {
	let html = `<a style='color:blue' href="javascript:${funcname}('${arg1}','${arg2}','${arg3}');">${content}</a>`;
	return html;
}
function hPrepUi(ev, areas, cols, rows, bg, dParent) {
	hToggleClassMenu(ev); mClear(dParent);
	let d = mDom(dParent, { w: '100%', h: '100%' });
	let names = mAreas(d, areas, cols, rows);
	M.divNames = Array.from(new Set(M.divNames.concat(names))); if (VERBOSE) console.log(M.divNames);
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
	if (nundef(DA.pollInterval)) { console.log('no polling'); return; }
	if (document.visibilityState === "hidden") {
		pollStop();
	} else {
		pollStart();
	}
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
function hexFromCenter(dParent, center, styles = {}, opts = {}) {
	let [w, h] = mSizeSuccession(styles);
	let [left, top] = [center.x - w / 2, center.y - h / 2];
	let d = mDom(dParent, { position: 'absolute', left, top, 'clip-path': 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }, opts);
	mStyle(d, styles);
	return d;
}
function highlightPlayerItem(item) { mStyle(iDiv(item), { bg: MGetUserColor(item.name), fg: 'white', border: `white` }); }
function hotkeyActivate(key, handler) { DA.hotkeys[key] = handler; }
function hotkeyDeactivate(key) { delete DA.hotkeys[key]; }
function hotkeyHandler(ev) {
	let k = ev.key;
	let handler = lookup(DA, ['hotkeys', ev.key]);
	if (handler) { handler(ev); }
}
function iDiv(i) { return isdef(i.live) ? i.live.div : valf(i.div, i.ui, i); } //isdef(i.div) ? i.div : i; }
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
function initSockets(username) {
	let socket = DA.socket = io("http://localhost:5000");  // Adjust if needed
	socket.on("connect", () => {
		console.log("Connected to server");
	});
	socket.on("chat_message", function (data) {
		var chatBox = document.getElementById("chatBox");
		var newMessage = document.createElement("div");
		newMessage.textContent = data.username + ": " + data.message;
		chatBox.appendChild(newMessage);
		chatBox.scrollTop = chatBox.scrollHeight;
	});
	socket.on("games_list", games => {
		console.log("Games list:", games);
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
function isAlphaNum(s) { query = /^[a-zA-Z0-9]+$/; return query.test(s); }
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
function isEmpty(arr) {
	return arr === undefined || !arr
		|| (isString(arr) && (arr == 'undefined' || arr == ''))
		|| (Array.isArray(arr) && arr.length == 0)
		|| Object.entries(arr).length === 0;
}
function isIdle() { return DA.sysState == 'idle'; }
function isKeyDown(key) { return lookup(DA.keysToCheck, [key]); }
function isLetter(s) { return /^[a-zA-Z]$/i.test(s); }
function isList(arr) { return Array.isArray(arr); }
function isLiteral(x) { return isString(x) || isNumber(x); }
function isMyTurn(table) { return table.turn.includes(UGetName()) }
function isNumber(x) { return x !== ' ' && x !== true && x !== false && isdef(x) && (x == 0 || !isNaN(+x)); }
function isPointOutsideOf(elem, x, y) { const r = elem.getBoundingClientRect(); return (x < r.left || x > r.right || y < r.top || y > r.bottom); }
function isPolling() { return DA.sysState == 'polling'; }
function isString(param) { return typeof param == 'string'; }
function isdef(x) { return x !== null && x !== undefined && x !== 'undefined'; }
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
function last(arr) {
	return arr.length > 0 ? arr[arr.length - 1] : null;
}
function lastCond(arr, func) {
	if (nundef(arr)) return null;
	for (let i = arr.length - 1; i >= 0; i--) { let a = arr[i]; if (func(a)) return a; }
	return null;
}
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
function list2dict(arr, keyprop = 'id', uniqueKeys = true) {
	let di = {};
	for (const a of arr) {
		let key = typeof (a) == 'object' ? a[keyprop] : a;
		if (uniqueKeys) lookupSet(di, [key], a);
		else lookupAddToList(di, [key], a);
	}
	return di;
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
async function loadGame() {
	let tid = DA.tid;
	let data = await res.json();
	if (data.state) {
		tid = tid;
		boardState = data.state.board;
		renderBoard();
		document.getElementById("moveBtn").style.display = "inline-block";
	} else {
		alert("Game not found");
	}
}
async function loadStaticYaml(path) {
	let server = getServer();
	let res = await fetch(server + path);
	if (!res.ok) return null;
	return jsyaml.load(await res.text());
}
function loadSuperdiAssets() {
	let [di, byColl, byFriendly, byCat, allImages] = [M.superdi, {}, {}, {}, {}];
	for (const k in Symbols) {
		let kNew = isdef(di[k]) && isdef(di[k].text) ? k + '_uni' : k;
		if (k == 'writing_hand') console.log(k, di[k], kNew)
		if (isdef(di[k]) && nundef(di[k].text)) {
			assertion(k != 'writing_hand')
			let o = di[k];
			if (nundef(o.colls)) o.colls = [];
			o.colls.push('unicode');
			if (isdef(o.text)) console.log(':text', k, o.text);
			else o.text = Symbols[k];
		} else di[kNew] = { key: kNew, friendly: k, text: Symbols[k], colls: ['unicode'], cats: [] };
	}
	for (const k of MathKeys) {
		di[k].cats.push('math');
		lookupAddIfToList(byCat, ['math'], k);
	}
	for (const k in di) {
		let o = di[k];
		for (const cat of o.cats) lookupAddIfToList(byCat, [cat], k);
		for (const coll of o.colls) lookupAddIfToList(byColl, [coll], k);
		lookupAddIfToList(byFriendly, [o.friendly], k)
		if (isdef(o.img)) {
			let fname = stringAfterLast(o.img, '/')
			allImages[k] = { fname, path: o.img, key: k };
		}
		if (isdef(o.photo)) {
			let fname = stringAfterLast(o.photo, '/')
			allImages[k + '_photo'] = { fname, path: o.photo, key: k };
		}
	}
	M.allImages = allImages;
	M.byCat = byCat;
	M.byCollection = byColl;
	M.byFriendly = byFriendly;
	M.categories = Object.keys(byCat); M.categories.sort();
	M.collections = Object.keys(byColl); M.collections.sort();
	M.names = Object.keys(byFriendly); M.names.sort();
	[M.colorList, M.colorByHex, M.colorByName] = getListAndDictsForDicolors();
}
function loadUsers() {
	console.log('hier werden users updated was immer zu tun ist!!!')
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
function mAlign(d, da, opts) {
	if (mGetStyle(d, 'display') != 'inline-block') {
		let parent = d.parentNode;
		let wrapper = mDom(parent, { display: 'inline-block' });
		mAppend(wrapper, d);
		d = wrapper;
	}
	let rda = getRect(da);
	let rd = getRect(d);
	let align = valf(opts.align, 'bl'), ov = valf(opts.ov, 0);
	if (align == 'tl') { dx = rda.l; dy = rda.t - rd.h * (1 - ov); }
	else if (align == 'bl') { dx = rda.l; dy = rda.b - rd.h * ov; }
	else if (align == 'cl') { dx = rda.l - rd.w * (1 - ov); dy = rda.t + rda.h / 2 - rd.h / 2; }
	else if (align == 'tr') { dx = rda.l + rda.w - rd.w; dy = rda.t - rd.h * (1 - ov); }
	else if (align == 'br') { dx = rda.l + rda.w - rd.w; dy = rda.t + rda.h - rd.h * ov; }
	else if (align == 'cr') { dx = rda.l + rda.w - rd.w + rd.w * (1 - ov); dy = rda.t + rda.h / 2 - rd.h / 2; }
	else if (align == 'tc') { dx = rda.l + rda.w / 2 - rd.w / 2; dy = rda.t - rd.h * (1 - ov); }
	else if (align == 'bc') { dx = rda.l + rda.w / 2 - rd.w / 2; dy = rda.t + rda.h - rd.h * ov; }
	else if (align == 'cc') { dx = rda.l + rda.w / 2 - rd.w / 2; dy = rda.t + rda.h / 2 - rd.h / 2; }
	dx = clamp(dx, 0, window.innerWidth - rd.w); dy = clamp(dy, 0, window.innerHeight - rd.h);
	mPos(d, dx, dy, opts.offx, opts.offy);
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
function mAppend(d, child) { toElem(d).appendChild(child); return child; }
function mAreas(dParent, areas, gridCols, gridRows) {
	mClear(dParent); mStyle(dParent, { padding: 0 })
	let names = arrNoDuplicates(toWords(areas));
	let dg = mDom(dParent);
	for (const name of names) {
		let d = mDom(dg, { family: 'opensans' }, { id: name });
		d.style.gridArea = name;
	}
	mStyle(dg, { display: 'grid', gridCols, gridRows, h: '100%' });
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
function mButtonX(dParent, handler = null, sz = 22, offset = 5, color = 'contrast') {
	mIfNotRelative(dParent);
	let bx = mDom(dParent, { position: 'absolute', top: -2 + offset, right: -5 + offset, w: sz, h: sz, cursor: 'pointer' }, { className: 'hop1' });
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
function mCenterCenter(d, gap) { mCenterCenterFlex(d, gap); }
function mCenterCenterFlex(d, gap) { mCenterFlex(d, true, true, true, gap); }
function mCenterFlex(d, hCenter = true, vCenter = false, wrap = true, gap = null) {
	let styles = { display: 'flex' };
	if (hCenter) styles['justify-content'] = 'center';
	styles['align-content'] = vCenter ? 'center' : 'flex-start';
	if (wrap) styles['flex-wrap'] = 'wrap';
	if (gap) styles.gap = gap;
	mStyle(d, styles);
}
function mClass(d) {
	d = toElem(d);
	if (arguments.length == 2) {
		let arg = arguments[1];
		if (isString(arg) && arg.indexOf(' ') > 0) { arg = [toWords(arg)]; }
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
function mCreate(tag, styles, id) { let d = document.createElement(tag); if (isdef(id)) d.id = id; if (isdef(styles)) mStyle(d, styles); return d; }
function mCreateFrom(htmlString) {
	var div = document.createElement('div');
	div.innerHTML = htmlString.trim();
	return div.firstChild;
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
function mDom(dParent, styles = {}, opts = {}) {
	let tag = valf(opts.tag, 'div');
	let d = document.createElement(tag);
	if (isdef(dParent)) mAppend(dParent, d);
	if (tag == 'textarea') styles.wrap = 'hard';
	mStyle(d, styles);
	applyOpts(d, opts);
	return d;
}
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
function mGather(f, d, styles = {}, opts = {}) {
	return new Promise((resolve, _) => {
		let dShield = mShield();
		let fCancel = _ => { dShield.remove(); hotkeyDeactivate('Escape'); resolve(null) };
		let fSuccess = val => { dShield.remove(); hotkeyDeactivate('Escape'); resolve(val) };
		dShield.onclick = fCancel;
		hotkeyActivate('Escape', fCancel);
		let [box, inp] = mInBox(f, dShield, styles, {}, dictMerge(opts, { fSuccess }));
		mAlign(box, d, { align: 'bl', offx: 20 });
		inp.focus();
	});
}
async function mGetFilenames(dir) {
	let res = await mPhpPost('all', { action: 'dir', dir });
	return res.dir.filter(x => x != '.' && x != '..');
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
function mGrid(rows, cols, dParent, styles = {}, opts = {}) {
	[rows, cols] = [Math.ceil(rows), Math.ceil(cols)]
	addKeys({ display: 'inline-grid', gridCols: 'repeat(' + cols + ',1fr)' }, styles);
	if (rows) styles.gridRows = 'repeat(' + rows + ',auto)';
	else styles.overy = 'auto';
	let d = mDom(dParent, styles, opts);
	return d;
}
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
function mInsert(dParent, el, index = 0) { dParent.insertBefore(el, dParent.childNodes[index]); return el; }
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
function mLayout(dParent, rowlist, colt, rowt, styles = {}, opts = {}) {
	dParent = toElem(dParent);
	mStyle(dParent, styles);
	rowlist = rowlist.map(x => x.replaceAll('@', valf(opts.suffix, ''))); //console.log(rowlist);
	rowt = rowt.replaceAll('@', valf(opts.hrow, 30));
	colt = colt.replaceAll('@', valf(opts.wcol, 30));
	let areas = `'${rowlist.join("' '")}'`;
	if (dParent.id == 'dPage') M.divNames = [];
	let newNames = mAreas(dParent, areas, colt, rowt);
	let names = M.divNames = Array.from(new Set(M.divNames.concat(newNames)));
	if (nundef(styles.bgSrc)) mShade(newNames, 2, 1);
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
function mLayoutTopExtraSpaceBetween(dParent) {
	dParent = toElem(dParent);
	mStyle(dParent, {}, { id: 'dOuterTop' });
	let dTop = mDom(dParent, { display: 'flex', justifyContent: 'space-between' }, { id: 'dTop' });
	let dExtra = mDom(dParent, { display: 'flex', justifyContent: 'space-between' }, { id: 'dExtra' });
	let [dTopLeft, dTopMiddle, dTopRight] = [mDom('dTop', {}, { id: 'dTopLeft' }), mDom('dTop', {}, { id: 'dTopMiddle' }), mDom('dTop', {}, { id: 'dTopRight' })]
	let [dExtraLeft, dExtraMiddle, dExtraRight] = [mDom('dExtra', {}, { id: 'dExtraLeft' }), mDom('dExtra', {}, { id: 'dExtraMiddle' }), mDom('dExtra', {}, { id: 'dExtraRight' })]
}
function mLayoutTopTestExtraMessageTitle(dParent) {
	dParent = toElem(dParent);
	mStyle(dParent, { hPadding: 10, vPadding: 2 }, { id: 'dOuterTop' });
	let dTop = mDom(dParent, { display: 'flex', justifyContent: 'space-between' }, { id: 'dTop' });
	let dTest = mDom(dParent, { display: 'flex', justifyContent: 'space-between' }, { id: 'dTest' });
	let dExtra = mDom(dParent, { display: 'flex', justifyContent: 'space-between' }, { id: 'dExtra' });
	let dMessage = mDom(dParent, { h: 0, bg: 'red', fg: 'yellow' }, { id: 'dMessage' });
	let [dTopLeft, dTopMiddle, dTopRight] = [mDom('dTop', {}, { id: 'dTopLeft' }), mDom('dTop', {}, { id: 'dTopMiddle' }), mDom('dTop', {}, { id: 'dTopRight' })]
	let [dTestLeft, dTestMiddle, dTestRight] = [mDom('dTest', {}, { id: 'dTestLeft' }), mDom('dTest', {}, { id: 'dTestMiddle' }), mDom('dTest', {}, { id: 'dTestRight' })]
	let [dExtraLeft, dExtraMiddle, dExtraRight] = [mDom('dExtra', {}, { id: 'dExtraLeft' }), mDom('dExtra', {}, { id: 'dExtraMiddle' }), mDom('dExtra', {}, { id: 'dExtraRight' })]
	mDom(dExtraLeft, {}, { id: 'dTitle' });
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
async function mPhpDeleteFile(path) { return await mPhpGet('delete_file', { path }); }
async function mPhpGet(cmd, o, projectName = 'simple0', verbose = false, jsonResult = true) {
	let server = getServer();
	let suffix = '';
	for (const k in o) {
		let s = JSON.stringify(o[k]);
		if (!isEmpty(suffix)) suffix += '&';
		suffix += `${k}=${encodeURIComponent(o[k])}`;
	}
	let command = server + `${projectName}/php/${cmd}.php?${suffix}`;
	if (verbose) console.log('to php:', command, o); //return;
	let res = await fetch(command,
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
async function mPhpGetFile(path) { return await mPhpPost('read_file', { path }, false); }
async function mPhpPost(cmd, o, projectName = 'simple0', verbose = false, jsonResult = true) {
	let server = getServer('php');
	if (isdef(o.path) && (o.path.startsWith('zdata') || o.path.startsWith('y'))) o.path = '../../' + o.path;
	if (verbose) console.log('to php:', server + `${projectName}/php/${cmd}.php`, o);
	let res = await fetch(server + `${projectName}/php/${cmd}.php`,
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
async function mPhpPostAudio(url, path, projectName = 'simple0', verbose = true) { return await mPhpPost('dl', { url, path }); }
async function mPhpPostFile(text, path, projectName = 'simple0', verbose = true) { return await mPhpPost('write_file', { text, path }, projectName, verbose); }
async function mPhpPostLine(line, path, projectName = 'simple0', verbose = true) { return await mPhpPost('append_action', { line, path }, false); }
async function mPhpPostText(text, path, projectName = 'simple0', verbose = true) { return await mPhpPost('append_text', { text, path }, false); }
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
function mPos(d, x, y, offx = 0, offy = 0, unit = 'px') {
	let dParent = d.parentNode; mIfNotRelative(dParent);
	mStyle(d, { left: `${x + offx}${unit}`, top: `${y + offy}${unit}`, position: 'absolute' });
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
function mRadioGroup(dParent, styles, id, legend, legendstyles) {
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
function mShade(names, offset = 1, contrast = 1) {
	let palette = paletteTransWhiteBlack(names.length * contrast + 2 * offset).slice(offset);
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
			setTimeout(() => {
				try {
					rej(`PROMISE REJECT ${isdef(TO.SLEEPTIMEOUT)}`);
				} catch (err) {
					console.log(`WTF!!!!!!!!!!!!!!!!!!`, err);
				}
			}, ms + 1);
		});
}
function mStyle(elem, styles = {}, opts = {}) {
	elem = toElem(elem);
	styles = jsCopy(styles);
	let noUnit = ['opacity', 'flex', 'grow', 'shrink', 'grid', 'z', 'iteration', 'count', 'orphans', 'widows', 'weight', 'order', 'index'];
	const STYLE_PARAMS_3 = {
		box: (elem, v) => elem.style.boxSizing = v ? 'border-box' : 'content-box',
		bgSrc: (elem, v) => elem.style.backgroundImage = `url(${v})`,
		gridRows: (elem, v) => elem.style.gridTemplateRows = isNumber(v) ? `repeat(${v},1fr)` : v,
		gridCols: (elem, v) => elem.style.gridTemplateColumns = isNumber(v) ? `repeat(${v},1fr)` : v,
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
function mToggleColorButton(dParent, styles = {}, opts = {}, states) {
	addKeys({ tag: 'button' }, opts);
	let b = mDom(dParent, styles, opts); mFlex(b, false, 'space-between', 'baseline', true);
	let sz = 16;
	let c = mDom(b, { w: sz, h: sz, round: true, bg: 'blue', position: 'relative', top: 2, left: 3 }, { state: null });
	if (nundef(states)) states = [{ color: 'green', blink: false, f: () => console.log('callback!') }, { color: 'red', blink: true, f: () => console.log('callback!') }];
	b.onclick = ev => onclickBlinker(ev, states);
	return b;
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
function mYaml(d, js) {
	d.innerHTML = '<pre>' + jsonToYaml(js) + '</pre>';
}
function mYesNo(dParent, styles = {}, opts = {}) {
	return mSelect(dParent, styles, dictMerge(opts, { list: ['yes', 'no'] }));
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
function makeMove(gameId, move) {
	DA.socket.emit("make_move", {
		gameid: gameId,
		move: move
	});
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
function measureWidth(elem) { return mGetStyle(elem, 'w') }
function menuLobby() { DA.prevMenuState = DA.menuState; DA.menuState = 'lobby'; }
function menuTable() { DA.prevMenuState = DA.menuState; DA.menuState = 'table'; }
function name2id(name) { return 'd_' + name.split(' ').join('_'); }
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
async function onEventEdited(id, text, time) {
	if (VERBOSE) console.log('onEventEdited', id, text, time)
	let e = Items[id];
	if (nundef(time)) {
		[time, text] = extractTime(text);
	}
	e.time = time;
	e.text = text;
	let result = await simpleUpload('postUpdateEvent', e);
	if (VERBOSE) console.log('result', result)
	Items[id] = lookupSetOverride(Serverdata, ['events', id], e);
	mBy(id).firstChild.value = getEventValue(e);
	closePopup();
}
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
async function onchangeBotSwitch(ev) {
	let elem = ev.target;
	assertion(T, "NO TABLE!!!!!!!!!!!!!!!")
	let name = UGetName();
	let id = T.id;
	let playmode = (elem.checked) ? 'bot' : 'human';
	let olist = [{ keys: ['players', name, 'playmode'], val: playmode }];
	let res = await mPostRoute(`olist`, { id, name, olist });
}
async function onclickAction(ev) {
	assertion(isdef(DA.stopwatch), 'NO STOPWATCH!!!!!!!!!!!!!!!')
	let [prevElem, elem] = hToggleClassMenu(ev);
	let prevKey = prevElem ? prevElem.getAttribute('key') : null;
	let key = elem.getAttribute('key'); if (VERBOSE) console.log('keys', prevKey, key);
	let a = DA.action;
	let w = DA.stopwatch;
	if (!a) {
		DA.action = { key, elem, prevElem, prevKey, status: 'started' };
	}
	return;
	if (nundef(a)) {
		DA.action = { key, elem, prevElem, prevKey, status: 'started' };
		let s = `${key}:${getNow()}`;
		let res = await mPhpPostText(s, 'zdata/action.txt'); //,{ text:`${getNow()}: ${w.key}, ${secs}`,time:getNow(),key:w.key,secs });
		if (VERBOSE) console.log(res);
	} else if (a.key == key && a.status == 'started') {
		a.status = 'paused';
		a.prevElem = elem;
		a.prevKey = key;
		let s = `-${getNow()}\n`;
		let res = await mPhpPostText(s, 'zdata/action.txt'); //,{ text:`${getNow()}: ${w.key}, ${secs}`,time:getNow(),key:w.key,secs });
		console.log(res);
	} else if (a.key == key && a.status == 'paused') {
		let s = `${key}:${getNow()}`;
		let res = await mPhpPostText(s, 'zdata/action.txt'); //,{ text:`${getNow()}: ${w.key}, ${secs}`,time:getNow(),key:w.key,secs });
		console.log(res);
		a.status = 'started';
		a.prevElem = elem;
		a.prevKey = key;
	}
	return;
	let html = getInnermostTextString(elem);
	let words = toWords(html);
	key = words[0];
	let nlist = allNumbers(html);
	console.log(key, w.key);
	let isActive = key == w.key;
	let r = getRect(elem); let top = r.t + 15;
	mStyle('dBlinker', { top })
	if (isActive) {
		if (w.getStatus()) {
			w.stop();
			mClassRemove('dBlinker', 'blink_green');
			mClass('dBlinker', 'blink_orange');
		} else {
			w.start();
			mClassRemove('dBlinker', 'blink_orange');
			mClass('dBlinker', 'blink_green');
		}
		return;
	}
	if (w.key) {
		w.stop();
		let secs = w.getElapsed();
		let s = `${getNow()}: ${w.key}, ${secs}`;
		let res = await mPhpPostLine(s, '../../zdata/action.txt'); //,{ text:`${getNow()}: ${w.key}, ${secs}`,time:getNow(),key:w.key,secs });
		console.log(res);
		w.reset();
	}
	w.key = key;
	w.start();
	mClassRemove('dBlinker', 'blink_orange');
	mClass('dBlinker', 'blink_green');
}
async function onclickAddSelected() {
	let keys = UI.selectedImages;
	let cmd = UI.commands.addSelected;
	let collist = M.collections.filter(x => !simpleLocked(x)).map(x => ({ name: x, value: false }));
	let result = await mGather(iDiv(cmd), {}, { content: collist, type: 'checkList' });
	if (!result || isEmpty(result)) { console.log('nothing added'); simpleClearSelections(); return; }
	assertion(isList(result), 'uiCadgetTypeChecklist result is NOT a list!!!')
	let di = {}, changed = false;
	for (const key of keys) {
		let o = M.superdi[key];
		for (const collname of result) {
			if (o.colls.includes(collname)) continue;
			changed = true;
			o.colls.push(collname);
			di[key] = o;
		}
	}
	if (!changed) { console.log('nothing added'); simpleClearSelections(); return; }
	console.log('items changed:', Object.keys(di));
	await updateSuperdi(di);
	simpleInit();
}
async function onclickArchiveActions(ev) {
	let elem = hToggleClassMenu(ev);
	let path = 'zdata/action.txt';
	let text = await mPhpGetFile(path); console.log(text)
	let res = await mPhpPostText(text, 'zdata/archive_action.txt');
	await mPhpDeleteFile(path);
	clearTimeouts(); mClear('dMain');
	console.log(res);
}
function onclickBlinker(ev, states) {
	let button = ev.target;
	let ch = arrChildren(button)
	let elem = ch.find(x => x.hasAttribute('state'));
	let attr = elem.getAttribute('state');
	let i = 0;
	if (!isNumber(attr)) i = 0; else i = (Number(attr) + 1) % states.length;
	let state = states[i];
	elem.setAttribute('state', i);
	mStyle(elem, { bg: state.color });
	if (state.blink) mClass(elem, 'blink'); else mClassRemove(elem, 'blink');
	if (isdef(state.f)) state.f();
}
async function onclickCalc(ev) {
	hPrepUi(ev, ` 'dSide dMain' `, 'auto 1fr', '1fr', rColor(), 'dMain');
	let dSide = mBy('dSide'); mStyle(dSide, { padding: 10, box: true });
	return;
	let dMenu = mDom('dSide', { display: 'flex', dir: 'column' }); //side menu
	let gencase = mLinkMenu(dMenu, 'Manual', {}, onclickStatistik, 'side');
	let x = mLinkMenu(dMenu, 'Binomial', {}, onclickBinomial, 'side');
	let normal = mLinkMenu(dMenu, 'Normal', {}, onclickNormal, 'side');
	let all = mLinkMenu(dMenu, 'Alles', {}, onclickAll, 'side');
}
function onclickClear(inp, grid) {
	inp.value = '';
	let checklist = Array.from(grid.querySelectorAll('input[type="checkbox"]'));
	checklist.map(x => x.checked = false);
	sortCheckboxes(grid);
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
async function onclickColor(color) {
	let hex = colorToHex79(color);
	U.color = hex; delete U.fg;
	await updateUserTheme()
}
async function onclickCommand(ev) {
	let key = evToAttr(ev, 'key'); //console.log(key);
	let cmd = key == 'user' ? UI.nav.commands.user : UI.commands[key];
	assertion(isdef(cmd), `command ${key} not in UI!!!`)
	await cmd.open();
}
function onclickConsole(ev) { console.log(ev.target); }
function onclickDay(d, styles) {
	let tsDay = d.id;
	let tsCreated = Date.now();
	let id = generateEventId(tsDay, tsCreated);
	let uname = U ? UGetName() : 'guest';
	let o = { id: id, created: tsCreated, day: tsDay, time: '', text: '', user: uname, shared: false, subscribers: [] };
	Items[id] = o;
	let x = uiTypeEvent(d, o, styles);
	x.inp.focus();
}
async function onclickDeleteCollection(name) {
	if (nundef(name) && UI.collSecondary.isOpen) name = UI.collSecondary.name;
	if (nundef(name)) name = await mGather(iDiv(UI.deleteCollection), 'name');
	if (!name) return;
	if (collLocked(name)) { showMessage(`collection ${name} cannot be deleted!!!!`); return; }
	let proceed = await mGather(iDiv(UI.deleteCollection), {}, { type: 'yesNo', content: `delete collection ${name}?` });
	if (proceed) await collDelete(name);
	if (UI.collSecondary.isOpen && UI.collSecondary.name == name) collCloseSecondary();
	if (UI.collPrimary.name == name) { UI.collPrimary.name = 'all'; collOpenPrimary(); }
}
async function onclickDeleteSelected() {
	let selist = UI.selectedImages;
	let di = {}, deletedKeys = {};
	for (const k of selist) {
		let o = collKeyCollnameFromSelkey(k);
		let key = o.key;
		let collname = o.collname;
		if (collLocked(collname)) continue;
		if (nundef(deletedKeys[collname])) deletedKeys[collname] = [];
		await collDeleteOrRemove(key, collname, di, deletedKeys[collname]);
	}
	if (isEmpty(di) && Object.keys(deletedKeys).every(x => isEmpty(deletedKeys[x]))) {
		showMessage(`ERROR: cannot delete selected items!!!`);
		collClearSelections();
		return;
	}
	console.log('deletedKeys dict: ', deletedKeys);
	for (const k in deletedKeys) {
		let res = await mPostRoute('postUpdateSuperdi', { di, deletedKeys: deletedKeys[k], collname: k });
		console.log('postUpdateSuperdi', k, res)
		di = {};
	}
	await loadAssets();
	collPostReload();
}
async function onclickEditDetails() {
	let key = UI.selectedImages[0];
	let cmd = UI.commands.simpleNew;
	await editDetailsFor(key, iDiv(cmd));
}
function onclickExistingEvent(ev) { evNoBubble(ev); showEventOpen(evToId(ev)); }
async function onclickGameMenuItem(ev) {
	let gamename = evToAttr(ev, 'gamename');
	await showGameMenu(gamename);
}
async function onclickGameMenuPlayer(ev) {
	let name = evToAttr(ev, 'username'); //console.log('name',name); return;
	let shift = ev.shiftKey;
	await showGameMenuPlayerDialog(name, shift);
}
async function onclickGameStart() {
	await saveDataFromPlayerOptionsUI(DA.gamename);
	let options = collectOptions();
	let players = collectPlayers();
	let table = await startGame(DA.gamename, players, options);
}
function onclickHex(item, board) {
	toggleItemSelectionUnique(item, board.items);
	if (isdef(board.handler)) board.handler(item, board);
}
async function onclickHomeNew() {
	let d = mDom('dMain'); mCenterCenterFlex(d);
	let dt = mDom(d, { fg: getThemeFg(), box: true, w100: true, padding: 20 }, { html: `${me}'s blog` });
	mDom(dt, { w100: true, margin: 'auto' }, { tag: 'textarea', rows: 15 });
	let db = mDom(dt);
	mButton('Save', homeOnclickSaveBlog, db, {}, 'button');
}
function onclickMenu(ev) {
	let keys = evToAttr(ev, 'key');
	let [menuKey, cmdKey] = keys.split('_');
	let menu = UI[menuKey];
	switchToMenu(menu, cmdKey);
}
function onclickMoveDown() {
	let item = DA.selectedPart[0]; if (!item) return;
	let idx = DA.blogs[item.key].items.indexOf(item);
	let arr = DA.blogs[item.key].items;
	let dparent = DA.blogs[item.key].dParts;
	if (idx == arr.length - 1) {
		removeInPlace(arr, item);
		arr.unshift(item);
		dparent.insertBefore(item.div, dparent.firstChild);
	} else {
		let next = DA.blogs[item.key].items[idx + 1];
		DA.blogs[item.key].items[idx + 1] = item;
		DA.blogs[item.key].items[idx] = next;
		dparent.insertBefore(next.div, item.div);
	}
}
function onclickMoveUp() {
	let item = DA.selectedPart[0]; if (!item) return;
	let idx = DA.blogs[item.key].items.indexOf(item);
	let arr = DA.blogs[item.key].items;
	let dparent = DA.blogs[item.key].dParts;
	if (idx == 0) {
		removeInPlace(arr, item);
		arr.push(item);
		dparent.appendChild(item.div);
	} else {
		let prev = DA.blogs[item.key].items[idx - 1];
		DA.blogs[item.key].items[idx - 1] = item;
		DA.blogs[item.key].items[idx] = prev;
		dparent.insertBefore(item.div, prev.div);
	}
}
async function onclickNATIONS() {
	if (nundef(M.natCards)) M.natCards = await mGetYaml('../assets/games/nations/cards.yaml');
	M.civs = ['america', 'arabia', 'china', 'egypt', 'ethiopia', 'greece', 'india', 'japan', 'korea', 'mali', 'mongolia', 'persia', 'poland', 'portugal', 'rome', 'venice', 'vikings'];
	let player = M.player = { civ: rChoose(M.civs) };
	M.ages = { 1: { events: [], progress: [] }, 2: { events: [], progress: [] }, 3: { events: [], progress: [] }, 4: { events: [], progress: [] } };
	for (const k in M.natCards) {
		let c = M.natCards[k];
		if (c.age == 0) continue;
		let age = c.age == 0 ? 1 : c.age;
		if (c.Type == 'event') M.ages[age].events.push(k); else M.ages[age].progress.push(k);
	}
	M.age = 1;
	M.events = M.ages[M.age].events;
	M.progress = M.ages[M.age].progress;
	arrShuffle(M.progress);
	arrShuffle(M.events);
	let d1 = mDom('dMain'); mFlex(d1);
	UI.coll.rows = 3; UI.coll.cols = 7;
	let bg = getNavBg();
	let h = 180;
	let dcost = M.costGrid = mGrid(UI.coll.rows, 1, d1, { 'align-self': 'start' });
	for (let cost = 3; cost >= 1; cost--) {
		let d2 = mDom(dcost, { display: 'flex', 'justify-content': 'center', 'flex-flow': 'column', box: true, margin: 2, h: h, overflow: 'hidden' }, {});
		for (let i = 0; i < cost; i++) mDom(d2, { h: 40 }, { tag: 'img', src: `../assets/games/nations/templates/gold.png` });
	}
	UI.coll.grid = mGrid(UI.coll.rows, UI.coll.cols, d1, { 'align-self': 'start' });
	UI.coll.cells = [];
	for (let i = 0; i < UI.coll.rows * UI.coll.cols; i++) {
		let d = mDom(UI.coll.grid, { box: true, margin: 2, h: h, overflow: 'hidden' });
		mCenterCenterFlex(d);
		UI.coll.cells.push(d);
	}
	let n = UI.coll.rows * UI.coll.cols;
	M.market = [];
	for (let i = 0; i < n; i++) {
		let k = M.progress.shift();
		M.market.push(k);
		let card = M.natCards[k];
		let img = mDom(UI.coll.cells[i], { h: h, w: 115 }, { tag: 'img', src: `../assets/games/nations/cards/${k}.png` });
		img.setAttribute('key', k)
		img.onclick = buyProgressCard;
	}
	mDom('dMain', { h: 20 })
	let dciv = mDom('dMain', { w: 800, h: 420, maleft: 52, bg: 'red', position: 'relative' });
	let iciv = await loadImageAsync(`../assets/games/nations/civs/civ_${player.civ}.png`, mDom(dciv, { position: 'absolute' }, { tag: 'img' }));
	M.civCells = [];
	for (let i = 0; i < 2; i++) {
		for (let j = 0; j < 7; j++) {
			let r = getCivSpot(player.civ, i, j);
			let [dx, dy, dw, dh] = [10, 10, 15, 20]
			let d = mDom(dciv, { box: true, w: r.w + dw, h: r.h + dh, left: r.x - dx, top: r.y - dy, position: 'absolute', overflow: 'hidden' });
			mCenterCenterFlex(d);
			M.civCells.push(d);
			d.onclick = () => selectCivSpot(d);
		}
	}
}
async function onclickNewBlog(ev) {
	let d = mBy('dBlogs');
	let title = await mGather(mInput, ev.target, { bg: 'pink', padding: 4 }); console.log('you entered', title);
	let date = new Date();
	const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
	const formattedDate = date.toLocaleDateString('en-GB', options); // Adjust 'en-GB' for locale if needed
	console.log(formattedDate);
	let d1 = mDom(d, { bg: 'red', h: 100 }, { html: `${formattedDate} ${title}` });
	mInsert(d, d1, 0);
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
function onclickPasteDetailObject(text, inputs, wIdeal, df, styles, opts) {
	function parseToInputs(o) {
		let keys = Object.keys(o);
		if (keys.length == 1) { o = o[keys[0]]; }
		let onorm = {};
		for (const k in o) {
			let k1 = normalizeString(k);
			onorm[k1] = o[k];
		}
		if (isEmpty(inputs)) {
			mBy('bParseIntoForm').remove();
			fillMultiForm(o, inputs, wIdeal, df, styles, opts);
		} else {
			for (const oinp of inputs) {
				let k = normalizeString(oinp.name);
				if (isdef(o[k])) oinp.inp.value = o[k];
			}
		}
	}
	try {
		let o = jsyaml.load(text);
		if (isdef(o)) parseToInputs(o);
	} catch {
		try {
			let o = JSON.parse(text);
			if (isdef(o)) parseToInputs(o);
		} catch { showMessage('text cannot be parsed into yaml or json object!') }
	}
}
async function onclickPlan() { await showCalendarApp(); }
async function onclickResetActions(ev) {
	let res = await mPhpDeleteFile('zdata/action.txt'); //console.log(res); 
	await actionLoadAll(); console.log(M.actions)
}
async function onclickSetAvatar(ev) { await simpleSetAvatar(UI.selectedImages[0]); }
async function onclickSettAddYourTheme() {
	let nameEntered = await mGather(iDiv(UI.commands.settAddYourTheme));
	let name = normalizeString(nameEntered);
	let ohne = replaceAll(name, '_', '');
	if (isEmpty(ohne)) { showMessage(`name ${nameEntered} is not valid!`); return; }
	let o = {};
	for (const s of ['color', 'texture', 'blendMode', 'fg']) {
		if (isdef(U[s])) o[s] = U[s];
	}
	o.name = name;
	let themes = lookup(Serverdata.config, ['themes']);
	let key = isdef(themes[name]) ? rUniqueId(6, 'th') : name;
	Serverdata.config.themes[key] = o;
	await mPostRoute('postConfig', Serverdata.config);
	await onclickSettTheme();
}
async function onclickSettBlendMode() {
	if (isEmpty(U.texture)) {
		showMessage('You need to set a Texture in order to set a Blend Mode!');
		return;
	}
	localStorage.setItem('settingsMenu', 'settBlendMode')
	showBlendModes();
}
async function onclickSettColor() {
	localStorage.setItem('settingsMenu', 'settColor')
	await showColors();
}
async function onclickSettDeleteTheme() {
	let nameEntered = await mGather(iDiv(UI.commands.settDeleteTheme));
	let name = normalizeString(nameEntered);
	if (!lookup(Serverdata.config, ['themes', name])) { showMessage(`theme ${name} does not exist!`); return; }
	delete Serverdata.config.themes[name];
	await mPostRoute('postConfig', Serverdata.config);
	await onclickSettTheme();
}
async function onclickSettFg() {
	localStorage.setItem('settingsMenu', 'settFg')
	await showTextColors();
}
async function onclickSettMyTheme() {
	localStorage.setItem('settingsMenu', 'settMyTheme')
	let dSettings = mBy('dSettingsMenu'); mClear(dSettings);
	let d = mDom(dSettings, { h: '100vh', bg: U.color })
	let dOuter = mDom(d, { padding: 25 }); // { padding: 10, gap: 10, margin:'auto', w:500, align:'center', bg:'white' }); //mCenterFlex(dParent);
	mCenterFlex(dOuter)
	let ui = await uiTypePalette(dOuter, U.color, U.fg, U.texture, U.blendMode);
}
async function onclickSettRemoveTexture() {
	if (isEmpty(U.texture)) return;
	for (const prop of ['texture', 'palette', 'blendMode', 'bgImage', 'bgSize', 'bgBlend', 'bgRepeat']) delete U[prop];
	await updateUserTheme();
}
async function onclickSettResetAll() {
	assertion(isdef(DA.settings), "NO DA.settings!!!!!!!!!!!!!!!")
	if (JSON.stringify(U) == JSON.stringify(DA.settings)) return;
	U = jsCopy(DA.settings);
	await postUserChange(U, true);
	setUserTheme();
	await settingsOpen();
	settingsCheck();
}
async function onclickSettTexture() {
	localStorage.setItem('settingsMenu', 'settTexture')
	await showTextures();
}
async function onclickSettTheme() {
	localStorage.setItem('settingsMenu', 'settTheme')
	await showThemes();
}
async function onclickSimple() {
	let name = valf(localStorage.getItem('sisi'), 'tierspiel'); //console.log(name);
	simpleSidebar(150);
	mAdjustPage(150);
	let div = mDom100('dMain');
	let sisi = UI.simple = { name, div };
	let [w, h, bg, fg] = [sisi.w, sisi.h, sisi.bg, sisi.fg] = [mGetStyle(div, 'w'), mGetStyle(div, 'h'), getNavBg(), getThemeFg()];
	let d1 = mDom(div); mCenterFlex(d1)
	let dMenu = sisi.dMenu = mDom(d1, { gap: 10, padding: 12 }, { className: 'title' }); mFlexVWrap(dMenu);
	let dInstruction = sisi.dInstruction = mDom(d1, { w100: true, align: 'center', fg }, { html: '* press Control key when hovering to magnify image! *' })
	let dBatch = sisi.dBatch = mDom(d1);
	let cellStyles = { bg, fg: 'contrast', box: true, margin: 8, w: 128, h: 128, overflow: 'hidden' };
	let o = createBatchGridCells(dBatch, w * .9, h * .9, cellStyles);
	addKeys(o, sisi);
	mStyle(dInstruction, { w: mGetStyle(sisi.dGrid, 'w') });
	mLinebreak(d1)
	sisi.dPageIndex = mDom(d1, { fg });
	simpleInit(name, sisi);
	sisi.isOpen = true;
	sisi.dInstruction.innerHTML = '* press Ctrl while hovering over an image for details *'; //'* drag images into the shaded area *'
	let grid = sisi.dGrid;
	mStyle(grid, { bg: '#00000030' })
	enableDataDrop(grid, simpleOnDropImage)
}
async function onclickSimpleClearSelections(ev) { simpleClearSelections(); }
async function onclickSimpleNew(name) {
	let cmd = lookup(UI.commands, ['simpleNew']); assertion(cmd, "UI.commands.simpleNew!!!!!")
	if (nundef(name)) name = await mGather(iDiv(cmd));
	if (!name) return;
	name = normalizeString(name);
	if (isEmpty(name)) {
		showMessage(`ERROR! you need to enter a valid name!!!!`);
		return;
	}
	if (M.collections.includes(name)) {
		showMessage(`collection ${name} already exists!`);
	}
	M.collections.push(name); M.collections.sort();
	if (name != UI.simple) simpleInit(name, UI.simple);
}
async function onclickSimpleRemove() {
	let selist = UI.selectedImages;
	let di = {};
	for (const key of selist) {
		let collname = UI.simple.name;
		if (simpleLocked(collname)) continue;
		let item = M.superdi[key];
		removeInPlace(item.colls, collname);
		di[key] = item;
	}
	if (isEmpty(di)) {
		showMessage(`ERROR: cannot delete selected items!!!`);
		simpleClearSelections();
		return;
	}
	await updateSuperdi(di);
	simpleInit()
}
async function onclickSimpleSelectAll(ev) {
	let sisi = UI.simple;
	for (const cell of sisi.cells) {
		let d = cell.firstChild;
		if (nundef(d)) break;
		mSelect(d);
	}
	for (const k of sisi.keys) { addIf(UI.selectedImages, k); }
	simpleCheckCommands();
}
async function onclickSimpleSelectPage(ev) {
	let sisi = UI.simple;
	for (const cell of sisi.cells) {
		let d = cell.firstChild;
		if (nundef(d)) break;
		mSelect(d);
		let o = sisi.items[d.id];
		addIf(UI.selectedImages, o.key);
	}
	simpleCheckCommands();
}
async function onclickSleeping(ev) {
	let elem = hToggleClassMenu(ev);
	let res = await mPhpDeleteFile('zdata/action.txt'); //relative path
	clearTimeouts(); mClear('dMain'); DA.stopwatch = null;
	console.log(res);
}
async function onclickTable(id) { DA.id = id; await switchToMenu('table'); }
async function onclickTableDelete(id) {
	let res = await mPhpPost('all', { action: 'deletey', file: `tables/${id}` });
	console.log('res', res);
}
async function onclickTableJoin(id) {
	let tData = jsCopy(M.tables[id]);
	let me = UGetName(); console.log('me', me)
	assertion(tData.status == 'open', 'too late to join! game has already started!')
	assertion(!tData.playerNames.includes(me), `${me} already joined!!!`);
	tData.players[me] = createGamePlayer(me, tData.game);
	tData.playerNames.push(me);
	let res = await mPhpPost('all', { action: 'savey', file: `tables/${id}`, o: tData });
	console.log('res', res);
}
async function onclickTableLeave(id) {
	let tData = jsCopy(M.tables[id]);
	let me = UGetName();
	assertion(tData.status == 'open', 'too late to leave! game has already started!')
	assertion(tData.playerNames.includes(me), `${me} NOT in joined players!!!!`);
	delete tData.players[me];
	removeInPlace(tData.playerNames, me);
	let res = await mPhpPost('all', { action: 'savey', file: `tables/${id}`, o: tData });
	console.log('res', res);
}
async function onclickTableMenu() {
	let id = getTid();
	if (nundef(id)) {
		let me = UGetName();
		let table = Serverdata.tables.find(x => x.status == 'started' && x.turn.includes(me));
		if (nundef(table)) table = Serverdata.tables.find(x => x.status == 'started' && x.playerNames.includes(me));
		if (nundef(table)) table = Serverdata.tables.find(x => x.status != 'open' && x.playerNames.includes(me));
		if (nundef(table)) table = Serverdata.tables.find(x => x.status != 'open');
		if (isdef(table)) id = table.id;
	}
	if (isdef(id)) { Tid = null; await showTable(id); } else await switchToMainMenu('play');
}
async function onclickTableStart(id) {
	console.log(arguments.callee.name, arguments);
	let tData = M.tables[id];
	if (!tData) { showMessage('table deleted!'); return await showGamesAndTables(); }
	tData = setTableToStarted(tData);
	let res = await mPhpPost('all', { action: 'savey', file: `tables/${id}`, o: tData });
	console.log('res', res);
}
async function onclickTextColor(fg) {
	let hex = colorToHex79(fg);
	U.fg = hex;
	await updateUserTheme();
}
async function onclickTexture(item) {
	U.texture = pathFromBgImage(item.bgImage);
	await updateUserTheme();
}
async function onclickThemeSample(ev) {
	let key = evToAttr(ev, 'theme');
	let theme = jsCopyExceptKeys(Serverdata.config.themes[key], ['name']);
	copyKeys(theme, U);
	await updateUserTheme();
}
async function onclickThinking(ev) {
	let w = DA.stopwatch;
	let key = 'thinking_face';
	if (isdef(w)) {
		if (w.key == key) { return; }
		else if (w.key == 'sleeping') { key = 'sleeping'; }
	}
	console.log(key, w.key);
	let isActive = key == w.key;
	console.log(res);
}
async function onclickUser() {
	let uname = await mGather(iDiv(UI.nav.commands.user), { w: 100, margin: 0 }, { content: 'username', align: 'br', placeholder: ' <username> ' });
	if (!uname) return;
	await switchToUser(uname);
}
async function onclickWatch() { }
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
function onenterHex(item, board) {
	colorSample(board.dSample, item.color);
}
function onleaveHex(item, board) {
	let selitem = board.items.find(x => x.isSelected == true);
	if (nundef(selitem)) return;
	colorSample(board.dSample, selitem.color);
}
function p5ClearAll() { clearTimeouts(); mClear('dMain'); DA.stopwatch = null; }
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
function playerStatCount(key, n, dParent, styles = {}, opts = {}) {
	let sz = valf(styles.sz, 16);
	addKeys({ display: 'flex', margin: 4, dir: 'column', hmax: 2 * sz, 'align-content': 'center', fz: sz, align: 'center' }, styles);
	let d = mDom(dParent, styles);
	let o = M.superdi[key];
	console.log('hallooooooooooooooooooo', typeof key, isFilename(key), isdef(o), 'sz', sz)
	if (typeof key == 'function') key(d, { w: '100%', fg: 'grey' });
	else if (isFilename(key)) mKey(key, d, { w: '100%', fg: 'grey' }, opts);
	else if (isColor(key)) mDom(d, { bg: key, fz: sz, w: '100%', fg: key }, { html: ' ' });
	else if (isdef(o)) mKey(key, d, { hmax: sz, w: '100%', fg: 'grey' }, opts);
	else mText(key, d, { fz: sz, w: '100%' });
	d.innerHTML += `<span ${isdef(opts.id) ? `id='${opts.id}'` : ''} style="font-weight:bold;color:inherit">${n}</span>`;
	return d;
}
async function pollAndShow() {
	if (isdef(DA.bPoll)) {
		DA.bPoll.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500 });
	}
	let restartAfterPoll = DA.pollIntervalChanged == true;
	if (DA.pollIntervalChanged) {
		await pollStop();
	}
	if (DA.menu == 'games') {
		await showGamesAndTables();
	} else if (DA.menu == 'table') {
		await showTable();
	}
	if (isdef(DA.bPoll)) DA.bPoll.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500 });
	if (restartAfterPoll) { pollStart(); }
}
function pollStart() {
	if (isdef(TO.poll)) return;
	DA.pollIntervalChanged = false;
	console.log('polling started', DA.pollInterval);
	TO.poll = setInterval(pollAndShow, DA.pollInterval);
}
async function pollStop() {
	if (!TO.poll) return;
	clearInterval(TO.poll); if (VERBOSE) console.log('polling stopped', TO.poll);
	DA.pollIntervalChanged = false;
	await mSleep(100);
	TO.poll = null;
	await mSleep(400);
}
async function postUsers() {
	let users = jsonToYaml(M.users);
	let res = await mPhpPost('all', { action: 'savey', file: 'users', o: M.users });
	console.log('res', res);
}
function presentStandardBGA() {
	let dTable = mDom('dMain');
	mClass('dPage', 'wood');
	let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dTable); mFlexWrap(dOpenTable)
	mDom(dRechts, {}, { id: 'dStats' });
}
function presentStandardRoundTable() {
	d = mDom('dMain'); mCenterFlex(d);
	mDom(d, { className: 'instruction' }, { id: 'dInstruction' }); mLinebreak(d); // instruction
	mDom(d, {}, { id: 'dStats' }); mLinebreak(d);
	let minTableSize = 400;
	let dTable = mDom(d, { hmin: minTableSize, wmin: minTableSize, margin: 20, round: true, className: 'wood' }, { id: 'dTable' });
	mCenterCenter(dTable);
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
function registerAction(key, fromState, toState) {
	let t1 = getNow();
	let t = DA.toggle[key];
	if (nundef(t.timer)) {
		t.timer = mDom(t.elem.parentNode, { bg: 'white', fg: 'black', wmin: 200, }, { html: '&nbsp;' });
	}
}
function removeAllEvents(elem) {
	const newElement = elem.cloneNode(true);
	elem.parentNode.replaceChild(newElement, elem);
	return newElement;
}
function removeInPlace(arr, el) {
	arrRemovip(arr, el);
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
		if (oldOpts[p] != opts[p]) { console.log('change:', p, oldOpts[p], opts[p]); changed = true; break; }
	}
	if (changed) {
		let games = valf(MGetUser(name).games, {});
		games[gamename] = opts;
		let res = await postUsers();
	}
}
async function saveDataFromPlayerOptionsUI(gamename) {
	let id = 'dPlayerOptions';
	let lastAllPl = DA.lastAllPlayerItem;
	let dold = mBy(id);
	if (isdef(dold)) { await saveAndUpdatePlayerOptions(lastAllPl, gamename); dold.remove(); }
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
function setColors(item) {
	let bg = item.color;
	let fg = item.fg ?? colorIdealText(bg);
	mStyle('dPage', { bg, fg });
}
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
async function setPlayerNotPlaying(item, gamename) {
	await saveDataFromPlayerOptionsUI(gamename);
	removeInPlace(DA.playerList, item.name);
	mRemoveIfExists('dPlayerOptions');
	unselectPlayerItem(item);
}
async function setPlayerPlaying(allPlItem, gamename) {
	let [name, da] = [allPlItem.name, allPlItem.div];
	addIf(DA.playerList, name);
	highlightPlayerItem(allPlItem);
	await saveDataFromPlayerOptionsUI(gamename);
	let id = 'dPlayerOptions';
	DA.lastAllPlayerItem = allPlItem;
	let poss = MGetGamePlayerOptions(gamename);
	if (nundef(poss)) return;
	let dParent = mBy('dGameMenu');
	let bg = MGetUserColor(name);
	let rounding = 6;
	let d1 = mDom(dParent, { bg: colorLight(bg, 50), border: `solid 2px ${bg}`, rounding, display: 'inline-block', hPadding: 3, rounding }, { id });
	mDom(d1, {}, { html: `${name}` }); //title
	d = mDom(d1, {}); mCenterFlex(d);
	mCenterCenter(d);
	for (const p in poss) {
		let key = p;
		let val = poss[p];
		if (isString(val)) {
			let list = val.split(',');
			let legend = formatLegend(key);
			let fs = mRadioGroup(d, { fg: 'black' }, `d_${key}`, legend);
			let handler = key == 'playmode' ? updateUserImageToBotHuman(name) : null;
			for (const v of list) { let r = mRadio(v, isNumber(v) ? Number(v) : v, key, fs, { cursor: 'pointer' }, handler, key, false); }
			let userval = lookup(DA.allPlayers, [name, p]);
			let chi = fs.children;
			for (const ch of chi) {
				let id = ch.id;
				if (nundef(id)) continue;
				let radioval = stringAfterLast(id, '_');
				if (isNumber(radioval)) radioval = Number(radioval);
				if (userval == radioval) ch.firstChild.checked = true;
				else if (nundef(userval) && `${radioval}` == arrLast(list)) ch.firstChild.checked = true;
			}
			measureFieldset(fs);
		}
	}
	let r = getRectInt(da, mBy('dGameMenu'));
	let rp = getRectInt(d1);
	let [y, w, h] = [r.y - rp.h - 4, rp.w, rp.h];
	let x = r.x - rp.w / 2 + r.w / 2;
	if (x < 0) x = r.x - 22;
	if (x > window.innerWidth - w - 100) x = r.x - w + r.w + 14;
	mIfNotRelative(dParent);
	mPos(d1, x, y);
	mButtonX(d1, ev => saveAndUpdatePlayerOptions(allPlItem, gamename), 18, 3, 'dimgray');
}
function setPlayersToMulti() {
	for (const name in DA.allPlayers) {
		lookupSetOverride(DA.allPlayers, [name, 'playmode'], 'human');
		updateUserImageToBotHuman(name, 'human');
	}
	setRadioValue('playmode', 'human');
}
function setPlayersToSolo() {
	for (const name in DA.allPlayers) {
		if (name == UGetName()) continue;
		lookupSetOverride(DA.allPlayers, [name, 'playmode'], 'bot');
		updateUserImageToBotHuman(name, 'bot');
	}
	let popup = mBy('dPlayerOptions');
	if (isdef(popup) && popup.firstChild.innerHTML.includes(UGetName())) return;
	setRadioValue('playmode', 'bot');
}
function setTableToStarted(table) {
	table.status = 'started';
	table.step = 0;
	table.moves = [];
	table.fen = DA.funcs[table.game].setup(table);
	return table;
}
function setTexture(item) {
	let bgImage = valf(item.bgImage, bgImageFromPath(item.texture), '');
	let bgBlend = valf(item.bgBlend, item.blendMode, '');
	let bgSize = bgImage.includes('marble') || bgImage.includes('wall') ? '100vw 100vh' : '';
	let bgRepeat = 'repeat';
	mStyle('dPage', { bgImage, bgBlend, bgSize, bgRepeat });
}
function setTheme(item) {
	setColors(item);
	setTexture(item);
}
function setgame() {
	function setup(table) {
		let fen = {};
		for (const name in table.players) {
			let pl = table.players[name];
			pl.score = 0;
		}
		fen.deck = setCreateDeck();
		fen.cards = deckDeal(fen.deck, table.options.numCards);
		table.plorder = jsCopy(table.playerNames);
		table.turn = jsCopy(table.playerNames);
		return fen;
	}
	function prepLayout(table) { presentStandardRoundTable(table); }
	async function stats(table) {
		let [me, players] = [UGetName(), table.players];
		let style = { patop: 8, mabottom: 20, wmin: 80, hmin: 90, bg: 'beige', fg: 'contrast' };
		let player_stat_items = await uiTypePlayerStats(table, me, 'dStats', 'rowflex', style);
		return;
		for (const plname in players) {
			let pl = players[plname];
			let item = player_stat_items[plname];
			if (pl.playmode == 'bot') { mStyle(item.img, { rounding: 0 }); }
			let d = iDiv(item); mCenterFlex(d); mLinebreak(d); mIfNotRelative(d);
			playerStatCount('star', pl.score, d); //, {}, {id:`stat_${plname}_score`});
		}
	}
	function present(table) {
		const colors = { red: '#e74c3c', green: '#27ae60', purple: 'indigo' };
		setLoadPatterns('dPage', colors);
		let fen = table.fen;
		mStyle('dTable', { padding: 50, wmin: 500 });
		let d = mDom('dTable', { gap: 10, padding: 0 }); mCenterFlex(d);
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
		return items;
	}
	async function activate(table, items) {
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
	function setCreateDeck() {
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
		mStyle(d0, { justify: 'center', 'align-items': 'center', gap: 6 })
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
		let html = `
      <svg id="setpatterns" width="0" height="0">
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
		clearEvents();
		mShield('dTable', { bg: 'transparent' });
		let id = table.id;
		let step = table.step;
		let oset = setFindOneSet(items);
		if (!oset) {
			table.players[name].score += 1;
			let fen = table.fen;
			let newCards = deckDeal(fen.deck, 1);
			if (!isEmpty(newCards)) fen.cards.push(newCards[0]); else return await gameoverScore(table);
		} else {
			table.players[name].score -= 1;
		}
		lookupAddToList(table, ['moves'], { step, name, move: ['noSet'], change: oset ? '-1' : '+1', score: table.players[name].score });
		let o = { id, name, step, table };
		if (!oset) o.stepIfValid = step + 1;
		let res = await mPostRoute('table', o); //console.log(res);
	}
	async function evalMove(name, table, keys) {
		clearEvents();
		mShield('dTable', { bg: 'transparent' });
		let id = table.id;
		let step = table.step;
		let isSet = setCheckIfSet(keys);
		if (isSet) {
			table.players[name].score += 1;
			let fen = table.fen;
			let toomany = Math.max(0, fen.cards.length - table.options.numCards);
			let need = Math.max(0, 3 - toomany);
			let newCards = deckDeal(fen.deck, need);
			for (let i = 0; i < 3; i++) if (i < newCards.length) arrReplace1(fen.cards, keys[i], newCards[i]); else removeInPlace(fen.cards, keys[i]);
		} else {
			table.players[name].score -= 1;
		}
		lookupAddToList(table, ['moves'], { step, name, move: keys, change: isSet ? '+1' : '-1', score: table.players[name].score });
		let o = { id, name, step, table };
		if (isSet) o.stepIfValid = step + 1;
		let res = await mPostRoute('table', o); //console.log(res);
	}
	return { prepLayout, setup, present, stats, activate, hasInstruction: false };
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
function showChatMessage(o) {
	let d = mBy('dChatWindow'); if (nundef(d)) return;
	if (o.user == UGetName()) mDom(d, { align: 'right' }, { html: `${o.msg}` })
	else mDom(d, { align: 'left' }, { html: `${o.user}: ${o.msg}` })
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
	mDom(dMenu, { maleft: 12 }, { html: `<h2>game options</h2>` });
	let style = { display: 'flex', justify: 'center', w: '100%', gap: 10, matop: 6 };
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
	if (isdef(inpsolo)) inpsolo.onclick = setPlayersToSolo;
	if (isdef(inpmulti)) inpmulti.onclick = setPlayersToMulti;
}
async function showGamePlayers(dParent, users) {
	let me = UGetName();
	mStyle(dParent, { wrap: true });
	let userlist = ['amanda', 'felix', 'mimi'];
	for (const name in users) addIf(userlist, name);
	for (const name of userlist) {
		let d = mDom(dParent, { align: 'center', padding: 2, cursor: 'pointer', border: `transparent` });
		let img = showUserImage(name, d, 40);
		let label = mDom(d, { matop: -4, fz: 12, hline: 12 }, { html: name });
		d.setAttribute('username', name)
		d.onclick = onclickGameMenuPlayer;
		let item = userToPlayer(name, DA.gamename); item.div = d; item.isSelected = false;
		DA.allPlayers[name] = item;
	}
	await showGameMenuPlayerDialog(me);
}
function showGameover(table, dParent) {
	let winners = table.winners;
	let msg = winners.length > 1 ? `GAME OVER - The winners are ${winners.join(', ')}!!!` : `GAME OVER - The winner is ${winners[0]}!!!`;
	let d = showRibbon(dParent, msg);
	updateTestButtonsLogin(table.playerNames);
	mDom(d, { h: 12 }, { html: '<br>' })
	mButton('PLAY AGAIN', () => onclickTableStart(table.id), d, { fz: 24 });
}
async function showGamesAndTables(force = false) {
	function showGames(dParent) {
		mText(`<h2>games</h2>`, dParent, { maleft: 12 });
		let d = mDom(dParent, { fg: 'white' }, { id: 'game_menu' }); mCenterCenterFlex(d); //mFlexWrap(d);
		let gamelist = DA.gamelist;
		for (const gname of gamelist) {
			let g = MGetGame(gname);
			let bg = g.color;
			let d1 = mDom(d, { cursor: 'pointer', rounding: 10, margin: 10, padding: 0, patop: 10, w: 140, height: 100, bg, position: 'relative' }, { id: g.id });
			d1.setAttribute('gamename', gname);
			d1.onclick = onclickGameMenuItem;
			mCenterFlex(d1);
			let o = M.superdi[g.logo];
			let fg = colorIdealText(bg);
			let el = mDom(d1, { matop: 0, mabottom: 6, fz: 65, hline: 65, family: 'emoNoto', fg, display: 'inline-block' }, { html: o.text });
			mLinebreak(d1);
			mDom(d1, { fz: 18, align: 'center', fg }, { html: capitalize(g.friendly) });
		}
	}
	function showTables(dParent, tables, me) {
		mText(`<h2>tables</h2>`, dParent, { maleft: 12 });
		if (isEmpty(tables)) { mDom(dParent, { maleft: 12, fz: 24, fg: 'blue' }, { html: 'no active game tables' }); return; }
		let t = UI.tables = mDataTable(tables, dParent, null, ['friendly', 'game_friendly', 'playerNames'], 'tables', false);
		mTableCommandify(t.rowitems.filter(ri => ri.o.status != 'open'), {
			0: (item, val) => hFunc(val, 'onclickTable', item.o.id, item.id),
		});
		mTableStylify(t.rowitems.filter(ri => ri.o.status == 'open'), { 0: { fg: 'blue' }, });
		let d = iDiv(t);
		for (const ri of t.rowitems) {
			let r = iDiv(ri);
			let id = ri.o.id;
			if (ri.o.prior == 1) mDom(r, {}, { tag: 'td', html: getWaitingHtml(24) });
			if (ri.o.status == 'open') {
				let playerNames = ri.o.playerNames;
				if (playerNames.includes(me)) {
					if (ri.o.owner != me) {
						let h1 = hFunc('leave', 'onclickTableLeave', ri.o.id); let c = mAppend(r, mCreate('td')); c.innerHTML = h1;
					}
				} else {
					let h1 = hFunc('join', 'onclickTableJoin', ri.o.id); let c = mAppend(r, mCreate('td')); c.innerHTML = h1;
				}
			}
			if (ri.o.owner != me) continue;
			let h = hFunc('delete', 'onclickTableDelete', id); let c = mAppend(r, mCreate('td')); c.innerHTML = h;
			if (ri.o.status == 'open') { let h1 = hFunc('start', 'onclickTableStart', id); let c1 = mAppend(r, mCreate('td')); c1.innerHTML = h1; }
		}
		return tables;
	}
	let dParent = mBy('dTableList');
	if (nundef(dParent)) { mClear('dMain'); dParent = mDom('dMain', {}, { className: 'section', id: 'dTableList' }); }
	M.tables = await MPollTables();
	let tables = dict2list(M.tables);
	let me = UGetName();
	tables.map(x => x.prior = x.status == 'open' ? 0 : x.turn.includes(me) ? 1 : x.playerNames.includes(me) ? 2 : 3);
	sortBy(tables, 'prior');
	tables.map(x => x.game_friendly = capitalize(MGetGameFriendly(x.game)));
	let changes = deepCompare(DA.tableList, tables);
	DA.tableList = tables;
	if (changes || force) {
		mClear(dParent);
		showTables(dParent, tables, me);
		dParent = mBy('dGameList');
		if (isdef(dParent)) { mClear(dParent); }
		else { dParent = mDom('dMain', {}, { className: 'section', id: 'dGameList' }); }
		showGames(dParent);
		if (VERBOSE) console.log('games & tables: UPDATED!!!');
	} else if (VERBOSE) console.log('games & tables: no change');
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
function showMeeple(d, pMeeple) {
	lacunaDrawPoints(d, [pMeeple], false);
	let color = getPlayerProp('color', pMeeple.owner); //console.log('color', color)
	let letter = pMeeple.owner[0].toUpperCase();
	mStyle(iDiv(pMeeple), { border: `${color} 5px solid` });
	iDiv(pMeeple).innerHTML = letter;
}
async function showMenuButtons() {
	let d = mBy('dTopLeft'); mClass(d, 'button_container'); //mFlex(d); // mStyle(d, { display: 'flex', vStretch: true, gap: 10, padding: 4, box: true }); //, box:true, vStretch:true, hCenter: true, padding: 10, gap: 10 }) //mClass(d,'flex')
	mDom(d, {}, { tag: 'button', html: 'games', onclick: switchToMenu, menu: 'top', key: 'games' });
	mDom(d, {}, { tag: 'button', html: 'table', onclick: switchToMenu, menu: 'top', key: 'table' });
}
function showMessage(msg, ms = 3000) {
	let d = mBy('dMessage');
	let isPopup = nundef(d);
	if (nundef(d)) d = mPopup(); d.id = 'dMessage';
	mStyle(d, { h: 21, bg: 'red', fg: 'yellow' });
	d.innerHTML = msg;
	clearTimeout(TO.message);
	TO.message = setTimeout(() => clearMessage(isPopup), ms)
}
function showNavbar() {
	let nav = mMenu('dNav');
	let commands = {};
	commands.home = menuCommand(nav.l, 'nav', 'home', 'HOME', showDashboard, menuCloseHome);
	commands.settings = menuCommand(nav.l, 'nav', 'settings', null, settingsOpen, menuCloseSettings);
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
function showRibbon(dParent, msg) {
	let d = mBy('ribbon'); if (isdef(d)) d.remove();
	let bg = `linear-gradient(270deg, #fffffd, #00000080)`
	d = mDom(dParent, { bg, mabottom: 10, align: 'center', vPadding: 10, fz: 30, w100: true }, { html: msg, id: 'ribbon' });
	return d;
}
async function showTable(force = false) {
	function updateUI() {
		const area = mBy('dMain');
		area.innerHTML = '<pre>' + JSON.stringify(DA.gameState, null, 2) + '</pre>';
		if (VERBOSE) console.log("table UPDATED!!!"); //, DA.gameState);
	}
	let res = await fetch(`${DA.backendURL}/get_state.php`);
	if (!res.ok) {
		console.error('Error fetching game state:', res.statusText);
		return null;
	}
	let state = await res.json();
	if (force || JSON.stringify(state) !== JSON.stringify(DA.gameState)) {
		DA.gameState = state;
		updateUI();
	} else if (VERBOSE) console.log("table no change");
	return DA.gameState;
}
async function showTestButtons() {
	let d = mBy('dTestLeft'); mClass(d, 'button_container');
	DA.pollStates = states = [{ color: 'green', blink: false, f: pollStart }, { color: 'red', blink: false, f: pollStop },];
	let b = DA.bPoll = mToggleColorButton(d, {}, { html: 'poll:' }, states);
	mDom(d, {}, { tag: 'button', html: 'delete', onclick: tablesDeleteAll });
	mDom(d, {}, { tag: 'button', html: 'flask', onclick: testFlask });
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
async function showThemes() {
	let d = mBy('dSettingsMenu'); mClear(d);
	let d1 = mDom(d, { gap: 12, padding: 10 }); mFlexWrap(d1);
	let themes = lookup(Serverdata.config, ['themes']);
	let bgImage, bgSize, bgRepeat, bgBlend, name, color, fg;
	for (const key in themes) {
		let th = themes[key];
		if (isdef(th.texture)) {
			bgImage = bgImageFromPath(th.texture);
			bgRepeat = (bgImage.includes('marble') || bgImage.includes('wall')) ? 'no-repeat' : 'repeat';
			bgSize = (bgImage.includes('marble') || bgImage.includes('wall')) ? 'cover' : '';
			bgBlend = isdef(th.blendMode) ? th.blendMode : (bgImage.includes('ttrans') ? 'normal' : bgImage.includes('marble_') ? 'luminosity' : 'multiply');
		}
		color = th.color;
		if (isdef(th.fg)) fg = th.fg;
		name = th.name;
		let [realBg, bgContrast, bgNav, fgNew, fgContrast] = calculateGoodColors(color, fg)
		let styles = { w: 300, h: 200, bg: realBg, fg: fgNew, border: `solid 1px ${getCSSVariable('--fgButton')}` };
		if (isdef(bgImage)) addKeys({ bgImage, bgSize, bgRepeat }, styles);
		if (isdef(bgBlend)) addKeys({ bgBlend }, styles);
		let dsample = mDom(d1, styles, { theme: key });
		let dnav = mDom(dsample, { bg: bgNav, padding: 10 }, { html: name.toUpperCase() });
		let dmain = mDom(dsample, { padding: 10, fg: 'black', className: 'section' }, { html: getMotto() });
		dsample.onclick = onclickThemeSample;
	}
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
function showTitleGame(table) {
	let d = mBy('dTitle'); mClear(d);
	let html = `${MGetGame(table.game).friendly.toUpperCase()}: ${table.friendly}`;
	mDom(d, { maleft: 10, family: 'algerian' }, { html });
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
async function showUserImage(uname, d, sz = 40) {
	let u = MGetUser(uname);
	let key = u.imgKey;
	let m = M.superdi[key];
	if (nundef(m)) {
		key = 'unknown_user';
	}
	return await mKey(key, d, { 'object-position': 'center top', 'object-fit': 'cover', h: sz, w: sz, round: true, border: `${u.color} 3px solid` });
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
function sortDatesDescending(dates) {
	return dates.sort((a, b) => new Date(b) - new Date(a));
}
async function start() { await test0_p5(); }
function startGame(gameName, players = ["Player1"], options = {}) {
	DA.socket.emit("start_game", {
		gamename: gameName,
		players: players,
		options: options
	});
}
function startSelectedGame() {
	const game = document.getElementById("gameSelect").value;
	startGame(game, ["Alice", "Bob"]);
}
function startsWith(s, sSub) {
	return s.substring(0, sSub.length) == sSub;
}
function staticTitle(table) {
	clearInterval(TO.titleInterval);
	let url = window.location.href;
	let loc = url.includes('moxito') ? '' : '(local)';
	let game = isdef(table) ? lastWord(table.friendly) : '♠ Moxito ♠';
	document.title = `${loc} ${game}`;
}
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
async function switchToMenu(evOrMenu) {
	let ev = evOrMenu, menu = null;
	if (isString(evOrMenu)) {
		ev = { target: getElementWithAttribute('key', evOrMenu) };
		menu = evOrMenu;
	}
	let [prevElem, elem] = hToggleClassMenu(ev);
	if (prevElem == elem) { if (VERBOSE) console.log('same!!!'); return; }
	else if (isdef(prevElem)) DA.pollIntervalChanged = true;
	menu = valf(menu, elem.getAttribute('key'), DA.menu, localStorage.getItem('menu'), 'games');
	DA.pollCounter = 0;
	DA.menu = menu;
	switch (menu) {
		case 'games': await showGamesAndTables(true); DA.pollCounter = 0; DA.pollInterval = 3000; break;
		case 'table': await showTable(true); DA.pollCounter = 0; DA.pollInterval = 1500; break;
	}
	localStorage.setItem('menu', menu);
}
async function switchToUser(username) {
	if (!isEmpty(username)) username = normalizeString(username);
	if (isEmpty(username)) username = 'guest';
	let res = await mPhpPost('all', { username, action: 'login' });
	U = res.userdata;
	DA.tid = localStorage.getItem('tid');
	let bg = U.color;
	let fg = colorIdealText(bg);
	mClear('dTopRight');
	mDom('dTopRight', { display: 'inline', h: '80%', bg, fg }, { tag: 'button', html: `${username}` });
	localStorage.setItem('username', username);
	setTheme(U);
}
function sysBusy() { DA.prevSysState = DA.sysState; DA.sysState = 'idle'; }
function sysIdle() { DA.prevSysState = DA.sysState; DA.sysState = 'busy'; }
function sysInit() {
	DA.evList = [];
	DA.pollms = { lobby: 3000, table: { myMove: 1000, otherMove: 2000 } };
	DA.pollCounter = 0;
}
function sysPolling() { DA.prevSysState = DA.sysState; DA.sysState = 'polling'; }
function tableGameover() { DA.prevTableState = DA.tableState; DA.tableState = 'gameOver'; }
async function tableGetDefault(tid = null, tData = null) {
	if (nundef(tid)) tid = valf(DA.tid, localStorage.getItem('tid'), arrLast(Object.keys(M.tables)));
	console.log(tid)
	if (nundef(tid)) return null;
	if (nundef(tData)) { tData = valf(DA.tData, await loadStaticYaml(`y/tables/${tid}.yaml`)); }
	[DA.tid, DA.tData] = [tid, tData];
	return tData ? { tid, tData } : null;
}
async function tableHasChanged() {
}
async function tableLoad(tid) {
	let o = await tableGetDefault(tid);
	if (!o) { console.log('no table found!'); return null; }
	tid = o.tid;
	let tData = o.tData;
	console.log('table loaded', tData);
	localStorage.setItem('tid', tid);
	M.tables[tid] = tData;
	return tData;
}
function tableMyMove() { DA.prevTableState = DA.tableState; DA.tableState = 'mymove'; }
function tableNone() { DA.prevTableState = DA.tableState; DA.tableState = 'none'; }
function tableOpen() { DA.prevTableState = DA.tableState; DA.tableState = 'open'; }
function tableOtherMove() { DA.prevTableState = DA.tableState; DA.tableState = 'othermove'; }
function tablePresent(tData) {
	console.log('PRESENT!!!!');
	let title = fromNormalized(tData.friendly);
	mClear('dTopLeft');
	mDom('dTopLeft', { family: 'algerian', maleft: 10 }, { html: title });
	mClear('dMain')
	mDom('dMain', { bg: 'white', fg: 'black' }, { tag: 'pre', html: jsonToYaml(tData) });
}
async function tablesDeleteAll() {
	let res = await mPhpPost('all', { action: 'delete_dir', dir: 'tables' });
	if (VERBOSE) console.log('res', res);
	DA.tid = null;
	DA.tData = null;
	localStorage.removeItem('tid');
	M.tables = {};
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
function toggleSelection(item, selectList, atmost, className = 'framedPicture') {
	let ui = iDiv(item);
	item.isSelected = !item.isSelected;
	if (item.isSelected) mClass(ui, className); else mClassRemove(ui, className);
	if (nundef(selectList)) return;
	if (item.isSelected) {
		console.assert(!selectList.includes(item), 'UNSELECTED PIC IN PICLIST!!!!!!!!!!!!')
		selectList.push(item);
	} else {
		console.assert(selectList.includes(item), 'PIC NOT IN PICLIST BUT HAS BEEN SELECTED!!!!!!!!!!!!')
		removeInPlace(selectList, item);
	}
	if (isNumber(atmost)) {
		while (selectList.length > atmost) {
			let pic = selectList.shift();
			pic.isSelected = false;
			let ui = iDiv(pic);
			mClassRemove(ui, className);
		}
	}
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
async function uiTypePlayerStats(table, me, dParent, layout, styles = {}) {
	let dOuter = mDom(dParent, { matop: 8 }); dOuter.setAttribute('inert', true); console.log(dOuter);
	if (layout == 'rowflex') mStyle(dOuter, { display: 'flex', justify: 'center' });
	else if (layout == 'col') mStyle(dOuter, { display: 'flex', dir: 'column' });
	addKeys({ hmin: 100, rounding: 10, bg: '#00000050', margin: 8, box: true, 'border-style': 'solid', 'border-width': 10 }, styles);
	let show_first = me;
	let order = arrCycle(table.plorder, table.plorder.indexOf(show_first));
	let items = {};
	for (const name of order) {
		let pl = table.players[name];
		let chex = colorFrom(pl.color);
		let [h, s, l] = colorHexToHsl01Array(chex); console.log('light', name, l)
		l = clamp(l, 0.35, 0.65); console.log('=>', name, l);
		let cFinal = colorFromHsl(h, s, l);
		styles['border-color'] = cFinal; //'red'; //pl.color;
		let d = mDom(dOuter, styles, { id: name2id(name) });
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
function unfoldCartesianProduct(dicts) {
	if (!dicts.length) return [];
	const keys = Object.keys(dicts[0]);
	const sets = Object.fromEntries(keys.map(k => [k, new Set()]));
	dicts.forEach(obj => {
		keys.forEach(k => sets[k].add(obj[k]));
	});
	return keys.map(k => Array.from(sets[k]));
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
function updateGameState(state) {
	document.getElementById("gameState").textContent = JSON.stringify(state, null, 2);
}
function updateRank(svgStr, newLabel) { return updateCardValue(svgStr, newLabel, 0); }
async function updateState() {
	clearTimeout(TO.system); TO.system = null;
	await mSleep(100);
	showState();
	TO.system = setTimeout(updateState, 1000);
}
function updateSuit(svgStr, newLabel) { return updateCardValue(svgStr, newLabel, 1); }
function updateUserImageToBotHuman(playername, value) {
	function doit(checked, name, val) {
		let du = mByAttr('username', playername);
		let img = du.getElementsByTagName('img')[0]; //du.firstChild;
		if (checked == true) if (val == 'human') mStyle(img, { round: true }); else mStyle(img, { rounding: 2 });
	}
	if (isdef(value)) doit(true, 0, value); else return doit;
}
async function updateUserTheme() {
	await postUserChange();
	setUserTheme(U);
	settingsCheck();
}
function userToPlayer(name, gamename, playmode = 'human') {
	let user = MGetUser(name);
	let pl = jsCopyExceptKeys(user, ['games']);
	let options = valf(MGetUserOptionsForGame(name, gamename), {});
	addKeys(options, pl);
	pl.playmode = playmode;
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
