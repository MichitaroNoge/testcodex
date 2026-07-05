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
const confettiColors = ["#197278", "#9a6038", "#f4a261", "#2a9d8f", "#f6bd60"];

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
let startingPlayer = "〇";
let currentPlayer = startingPlayer;
let gameOver = false;
let records = loadRecords();

function getPlayerName(player) {
  return player === "〇" ? "67" : "トントントンサフール";
}

function showTurn() {
  const turnOrder = currentPlayer === startingPlayer ? "先攻" : "後攻";
  statusText.textContent = `${getPlayerName(currentPlayer)}の番です（${turnOrder}）`;
  statusText.classList.toggle("is-o-turn", currentPlayer === "〇");
  statusText.classList.toggle("is-x-turn", currentPlayer === "×");
}

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

function launchConfetti(player) {
  celebration.innerHTML = "";

  for (let index = 0; index < 58; index += 1) {
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

  const playerClass = player === "〇" ? "is-o" : "is-x";
  const hero = document.createElement("span");
  hero.className = `cell victory-character victory-character--hero ${playerClass}`;
  celebration.append(hero);

  for (let index = 0; index < 12; index += 1) {
    const character = document.createElement("span");
    const angle = (Math.PI * 2 * index) / 12;
    const distance = 170 + Math.random() * 90;

    character.className = `cell victory-character ${playerClass}`;
    character.style.setProperty("--fly-x", `${Math.cos(angle) * distance}px`);
    character.style.setProperty("--fly-y", `${Math.sin(angle) * distance}px`);
    character.style.setProperty("--fly-rotate", `${Math.floor(Math.random() * 360) - 180}deg`);
    character.style.setProperty("--fly-delay", `${index * 0.035}s`);
    celebration.append(character);
  }
}

function celebrateResult(type, player = "") {
  clearCelebration();
  statusText.classList.add("is-result");

  if (type === "win") {
    gamePanel.classList.add("is-celebrating");
    boardElement.classList.add("is-celebrating");
    launchConfetti(player);
  } else {
    gamePanel.classList.add("is-draw");
    boardElement.classList.add("is-draw");
  }

  window.setTimeout(() => {
    celebration.innerHTML = "";
    gamePanel.classList.remove("is-celebrating", "is-draw");
    boardElement.classList.remove("is-celebrating", "is-draw");
  }, 2400);
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
    statusText.textContent = `${getPlayerName(winner.player)}の勝ちです！`;
    statusText.classList.toggle("is-o-turn", winner.player === "〇");
    statusText.classList.toggle("is-x-turn", winner.player === "×");
    winner.line.forEach((index) => cells[index].classList.add("is-winning"));
    gameOver = true;
    addRecord(`${winner.player}の勝ち`);
    celebrateResult("win", winner.player);
    cells.forEach((cell) => {
      cell.disabled = true;
    });
    return;
  }

  if (board.every(Boolean)) {
    statusText.textContent = "引き分けです";
    statusText.classList.remove("is-o-turn", "is-x-turn");
    gameOver = true;
    addRecord("引き分け");
    celebrateResult("draw");
    return;
  }

  showTurn();
}

function handleCellClick(event) {
  const cell = event.currentTarget;
  const index = cells.indexOf(cell);

  if (gameOver || board[index]) {
    return;
  }

  board[index] = currentPlayer;
  cell.textContent = "";
  cell.disabled = true;
  cell.classList.toggle("is-o", currentPlayer === "〇");
  cell.classList.toggle("is-x", currentPlayer === "×");
  cell.setAttribute("aria-label", `${cell.getAttribute("aria-label")} ${currentPlayer}`);
  currentPlayer = currentPlayer === "〇" ? "×" : "〇";

  updateStatus();
}

function resetGame() {
  board = Array(9).fill("");
  startingPlayer = startingPlayer === "〇" ? "×" : "〇";
  currentPlayer = startingPlayer;
  gameOver = false;
  clearCelebration();
  showTurn();

  cells.forEach((cell) => {
    cell.textContent = "";
    cell.disabled = false;
    cell.classList.remove("is-o", "is-x", "is-winning");
    cell.setAttribute("aria-label", cell.getAttribute("aria-label").replace(/ [〇×]$/, ""));
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
