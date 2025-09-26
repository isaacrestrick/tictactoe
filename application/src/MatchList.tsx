
import {
    useQuery,
    useMutation,
    useQueryClient
  } from '@tanstack/react-query'
  import axios from 'axios'
import { Game } from './Game.tsx'
import { io, Socket } from "socket.io-client"
import { useEffect } from 'react'
export const MatchList = (props) => {
  const queryClient = useQueryClient()
  useEffect(() => {
    const s = io()
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

  return (
    <div className="flex flex-col items-center">
        <h1 className = "mt-4 text-2xl">Tic Tac Toe: Match Selector </h1>
        <div className="bg-white border black mt-4 ml-4 w-[30%] h-15 flex flex-col items-center justify-center" onClick={() => createNewGame()}><p className="ml-2 text-lg">Create New Game</p></div>
        <h1 className = "mt-4 text-xl">Current and Previous Matches, Most Recent First</h1>
        {games.map(game => <div key={game.id} className="bg-white border black mt-4 ml-4 w-[48%] h-10 flex flex-col items-center justify-center" onClick={() => setMatchId(game.id)}><p className="ml-2 text-md">game: {game.id}</p></div>)}
    </div>
  )

}