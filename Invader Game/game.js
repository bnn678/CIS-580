/************************************************************************
  CONSTANTS
/************************************************************************/
// Screen dimensions
const GAME_WIDTH = 740;
const GAME_HEIGHT = 480;
const INTERFACE_WIDTH = GAME_WIDTH;
const INTERFACE_HEIGHT = 20;
const SCREEN_WIDTH = GAME_WIDTH;
const SCREEN_HEIGHT = GAME_HEIGHT + INTERFACE_HEIGHT;

const MOVE_SPEED_ALIEN = .2;
const MOVE_SPEED_BULLET = .3;

const PLAYER_WIDTH = 20;
const PLAYER_HEIGHT = 20;

const BULLET_WIDTH = 10;

const ALIEN_WIDTH = 50;
const ALIEN_HEIGHT = 50;

const ALIENS_PER_SPAWN = 5;
const ALIENS_PER_LIFE = 20;

// Create the canvas and context
var screen = document.createElement('canvas');
var screenCtx = screen.getContext('2d');
screen.height = SCREEN_HEIGHT;
screen.width = SCREEN_WIDTH;
document.body.appendChild(screen);

/* Game state variables */
var start = null;
var currentInput = {
  space: false,
  left: false,
  right: false,
  up: false,
  down: false
}
var priorInput = {
  space: false,
  left: false,
  right: false,
  up: false,
  down: false
}
var player_x = 0;
var player_y = GAME_HEIGHT/2;
var player_lives = 3;
var player_was_hit = false;
var alien_invaded = false;

var aliens_hit = 0;
var game_over = 0;

var bullets = [];
var aliens = [];
var user_interface = new UserInterface();




/************************************************************************
  GAME FUNCTIONS
/************************************************************************/
/** @function handleKeydown
  * Event handler for keydown events
  * @param {KeyEvent} event - the keydown event
  */
function handleKeydown(event)
{
  switch(event.key)
  {
    case ' ':
      currentInput.space = true;
      break;
    case 'ArrowUp':
    case 'w':
      currentInput.up = true;
      break;
    case 'ArrowDown':
    case 's':
      currentInput.down = true;
      break;
  }
}
// Attach keyup event handler to the window
window.addEventListener('keydown', handleKeydown);

/** @function handleKeyup
  * Event handler for keyup events
  * @param {KeyEvent} event - the keyup event
  */
function handleKeyup(event)
{
  switch(event.key)
  {
    case ' ':
      currentInput.space = false;
      break;
    case 'ArrowUp':
    case 'w':
      currentInput.up = false;
      break;
    case 'ArrowDown':
    case 's':
      currentInput.down = false;
      break;
  }
}
// Attach keyup event handler to the window
window.addEventListener('keyup', handleKeyup);

/** @function loop
  * The main game loop
  * @param {DomHighResTimestamp} timestamp - the current system time,
  * in milliseconds, expressed as a double.
  */
function loop(timestamp)
{
  if(!start)
    start = timestamp;

  var elapsedTime = timestamp - start;
  start = timestamp;

  if (! game_over)
    update( elapsedTime);

  render( elapsedTime);
  copyInput();
  window.requestAnimationFrame(loop);
}

/** @function copyInput
  * Copies the current input into the previous input
  */
function copyInput()
{
  priorInput = JSON.parse(JSON.stringify(currentInput));
}




/************************************************************************
  PLAYER FUNCTIONS/GAME FUNCTIONS
/************************************************************************/
/** @function update
  * Updates the game's state
  * @param {double} elapsedTime - the amount of time
  * elapsed between frames
  */
function update( elapsedTime)
{
  // if space is pressed, shoot a bullet
  if(currentInput.space && !priorInput.space)
    bullets.push(new Bullet( player_x + PLAYER_WIDTH - 2, player_y+(PLAYER_WIDTH/2), 0));

  // if up is pressed, move character up
  if(currentInput.up)
  {
    if( player_y > 0 )
      player_y -= 0.3 * elapsedTime;
  }

  // if down is pressed, move character down
  if(currentInput.down)
  {
    if( player_y < ( GAME_HEIGHT - PLAYER_HEIGHT) )
      player_y += 0.3 * elapsedTime;
  }

  bullets.forEach(function(bullet, index)
  {
    bullet.update(elapsedTime);

    if( bullet.x <= ( player_x + PLAYER_WIDTH))
    {
      if( bullet.y >= player_y && bullet.y <= (player_y + PLAYER_WIDTH))
      {
        bullets.splice(index, 1);
        player_lives -= 1;
        player_was_hit = true;
        if (player_lives < 1)
          game_over = 1;
      }
    }

    // check to see if the bullet hit a ship
    if( aliens[0] )
    {
      if( bullet.x >= aliens[0].x )
      {
        aliens.forEach( function(alien, index2)
        {
          if(bullet.y >= alien.y && bullet.y <= (alien.y + ALIEN_HEIGHT))
          {
            // destroy this bullet and alien
            bullets.splice(index, 1);
            aliens.splice(index2, 1);
            aliens_hit += 1;

            if (aliens_hit % ALIENS_PER_LIFE == 0)
              player_lives += 1;
          }
        });
      }
    }
    else
      spawnAliens();

    // check to see if bullet is off-screen
    if( bullet.x >= GAME_WIDTH || bullet.x <= (0-BULLET_WIDTH))
    {
      bullets.splice(index, 1);
    }
  });

  aliens.forEach( function(alien, index)
  {
    alien.update( elapsedTime);

    if(alien.x <= (0 - ALIEN_WIDTH))
    {
      aliens.splice( index, 1);
      alien_invaded = true;
      game_over = 1;
    }
  });
}

/** @function render
  * Renders the game into the canvas
  * @param {double} elapsedTime - the amount of time
  * elapsed between frames
  */
function render()
{
  screenCtx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  screenCtx.fillStyle = "#00ff00";
  screenCtx.fillRect(player_x, player_y, PLAYER_WIDTH, PLAYER_HEIGHT);
  bullets.forEach(function(bullet) { bullet.render(); } );
  aliens.forEach(function(alien) { alien.render(); } );
  user_interface.render();
}

function Game_Over()
{
  window.alert("Game Over! You destroyed " + aliens_hit + " space invaders!\n\nRefresh the page to start again!");
}




/************************************************************************
  BULLET CLASS
/************************************************************************/
function Bullet(x, y, is_alien)
{
  this.x = x;
  this.y = y;
  this.is_alien = is_alien;
}

Bullet.prototype.update = function(deltaT)
{
  if ( this.is_alien )
    this.x -= deltaT * MOVE_SPEED_BULLET;
  else
    this.x += deltaT * MOVE_SPEED_BULLET;
}

Bullet.prototype.render = function()
{
  screenCtx.beginPath();
  screenCtx.fillStyle = 'red';
  screenCtx.fillRect(this.x, this.y, BULLET_WIDTH, 1);
  screenCtx.fill();
}




/************************************************************************
  ALIEN CLASS
/************************************************************************/
function Alien(x, y)
{
  this.x = x;
  this.y = y;
  this.random = start + Math.floor(Math.random()*1000);
  this.moving_up = 0;
}

Alien.prototype.update = function( deltaT )
{
  if (start > this.random)
  {
    this.moving_up = (this.moving_up + 1) % 2;
    this.random += Math.floor(Math.random()*1000) + 5;

    bullets.push(new Bullet( this.x - 11, this.y + ( ALIEN_WIDTH/2), 1));
  }

  if (this.moving_up == 1)
  {
    if (this.y > 0)
    {
      this.y -= deltaT * MOVE_SPEED_ALIEN;
    }
  }
  else
  {
    if ((this.y+ALIEN_HEIGHT) < GAME_HEIGHT)
    {
      this.y += deltaT * MOVE_SPEED_ALIEN;
    }
  }

  this.x -= deltaT * MOVE_SPEED_ALIEN;
}

Alien.prototype.render = function()
{
  screenCtx.beginPath();
  screenCtx.fillStyle = 'black';
  screenCtx.fillRect(this.x, this.y, ALIEN_WIDTH, ALIEN_WIDTH);
  screenCtx.fill();
}

function spawnAliens()
{
  for (var i = 0; i < ALIENS_PER_SPAWN; i++)
  {
    aliens.push(new Alien( GAME_WIDTH, ( GAME_HEIGHT/ ALIENS_PER_SPAWN ) * i));
  }
}





/************************************************************************
  ALIEN CLASS
/************************************************************************/
function UserInterface() {}

UserInterface.prototype.render = function()
{
  screenCtx.fillStyle = 'black';
  screenCtx.font = "10px sans-serif"

  var score_x = 20;
  var player_lives_x = 180;
  var game_over_status_x = 345;
  var game_status_x = 600;
  var interface_text_y = GAME_HEIGHT + INTERFACE_HEIGHT/2 + 5;

  screenCtx.beginPath();
  screenCtx.moveTo(0,GAME_HEIGHT);
  screenCtx.lineTo(SCREEN_WIDTH, GAME_HEIGHT);
  screenCtx.stroke();

  screenCtx.moveTo( score_x + 140, GAME_HEIGHT);
  screenCtx.lineTo( score_x + 140, SCREEN_HEIGHT);
  screenCtx.stroke();

  screenCtx.moveTo( game_status_x - 70, GAME_HEIGHT);
  screenCtx.lineTo( game_status_x - 70, SCREEN_HEIGHT);
  screenCtx.stroke();

  screenCtx.fillStyle = '#d2d2d2';
  screenCtx.fillRect(player_lives_x + 130, GAME_HEIGHT, 220, SCREEN_WIDTH);

  screenCtx.fillStyle = 'black';
  screenCtx.fillText("ALIENS DESTROYED: " + aliens_hit, score_x, interface_text_y);
  screenCtx.fillText("PLAYER LIVES LEFT: " + player_lives, player_lives_x, interface_text_y);

  if (aliens_hit < 1)
  {
    screenCtx.font = "20px Calibri"
    screenCtx.fillText("You are humanity's last stand!", GAME_WIDTH/2 - 160, GAME_HEIGHT/2 - 20);
    screenCtx.fillText("Don't let any aliens get through your defences!", GAME_WIDTH/2 - 220, GAME_HEIGHT/2 + 0);
    screenCtx.fillText("Press space when you are ready to play!", GAME_WIDTH/2 - 190, GAME_HEIGHT/2 + 20);

    screenCtx.fillText("TUTORIAL:", GAME_WIDTH/2 - 150, GAME_HEIGHT/2 + 100);
    screenCtx.fillText("Press space to fire lasers", GAME_WIDTH/2 - 100, GAME_HEIGHT/2 + 120);
    screenCtx.fillText("Press up/down to dodge alien lasers", GAME_WIDTH/2 - 100, GAME_HEIGHT/2 + 140);
    screenCtx.fillText("You lose a life if you are hit", GAME_WIDTH/2 - 100, GAME_HEIGHT/2 + 160);
    screenCtx.fillText("You gain a life if you destory "+ALIENS_PER_LIFE+" aliens", GAME_WIDTH/2 - 100, GAME_HEIGHT/2 + 180);
    screenCtx.fillText("You lose the game if you have no lives", GAME_WIDTH/2 - 100, GAME_HEIGHT/2 + 200);
    screenCtx.fillText("or if the aliens make it past your defenses", GAME_WIDTH/2 - 80, GAME_HEIGHT/2 + 220);
  }

  screenCtx.font = "10px sans-serif"
  if (player_was_hit)
  {
    screenCtx.fillStyle = 'red';
    screenCtx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    player_was_hit = false;
  }

  if (!game_over)
  {
    screenCtx.fillStyle = 'green';
    screenCtx.fillText("Keep fighting!", game_status_x, interface_text_y);
  }
  else
  {
    screenCtx.fillText("Refresh the page to try again", GAME_WIDTH/2-100, GAME_HEIGHT/2 + 200);

    screenCtx.fillStyle = 'red';
    screenCtx.fillText("Game over!", game_status_x, interface_text_y);

    screenCtx.font = "12px sans-serif"
    if ( player_lives < 1 )
      screenCtx.fillText("YOUR SHIP WAS DESTROYED!", game_over_status_x, interface_text_y);
    if (alien_invaded)
      screenCtx.fillText("THE ALIENS MADE IT PAST!", game_over_status_x, interface_text_y);

    screenCtx.fillStyle = "#000000";
    screenCtx.font = "15px sans-serif"
    screenCtx.fillText("NOOOOOOOOOOOOOOOOOOOOOOOOOOO", GAME_WIDTH/2-180, GAME_HEIGHT/2);
  }
}




/************************************************************************
  Start the game loop
/************************************************************************/
window.requestAnimationFrame(loop);
