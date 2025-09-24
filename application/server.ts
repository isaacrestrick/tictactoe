//e.g server.js
import express from "express";
import ViteExpress from "vite-express";

const app = express();

app.get("/game", (req, res) => {

})

app.post("/move", (req, res) => {
    
})

ViteExpress.listen(app, 5173, () => console.log("server listening"));