
import {
    useQuery,
    useMutation,
    useQueryClient
  } from '@tanstack/react-query'
import axios from 'axios'  
import { io, Socket } from "socket.io-client"
import { useEffect, useState } from 'react'

export const MatchList = (props) => {
  const queryClient = useQueryClient()
  // const [socket, setSocket] = useState(null)
  useEffect(() => {
    const s = io()
    //setSocket(s)
    s.on('update_matches', () => {
      queryClient.invalidateQueries({queryKey: [`games`]})
    })
    return () => s.disconnect()
  }, [])
  const { isPending, error, data } = useQuery({
      queryKey: ['games'],
      queryFn: () =>
          fetch('/games').then((res) =>
              res.json()
      ),
  })
  
  const mutation = useMutation({
      mutationFn: () =>
          axios.post("/create").then((res) => {props.matchHandler(res.data.game.id)}),
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['games']})
      }
  })

  
  if (isPending) return <p>'Loading Boards...'</p>
  
  if (error) return <p>'An error has occurred: ' + {error.message}</p>

  const matchData = data 
  const games = matchData.games 
  const gamesVisible = false

  const createNewGame = () => {
    mutation.mutate()
  }

  const setMatchId = (id) => {
    props.matchHandler(id)
  }

  const gamesSortedIdDescending = games.sort((a,b) => Number(b.id) - Number(a.id))

  return (
    <div className="flex flex-col items-center">
        <h1 className = "mt-4 text-2xl">Tic Tac Toe: Match Selector</h1>
        <div className = "flex flex-row w-[48%]">
        <div className="bg-white border black mt-4 ml-4 w-[30%] h-15 flex flex-col items-center justify-center" onClick={() => createNewGame()}><p className="ml-2 text-lg">Create New Game</p></div>
        <div className="bg-white border black mt-4 ml-4 w-[30%] h-15 flex flex-col items-center justify-center" onClick={() => createNewGame()}><p className="ml-2 text-lg">Against AI...</p></div>
        <div className="bg-white border black mt-4 ml-4 w-[30%] h-15 flex flex-col items-center justify-center" onClick={() => createNewGame()}><p className="ml-2 text-lg">Against Yourself...</p></div>
        </div>
        <h1 className = "mt-4 text-xl">Current and Previous Matches</h1>
        {gamesSortedIdDescending.map(game => <div key={game.id} className="bg-white border black mt-4 ml-4 w-[48%] h-10 flex flex-col items-center justify-center" onClick={() => setMatchId(game.id)}><p className="ml-2 text-md">game: {game.id}. {game.winner ? `Winner? ${game.winner}` : `Current turn: ${game.nextTurn}`}. Player(s): 2/2. Spectator(s): 1</p></div>)}
    </div>
  )

}