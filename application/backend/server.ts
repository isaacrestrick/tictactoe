import express from "express";
import ViteExpress from "vite-express";
import { createNewGame, makeMove, GameState} from "./tictactoe.ts"
import { createServer } from 'node:http'
import { Server } from 'socket.io'

const app = express();

let games: Array<GameState> = [createNewGame(), createNewGame()]

app.use(express.json())
const server = createServer(app)
const io = new Server(server)

app.get("/game/:id", (req, res) => {
    const { id } = req.params
    const game = games.find(game => game.id === id)
    //console.log("game: ", game)
    if (game) {
        res.json(game)
    } else {
        res.status(404).json({"error": "could not find game"})
    }
})

app.post("/move/:id", (req, res) => {
    const { id } = req.params
    const game = games.find(game => game.id === id)
    console.log("attempting move on id: ", id)
    if (game) {
        games = games.map(game => game.id === id ? makeMove(game, req.body.row, req.body.col) : game)
        console.log(games.find(game => game.id === id))
        io.emit("update")
        res.status(200).json({})
    } else {
        res.status(404).json({"error": "could not find game, so could not make move"})
    }

})

app.get("/games", (req, res) => {
    console.log("hello")
    res.json({"games": games})
})

app.post("/create", (req, res) => {
    const game = createNewGame()
    games.push(game)
    res.status(200).json({"game": game})
})

ViteExpress.bind(app, server)

server.listen(5173, () => console.log("server listening"));