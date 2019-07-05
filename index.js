const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {serveClient: true});
const fs = require('fs');
const bodyParser = require('body-parser')
//const urlencodedParser = bodyParser.urlencoded({ extended: false })

let users = [];
let connections = [];
let chatHistory = [];

//app.use(bodyParser.urlencoded({ extended: false }))

app.use(express.static(__dirname));
//указываем корневую деректорию
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.post('/uploadAvatar', function(req, res) {
  // console.log(req);
  // let buf = req.response;

  // fs.writeFile('image.png', function(err, buf){
  //   it's possible to embed binary data
  //   within arbitrarily-complex objects
  //   socket.emit('image', { image: true, buffer: buf });
  // });
});


io.on('connection', function (socket) {
  
  socket.emit('connected', 'a user connected')

  socket.join('all');

  socket.on('msgToServer', function (msg) {
    const obj = {
      date: new Date(),
      content: msg.message,
      user: msg.user
    }
    chatHistory.push(obj);
    //saveHistoryInStorage ();
    socket.emit('messageAddedToServer', obj)
    socket.to('all').emit('messageAddedToServer', obj)
  });

  socket.on('receiveHistory', ()=>{
    //localStorage
  });

  socket.on('authSend', (obj)=> {
    socket.emit('userAuthorized', obj);
    // if (getHistoryFromStorage) {
    //   socket.emit('receiveHistory', chatHistory);
    // }
    if ( !users.some((elem) => {
      return elem.nickName === obj.nickName;
    })) {
      users.push(obj);   
    };
    socket.to('all').emit('memberListChanged', users);
    socket.emit('memberListChanged', users);
    socket.emit('historySend', chatHistory);
  });

  socket.on('userAvatarToServer', (user)=>{
    
    console.log('avatarToServer');
    //console.log(file);
    users[user['nickName']] = user;
   
    socket.emit('updateUserAvatar', user);
    socket.emit('memberListChanged', users);
    socket.to('all').emit('memberListChanged', users);
  })
});

// io.on('send mess', (data) => {
//   io.socket.emit('new mess', messageData);
// });
//localhost:3000
http.listen(3000, function () {
  console.log('listening on *:3000');
});
