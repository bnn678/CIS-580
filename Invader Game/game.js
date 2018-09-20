/************************************************************************
  CONSTANTS
/************************************************************************/
// Screen dimensions
const SCREEN_WIDTH = 740
const SCREEN_HEIGHT = 480

const MOVE_SPEED_ALIEN = .1;
const MOVE_SPEED_BULLET = .1;

const PLAYER_WIDTH = 20;
const PLAYER_HEIGHT = 20;

const BULLET_WIDTH = 10;

const ALIEN_WIDTH = 50;
const ALIEN_HEIGHT = 50;

const ALIENS_PER_SPAWN = 1;

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
var player_y = SCREEN_HEIGHT/2;
var bullets = [];
var aliens = [];




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
  if(!start) start = timestamp;
  var elapsedTime = timestamp - start;
  start = timestamp;
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
    bullets.push(new Bullet( player_x + 10, player_y+(PLAYER_WIDTH/2), 0));

  // if up is pressed, move character up
  if(currentInput.up)
  {
    if( player_y > 0 )
      player_y -= 0.3 * elapsedTime;
  }

  // if down is pressed, move character down
  if(currentInput.down)
  {
    if( player_y < ( SCREEN_HEIGHT - PLAYER_HEIGHT) )
      player_y += 0.3 * elapsedTime;
  }

  bullets.forEach(function(bullet, index)
  {
    bullet.update(elapsedTime);

    if( bullet.x < ( player_x + PLAYER_WIDTH))
    {
      if( bullet.y < player_y && bullet.y > (player_y - PLAYER_WIDTH))
      {
        console.log("Game Over!");
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
          }
        });
      }
    }
    else
      spawnAliens();

    // check to see if bullet is off-screen
    if( bullet.x >= SCREEN_WIDTH || bullet.x <= (0-BULLET_WIDTH))
    {
      bullets.splice(index, 1);
      // is it possible to use a break here?
    }
  });

  aliens.forEach( function(alien, index)
  {
    alien.update( elapsedTime);

    if(alien.x <= (0- ALIEN_WIDTH)) aliens.splice( index, 1);
  });
}

/** @function render
  * Renders the game into the canvas
  * @param {double} elapsedTime - the amount of time
  * elapsed between frames
  */
function render(elapsedTime)
{
  screenCtx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  screenCtx.fillStyle = "#00ff00";
  screenCtx.fillRect(player_x, player_y, PLAYER_WIDTH, PLAYER_HEIGHT);
  bullets.forEach(function(bullet) { bullet.render(screenCtx); } );
  aliens.forEach(function(alien) { alien.render(screenCtx); } );
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

Bullet.prototype.render = function(context)
{
  context.beginPath();
  context.fillStyle = 'red';
  screenCtx.fillRect(this.x, this.y, BULLET_WIDTH, 1);
  context.fill();
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
    if ((this.y+ALIEN_HEIGHT) < SCREEN_HEIGHT)
    {
      this.y += deltaT * MOVE_SPEED_ALIEN;
    }
  }

  this.x -= deltaT * MOVE_SPEED_ALIEN;
}

Alien.prototype.render = function(context)
{
  context.beginPath();
  context.fillStyle = 'black';
  screenCtx.fillRect(this.x, this.y, ALIEN_WIDTH, ALIEN_WIDTH);
  context.fill();
}

function spawnAliens()
{
  for (var i = 0; i < ALIENS_PER_SPAWN; i++)
  {
    aliens.push(new Alien( SCREEN_WIDTH, ( SCREEN_HEIGHT/ ALIENS_PER_SPAWN ) * i));
  }
}




/************************************************************************
  Start the game loop
/************************************************************************/

window.requestAnimationFrame(loop);
