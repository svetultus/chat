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

  socket.join('all');

  socket.on('msgToServer', function (msg) {
    const obj = {
      date: new Date(),
      content: msg,
      username: socket.id
    }
    socket.emit('messageAddedToServer', obj)
    socket.to('all').emit('messageAddedToServer', obj)
  });

  socket.on('receiveHistory', ()=>{
    //localStorage
  });

  socket.on('authSend', (obj)=> {
    socket.emit('userAuthorized', obj);
    socket.emit('memberListChanged', obj);
    socket.to('all').emit('memberListChanged', obj);
  });

  socket.on('userAvatarToServer', ()=>{
    console.log('avatarToServer');
    socket.emit('updateUserAvatar');
    socket.to('all').emit('updateUserAvatar');
  })

});
// io.on('send mess', (data) => {
//   io.socket.emit('new mess', messageData);
// });
//localhost:3000
http.listen(3000, function () {
  console.log('listening on *:3000');
});
