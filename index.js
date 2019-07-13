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
var dateOptions = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric'
};

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
      date: (new Date()).toLocaleDateString("ru", dateOptions),
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
    // if (getHistoryFromStorage) {
    //   socket.emit('receiveHistory', chatHistory);
    // }
    let userIndex;
    if ( !users.some((elem,index) => {
      userIndex = index;
      return elem.nickName === obj.nickName;
    })) {
      users.push(obj);   
      socket.emit('userAuthorized', obj);
    } else {
      socket.emit('userAuthorized', users[userIndex]);
    }
    // console.log('users authSend');
    // console.log(users);
    socket.to('all').emit('memberListChanged', users);
    socket.emit('memberListChanged', users);
    socket.emit('historySend', chatHistory);
  });

  socket.on('userAvatarToServer', (user, file)=>{
    let indexUser;
    let fileName = './img/'+cleanSymbols(user.nickName)+'.jpg';

    if (!file) {
      return false;
    }

    fs.writeFile(fileName, file, (err) => {
      if (err) throw err;
      user.avatar = fileName;

      changeChatHistory(user);

      socket.emit('updateUserAvatar', user);
      socket.to('all').emit('updateUserAvatar', user);

      if ( !users.some((elem, index) => {
        indexUser = index;
        return elem.nickName === user.nickName;
      })) {
        users.push(user);   
      } else {
        users[indexUser] = user;
      }
     
      // console.log('users userAvatarToServer');
      // console.log(users);
      
      // socket.emit('memberListChanged', users);
      // socket.to('all').emit('memberListChanged', users);
    });
  })

  function changeChatHistory (user) {
    chatHistory.forEach((elem)=>{
      if (elem.user.nickName === user.nickName) {
        elem.user.avatar = user.avatar;
      };
    });
    socket.emit('historySend', chatHistory);
    socket.to('all').emit('historySend', chatHistory);
  }

  function cleanSymbols (str) {
      return str.replace(/[&<>'"\s`#]/g, "_")
  }
});

// io.on('send mess', (data) => {
//   io.socket.emit('new mess', messageData);
// });
//localhost:3000
http.listen(3000, function () {
  console.log('listening on *:3000');
});
