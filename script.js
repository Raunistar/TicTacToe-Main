const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const resetBtn = document.getElementById("reset");
const themeBtn = document.getElementById("themeToggle");
const modeBtn = document.getElementById("modeToggle");
const clearBtn = document.getElementById("clearHistory");
const playAgainBtn = document.getElementById("playAgainBtn");
const historyDiv = document.getElementById("history");

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameActive = true;
let isSinglePlayer = false;

let history = JSON.parse(localStorage.getItem("tttHistory")) || {
  X: 0,
  O: 0,
  draws: 0,
};
displayHistory();

const winPatterns = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

cells.forEach((cell) => cell.addEventListener("click", handleClick));
resetBtn.addEventListener("click", resetGame);
themeBtn.addEventListener("click", themeToggle);
clearBtn.addEventListener("click", clearHistory);
playAgainBtn.addEventListener("click", resetGame);

function handleClick(e) {
  const index = e.target.dataset.index;
  if (board[index] || !gameActive) return;

  makeMove(index, currentPlayer);

  if (isSinglePlayer && gameActive && currentPlayer === "O") {
    const aiMove = getBestMove();
    setTimeout(() => makeMove(aiMove, "O"), 300);
  }
}

function makeMove(index, player) {
  board[index] = player;
  cells[index].textContent = player;
  cells[index].classList.add(player.toLowerCase());

  if (checkWin(player)) {
    statusText.textContent = `Player ${player} Wins!`;
    updateHistory(player);
    gameActive = false;
    playAgainBtn.style.display = "inline-block";
    return;
  }

  if (board.every((cell) => cell)) {
    statusText.textContent = "It's a Draw!";
    updateHistory("draw");
    gameActive = false;
    playAgainBtn.style.display = "inline-block";
    return;
  }

  currentPlayer = player === "X" ? "O" : "X";
  statusText.textContent = `Player ${currentPlayer}'s Turn`;
}

function checkWin(player) {
  return winPatterns.some((pattern) => {
    if (pattern.every((index) => board[index] === player)) {
      pattern.forEach((i) => cells[i].classList.add("win"));
      showConfetti();
      return true;
    }
    return false;
  });
}

function getBestMove() {
  let bestScore = -Infinity;
  let move;
  for (let i = 0; i < board.length; i++) {
    if (board[i] === "") {
      board[i] = "O";
      let score = minimax(board, 0, false);
      board[i] = "";
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(newBoard, depth, isMaximizing) {
  if (checkWin("O")) return 1;
  if (checkWin("X")) return -1;
  if (newBoard.every((cell) => cell)) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < newBoard.length; i++) {
      if (newBoard[i] === "") {
        newBoard[i] = "O";
        let score = minimax(newBoard, depth + 1, false);
        newBoard[i] = "";
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < newBoard.length; i++) {
      if (newBoard[i] === "") {
        newBoard[i] = "X";
        let score = minimax(newBoard, depth + 1, true);
        newBoard[i] = "";
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function resetGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  cells.forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("win", "x", "o");
  });
  currentPlayer = "X";
  statusText.textContent = `Player ${currentPlayer}'s Turn`;
  gameActive = true;
  playAgainBtn.style.display = "none";
}

function themeToggle() {
  document.body.classList.toggle("light-theme");
  localStorage.setItem("theme", setThemeIcon());
}
function setThemeIcon() {
  const currentTheme = document.body.classList.contains("light-theme")
    ? "light"
    : "dark";
  themeBtn.textContent = currentTheme === "light" ? "SUN" : "MOON";
  return currentTheme;
}

function updateHistory(winner) {
  if (winner === "draw") {
    history.draws++;
  } else {
    history[winner]++;
  }
  localStorage.setItem("tttHistory", JSON.stringify(history));
  displayHistory();
}

function displayHistory() {
  historyDiv.innerHTML = `
    <p>Player <b style="color:red">X</b> Wins: ${history.X}</p>
    <p>Player <b style="color:green">O</b> Wins: ${history.O}</p>
    <p><b style="color:orange">Draws</b>: ${history.draws}</p>
  `;
}

function clearHistory() {
  history = { X: 0, O: 0, draws: 0 };
  localStorage.setItem("tttHistory", JSON.stringify(history));
  displayHistory();
}

function showConfetti() {
  const duration = 2 * 1000;
  const end = Date.now() + duration;
  (function frame() {
    confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 } });
    confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

window.addEventListener("load", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("light-theme");
  }
  setThemeIcon();
});
