onload = start;

async function start() { TESTING = true; await prelims();}// await test179_image9(); } //async function start() { TESTING = true; await prelims(); }async function start() { TESTING = true; await test155(); }
// async function start() { await test179_image9(); } //async function start() { TESTING = true; await prelims(); }async function start() { TESTING = true; await test155(); }
// async function start() { await test183(); } //test0(); } //test191_starImages(); }

async function test0() {
  let d1 = mDom(document.body, { bg: 'red', hline: 0, margin: 0 }, { html: '&nbsp;' });
  let [w, h, margin, padding, border, sz] = [500, 500, 20, 30, 8, 50]; //25;
  let dParent = mDom(d1, { w, h, bg: 'inherit', fg: 'inherit' }); //, { border: `${border}px solid #555`, wbox: true, position: 'relative', w, h, bg: '#242430', margin, padding }, { id: 'dCanvas' });
  showStyles(dParent);
  let d = mDom(dParent, { w: sz, h: sz, margin }, { html: 'hallo' }); //default is bg=rgba(0,0,0,0) fg=rgb(0,0,0)
  showStyles(d);
}
function showStyles(elem) { let st = mGetStyles(elem, ['bg', 'fg']); console.log('styles', st); }
async function test192() {
  lacunaPresent();
}
async function test191_starImages() {
  await loadStarImages();
  let d = leinwand(900, 900, '#242430'); //return;
  let g = mDom(d, { display: 'grid', gridCols: 6, margin: 20, gap: 50 })
  //mStyle(g,{bg: '#242430'})
  let sz = 100;
  for (const img of M.starImages) {
    let d1 = mDom(g, { w: sz, h: sz }, { tag: 'img', src: img.src })
    //mClass(d1,'pulseFastInfinite');
  }
}
async function test190() {

  // console.log(divideRectangleIntoGrid(500,500,8)); // 3,3
  // console.log(divideRectangleIntoGrid(800,500,8)); // 2,4
  // console.log(divideRectangleIntoGrid(500,500,22)); //5,5 
  // console.log(divideRectangleIntoGrid(800,500,22)); // 4,6

  lacunaPresent();
}
async function test189_placeMeeple() { //geht!!!
  let d1 = mDom(document.body, { hline: 0, margin: 0 }, { html: '&nbsp;' });
  let [w, h, margin, padding, border] = [500, 500, 25, 0, 7]; //25;
  let d = mDom(d1, { border: `${border}px solid #555`, wbox: true, position: 'relative', w, h, bg: '#242430', margin, padding, round: true, className: 'lensBorder' }, { id: 'dCanvas' });
  d.onclick = ev => {
    console.log('click', ev.clientX - d.offsetLeft, ev.clientY - d.offsetTop);
    let sz = rNumber(10, 50);
    let [x, y] = [ev.clientX - d.offsetLeft - sz / 2 - border, ev.clientY - d.offsetTop - sz / 2 - border];
    mDom(d, { w: sz, h: sz, bg: 'red', position: 'absolute', left: x, top: y });
  }
}
async function test189h_placeMeeple() { //geht!!!
  let d1 = mDom(document.body, { hline: 0, margin: 0 }, { html: '&nbsp;' });
  let [w, h, margin, padding, border] = [500, 500, 25, 0, 7]; //25;
  let d = mDom(d1, { border: `${border}px solid #555`, wbox: true, position: 'relative', w, h, bg: '#242430', margin, padding, round: true, className: 'lensBorder' }, { id: 'dCanvas' });
  d.onclick = ev => {
    console.log('click', ev.clientX - d.offsetLeft, ev.clientY - d.offsetTop);
    let sz = rNumber(10, 50);
    let [x, y] = [ev.clientX - d.offsetLeft - sz / 2 - border, ev.clientY - d.offsetTop - sz / 2 - border];
    mDom(d, { w: sz, h: sz, bg: 'red', position: 'absolute', left: x, top: y });
  }
}
async function test189g_placeMeeple() { //geht!!!
  let d1 = mDom(document.body, { hline: 0, margin: 0 }, { html: '&nbsp;' });
  let [w, h, margin, padding, border] = [500, 500, 25, 0, 7]; //25;
  let d = mDom(d1, { border: `${border}px solid #555`, wbox: true, position: 'relative', w, h, bg: '#242430', margin, padding, round: true, className: 'lensBorder' }, { id: 'dCanvas' });
  // showBox(d,0,0); 
  d.onclick = ev => {
    console.log('click', ev.clientX - d.offsetLeft, ev.clientY - d.offsetTop);
    //let d=mBy('dCanvas');
    let sz = rNumber(10, 50);
    let [x, y] = [ev.clientX - d.offsetLeft - sz / 2 - border, ev.clientY - d.offsetTop - sz / 2 - border];
    mDom(d, { w: sz, h: sz, bg: 'red', position: 'absolute', left: x, top: y });

    // showBox(d, ev.clientX-d.offsetLeft-sz/2, ev.clientY-d.offsetTop-sz/2);
    // mDom(d,{w:sz,h:sz,bg:'red',position:'absolute',left:ev.clientX,top:ev.clientY});
  }
}
async function test189f_placeMeeple() { //geht!!!
  let d1 = mDom(document.body, { hline: 0, margin: 0 }, { html: '&nbsp;' });
  let d = mDom(d1, { position: 'relative', w: 500, h: 400, bg: '#242430', margin: 30, padding: 0 }, { id: 'dCanvas' });
  showBox(d, 0, 0);
  d.onclick = ev => console.log('click', ev.clientX - d.offsetLeft, ev.clientY - d.offsetTop);
}
async function test189e_placeMeeple() { //geht!!!
  let d1 = mDom(document.body, { hline: 0, margin: 10 }, { html: '&nbsp;' });
  let d = mDom(d1, { w: 500, h: 400, bg: '#242430', margin: 10, padding: 0 }, { id: 'dCanvas' });
  showBox(d, 0 + d.offsetLeft, 0 + d.offsetTop);
}
async function test189d_placeMeeple() { //geht!!!
  let d1 = mDom(document.body, { hline: 0 }, { html: '&nbsp;' });
  let d = mDom(d1, { w: 500, h: 400, bg: '#242430', margin: 10, padding: 0 }, { id: 'dCanvas' });
  showBox(d, 0 + d.offsetLeft, 0 + d.offsetTop);
}
async function test189c_placeMeeple() { //geht!!!
  let d1 = mDom(document.body, { hline: 0 }, { html: '&nbsp;' });
  let d = mDom(d1, { w: 500, h: 400, bg: '#242430', margin: 10, padding: 0 }, { id: 'dCanvas' });
  showBox(d, 0, 0);
}
async function test189b_placeMeeple() { //margin collapse
  let d = mDom(document.body, { w: 500, h: 400, bg: '#242430', margin: 10, padding: 0 }, { id: 'dCanvas' });
  showBox(d, 0, 0)
}
async function test189a_placeMeeple() { //geht!!!
  let d = mDom(document.body, { w: 500, h: 400, bg: '#242430', margin: 0, padding: 0 }, { id: 'dCanvas' });
  showBox(d, 0, 0)
}
async function test188_placeMeeple() { //geht!!!
  let d = mDom(document.body);
  showBox(d, 0, 0)
}
async function test187_placeMeeple() { //geht!!!
  showBox(document.body, 0, 0)
}
async function test186_placeMeeple() {
  let d1 = clearDiv();

  // let [w, h, margin, padding] = [500, 500, 0,0]; //25;
  let d2 = mDom(d1, { w: 500, h: 400, bg: '#242430', margin: 0, padding: 0 }, { id: 'dCanvas' }); //, position:'relative'
  // mClass(d, 'lensBorder');
  // mStyle(d,{wbox:true})

  document.onclick = ev => {
    let d = mBy('dCanvas');
    let sz = rNumber(10, 50);
    mDom(d, { w: sz, h: sz, bg: 'red', position: 'absolute', left: ev.clientX, top: ev.clientY });
  }

}
async function test185_placeMeeple() { //GEHT!!!
  let d1 = clearDiv();
  document.onclick = ev => {
    let d = mBy('dCanvas');
    let sz = rNumber(10, 50);
    mDom(d1, { w: sz, h: sz, bg: 'red', position: 'absolute', left: ev.clientX, top: ev.clientY });
  }

}
async function test184_placeMeeple() {
  let d1 = clearDiv();
  let [w, h, padding] = [500, 500, 50]; //25;
  let d = mDom(d1, { w, h, bg: '#242430', margin: 10, padding, round: true }, { id: 'dCanvas' }); //, position:'relative'
  mClass(d, 'lensBorder');
  mStyle(d, { wbox: true })

  document.onclick = ev => {
    let d = mBy('dCanvas');
    let sz = rNumber(10, 50);
    mDom(d, { w: sz, h: sz, bg: 'red', position: 'absolute', left: ev.clientX, top: ev.clientY });
  }

}
async function test183() {
  B = {};
  await loadStarImages();
  let [n, nTypes] = [49, 7]; //types soll < 9 sein
  let fenPoints = lacunaGenerateFenPoints(n, nTypes, 1000, 1000, 0.7); //console.log(jsCopy(points));
  let d1 = clearDiv();
  let [w, h, padding] = [500, 500, 50]; //25;
  let d = mDom(d1, { w, h, bg: '#242430', margin: 10, padding, round: true }, { id: 'dCanvas' });
  mClass(d, 'lensBorder');
  let sz = 30;
  let points = [];
  for (const p of fenPoints) {
    let p1 = pointFromFenRaw(p); // console.log(p1);
    p1.x = mapRange(p1.x, 0, 1000, 0, w);
    p1.y = mapRange(p1.y, 0, 1000, 0, h);
    p1 = pointAddMargin(p1, padding);
    drawPointStar(p1, d, sz);
    points.push(p1);
    //p1 = drawPoint(dParent, p1);
  }
  B.diPoints = list2dict(points, 'id');
  console.log(points[0], getSetOfDifferentTypesOfPoints(points));
  B.obstacleThreshold = 10; B.triggerThreshold = 8;
  let result = findIsolatedPairs(points, 'type', B.obstacleThreshold); //je groesser threshold umso mehr obstacles werden detected!
  let pairs = result.isolatedPairs;

  let pair = pairs[0]; //console.log(pairs)

  //drawInteractiveLine(pair[0],pair[1],'white',1); return;

  let lines = []; B.lines = lines;
  pairs.map(pair => lines.push({ p1: pair[0], p2: pair[1], div: drawInteractiveLine(d,pair[0], pair[1], 'lightblue', 1) })); //rColor(), 1)));
  d.onmousemove = onMouseMoveLine;

  B.counter = 0;
  B.meeples = [];
  //d.onclick = lacunaOnclick;
  //for some reason geht das onclick  auf d nicht immer!
  document.onclick = placeYourMeeple; // ()=>console.log('click',B.counter++)


  //console.log(lines[0]);


}
async function test182() {
  let list = range(1, 9).map(n => `../assets/icons/stars/blue${n}.png`);
  let starImages = await preloadImages(list);
  console.log('starImages', starImages);

  let d1 = mDom(document.body, { className: 'h100', hline: 0 }, { html: '&nbsp;' }); //margin-collapse problem!!!!
  let d = mDom(d1, { w: 500, h: 500, bg: '#242430', margin: 10 });

  let im = starImages[0];
  let [w, h] = [im.width, im.height]; console.log('w,h', w, h);

  let img = cloneImage(starImages[0], d)


}
async function test181() {
  let list = range(1, 9).map(n => `../assets/icons/stars/blue${n}.png`);
  let starImages = await preloadImages(list);

  let d1 = mDom(document.body, { className: 'h100' });
  let wrapper = mDom(d1, { padding: 10 });
  let d = mDom(wrapper, { w: 500, h: 500, bg: '#242430' })


}
async function test180() {

  let d1 = mDom(document.body, { className: 'content' });
  let d = mDom(d1, { w100: true, h100: true, bg: '#242430' })


  for (const n of range(1, 9)) {
    let url = `../assets/icons/stars/blue${n}.png`;
    mDom(d, { w: 100, h: 100 }, { tag: 'img', src: url });
  }

  //cropImage('../assets/icons/stars_blue.jpg',d);
  //loadAndDivideImage('../assets/icons/stars_blue.jpg',d);
  //mDom(document.body,{hmin:300,bg:'violet',sdisplay:'flex',gap:20,justify:'center',align:'center'});
}


async function test179_image9() {
  let d = mDom(document.body, { margin: 0, padding: 0, bg: 'black', h: '100vh' }); //,display:'flex',jcontent:'center',aitems:'center' });

  // document.body.innerHTML=''; document.body.style.backgroundColor = 'black'; return;
  // let d = clearDiv({bg:'#242430',w100:true, h100:true},{html:'hallo'}); return;
  // loadAndDivideImage('../assets/icons/stars_blue.jpg',d);

}
async function test178_lacunaPresent() {
  //setup
  let [n, neach] = [50, 10];
  let points = lacunaGenerateFenPoints(n, neach, 1000, 1000, 0.7); //console.log(jsCopy(points));

  let d = clearDiv();

  //generateStar(d,100,200);return;

  lacunaPresentPoints(points, d); //present

}
async function test177_lacunaTest_mapRange() {
  let [w, h, sz, margin, padding, n, neach] = [600, 600, 20, 10, 20, 50, 10];
  B.sz = sz;
  let points = lacunaGenerateFenPoints(n, neach, 1000, 1000, 0.7); console.log(jsCopy(points));
  let d = clearDiv();
  let dParent = B.dParent = mDom(d, { w, h, margin, padding, position: 'relative', bg: '#eee' }, { id: 'dCanvas' });
  for (const p of points) {
    let p1 = pointFromFenRaw(p); //console.log(p1);
    p1.x = mapRange(p1.x, 0, 1000, 0, w - sz);
    p1.y = mapRange(p1.y, 0, 1000, 0, h - sz);
    p1 = pointAddMargin(p1, padding);
    p1.sz = sz;
    p1 = drawPoint(dParent, p1);
    //console.log(p1);
  }
}
async function test176_lacunaTest_wh() {
  let [w, h, sz, margin, padding, n, neach] = [600, 600, 20, 20, 20, 50, 10];
  B.sz = sz;
  let points = ['0_0', '90_90', '0_90', '90_0']; // 
  points = lacunaGenerateFenPoints(n, neach, w - sz, h - sz); console.log(jsCopy(points));
  let d = clearDiv();
  let dParent = B.dParent = mDom(d, { w, h, margin, padding, position: 'relative', bg: '#eee' }, { id: 'dCanvas' });
  for (const p of points) {
    let p1 = pointFromFenRaw(p); //console.log(p1);
    p1 = pointAddMargin(p1, padding);
    p1.sz = sz;
    p1 = drawPoint(dParent, p1);
    //console.log(p1);
  }
}
async function test175_lacunaTest() {
  let [w, h, sz, margin, n, neach] = [600, 600, 20, 30, 100, 5];
  B.sz = sz;
  let points = lacunaGenerateFenPoints(n, neach, w - 2 * margin - sz / 2, h - 2 * margin - sz / 2); console.log(jsCopy(points));
  let d = clearDiv();
  let dParent = B.dParent = mDom(d, { w, h, bg: '#eee', round: true }, { id: 'dCanvas' });
  for (const p of points) {
    let p1 = pointFromFenRaw(p);
    p1 = pointAddMargin(p1, margin);
    p1 = drawPoint(dParent, p1);
    console.log(p1);
  };
}
async function test174_lacunaTest() {
  let [w, h, sz, margin, n, neach] = [800, 800, 30, 30, 70, 7];
  B.sz = sz;
  let points = B.points = lacunaGeneratePointsMargin(w, h, margin, n, neach, sz, .6); //console.log(jsCopy(points[0]));
  let d = clearDiv();
  let dParent = B.dParent = mDom(d, { w, h, position: 'absolute', left: 100, top: 50, bg: '#eee' }, { id: 'dCanvas' });
  Items = lacunaDrawPoints(dParent, points); //console.log(Items)
  B.meeples = [];

  let result = findIsolatedPairs(points, sz / 2); //sz*1.2); console.log(result);
  let pairs = result.isolatedPairs;

  let pair = pairs[0]; console.log(pair)

  //drawInteractiveLine(pair[0],pair[1]);

  let lines = []; B.lines = lines;
  pairs.map(x => lines.push(drawInteractiveLine(d,x[0], x[1], rColor(), 1)));
  document.onmousemove = onMouseMoveLine;
}
// *** ab da ist DA ***
async function test173_lacuna() {
  // DA.gamename = 'lacuna';
  // await onclickStartGame();
  //localStorage.clear();
  // await showGames();
  // let players={};
  // for(const name of [getUname(),'felix','amanda']){
  //   players[name]=jsCopy(Serverdata.users[name]);
  //   players.playmode = 'human';
  // }
  // let options = {gamemode:'multi',numPoints:70,numColors:10,numMeeples:9};
  // let gamename = 'lacuna';
  // await startGame(gamename, players, options);
  //await startGame('lacuna',{mimi:''});
}
async function test172_lacunaTest() {
  let [w, h, sz, margin, n, neach] = [800, 800, 30, 30, 70, 7];
  DA.sz = sz;
  let points = DA.points = lacunaGeneratePointsMargin(w, h, margin, n, neach, sz, .6); //console.log(jsCopy(points[0]));
  let d = clearDiv();
  let dParent = DA.dParent = mDom(d, { w, h, position: 'absolute', left: margin, top: margin, bg: '#eee' }, { id: 'dCanvas' });
  Items = lacunaDrawPoints(dParent, points); //console.log(Items)
  DA.meeples = [];

  let result = findIsolatedPairs(points, sz / 2); //sz*1.2); console.log(result);
  let pairs = result.isolatedPairs;

  let pair = pairs[0]; console.log(pair)

  //drawInteractiveLine(pair[0],pair[1]);

  let lines = []; DA.lines = lines;
  pairs.map(x => lines.push(drawInteractiveLine(d,x[0], x[1], rColor(), 1)));
  document.onmousemove = onMouseMoveLine;
}
async function test171_blank() {
  //how do I start a game?
}
async function test170_crazu() {
  //let d=clearFlex();
  //let canvas = mCanvas
  let colors = { "Red": "#E63946", "Green": "#06D6A0", "Blue": "#118AB2", "Cyan": "#0F4C75", "Magenta": "#D81159", "Yellow": "#FFD166", "Orange": "#F4A261", "Purple": "#9D4EDD", "Pink": "#FF80AB", "Brown": "#8D6E63", "Lime": "#A7FF83", "Indigo": "#3A0CA3", "Violet": "#B5838D", "Gold": "#F5C518", "Teal": "#008080" };


}
async function test162_asklist() {
  let [word, num] = ['insects', 200];
  let o = await mPostRoute('ask_list', { word, num });
  console.log(o);
  let d = clearFlex();
  showYaml(o, `list of ${num} ${pluralOf(word)}`, d);
}
async function test161_sortlist() {
  let x = await mGetYaml('../y/lists.yaml');
  for (const k in x) {
    let list = x[k].map(x => normalizeString(x));
    list = arrRemoveDuplicates(list)
    arrSort(list);
    x[k] = list;
  }
  let y = await mPostYaml(x, '../y/lists.yaml'); console.log(y)
}
async function test160_asklist() {
  let [word, num] = ['animal', 10];
  let res = await mPostRoute('ask_list', { word, num });
  console.log(res);
  return;
  let d = clearFlex();
  let prompt = 'list of 300 animals';
  let o = await askOpenaiListOf('animal', 300); console.log(o);
  //let o = await askOpenai(prompt);
  showYaml(o, prompt, d);
}
async function test159_askword() {
  let d = clearFlex();
  let w = 'python';
  let o = await askOpenaiKeyword(w, 'animal'); console.log(o);
  showYaml(o, w, d);
}
async function test159() {
  //let result = await mGather(null,{},{content:{word:'',category:''},type:'multi'});
  let result = { word: 'python', category: 'animal' };
  console.log(result);
  let prompt = pYamlDetails(result.word, result.category); //'list of 100 very different documentary subjects?';
  let answer = await askOpenaiYaml(prompt, 'yaml');
  console.log(typeof (answer), answer); //,o, typeof(o))
  if (answer.includes('```')) answer = stringBeforeLast(stringAfter(answer, '\n'), '\n');
  console.log(answer, typeof (answer));

  let o = jsyaml.load(answer); console.log('o', o, typeof o);


}
async function test158_ask() {
  let prompt = 'list of 100 very different documentary subjects?';
  let answer = await askOpenai(prompt);
  let d = clearFlex(); //return;
  mDom(d, {}, { tag: 'h1', html: prompt });
  mDom(d, {}, { tag: 'pre', html: answer });
}
async function test157_gpt() {
  let d = clearFlex(); //return;
  const prompt = 'list of 100 very different documentary subjects?';
  let answer = await mPostRoute('ask', { prompt });
  console.log(answer);
  let dTable = mDom(d, { bg: 'white', fg: 'black' });
  mDom(dTable, {}, { tag: 'h1', html: prompt });
  mDom(dTable, {}, { tag: 'pre', html: answer });
}
async function test156_wiki() {
  let d = clearFlex()
  const keyword = 'how far away is the sun from the earth?';
  try {
    const para = await askWiki(keyword);
    let dTable = mDom(d, { bg: 'white', fg: 'black' });
    mDom(d, {}, { tag: 'h1', html: para.title });
    mDom(d, {}, { html: para.extract });
    console.log(para, typeof para);
  } catch (error) {
    console.error('Error:', error);
  }
}
async function test155() { await prelims(); }

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



