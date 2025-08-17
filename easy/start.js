onload = start;
DA.FASTCOMET = 'php';

async function start() { loadColors(); await test15(); }

async function test15() {
	await loadRecipes();
	await loadAssets();

	let dPage = document.getElementById('dPage');
	mStyle(dPage, { w: '100%', h: '100%', bg: 'skyblue' }); //page coloring

	let names = M.divNames = mAreas(dPage, ` 'dTop' 'dMain' 'dStatus' `, '1fr', 'auto 1fr auto');
	mShade(names); //area coloring
	mStyle('dMain', { padding: 4, overy: 'auto' })
	mFlexBaseline('dTop'); mStyle('dTop', { padding: 4, pabottom: 10 })
	mStyle('dStatus', { padding: 4 }, { html: '&nbsp;' })

	let dTop = mDom('dTop'); //top menu
	let dHome = mHomeLogo(dTop, 'airplane', onclickHome, 'top'); //logo
	let dCalc = mLinkMenu(dTop, 'CALC', {}, onclickCalc, 'top');
	mLinkMenu(dTop, 'DAY', {}, onclickDay, 'top');
	let dExample = mLinkMenu(dTop, 'EXAMPLE', {}, onclickExample, 'top');
	mLinkMenu(dTop, 'GAME', {}, onclickGame, 'top');
	//let dMath = mLinkMenu(dTop, 'MATH', {}, onclickMath, 'top');
	let v = mLinkMenu(dTop, 'VEGAN RECIPES', {}, onclickVeganRecipes, 'top');
	mLinkMenu(dTop, 'ZONE', {}, onclickZone, 'top');

	//start in vegan
	// v.click(); setTimeout(() => clickOnElemWithAttr('innerHTML', 'Soups'), 100);
	// setTimeout(() => onclickRecipe('lentil_soup'), 100)

	//start in calc
	dCalc.click();

}
async function test14() {
	await loadAssets();
	//Z = await mGetRoute('z', { done: 'Nil github' }); //console.log('Z', Z);
	let dPage = document.getElementById('dPage');
	mStyle(dPage, { w: '100%', h: '100%', bg: 'skyblue' }); //page coloring

	let names = M.divNames = mAreas(dPage, ` 'dTop' 'dMain' 'dStatus' `, '1fr', 'auto 1fr auto');
	mShade(names); //area coloring
	mStyle('dMain', { padding: 4 })
	mFlexBaseline('dTop'); mStyle('dTop', { padding: 4, pabottom: 10 })
	mStyle('dStatus', { padding: 4 }, { html: '&nbsp;' })

	let dTop = mDom('dTop'); //top menu
	let dHome = mHomeLogo(dTop, 'airplane', onclickHome, 'top'); //logo
	let dCalc = mLinkMenu(dTop, 'CALC', {}, onclickCalc, 'top');
	mLinkMenu(dTop, 'DAY', {}, onclickDay, 'top');
	let dExample = mLinkMenu(dTop, 'EXAMPLE', {}, onclickExample, 'top');
	mLinkMenu(dTop, 'GAME', {}, onclickGame, 'top');
	//let dMath = mLinkMenu(dTop, 'MATH', {}, onclickMath, 'top');
	let v = mLinkMenu(dTop, 'VEGAN RECIPES', {}, onclickVeganRecipes, 'top');
	mLinkMenu(dTop, 'ZONE', {}, onclickZone, 'top');

	dCalc.click();

	// setTimeout(() => {
	// 	//enter values
	// 	let inp = mBy('inp_x'); //console.log(inp)
	// 	inp.value = '0 1 2 3';
	// 	inp = mBy('inp_y');
	// 	inp.value = '1/8 3/8 3/8 1/8';
	// }, 20);
}
async function test13() {
	await loadRecipes();
	let bg = '#8EA41D';
	let dPage = document.getElementById('dPage');
	mStyle(dPage, { w: '100%', h: '100%', bg, fg: 'white' }); //page coloring

	let [dTop, dMain, dStatus] = M.divNames = mAreas(dPage, ` 'dTop' 'dMain' 'dStatus' `, '1fr', 'auto 1fr auto');

	let margin = 4;
	mStyle(dTop, { margin, bg, display: 'flex', jcontent: 'start', aitems: 'start', hmax: 130, overflow: 'hidden' });
	let [dTitle, dBanner] = mAreas('dTop', ` 'dTitle dBanner' `, '238px 1fr', 'auto');
	mDom(dTitle, { fz: 34, family: 'algerian', margin: 20, hmax: 100 }, { html: "The Fuzzy Kitchen" })
	mDom(dBanner, { wmin: 2000, hmin: 400, matop: -200, bgSrc: '../easy/recipes/veganBanner.png', bgRepeat: 'no-repeat', bgSize: 'cover', opacity: .8 });

	mStyle(dMain, { margin, matop: 0, hmin: 100, bg: colorMix(bg, 'white', 50), fg: 'black' });
	mStyle(dStatus, { align: 'center', margin, matop: 0 }, { html: 'Copyright 2024' });

	let [side, main] = mAreas(dMain, ` 'dSize dTable' `, '238px 1fr', '1fr');
	mStyle(side, { bg: colorMix(bg, 'white', 80) });

	let titles = ['Newest!', 'Snacks', 'Salads', 'Soups', 'Main Dishes', 'Sides', 'Desserts', 'Basics'];
	for (const t of titles) {
		let d = mDom(side, { className: 'a', cursor: 'pointer', rounding: 10, margin: 10, padding: 10, w100: true }, { html: t, onclick: onclickRecipeType, menu: 'side', kennzahl: getUID() });
	}
	await loadAssets();
	console.log(M)

	clickOnElemWithAttr('innerHTML', 'Soups');
	setTimeout(() => onclickRecipe('lentil_soup'), 10)
}








//#region weg
async function test12_vegan() {
	let bg = '#8EA41D';
	let dPage = document.getElementById('dPage');
	mStyle(dPage, { w: '100%', h: '100%', bg, fg: 'white' }); //page coloring

	let [dTop, dMain, dStatus] = M.divNames = mAreas(dPage, ` 'dTop' 'dMain' 'dStatus' `, '1fr', 'auto 1fr auto');

	let margin = 4;
	mStyle(dTop, { margin, bg, display: 'flex', jcontent: 'start', aitems: 'start', hmax: 130, overflow: 'hidden' });
	let [dTitle, dBanner] = mAreas('dTop', ` 'dTitle dBanner' `, '1fr auto', 'auto');
	mDom(dTitle, { fz: 40, family: 'algerian', margin: 20 }, { html: "Amanda's Kitchen" })
	mDom(dBanner, { wmin: 2000, hmin: 400, matop: -200, bgSrc: '../veganrecipes/images/veganBanner.png', bgRepeat: 'no-repeat', bgSize: 'cover', opacity: .8 });

	mStyle(dMain, { margin, matop: 0, hmin: 100, bg: colorMix(bg, 'white', 50), fg: 'black' });
	mStyle(dStatus, { align: 'center', margin, matop: 0 }, { html: 'Copyright 2024' });

	let [side, main] = mAreas(dMain, ` 'dSize dRecipe' `, '238px 1fr', '1fr');
	mStyle(side, { bg: colorMix(bg, 'white', 80) });

	let titles = ['Newest!', 'Snacks', 'Main Dishes', 'Sides', 'Desserts'];
	for (const t of titles) {
		let d = mDom(side, { className: 'a', cursor: 'pointer', rounding: 10, margin: 10, padding: 10, w100: true }, { html: t, onclick: onclickRecipe, menu: 'side', kennzahl: getUID() });
		//mClass(d, 'a');
		//mStyle(d,{margin:20,w:200})k
		//mLinebreak(side);
		// let d = mDom(side, { cursor: 'pointer', fz: 20, margin: 10, bg: colorMix(bg, 'white', 90), fg: 'white', rounding: 10, hpadding: 10, vpadding: 4 }, { html: t });
		//d.onclick = () => { console.log(t); }
	}

	// let [dSearch,dFilter,dList]=mAreas(main, ` 'dSearch dFilter' 'dList dList`, 'auto 1fr', 'auto 1fr');
	// mDom(dSearch, {fz:20, margin:10, family:'algerian', bg:colorMix(bg, 'white', 90), fg:'black', rounding:10, hpadding:10, vpadding:4}, {html:'Search:'});
	// mDom(dFilter, {fz:20, margin:10, family:'algerian', bg:colorMix(bg, 'white', 90), fg:'black', rounding:10, hpadding:10, vpadding:4}, {html:'Filter:'});
	// let d = mDom(main, {fz:20, margin:10, family:'algerian', bg:colorMix(bg, 'white', 90), fg:'black', rounding:10, hpadding:10, vpadding:4}, {html:'Recipe:'});

	// Call the function to test
	//await fetchYamlFile();
	//await fetchYamlFiles(['m.yaml', 'superdi.yaml', 'details.yaml', 'dicolor.yaml', 'config.yaml']);

	// await loadYamlFile('../y/m.yaml');
	//await loadAssets();

	let res = await postPHP({}, 'assets'); console.log(res);

	let jsonObject = JSON.parse(res); console.log(jsonObject);
	M = {};
	for (const k in jsonObject) {
		M[k] = jsyaml.load(jsonObject[k]); //JSON.parse(jsonObject[k]);
		//console.log(k, JSON.parse(jsonObject[k]));
	}
	console.log(M)
}
async function test11() {
	let x = [0, 1, 2, 3];
	let p = [1 / 8, 3 / 8, 3 / 8, 1 / 8];
	let n = 4;
	//compute expected value
	let res = 0;
	for (let i = 0; i < n; i++) {
		res += x[i] * p[i];
	}
	console.log('res', res);
	//compute variance
	let v = 0;
	for (let i = 0; i < n; i++) {
		v += p[i] * (x[i] - res) ** 2;
	}
	console.log('v', v);
	//compute standard deviation
	console.log('std', Math.sqrt(v));
}
async function test10() {
	await loadAssets();
	//Z = await mGetRoute('z', { done: 'Nil github' }); //console.log('Z', Z);
	let dPage = document.getElementById('dPage');
	mStyle(dPage, { w: '100%', h: '100%', bg: 'skyblue' }); //page coloring

	let names = M.divNames = mAreas(dPage, ` 'dTop' 'dMain' 'dStatus' `, '1fr', 'auto 1fr auto');
	mShade(names); //area coloring
	mStyle('dMain', { padding: 4 })
	mFlexBaseline('dTop'); mStyle('dTop', { padding: 4, pabottom: 10 })
	mStyle('dStatus', { padding: 4 }, { html: '&nbsp;' })

	let dTop = mDom('dTop'); //top menu
	let dHome = mHomeLogo(dTop, 'airplane', onclickHome, 'top'); //logo
	let dCalc = mLinkMenu(dTop, 'CALC', {}, onclickCalc, 'top');
	mLinkMenu(dTop, 'DAY', {}, onclickDay, 'top');
	let dExample = mLinkMenu(dTop, 'EXAMPLE', {}, onclickExample, 'top');
	mLinkMenu(dTop, 'GAME', {}, onclickGame, 'top');
	let v = mLinkMenu(dTop, 'VEGAN RECIPES', {}, onclickVeganRecipes, 'top');
	mLinkMenu(dTop, 'ZONE', {}, onclickZone, 'top');

	dCalc.click();

	setTimeout(() => {
		//enter values
		let inp = mBy('inp_x'); //console.log(inp)
		inp.value = '0 1 2 3';
		inp = mBy('inp_y');
		inp.value = '1/8 3/8 3/8 1/8';
	}, 20);
}
async function test9_stats() {
	// Example usage:
	const values = [1, 2, 2, 3, 4, 4, 4, 5, 5, 6];
	const stats = calculateStatistics(values);

	console.log("Mean:", stats.mean);
	console.log("Median:", stats.median);
	console.log("Mode:", stats.mode);
	console.log("Variance:", stats.variance);
	console.log("Standard Deviation:", stats.standardDeviation);

}
async function test8z() {
	await loadAssets();
	Z = await mGetRoute('z', { done: 'Nil github' }); console.log('Z', Z);
	let dPage = document.getElementById('dPage');
	mStyle(dPage, { w: '100%', h: '100%', bg: 'skyblue' }); //page coloring

	let names = mAreas(dPage, ` 'dTop' 'dMain' 'dStatus' `, '1fr', 'auto 1fr auto');
	mShade(names); //area coloring
	mStyle('dMain', { padding: 4 })
	mFlexBaseline('dTop'); mStyle('dTop', { padding: 4, pabottom: 10 })
	mStyle('dStatus', { padding: 4 }, { html: '&nbsp;' })

	let dTop = mDom('dTop'); //top menu
	let dHome = mHomeLogo(dTop, 'airplane', onclickHome, 'top'); //logo
	let dExample = mLinkMenu(dTop, 'EXAMPLE', onclickExample, 'top');
	mLinkMenu(dTop, 'DAY', onclickDay, 'top');
	mLinkMenu(dTop, 'GAME', onclickGame, 'top');
	mLinkMenu(dTop, 'ZONE', onclickZone, 'top');

	dExample.click();
}
async function test7() {
	await loadAssets();
	let dPage = document.getElementById('dPage');
	mStyle(dPage, { w: '100%', h: '100%', bg: 'skyblue' }); //page coloring

	let names = mAreas(dPage, ` 'dTop' 'dMain' 'dStatus' `, '1fr', 'auto 1fr auto');
	mShade(names); //area coloring
	mStyle('dMain', { padding: 4 })
	mFlexBaseline('dTop'); mStyle('dTop', { padding: 4, pabottom: 10 })
	mStyle('dStatus', { padding: 4 }, { html: '&nbsp;' })

	let dTop = mDom('dTop'); //top menu
	let dHome = mHomeLogo(dTop, 'airplane', onclickHome, 'top'); //logo
	let dExample = mLinkMenu(dTop, 'EXAMPLE', onclickExample, 'top');
	mLinkMenu(dTop, 'DAY', onclickDay, 'top');
	mLinkMenu(dTop, 'GAME', onclickGame, 'top');
	mLinkMenu(dTop, 'ZONE', onclickZone, 'top');

	dExample.click();
}
async function test7_YES() {
	let dPage = document.getElementById('dPage');
	mStyle(dPage, { w: '100%', h: '100%', bg: 'skyblue' })
	let areas = `
		'dMessage dMessage'
		'dTop dTop'
		'dSide dTable'
		'dStatus dStatus'
	`;
	let names = mAreas(dPage, areas, 'auto 1fr', 'auto auto 1fr auto'); //console.log(names)
	mShade(names);
	mStyle('dMessage', {}, { html: 'Check in at Gate A33 ...boarding in 25 minutes' })
	mStyle('dTable', { opacity: .5, bgSrc: '../assets/img/airport/airport2.jpg' });

	//mach aus dTop eine Topline sowie bei ode
}
async function test7_YES() {
	let dPage = document.getElementById('dPage');
	mStyle(dPage, { w: '100%', h: '100%', bg: 'skyblue' })
	let areas = `
		'dMessage dMessage'
		'dTop dTop'
		'dSide dTable'
		'dStatus dStatus'
	`;
	let names = mAreas(dPage, areas, 'auto 1fr', 'auto auto 1fr auto'); //console.log(names)
	mShade(names);
	mStyle('dMessage', {}, { html: 'Check in at Gate A33 ...boarding in 25 minutes' })
	mStyle('dTable', { opacity: .5, bgSrc: '../assets/img/airport/airport2.jpg' });
}
async function test7_airport1() {
	let dPage = document.getElementById('dPage'); mStyle(dPage, { w: '100%', h: '100%' })
	let areas = `
		'top top'
		'left right'
	`;
	let names = mAreas(dPage, areas, 'auto 1fr', 'auto 1fr')
	areas = `
		'dTestButtons dTestButtons'
		'dSidebar dSearch'
		'dSidebar dFiddle'
		'dSidebar dTable'
		'dSidebar dFooter'
	`;
	let cols = 'auto 1fr';
	let rows = 'auto auto 1fr auto auto';
	names = names.concat(mAreas('right', areas, cols, rows));
	removeInPlace(names, 'right')
	console.log(names)
	let divs = document.querySelectorAll('div'); console.log(divs);
	console.log(mBy('dTestButtons'))
	//return;
	mStyle(dPage, { bg: 'skyblue' })
	let palette = paletteTransWhiteBlack(names.length + 2).slice(1); //console.log(palette);
	for (const name of names) {
		let d = mBy(name); console.log(name, d)
		mStyle(d, { bg: palette.pop(), fg: 'contrast', padding: 10, wbox: true });
	}
	mStyle('top', {}, { html: 'Check in at Gate A33 ...boarding in 25 minutes' })
	mStyle('dFiddle', { opacity: .5, bgSrc: '../assets/img/airport/airport2.jpg' });
}
async function test7a() {
	let container = document.getElementById('dPage');
	let topDiv = mDom(container, { bg: 'lightblue', padding: 10 }, { html: "Top div - grows with content." });
	topDiv.style.gridArea = 'top';

	let leftDiv = mDom(container, { overy: 'auto', w: 60, transition: 'width 0.5s ease', bg: 'lightgray', padding: 10 });
	leftDiv.style.gridArea = 'left';

	let menuSymbol = mDom(leftDiv, { cursor: 'pointer', fz: 24 }, { html: getMenuSymbol() });

	let rightDiv = mDom(container, { overy: 'scroll', bg: 'lightgreen', padding: 10 }, { html: "Right content area with scrollable content." });
	rightDiv.style.gridArea = 'right';

	mStyle(container, { display: 'grid', gridCols: 'auto 1fr', gridRows: 'auto 1fr', dir: 'column', h: '100vh' });
	container.style.gridTemplateAreas = `
			'top top'
			'left right'
	`;

}
async function test7NO() {
	let dPage = document.getElementById('dPage');
	let areas = `
		'dTestButtons dTestButtons'
		'dSidebar dSearch'
		'dSidebar dFiddle'
		'dSidebar dTable'
		'dSidebar dFooter'
	`;
	let cols = 'auto 1fr';
	let rows = 'auto auto 1fr auto auto';
	mAreas(dPage, areas, cols, rows);
}
async function test7_airport() {
	let d = document.body; d.innerHTML = ''; mStyle(d, { w: '100vw', h: '100vh', padding: 0, margin: 0, wbox: true, overy: 'hidden' })
	mDom(d, { h: '100%', w: '100%', bgSize: 'cover', bgSrc: '../assets/img/airport/airport2.jpg' }); return; //OK

	mDom(d, { h: '100%', w: '100%', bgImage: 'url(../assets/img/airport/airport2.jpg)' }); return; //OK
	mDom(d, { h: '100%', w: '100%' }, { tag: 'img', src: '../assets/img/airport/airport2.jpg' }); return; //OK
	d = mDom(d, { w100: true, h100: true, bgImage: '../assets/img/airport/airport2.jpg' });
	//mClass(d, 'fullpage airport');
}
async function test7NO() {
	show_coding_ui();
}
async function test6() {
	let list = loadColors(); //console.log(M.colorNames);
	const container = document.getElementById('dPage'); // Your container element
	let [dTop, dSide, dTable, dMenuSymbol] = myLayout(container);
	// Example content for rightDiv
	const content = document.createElement('div');
	content.textContent = "This is the main content area. It will shrink when the sidebar opens.";
	dTable.appendChild(content);

	let cont = mDom(dTable, { bg: 'lemonchiffon', display: 'flex', wrap: true }, {});
	for (const o of list) {
		mDom(cont, { bg: o.hex, fg: 'contrast', padding: 10, margin: 3 }, { tag: 'div', html: `${o.name} (h:${o.hue},l:${o.sortl},s:${o.sorts})` });
	}

}
async function test6_NOPE() {
	let list = loadColors(); //console.log(M.colorNames);
	const container = document.getElementById('dPage'); // Your container element
	let [dTop, dSide, dTable, dMenuSymbol] = createLayout(container);

	let cont = mDom(dTable, { bg: 'lemonchiffon', display: 'flex', wrap: true }, {});
	for (const o of list) {
		mDom(cont, { bg: o.hex, fg: 'contrast', padding: 10, margin: 3 }, { tag: 'div', html: `${o.name} (h:${o.hue},l:${o.sortl},s:${o.sorts})` });
	}


	// for (const o of list) {
	// 	mDom(dTable, { w:200, h:25, display:'inline-block', bg: o.hex, fg: 'contrast', margin: 3, padding:3 }, { html: `${o.name} (h:${o.hue},l:${o.sortl},s:${o.sorts})` });
	// }

}
async function test6_NOPE() {
	let list = loadColors(); //console.log(M.colorNames);
	const container = document.getElementById('dPage'); // Your container element
	createLayout(container);
	return;
	let [dTop, dSide, dTable, dMenuSymbol] = mLayoutTopLeftTable(container);

	mClear(dTable);
	for (const o of list) {
		mDom(dTable, { w: 200, h: 25, display: 'inline-block', bg: o.hex, fg: 'contrast', margin: 3, padding: 3 }, { html: `${o.name} (h:${o.hue},l:${o.sortl},s:${o.sorts})` });
	}


	return;
	//let cont = mDom(dTable, { bg: 'lemonchiffon', display: 'flex', wrap: true }, {});
	let cont = dTable;
	// mStyle(cont, { display: 'grid', w100: true, gridCols: 4, wrap: true, bg: 'lemonchiffon',  })
	mStyle(cont, { grow: 1, shrink: 1, display: 'flex', w100: true, wrap: true, bg: 'lemonchiffon', })
	for (const o of list) {
		mDom(cont, { bg: o.hex, fg: 'contrast', margin: 3, padding: 3 }, { html: `${o.name} (h:${o.hue},l:${o.sortl},s:${o.sorts})` });
	}

	dSide.id = 'dSide';
	dSide.style.width = '200px';
	dSide.style.flexGrow = '1'
	dMenuSymbol.addEventListener('click', ev => {
		console.log('click!');
		let dSide = ev.target.closest('#dSide'); console.log(dSide)
		let w = dSide.offsetWidth; console.log('w', w);//mGetStyle(leftDiv,'w');
		if (w > 60) {
			console.log('HALLO!!!!')
			dSide.style.width = '60px'; // Collapse the sidebar
		} else {
			dSide.style.width = '200px'; // Expand the sidebar
		}
		//sidebarOpen = !sidebarOpen;
	});

}
async function test6_layoutTopLeftTable() {
	const container = document.getElementById('dPage'); // Your container element
	let [dTop, dSide, dTable] = mLayoutTopLeftTable(container);
}
async function test5() {
	let list = loadColors(); //console.log(M.colorNames);
	mStyle('dPage', { h: '100%' });
	const container = mBy('dPage');
	let [dTop, dSide, dTable] = mLayoutTopLeftTable(container);

	// let tcont = mDom(dTop, { display: 'flex', wrap: true, overy: 'scroll', hmax: 250 }, {}); //muss hmax haben!!!
	mStyle(dTop, { bg: 'banana', display: 'flex', jcontent: 'space-between', hpadding: 10 });
	mDom(dTop, { fz: 30 }, { html: 'my game' });

	//let [dSide,dTable] = mLayoutLeftMain(dMain,true);

	let cont = mDom(dTable, { bg: 'lemonchiffon', display: 'flex', wrap: true }, {});
	for (const o of list) {
		mDom(cont, { bg: o.hex, fg: 'contrast', padding: 10, margin: 3 }, { tag: 'div', html: `${o.name} (h:${o.hue},l:${o.sortl},s:${o.sorts})` });
	}

}
async function test4() {
	mStyle('dPage', { h: '100%' });

	// Example usage:
	const container = mBy('dPage'); // Assuming you have a container div
	let [dTop, dTable] = mLayoutTopTable(container);

	//for (const i of range(120)) { mDom(dTable, { padding: 10 }, { html: 'new line' }) }

	//mDom(dTop, { padding: 10 }, { html: 'andere zeile' });

	let list = loadColors(); //console.log(M.colorNames);
	let cont = mDom(dTable, { display: 'flex', wrap: true }, {});
	//let sorting = 0;
	for (const o of list) {
		//if (o.sorting > sorting) { sorting = o.sorting; mLinebreak(cont) }
		mDom(cont, { bg: o.hex, fg: 'contrast', padding: 10, margin: 3 }, { tag: 'div', html: `${o.name} (h:${o.hue},l:${o.sortl},s:${o.sorts})` });
	}

	// let tcont = mDom(dTop, { display: 'flex', wrap: true, overy: 'scroll', hmax: 250 }, {});
	// list.map(x => mDom(tcont, { margin: 10, bg: x.name }, { html: x.name }));

	// let dTop = mDom('dPage', { h: 'auto', bg: 'red', overy: 'auto' }, { id: 'dTop0' })
	// let dTable = mDom('dPage', { h: 'calc ( 100% - ', bg: 'blue', overy: 'scroll' }, { id: 'dTable0' })
}
async function test4a() {
	mStyle('dPage', { h: '100%' })
	let dTop = mDom('dPage', { h: '50%', bg: 'red', overy: 'auto' }, { id: 'dTop0' })
	let dTable = mDom('dPage', { h: '50%', bg: 'blue', overy: 'scroll' }, { id: 'dTable0' })
}
async function test3() {
	loadColors(); //console.log(M.colorNames);
	oceanLayout('dPage', 'microsoft_yellow');

	let dTable = mBy('dTable0');
	let dTop = mBy('dTop0');

	mStyle('dPage', { h: '100%' })
	mStyle(dTable, { h: '50%' })
	mStyle(dTop, { h: '50%', display: 'flex', wrap: true })

	let list = M.colorList;
	let bb = 10;
	list = list.map(x => x.sorting = Math.round(x.hue / bb) * bb); //+Math.trunc(x.sat*10));
	// list = sortByMultipleProperties(M.colorList,'hue','sat','lightness');
	list = sortByMultipleProperties(M.colorList, 'sorting', 'lightness', 'sat');

	let cont = mDom(dTable, { display: 'flex', wrap: true }, {});
	let sorting = 0;
	for (const o of list) {
		if (o.sorting > sorting) { sorting = o.sorting; mLinebreak(cont) }
		mDom(cont, { bg: o.hex, fg: 'contrast', padding: 10, margin: 3 }, { tag: 'div', html: `${o.name} (${o.sorting})` });
	}

	//mStyle(dTop,{wmax:'100%'})
	mCenterFlex(dTop)
	list.map(x => mDom(dTop, { margin: 10, bg: x.name }, { html: x.name }));
}
async function testMist() {
	for (const b in M.dicolor) {
		mDom(dTable, {}, { tag: 'h1', html: b });
		let cont = mDom(dTable, { display: 'flex', wrap: true }, {});
		let keys = Object.keys(M.dicolor[b]); console.log(keys);
		let list = keys.map(x => M.colorByName[x]); console.log(list[0])

		list = sortByMultipleProperties(list, 'lightness', 'hue');
		for (const o of list) {
			//console.log(o); return;
			//let color = M.dicolor[b][c];
			mDom(cont, { bg: o.hex, fg: 'contrast', padding: 10, margin: 3 }, { tag: 'div', html: o.name });
		}
	}
}
//#endregion
async function test2() {
	loadColors();
	console.log(M.colorNames);
}
async function test1() {
	M.dicolor = await mGetYaml(`../assets/dicolor.yaml`);
	[M.colorList, M.colorByHex, M.colorByName] = getListAndDictsForDicolors();
	oceanLayout('dPage', 'skyblue');
	oceanLayout('dTable0', 'kobi', 1);
	oceanLayout('dTable1', 'deeppink', 2);//await prelims();
}
async function test0() {
	let d0 = mBy('dPage');
	mStyle(d0, { bg: 'skyblue' })
	let divNames = 'dTop dSidebar dTable'.split(' '); console.log('divNames', divNames);
	let palette = paletteTransWhiteBlack(divNames.length + 2).slice(1); //console.log(palette);
	for (const id of divNames) {
		let d = mBy(id);
		mStyle(d, { bg: palette.pop(), fg: 'contrast', family: 'opensans', wbox: true, padding: 10 }, { html: id });
	}
}

//#region TEMP
async function machConstsZuJsDicts_TEMP() {
	function convertColorsToObjAndSave(colors, fname) {
		const colorObject = {};

		// Iterate over the array to process each color and comment
		colors.forEach(color => {
			if (!isEmptyOrWhiteSpace(color)) {
				const hexCode = color.split(',')[0].trim(); // Extract the hex code
				console.log(color, typeof color)
				const comment = color.split('//')[1].trim(); // Extract the color name from the comment

				// Convert comment (color name) to lowercase and replace spaces with underscores
				const formattedKey = comment.toLowerCase().replace(/\s+/g, '_');

				// Add to the object
				colorObject[formattedKey] = hexCode;
			}
		});

		// Generate JS code string without quoted keys
		const objectAsCode = `const ${fname} = ${convertObjectToCode(colorObject)};`;

		// Create a blob with the JS code as text
		const blob = new Blob([objectAsCode], { type: 'text/javascript' });

		// Create a download link for the file
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = fname + '.js'; // File name

		// Trigger the download
		document.body.appendChild(link);
		link.click();

		// Clean up by removing the link
		document.body.removeChild(link);
	}
	// Helper function to convert an object to a string with unquoted keys
	function convertObjectToCode(obj) {
		const entries = Object.entries(obj)
			.map(([key, value]) => `${key}: ${value}`)
			.join(',\n');
		return `{\n${entries}\n}`;
	}
	let list = modernColors.split('\n'); console.log('list', list);

	convertColorsToObjAndSave(list, 'modernColors');
	convertColorsToObjAndSave(childrenRoomColors.split('\n'), 'childrenRoomColors');
	convertColorsToObjAndSave(vibrantColors.split('\n'), 'vibrantColors');
	convertColorsToObjAndSave(deepRichColors.split('\n'), 'deepRichColors');

}
async function machDieColorsAlsJs_TEMP() {
	M.dicolor = await mGetYaml(`../assets/dicolor.yaml`);

	// // Example usage:
	// const exampleObject = {
	// 	name: "John",
	// 	age: 30,
	// 	hobbies: ["coding", "reading"]
	// };

	// Call the function to save the object as code
	downloadAsCode(M.dicolor);
	// downloadAsJson(M.dicolor,'dicolor')
}
//#endregion

async function preprelims() {
	ColorThiefObject = new ColorThief();//console.log(ColorThiefObject);
	let t1 = performance.now();
	Serverdata = await mGetRoute('session'); //session ist: users,config,events
	let t2 = performance.now();
	await loadAssets();
	let textures = await mGetFiles(`../assets/textures`);
	M.textures = textures.map(x => `../assets/textures/${x}`); //console.log('textures',M.textures)
}
async function prelims() {
	await preprelims();
	let t4 = performance.now();
	sockInit();
	let t5 = performance.now();
	window.onkeydown = keyDownHandler;
	window.onkeyup = keyUpHandler;
	DA.funcs = { setgame: setgame(), lacuna: lacuna(), fishgame: fishgame(), button96: button96() }; //implemented games!
	for (const gname in Serverdata.config.games) {
		if (isdef(DA.funcs[gname])) continue;
		DA.funcs[gname] = defaultGameFunc();
	}

	let html = `
    <div style="position:fixed;width:100%;z-index:20000">
      <div id="dNav" class="nav p10"></div>
      <div id="dMessage" style='height:0px;padding-left:10px' class="transh"></div>
    </div>
    <div id="dBuffer" style="height:32px;width:100%" class="nav"></div>
    <div id="dExtra" class="p10hide nav"></div>
    <div id="dTitle"></div>
    <div id="dPage" style="display:grid;grid-template-columns: auto 1fr auto;">
      <div id="dLeft" class="mh100 over0 translow nav">
      </div>
      <div id="dMain"></div>
      <div id="dRight" class="mh100 over0 translow"></div>
    </div>
    <d id="dBottom"></d>
    
    `;
	document.body.innerHTML = html;
	UI.dTitle = mBy('dTitle');
	UI.commands = {};
	UI.nav = showNavbar(); //console.log(UI.nav)
	staticTitle();
	let cmd = UI.nav.commands.user = mCommand(UI.nav.elem, 'user'); //console.log(cmd)
	iDiv(cmd).classList.add('activeLink');
	await switchToUser(localStorage.getItem('username'), localStorage.getItem('menu'));
}

