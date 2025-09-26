import express from "express";
import ViteExpress from "vite-express";
import { objectToGameState, makeMove, GameState } from "./tictactoe.ts"
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
        await db.update(gamesTable).set(newGame).where(eq(gamesTable.id, id))
        console.log("emitting")
        io.emit("update_board")
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

server.listen(5173, () => console.log("server listening"));