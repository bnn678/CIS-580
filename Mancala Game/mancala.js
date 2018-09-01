/* constants */
const colors = ["green", "red"];

/* globals */
var turn = 0;

var board = [
  [4, 4, 4, 4, 4, 4],
  [4, 4, 4, 4, 4, 4]
]

var scores = [0, 0]

var order = [
  "column-0",
  "column-1",
  "column-2",
  "column-3",
  "column-4",
  "column-5",
  "column-6",
  "column-7",
  "row-1",
  "row-2",
  "row-3",
  "row-4",
  "row-5",
  "row-6",
]

function displayTurn()
{
  //displayMessage("It is <div class='pebble " + colors[turn] + "'></div>'s turn")
  displayMessage("It is Player " + turn + "'s turn.");
}

function displayMessage(message)
{
  document.getElementById('ui').innerHTML = message;
}

function showPebbles()
{
  for (i = 1; i < 7; i++)
  {
    for (j = 0; j < board[0][i-1]; j++)
    {
      var pebble = document.createElement('div');
      pebble.classList.add("pebble");
      pebble.left = j * 5;
      pebble.top = j * 5;
      var columnElement = document.getElementById("column-" + i);
      columnElement.appendChild(pebble);
    }

    for (j = 0; j < board[1][i-1]; j++)
    {
      var pebble = document.createElement('div');
      pebble.classList.add("pebble");
      pebble.left = j * 5;
      pebble.top = j * 5;
      var rowElement = document.getElementById("row-" + i);
      rowElement.appendChild(pebble);
    }
  }
}

function movePebbles(columnIndex, turn)
{
  var pebble = document.createElement('div');
  pebble.classList.add("pebble");
  pebble.left = j * 5;
  pebble.top = j * 5;

  for (i = 4; i > 0; i--)
  {
    var rowElement = document.getElementById("row-" + columnIndex);
    var pebble = rowElement.getElementById("pebble");
  }

  turn = (turn + 1) % 2;
  displayTurn();
}

function checkForScore(column, row)
{
  var sum = 0;
  for (i = 0; i < 5; i++)
  {
    sum += board[0][i];
    sum += board[1][i];
  }

  if( sum == 0)
  {
    displayMessage("Game is over!!");
  }
}

// Main Loop
showPebbles();

for(var i = 0; i < 8; i++)
{
  const col = i;
  document.getElementById('column-' + col)
    .addEventListener('click', function(event) {
      event.preventDefault();
      movePebbles(col, turn);
    });
}
