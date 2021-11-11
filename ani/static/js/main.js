

let canvas 
let ctx

// 바닥 한 타일에 대한 정보
class Tile{
  // 타일의 x좌표, 타일의 y좌표, 그림이미지 개수, 그림이미지 소스
  constructor(x,y,cnt,source){
    // 벽면 테두리 여부
    this.border = {
      east:0,
      south:0,
      west:0,
      north:0,
    };
    // 바닥색상, 그림이미지 개수, 그림이미지 소스
    this.data = {
      color:"blank",
      count:cnt,
      imageSrc:source,
    };
    // 타일 위치정보
    this.position ={
      tileX:x,
      tileY:y,
    };
  }
  tileDraw(ctx){
    let tileImage = new Image();
    tileImage.src = "/static/images/"+this.data.imageSrc;
    ctx.drawImage(tileImage,this.position.tileX,this.position.tileY,64,64);
  }
}


// 로봇 클래스 생성

class Robot{
  constructor(x,y,direction,imageSrc="ant"){
    // 로봇의 시작좌표
    this.startx = x;
    this.starty = y;
    this.prex = x;
    this.prey = y;
    this.x = x;
    this.y = x;
    this.direction = direction;
    this.pdirection = direction;
    this.imageSrc = imageSrc;
    this.width = 64;
    this.height = 64;
    
  }
  init(ctx){
    ctx.clearRect(this.prex,this.prey,this.width, this.height);
    ctx.moveTo(this.startx + this.width/2, this.starty+this.height/2);
    this.x = this.startx;
    this.y = this.starty;
    this.prex = this.x;
    this.prey = this.y;
    this.direction = this.pdirection;    
  }
  draw(ctx){    
    ctx.clearRect(this.prex,this.prey,this.width, this.height);
    let roboImage = new Image();
    roboImage.src = "/static/images/"+ this.imageSrc + this.direction +".png";
    ctx.drawImage(roboImage,this.x,this.y,this.width,this.height);
    ctx.lineTo(this.x+this.width/2, this.y + this.height/2);
    ctx.stroke();
    this.prex = this.x;
    this.prey = this.y;
  }
  move(){
    if(this.direction == 0) // 동쪽
      this.x+=this.width;
    else if(this.direction == 1) // 북쪽
      this.y-=this.width;
    else if(this.direction == 2) // 서쪽
      this.x-=this.width;
    else if(this.direction == 3) // 남쪽
      this.y+=this.width;
  }
  turnLeft(){ // 왼쪽 돌기
    this.direction = (this.direction+1)%4;
  }
}
// 실행속도 제어
let fps = 1, start = 0, frameDuration = 1000 / fps;

// 초기 설정
let robot = new Robot(0,0,0);
let tile = [];
let requestAniNum=0;

canvas = document.getElementById('canvas')  ;
canvas.height = 512;
canvas.width =  512;
canvas.style.border = "1px dashed black";
ctx = canvas.getContext("2d");

//로봇 초기 위치 설정
robot.init(ctx);
robot.draw(ctx);

// 타일 초기 설정
tile.push(new Tile(64,64,1,"bee.png"));
tile.push(new Tile(64*2,64,1,"ant.png"));
tile.push(new Tile(64*3,64,1,"bird.png"));

// 타일 보이기
for(let i=0; i<3; i+=1){
  tile[i].tileDraw(ctx);
  console.log(tile[i].data.imageSrc);
}


var editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/javascript");
editor.setFontSize(15);

let userCommand = [];
let userCode=[];

// 코드를 다시 실행했을 경우 기존 로봇과 물건만 원래 상태로 변경하기.
let worldReInit = function(){ 
  // 화면 초기화
  ctx.clearRect(0,0,canvas.width, canvas.height);
  ctx.beginPath();

  // 타일 초기화
  for(let i=0; i<3; i+=1){
    tile[i].tileDraw(ctx);
    console.log(tile[i].data.imageSrc);
  }

  //로봇 초기 위치 설정
  robot.init(ctx);
  robot.draw(ctx);
  
}


//Start the game loop
function gameLoop(timestamp) {
 requestAniNum = requestAnimationFrame(gameLoop);
 // 애니메이션 시간 설정
 if (timestamp >= start) {
  // 타일 그리기 
  for(let i=0;i<3;i+=1)
    tile[i].tileDraw(ctx);

  // 로봇 그리기
  if(userCode.length > 0){
    let tmp = userCode.shift()
    if(tmp == "move()") robot.move();
    else if(tmp == "turn-left()") robot.turnLeft();
  }
  robot.draw(ctx);

  //Reset the frame start time
  start = timestamp + frameDuration;
 }
}

let playbutton = document.getElementById('playbutton')
let stopbutton = document.getElementById('stop')


playbutton.addEventListener('mousedown', robotPlay,false);
stopbutton.addEventListener('mousedown', robotStop,false);


function robotPlay(e){  
  cancelAnimationFrame(requestAniNum);
  userCommand=[];
  userCode = [];
  worldReInit(ctx);
  userCommand = editor.getValue().split("\n");
  for(let i=0;i<userCommand.length;i++){
    if(userCommand[i]!="") userCode.push(userCommand[i]);
  }
  gameLoop();
}

function robotStop(e){  
  cancelAnimationFrame(requestAniNum);
}




