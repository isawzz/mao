const InnoDict = {
	red: 'red1', blue: 'blue1', green: 'green1', yellow: 'yellow1', purple: 'purple',
	tower: { k: 'white-tower', fg: 'silver', bg: 'gray' }, clock: { k: 'clock', fg: 'navy', bg: 'powderblue' },
	crown: { k: 'queen-crown', fg: 'gold', bg: 'goldenrod' }, tree: { k: 'tree', fg: GREEN, bg: 'forestgreen' },
	bulb: { k: 'lightbulb', fg: 'violet', bg: 'purple' }, factory: { k: 'industry', fg: 'red', bg: 'firebrick' }
};// 'queen-crown', 'clock','industry'
function zInnoSymbol(sym, d, sz = 40, margin = 5, padding = 4, rounding = '10%', reverseColors = false) {
	let color = InnoDict[sym].fg;
	let fg, bg;
	if (reverseColors) {
		fg = colorDarker(color, .5);
		bg = colorLighter(color, .5);
	} else {
		bg = colorDarker(InnoDict[sym].bg, .2); //colorLighter(color, .5);
		fg = InnoDict[sym].fg; // colorLighter(color, .5);

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
	let dOuter = isdef(dParent) ? mDiv(dParent) : mDiv();
	let d = mDiv(dOuter);
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
function zInnoAge() { }
function zInnoRandom(n = 1) {
	//console.log(cinno);
	return choose(Object.keys(cinno), n);
}
function zInno(key, dParent) {
	let info = cinno[key]; info.key = key;
	console.log(info)
	let col = ColorDict[InnoDict[info.color]].c;
	info.c = colorDarker(col, info.color == 'yellow' ? .3 : .6);
	let bgCard = info.c; //colorDarker(col,.25);

	//make prefabs
	let item = { key: key, info: info };
	//each symbol make pic for 
	let d = item.div = mDom(null, { position: 'relative' });

	let color = InnoDict[info.type].fg;
	let bg = colorDarker(color, .5);
	let fg = colorLighter(color, .5);
	let dTitle = mDom(d, { margin: 5, bg: 'transparent', fg: 'white' });
	item.title = zText(key.toUpperCase(), dTitle, { display: 'inline', paleft: 10, paright: 10, weight: 'bold' });
	//let dType = mDom(dTitle, { bg: 'white', display:'inline' });
	item.type = zInnoSymbol(info.type, dTitle, 20, 2, 0, 0, true); //, 20, 0, 2, '50%'); //zPic(InnoDict[info.type].k,dType,{sz:30});

	//console.log(item.title);

	let dMain = item.dMain = mDom(d, { align: 'left' });



	let dogmas = [];
	for (const dog of info.dogmas) {
		let x = convertDogmaText(dog);
		// let d1 = mDom(dMain); d1.innerHTML = x; //GEHT!
		// let el = createElementFromHTML(x);		//mAppend(dMain,el) //NEIN!!!!!!!!!!!!!
		dogmas.push(zText(x, dMain, { mabottom: 8 }));
		// dogmas.push(zText(dog, dMain, { mabottom: 8 })); //ohne ersetzen von syms, GEHT!
	}
	item.dogmas = dogmas;

	let resources = [];
	//console.log(info.resources)
	//info.resources[2]='tree';
	for (const sym of info.resources) {
		let t =
			sym == 'None' ? zText(info.age.toString(), d, { margin: 5, w: 40, fz: 20, align: 'center', fg: 'black', bg: 'white', rounding: '50%', display: 'inline-block' }, 40, true)
				: sym == 'echo' ? zText(info.echo[0], d, { fz: 20, fg: 'white', bg: 'black' })
					: zInnoSymbol(sym, d); //zPic(InnoDict[sym].k, d, { margin: 5, padding: 4, w: 40, h: 40, bg: InnoDict[sym].bg, rounding: '10%' });
		resources.push(t);
	}
	item.resources = resources;

	//console.log(item);

	//compose items w/ abs positioning
	posTR(dTitle); //title.div);
	posTL(resources[0].div);
	posBL(resources[1].div);
	posBC(resources[2].div);
	posBR(resources[3].div);

	mStyleX(d, { margin: 4, w: 420, h: 220, padding: 50, rounding: 8, 'box-sizing': 'border-box', bg: bgCard });

	//what is the max height for dogmas? 200-100
	let dims = idealFontsizeX(dMain, 350, 120, 18, 8);
	item.dimsMain = dims;
	//console.log(dims);
	mAppend(d, dMain);
	//console.log(item, dMain, jsCopy(getBounds(dMain)));
	if (isdef(dParent)) mAppend(dParent, d);

	return item;
}
//#region
function convertDogmaText(t) {
	let parts = t.split('[');
	let html = parts[0];
	for (const p of parts.slice(1)) {
		//first word is key
		let k = stringBefore(p, ']');
		//console.log(k)
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
			//console.log(sym, s1, txt);
			let pad = k == 'factory' ? '2px 6px' : '2px';
			html += `<span style="padding:${pad};font-family:${family};background-color:${bg};color:white;border-radius:50%">${txt}</span>`;
		} else html += ` ${k} `
		//console.log(p);
		html += stringAfter(p, ']');
	}
	//console.log(html)
	return html;
}



// class GInno {
// 	constructor(name) { super(name); }
// 	startLevel() {
// 		//console.log(G)
// 	}
// 	prompt() {
// 		maShowCards([], [], dTable);//_showPictures();
// 	}
// 	trialPrompt() {
// 		sayTryAgain();
// 		return 10;
// 	}
// 	eval(w, word) {
// 		Selected = { answer: w, reqAnswer: word, feedbackUI: Goal.div }; //this.inputs.map(x => x.div) };
// 		//console.log(Selected);
// 		return w == word;
// 	}
// }


















