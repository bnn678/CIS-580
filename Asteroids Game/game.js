/************************************************************************
  CONSTANTS
/************************************************************************/
/* Screen dimensions */
const GAME_WIDTH = 740;
const GAME_HEIGHT = 480;
const INTERFACE_WIDTH = GAME_WIDTH;
const INTERFACE_HEIGHT = 20;
const SCREEN_WIDTH = GAME_WIDTH;
const SCREEN_HEIGHT = GAME_HEIGHT + INTERFACE_HEIGHT;

const PLAYER_WIDTH = 20;
const PLAYER_HEIGHT = 20;
const PLAYER_MOVE_SPEED = 3;
const PLAYER_TURN_SPEED = .005;

const BULLET_MOVE_SPEED = .3;

const ASTEROID_MOVE_SPEED = .005;
const ASTEROID_STARTING_COUNT = 1;
const ASTEROID_RADIUS = 20;

/*Create the canvas and context */
var screen = document.createElement('canvas');
var screenCtx = screen.getContext('2d');
screen.height = SCREEN_HEIGHT;
screen.width = SCREEN_WIDTH;
document.body.appendChild(screen);

/// https://www.w3schools.com/graphics/game_sound.asp audio doesn't work
/*
var game_audio = document.createElement("myAudio");
game_audio.src = src;
this.sound.play();

var audio1 = new sound("bounce.mp3");
audio1.play();
*/

/* Game state variables */
var currentInput = {
  space: false,
  left: false,
  right: false,
  up: false,
  down: false,
  q: false,
  esc: false
}
var priorInput = {
  space: false,
  left: false,
  right: false,
  up: false,
  down: false,
  q: false,
  esc: false
}

/* game state varibles */
var start = null;
var game_start = false;
var game_over = false;
var round_over = false;
var game_running = true;
var show_instructions = false;

var round = 1;
var debug = 0;
var game_runs = 0;

/* Initilize the Player */
var player = new Player( GAME_WIDTH/2, GAME_HEIGHT/2, 0);
/* Initilize the User Interface */
var user_interface = new UserInterface();

var asteroids_hit = 0;

var bullets = [];
var asteroids = [];

/************************************************************************
  KEY LISTENERS : game function

  Attach keyup and keydown event handlers to the window
/************************************************************************/
function handleKeydown(event)
{
  switch(event.key)
  {
    case ' ':
      currentInput.space = true;
      game_start = 1; // TODO: Optional: find a better place for this
      break;
    case 'ArrowUp':
    case 'w':
      currentInput.up = true;
      break;
    case 'ArrowDown':
    case 's':
      currentInput.down = true;
      break;
    case 'a':
    case 'ArrowLeft':
      currentInput.left = true;
      break;
    case 'd':
    case 'ArrowRight':
      currentInput.right = true;
      break;
    case 'q':
      currentInput.q = true;
      break;
    case 'Escape':
      currentInput.esc = true;
      break;
  }
}
window.addEventListener('keydown', handleKeydown);

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
    case 'a':
    case 'ArrowLeft':
      currentInput.left = false;
      break;
    case 'd':
    case 'ArrowRight':
      currentInput.right = false;
      break;
    case 'q':
      currentInput.q = false;
      break;
    case 'Escape':
      currentInput.esc = false;
      break;
  }
}
window.addEventListener('keyup', handleKeyup); /// game doesn't shoot when turning left?

function copyInput()
{
  priorInput = JSON.parse(JSON.stringify(currentInput));
}

/************************************************************************
  HANDLE KEYS : game function

  DO appropriate action on key event
/************************************************************************/
function Handle_Keys( elapsedTime)
{
  if( currentInput.up)
  {
    player.x += player.vector.getX();
    player.y += player.vector.getY();
  }

  if( currentInput.down)
  {
    player.x -= player.vector.getX();
    player.y -= player.vector.getY();
  }

  if( currentInput.left)
    player.vector.direction -= PLAYER_TURN_SPEED * elapsedTime;

  if( currentInput.right)
    player.vector.direction += PLAYER_TURN_SPEED * elapsedTime;

  if( currentInput.q && !priorInput.q)
    player.Teleport();

  if( currentInput.esc && ! priorInput.esc && show_instructions == false)
    show_instructions = true;
  else if( currentInput.esc && ! priorInput.esc && show_instructions == true)
    show_instructions = false;

  if(currentInput.space && !priorInput.space)
  {
    bullets.push(new Bullet( player.x, player.y, player.vector.direction));
    // TODO: add sound effect

    if( round_over)
    {
      round += 1;
      Spawn_Asteroids();
    }
  }
}

/************************************************************************
  SPAWN ASTEROIDS : game function

  Generate Asteroid objects into game
/************************************************************************/
function Spawn_Asteroids()
{
  for( var i = 0; i < ASTEROID_STARTING_COUNT + round; i++ )
  {
    asteroids.push( new Asteroid( Math.random() * GAME_WIDTH, Math.random() * GAME_HEIGHT, Math.floor( Math.random() * round + 1)));
  }
}

/************************************************************************
  WRAP : object function

  Wrap the given object around the map if necessary
/************************************************************************/
function WrapObject( obj) /// how do I pass a generic class object to this function?
{
  if( obj.x <= -PLAYER_WIDTH)
    this.x = GAME_WIDTH;
  else if( this.x >= GAME_WIDTH)
    this.x = -PLAYER_WIDTH;
  if( this.y <= -PLAYER_WIDTH)
    this.y = GAME_HEIGHT;
  else if( this.y >= GAME_HEIGHT)
    this.y = -PLAYER_WIDTH;
}

/************************************************************************
  VECTOR : Class


/************************************************************************/
function Vector(magnitude, direction)
{
  this.magnitude = magnitude;
  this.direction = direction;
}

Vector.prototype.getX = function()
{
  return ( (Math.cos(this.direction) * this.magnitude));
}

Vector.prototype.getY = function()
{
  return ( (Math.sin(this.direction) * this.magnitude));
}

/************************************************************************
  PLAYER : Class


/************************************************************************/
function Player(x, y, direction)
{
  this.x = x;
  this.y = y;
  this.vector = new Vector( PLAYER_MOVE_SPEED, direction);

  this.lives = 3;
  this.was_hit = false;
}

Player.prototype.Teleport = function()
{
  this.x = Math.random() * GAME_WIDTH;
  this.y = Math.random() * GAME_HEIGHT;
}

Player.prototype.Check_Asteroid_Collision = function()
{
  for ( var i = 0; i < asteroids.length; i++ )
  {
    var rect = this;
    var circle = asteroids[i];

    var distX = Math.abs( circle.x - rect.x - PLAYER_WIDTH/2);
    var distY = Math.abs( circle.y - rect.y - PLAYER_HEIGHT/2);

    var dx = distX - PLAYER_WIDTH/2;
    var dy = distY - PLAYER_HEIGHT/2;
    if( dx * dx + dy * dy <= ( circle.radius * circle.radius))
    {
      player.was_hit = true;
      player.lives -= 1;
      asteroids.splice( asteroids.indexOf( circle), 1);
    }
  }
}

Player.prototype.update = function( elapsedTime)
{
  /* Wrap Player around the map if necessary */
  // TODO: Optional: make this a general function
  if( this.x <= -PLAYER_WIDTH)
    this.x = GAME_WIDTH;
  else if( this.x >= GAME_WIDTH)
    this.x = -PLAYER_WIDTH;
  if( this.y <= -PLAYER_WIDTH)
    this.y = GAME_HEIGHT;
  else if( this.y >= GAME_HEIGHT)
    this.y = -PLAYER_WIDTH;

  this.Check_Asteroid_Collision();

  if( this.lives <= 0)
  {
    game_over = true;
  }
}

Player.prototype.render = function()
{
  screenCtx.fillStyle = "#00ff00";
  screenCtx.fillRect(this.x, this.y, PLAYER_WIDTH, PLAYER_HEIGHT);
}

/************************************************************************
  BULLET : Class

  Class that defines all bullet information
/************************************************************************/
function Bullet(x, y, direction)
{
  this.x = x;
  this.y = y;
  this.vector = new Vector(BULLET_MOVE_SPEED, direction);

  this.Check_Asteroid_Collision = function()
  {
    for ( var i = 0; i < asteroids.length; i++ )
    {
      var asteroid = asteroids[i];

      if( this.x >= ( asteroid.x - asteroid.radius)
       && this.x <= ( asteroid.x + asteroid.radius))
      {
        if( this.y >= ( asteroid.y - asteroid.radius)
         && this.y <= ( asteroid.y + asteroid.radius))
        {
          bullets.splice( bullets.indexOf( this), 1);
          asteroid.x += asteroid.radius / 2;
          asteroid.y += asteroid.radius / 2;
          asteroids.push( new Asteroid( asteroid.x - asteroid.radius, asteroid.y - asteroid.radius, asteroid.size - 1));
          asteroid.blowUp();
          asteroids_hit += 1;
        }
      }
    }
  }
}

Bullet.prototype.update = function(deltaT)
{
  this.x += this.vector.getX() * deltaT;
  this.y += this.vector.getY() * deltaT;

  /* if at the map edge, remove this bullet from bullets */
  if( this.x >= GAME_WIDTH || this.x <= 0 ||
      this.y >= GAME_HEIGHT || this.y <= 0)
  {
    bullets.splice( bullets.indexOf(this), 1);
  }

  this.Check_Asteroid_Collision();
}

Bullet.prototype.render = function()
{
  screenCtx.fillStyle = 'red';
  screenCtx.fillRect(this.x, this.y, 2, 2);
}

/************************************************************************
  ASTEROID : Class

  Defines all functions are varibles for the Asteroid object
/************************************************************************/
function Asteroid(x, y, size)
{
  this.x = x;
  this.y = y;
  this.size = size;
  this.radius = ASTEROID_RADIUS * size;

  this.random = start + Math.floor(Math.random()*1000);
  this.vector = new Vector( ASTEROID_MOVE_SPEED, this.random);

  this.blowUp = function()
  {
    this.size -= 1;
    this.radius = ASTEROID_RADIUS * this.size;
  }

  this.Check_Asteroid_Collision = function()
  {
    // TODO: get this to work.
    // TODO: add a sound effect.
    for ( var i = 0; i < asteroids.length; i++ )
    {
      var asteroid = asteroids[i];

      if( asteroid == this)
        break;

      var distance = Math.pow( this.x - asteroid.x, 2) + Math.pow( this.y - asteroid.y);
      if( this.radius * asteroid.radius > Math.pow(this.x - asteroid.x) + Math.pow(this.y - asteroid.y))
      {
        console.log("made it");
        this.direction -= 1;
      }
    }
  }
}

Asteroid.prototype.update = function( deltaT ) /// what's the difference between this and the blow up function?
{
  // TODO: Optional: generalize this as a function
  if( this.x <= -PLAYER_WIDTH)
    this.x = GAME_WIDTH;
  else if( this.x >= GAME_WIDTH)
    this.x = -PLAYER_WIDTH;
  if( this.y <= -PLAYER_WIDTH)
    this.y = GAME_HEIGHT;
  else if( this.y >= GAME_HEIGHT)
    this.y = -PLAYER_WIDTH;

  this.x += this.vector.getX() * deltaT;
  this.y += this.vector.getY() * deltaT;

  this.Check_Asteroid_Collision();

  if( this.size == 0)
    asteroids.splice( asteroids.indexOf(this), 1);
}

Asteroid.prototype.render = function()
{
  screenCtx.beginPath();
  screenCtx.fillStyle = 'black';
  screenCtx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
  screenCtx.fill();
}

/************************************************************************
  ALIEN : Class

  Defines all functions are varibles for the ALIEN object
/************************************************************************/
// TODO: Optional: Implement alien. Bonus credit.
// TODO: Optional: utilize a Shooter superclass & inheirtance

/************************************************************************
  USER INTERFACE : Class

  Displays user information on screen
/************************************************************************/
function UserInterface() {}
// TODO: Optional: use an HTML element instead of the Canvas
UserInterface.prototype.render = function()
{
  var score_x = 15;
  var player_lives_x = 180;
  var game_over_status_x = 345;
  var game_status_x = 600;
  var interface_y = GAME_HEIGHT+1;
  var interface_text_y = GAME_HEIGHT + INTERFACE_HEIGHT/2 + 5;

  screenCtx.fillStyle = '#FFFFFF';
  screenCtx.fillRect( 0, GAME_HEIGHT+1, SCREEN_WIDTH, interface_y);

  screenCtx.fillStyle = 'black';
  screenCtx.font = "10px sans-serif"

  screenCtx.beginPath();
  screenCtx.moveTo(0,GAME_HEIGHT);
  screenCtx.lineTo(SCREEN_WIDTH, GAME_HEIGHT);
  screenCtx.stroke();

  screenCtx.moveTo( score_x + 148, GAME_HEIGHT);
  screenCtx.lineTo( score_x + 148, SCREEN_HEIGHT);
  screenCtx.stroke();

  screenCtx.fillText("ASTEROIDS DESTROYED: " + asteroids_hit, score_x, interface_text_y);
  screenCtx.fillText("PLAYER LIVES LEFT: " + player.lives, player_lives_x, interface_text_y);

  /* could also use fillStyle = '#d2d2d2' */
  screenCtx.fillRect(player_lives_x + 125, GAME_HEIGHT+1, 245, interface_y);

  if (! game_start || round_over)
  {
    screenCtx.fillStyle = 'black';
    screenCtx.fillText("Press Space to start", GAME_WIDTH/2-100, GAME_HEIGHT/2 + 200);

    screenCtx.fillStyle = 'grey';
    screenCtx.fillText("Waiting to start", game_status_x, interface_text_y);
  }
  else if (! game_over)
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
    screenCtx.fillText("YOUR SHIP WAS DESTROYED!", game_over_status_x, interface_text_y);

    screenCtx.fillStyle = "#000000";
    screenCtx.font = "15px sans-serif"
    screenCtx.fillText("NOOOOOOOOOOOOOOOOOOOOOOOOOOO", GAME_WIDTH/2-180, GAME_HEIGHT/2);
  }

  if( player.was_hit)
  {
    screenCtx.fillStyle = 'red';
    screenCtx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    player.was_hit = false;
  }

  if( show_instructions == true)
  {
    screenCtx.fillStyle = "#000000";
    screenCtx.font = "12px sans-serif"
    screenCtx.fillText("Instructions", 250, 250);
  }
}

/************************************************************************
  UPDATE : game function

  Generate information for the next frame to be displayed
/************************************************************************/
function update( elapsedTime)
{
  if( asteroids.length == 0)
    round_over = 1;
  else
    round_over = 0;

  Handle_Keys( elapsedTime);

  player.update( elapsedTime);

  bullets.forEach(function( bullet)
  {
    bullet.update( elapsedTime);
  });

  asteroids.forEach( function(asteroid, index)
  {
    asteroid.update( elapsedTime);
  });
}

/************************************************************************
  RENDER : game function

  Display all characters and sprites to the canvas
/************************************************************************/
function render()
{
  screenCtx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  player.render();
  bullets.forEach(function(bullet) { bullet.render(); } );
  asteroids.forEach(function(alien) { alien.render(); } );
  user_interface.render();
}

/************************************************************************
  MAIN : game function
/************************************************************************/
function loop(timestamp)
{
  if(! start)
  {
    start = timestamp;
  }

  var elapsedTime = timestamp - start;
  start = timestamp;

  if(! game_start || game_over )
    game_running = 0;
  else {
    game_running = 1;
  }

  if( debug == 1)
  {
    if( game_runs <= 200)
      game_runs += 1;
    else
      game_running = 0;
  }

  if ( game_running )
  {
    if(! debug )
    {
      update( elapsedTime);
    }
    else
    {
      game_runs += 1;
      if( game_runs <= 200)
        update( elapsedTime);
    }
  }

  render( elapsedTime);
  copyInput();
  window.requestAnimationFrame(loop);
}

/* helps to debug asteroid collision */
/*
asteroids.push( new Asteroid( 200, 250, 2));
asteroids.push( new Asteroid( 300, 250, 2));
asteroids[0].vector.direction = 0;
asteroids[1].vector.direction = Math.PI;
*/
window.requestAnimationFrame(loop);

/* bfxr.net for audio */