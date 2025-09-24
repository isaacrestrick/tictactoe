//e.g server.js
import express from "express";
import ViteExpress from "vite-express";
import { startingGame, makeMove } from "./src/tictactoe.ts"

const app = express();
app.use(express.json())
let game = startingGame

app.get("/game", (req, res) => {
    res.json(game)
})

app.post("/move", (req, res) => {
    game = makeMove(game, req.body.row, req.body.col)
    res.status(200).json({})
})

ViteExpress.listen(app, 5173, () => console.log("server listening"));