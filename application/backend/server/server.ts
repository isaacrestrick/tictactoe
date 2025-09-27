import express from "express";
import ViteExpress from "vite-express";
import { objectToGameState, makeMove, GameState, gameStateToObj } from "./tictactoe.ts"
import { createServer } from 'node:http'
import { Server } from 'socket.io'

import { drizzle } from 'drizzle-orm/postgres-js'
import { eq } from 'drizzle-orm';

import dotenv from 'dotenv'

import { gamesTable } from './schema.ts'
import postgres from 'postgres'

import {fileURLToPath} from 'url'
import {dirname} from 'path'

dotenv.config({ path: `${dirname(fileURLToPath(import.meta.url))}/.env` })
const connectionString = process.env.DATABASE_URL
const client = postgres(connectionString, {prepare: false})
const db = drizzle(client)

const app = express();

app.use(express.json())
const server = createServer(app)
const io = new Server(server)

// Maps id => ['X', 'O]
let livePlayers = new Map<string, Array<Array<string>>>

io.on('connection', (socket) => {
    socket.on('join', (message) => {
        const id = String(message.id)
        let turn = 'spectator'
        if (!livePlayers.has(id)) {
            livePlayers.set(id, [['X', socket.id]])
            turn = 'X'
        } else {
            const foundX = livePlayers.get(id).find(turnsocket => turnsocket[0] === 'X') !== undefined
            const foundY = livePlayers.get(id).find(turnsocket => turnsocket[0] === 'O') !== undefined
            if (!foundX) {
                livePlayers.set(id, livePlayers.get(id)?.concat([['X', socket.id]]))
                turn = 'X'
            } else if (!foundY) {
                livePlayers.set(id, livePlayers.get(id)?.concat([['O', socket.id]]))
                turn = 'O'
            }
        }
        //console.log(livePlayers, {validTurn: turn})
        //console.log("joinin this id: ", socket.id)
        socket.emit('valid_turn', {validTurn: turn})
    })
    socket.on('leave', (message) => {
        const id = String(message.id)
        if (livePlayers.has(id)) {
            //console.log("hello")
            //console.log(id)
            console.log("leaving this id ", socket.id)
            //console.log(livePlayers.get(id))
            livePlayers.set(id, livePlayers.get(id).filter(turnsocket => turnsocket[1] !== socket.id))
        }
        console.log("after update", livePlayers)
    })
})

// app.post("/join/:id", (req, res)) => {
//     const { id } = req.params
//     let turn = 'spectator'
//     if (!livePlayers.has(id)) {
//         livePlayers.set(id, ['X'])
//         turn = 'X'
//     } else {
//         if (livePlayers.get(id)) {
//             const foundX = livePlayers.get(id).find('X')
//             const foundY = livePlayers.get(id).find('Y')
//             if (foundX !== undefined) {

//             }
//         }
//     }

//     res .json({"turn": turn})
// }

// app.post("/leave/:id", (req, res)) => {
//     const { id } = req.params
//     if (livePlayers.has(id)) {
        
//     }
//     res.status(200)
// }

app.get("/game/:id", async (req, res) => {
    const { id } = req.params
    const selectedGamesWithId = await db.select().from(gamesTable).where(eq(gamesTable.id, (id)))
    if (selectedGamesWithId) {
        const game = selectedGamesWithId[0]
        res.json(objectToGameState(game))
    } else {
        res.status(404).json({"error": "could not find game"})
    }
})

app.post("/move/:id", async (req, res) => {
    const { id } = req.params
    const selectedGamesWithId = await db.select().from(gamesTable).where(eq(gamesTable.id, (id)))
    if (selectedGamesWithId.length > 0) {
        const prevState = objectToGameState(selectedGamesWithId[0])
        const newGame = makeMove(prevState, req.body.row, req.body.col)

        await db.update(gamesTable).set(gameStateToObj(newGame)).where(eq(gamesTable.id, id))
        console.log("emitting")
        io.emit("update_board")
        io.emit("update_matches")
        res.status(200).json({})
    } else {
        res.status(404).json({"error": "could not find game, so could not make move"})
    }

})

app.get("/games", async (req, res) => {
    const result = await db.select().from(gamesTable)
    res.json({"games": result})
})

app.post("/create", async (req, res) => {
    const gamesReturned = await db.insert(gamesTable).values([
        {
            cells: [['NULL', 'NULL', 'NULL'], ['NULL', 'NULL', 'NULL'], ['NULL', 'NULL', 'NULL']],
            nextTurn: 'X',
            winner: null
        }]
    ).returning()
    io.emit("update_matches")
    res.status(200).json({"game": objectToGameState(gamesReturned[0])})
})

ViteExpress.bind(app, server)

server.listen(5173, "0.0.0.0", () => console.log("server listening"));