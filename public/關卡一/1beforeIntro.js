
let imgs = [];


function preload() {
  imgs[0] = loadImage('../images/kitchen/1.PNG');
  imgs[1] = loadImage('../images/kitchen/2.PNG');
  imgs[2] = loadImage('../images/kitchen/3.PNG');
  imgs[3] = loadImage('../images/kitchen/dad.PNG');
}

let storyPlayer;


const scriptData = [
  {
    centerText: "",
    speaker: "我",
    boxText: "好累喔，好想睡覺，不想起床⋯⋯\n打個哈欠）才七點十分⋯⋯",
    background: 0
  },
  {
    centerText: "",
    speaker: "我",
    boxText: "不行不行，今天必修要考期末，再拖下去一定又趕不上公車⋯⋯。\n嘴巴好乾，來喝杯水好了。",
    background: 0
  },
  {
    centerText: "",
    speaker: "父親",
    boxText: "你在幹嘛？\n大早上的別又拖拖拉拉，免得等等來不及。動作快點！",
    background: 0,
    otherImg: 3
  }
  ,
  {
    centerText: "",
    speaker: "我",
    boxText: "喔......。",
    background: 0
  }, {
    centerText: "",
    speaker: "我",
    boxText: "（奇怪，我要幹嘛來著？）⋯⋯\n喝水⋯⋯？對，我要喝水。杯子⋯⋯，杯子在哪裡？",
    background: 0
  },
  {
    centerText: "",
    speaker: "我",
    boxText: "（在櫥櫃裡找到杯子）\n（放在桌上，倒水）",
    background: 1
  },
  {
    centerText: "",
    speaker: "我",
    boxText: "呼⋯⋯我應該要喝水，別做別的事情⋯⋯",
    background: 2
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
      window.location.href = "2Intro.html";
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




