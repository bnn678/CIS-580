// Screen dimensions
const WIDTH = 740
const HEIGHT = 480

// Create the canvas and context
var screen = document.createElement('canvas');
var screenCtx = screen.getContext('2d');
screen.height = HEIGHT;
screen.width = WIDTH;
document.body.appendChild(screen);

/* Game state variables */
var start = null;
var player1 = {
  x: parseInt(WIDTH / 8),
  y: parseInt(HEIGHT / 2),
  direction: 'right',
  alive: true
}
var player2 = {
  x: parseInt(WIDTH * 7/8),
  y: parseInt(HEIGHT / 2),
  direction: 'left',
  alive: true
}
var buffer = new ArrayBuffer(8*WIDTH*HEIGHT)
var court = new Uint8Array(buffer);
var gameOver = false;

/** @function handleKeydown
  * Event handler for keydown events
  * @param {KeyEvent} event - the keydown event
  */
function handleKeydown(event) {
  switch(event.key) {
    case 'ArrowUp':
      if(player2.direction != 'down') player2.direction = 'up';
      break;
    case 'w':
      if(player1.direction != 'down')player1.direction = 'up';
      break;
    case 'ArrowDown':
      if(player2.direction != 'up') player2.direction = 'down';
      break;
    case 's':
      if(player1.direction != 'up') player1.direction = 'down';
      break;
    case 'ArrowLeft':
      if(player2.direction != 'right') player2.direction = 'left';
      break;
    case 'a':
      if(player1.direction != 'right') player1.direction = 'left';
      break;
    case 'ArrowRight':
      if(player2.direction != 'left') player2.direction = 'right';
      break;
    case 'd':
      if(player1.direction != 'left') player1.direction = 'right';
      break;
  }
}
// Attach keydown event handler to the window
window.addEventListener('keydown', handleKeydown);

/** @function loop
  * The main game loop
  * @param {DomHighResTimestamp} timestamp - the current system time,
  * in milliseconds, expressed as a double.
  */
function loop(timestamp) {
  if(!start) start = timestamp;
  var elapsedTime = timestamp - start;
  start = timestamp;
  update(elapsedTime);
  render(elapsedTime);
  window.requestAnimationFrame(loop);
}

/** @function update
  * Updates the game's state
  * @param {double} elapsedTime - the amount of time
  * elapsed between frames
  */
function update(elapsedTime) {
  if(gameOver) return;
  // Move players
  switch(player1.direction) {
    case 'up': player1.y--; break;
    case 'down': player1.y++; break;
    case 'left': player1.x--; break;
    case 'right': player1.x++; break;
  }
  switch(player2.direction) {
    case 'up': player2.y--; break;
    case 'down': player2.y++; break;
    case 'left': player2.x--; break;
    case 'right': player2.x++; break;
  }
  // Check for collisions with the sides of the screen
  if(player1.x < 0 || player1.x > WIDTH || player1.y < 0 || player1.y > HEIGHT) {
    gameOver = true;
    player1.alive = false;
    console.log("Player 1 Died!")
  }
  if(player2.x < 0 || player2.x > WIDTH || player2.y < 0 || player2.y > HEIGHT) {
    gameOver = true;
    player2.alive = false;
    console.log("Player 2 Died!")
  }
  // Check for collisions with light trails
  if(court[player1.y * WIDTH + player1.x]) {
    gameOver = true;
    player1.alive = false;
    console.log("Player 1 Died!");
  }
  if(court[player2.y * WIDTH + player2.x]) {
    gameOver = true;
    player2.alive = false;
    console.log("Player 2 Died!");
  }
  // Record player position
  court[player1.y * WIDTH + player1.x] = 1;
  court[player2.y * WIDTH + player2.x] = 2;
}

/** @function render
  * Renders the game into the canvas
  * @param {double} elapsedTime - the amount of time
  * elapsed between frames
  */
function render(elapsedTime) {
  screenCtx.fillStyle = "#ff0000";
  screenCtx.fillRect(player1.x,player1.y,1,1);
  if(!player1.alive) screenCtx.fillText("Player 1 is Dead", WIDTH/4-100, HEIGHT/2);
  screenCtx.fillStyle = "#00ff00";
  if(!player2.alive) screenCtx.fillText("Player 2 is Dead", WIDTH*3/4-100, HEIGHT/2);
  screenCtx.fillRect(player2.x,player2.y,1,1);
}

// Start the game loop
window.requestAnimationFrame(loop);
