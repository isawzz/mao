

function mLayoutTopExtraSpaceBetween(dParent) {
  dParent = toElem(dParent);
  mStyle(dParent, {}, { id: 'dOuterTop' });
  let dTopLine = mDom(dParent, { display: 'flex', justifyContent: 'space-between' }, { id: 'dTopLine' });
  let dExtra = mDom(dParent, { display: 'flex', justifyContent: 'space-between' }, { id: 'dExtra' });
  let [dTopLeft, dTopMiddle, dTopRight] = [mDom('dTopLine', {}, { id: 'dTopLeft' }), mDom('dTopLine', {}, { id: 'dTopMiddle' }), mDom('dTopLine', {}, { id: 'dTopRight' })]
  let [dExtraLeft, dExtraMiddle, dExtraRight] = [mDom('dExtra', {}, { id: 'dExtraLeft' }), mDom('dExtra', {}, { id: 'dExtraMiddle' }), mDom('dExtra', {}, { id: 'dExtraRight' })]
  DA.divNames.push('dOuterTop', 'dTopLine','dExtra', 'dTopLeft', 'dTopMiddle', 'dTopRight', 'dExtraLeft', 'dExtraMiddle', 'dExtraRight');
}
function mLayoutTopTestExtraMessageTitle(dParent) {
  dParent = toElem(dParent);
  mStyle(dParent, { hPadding: 10, patop: 2 }, { id: 'dOuterTop' });
  let dTopLine = mDom(dParent, { display: 'flex', justifyContent: 'space-between' }, { id: 'dTopLine' });
  let dTest = mDom(dParent, { display: 'flex', justifyContent: 'space-between', pabottom: 2 }, { id: 'dTest' });
  let dExtra = mDom(dParent, { display: 'flex', justifyContent: 'space-between' }, { id: 'dExtra' });
  let dMessage = mDom(dParent, { h: 0, bg: 'red', fg: 'yellow' }, { id: 'dMessage' });
  let [dTopLeft, dTopMiddle, dTopRight] = [mDom('dTopLine', {}, { id: 'dTopLeft' }), mDom('dTopLine', {}, { id: 'dTopMiddle' }), mDom('dTopLine', {}, { id: 'dTopRight' })]
  let [dTestLeft, dTestMiddle, dTestRight] = [mDom('dTest', {}, { id: 'dTestLeft' }), mDom('dTest', {}, { id: 'dTestMiddle' }), mDom('dTest', {}, { id: 'dTestRight' })]
  let [dExtraLeft, dExtraMiddle, dExtraRight] = [mDom('dExtra', {}, { id: 'dExtraLeft' }), mDom('dExtra', {}, { id: 'dExtraMiddle' }), mDom('dExtra', {}, { id: 'dExtraRight' })]
  mDom(dExtraLeft, {}, { id: 'dTitle' });
  DA.divNames.push('dOuterTop', 'dTopLine' ,'dTest', 'dExtra', 'dMessage', 'dTopLeft', 'dTopMiddle', 'dTopRight', 'dTestLeft', 'dTestMiddle', 'dTestRight', 'dExtraLeft', 'dExtraMiddle', 'dExtraRight', 'dTitle');
}
function mLayoutTopTestExtraTitle(dParent) {
  dParent = toElem(dParent);
  mStyle(dParent, { patop: 2 }, { id: 'dOuterTop' });
  let dTopLine = mDom(dParent, { display: 'flex', justifyContent: 'space-between' }, { id: 'dTopLine' });
  let dTest = mDom(dParent, { display: 'flex', justifyContent: 'space-between', pabottom: 2 }, { id: 'dTest' });
  let dHidden = mDom(dParent, {}, { id: 'dHidden' });
  let dExtra = mDom(dParent, { display: 'flex', justifyContent: 'space-between' }, { id: 'dExtra' });
  let [dTopLeft, dTopMiddle, dTopRight] = [mDom('dTopLine', {}, { id: 'dTopLeft' }), mDom('dTopLine', {}, { id: 'dTopMiddle' }), mDom('dTopLine', {}, { id: 'dTopRight' })]
  let [dTestLeft, dTestMiddle, dTestRight] = [mDom('dTest', {}, { id: 'dTestLeft' }), mDom('dTest', {}, { id: 'dTestMiddle' }), mDom('dTest', {}, { id: 'dTestRight' })]
  let [dExtraLeft, dExtraMiddle, dExtraRight] = [mDom('dExtra', {}, { id: 'dExtraLeft' }), mDom('dExtra', {}, { id: 'dExtraMiddle' }), mDom('dExtra', {}, { id: 'dExtraRight' })]
  mDom(dExtraLeft, {}, { id: 'dTitle' });
  DA.divNames.push('dOuterTop','dTopLine', 'dTest', 'dExtra', 'dTopLeft', 'dTopMiddle', 'dTopRight', 'dTestLeft', 'dTestMiddle', 'dTestRight', 'dExtraLeft', 'dExtraMiddle', 'dExtraRight', 'dTitle');

}

async function switchToMenu(evOrMenu) {
  if (isdef(DA.menu)) pollOff();
  const ev = isDict(evOrMenu) ? evOrMenu : { target: getElementWithAttribute('key', isString(evOrMenu) ? evOrMenu : DA.menu || localStorage.getItem('menu') || 'games') };
  const [prevElem, elem] = hToggleClassMenu(ev);
  const menu = elem.getAttribute('key');
	//console.log('switchToMenu', menu, ev);
  assertion(menu, 'CATASTROPHIC FAILURE!!!');
  DA.menu = menu;
  localStorage.setItem('menu', menu);
  await updateMain(true);
}





