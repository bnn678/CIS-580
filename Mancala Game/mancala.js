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
  if( board[columnIndex] > 0 )
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
}

function addPebbles(columnIndex)
{
  for(var i = 0; i < board[columnIndex]; i++)
  {
    addPebble( ((columnIndex+i+1)%14) );
    board[ ((columnIndex+i+1)%14) ] += 1;
    removePebble(columnIndex);
  }

  board[columnIndex] = 0;
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

function removePebble(columnIndex)
{
  document.getElementById("column-"+columnIndex).firstChild.remove();
}

function checkEnd()
{
  var gameOver = false;

  var sum = board[0] + board[7];

  var playerZeroHasMoves = false;
  var playerOneHasMoves = false;

  for (var i = 1; i < 7; i++)
  {
    if (board[i] != 0)
    {
      playerZeroHasMoves = true;
    }
    if (board[i+7] != 0)
    {
      playerOneHasMoves = true;
    }
  }

  if( sum == 48 || playerZeroHasMoves == false || playerOneHasMoves == false )
  {
    gameOver = true;
  }

  if (!playerOneHasMoves)
  {
    moveAllPebbles(0);
  }
  if (!playerZeroHasMoves)
  {
    moveAllPebbles(1);
  }

  if (gameOver)
  {
    displayMessage("Game is over!! Refresh the page to start the game again.");
  }
}

function moveAllPebbles(player)
{
  if (player == 0)
  {
    for (var i = 1; i < 7; i++)
    {
      for (var j = 0; j < board[i]; j++)
      {
        removePebble(i);
        addPebble(7);
        board[7] += 1;
      }
      board[i] = 0;
    }
  }
  if (player == 1)
  {
    for (var i = 8; i < 14; i++)
    {
      for (var j = 0; j < board[i]; j++)
      {
        removePebble(i);
        addPebble(0);
        board[0] += 1;
      }
      board[i] = 0;
    }
  }

  displayScore();
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
