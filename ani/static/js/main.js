

let canvas = document.createElement("canvas");
canvas.setAttribute("width", "512");
canvas.setAttribute("height", "512");
canvas.style.border = "1px dashed black";
let codingArea = document.getElementById('draw')
codingArea.appendChild(canvas);

let ctx = canvas.getContext("2d");
class Tile{
  constructor(x,y,cnt,source){
    this.border = {
      east:0,
      south:0,
      west:0,
      north:0,
    };
    this.data = {
      color:"blank",
      count:cnt,
      imgsrc:source,
    };
    this.postition ={
      tileX:x,
      tileY:y,
    };
  }
}

let fps = 1,
 start = 0,
 frameDuration = 1000 / fps;
let catImage = new Image();
catImage.src = "/static/images/cat.png"

let ob1 = new Tile(32,32,1,"/static/images/cat.png");

let bg = new Image();
bg.src = ob1.data.imgsrc;
let imageX = 0;
let requestAniNum=0;





gameLoop();
//Start the game loop
function gameLoop(timestamp) {
 requestAniNum = requestAnimationFrame(gameLoop);
 
 // 애니메이션 시간 설정
 if (timestamp >= start) {
 //update the game logic
 ctx.clearRect(0,0,canvas.width, canvas.height);
 
 ctx.drawImage(catImage,imageX,0,32,32);
 ctx.drawImage(bg,ob1.postition.tileX,ob1.postition.tileY,32,32);
 imageX+=32;
 //ob1.draw(ctx);
 //Reset the frame start time
 start = timestamp + frameDuration;
 }
}

canvas.addEventListener('mousedown',restart,false);

function restart(){
  cancelAnimationFrame(requestAniNum);
  imageX = 0;
  gameLoop();
};



