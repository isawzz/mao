
onload = start; VERBOSE = false; TESTING = true; DEV = false;

function start() { test0(); }

async function test0() {
	await DAInit();
  // await initUI();
  await switchToUser();

  if (TESTING || DEV) {
    let d = mBy('dTestRight'); mClass(d, 'button_container'); //mFlex(d);
    let names = ['gul', 'amanda', 'felix', 'lauren', 'mimi'];
    for (const name of names) { 
      let b = mDom(d, {}, { tag: 'button', html: name, onclick: async (ev) => await switchToUser(name) }); 
    }
    d = mBy('dTestLeft');
    mClass(d, 'button_container');
    mDom(d, {}, { tag: 'button', html: 'delete all', onclick: tablesDeleteAll });
    let key = 'arrow_rotate_right';
    let b = mKey(key, d, { fz: 22, }, { tag: 'button', onclick: onclickReload });
  }
  DA.menu = localStorage.getItem('menu') || 'games';
  pollInit();
  if (DA.menu == 'table') {
    await reloadTables();
    let t = DAGetTable();
    if (t) {
      DA.tid = t.id;
    } else DA.menu = 'games';
  }
  await switchToMenu();
	mStyle('dOuterTop',{h:83})

	//await switchToMenu('settings');
	//await clickOn('Themes');
}

async function clickOn(text,tag='button') {
  let parent = isDict(tag) ? tag : document; //console.log('test0', parent);
  let list = nundef(text) ? [...parent.querySelectorAll('*')] : [...parent.querySelectorAll(tag), ...parent.querySelectorAll(`[${tag}]`)];
	//console.log('test0', list);
	for(const el of list){
		//console.log('test0', el, el.innerHTML, el.value);
		if (el.innerHTML === text || el.value == text || [...el.querySelectorAll('*')].find(fs => fs.innerHTML.trim() === text)) {
			//console.log('test0', el);
			el.click();
			await mSleep(100);
			return;
		}
	}
}



