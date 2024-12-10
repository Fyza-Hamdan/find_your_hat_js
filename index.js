const prompt = require('prompt-sync')({sigint: true});

// Game Elements
const HAT = '^';
const HOLE = 'O';
const GRASS = '░';
const PLAYER = '*';
const PATH = '*';

// Game Messages
const WIN = "Congratulations! You won the game!";
const LOSE = "You lose!";
const OUT_BOUND = "You are out of the field!";
const INTO_HOLE = "You fell into a hole!";
const WELCOME = "Welcome to Find Your Hat Game";
const DIRECTION = "Which direction: up(u), down(d), left(l) or right(r)?";
const QUIT = "Press q or Q to quit the game.";
const END_GAME = "Game ended. Thank you for playing!";
const NOT_RECOGNISED = "Input not recognised.";

// Display Functions
function welcomeMsg(msg) {
    console.log(
        "\n**********************************************\n" +
        msg +
        "\n**********************************************\n"
    );
}

function printField(field) {
    field.forEach(row => {
        console.log(row.join(''));
    });
}

// Field Generator Function
function generateField(rows, cols, percentHoles) {
    // Calculate number of holes based on percentage
    const totalCells = rows * cols;
    const numberOfHoles = Math.floor((percentHoles / 100) * totalCells);
    
    // Initialize field with grass
    const field = Array(rows).fill().map(() => Array(cols).fill(GRASS));
    
    // Place hat in random position (not at start)
    let hatRow, hatCol;
    do {
        hatRow = Math.floor(Math.random() * rows);
        hatCol = Math.floor(Math.random() * cols);
    } while (hatRow === 0 && hatCol === 0);
    
    field[hatRow][hatCol] = HAT;

    // Place holes randomly
    let holesPlaced = 0;
    while (holesPlaced < numberOfHoles) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);
        
        // Don't place holes at start, on hat, or where a hole already exists
        if ((row !== 0 || col !== 0) && 
            field[row][col] !== HAT && 
            field[row][col] !== HOLE) {
            field[row][col] = HOLE;
            holesPlaced++;
        }
    }

    // Place player at start
    field[0][0] = PLAYER;
    
    return field;
}

// Main Game Class
class Field {
    constructor(rows, cols, percentHoles = 30) {
        this.rows = rows;
        this.cols = cols;
        this.percentHoles = percentHoles;
        this.field = [];
        this.playerPosition = [0, 0];
        this.gamePlay = false;
    }

    generateField() {
        this.field = generateField(this.rows, this.cols, this.percentHoles);
    }

    printField() {
        printField(this.field);
    }

    isInBounds(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }

    updatePlayer(direction) {
        let [currentRow, currentCol] = this.playerPosition;
        let newRow = currentRow;
        let newCol = currentCol;

        switch(direction) {
            case 'u': newRow--; break;
            case 'd': newRow++; break;
            case 'l': newCol--; break;
            case 'r': newCol++; break;
        }

        // Check if move is valid
        if (!this.isInBounds(newRow, newCol)) {
            console.log(OUT_BOUND);
            this.endGame();
            return;
        }

        // Check what's in the new position
        const newPosition = this.field[newRow][newCol];
        if (newPosition === HOLE) {
            console.log(INTO_HOLE);
            this.endGame();
            return;
        }
        if (newPosition === HAT) {
            console.log(WIN);
            this.endGame();
            return;
        }

        // Update player position
        this.field[currentRow][currentCol] = PATH;
        this.field[newRow][newCol] = PLAYER;
        this.playerPosition = [newRow, newCol];
        this.printField();
    }

    startGame() {
        this.gamePlay = true;
        this.generateField();
        this.printField();
        this.updateGame();
    }

    updateGame() {
        while (this.gamePlay) {
            console.log(DIRECTION.concat(" ", QUIT));
            const userInput = prompt();

            switch (userInput.toLowerCase()) {
                case "u":
                case "d":
                case "l":
                case "r":
                    this.updatePlayer(userInput.toLowerCase());
                    break;
                case "q":
                    this.endGame();
                    break;
                default:
                    console.log(NOT_RECOGNISED);
                    break;
            }
        }
    }

    endGame() {
        console.log(END_GAME);
        this.gamePlay = false;
        process.exit();
    }
}

// Start the game
welcomeMsg(WELCOME);

console.log("Enter field size (e.g., 10):");
const size = parseInt(prompt()) || 10;

console.log("Enter percentage of holes (0-50):");
const percentHoles = Math.min(Math.max(parseInt(prompt()) || 30, 0), 50);

const field = new Field(size, size, percentHoles);
field.startGame();