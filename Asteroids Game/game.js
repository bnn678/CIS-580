/************************************************************************
  Contents:
    CONSTANTS
    Canvas & Document Init
    GLOBAL VARIBLES

    KEY LISTENERS : game function
    HANDLE KEYS : game function
    SPAWN ASTEROIDS : game function
    SPAWN ALIEN : game function
    WRAP OBJECT : game function

    VECTOR : Class
    PLAYER : Class
    BULLET : Class
    ASTEROID : Class
    ALIEN : Class
    USER INTERFACE : Class

    UPDATE : game function
    RENDER : game function
    MAIN : game function

    // CANDO: possible improvements
    // TODO: must do for assignment
/************************************************************************/

/************************************************************************
  CONSTANTS
/************************************************************************/
/* Screen dimensions */
const GAME_WIDTH = 740;
const GAME_HEIGHT = 480;
const INTERFACE_WIDTH = 20;
const INTERFACE_HEIGHT = 20;
const SCREEN_WIDTH = GAME_WIDTH + INTERFACE_WIDTH;
const SCREEN_HEIGHT = GAME_HEIGHT + INTERFACE_HEIGHT;

/* Player attributes */
const PLAYER_WIDTH = 20;
const PLAYER_HEIGHT = 20;
const PLAYER_MOVE_SPEED = 3;
const PLAYER_TURN_SPEED = .005;

const BULLET_MOVE_SPEED = .3;

const ASTEROID_MOVE_SPEED = .05;
const ASTEROID_STARTING_COUNT = 10;
const ASTEROID_STARTING_RADIUS = 10;

const ALIEN_MOVE_SPEED = .2;
const ALIEN_RELOAD_TIME = 100;

/************************************************************************
  Canvas & Document Init
/************************************************************************/
/*Create the canvas and context */
var screen = document.createElement('canvas');
var screenCtx = screen.getContext('2d');
screen.height = SCREEN_HEIGHT;
screen.width = SCREEN_WIDTH;
document.body.appendChild(screen);

/* Credit to: https://www.w3schools.com/graphics/game_sound.asp */
/* audio doesn't work on Ubuntu */
function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }
}

/* bfxr.net - can't use b/c firefox only supports wav */
/* Credit to: http://www.findsounds.com/ISAPI/search.dll?keywords=laser */
var laser_sound = new sound("LASRLIT2.WAV");
var collision_sound = new sound("Collision.wav");

/************************************************************************
  GLOBAL VARIBLES
/************************************************************************/
/* Input variables */
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
var show_instructions = true;

var round = 2;
var debug = 0;
var game_runs = 0;

/* Initilize the Player */
var player = new Player( GAME_WIDTH/2, GAME_HEIGHT/2, 0);
/* Initilize the User Interface */
var user_interface = new UserInterface();

var asteroids_hit = 0;

var bullets = [];
var asteroids = [];
var aliens = [];

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
      game_start = 1; // CANDO: find a better place for this
      show_instructions = false;
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
    laser_sound.play();

    if( round_over)
    {
      round += 1;
      Spawn_Asteroids();
      Spawn_Alien();
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
  SPAWN ALIEN : game function

  Generate Alien objects into game
/************************************************************************/
function Spawn_Alien()
{
  aliens.push( new Alien( Math.random() * GAME_WIDTH, Math.random() * GAME_HEIGHT, Math.random() * Math.PI * 2));
}

/************************************************************************
  WRAP OBJECT : game function

  Wrap the given object around the map if necessary
/************************************************************************/
function Screenwrap_Object( obj, obj_width, obj_height) /// how do I pass a generic class object to this function?
{
  if( obj.x <= -obj_width)
    obj.x = GAME_WIDTH+obj_width;
  else if( obj.x >= GAME_WIDTH+obj_width)
    obj.x = -obj_width;
  if( obj.y <= -obj_height)
    obj.y = GAME_HEIGHT+obj_height;
  else if( obj.y >= GAME_HEIGHT+obj_height)
    obj.y = -obj_height;
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
  MOVER : Class
/************************************************************************/
/* http://krasimirtsonev.com/blog/article/object-oriented-programming-oop-in-javascript-extending-Inheritance-classes */
// CANDO: finish implementing this super class
function Mover(x, y, magnitude, direction)
{
  this.x = x;
  this.y = y;
  this.magnitude = magnitude;
  this.direction = direction;

  this.vector = new Vector(this.magnitude, this.direction);
}

Mover.prototype.update = function(deltaT)
{
  this.x += this.vector.getX() * deltaT;
  this.y += this.vector.getY() * deltaT;
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
      collision_sound.play();
    }
  }
}

Player.prototype.update = function( elapsedTime)
{
  /* Wrap Player around the map if necessary */
  Screenwrap_Object( this, PLAYER_WIDTH, PLAYER_HEIGHT);

  this.Check_Asteroid_Collision();

  /* Check alien bullet collision */
  var alien = this;
  bullets.forEach( function(bullet, index)
  {
    if( bullet.is_alien)
    {
      if( bullet.x <= ( alien.x + PLAYER_WIDTH) && bullet.x >= ( alien.x))
      {
        if( bullet.y >= alien.y && bullet.y <= (alien.y + PLAYER_WIDTH))
        {
          bullets.splice(index, 1);
          player.was_hit = true;
          player.lives -= 1;
        }
      }
    }
  });

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

  this.is_alien = false;
}

Bullet.prototype.Check_Asteroid_Collision = function()
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
        var angle_of_defraction = Math.PI / 4;
        var collision_point_x = this.x;
        var collision_point_y = this.y;

        /* modify the asteroid getting blown up */
        asteroid.vector.direction = this.vector.direction - angle_of_defraction;
        asteroid.blowUp();

        /* create baby asteroid to add to game */
        // CANDO: change the location of the new asteroid
        var new_asteroid = new Asteroid( asteroid.x, asteroid.y + 2*asteroid.radius + 5, asteroid.size);
        new_asteroid.vector.direction = this.vector.direction + angle_of_defraction;

        asteroids.push( new_asteroid);

        bullets.splice( bullets.indexOf( this), 1);
        this.x = -100; this.y = -100;
        asteroids_hit += 1;
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
  this.radius = ASTEROID_STARTING_RADIUS * size;

  this.random = start + Math.floor(Math.random()*1000);
  this.vector = new Vector( ASTEROID_MOVE_SPEED, this.random);
}

Asteroid.prototype.blowUp = function()
{
  this.size -= 1;
  this.radius = ASTEROID_STARTING_RADIUS * this.size;
}

Asteroid.prototype.Check_Asteroid_Collision = function()
{
  // CANDO: get this to work all the time
  for ( var i = 0; i < asteroids.length; i++ )
  {
    var asteroid = asteroids[i];

    if( asteroid == this)
      break;

    var distance = Math.pow( this.x - asteroid.x, 2) + Math.pow( this.y - asteroid.y, 2);
    if( distance < Math.pow(this.radius + asteroid.radius, 2) )
    {
      collision_sound.play();

      /* https://gamedevelopment.tutsplus.com/tutorials/when-worlds-collide-simulating-circle-circle-collisions--gamedev-769 */
      var x1 = (this.vector.getX() * (this.radius - asteroid.radius) + (2 * asteroid.radius * asteroid.vector.getX())) / (this.radius + asteroid.radius);
      var y1 = (this.vector.getY() * (this.radius - asteroid.radius) + (2 * asteroid.radius * asteroid.vector.getY())) / (this.radius + asteroid.radius);

      var x2 = (asteroid.vector.getX() * (asteroid.radius - this.radius) + (2 * this.radius * this.vector.getX())) / (this.radius + asteroid.radius);
      var y2 = (asteroid.vector.getY() * (asteroid.radius - this.radius) + (2 * this.radius * this.vector.getY())) / (this.radius + asteroid.radius);

      this.vector.magnitude = Math.sqrt( Math.pow( x1, 2) + Math.pow( y1, 2));
      this.vector.direction = Math.acos( x1 / this.vector.magnitude);

      asteroid.vector.magnitude = Math.sqrt( Math.pow( x2, 2) + Math.pow( y2, 2));
      asteroid.vector.direction = Math.acos( x2 / asteroid.vector.magnitude)
    }
  }
}

Asteroid.prototype.update = function( deltaT )
{
  // CANDO: generalize this as a function
  Screenwrap_Object( this, this.radius * 2, this.radius * 2)
  /*
  if( this.x <= -PLAYER_WIDTH)
    this.x = GAME_WIDTH;
  else if( this.x >= GAME_WIDTH)
    this.x = -PLAYER_WIDTH;
  if( this.y <= -PLAYER_WIDTH)
    this.y = GAME_HEIGHT;
  else if( this.y >= GAME_HEIGHT)
    this.y = -PLAYER_WIDTH;*/

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
// CANDO: Optional: utilize a Shooter superclass & inheirtance
function Alien(x, y, direction)
{
  this.x = x;
  this.y = y;
  this.vector = new Vector( ALIEN_MOVE_SPEED, direction);
}

Alien.prototype.Check_Asteroid_Collision = function()
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
      aliens.splice( aliens.indexOf( this), 1);
      asteroids.splice( asteroids.indexOf( circle), 1);
      collision_sound.play();
    }
  }
}

var last_alien_shot = 0;
Alien.prototype.Shoot = function()
{
  // CANDO: make the alien shoot at the player
  if( last_alien_shot >= ALIEN_RELOAD_TIME)
  {
    var new_bullet = new Bullet( this.x - 1, this.y - 1, this.vector.direction);
    new_bullet.is_alien = true;
    bullets.push( new_bullet);
    laser_sound.play();
    last_alien_shot = 0;
    this.vector.direction += Math.random() * 2 - 1;
  }
  last_alien_shot += 1;
}

Alien.prototype.update = function( elapsedTime)
{
  /* Wrap Player around the map if necessary */
  // CANDO: make this a general function
  Screenwrap_Object( this, PLAYER_WIDTH, PLAYER_HEIGHT);

  this.x += this.vector.getX() * elapsedTime;
  this.y += this.vector.getY() * elapsedTime;

  this.Shoot();

  this.Check_Asteroid_Collision();

  /* Check bullet collision */
  var alien = this;
  bullets.forEach( function(bullet, index)
  {
    if( bullet.x <= ( alien.x + PLAYER_WIDTH) && bullet.x >= ( alien.x))
    {
      if( bullet.y >= alien.y && bullet.y <= (alien.y + PLAYER_WIDTH))
      {
        console.log( bullet.x, bullet.y, alien.x, alien.y, PLAYER_WIDTH);
        bullets.splice(index, 1);
        aliens.splice( aliens.indexOf(alien), 1);
      }
    }
  });
}

Alien.prototype.render = function()
{
  screenCtx.fillStyle = "red";
  screenCtx.fillRect(this.x, this.y, PLAYER_WIDTH, PLAYER_HEIGHT);
}

/************************************************************************
  USER INTERFACE : Class

  Displays user information on screen
/************************************************************************/
function UserInterface() {}
// CANDO: use an HTML element instead of the Canvas
UserInterface.prototype.render = function()
{
  var interface_y = GAME_HEIGHT+1;
  var interface_text_y = GAME_HEIGHT + INTERFACE_HEIGHT/2 + 5;

  var score_x = 15;
  var player_lives_x = 180;
  var game_level_x = 310;
  var game_over_box_x = 420;
  var game_over_status_text_x = game_over_box_x + 40;
  var game_status_x = 680;

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

  screenCtx.moveTo( game_level_x, GAME_HEIGHT);
  screenCtx.lineTo( game_level_x, SCREEN_HEIGHT);
  screenCtx.stroke();

  screenCtx.fillText("ASTEROIDS DESTROYED: " + asteroids_hit, score_x, interface_text_y);
  screenCtx.fillText("PLAYER LIVES LEFT: " + player.lives, player_lives_x, interface_text_y);
  screenCtx.fillText("Level: " + round, game_level_x + 35, interface_text_y);

  /* could also use fillStyle = '#d2d2d2' */
  screenCtx.fillRect( game_over_box_x, GAME_HEIGHT+1, 245, interface_y);

  // CANDO: fix round_over flag
  if( round_over == false)
  {
    screenCtx.fillStyle = 'white';
    // screenCtx.fillText("Press ESC to see tutorial.", game_over_status_text_x, interface_text_y);
  }
  if (! game_start || round_over)
  {
    screenCtx.fillStyle = 'black';
    screenCtx.fillText("Press Space to start", GAME_WIDTH/2-100, GAME_HEIGHT/2 + 200);
  }
  else if (! game_over)
  {
    screenCtx.fillStyle = 'green';
    screenCtx.fillText("Keep fighting!", game_status_x, interface_text_y);
  }
  else
  {
    screenCtx.fillStyle = 'red';
    screenCtx.fillText("Refresh the page to try again", GAME_WIDTH/2-100, GAME_HEIGHT/2 + 200);

    screenCtx.fillText("Game over!", game_status_x, interface_text_y);

    screenCtx.font = "12px sans-serif"
    screenCtx.fillText("YOUR SHIP WAS DESTROYED!", game_over_status_text_x, interface_text_y);

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
    var starting_x = 50;
    var starting_y = 100;
    screenCtx.fillStyle = "#000000";
    screenCtx.font = "20px sans-serif"
    screenCtx.fillText("Instructions:", starting_x, starting_y);

    screenCtx.font = "16px sans-serif"
    screenCtx.fillText("Left arrow turns the ship to the left.", starting_x + 50, starting_y + 50);
    screenCtx.fillText("Right arrow turns the ship to the right.", starting_x + 50, starting_y + 70);
    screenCtx.fillText("Up arrow moves the ship forward.", starting_x + 50, starting_y + 90);
    screenCtx.fillText("Down arrow moves the ship backward.", starting_x + 50, starting_y + 110);
    screenCtx.fillText("Space fires a laser beam.", starting_x + 50, starting_y + 130);
    screenCtx.fillText("Q teleports the player to a random location.", starting_x + 50, starting_y + 150);
    screenCtx.fillText("ESC will toggle instructions.", starting_x + 50, starting_y + 170);
  }
}

/************************************************************************
  UPDATE : game function

  Generate information for the next frame to be displayed
/************************************************************************/
function update( elapsedTime)
{
  // CANDO: move this
  if( asteroids.length == 0)
    round_over = 1;
  else
    round_over = 0;

  Handle_Keys( elapsedTime);

  player.update( elapsedTime);
  bullets.forEach(function( bullet) { bullet.update( elapsedTime); });
  asteroids.forEach( function(asteroid, index) { asteroid.update( elapsedTime); });
  aliens.forEach( function(alien, index) { alien.update( elapsedTime); });
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
  asteroids.forEach(function(asteroid) { asteroid.render(); } );
  aliens.forEach(function(alien) { alien.render(); } );
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

/* helps to debug alien class */
/*
aliens.push( new Alien( 100, 100, Math.PI));
asteroids.push( new Asteroid( 200, 100, 2));
asteroids[0].vector.direction = 0;
*/

/* helps to debug asteroid-bullet collision */
/*
bullets.push(new Bullet( 200, 100, 0));
asteroids.push( new Asteroid( 300, 100, 2));
asteroids[0].vector.direction = 0;

bullets.push(new Bullet( 500, 100, 1 * Math.PI / 2));
asteroids.push( new Asteroid( 500, 300, 2));
asteroids[1].vector.direction = Math.PI / 2;
*/

/* helps to debug asteroid-asteroid collision */
/*
asteroids.push( new Asteroid( 200, 100, 2));
asteroids.push( new Asteroid( 300, 100, 2));
asteroids[0].vector.direction = 0;
asteroids[1].vector.direction = Math.PI;
*/
window.requestAnimationFrame(loop);
