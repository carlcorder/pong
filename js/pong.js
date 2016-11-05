var canvas;
var context;

var ballRadius = 10;
var ballX = 50;
var ballY = 50;
var ballSpeedX = 10;
var ballSpeedY = 4;

var lpY = 250;
var rpY = 250;
const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 25;
var pad = 2;
var confidence = 0.2;// a percentage

var lpScore = 0;
var rpScore = 0;
const SCORE_TO_WIN = 3;
var winScreen = false;

function getMousePosition(evt) {
    var rect = canvas.getBoundingClientRect();
    var root = document.documentElement;
    var mouseX = evt.clientX - rect.left - root.scrollLeft;
    var mouseY = evt.clientY - rect.top - root.scrollTop;
    // mobile touchscreen
    //var mouseX = evt.touches[0].pageX;
    //var mouseY = evt.touches[0].pageY;
    return {
        x:mouseX,
        y:mouseY
    };
}

function resetBall() {
    if(lpScore >= SCORE_TO_WIN || rpScore >= SCORE_TO_WIN) {
        winScreen = true;
    }

    ballX = canvas.width/2;
    ballY = canvas.height/2;
    ballSpeedX = -ballSpeedX;
}

function handleMouseClick(evt) {
    if(winScreen) {
        lpScore = 0;
        rpScore = 0;
        winScreen = false;
    }
}

window.onload = function() {

    canvas = document.getElementById('gameCanvas');
    context = canvas.getContext('2d');

    var fps = 30;
    setInterval(function() {
            drawAll();
            iterateDynamics();
        },
        1000/fps);// play at 30 fps

    canvas.addEventListener('mousedown', handleMouseClick);

    // change event to touchmove for mobile
    canvas.addEventListener('mousemove',
        function(evt) {
            var mousePos = getMousePosition(evt);
            lpY = mousePos.y - PADDLE_HEIGHT/2;
        });

}

function drawNet() {
    for(var i = 10; i < canvas.height; i += 40) {
        drawRect(canvas.width/2 - 1,i,2,20,'white');
    }
}

function drawAll() {
    drawRect(0,0,canvas.width,canvas.height,'black');// background
    if(winScreen) {
        context.fillStyle = 'white';
        if(lpScore >= SCORE_TO_WIN) {
            context.fillText("You Won!",350,200);
        }
        if(rpScore >= SCORE_TO_WIN) {
            context.fillText("You Lost :(",350,200);
        }
        context.fillText("Click to Play Again.", 350, 220);
        return;
    }
    drawNet();
    drawPongBall(ballX, ballY);
    drawLeftPaddle(lpY);
    drawRightPaddle(rpY);
    showScore();
}

function drawPongBall(x,y) {
    context.beginPath();
    context.arc(x,y,ballRadius,0,2*Math.PI,false);
    context.fillStyle = 'white';
    context.fill();
}

function drawLeftPaddle(y) {
    // fixed to the left side
    drawRect(pad,y,PADDLE_WIDTH,PADDLE_HEIGHT,'white');
}

function drawRightPaddle(y) {
    // fixed to the right side
    drawRect(canvas.width - (PADDLE_WIDTH + pad), y, PADDLE_WIDTH, PADDLE_HEIGHT, 'white');
}

function drawRect(x,y,w,h,color) {
    context.fillStyle = color;
    context.fillRect(x,y,w,h);
}

function rightPaddleResponse() {
    //rpY += 6*((rpY < ballY) ? 1 : -1);
    var rpCenter = rpY + PADDLE_HEIGHT/2;
    if(rpCenter < ballY - confidence*PADDLE_HEIGHT) {
        rpY += 6
    }
    else if(rpCenter > ballY + confidence*PADDLE_HEIGHT) {
        rpY -= 6
    }
    else {
        // stay still
    }
}

function iterateDynamics() {
    if(winScreen) {
        // we have a winner
        return;
    }
    rightPaddleResponse();
    ballX += ballSpeedX;
    ballY += ballSpeedY;
    //ballSpeedX += 1; // acceleration

    if(ballX > canvas.width - PADDLE_WIDTH) {
        // ball hits the paddle on right side
        if(ballY > rpY && ballY < rpY + PADDLE_HEIGHT) {
            // bounce it back
            ballSpeedX = -ballSpeedX;
            var deltaY = ballY - (rpY + PADDLE_HEIGHT/2);
            ballSpeedY = deltaY*0.35;
        }
        else {
            // ball makes it past player on the right
            lpScore++;

            resetBall();
        }
    }
    if(ballX < PADDLE_WIDTH) {
        // ball hits the paddle on left side
        if(ballY > lpY && ballY < lpY + PADDLE_HEIGHT) {
            // bounce it back
            ballSpeedX = -ballSpeedX;
            var deltaY = ballY - (lpY + PADDLE_HEIGHT/2);
            ballSpeedY = deltaY*0.35;
        }
        else {
            // ball makes it past player on the right
            rpScore++;

            resetBall();
        }
    }
    // top and bottom boundary reflection
    if(ballY > canvas.height || ballY < 0) {
        ballSpeedY = -ballSpeedY;
    }
}

function showScore() {
    context.fillText(lpScore,100,100);
    context.fillText(rpScore, canvas.width - 100,100);
}