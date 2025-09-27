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
      if (sessionStorage.getItem("currentMatch") !== null && sessionStorage.getItem("currentMatch") !== undefined) {
        setCurrentMatchId(sessionStorage.getItem("currentMatch"))
      }
    }, [])

    // const socket = io()
    // socket.emit('hello', 'world');

    const matchHandler = (id) => {
      setCurrentMatchId(id)
      if (id === null) {
        sessionStorage.removeItem("currentMatch")
      }
      else {
        sessionStorage.setItem("currentMatch", id)
      }
    }

    return (
      <QueryClientProvider client={queryClient}>
        {!currentMatchId && <MatchList matchHandler={matchHandler}/>}
        {currentMatchId && <Game id={currentMatchId} matchHandler={matchHandler}/>}
      </QueryClientProvider>
    )
}

export default App