
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
	console.log('showThemes');
  let d = mBy('dSettingsMenu'); mClear(d);
  let d1 = mDom(d, { gap: 12, padding: 10 }); mFlexWrap(d1);
  let themes = lookup(M.config, ['themes']);
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



