const statusText = document.querySelector("#status");
const resetButton = document.querySelector("#resetButton");
const clearRecordsButton = document.querySelector("#clearRecordsButton");
const circleWinsText = document.querySelector("#circleWins");
const crossWinsText = document.querySelector("#crossWins");
const drawsText = document.querySelector("#draws");
const historyList = document.querySelector("#historyList");
const cells = Array.from(document.querySelectorAll(".cell"));
const recordsStorageKey = "ticTacToeRecords";

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
    cells.forEach((cell) => {
      cell.disabled = true;
    });
    return;
  }

  if (board.every(Boolean)) {
    statusText.textContent = "引き分けです";
    gameOver = true;
    addRecord("引き分け");
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
