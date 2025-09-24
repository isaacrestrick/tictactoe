type GameState = {
    cells: Array<Array<string | undefined>>
    nextTurn: string
    winner: string | undefined
}

function detectWinner(game: GameState) {
    const cells = game.cells
    if (cells[0][0] !== undefined && cells[0][0] == cells[0][1] && cells[0][1] == cells[0][2]) {
        // top row
        return cells[0][0]  
    } else if (cells[1][0] !== undefined && cells[1][0] === cells[1][1] && cells[1][1] === cells[1][2]) {
        // middle row
        return cells[1][0]  
    } else if (cells[2][0] !== undefined && cells[2][0] === cells[2][1] && cells[2][1] === cells[2][2]) {
        // bottom row
        return cells[2][0]  
    } else if (cells[0][0] !== undefined && cells[0][0] === cells[1][0] && cells[1][0] === cells[2][0]) {
        // left column
        return cells[0][0]  
    } else if (cells[0][1] !== undefined && cells[0][1] === cells[1][1] && cells[1][1] === cells[2][1]) {
        // middle column
        return cells[0][1]
    } else if (cells[0][2] !== undefined && cells[0][2] === cells[1][2] && cells[1][2] === cells[2][2]) {
        // right column
        return cells[0][2]  
    } else if (cells[0][0] !== undefined && cells[0][0] === cells[1][1] && cells[1][1] === cells[2][2]) {
        // low to high diagonal
        return cells[0][0]  
    } else if (cells[0][2] !== undefined && cells[0][2] === cells[1][1] && cells[1][1] === cells[2][0]) {
        // high to low diagonal
        return cells[0][2]  
    }
    const emptyCells = countEmptyCells(game)
    if (emptyCells === 0) {
        return "tie"
    }
    return undefined
}


function countEmptyCells(game: GameState): number {
    let emptyCells: number = 0
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (game.cells[i][j] === undefined) {
                emptyCells += 1
            }
        }
    }
    return emptyCells
}
export function makeMove(game: GameState, row: number, col: number): GameState {
    if (game.winner || (game.cells[row][col] !== undefined)) {
        return game
    }
    const nextGame: GameState = {
        cells: structuredClone(game.cells),
        nextTurn: game.nextTurn === 'X' ? 'O': 'X',
        winner: game.winner
    }

    nextGame.cells[row][col] = game.nextTurn
    nextGame.winner = detectWinner(nextGame)
    return nextGame
}

export const startingGame: GameState = {
    cells: [[undefined, undefined, undefined], [undefined, undefined, undefined], [undefined, undefined, undefined]],
    nextTurn: 'X',
    winner: undefined
}