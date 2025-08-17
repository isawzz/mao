
async function onclickSettTheme() {
  localStorage.setItem('settingsMenu', 'settTheme')
  await showThemes();
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
  let theme = jsCopyExceptKeys(M.config.themes[key], ['name']);
  copyKeys(theme, U);
  await updateUserTheme();
}
async function updateUserTheme() {
  await postUsers();
  setTheme(U);
  //settingsCheck();
}



async function onclickSettMyTheme() {
  localStorage.setItem('settingsMenu', 'settMyTheme');

  let dSettings = mBy('dSettingsMenu'); mClear(dSettings);
  let d = mDom(dSettings, { h: '100vh', bg: U.color })
  let dOuter = mDom(d, { padding: 25 }); // { padding: 10, gap: 10, margin:'auto', w:500, align:'center', bg:'white' }); //mCenterFlex(dParent);
  //mCenterFlex(dOuter)
  let ui = await uiTypePalette(dSettings, U.color, U.fg, U.texture, U.blendMode);
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



