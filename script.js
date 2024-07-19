const firstBoard = document.getElementById("firstBoard");
const firstCtx = firstBoard.getContext("2d");

const secondBoard = document.getElementById("secondBoard");
const secondCtx = secondBoard.getContext("2d");

// Define ship objects with initial positions below the boards
let shipsFirstBoard = [
  {
    x: 10,
    y: 600,
    width: 100,
    height: 50,
    draggable: true,
    initialX: 10,
    initialY: 600,
    placed: false,
    orientation: "vertical",
  },
  {
    x: 120,
    y: 600,
    width: 200,
    height: 50,
    draggable: true,
    initialX: 120,
    initialY: 600,
    placed: false,
    orientation: "horizontal",
  },
  {
    x: 330,
    y: 600,
    width: 200,
    height: 50,
    draggable: true,
    initialX: 330,
    initialY: 600,
    placed: false,
    orientation: "horizontal",
  },
  {
    x: 540,
    y: 600,
    width: 50,
    height: 100,
    draggable: true,
    initialX: 540,
    initialY: 600,
    placed: false,
    orientation: "vertical",
  },
];

let shipsSecondBoard = [
  {
    x: 10,
    y: 600,
    width: 250,
    height: 50,
    draggable: false,
    initialX: 10,
    initialY: 600,
  },
  {
    x: 270,
    y: 600,
    width: 50,
    height: 150,
    draggable: false,
    initialX: 270,
    initialY: 600,
  },
  {
    x: 330,
    y: 600,
    width: 50,
    height: 200,
    draggable: false,
    initialX: 330,
    initialY: 600,
  },
  {
    x: 400,
    y: 600,
    width: 150,
    height: 50,
    draggable: false,
    initialX: 400,
    initialY: 600,
  },
];

// Ensure the canvas is large enough to display the board and the ships below it
firstBoard.width = 600;
firstBoard.height = 700; // Increased height to accommodate initial ship positions
secondBoard.width = 600;
secondBoard.height = 700; // Increased height to accommodate initial ship positions

// Function to draw the boards
function drawBoard(ctx) {
  ctx.fillStyle = "#FFFFFF"; // Set background color to white
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Draw the smaller squares
  ctx.beginPath();
  for (let i = 50; i <= 550; i += 50) {
    // Vertical lines
    ctx.moveTo(i, 50);
    ctx.lineTo(i, 550);

    // Horizontal lines
    ctx.moveTo(50, i);
    ctx.lineTo(550, i);
  }
  ctx.stroke();

  ctx.fillStyle = "black"; // Label color
  ctx.font = "14px Arial"; // Label font
  ctx.textAlign = "right"; // Align the numbers to the right

  for (let row = 1; row <= 10; row++) {
    const y = row * 50 + 50; // Adjust the position for better alignment
    ctx.fillText(row.toString(), 40, y - 20);
  }

  const myArray = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  for (let col = 0; col < 10; col++) {
    const x = (col + 1) * 50 + 50; // Adjust the position for better alignment
    ctx.fillText(myArray[col], x - 20, 40);
  }
}

// Function to draw ships on the boards
function drawShips(ctx, ships, hidden = false, gameOver = false) {
  ships.forEach((ship) => {
    if (!hidden) {
      if (gameOver) {
        ctx.fillStyle = "gray"; // Use gray color if game is over
      } else {
        ctx.fillStyle = ship.draggable ? "blue" : "gray"; // Use gray for fixed ships
      }
      ctx.fillRect(ship.x, ship.y, ship.width, ship.height);
    }
  });
}

// Function to draw hits and misses
function drawHitsAndMisses(ctx, hits, misses) {
  hits.forEach((hit) => {
    ctx.fillStyle = "red";
    ctx.fillRect(hit.x, hit.y, 50, 50);
  });

  misses.forEach((miss) => {
    ctx.fillStyle = "black";
    ctx.fillRect(miss.x, miss.y, 50, 50);
  });
}

// Event listeners for dragging ships
// Event listeners for dragging ships
function handleMouseDown(event, ships) {
  const mouseX = event.clientX - event.target.getBoundingClientRect().left;
  const mouseY = event.clientY - event.target.getBoundingClientRect().top;

  ships.forEach((ship) => {
    if (
      mouseX >= ship.x &&
      mouseX <= ship.x + ship.width &&
      mouseY >= ship.y &&
      mouseY <= ship.y + ship.height &&
      ship.draggable &&
      !ship.placed // Check if ship is draggable and not already placed
    ) {
      ship.dragging = true;
      ship.offsetX = mouseX - ship.x;
      ship.offsetY = mouseY - ship.y;
    }
  });
}

function handleMouseMove(event, ships, ctx) {
  const mouseX = event.clientX - event.target.getBoundingClientRect().left;
  const mouseY = event.clientY - event.target.getBoundingClientRect().top;

  ships.forEach((ship) => {
    if (ship.dragging) {
      ship.x = mouseX - ship.offsetX;
      ship.y = mouseY - ship.offsetY;

      // Check for overlap with other ships
      const overlaps = ships.some((otherShip) => {
        if (otherShip !== ship && otherShip.placed) {
          return (
            ship.x < otherShip.x + otherShip.width &&
            ship.x + ship.width > otherShip.x &&
            ship.y < otherShip.y + otherShip.height &&
            ship.y + ship.height > otherShip.y
          );
        }
        return false;
      });

      // Change ship color based on overlap status
      ship.color = overlaps ? "red" : "blue";

      redraw(ctx, ships);

      // Ensure the computer ships remain hidden
      if (ctx === secondCtx) {
        redraw(secondCtx, shipsSecondBoard, true);
      }
    }
  });
}

function handleMouseUp(event, ships, ctx) {
  ships.forEach((ship) => {
    if (ship.dragging) {
      // Snap ship to nearest grid square
      ship.x = snapToGrid(ship.x);
      ship.y = snapToGrid(ship.y);

      // Check if ship is within board boundaries and does not overlap
      const validPlacement =
        ship.x >= 50 &&
        ship.x + ship.width <= 550 &&
        ship.y >= 50 &&
        ship.y + ship.height <= 550 &&
        !ships.some((otherShip) => {
          if (otherShip !== ship && otherShip.placed) {
            return (
              ship.x < otherShip.x + otherShip.width &&
              ship.x + ship.width > otherShip.x &&
              ship.y < otherShip.y + otherShip.height &&
              ship.y + ship.height > otherShip.y
            );
          }
          return false;
        });

      if (validPlacement) {
        ship.placed = true; // Mark ship as placed
        ship.draggable = false; // Disable dragging once placed on the board
      } else {
        // Reset to initial position if out of bounds or overlaps
        ship.x = ship.initialX;
        ship.y = ship.initialY;
      }

      ship.dragging = false;
    }
  });
  redraw(ctx, ships);

  // Ensure the computer ships remain hidden
  if (ctx === secondCtx) {
    redraw(secondCtx, shipsSecondBoard, true);
  }
}

function redraw(ctx, ships, hidden = false, gameOver = false) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  drawBoard(ctx);
  drawShips(ctx, ships, hidden, gameOver);
  //drawHitsAndMisses(ctx /* hits and misses parameters */);

  // If game is over and it's the player's board, reveal computer ships in gray
  if (gameOver && ctx === firstCtx) {
    drawShips(ctx, shipsSecondBoard, false, true); // Draw computer ships in gray
  }

  drawHitsAndMisses(
    ctx,
    ctx === firstCtx ? computerHits : playerHits,
    ctx === firstCtx ? computerMisses : playerMisses
  );
}

// Function to snap to the nearest grid position
function snapToGrid(coord) {
  return Math.max(50, Math.min(Math.round(coord / 50) * 50, 500));
}

// Game state
let gameStarted = false;
let playerTurn = true;
let playerHits = [];
let playerMisses = [];
let computerHits = [];
let computerMisses = [];

let aiMemory = [];
let currentDirection = null;
let lastHitX = null;
let lastHitY = null;
let consecutiveHits = 0;

function computerMove() {
  let x, y;

  if (aiMemory.length > 0) {
    ({ x, y } = aiMemory.shift());
  } else {
    ({ x, y } = getSmartTarget());
    currentDirection = null;
  }

  console.log(`Computer move to: (${x}, ${y})`);

  if (isValidCell(x, y) && !isCellInMemory(x, y)) {
    let hit = shipsFirstBoard.some(
      (ship) =>
        x >= ship.x &&
        x < ship.x + ship.width &&
        y >= ship.y &&
        y < ship.y + ship.height
    );

    if (hit) {
      console.log(`Hit at: (${x}, ${y})`);
      computerHits.push({ x, y });
      consecutiveHits++;

      if (!currentDirection && consecutiveHits === 2) {
        currentDirection = getDirection();
      }

      if (currentDirection) {
        let nextX = x + currentDirection.dx * 50;
        let nextY = y + currentDirection.dy * 50;
        if (isValidCell(nextX, nextY) && !isCellInMemory(nextX, nextY)) {
          aiMemory.unshift({ x: nextX, y: nextY });
        } else {
          currentDirection = reverseDirection(currentDirection);
          let reverseX = x + currentDirection.dx * 50;
          let reverseY = y + currentDirection.dy * 50;
          if (
            isValidCell(reverseX, reverseY) &&
            !isCellInMemory(reverseX, reverseY)
          ) {
            aiMemory.unshift({ x: reverseX, y: reverseY });
          }
        }
      } else {
        addAdjacentCellsToMemory(x, y);
      }

      let sunkShip = checkIfShipSunk(x, y);

      lastHitX = x;
      lastHitY = y;

      if (sunkShip) {
        console.log(`Ship sunk at: (${x}, ${y})`);
        aiMemory = [];
        currentDirection = null;
        lastHitX = null;
        lastHitY = null;
        consecutiveHits = 0;
      }
    } else {
      console.log(`Miss at: (${x}, ${y})`);
      computerMisses.push({ x, y });
      if (currentDirection) {
        currentDirection = reverseDirection(currentDirection);
        if (consecutiveHits === 2) {
          let nextX = lastHitX + currentDirection.dx * 50;
          let nextY = lastHitY + currentDirection.dy * 50;
          if (isValidCell(nextX, nextY) && !isCellInMemory(nextX, nextY)) {
            aiMemory.unshift({ x: nextX, y: nextY });
          }
        }
      }
    }
  } else {
    console.error("Invalid move or cell already targeted:", x, y);
  }

  redraw(firstCtx, shipsFirstBoard);
  redraw(secondCtx, shipsSecondBoard, true);

  if (isGameOver(shipsFirstBoard, computerHits)) {
    setTimeout(() => {
      alert("Computer wins!");
      gameStarted = false;
      redraw(secondCtx, shipsSecondBoard, false, true);
    }, 500);
  } else {
    playerTurn = true;
  }
}

function addAdjacentCellsToMemory(x, y) {
  const potentialTargets = [
    { x: x + 50, y },
    { x: x - 50, y },
    { x, y: y + 50 },
    { x, y: y - 50 },
  ];

  potentialTargets.forEach((target) => {
    if (
      isValidCell(target.x, target.y) &&
      !isCellInMemory(target.x, target.y)
    ) {
      aiMemory.push(target);
    }
  });
}

function getDirection() {
  const lastTwoHits = computerHits.slice(-2);
  if (lastTwoHits.length === 2) {
    const [firstHit, secondHit] = lastTwoHits;
    if (firstHit.x === secondHit.x) {
      return { dx: 0, dy: secondHit.y > firstHit.y ? 1 : -1 };
    } else if (firstHit.y === secondHit.y) {
      return { dx: secondHit.x > firstHit.x ? 1 : -1, dy: 0 };
    }
  }
  return null;
}

function reverseDirection(direction) {
  return { dx: -direction.dx, dy: -direction.dy };
}

function checkIfShipSunk(x, y) {
  let sunkShip = false;
  shipsFirstBoard.forEach((ship) => {
    if (
      x >= ship.x &&
      x < ship.x + ship.width &&
      y >= ship.y &&
      y < ship.y + ship.height
    ) {
      sunkShip = true;
      for (let i = ship.x; i < ship.x + ship.width; i += 50) {
        for (let j = ship.y; j < ship.y + ship.height; j += 50) {
          if (!computerHits.some((hit) => hit.x === i && hit.y === j)) {
            sunkShip = false;
            break;
          }
        }
        if (!sunkShip) break;
      }
    }
  });
  return sunkShip;
}

function isValidCell(x, y) {
  return x >= 50 && x <= 500 && y >= 50 && y <= 500;
}

function isCellInMemory(x, y) {
  return (
    aiMemory.some((pos) => pos.x === x && pos.y === y) ||
    computerHits.some((pos) => pos.x === x && pos.y === y) ||
    computerMisses.some((pos) => pos.x === x && pos.y === y)
  );
}

function getSmartTarget() {
  let x, y;
  const candidates = [];

  // Checkerboard pattern: Only add cells that follow the pattern
  for (let i = 50; i <= 500; i += 50) {
    for (let j = 50; j <= 500; j += 50) {
      if (!isCellInMemory(i, j) && (i + j) % 100 === 0) {
        candidates.push({ x: i, y: j });
      }
    }
  }

  if (candidates.length > 0) {
    const randomIndex = Math.floor(Math.random() * candidates.length);
    ({ x, y } = candidates[randomIndex]);
  } else {
    ({ x, y } = getRandomTarget());
  }

  return { x, y };
}

function getRandomTarget() {
  let x = Math.floor(Math.random() * 10) * 50 + 50;
  let y = Math.floor(Math.random() * 10) * 50 + 50;
  return { x, y };
}



secondBoard.addEventListener("click", (event) => {
  if (!gameStarted || !playerTurn) return;

  const rect = secondBoard.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  // Check if the click is within the playable grid boundaries
  if (mouseX < 50 || mouseX >= 550 || mouseY < 50 || mouseY >= 550) {
    return; // Ignore clicks outside the playable grid
  }

  // Calculate exact grid position based on click
  const x = Math.floor((mouseX - 50) / 50) * 50 + 50;
  const y = Math.floor((mouseY - 50) / 50) * 50 + 50;

  // Check if the position is already hit or missed
  if (
    playerHits.some((hit) => hit.x === x && hit.y === y) ||
    playerMisses.some((miss) => miss.x === x && miss.y === y)
  ) {
    return; // Ignore clicks on already hit or missed positions
  }

  // Check if hit or miss
  let hit = shipsSecondBoard.some(
    (ship) =>
      x >= ship.x &&
      x < ship.x + ship.width &&
      y >= ship.y &&
      y < ship.y + ship.height
  );

  if (hit) {
    playerHits.push({ x, y });
  } else {
    playerMisses.push({ x, y });
  }

  // Redraw boards to show player's move
  redraw(firstCtx, shipsFirstBoard);
  redraw(secondCtx, shipsSecondBoard, true); // Keep computer ships hidden

  // Check for game over
  if (isGameOver(shipsSecondBoard, playerHits)) {
    setTimeout(() => {
      alert("Player wins!");
      gameStarted = false;
    }, 500); // Delay alert to show board update
  } else {
    // Switch turn to computer
    playerTurn = false;

    // Delay computer move to simulate thinking
    setTimeout(computerMove, 1000);
  }
});

firstBoard.addEventListener("contextmenu", (event) => {
  event.preventDefault(); // Prevent default right-click behavior (context menu)

  const rect = firstBoard.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  // Iterate through all player ships on the first board
  shipsFirstBoard.forEach((ship) => {
    // Check if the right-click happened on a draggable and not yet placed ship
    if (
      mouseX >= ship.x &&
      mouseX <= ship.x + ship.width &&
      mouseY >= ship.y &&
      mouseY <= ship.y + ship.height &&
      ship.draggable &&
      !ship.placed
    ) {
      // Toggle ship orientation
      ship.orientation =
        ship.orientation === "horizontal" ? "vertical" : "horizontal";

      // Swap width and height based on initial dimensions
      const tempWidth = ship.width;
      ship.width = ship.height;
      ship.height = tempWidth;

      // Check if ship remains within board boundaries after orientation change
      // and does not overlap with other ships
      if (
        ship.x + ship.width > 550 ||
        ship.y + ship.height > 550 ||
        shipsFirstBoard.some((otherShip) => {
          if (otherShip !== ship && otherShip.placed) {
            return (
              ship.x < otherShip.x + otherShip.width &&
              ship.x + ship.width > otherShip.x &&
              ship.y < otherShip.y + otherShip.height &&
              ship.y + ship.height > otherShip.y
            );
          }
          return false;
        })
      ) {
        // Reset ship position to initial if out of bounds or overlaps
        ship.x = ship.initialX;
        ship.y = ship.initialY;

        // Reset width and height based on initial orientation
        if (ship.orientation === "horizontal") {
          ship.width = 200; // Width for horizontal orientation
          ship.height = 50;
        } else {
          ship.width = 50; // Width for vertical orientation
          ship.height = 200;
        }
      }

      // Redraw the board with updated ship positions and orientations
      redraw(firstCtx, shipsFirstBoard);
    }
  });
});

// Add event listeners to the canvas elements for dragging ships
firstBoard.addEventListener("mousedown", (event) =>
  handleMouseDown(event, shipsFirstBoard)
);
//secondBoard.addEventListener("mousedown", (event) => handleMouseDown(event, shipsSecondBoard));

document.addEventListener("mousemove", (event) => {
  handleMouseMove(event, shipsFirstBoard, firstCtx);
  handleMouseMove(event, shipsSecondBoard, secondCtx);
});

document.addEventListener("mouseup", (event) => {
  handleMouseUp(event, shipsFirstBoard, firstCtx);
  handleMouseUp(event, shipsSecondBoard, secondCtx);
});

// Start game button
document.getElementById("startGame").addEventListener("click", () => {
  gameStarted = true;
  playerTurn = true;
  playerHits = [];
  playerMisses = [];
  computerHits = [];
  computerMisses = [];
  placeComputerShips();
  redraw(firstCtx, shipsFirstBoard);
  redraw(secondCtx, shipsSecondBoard, true);
});

// Function to reset game state
function resetGame() {
  gameStarted = false;
  playerTurn = true;
  playerHits = [];
  playerMisses = [];
  computerHits = [];
  computerMisses = [];
  aiMemory = []; // Clear AI memory

  // Reset ship positions on player's board
  shipsFirstBoard.forEach((ship) => {
    ship.x = ship.initialX;
    ship.y = ship.initialY;
    ship.placed = false;
    ship.draggable = true;
  });

  redraw(firstCtx, shipsFirstBoard); // Redraw player's board with reset ships
  redraw(secondCtx, shipsSecondBoard, true); // Keep computer ships hidden
}

// Event listener for Start Game button
document.getElementById("resetGame").addEventListener("click", () => {
  resetGame(); // Reset game state when Start Game button is clicked
  redraw(secondCtx, shipsSecondBoard, true); // Ensure computer ships are hidden after reset
  //placeComputerShips(); // Place computer ships in random positions
});

// Function to check if all ships are fully hit
function isGameOver(ships, hits) {
  let totalShipCells = 0;
  let hitShipCells = 0;

  ships.forEach((ship) => {
    const cellsInShip = (ship.width / 50) * (ship.height / 50);
    totalShipCells += cellsInShip;

    // Check if all cells of this ship are hit
    for (let x = ship.x; x < ship.x + ship.width; x += 50) {
      for (let y = ship.y; y < ship.y + ship.height; y += 50) {
        if (hits.some((hit) => hit.x === x && hit.y === y)) {
          hitShipCells++;
        }
      }
    }
  });

  return totalShipCells === hitShipCells;
}

// Function to place ships on the computer's board
function placeComputerShips() {
  shipsSecondBoard.forEach((ship) => {
    let placed = false;
    while (!placed) {
      // Generate random coordinates within valid boundaries
      ship.x = Math.floor(Math.random() * (11 - ship.width / 50)) * 50 + 50;
      ship.y = Math.floor(Math.random() * (11 - ship.height / 50)) * 50 + 50;

      // Check if the generated position overlaps with any other ship
      if (
        !shipsSecondBoard.some(
          (otherShip) =>
            otherShip !== ship &&
            ship.x < otherShip.x + otherShip.width &&
            ship.x + ship.width > otherShip.x &&
            ship.y < otherShip.y + otherShip.height &&
            ship.y + ship.height > otherShip.y
        )
      ) {
        placed = true; // Position is valid, so mark ship as placed
      }
    }
  });
}

// Initial draw
redraw(firstCtx, shipsFirstBoard);
redraw(secondCtx, shipsSecondBoard, true); // Pass true to keep computer ships hidden

