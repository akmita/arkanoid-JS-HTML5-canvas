//created variable justCollided that prevents another collision if ball is going thr same direction
//ball destroys square
//ball cannot destroy any more squares untill it changes direction 
//split into 4 if statements easier on CPU
//cut off edges hitbox on ball
//fix gameends function
// displays wrong square destroyed sometimes

// FOUND THR BUG!!!!!!
// SOMEYIMES THE BALL REGISTERS AS HITTING BOTTOM WHEN IT HITS THE LEFT SIDE

var canvas = document.querySelector(".canvas1");
var cd=0;
var grid=[];
var direction;
var c = canvas.getContext("2d");
c.canvas.width=window.innerWidth;
c.canvas.height=window.innerHeight;
var score=0;
var lives=3;
var speed=6;
var collisionTimeout=40;
var playerSize = 90;
//***vars for dev
var currentSqNum;
var doAnim = true;


//***constructor-squares and ball object***
function Square(x,y,size, color) {
  this.x=x;
  this.y=y;
  this.size=size;
  this.color=color;
  this.lastX=0;
  this.lastY=0;
  this.dest=150;
  this.destroyed=false;
}

var ball = {
  x: 209.593,
  y: 350.598,
  size: 10,
  dx: 0,
  dy: 0,
  lastX: 0,
  lastY: 0,
  insidePlayer: 'false',
  constSpeed: false,
  justCollided: false
}
//************************************

function createGrid(x,y,spacing,rows,columns, size, color) {
  var tempX;
  for (var r=0; r<rows; r++ ) {
    tempX=x;
    for (var c=0; c<columns; c++) { 
      grid.push(new Square(tempX,y,size,randomColorGen()));
      tempX+=size+spacing;
    }
    y+=size+spacing;
  }
}



createGrid(55,50,0,10,10, 25, randomColorGen());

var player= new Square(150,600, playerSize, "red");
respawn();

//****collision detection functions******
function collisionDetect(sq, bl) {
  var direction;
  var up,down,left,right;
  if (bl.x>=sq.x-bl.size && bl.x<=sq.x+sq.size+bl.size && bl.y>=sq.y-bl.size && bl.y<=sq.y+sq.size+bl.size) {
      cd++;
      direction=checkDirection(sq,bl);
      return direction; 
  }
  else {  return false;  }
}

function checkDirection(sq, bl) {
  var distances=[];
  var midLeft=[sq.x,sq.y+(sq.size/2)];
  var midBottom=[sq.x+(sq.size/2),sq.y+sq.size];
  var midRight=[sq.x+sq.size,sq.y+(sq.size/2)]
  var midTop=[sq.x+(sq.size/2),sq.y]
 
 return findCollisionSide(midLeft, midBottom, midRight, midTop, bl);
}

function findCollisionSide(ml,mb,mr,mt,bl) { 
  var lowestDist=999999999;
  var currentDist=0;
  var direction;
  var cycleCount=0;
  
  for (var i = 0; i < arguments.length - 1;i++) {
    cycleCount++;
    currentDist=dist(arguments[i][0], arguments[i][1], bl.x, bl.y)
   // console.log("square: " + currentSqNum + "iteration: " + i + "  distance: " + currentDist);
    if (currentDist<=lowestDist) {
      if (currentDist==lowestDist) {
        console.log("|||||high alert||||| matching values: " + currentDist +"  = " + lowestDist);
        console.log("stop");
        console.log("ball x = " + ball.x + " "+ bl.x +" ball.y = " + ball.y + " "+ bl.y);
        // pauseBall(false);
        doAnim = false;
      }
      lowestDist=currentDist;
      switch (i) {
        case 0: 
          direction="left";
          break;
        case 1:
          direction="bottom";
          break;
        case 2:
          direction="right";
          break;
        case 3:
          direction="top";
          break;
        default:
          console.log("direction not found");
      }
    }
  }
  return direction;
}
//*************************************

function dist(x1,y1,x2,y2) { 
  return Math.sqrt((Math.pow((x2-x1),2))+Math.pow((y2-y1),2));
}

function randomColorGen() {
  var red=100, green=200, blue=50, opacity=.9;
 // red=Math.random()*40;
 green=Math.random()*200;
 // blue=Math.random()*150;
 
 // opacity = Math.random()*.7+.3;
 
  return `rgba(${red},${green},${blue},${opacity})`;
}

function checkForDeath() { 
  if ((ball.y + (ball.size)/2) > canvas.height) {
    ball.y = -50;
    ball.dx = 0;
    ball.dy = 0;
    lives--;
    if (lives > 0) {
       respawn();
    }
    else {
      console.log("gameover");
      gameEnds(); // not existent function
    }
  }
}

function respawn() {
  setTimeout(()=> { ball.x=17.33459; ball.y=370.69473; }, 300)
  setTimeout(()=>{ ball.dx=speed; ball.dy=-1*speed; }, 1000);
}

function gameEnds() {
  
}

//*****event listeners*******
document.body.addEventListener("touchstart", function showCoords(e) {
  player.dest=e.changedTouches[0].pageX;
  if (e.changedTouches[0].pageY<100) {
    console.log("touched dev area");
    // pauseBall();
    doAnim=!doAnim;
    console.log("animating = " + doAnim);
  }
});

document.body.addEventListener("touchmove", function(e) {
    player.dest=e.changedTouches[0].pageX;
});
//***************************


//======== MAIN ANIMATION FUNCTION =========
function animate1() {
  if(doAnim) {
    
  
  c.clearRect(0,0,canvas.width, canvas.height)
  draw(player);
  drawBall(); 
  moveBall(); 
  if (collisionDetect(player,ball)!=false)
  { 
    if (ball.justCollided==false) { applyPushDirection(collisionDetect(player,ball));
      setCollisionTimeout(150);
    } 
  }
  drawStats(score, lives);
  
  for (var i=0; i<grid.length; i++) {
    currentSqNum = i; // DEV
    if (grid[i].destroyed==false) {
      draw(grid[i]);
    }
    if (collisionDetect(grid[i],ball)!=false && grid[i].destroyed==false) {
      direction=collisionDetect(grid[i],ball)
      console.log("contacted:  " + direction + " of square:  " + i);
      
     //change order of these ifs, inefficient
      if (ball.justCollided==false) { 
        console.log('*******destroying square: ' + i);
        
        score++;
        //grid.splice(i,1); //FIXME
        grid[i].destroyed = true;
        
        setCollisionTimeout(collisionTimeout);
      }  
      applyPushDirection(direction);
    }
  }
  checkForDeath();
  } // end if (doanim) ...
}
setInterval(animate1, 20);
//========END OF ANIMATION FUNCTION==========

function setCollisionTimeout(duration) {
  ball.justCollided=true;
  setTimeout(()=>ball.justCollided=false, duration);
}

var speedUpdator = setInterval(updateBallSpeed, 10000000);

//*****. drawing functions *******
function draw(object) {
  c.fillStyle = object.color;
  c.fillRect(object.x, object.y, object.size, object.size);
}

function drawBall() { 
  c.fillstyle = "green";
  c.beginPath();
  c.arc(ball.x, ball.y, ball.size, 0,2*Math.PI);
  c.fill();
}

function drawStats() {
  c.fillStyle = "black";
  c.font = "15px Arial";
  c.fillText('Score: ' + score, 5, 25);
  c.fillText('Lives: ' + lives, window.innerWidth - 60, 25)
}
//**********************************

//*****motion functions*************
function moveBall() {
  ball.x+=ball.dx;
  ball.y+=ball.dy;
  if (ball.y<0 || ball.y>canvas.height) { ball.dy*=-1; }
  if (ball.x>canvas.width || ball.x<0) { ball.dx*=-1; }
}
interval=true;
var interval=setInterval(push, 1);
function push() {
  player.x+=pushPlayer(player.dest);
}

function pushPlayer(x) {
  if (Math.abs(player.x-x+player.size/2)<6) {
    return 0;
  }
  return player.x+player.size/2<x ? 5 : -5;
}
    
function applyPushDirection(direction) {
  if (direction=="bottom" || direction=="top") {
    reverseBallSpeed(false, true);
  }
  if (direction=="left" || direction=="right") {
    reverseBallSpeed(true, false);
  }
}

function updateBallSpeed() { //only for dev testing
  if (ball.constSpeed===true) { return 0; }
  else {
    var ballDirX=ball.dx/Math.abs(ball.dx);
    var ballDirY=ball.dy/Math.abs(ball.dy);
    ball.dx=ballDirX*dist(player.x+player.size/2, player.y+player.size/2,ball.x,ball.y)/33+1;
    ball.dy=Math.abs(ball.dx)*ballDirY;
  }
}

function reverseBallSpeed(x,y) {
  if (x==true && ball.constSpeed==false) {
    console.log('revrsing x speed');
    ball.dx*=-1;
    ball.lastX=ball.x;
  }
  
  if (y==true && ball.constSpeed==false) {
    console.log('revrsing y speed');
    ball.dy*=-1;
    ball.lastY=ball.y;
  }
  console.log("Ball travelling: ")
  if (ball.dy<0) { console.log("North"); }
  else { console.log("South"); }
  if (ball.dx<0) { console.log("West"); }
  else { console.log("East"); }
  ball.constSpeed=true;
  setTimeout(()=> ball.constSpeed=false , 12);
}
//**************************************

//DEV FUNCTIONS
// void displaySquareStats(currSquare) {
var tempXSpeed;
var tempYSpeed;
function pauseBall(oneWayPause = true) {
  if (ball.dx>0 || ball.dy>0) {
    tempXSpeed = ball.dx;
    tempYspeed = ball.dy;
    ball.dx=0;
    ball.dy=0;
  }
  else if (oneWayPause) {
    ball.dx=tempXSpeed;
    ball.dy=tempYspeed;
  }
} 
  
  
function shearSquares() {
  
      grid[90].destroyed=true;
      grid[80].destroyed=true;
      grid[91].destroyed=true;
      grid[70].destroyed=true;
      grid[81].destroyed=true;
      grid[92].destroyed=true;
  
  console.log("sheared");
}

shearSquares();