/* constants */
const colors = ["green", "red"];

/* globals */
var turn = 0;

var board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

function displayTurn()
{
  //displayMessage("It is <div class='pebble " + colors[turn] + "'></div>'s turn")
  displayMessage("It is Player " + turn + "'s turn.");
}

function displayScore()
{
  document.getElementById("score").innerHTML = ("Player 0's Score: " + board[0] + "\n\nPlayer 1's Score: " + board[7]);
}

function displayMessage(message)
{
  document.getElementById('ui').innerHTML = message;
}

function initPebbles()
{
  for (i = 1; i < 7; i++)
  {
    board[i] += 4;
    board[i+7] += 4;
  }

  for (i = 1; i < 7; i++)
  {
    for (j = 0; j < board[i]; j++)
    {
      var pebble = document.createElement('div');
      pebble.classList.add("pebble");
      pebble.left = j * 5;
      pebble.top = j * 5;
      var columnElement = document.getElementById("column-" + i);
      columnElement.appendChild(pebble);
    }

    for (j = 0; j < board[i+7]; j++)
    {
      var pebble = document.createElement('div');
      pebble.classList.add("pebble");
      pebble.left = j * 5;
      pebble.top = j * 5;
      var columnElement = document.getElementById("column-" + (i + 7));
      columnElement.appendChild(pebble);
    }
  }
}

function takeTurn(columnIndex)
{
  if (turn == 0 && columnIndex < 7)
  {
    addPebbles(columnIndex, turn);
    turn = 1;
  }
  else if (turn == 1 && columnIndex > 7)
  {
    addPebbles(columnIndex, turn);
    turn = 0;
  }

  displayTurn();
  displayScore();
  checkEnd();
}

function addPebbles(columnIndex)
{
  for(var i = 0; i < board[columnIndex]; i++)
  {
    addPebble( ((columnIndex+i+1)%14) );
    board[ ((columnIndex+i+1)%14) ] += 1;
  }

  //board[columnIndex] = 0; // to be added once I figure out how to remove pebbles
}

function addPebble(columnIndex)
{
  var pebble = document.createElement('div');
  pebble.classList.add("pebble");
  pebble.left = j * 5;
  pebble.top = j * 5;
  var columnElement = document.getElementById("column-" + columnIndex);
  columnElement.appendChild(pebble);
}

function checkEnd()
{
  var sum = board[0] + board[7];

  if( sum == 48)
  {
    displayMessage("Game is over!! Refresh the page to start the game again.");
  }
}

initPebbles();

for(var i = 1; i < 7; i++)
{
  const col = i;
  document.getElementById('column-' + col).addEventListener('click', function(event) {
      event.preventDefault();
      takeTurn(col);
    });
    document.getElementById('column-' + (col+7)).addEventListener('click', function(event) {
        event.preventDefault();
        takeTurn(col+7);
      });
}
