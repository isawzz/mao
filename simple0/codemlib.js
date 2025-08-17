
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
	let d = mDiv(toElem(dParent));
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
	let type = opts.prefer;
	let o = type != 'plain' ? lookup(M.superdi, [imgKey]) : null;
	let src;
	if (nundef(o) && imgKey.includes('.')) src = imgKey;
	else if (isdef(o) && (type == 'img' || type == 'photo') && isdef(o[type])) src = o[type];
	else if (isdef(o) && isdef(o.img)) src = o.img;
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

