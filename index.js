const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {serveClient: true});

let users = [];
let connections = [];


app.use(express.static(__dirname));
//указываем корневую деректорию
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  
  socket.emit('connected', 'a user connected')

  socket.join('all')
  socket.on('msg', function (msg) {
    const obj = {
      date: new Date(),
      content: msg,
      username: socket.id
    }
    socket.emit('message', obj)
    socket.to('all').emit('message', obj)
  });
  socket.on('receiveHistory', ()=>{
    //localStorage
  })

});
// io.on('send mess', (data) => {
//   io.socket.emit('new mess', messageData);
// });
//localhost:3000
http.listen(3000, function () {
  console.log('listening on *:3000');
});
