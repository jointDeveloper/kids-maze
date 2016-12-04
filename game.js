/*
  Order: right, up, left, down
*/
const dx = [1, 0, -1, 0];
const dy = [0, -1, 0, 1];
const robDx = [0, -1, 0, 1];
const robDy = [1, 0, -1, 0];

const n = 5;
const cellSize = 50;
/*
  0: blocked
  1: not blocked
*/
const maze = [
  [[1, 0, 0, 1], [1, 0, 1, 0], [1, 1, 1, 0], [1, 0, 1, 1], [0, 0, 1, 0]],
  [[1, 1, 0, 0], [0, 0, 1, 1], [0, 0, 0, 1], [1, 1, 0, 0], [0, 0, 1, 1]],
  [[1, 0, 0, 1], [1, 1, 1, 0], [0, 1, 1, 0], [1, 0, 0, 1], [0, 1, 1, 0]],
  [[0, 1, 0, 1], [1, 0, 0, 1], [1, 0, 1, 1], [1, 1, 1, 0], [0, 0, 1, 1]],
  [[1, 1, 0, 0], [0, 1, 1, 0], [0, 1, 0, 1], [1, 0, 0, 0], [0, 1, 1, 0]]
];
const exit = [5, 2];

let canvas, ctx;
let width, height;
let initMazeX, initMazeY;
let robX = -1, robY = 2, robDir = 3;
let gameStarted = false;
let gameOver = false;
let instructionsDiv;

let dashLen, dashOffset, dashSpeed, winX, winY, winI, winTxt;

function startAnimating() {
  canvas = document.getElementById('game');
  canvas.width = canvas.parentElement.clientWidth;
  width = canvas.width;
  height = canvas.height;
  ctx = canvas.getContext('2d');
  instructionsDiv = document.getElementById('instructions');

  initMazeX = (width / 2 - cellSize * n / 2) + cellSize / 2;
  initMazeY = (height / 2 - cellSize * n / 2) + cellSize / 2;

  dashLen = 220;
  dashOffset = dashLen;
  dashSpeed = 5;
  winTxt = '¡GANASTE!';
  winX = initMazeX;
  winY = height / 2;
  winI = 0;

  game();
}

function game() {
  ctx.clearRect(0, 0, width, height);
  if (!gameOver) {
    let x = initMazeX, y = initMazeY;

    for (let i = 0; i < n; i++) {
      x = initMazeX;
      for (let j = 0; j < n; j++) {
        drawCell(x, y, i, j);
        x += cellSize;
      }
      y += cellSize;
    }

    drawRobot(...indexToScreen(robX, robY), robDir);
    if ([robX, robY].toString() === exit.toString())
      gameOver = true;

    requestAnimationFrame(game);
  } else {
    ctx.font = '50px Comic Sans MS, cursive, TSCu_Comic, sans-serif';
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 2 / 3;
    ctx.strokeStyle = 'rgb(144, 20, 106)';
    ctx.fillStyle = 'rgb(212, 0, 114)';

    document.getElementById('btn-left').className += ' disabled';
    document.getElementById('btn-forward').className += ' disabled';
    document.getElementById('btn-right').className += ' disabled';

    setTimeout(win, 2000);
  }
}

/*
  http://stackoverflow.com/questions/29911143/how-can-i-animate-the-drawing-of-text-on-a-web-page
*/
function win() {
  ctx.clearRect(winX, 0, 150, 300);
  ctx.setLineDash([dashLen - dashOffset, dashOffset - dashSpeed]);
  dashOffset -= dashSpeed;
  ctx.strokeText(winTxt[winI], winX, winY);

  if (dashOffset > 0) {
    requestAnimationFrame(win);
  } else {
    ctx.fillText(winTxt[winI], winX, winY);
    dashOffset = dashLen;
    winX += ctx.measureText(winTxt[winI++]).width + ctx.lineWidth * Math.random();
    ctx.setTransform(1, 0, 0, 1, 0, 3 * Math.random());
    ctx.rotate(Math.random() * 0.005);
    if (winI < winTxt.length)
      requestAnimationFrame(win);
  }
}

function indexToScreen(i, j) {
  let x = initMazeX, y = initMazeY;
  x += j * cellSize;
  y += i * cellSize;
  return [x, y];
}

function drawCell(x, y, i, j) {
  let cell = maze[i][j];
  let c = cellSize / 2;
  ctx.lineWidth = 5;

  let moveTo = [[x + c, y - c], [x - c, y - c], [x - c, y + c], [x + c, y + c]];
  let lineTo = [[x + c, y + c], [x + c, y - c], [x - c, y - c], [x - c, y + c]];

  for (let k = 0; k < 4; k++) {
    if (!cell[k]) {
      ctx.beginPath();
      ctx.moveTo(...moveTo[k]);
      ctx.lineTo(...lineTo[k]);
      ctx.strokeStyle = 'rgb(131, 3, 128)';
      ctx.stroke();
    }
  }
}

function drawRobot(x, y, dir) {
  const radius = 0.75 * cellSize / 2;

  // Exterior
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = 'rgb(212, 0, 114)';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgb(144, 20, 106)';
  ctx.stroke();

  // Interior
  ctx.beginPath();
  ctx.arc(x + dx[dir] * radius / 2, y + dy[dir] * radius / 2, radius * 0.2, 0, 2 * Math.PI);
  ctx.fillStyle = 'white';
  ctx.lineWidth = 1;
  ctx.fill();
  ctx.stroke();
}

function rotateLeft() {
  if (gameStarted) {
    robDir = (robDir + 1) % 4;
    addInstruction('left');
  }
}

function advance() {
  if ((!gameStarted && robDir == 3) || maze[robX][robY][robDir]) {
    gameStarted = true;
    robX += robDx[robDir];
    robY += robDy[robDir];
    addInstruction('forward');
  }
}

function rotateRight() {
  if (gameStarted) {
    robDir = (robDir - 1 + 4) % 4;
    addInstruction('right');
  }
}

function addInstruction(inst) {
  let message, color;
  switch (inst) {
    case 'right':
      message = 'Girar a la derecha';
      color = 'red lighten-3';
      break;
    case 'forward':
      message = 'Avanzar';
      color = 'blue lighten-3';
      break;
    case 'left':
      message = 'Girar a la izquierda';
      color = 'green lighten-3';
    break;
  }

  let chip = document.createElement('div');
  chip.className = `chip ${color}`;
  let text = document.createTextNode(message);
  chip.appendChild(text);
  instructionsDiv.appendChild(chip);
}

startAnimating();
