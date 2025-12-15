
let bubbleImages = [];
let backgroundImage = [];
let bubbles = [];
let bubbleQuantity = 20;
let overlayMessage = null;
let overlayExpire = 0;
let lastSpawnTime = 0;
const spawnInterval = 300; // ms
let stopped = false;
const events = [
    [0, '公車……\n今天要搭的公車是幾號？', '你拿起手機查詢公車時刻表', '查詢了n次公車時刻表', 0],
    [1, '電視說會下雨，我得去找雨傘。', '你去客廳拿了雨傘', '拿了n次雨傘', 0],
    [2, '還是喝牛奶？好像更有營養。', '你去冰箱翻找牛奶，但什麼也沒找到', '找了n次牛奶', 0],
    [3, '便利貼，便利貼，便利貼。', '你跑去看了便利貼上的待辦清單', '看了n次便利貼', 0],
    [4, '盆栽澆花了嗎？\n起床到現在好像還沒看看它。', '你把盆栽都一一澆水', '澆了n次盆栽', 0]
];


let progress = 0;
const maxProgress = 20;
let gameEnded = false;






function preload() {
    bubbleImages[0] = loadImage('../images/bubbles/bubble01.svg');
    bubbleImages[1] = loadImage('../images/bubbles/bubble02.svg');
    bubbleImages[2] = loadImage('../images/bubbles/bubble03.svg');
    backgroundImage[0] = loadImage('../images/diningroom/2.PNG');
    backgroundImage[1] = loadImage('../images/diningroom/3.PNG');
    backgroundImage[2] = loadImage('../images/diningroom/4.PNG');
    backgroundImage[3] = loadImage('../images/diningroom/5.PNG');

}

function setup() {
    createCanvas(1400, 700);
    frameRate(35);
    lastSpawnTime = millis();

    // for (let i = 0; i < backgroundImage.length; i++) {
    //     backgroundImage[i].resize(width, height);
    // }

}

function draw() {

    if (progress <= maxProgress * 0.2) {
        drawCoverImage(backgroundImage[0], 0, 0);
    } else if (progress <= maxProgress * 0.4) {
        drawCoverImage(backgroundImage[1], 0, 0);
    } else if (progress <= maxProgress * 0.6) {
        drawCoverImage(backgroundImage[2], 0, 0);
    } else if (progress <= maxProgress * 0.8) {
        drawCoverImage(backgroundImage[3], 0, 0);
    } else {
        drawCoverImage(backgroundImage[3], 0, 0);
    }
    
    // 先移除被標記的泡泡，讓總量計算正確
    bubbles = bubbles.filter(bubble => !bubble.removed);

    // 每隔 spawnInterval 毫秒新增一顆泡泡，直到達上限
    if (millis() - lastSpawnTime >= spawnInterval && bubbles.length < bubbleQuantity && !stopped) {
        spawnBubble();
        lastSpawnTime = millis();
    }

    if (stopped) {
        drawOverlay(overlayMessage);

    }

    for (let bubble of bubbles) {
        bubble.updateThought();
        bubble.drawThought();
    }

    drawProgress();

    if (progress >= maxProgress) {
        push();
        fill('rgba(0, 0, 0, 0.7)');
        rect(0, 0, width, height);
        fill('white');
        textAlign(CENTER, CENTER);
        textSize(64);
        text('你成功喝到水了！', width / 2, height / 2);
        textSize(32);
        textAlign(CENTER, TOP);
        text(buildSummaryLine(), width / 2, height / 2 + 50);

        textSize(24);
        text('點擊任意地方跳轉', width / 2, height - 100);
        pop();
        noLoop();
        // 我想再這裡等2秒再把GameEnded設為true
        setTimeout(() => {
            gameEnded = true;
        }, 1500);
    }
}

function buildSummaryLine() {
    const duration = nf(millis() / 1000, 1, 2);
    const parts = [];
    for (let event of events) {
        if (event[4] > 0) {
            let text = event[3].replace('n', event[4]);
            parts.push(text + "\n");
        }
    }
    const tasks = parts.length ? parts.join('，') : '沒有被干擾';
    return `你在${duration}秒內，${tasks}後成功喝到水了！`;
}


function mousePressed() {
    for (let bubble of bubbles) {
        if (bubble.contains(mouseX, mouseY)) {
            bubble.eliminateThought();
            progress += 1;
            break;
        }
    }
    if (gameEnded) {
        window.location.href = '4beforeEnd.html';
    }
}

class thoughtBubble {
    constructor(x, y, image, eventIndex) {
        this.x = x;
        this.y = y;
        this.image = image;

        this.size = random(150, 200);
        this.growthRate = random(1.8, 2.8); //修正：增大速度
        this.floatSpeed = random(-0.4, 0.4);

        this.eventIndex = eventIndex;
        this.text = events[eventIndex][1];
        this.overlayText = events[eventIndex][2];


        this.removed = false;

    }

    drawThought() {
        if (this.removed) {
            return;
        }

        push();
        translate(this.x, this.y);
        imageMode(CENTER);


        image(this.image, 0, 0, this.size * 1.5, this.size);
        fill('#0f172a');
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(this.size / 8);
        text(this.text, 0, 0);
        pop();
    }

    updateThought() {
        if (this.removed) {
            return;
        }
        this.size += this.growthRate;


        if (this.size >= 420) { //v修正：泡泡破掉尺寸加大
            this.popThought();
        }

        // console.log('size updated: ' + this.size);
    }

    popThought() {
        // console.log(' popped: ' + this.text);
        stopped = true;

        for (let bubble of bubbles) {
            bubble.eliminateThought();
        }

        overlayExpire = millis() + 2000; // Display for 2 seconds
        overlayMessage = this.overlayText;

        progress = max(0, progress - 4); 
        punishCount(this.eventIndex)

    }

    eliminateThought() {
        this.removed = true;

    }

    contains(px, py) {
        return dist(px, py, this.x, this.y) <= this.size / 2;
    }


}

function drawOverlay(message) {
    if (millis() > overlayExpire) {
        stopped = false;
        overlayMessage = null;
        return;
    }
    push();
    fill('rgba(0, 0, 0, 0.5)');
    rect(0, 0, width, height);
    fill('white');
    textAlign(CENTER, CENTER);
    textSize(48);
    text(message, width / 2, height / 2);
    pop();
}


function spawnBubble() {
    const x = random(50, width - 100);
    const y = random(50, height - 200);
    const img = random(bubbleImages);
    const eventIndex = floor(random(events.length)); //修正，讓所有選項被抽到

    bubbles.push(new thoughtBubble(x, y, img, eventIndex));
}

function punishCount(eventIndex) {
    events[eventIndex][4] += 1;
}




// AI寫的進度條
function drawProgress() {
    const padding = 32;
    const shellWidth = width * 0.8;
    const shellHeight = 70;
    const barHeight = 26;
    const shellX = (width - shellWidth) / 2;
    const shellY = height - shellHeight - padding;
    const barX = shellX + 180;
    const barY = shellY + (shellHeight - barHeight) / 2;
    const ratio = constrain(progress / maxProgress, 0, 1);
    const filledWidth = (shellWidth - 270) * ratio;

    push();
    noStroke();
    // outer shell
    fill(255, 255, 255, 230);
    rect(shellX, shellY, shellWidth, shellHeight, shellHeight / 2);

    // label and percentage
    fill('#333');
    textAlign(LEFT, CENTER);
    textSize(22);
    text('干擾排除', shellX + 30, shellY + shellHeight / 2);

    textAlign(RIGHT, CENTER);
    text(`${Math.round(ratio * 100)}%`, shellX + shellWidth - 30, shellY + shellHeight / 2);

    // base bar
    fill('#f5f5f5');
    rect(barX, barY, shellWidth - 270, barHeight, barHeight);

    // gradient fill
    if (filledWidth > 0) {
        drawGradientRoundedRect(barX, barY, filledWidth, barHeight, barHeight / 2);
    }

    pop();
}

function drawGradientRoundedRect(x, y, w, h, r) {
    const ctx = drawingContext;
    ctx.save();
    const gradient = ctx.createLinearGradient(x, y, x + w, y);
    gradient.addColorStop(0, '#f5d94c');
    gradient.addColorStop(0.5, '#7bd68b');
    gradient.addColorStop(1, '#25b8d5');
    ctx.fillStyle = gradient;
    roundedRectPath(ctx, x, y, w, h, r);
    ctx.fill();
    ctx.restore();
}

function roundedRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function drawCoverImage(img) {
  const canvasRatio = width / height;
  const imgRatio = img.width / img.height;

  let drawWidth;
  let drawHeight;

  if (imgRatio >= canvasRatio) {
    drawHeight = height;
    drawWidth = imgRatio * drawHeight;
  } else {
    drawWidth = width;
    drawHeight = drawWidth / imgRatio;
  }

  const offsetX = (width - drawWidth) / 2;
  const offsetY = (height - drawHeight) / 2;
  image(img, offsetX, offsetY, drawWidth, drawHeight);
}