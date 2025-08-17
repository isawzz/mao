
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
function statsREST(table) {

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



