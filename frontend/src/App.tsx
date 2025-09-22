import { useState } from 'react'
import { countEmptyCells, makeMove, startingGame} from '/src/tictactoe.ts'

const App = () => {
    const [game, setGame] = useState(startingGame)

    const clickCell = (row: number, col: number) => {
        setGame(makeMove(game, row, col))
      
    }

    const emptyCells = countEmptyCells(game)

    const resetBoard = () => {
      console.log("reset")
      setGame(startingGame)
    }

    const Cell = ({row, col}) => {
      return <td className="p-8 text-8xl" onClick={() => clickCell(row, col)}>{game.cells[row][col] || '_' }</td>
    }

    const ResetButton = () => {
      return <button className="border border-black py-1 px-2" onClick={() => resetBoard()}>reset</button>
    }

    const GameMessage = () => {
      return <>
        {!game.winner && emptyCells !== 0 && <p className='text-center text-xl'>Current player is {game.nextTurn}</p>}
        {game.winner && <p className='text-center text-xl'>And the winner is: {game.winner}!! reset? <ResetButton /></p>}
        {!game.winner && emptyCells === 0 && <p className='text-center text-xl'>Uh oh, it is a tie. reset? <ResetButton /></p>}
      </>
    }

    const TicTacToeBoard = () => {
      return (
        <table className="mx-auto">
          <tbody className="border border-black">
          <tr>
            <Cell row={0} col={0}/>
            <Cell row={0} col={1}/>
            <Cell row={0} col={2}/>
          </tr>
          <tr>
          <Cell row={1} col={0}/>
          <Cell row={1} col={1}/>
          <Cell row={1} col={2}/>
          </tr>
          <tr>
          <Cell row={2} col={0}/>
          <Cell row={2} col={1}/>
          <Cell row={2} col={2}/>
          </tr>
        </tbody>
        </table>
      )
    }

    return (
      <div className="flex flex-col space-y-6">
        <h1 className="m-6 text-3xl font-bold underline text-center">Tic Tac Toe Board:</h1>
        <GameMessage />
        <TicTacToeBoard />
      </div>
    )
}


export default App