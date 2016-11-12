const express = require('express')
const app = require('express')()
const cors = require('cors')
const Server = require('http').Server

const http = Server(app)
const io = require('socket.io')(http)
const PORT = process.env.PORT || 5000

io.on('connection', socket => {
  console.log('a user connected')
  socket.on('chat message', msg => {
    io.emit('chat message', msg)
  })

  socket.on('onmessage', msg => {
    io.emit(message)
  })
})

app.use(express.static(__dirname + './../public'))
app.use(cors())

http.listen(PORT, () => console.log(`Listening on port: ${PORT}`))
