onload = start; VERBOSE = true; TESTING = true;

async function start() { await test0_game0(); }

async function test0_game0() {
	await DAInit(true);

	await clickOn('games');
	if (TESTING) await clickOn(rChoose(['gul', 'felix', 'amanda', 'lauren', 'mimi']));

	clickOn(DA.bPoll);
	//console.log('....polling started',DA.pollInterval);


	//wenn mPhp... mache soll DA.bPoll ganz rot werden, danach wieder normal
	//const pulse = b.animate([{ opacity: 1 }, { opacity: 0.3 }, { opacity: 1 }], { duration: 1000, iterations: 1 });

}
async function test0_buttons_NO() {
	await DAInit(true);
	let TESTING = true;
	mStyle('dPage', { bg: 'green', fg: 'white' });
	let d = mBy('dTopLeft'); mStyle(d, { display: 'flex', vStretch: true, gap: 10, padding: 10, box: true }); //, box:true, vStretch:true, hCenter: true, padding: 10, gap: 10 }) //mClass(d,'flex')

	let bStyles = { hPadding: 10, h: 25, wmin: 70, vPadding: 6, rounding: 10, cursor: 'pointer', className: 'hover', vCenter: true, display: 'flex', hCenter: true };
	mDom(d, bStyles, { html: 'game', onclick: onclickTest, menu: 'top' });
	mDom(d, bStyles, { html: 'An', onclick: onclickTest, menu: 'top' });
	mDom(d, bStyles, { html: 'Lop', onclick: onclickTest, menu: 'top' });
	mDom(d, bStyles, { html: 'Miq', onclick: onclickTest, menu: 'top' });
	let b = mKey('watch', d, bStyles, { onclick: onclickTest, menu: 'top' });
}
async function test0_flex() {
	let d = mDom('dPage', { display: 'flex', vStretch: true, bg: 'blue', fg: 'white', gap: 10, padding: 10, box: true, h: 75 });
	let b = mDom(d, { className: 'vert_align_button', alignSelf: 'baseline', bg: 'red' }, { html: 'Help' });
	b = mDom(d, { className: 'vert_align_button', bg: 'red' }, { html: 'Help' });
	b = mDom(d, { className: 'vert_align_button', alignSelf: 'center', bg: 'red' }, { html: 'Help' });
	b = mDom(d, { className: 'vert_align_button', alignSelf: 'start', bg: 'red' }, { html: 'Help' });
	b = mDom(d, { className: 'vert_align_button', alignSelf: 'end', bg: 'red' }, { html: 'Help' });

	b = mDom(d, { alignSelf: 'baseline', bg: 'green' }, { html: 'Help' });
	b = mDom(d, { bg: 'green' }, { html: 'Help' });
	b = mDom(d, { alignSelf: 'center', bg: 'green' }, { html: 'Help' });
	b = mDom(d, { alignSelf: 'start', bg: 'green' }, { html: 'Help' });
	b = mDom(d, { alignSelf: 'end', bg: 'green' }, { html: 'Help' });
}
async function test0_save_state() {
	await DAInit(true);
	let state = await showTable(); //if (VERBOSE) console.log('vorher', jsCopy(state));

	state.num = rNumber();

	let res = await DASaveState(state); //if (VERBOSE) console.log('nachher', res);

}
async function test0_get_state() {

	await DAInit();
	let state = await showTable();

	if (VERBOSE) console.log('DONE!', state);
}
async function test0_php0() {
	await loadAssetsStatic();
	// let res = await mPhpPost('all', { action: 'dir', dir:'tables' },'simple0',true); if (VERBOSE) console.log('res', res)
	// let files = await mGetFilenames('tables'); //if (VERBOSE) console.log('files', files);
	M.tables = await MPollTables();
	if (VERBOSE) console.log('M', M)
}
async function test0() {
	if (VERBOSE) console.log('YEAH!');
}	