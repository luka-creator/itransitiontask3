const crypto = require('crypto');
const readline = require('readline-sync');

class KeyGenerator {
    static generateKey() {
        return crypto.randomBytes(32).toString('hex'); // 256 bits
    }
}

class MoveEvaluator {
    constructor(moves) {
        this.moves = moves;
        this.table = this.generateTable();
    }

    generateTable() {
        const table = [];
        for (let i = 0; i < this.moves.length; i++) {
            const row = [];
            for (let j = 0; j < this.moves.length; j++) {
                if (i === j) {
                    row.push('Draw');
                } else if ((j - i + this.moves.length) % this.moves.length <= this.moves.length / 2) {
                    row.push('Win');
                } else {
                    row.push('Lose');
                }
            }
            table.push(row);
        }
        return table;
    }

    getMoveResult(move1, move2) {
        const index1 = this.moves.indexOf(move1);
        const index2 = this.moves.indexOf(move2);
        return this.table[index1][index2];
    }

    printHelpTable() {
        const headerRow = ['v PC\\User >', ...this.moves];
        const tableRows = [headerRow, ...this.table.map((row, i) => [this.moves[i], ...row])];
        console.table(tableRows);
    }
}

class Game {
    constructor(moves) {
        this.moves = moves;
        this.moveEvaluator = new MoveEvaluator(moves);
        this.key = KeyGenerator.generateKey();
    }

    generateComputerMove() {
        return this.moves[Math.floor(Math.random() * this.moves.length)];
    }

    calculateHMAC(move) {
        return crypto.createHmac('sha256', this.key).update(move).digest('hex');
    }

    play() {
        const computerMove = this.generateComputerMove();
        console.log(`HMAC: ${this.calculateHMAC(computerMove)}`);
        let userChoice = -1;
        while (userChoice < 0 || userChoice > this.moves.length) {
            this.displayMenu();
            userChoice = this.getUserMove();
            if (userChoice === '0' || userChoice === '?') {
                if (userChoice === '?') this.moveEvaluator.printHelpTable();
                console.log('Goodbye!');
                process.exit(0);
            }
        }
        const userMove = this.moves[userChoice - 1];
        const result = userMove !== '?' ? this.moveEvaluator.getMoveResult(computerMove, userMove) : '';
        console.log(`Your move: ${userMove}\nComputer's move: ${computerMove}\nResult: ${result}\nOriginal key: ${this.key}`);
    }

    displayMenu() {
        console.log('Available moves:\n' + this.moves.map((move, index) => `${index + 1} - ${move}`).join('\n') + '\n0 - Exit\n? - Help');
    }

    getUserMove() {
        return readline.question('Enter your move: ').trim();
    }
}

const moves = process.argv.slice(2);
if (moves.length < 3 || moves.length % 2 === 0 || new Set(moves).size !== moves.length) {
    console.error('Error: Incorrect number of moves or duplicate moves.\nExample usage: node file.js Rock Paper Scissors');
    process.exit(1);
}

const game = new Game(moves);
game.play();