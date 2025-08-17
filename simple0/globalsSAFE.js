var A = null;
var B = {};
var Menu = null;
var T = null;
var Tid = null;
var U = {};
var ColorThiefObject;
var WhichCorner = 0;
const CORNERS0 = ['♠', '♡']; //, '♣', '♢'];
const CORNERS = ['◢', '◣', '◤', '◥'];
const CORNERS2 = ['⬔', '⬕'];
const CORNERS3 = ['⮜', '⮝', '⮞', '⮟'];
const CORNERS4 = ['⭐', '⭑']; //, '⭒', '⭓'];
const CORNERS5 = ['⬛', '⬜']; //, '⭒', '⭓'];
const ANIM = {};
var Session = {};
var Clientdata = {};
var AD;
var ADS;
var aiActivated;
var Animation1;
var AREAS = {};
var AU = {};
var auxOpen;
var Categories;
var ColorDi;
var ColorNames;
var currentGame = IS_TESTING ? 'gTouchPic' : 'sequence';
var currentLanguage = 'E';
var currentLevel;
var DA = {};
var DB;
var draggedElement;
var dragStartOffset;
var dropPosition = 'none';
var FUNCTIONS = {
  instanceof: 'instanceOf',
  prop: (o, v) => isdef(o[v]),
  no_prop: (o, v) => nundef(o[v]),
  no_spec: (o, v) => false,
}
var G = null;
var gameSequence = IS_TESTING ? ['gSayPicAuto', 'gTouchPic', 'gTouchColors', 'gWritePic', 'gMissingLetter', 'gSayPic'] : ['gSayPic', 'gTouchColors', 'gWritePic'];
var Goal;
var I;
var INFO = {};
var IS_TESTING = true;
var IsAnswerCorrect;
var IsControlKeyDown = false;
var Items = {};
var KeySets;
var lastPosition = 0;
var LevelChange = true;
var M = {};
var MAGNIFIER_IMAGE;
var MAXLEVEL = 10;
var nMissing;
var P;
var Pictures = [];
var Players;
var PROTO;
var R;
var S = {};
var sData;
var Selected;
var Serverdata = {};
var Settings;
var Socket = null;
var SPEC = null;
var Speech;
var symbolDict;
var Syms;
var TESTING = false;
var TO = {};
var TOFleetingMessage;
var TOList;
var TOMain;
var TOMan;
var TOTrial;
var UI = {};
var uiActivated = false;
var UID = 0;
var UIDCounter = 0;
var UIROOT;
var Username;
var VERBOSE = false;
var Z = {};
var Zones = {};

const BLUE = '#4363d8';
const BROWN = '#96613d';
const FIREBRICK = '#800000';
const GREEN = '#3cb44b';
const BLUEGREEN = '#004054';
const LIGHTBLUE = '#42d4f4';
const LIGHTGREEN = '#afff45';
const OLIVE = '#808000';
const ORANGE = '#f58231';
const NEONORANGE = '#ff6700';
const PURPLE = '#911eb4';
const RED = '#e6194B';
const TEAL = '#469990';
const YELLOW = '#ffe119';
const NEONYELLOW = '#efff04';
const YELLOW2 = '#fff620';
const ColorList = ['lightgreen', 'lightblue', 'yellow', 'red', 'green', 'blue', 'purple', 'violet', 'lightyellow', 'teal', 'orange', 'brown', 'olive', 'deepskyblue', 'deeppink', 'gold', 'black', 'white', 'grey'];
const levelColors = [LIGHTGREEN, LIGHTBLUE, YELLOW, 'orange', RED, GREEN, BLUE, PURPLE, YELLOW2, 'deepskyblue',
  'deeppink', TEAL, ORANGE, 'seagreen', FIREBRICK, OLIVE,
  '#ffd8b1', '#000075', '#a9a9a9', '#ffffff', '#000000', 'gold', 'orangered', 'skyblue', 'pink', 'deeppink',
  'palegreen', '#e6194B'];
const names = ['felix', 'amanda', 'sabine', 'tom', 'taka', 'microbe', 'dwight', 'jim', 'michael', 'pam', 'kevin', 'darryl', 'lauren', 'anuj', 'david', 'holly'];
var SHAPEFUNCS = { 'circle': 'agCircle', 'hex': 'agHex', 'rect': 'agRect', };
var PolyClips = {
  diamond: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
  hex: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
  pentagon: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
  octagon: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
  test1: 'inset(50% 0% 100% 25% 100% 75% 50% 100% 0% 75% 0% 25% round 10px)',
  test0: 'inset(45% 0% 33% 10% round 10px)',
  hexagon: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
  hexF: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  hexFlat: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  hexflat: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  rect: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  sq: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  square: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  tri: 'polygon(50% 0%, 100% 100%, 0% 100%)',
  triangle: 'polygon(50% 0%, 100% 100%, 0% 100%)',
  triUp: 'polygon(50% 0%, 100% 100%, 0% 100%)',
  triup: 'polygon(50% 0%, 100% 100%, 0% 100%)',
  triDown: 'polygon(0% 0%, 100% 0%, 50% 100%)',
  tridown: 'polygon(0% 0%, 100% 0%, 50% 100%)',
  triright: 'polygon(0% 0%, 100% 50%, 0% 100%)',
  triRight: 'polygon(0% 0%, 100% 50%, 0% 100%)',
  trileft: 'polygon(0% 50%, 100% 0%, 100% 100%)',
  triLeft: 'polygon(0% 50%, 100% 0%, 100% 100%)',
  splayup: 'polygon(0% 70%, 100% 70%, 100% 100%, 0% 100%)',
  splayleft: 'polygon(0% 0%, 15% 0%, 15% 100%, 0% 100%)',
  splay: 'polygon(0% 0%, 20% 0%, 20% 100%, 0% 100%)',
  splayright: 'polygon(80% 0%, 100% 0%, 100% 100%, 80% 100%)',
  splaydown: 'polygon(0% 0%, 100% 0%, 100% 30%, 0% 30%)',
}
const STYLE_PARAMS_2 = {
  align: 'text-align',
  alignItems: 'align-items',
  alignContent: 'align-content',
  alignSelf: 'align-self',
  bg: 'background-color',
  aspectRatio: 'aspect-ratio',
  bgAttach: 'background-attachment',
  bgBlend: 'background-blend-mode', //'mix-blend-mode', //
  bgImage: 'background-image',
  bgRepeat: 'background-repeat',
  bgSize: 'background-size',
  caret: 'caret-color',
  clip: 'clip-path',
  deco: 'text-decoration',
  dir: 'flex-direction',
  editable: 'contenteditable',
  family: 'font-family',
  fontSize: 'font-size',
  fStyle: 'font-style',
  fz: 'font-size',
  grow: 'flex-grow',
  h: 'height',
  hgap: 'column-gap',
  hmin: 'min-height',
  hmax: 'max-height',
  hline: 'line-height',
  justifyItems: 'justify-items',
  justifyContent: 'justify-content',
  justifySelf: 'justify-self',
  l: 'left',
  lspace: 'letter-spacing',
  lheight: 'line-height',
  m: 'margin',
  mauto: 'margin',
  k: 'cursor',
  iplace: 'place-items', //bei display:grid
  matop: 'margin-top',
  maleft: 'margin-left',
  mabottom: 'margin-bottom',
  maright: 'margin-right',
  origin: 'transform-origin',
  overx: 'overflow-x',
  overy: 'overflow-y',
  patop: 'padding-top',
  paleft: 'padding-left',
  pabottom: 'padding-bottom',
  paright: 'padding-right',
  place: 'place-items',
  rounding: 'border-radius',
  shrink: 'flex-shrink',
  vert_align: 'align-items',
  vgap: 'row-gap',
  w: 'width',
  wmin: 'min-width',
  wmax: 'max-width',
  weight: 'font-weight',
  x: 'left',
  xover: 'overflow-x',
  y: 'top',
  yover: 'overflow-y',
  z: 'z-index'
};
const commandWords = [
  "Accept", "Achieve", "Add", "Adjust", "Agree", "Alert", "Allow", "Analyze", "Answer", "Apply",
  "Arrange", "Ask", "Assemble", "Assign", "Assist", "Attach", "Attempt", "Avoid", "Begin", "Believe",
  "Build", "Calculate", "Call", "Cancel", "Capture", "Change", "Choose", "Clear", "Collect", "Combine",
  "Compare", "Complete", "Configure", "Confirm", "Connect", "Conquer", "Consult", "Continue", "Control", "Convert",
  "Copy", "Count", "Create", "Cross", "Customize", "Cut", "Decide", "Declare", "Decode", "Deliver",
  "Demonstrate", "Describe", "Design", "Detect", "Develop", "Diagnose", "Direct", "Discover", "Display", "Distribute",
  "Divide", "Document", "Draw", "Drive", "Edit", "Eliminate", "Embrace", "Enable", "Engage", "Enhance",
  "Ensure", "Enter", "Equalize", "Establish", "Evaluate", "Examine", "Execute", "Expand", "Explain", "Explore",
  "Export", "Extract", "Facilitate", "Feed", "Fetch", "File", "Fill", "Filter", "Find", "Fix",
  "Focus", "Follow", "Format", "Forward", "Generate", "Give", "Go", "Group", "Guide", "Handle",
  "Hide", "Highlight", "Hold", "Identify", "Ignore", "Illustrate", "Implement", "Improve", "Include", "Indicate",
  "Inform", "Initiate", "Insert", "Inspect", "Install", "Integrate", "Interpret", "Investigate", "Invite", "Join",
  "Jump", "Justify", "Keep", "Kick", "Label", "Launch", "Lead", "Learn", "Leave", "Lend",
  "Let", "Link", "Listen", "Locate", "Lock", "Log", "Look", "Maintain", "Manage", "Map",
  "Mark", "Match", "Measure", "Merge", "Minimize", "Modify", "Monitor", "Move", "Name", "Navigate",
  "Negotiate", "Notify", "Observe", "Obtain", "Offer", "Open", "Operate", "Optimize", "Organize", "Overcome",
  "Override", "Own", "Paint", "Pair", "Pass", "Pause", "Perform", "Permit", "Plan", "Play",
  "Point", "Position", "Post", "Prepare", "Present", "Prevent", "Print", "Proceed", "Process", "Produce",
  "Program", "Protect", "Prove", "Provide", "Pull", "Push", "Question", "Quit", "Raise", "Reach",
  "Read", "Realize", "Reboot", "Recall", "Receive", "Recommend", "Record", "Recover", "Reduce", "Reflect",
  "Refuse", "Register", "Regulate", "Reinforce", "Reject", "Release", "Rely", "Remove", "Repair", "Repeat",
  "Replace", "Report", "Request", "Require", "Research", "Reset", "Respond", "Restore", "Restrict", "Retrieve",
  "Return", "Review", "Rewrite", "Run", "Save", "Scan", "Schedule", "Search", "Secure", "Select",
  "Send", "Separate", "Serve", "Set", "Share", "Shift", "Show", "Simplify", "Solve", "Sort",
  "Specify", "Split", "Start", "Stop", "Store", "Stream", "Submit", "Suggest", "Summarize", "Support",
  "Supply", "Synchronize", "Tag", "Take", "Teach", "Tell", "Test", "Think", "Track", "Trade",
  "Train", "Transfer", "Translate", "Trigger", "Trust", "Turn", "Type", "Undo", "Uninstall", "Unlock",
  "Unpack", "Update", "Upgrade", "Upload", "Use", "Utilize", "Validate", "Verify", "View", "Visit",
  "Wait", "Walk", "Warn", "Watch", "Work", "Write", "Yield", "Zoom", "Act", "Align",
  "Amplify", "Balance", "Capture", "Check", "Click", "Compose", "Deduce", "Execute", "Highlight", "Trigger"
];

