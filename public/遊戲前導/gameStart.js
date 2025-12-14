let gameState = "START";
let startBtn;
let storyPlayer;


const scriptData = [
  {
    centerText: "07:00 AM",
    speaker: "我",
    boxText: "(按掉鬧鐘)"
  },
  {
    centerText:
      "你是一位具有ADHD的大學生，\n由於期中時已經因為不小心睡過頭差點拿不了考卷，\n因此現在你必須動作快點，\n趕上早上九點的公車去學校考期末考，\n否則有機會被大岩壁！！！",
    speaker: "我",
    boxText: "(好)"
  },
  {
    centerText: "",
    speaker: "我",
    boxText: "今天……期末考……（翻身）\n得趕緊起床了。"
  }
];


function setup() {
  createCanvas(1400, 700); //1400, 700
  textFont("Microsoft JhengHei");


  startBtn = new StartButton(width / 2, 450, 260, 70, 42);
  storyPlayer = new StoryPlayer(scriptData);
}


function draw() {
  background(0);


  if (gameState === "START") {
    drawStartPage();
  } else if (gameState === "PLAY") {
    storyPlayer.update();
    storyPlayer.show();

    // 如果已經播到最後一段且文字也播完 -> 自動跳
    if (storyPlayer.isFinished()) {
        window.location.href = "../關卡一/1beforeIntro.html";
    }
  }
}


function mousePressed() {
  if (gameState === "START" && startBtn.isHover()) {
    gameState = "PLAY";
  } else if (gameState === "PLAY") {
    storyPlayer.handleClick();
  }else if (storyPlayer.isFinished()) {
        window.location.href = "../關卡一/1beforeIntro.html";
  }
}


function drawStartPage() {
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(80);
  textStyle(BOLD);
  text("晨 間 戰", width / 2, height / 2 - 50);


  startBtn.show();
}


class StartButton {
  constructor(x, y, w, h, r) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.r = r;
  }


  isHover() {
    return (
      abs(mouseX - this.x) < this.w / 2 &&
      abs(mouseY - this.y) < this.h / 2
    );
  }


  show() {
    rectMode(CENTER);


    if (this.isHover()) {
      fill(80);
      stroke(200);
      cursor(HAND);
    } else {
      fill(50);
      stroke(150);
      cursor(ARROW);
    }


    rect(this.x, this.y, this.w, this.h, this.r);


    noStroke();
    fill(255);
    textSize(24);
    textAlign(CENTER, CENTER);
    text("點擊開啟新的一天", this.x, this.y);
  }
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


    const centerStr = data.centerText.substring(0, this.charIndex);
    const boxStr = data.boxText.substring(0, this.charIndex);
    const totalLen = max(data.centerText.length, data.boxText.length);
    const finished = this.charIndex >= totalLen;


    this.drawCenterText(data.centerText, centerStr);
    this.drawDialogueBox(data.speaker, boxStr, finished);
  }


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


    fill(255, 255, 255, 20);
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
    }

  }


  isFinished() {
    const data = this.current;
    const totalLen = max(data.centerText.length, data.boxText.length);
    return this.index === this.script.length - 1 && this.charIndex >= totalLen;
  }   
}
