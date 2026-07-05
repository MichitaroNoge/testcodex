const statusText = document.querySelector("#status");
const resetButton = document.querySelector("#resetButton");
const cells = Array.from(document.querySelectorAll(".cell"));

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

let board = Array(9).fill("");
let currentPlayer = "〇";
let gameOver = false;

function getWinner() {
  for (const line of winningLines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { player: board[a], line };
    }
  }

  return null;
}

function updateStatus() {
  const winner = getWinner();

  if (winner) {
    statusText.textContent = `${winner.player}の勝ちです`;
    winner.line.forEach((index) => cells[index].classList.add("is-winning"));
    gameOver = true;
    cells.forEach((cell) => {
      cell.disabled = true;
    });
    return;
  }

  if (board.every(Boolean)) {
    statusText.textContent = "引き分けです";
    gameOver = true;
    return;
  }

  statusText.textContent = `${currentPlayer}の番です`;
}

function handleCellClick(event) {
  const cell = event.currentTarget;
  const index = cells.indexOf(cell);

  if (gameOver || board[index]) {
    return;
  }

  board[index] = currentPlayer;
  cell.textContent = currentPlayer;
  cell.disabled = true;
  cell.classList.toggle("is-x", currentPlayer === "×");
  currentPlayer = currentPlayer === "〇" ? "×" : "〇";

  updateStatus();
}

function resetGame() {
  board = Array(9).fill("");
  currentPlayer = "〇";
  gameOver = false;
  statusText.textContent = "〇の番です";

  cells.forEach((cell) => {
    cell.textContent = "";
    cell.disabled = false;
    cell.classList.remove("is-x", "is-winning");
  });
}

cells.forEach((cell) => {
  cell.addEventListener("click", handleCellClick);
});

resetButton.addEventListener("click", resetGame);
