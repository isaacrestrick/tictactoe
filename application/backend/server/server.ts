import express from "express";
import ViteExpress from "vite-express";
import { objectToGameState, makeMove, GameState, gameStateToObj, createNewGame } from "./tictactoe.ts"
import { createServer } from 'node:http'
import { Server } from 'socket.io'

import { drizzle } from 'drizzle-orm/postgres-js'
import { eq } from 'drizzle-orm';

import dotenv from 'dotenv'

import { gamesTable } from './schema.ts'
import postgres from 'postgres'

import {fileURLToPath} from 'url'
import {dirname} from 'path'

import OpenAI from "openai";

const tictactools = [
    {
        "type": "function",
        "name": "make_tic_tac_toe_move",
        "description": "Make a move in tic tac toe given row, column, and player's turn",
        "strict": true,
        "parameters": {
          "type": "object",
          "properties": {
            "row": {
              "type": "integer",
              "description": "Row number where the move will be made (0-based index)"
            },
            "column": {
              "type": "integer",
              "description": "Column number where the move will be made (0-based index)"
            },
            "turn": {
              "type": "string",
              "description": "Current player's symbol or turn, typically 'X' or 'O'",
              "enum": [
                "X",
                "O"
              ]
            }
          },
          "required": [
            "row",
            "column",
            "turn"
          ],
          "additionalProperties": false
        }
      }
  ];


dotenv.config({ path: `${dirname(fileURLToPath(import.meta.url))}/.env` })
const connectionString = process.env.DATABASE_URL
const client = postgres(connectionString, {prepare: false})
const db = drizzle(client)

const app = express();

const openai = new OpenAI({apiKey: process.env.OPENAI_KEY})
const makeResponse = async (game) => {
    console.log("here")
    const response = await openai.responses.create({
        model: "gpt-5",
        reasoning: { effort: "minimal" },
        instructions: "Respond only with a tool call to the current board",
        tools: tictactools,
        input: "cells: " + JSON.stringify(game.cells) + " turn:" + game.nextTurn
    });
    return response.output[1].arguments
}

//const c = await makeResponse(gameStateToObj(createNewGame()))
//console.log("response", c)

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
        io.emit("update_matches")
    })
    socket.on('leave', (message) => {
        console.log("SUP")
        const id = String(message.id)
        if (livePlayers.has(id)) {
            //console.log("hello")
            //console.log(id)
            console.log("leaving this id ", socket.id)
            //console.log(livePlayers.get(id))
            livePlayers.set(id, livePlayers.get(id).filter(turnsocket => turnsocket[1] !== socket.id))
        }
        console.log("after update", livePlayers)
        io.emit("update_matches")
    })
    socket.on('disconnect', (reason) => {
        console.log('socket closed because', reason);
      // Vibe coded a thing to go through my map.
      for (const [gameId, playerArr] of livePlayers.entries()) {
        const filtered = playerArr.filter(turnsocket => String(turnsocket[1]) !== String(socket.id));
        if (filtered.length === 0) {
          livePlayers.delete(gameId);
        } else {
          livePlayers.set(gameId, filtered);
        }
      }
      io.emit("update_matches");
      });
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
        let newGame = makeMove(prevState, req.body.row, req.body.col)
        if (req.body.isAI) {
            console.log("ITS AI!!!!")
            let airesponse = await makeResponse(gameStateToObj(newGame))
            console.log(airesponse)
            console.log(JSON.parse(airesponse))
            airesponse = JSON.parse(airesponse)
            //newGame.nextTurn = 
            console.log(airesponse.row, airesponse.column)
            newGame = makeMove(objectToGameState(newGame), Number(airesponse.row), Number(airesponse.column))
            console.log(newGame)
        } else {
            console.log("NOT AI!!")
        }

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
    //console.log("live players in games", livePlayers)
    res.json({"games": result, "players": Array.from(livePlayers.entries())})
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