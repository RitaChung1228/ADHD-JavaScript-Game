
let imgs = [];


function preload() {
  imgs[0] = loadImage('../images/diningroom/6.PNG');
}

let storyPlayer;


const scriptData = [
  {
    centerText: "",
    speaker: "我",
    boxText: "現在我要收書包～要收書包～\n手機、錢包、鑰匙、耳機、學生證、雨傘、鉛筆盒⋯⋯（嘴吧默念）",
    background: 0
  },
  {
    centerText: "",
    speaker: "我",
    boxText: "手機、錢包、鑰匙、菸...\n不對，我根本不抽菸。",
    background: 0
  },
  {
    centerText: "",
    speaker: "我",
    boxText: "嗯，搭公車路上可以聽個音樂，那代個耳機。\n還有什麼？今天要考試......對對，要考試，筆跟手錶，能寫還能看時間。",
    background: 0,
  }
  ,
  {
    centerText: "",
    speaker: "我",
    boxText: "(好多東西要收)...... 好累，我到底拿了什麼又少了什麼......",
    background: 0
  }
];


function setup() {
  createCanvas(1400, 700);
  textFont("Microsoft JhengHei");
  colorMode(RGB, 255, 255, 255, 255);


  storyPlayer = new StoryPlayer(scriptData);
}


function draw() {
  background(0);



  storyPlayer.update();
  storyPlayer.show();
}


function mousePressed() {

  storyPlayer.handleClick();
}






class StoryPlayer {
  constructor(script) {
    this.script = script;
    this.index = 0;


    this.charIndex = 0;
    this.lastTime = 0;
    this.speed = 60;
  }


  get current() {
    return this.script[this.index];
  }


  update() {
    if (millis() - this.lastTime > this.speed) {
      this.charIndex++;
      this.lastTime = millis();
    }
  }


  show() {
    const data = this.current;
    const backgroundImg = imgs[data.background];

    if (backgroundImg) {
      drawCoverImage(backgroundImg);
    } else {
      background(0);
    }

    if (data.otherImg) {
      let a = 450;
      let b = a * 4 / 3;
      image( imgs[data.otherImg], width - a, height - b, a, b);
    }


    // const centerStr = data.centerText.substring(0, this.charIndex);
    const boxStr = data.boxText.substring(0, this.charIndex);
    const totalLen = max(data.centerText.length, data.boxText.length);
    const finished = this.charIndex >= totalLen;


    // this.drawCenterText(data.centerText, centerStr);
    this.drawDialogueBox(data.speaker, boxStr, finished);
  }

  // 畫中間文字，用不到
  drawCenterText(fullText, showText) {
    if (!fullText) return;


    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);


    if (fullText.includes("AM")) {
      textSize(48);
      textStyle(BOLD);
    } else {
      textSize(24);
      textStyle(NORMAL);
    }
    text(showText, width / 2, height / 2 - 40);
  }


  drawDialogueBox(speaker, content, showArrow) {
    rectMode(CORNER);
    const boxH = 140;
    const boxMargin = 40;
    const boxY = height - boxH - boxMargin;


    fill(40, 40, 40, 200);
    stroke(120);
    rect(boxMargin, boxY, width - boxMargin * 2, boxH, 10);


    // Speaker icon
    stroke(120);
    fill(100);
    rect(boxMargin + 20, boxY - 27, 64, 54, 27);


    fill(255);
    textSize(24);
    textStyle(NORMAL);
    textAlign(CENTER, CENTER);
    text(speaker, boxMargin + 50, boxY);


    // Content
    textAlign(LEFT, TOP);
    textSize(20);
    text(content, boxMargin + 40, boxY + 40);


    if (showArrow) {
      fill(255);
      let x = width - boxMargin - 40;
      let y = height - boxMargin - 30;
      triangle(x, y, x + 20, y, x + 10, y + 10);
    }
  }


  handleClick() {
    const data = this.current;
    const totalLen = max(data.centerText.length, data.boxText.length);


    if (this.charIndex < totalLen) {
      this.charIndex = totalLen;
    } else if (this.index < this.script.length - 1) {
      this.index++;
      this.charIndex = 0;
    } else if (this.index === this.script.length - 1) {
      // 到劇本最後一幕，重新載入頁面
      window.location.href = "2_intro.html";
    }
  }
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




