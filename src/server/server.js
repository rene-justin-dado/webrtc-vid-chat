import express from 'express'
import cors from 'cors'
import {Server} from 'http'

const app = express()
const http = Server(app)
const io = require('socket.io')(http)
const PORT = process.env.PORT || 5000

app.use(express.static(__dirname + './../public'))
app.use(cors())

http.listen(PORT, () => console.log(`Listening on port: ${PORT}`))
