
import {
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query'
import axios from 'axios'

export const Game = (props) => {
    const queryClient = useQueryClient()
    const { isPending, error, data } = useQuery({
        queryKey: [`game/${props.id}`],
        queryFn: () =>
            fetch(`/game/${props.id}`).then((res) =>
                res.json(),
        ),
    })
    const mutation = useMutation({
        mutationFn: ({row, col}: {row: number, col: number}) =>
            axios.post(`/move/${props.id}`, {row, col}).then(() => {}),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: [`game/${props.id}`]})
        }
    })
    
    if (isPending) return <p>'Loading Boards...'</p>
    
    if (error) return <p>'An error has occurred: ' + {error.message}</p>
    
    const game = data.id ? data : { cells: [[null, null, null], [null, null, null], [null, null, null]], nextTurn: "not found"}

    const clickCell = (row: number, col: number) => {
        mutation.mutate({row: row, col: col})
      
    }

    const resetBoard = () => {
      console.log("reset")
      mutation.mutate({row: -1, col: -1})
    }

    const Cell = ({row, col}: {row: number, col: number}) => {
      return <td className="p-8 text-8xl" onClick={() => clickCell(row, col)}>{game.cells[row][col] || '_' }</td>
    }

    const ResetButton = () => {
      return <button className="border border-black py-1 px-2" onClick={() => resetBoard()}>reset</button>
    }

    const GameMessage = () => {
      return <>
        {!game.id && <p className='text-center text-xl'>Uh oh, game not found!</p>}
        {!game.winner && <p className='text-center text-xl'>Current player is {game.nextTurn}</p>}
        {game.winner && game.winner !== "tie" && <p className='text-center text-xl'>And the winner is: {game.winner}!! reset? <ResetButton /></p>}
        {game.winner === "tie" && <p className='text-center text-xl'>Uh oh, it is a tie. reset? <ResetButton /></p>}
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

    const goBackOnClick = () => {
      props.matchHandler(null)
    }

    const BackButton = () => {
      return (
        <div className="w-40 h-20 border black text-md text-center" onClick={goBackOnClick}>Press me to go back to match selection</div>
      )
    }

    return (
      <div className="flex flex-col items-center space-y-6">
        <h1 className="m-6 text-3xl font-bold underline text-center">Tic Tac Toe Board:</h1>
        <GameMessage />
        <TicTacToeBoard />
        <BackButton />
      </div>
    )
}