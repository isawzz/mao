
async function clickOn(tag, text) {
	//too complex and doe not really work!
  await mSleep(100);
  let parent = isDict(tag) ? tag : document;
  let list = nundef(text) ? [...parent.querySelectorAll('*')] : [...parent.querySelectorAll(tag), ...parent.querySelectorAll(`[${tag}]`)];
  const d = list.map(fs => fs.value == text || [...fs.querySelectorAll('*')].find(el => el.innerHTML.trim() === text)).find(el => el);
  if (isdef(d)) d.click();
  await mSleep(100);
  return d;
}
function injectPattern(color) {
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
	pattern.setAttribute('id', patternId);
	pattern.setAttribute('patternUnits', 'userSpaceOnUse');
	pattern.setAttribute('width', 6);
	pattern.setAttribute('height', 6);
	pattern.setAttribute('patternTransform', 'rotate(45)');

	const rect = document.createElementNS(svgNS, 'rect');
	rect.setAttribute('width', 6);
	rect.setAttribute('height', 6);
	rect.setAttribute('fill', 'white');

	const line = document.createElementNS(svgNS, 'line');
	line.setAttribute('x1', 0);
	line.setAttribute('y1', 0);
	line.setAttribute('x2', 0);
	line.setAttribute('y2', 6);
	line.setAttribute('stroke', color);
	line.setAttribute('stroke-width', 2);

	pattern.appendChild(rect);
	pattern.appendChild(line);
	defs.appendChild(pattern);
	return patternId;
}
function injectPath(color) {
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

	// <pattern id="striped-red" patternUnits="userSpaceOnUse" width="4" height="4">
	// 	<path d="M-1,1 H5" style="stroke:${colors.red}; stroke-width:1" />
	// </pattern>

	applyOpts(pattern, { id: patternId, patternUnits: 'userSpaceOnUse', width: 6, height: 6, patternTransform: 'rotate(45)' });
	pattern.innerHTML = `<path d="M-1,1 H5" style="stroke:${color}; stroke-width:1" />`;
	defs.appendChild(pattern);
	return patternId;
}

function makeCardSVG(patternId, path, color) {
	return `
    <svg viewBox="-2 -2 54 104" xmlns="http://www.w3.org/2000/svg">
      <path d="${path}"
            fill="url(#${patternId})"
            stroke="${color}"
            stroke-width="4"
      />
    </svg>
  `;
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

