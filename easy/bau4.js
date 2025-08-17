
function arrNoDuplicates(arr) { return [...new Set(arr)]; }
function colorChannelMixer(colorChannelA, colorChannelB, amountToMix) {
  var channelA = colorChannelA * amountToMix;
  var channelB = colorChannelB * (1 - amountToMix);
  return parseInt(channelA + channelB);
}
function colorMix(c1, c2, percent = 50) {
  return colorCalculator(percent / 100, colorFrom(c2), colorFrom(c1), true);
}
function colorMix1(c1, c2, percent=50) {
  let rgbA = colorHexToRgbArray(c1, true); //let rgbA = [o1.r, o1.g, o1.b];
  let rgbB = colorHexToRgbArray(c2, true); //let rgbB = [o2.r, o2.g, o2.b];
  amountToMix = percent / 100;
  var r = colorChannelMixer(rgbA[0], rgbB[0], amountToMix);
  var g = colorChannelMixer(rgbA[1], rgbB[1], amountToMix);
  var b = colorChannelMixer(rgbA[2], rgbB[2], amountToMix);
  return colorFrom("rgb(" + r + "," + g + "," + b + ")");
}
function divInt(a, b) { return Math.trunc(a / b); }
function downloadAsCode(obj, fname) {
	function convertObjectToCode(obj) {
		if (typeof obj === 'object' && !Array.isArray(obj)) {
			const entries = Object.entries(obj)
				.map(([key, value]) => `${key}: ${convertObjectToCode(value)}`)
				.join(',\n');
			return `{\n${entries}\n}`;
		} else if (Array.isArray(obj)) {
			return `[${obj.map(convertObjectToCode).join(', ')}]`;
		} else if (typeof obj === 'string') {
			return `"${obj}"`;  // wrap strings in quotes
		} else {
			return obj;  // numbers, booleans, etc. don't need quotes
		}
	}
	// Convert the JS object to a code string with unquoted keys
	const objectAsCode = `const O = ${convertObjectToCode(obj)};`;

	// Create a blob with the code as text
	const blob = new Blob([objectAsCode], { type: 'text/javascript' });

	// Create a download link for the file
	const link = document.createElement('a');
	link.href = URL.createObjectURL(blob);
	link.download = fname + '.js'; // Name of the file to be downloaded

	// Trigger the download
	document.body.appendChild(link);
	link.click();

	// Clean up by removing the link
	document.body.removeChild(link);
}
async function loadRecipes() {
	if (nundef(M)) M = {};
	M.recipes = {};
	let list = ['chinoa_bean_salad', 'lasagna', 'lentil_soup'];
	let sessionType = detectSessionType(); console.log('session', sessionType)
	if (sessionType == 'telecave') {
		let res = await postPHP({ list }, 'recipes'); //console.log(res);
		let jsonObject = JSON.parse(res); //console.log(jsonObject);
		let di = {};
		for (const k in jsonObject) {
			di[k] = jsyaml.load(jsonObject[k]); //JSON.parse(jsonObject[k]);
			//console.log(k, JSON.parse(jsonObject[k]));
		}
		for (const k in di) if (k != 'm') M.recipes[k] = di[k];
	} else {
		M.recipes.recipes = await mGetYaml('../easy/recipes/recipes.yaml');
		for (const k of list) M.recipes[k] = await mGetYaml(`../easy/recipes/${k}/${k}.yaml`);
	}

}
async function loadYamlFile(url) {

  // let server = getServerurl(); console.log('server',server);
	let sessionType = detectSessionType(); console.log('sessionType', sessionType);
	if (sessionType == 'telecave') {
		url = `www.telecave.net/mag/y/m.txt`; //${url.substring(3)}`;
		url = `https://www.telecave.net/mag/y/m.txt`;
	}
	console.log("Loading YAML file from:", url);
	try {
			// Fetch the YAML file from the server
			const response = await fetch(url, { mode: 'no-cors' });
			if (!response.ok) {
					throw new Error(`Error fetching the file: ${response.statusText}`);
			}
			
			// Read the YAML content as text
			const yamlText = await response.text();
			
			// Parse YAML content into a JavaScript object
			const data = jsyaml.load(yamlText);
			
			console.log("YAML Data:", data);
			return data; // Return the parsed data if needed
	} catch (error) {
			console.error("Error loading YAML file:", error);
	}
}
async function fetchYamlFile() {
	const url = 'https://www.telecave.net/mag/easy/app.php'; // Update with your PHP file URL
	
	try {
			const response = await fetch(url);
			
			// Check for successful response
			if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
			}
			
			// Get text content of the response
			const yamlText = await response.text();
			
			// Parse the YAML text to a JavaScript object
			const data = jsyaml.load(yamlText);
			
			console.log("YAML Data:", data);
			return data;
	} catch (error) {
			console.error("Error fetching YAML file:", error);
	}
}
async function fetchYamlFiles(fileList) {
	// Create a comma-separated string from the file list array
	const filesParam = fileList.join(',');

	// Construct the URL with query parameters
	const url = `https://your-domain.com/serveYamlFiles.php?files=${encodeURIComponent(filesParam)}`;

	try {
			const response = await fetch(url);

			// Check for successful response
			if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
			}

			// Parse the JSON response
			const jsonData = await response.json();

			// Loop through each file's data and log it
			Object.keys(jsonData).forEach(fileName => {
					console.log(`Data from ${fileName}:`, jsonData[fileName]);
			});

			return jsonData; // Return the parsed data if needed
	} catch (error) {
			console.error("Error fetching YAML files:", error);
	}
}
function hToggleClassMenu(a) {
	a = a.target; //toElem(a);
	let menu = a.getAttribute('menu');
	//let others = document.querySelectorAll(`a[menu='${menu}']`);
	let others = document.querySelectorAll(`[menu='${menu}']`);
	for (const o of others) {
		mClassRemove(o, 'active')
	}
	mClassToggle(a, 'active');
}
function hPrepUi(ev, areas, cols, rows, bg) {
	hToggleClassMenu(ev); mClear('dMain');
	let d = mDom('dMain', { w: '100%', h: '100%' });
	let names = mAreas(d, areas, cols, rows);
	names.unshift('dTop');
	names = names.concat(['dStatus', 'dMain']);
	mStyle('dPage', { bg });
	return names;

}
function mAreas(dParent, areas, gridCols, gridRows) {
	mClear(dParent); mStyle(dParent, { padding: 0 })
	let names = arrNoDuplicates(toWords(areas)); //console.log(names);
	let dg = mDom(dParent);
	for (const name of names) {
		let d = mDom(dg, { family: 'opensans', wbox: true }, { id: name });
		d.style.gridArea = name;
	}
	mStyle(dg, { display: 'grid', gridCols, gridRows, dir: 'column', h: '100%' });
	dg.style.gridTemplateAreas = areas;
	return names;
}
function mHomeLogo(d, key, handler, menu) {
	let ui = mKey(key, d, { maright: 12, fz: 30, cursor: 'pointer' }, { onclick: handler, menu });
	//ui.onclick=handler;
	return ui;
}
function mKey(imgKey, d, styles = {}, opts = {}) {
	let o = lookup(M.superdi, [imgKey]);
	let src;
	if (nundef(o) && imgKey.includes('.')) src = imgKey;
	else if (isdef(o) && isdef(opts.prefer)) src = valf(o[opts.prefer], o.img);
	else if (isdef(o)) src = valf(o.img, o.photo)
	if (nundef(src)) src = rChoose(M.allImages).path;
	let [w, h] = mSizeSuccession(styles, 40);
	addKeys({ w, h }, styles)
	addKeys({ tag: 'img', src }, opts)
	let img = mDom(d, styles, opts);
	return img;
}
function mLinkSide(d, text, handler, menu, kennzahl) {
	if (nundef(kennzahl)) kennzahl = getUID();
	let ui = mDom(d, { rounding: 10, hpadding: 10, vpadding: 4 }, { tag: 'a', html: text, href: '#', onclick: handler, kennzahl, menu });
	return ui;
}
function mLinkMenu(d, text, styles={}, handler=null, menu=null, kennzahl=null) {
	if (nundef(kennzahl)) kennzahl = getUID();

	addKeys({ className: 'a', hmargin: 8, vmargin:2, deco: 'none', rounding: 10, hpadding: 9, vpadding: 3 }, styles)

	let ui = mDom(d, styles, { tag: 'a', html: text, href: '#', onclick: handler, kennzahl, menu });

	return ui;
}
function mShade(names,offset=1,contrast=1) {
	let palette = paletteTransWhiteBlack(names.length*contrast+2*offset).slice(offset); //console.log(names,palette);
	for (const name of names) {
		let d = mBy(name); //console.log(name,d)
		mStyle(d, { bg: palette.shift(), fg: 'contrast', wbox: true });
	}
}
function mShadeLight(names,offset=1,contrast=1) {
	let palette = paletteTransWhite(names.length*contrast+2*offset).slice(offset); //console.log(names,palette);
	for (const name of names) {
		let d = mBy(name); //console.log(name,d)
		mStyle(d, { bg: palette.shift(), fg: 'contrast', wbox: true });
	}
}
function mShadeDark(names,offset=1,contrast=1) {
	let palette = paletteTransBlack(names.length*contrast+2*offset).slice(offset); //console.log(names,palette);
	for (const name of names) {
		let d = mBy(name); //console.log(name,d)
		mStyle(d, { bg: palette.shift(), fg: 'contrast', wbox: true });
	}
}
function paletteTransWhite(n = 9) {
  let c = 'white';
  let pal = [c];
  let incw = 1 / (n-1);
  for (let i = 1; i < n-1; i++) {
    let alpha = 1 - i * incw;
    pal.push(colorTrans(c, alpha));
  }
  pal.push('transparent');
  return pal;
}
function paletteTransBlack(n = 9) {
  let c = 'black';
  let pal = [c];
  let incw = 1 / (n-1);
  for (let i = 1; i < n-1; i++) {
    let alpha = 1 - i * incw;
    pal.push(colorTrans(c, alpha));
  }
  pal.push('transparent');
  return pal;
}



