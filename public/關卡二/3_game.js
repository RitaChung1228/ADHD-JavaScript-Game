let wordImages = [];
let pictureImages = [];
let mixupImages = [];
let unknownImage;
let listPaper;
let backgroundImage;

// 清單顯示順序（可依你的 UI 調整）
const ITEM_NAMES = [
  "鑰匙", "學生證", "鉛筆盒", "資料夾", "耳機",
  "筆電", "充電線", "便利貼", "錢包", "雨傘"
];

// pairId 對照（0~9）
const nameToPairId = {
  "充電線": 0, "耳機": 1, "雨傘": 2, "便利貼": 3, "筆電": 4,
  "資料夾": 5, "鉛筆盒": 6, "學生證": 7, "錢包": 8, "鑰匙": 9
};

function preload() {
  backgroundImage = loadImage("../images/diningroom/6.PNG");

  // 背面
  unknownImage = loadImage("../images/card/未翻開/unknown.svg");

  // 清單紙（你資料夾是在 card/收拾清單）
  listPaper = loadImage("../images/card/收拾清單/list.svg");

  // 文字卡（10）
  wordImages[0] = loadImage("../images/card/文字/充電線.svg");
  wordImages[1] = loadImage("../images/card/文字/耳機.svg");
  wordImages[2] = loadImage("../images/card/文字/雨傘.svg");
  wordImages[3] = loadImage("../images/card/文字/便利貼.svg");
  wordImages[4] = loadImage("../images/card/文字/筆電.svg");
  wordImages[5] = loadImage("../images/card/文字/資料夾.svg");
  wordImages[6] = loadImage("../images/card/文字/鉛筆盒.svg");
  wordImages[7] = loadImage("../images/card/文字/學生證.svg");
  wordImages[8] = loadImage("../images/card/文字/錢包.svg");
  wordImages[9] = loadImage("../images/card/文字/鑰匙.svg");

  // 圖片卡（10）— 配對成功後要顯示
  pictureImages[0] = loadImage("../images/card/圖片/充電線.svg");
  pictureImages[1] = loadImage("../images/card/圖片/耳機.svg");
  pictureImages[2] = loadImage("../images/card/圖片/雨傘.svg");
  pictureImages[3] = loadImage("../images/card/圖片/便利貼.svg");
  pictureImages[4] = loadImage("../images/card/圖片/筆電.svg");
  pictureImages[5] = loadImage("../images/card/圖片/資料夾.svg");
  pictureImages[6] = loadImage("../images/card/圖片/鉛筆盒.svg");
  pictureImages[7] = loadImage("../images/card/圖片/學生證.svg");
  pictureImages[8] = loadImage("../images/card/圖片/錢包.svg");
  pictureImages[9] = loadImage("../images/card/圖片/鑰匙.svg");

  // 混淆卡（4）
  mixupImages[0] = loadImage("../images/card/混淆/三角錐.svg");
  mixupImages[1] = loadImage("../images/card/混淆/吸塵器.svg");
  mixupImages[2] = loadImage("../images/card/混淆/板擦.svg");
  mixupImages[3] = loadImage("../images/card/混淆/微波爐.svg");
}

// ---------- 狀態 ----------
let cards = [];
let opened = [];                 // 目前翻開但尚未判定的卡（最多 2 張）
let lockInput = false;           // 判定/翻回期間鎖住點擊
let matched = new Array(10).fill(false);
let matchedCount = 0;

// 倒數（秒）
let totalSeconds = 360;
let startMillis = 0;
let gameOver = false;

function setup() {
  createCanvas(1400, 700);
  textFont("Microsoft JhengHei");

  startMillis = millis();

  buildDeck();      // 24 張
  layoutCards6x4(); // 排版
}

function draw() {
  image(backgroundImage, 0, 0, width, height);

  drawChecklist();

  // 卡牌
  for (const c of cards) c.draw();

  drawHUD();

  if (gameOver) {
    push();
    fill(0, 0, 0, 160);
    rect(0, 0, width, height);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(48);
    text(matchedCount === 10 ? "成功！" : "時間到！", width / 2, height / 2);
    pop();
    noLoop();
  }
}

// ===============================
// 牌組：10 組（文字×2）+ 4 混淆
// ===============================
function buildDeck() {
  cards = [];

  // 10 組，每組兩張「文字卡」
  for (let i = 0; i < 10; i++) {
    cards.push(new Card({
      pairId: i,
      frontWord: wordImages[i],
      frontPic: pictureImages[i],
      isDecoy: false
    }));
    cards.push(new Card({
      pairId: i,
      frontWord: wordImages[i],
      frontPic: pictureImages[i],
      isDecoy: false
    }));
  }

  // 4 張混淆卡（翻開顯示 mixup）
  for (let j = 0; j < 4; j++) {
    cards.push(new Card({
      pairId: -1,
      frontWord: mixupImages[j],
      frontPic: null,
      isDecoy: true
    }));
  }

  shuffleArray(cards);
}

// ===============================
// 排版：6×4
// ===============================
function layoutCards6x4() {
  const leftPanelW = 360;

  const boardX = leftPanelW + 10;
  const boardY = 30;
  const boardW = width - boardX - 30;
  const boardH = height - 140;

  const cols = 6;
  const rows = 4;
  const gap = 16;

  const cardW = (boardW - gap * (cols - 1)) / cols;
  const cardH = (boardH - gap * (rows - 1)) / rows;

  let idx = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = boardX + c * (cardW + gap);
      const y = boardY + r * (cardH + gap);
      cards[idx].setRect(x, y, cardW, cardH);
      idx++;
    }
  }
}

// ===============================
// 點擊：翻牌（新規則）
// ===============================
function mousePressed() {
  if (gameOver) return;
  if (lockInput) return;

  const clicked = cards.find(c => c.contains(mouseX, mouseY));
  if (!clicked) return;

  if (clicked.isMatched) return;
  if (clicked.isFaceUp) return;

  // 翻開
  clicked.isFaceUp = true;
  opened.push(clicked);

  // 只要還沒滿兩張就不判斷（符合你「不要自動翻回」）
  if (opened.length < 2) return;

  // 滿兩張就判斷
  lockInput = true;

  const a = opened[0];
  const b = opened[1];

  const isMatch =
    !a.isDecoy && !b.isDecoy &&
    a.pairId !== -1 && b.pairId !== -1 &&
    a.pairId === b.pairId;

  if (isMatch) {
    // 配對成功：兩張都改顯示「圖片卡」，鎖定為 matched
    a.isMatched = true;
    b.isMatched = true;
    a.showPicture = true;
    b.showPicture = true;

    // 清單打勾 + 進度
    if (!matched[a.pairId]) {
      matched[a.pairId] = true;
      matchedCount++;
    }

    opened = [];
    lockInput = false;

    if (matchedCount === 10) {
      gameOver = true;

      localStorage.setItem("packResult", "WIN"); // 完成
      setTimeout(() => {
      window.location.href = "4_beforeEnd.html";
      }, 900);
    }

  } else {
    // 配對失敗：停一下再一起翻回去
    setTimeout(() => {
      a.isFaceUp = false;
      b.isFaceUp = false;
      opened = [];
      lockInput = false;
    }, 650);
  }
}

// ===============================
// 左側清單
// ===============================
function drawChecklist() {
  const x = 30;
  const y = 150;

  // 清單紙（用 contain 畫會更好看，不變形）
  if (listPaper) {
    drawImageContain(listPaper, x, y - 120, 310, 360);
  } else {
    push();
    fill(255, 240);
    rect(x, y - 120, 310, 360, 16);
    pop();
  }

  push();
  fill(20);
  textAlign(LEFT, TOP);
  textSize(18);

  textSize(16);

  let lineY = y - 30;
  for (const name of ITEM_NAMES) {
    const pid = nameToPairId[name];
    const done = matched[pid];

    // 圓圈
    noFill();
    stroke(30);
    strokeWeight(1.5);
    ellipse(x + 60, lineY + 15, 14, 14);

    // 勾勾
    if (done) {
      noStroke();
      fill(30);
      text("✓", x + 55, lineY + 5);
    }

    // 文字
    noStroke();
    fill(20);
    text(name, x + 70, lineY + 5);

    lineY += 26;
  }

  pop();
}

// ===============================
// HUD：進度 + 倒數（整秒）
// ===============================
function drawHUD() {
  const padding = 18;
  const shellW = width - 2 * padding;
  const shellH = 54;
  const shellX = padding;
  const shellY = height - shellH - padding;

  // 整秒倒數（避免卡頓/跳動）
  const elapsedWhole = Math.floor((millis() - startMillis) / 1000);
  const remain = Math.max(0, totalSeconds - elapsedWhole);

  const ratio = matchedCount / 10;

  push();
  noStroke();
  fill(255, 240);
  rect(shellX, shellY, shellW, shellH, 18);

  fill(40);
  textAlign(LEFT, CENTER);
  textSize(18);
  text("剩餘時間", shellX + 18, shellY + shellH / 2);

  textAlign(RIGHT, CENTER);
  textSize(22);
  const mm = String(Math.floor(remain / 60)).padStart(2, "0");
  const ss = String(remain % 60).padStart(2, "0");
  text(`${mm}:${ss}`, shellX + shellW - 18, shellY + shellH / 2);

  // 進度條
  const barX = shellX + 140;
  const barW = shellW - 140 - 110;
  const barY = shellY + 18;
  const barH = shellH - 36;

  fill(230);
  rect(barX, barY, barW, barH, 999);

  fill(120, 200, 170);
  rect(barX, barY, barW * ratio, barH, 999);

  pop();

  // 時間到結束
  if (remain === 0 && !gameOver) {
    gameOver = true;

    localStorage.setItem("packResult", "LOSE"); // 沒完成

    setTimeout(() => {
      window.location.href = "4_beforeEnd.html";
    }, 900);
  }
}

// ===============================
// Card 類別：
// - 背面 unknown（等比例）
// - 翻開：顯示文字卡或混淆卡（等比例）
// - 配對成功：顯示圖片卡（等比例）
// ===============================
class Card {
  constructor({ pairId, frontWord, frontPic, isDecoy }) {
    this.pairId = pairId;
    this.frontWord = frontWord; // 文字卡 or 混淆卡圖
    this.frontPic = frontPic;   // 配對成功顯示的圖片卡
    this.isDecoy = isDecoy;

    this.x = 0; this.y = 0; this.w = 0; this.h = 0;

    this.isFaceUp = false;
    this.isMatched = false;
    this.showPicture = false;
  }

  setRect(x, y, w, h) {
    this.x = x; this.y = y; this.w = w; this.h = h;
  }

  contains(px, py) {
    return px >= this.x && px <= this.x + this.w &&
           py >= this.y && py <= this.y + this.h;
  }

  draw() {
    // 背面
    if (!this.isFaceUp) {
      drawImageContain(unknownImage, this.x, this.y, this.w, this.h);
      return;
    }

    // 配對成功：兩張都顯示圖片卡
    if (this.isMatched && this.showPicture && this.frontPic) {
      drawImageContain(this.frontPic, this.x, this.y, this.w, this.h);
      return;
    }

    // 翻開但未配對：顯示文字卡 or 混淆卡
    drawImageContain(this.frontWord, this.x, this.y, this.w, this.h);
  }
}

// ===============================
// 等比例置中（contain，不變形、不裁切）
// ===============================
function drawImageContain(img, x, y, w, h) {
  if (!img) return;

  const imgRatio = img.width / img.height;
  const boxRatio = w / h;

  let dw, dh;
  if (imgRatio > boxRatio) {
    dw = w;
    dh = w / imgRatio;
  } else {
    dh = h;
    dw = h * imgRatio;
  }

  const dx = x + (w - dw) / 2;
  const dy = y + (h - dh) / 2;
  image(img, dx, dy, dw, dh);
}

// ===============================
// 洗牌
// ===============================
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

