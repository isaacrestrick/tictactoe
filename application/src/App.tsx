import { Game } from '/src/Game.tsx'
import { MatchList } from '/src/MatchList.tsx'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { useState, useEffect } from 'react'
const queryClient = new QueryClient()
import { io, Socket } from "socket.io-client";


const App = () => {
    const [currentMatchId, setCurrentMatchId] = useState(null)

    useEffect(() => {
      if (localStorage.getItem("currentMatch") !== null) {
        setCurrentMatchId(localStorage.getItem("currentMatch"))
      }
    }, [])

    // const socket = io()
    // socket.emit('hello', 'world');

    const matchHandler = (id) => {
      setCurrentMatchId(id)
      if (id === null) {
        localStorage.removeItem("currentMatch")
      }
      else {
        localStorage.setItem("currentMatch", id)
      }
    }

    const currentMatchInLocalStorage = localStorage.getItem("currentMatch")

    return (
      <QueryClientProvider client={queryClient}>
        {!currentMatchId && <MatchList matchHandler={matchHandler}/>}
        {currentMatchId && <Game id={currentMatchId} matchHandler={matchHandler}/>}
      </QueryClientProvider>
    )
}

export default App