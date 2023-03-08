const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
// const { v4 : uuidV4 } = require('uuid')

const PORT = 8000

const app = express()
app.use(cors)
.get('/', function(req,res){
  res.send('index.html');
});
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})
server.listen(PORT, () => {
  console.log('Server is up on port: ', PORT)
})

io.on("connection", (socket) => {
  console.log('User connected')

  socket.on('join', function (room) {
    socket.join(room);
    console.log(room)
    socket.emit('connection-success', {
      status: 'connection-success',
      roomId: room
    })
  });

  socket.on('disconnect', () => {
    console.log('Disconnected')
  })

  socket.on('sdp', (data) => {
    console.log(data);
    socket.broadcast.emit('sdp', data)
  })
  
  socket.on('candidate', (data) => {
    console.log("Candidates ", data)
    socket.broadcast.emit('candidate', data)
  })
})

