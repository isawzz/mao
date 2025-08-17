async function showTestButtons() {
	let d = mBy('dTestLeft'); mClass(d, 'button_container');
	let styles = { rounding: 6, maleft: 10, h: 24, bg: 'dimgray', fg: 'white', padding: 5 };
	let label = 'polling:';
	DA.dControlUiState = await mToggleButton(d, {}, { label, key: 'hand', onclick: onclickHand }, { label, key: 'display', onclick: onclickDisplay })

}
async function loadTables() {
	M.tables = await MPollTables();
}
async function onclickHand() {
	await pollStop();
}
async function onclickDisplay() {
	await pollStart();
}
function mBlinkOn(b, bg, callback) {
	mClass(b, 'blink');
	mStyle(b, { bg });
	b.setAttribute('state', bg);
	if (isdef(callback)) callback();
}
function mBlinkOff(b, bg, callback) {
	mClassRemove(b, 'blink');
	mStyle(b, { bg });
	b.setAttribute('state', bg);
	if (isdef(callback)) callback();
}
function ifVerbose(){
	if (!VERBOSE) return;
	let {functionName,file,line} = getCallerInfo();
	console.log(`==>${stringAfterLast(file,'/')}:${line}\n`, ...arguments);

}
async function switchToMenu(menu) {

	let button = getElementWithAttribute('key', menu);
	hToggleClassMenu({ target: button });
	menu = valf(menu, DA.menu, localStorage.getItem('menu'), 'games');

	DA.pollCounter = 0;
	DA.menu = menu;
	switch (menu) {
		case 'games': await showGamesAndTables(true); DA.pollCounter = 0; DA.pollInterval = 3000; break;
		case 'table': await showTable(); DA.pollCounter = 0; DA.pollInterval = 1000; break;
	}
	localStorage.setItem('menu', menu);
}
async function onclickTest(ev) {
	let [prevElem, elem] = hToggleClassMenu(ev);
	if (prevElem == elem) { ifVerbose('same!!!'); return; }
	ifVerbose('different', prevElem, elem);

	await switchToMenu(elem.getAttribute('key'));

}
function onclickStopwatch(ev) {
	let [prevElem, elem] = hToggleClassMenu(ev);
	if (prevElem == elem) {console.log('same!!!');return;}
	console.log('different',prevElem,elem); return;
	p5ClearAll();
	let d0 = mDom(dMain);
	let styles = { fz: 50, hPadding: 10, rounding: 10, wmax: 260, margin: 10, align: 'center', hline: 50, 'user-select': 'none' };
	let d = mDom(d0, styles);
	DA.stopwatch = createStopwatch(d);
	let r = getRect(DA.stopwatch.elem); let left = r.w / 2 - 110;
	let dBlinker = mDom(d0, { position: 'absolute', top: 0, left, w: 20, h: 20, rounding: 10 }, { id: 'dBlinker' });
	copyKeys({ h: 50, fz: 40 }, styles);
	let a = DA.action;
	for (const action of ['prog', 'violin', 'move', 'piano', 'math', 'hut', 'agfa', 'hprog']) {
		let d1 = mKey(action, d0, styles, { prefer: 'plain', onclick: onclickAction, menu: 'main' });
		if (a && a.key == key) {
			if (isdef(a.from)) {
				let from = new Date(DA.from);
			}
			DA.action = { elem: d1, key: action, status: 'started' };
		}
	}
}
async function showTable(id) {
	let me = UGetName();
	let tid = valf(id, DA.tid);
	if (nundef(tid)) tid = valf(localStorage.getItem('tid'), arrLast(Object.keys(M.tables)));
	if (nundef(tid)) { return await showGamesAndTables(); }
	DA.tid = tid;
	let tData = await loadStaticYaml(`y/tables/${tid}.yaml`);
	if (!tData) { showMessage('table deleted!'); return await showGamesAndTables(); }
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
function pollChangeMs(state, ms) { DA.pollms[state] = ms; }
function pollChangeState(newState) {
	DA.prevState = DA.pollState;
	DA.pollState = newState;
	pollResume();
}
async function pollResume() {
	let ms = DA.pollms[DA.pollState];
	console.log('', DA.pollCounter++, ms, DA.prevState, DA.pollState);
	switch (DA.pollState) {
		case 'lobby':
			await showGamesAndTables();
			if (nundef(TO.poll)) TO.poll = setTimeout(pollResume, ms);
			break;
		case 'mymove':
			TO.poll = setTimeout(pollResume, ms);
			break;
		case 'othermove':
			TO.poll = setTimeout(pollResume, ms);
			break;
		default:
			pollStop(); break;
	}
}
function showState() {
	console.log('uiState:', DA.uiState, firstVisibleChild(DA.dControlUiState).innerHTML);
}
async function showStateButtons(d) {
	let styles = { rounding: 6, maleft: 10, h: 24, bg: 'dimgray', fg: 'white', padding: 5 };
	let label = 'ui:';
	DA.dControlUiState = mToggleButton(d, styles, { label, key: 'hand', onclick: uiManual }, { label, key: 'display', onclick: uiAuto })
	label = 'menu:';
	DA.dControlUiState = mToggleButton(d, styles, { label, key: 'list', onclick: menuLobby }, { label, key: 'round_table', onclick: menuTable })
	label = 'table:';
	DA.dControlUiState = mToggleButton(d, styles,
		{ label: `${label} none`, key: null, onclick: tableNone },
		{ label: `${label} open`, key: null, onclick: tableOpen },
		{ label: `${label} me`, key: null, onclick: tableMyMove },
		{ label: `${label} wait`, key: null, onclick: tableOtherMove },
		{ label: `${label} over`, key: null, onclick: tableGameover },
	);
	label = 'system:';
	DA.dControlUiState = mToggleButton(d, styles,
		{ label: `${label} idle`, key: null, onclick: sysIdle },
		{ label: `${label} busy`, key: null, onclick: sysBusy },
		{ label: `${label} polling`, key: null, onclick: sysPolling },
	);
}
