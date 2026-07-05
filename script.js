const statusText = document.querySelector("#status");
const resetButton = document.querySelector("#resetButton");
const clearRecordsButton = document.querySelector("#clearRecordsButton");
const gamePanel = document.querySelector(".game");
const boardElement = document.querySelector("#board");
const celebration = document.querySelector("#celebration");
const circleWinsText = document.querySelector("#circleWins");
const crossWinsText = document.querySelector("#crossWins");
const drawsText = document.querySelector("#draws");
const historyList = document.querySelector("#historyList");
const cells = Array.from(document.querySelectorAll(".cell"));
const recordsStorageKey = "ticTacToeRecords";
const confettiColors = ["#197278", "#c44536", "#f4a261", "#2a9d8f", "#f6bd60"];

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
let records = loadRecords();

function loadRecords() {
  const emptyRecords = {
    circleWins: 0,
    crossWins: 0,
    draws: 0,
    history: [],
  };

  try {
    const savedRecords = JSON.parse(localStorage.getItem(recordsStorageKey));
    return { ...emptyRecords, ...savedRecords };
  } catch {
    return emptyRecords;
  }
}

function saveRecords() {
  localStorage.setItem(recordsStorageKey, JSON.stringify(records));
}

function formatTime(dateText) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateText));
}

function renderRecords() {
  circleWinsText.textContent = records.circleWins;
  crossWinsText.textContent = records.crossWins;
  drawsText.textContent = records.draws;
  historyList.innerHTML = "";

  if (records.history.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "history__empty";
    emptyItem.textContent = "まだ戦績はありません";
    historyList.append(emptyItem);
    return;
  }

  records.history.slice(0, 10).forEach((record) => {
    const item = document.createElement("li");
    const result = document.createElement("span");
    const time = document.createElement("time");

    item.className = "history__item";
    result.className = "history__result";
    time.className = "history__time";
    result.textContent = record.result;
    time.dateTime = record.playedAt;
    time.textContent = formatTime(record.playedAt);

    item.append(result, time);
    historyList.append(item);
  });
}

function addRecord(result) {
  if (result === "〇の勝ち") {
    records.circleWins += 1;
  } else if (result === "×の勝ち") {
    records.crossWins += 1;
  } else {
    records.draws += 1;
  }

  records.history.unshift({
    result,
    playedAt: new Date().toISOString(),
  });
  records.history = records.history.slice(0, 50);
  saveRecords();
  renderRecords();
}

function clearCelebration() {
  celebration.innerHTML = "";
  gamePanel.classList.remove("is-celebrating", "is-draw");
  boardElement.classList.remove("is-celebrating", "is-draw");
  statusText.classList.remove("is-result");
}

function launchConfetti() {
  celebration.innerHTML = "";

  for (let index = 0; index < 34; index += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.setProperty("--x", Math.floor(Math.random() * 96) + 2);
    piece.style.setProperty("--drift", `${Math.floor(Math.random() * 180) - 90}px`);
    piece.style.setProperty("--rotate", `${Math.floor(Math.random() * 180)}deg`);
    piece.style.setProperty("--delay", `${Math.random() * 0.18}s`);
    piece.style.setProperty("--duration", `${0.9 + Math.random() * 0.55}s`);
    piece.style.setProperty("--color", confettiColors[index % confettiColors.length]);
    celebration.append(piece);
  }
}

function celebrateResult(type) {
  clearCelebration();
  statusText.classList.add("is-result");

  if (type === "win") {
    gamePanel.classList.add("is-celebrating");
    boardElement.classList.add("is-celebrating");
    launchConfetti();
  } else {
    gamePanel.classList.add("is-draw");
    boardElement.classList.add("is-draw");
  }

  window.setTimeout(() => {
    celebration.innerHTML = "";
    gamePanel.classList.remove("is-celebrating", "is-draw");
    boardElement.classList.remove("is-celebrating", "is-draw");
  }, 1700);
}

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
    addRecord(`${winner.player}の勝ち`);
    celebrateResult("win");
    cells.forEach((cell) => {
      cell.disabled = true;
    });
    return;
  }

  if (board.every(Boolean)) {
    statusText.textContent = "引き分けです";
    gameOver = true;
    addRecord("引き分け");
    celebrateResult("draw");
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
  clearCelebration();

  cells.forEach((cell) => {
    cell.textContent = "";
    cell.disabled = false;
    cell.classList.remove("is-x", "is-winning");
  });
}

function clearRecords() {
  records = {
    circleWins: 0,
    crossWins: 0,
    draws: 0,
    history: [],
  };
  saveRecords();
  renderRecords();
}

cells.forEach((cell) => {
  cell.addEventListener("click", handleCellClick);
});

resetButton.addEventListener("click", resetGame);
clearRecordsButton.addEventListener("click", clearRecords);
renderRecords();
