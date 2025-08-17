
async function showSettings() {
  DA.settings = jsCopy(U);
  miniClearMain();
  mStyle('dMain', { padding: 0, margin: 0 });
  let d = mDom('dMain', {padding:0,margin:0}, { id: 'dSettingsMenu' });
  let submenu = valf(localStorage.getItem('settingsMenu'), 'settTheme');
  //let wmin = 170;
  //mStyle('dLeft', { wmin: wmin });
  let dl = mDom('dLeft', { w100:true,hmin:'100%',bg:'red'},{html:'settings'});
  mClass(dl, 'button_container_sidebar'); //mFlex(d); // mStyle(d, { display: 'flex', vStretch: true, gap: 10, padding: 4, box: true }); //, box:true, vStretch:true, hCenter: true, padding: 10, gap: 10 }) //mClass(d,'flex')
  mDom(dl, {}, { tag: 'button',html: 'My Theme', onclick: onclickSettMyTheme, menu: 'top', key: 'games' });
  mDom(dl, {}, { tag: 'button',html: 'Themes', onclick: onclickSettTheme, menu: 'top', key: 'table' });
  mDom(dl, {}, { tag: 'button',html: 'Color', onclick: onclickSettColor, menu: 'top', key: 'settings' });
  mDom(dl, {}, { tag: 'button',html: 'Texture', onclick: onclickSettTexture, menu: 'top', key: 'settings' });
  mDom(dl, {}, { tag: 'button',html: 'Blend Mode', onclick: onclickSettBlendMode, menu: 'top', key: 'settings' });
  mDom(dl, {}, { tag: 'button',html: 'Remove Texture', onclick: onclickSettRemoveTexture, menu: 'top', key: 'settings' });
  mDom(dl, {}, { tag: 'button',html: 'Revert Settings', onclick: onclickSettResetAll, menu: 'top', key: 'settings' });
  mDom(dl, {}, { tag: 'button',html: 'Add Your Theme', onclick: onclickSettAddYourTheme, menu: 'top', key: 'settings' });
  mDom(dl, {}, { tag: 'button',html: 'Delete Theme', onclick: onclickSettDeleteTheme, menu: 'top', key: 'settings' });
  // await UI.commands[submenu].open();
  // settingsCheck();
}
function settingsSidebar() {
  let wmin = 170;
  mStyle('dLeft', { wmin: wmin });
  let d = mDom('dLeft', { wmin: wmin - 10, margin: 10, matop: 160, h: window.innerHeight - getRect('dLeft').y - 102 }); //, bg:'#00000020'  }); 
  let gap = 5;
  UI.commands.settMyTheme = mCommand(d, 'settMyTheme', 'My Theme', { save: true }); mNewline(d, gap);
  UI.commands.settTheme = mCommand(d, 'settTheme', 'Themes', { save: true }); mNewline(d, gap);
  UI.commands.settColor = mCommand(d, 'settColor', 'Color', { save: true }); mNewline(d, gap);
  UI.commands.settFg = mCommand(d, 'settFg', 'Text Color', { save: true }); mNewline(d, gap);
  UI.commands.settTexture = mCommand(d, 'settTexture', 'Texture', { save: true }); mNewline(d, gap);
  UI.commands.settBlendMode = mCommand(d, 'settBlendMode', 'Blend Mode', { save: true }); mNewline(d, 2 * gap);
  UI.commands.settRemoveTexture = mCommand(d, 'settRemoveTexture', 'Remove Texture'); mNewline(d, gap);
  UI.commands.settResetAll = mCommand(d, 'settResetAll', 'Revert Settings'); mNewline(d, gap);
  UI.commands.settAddYourTheme = mCommand(d, 'settAddYourTheme', 'Add Your Theme'); mNewline(d, gap);
  UI.commands.settDeleteTheme = mCommand(d, 'settDeleteTheme', 'Delete Theme'); mNewline(d, gap);
}
function settingsCheck() {
  if (isdef(DA.settings)) {
    cmdDisable(UI.commands.settResetAll.key);
    for (const k in DA.settings) {
      if (isLiteral(U[k]) && DA.settings[k] != U[k]) {
        cmdEnable(UI.commands.settResetAll.key); break;
      }
    }
  }
}

