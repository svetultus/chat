document.addEventListener('DOMContentLoaded', function() {
let name = document.querySelector('#name'),
    nickname = document.querySelector('#nickname'),
    authBtn = document.querySelector('#authBtn'),
    sendBtn = document.querySelector('#sendBtn'),
    messageText = document.querySelector('#messageText'),
    messages = document.querySelector('#messages');
    messageContainer = document.querySelector('.message__container'),
    usersList = document.querySelector('#usersList'),
    authPopup = document.querySelector('#authPopup'),
    loadPhoto = document.querySelector('#loadPhoto'),
    fileLoadPopup = document.querySelector('#fileLoadPopup'),
    cancel = document.querySelector('#cancel'),
    sendPhoto = document.querySelector('#sendPhoto'),
    container = document.querySelector('.container'),
    nameOfuser = document.querySelector('.users__block_name'),
    members = document.querySelector('.users__block_members'),
    usersList = document.querySelector('#usersList'),
    messagesPhoto = document.querySelector('#messagesPhoto'),
    templateOfMessage = document.querySelector('#messageList').textContent,
    templateOfUsers = document.querySelector('#listOfUsers').textContent,
    renderUsers = Handlebars.compile(templateOfUsers),
    renderMessages = Handlebars.compile(templateOfMessage),
    users = [],
    messagesListOnPage = [],
    socket = io.connect('http://localhost:3000/');
    socket.on('connected', function (msg) {
      console.log(msg);
      //socket.emit('receiveHistory');
  });

  socket.on('message', addMessage);

    // authBtn.addEventListener('click', (event) => {
    //     event.preventDefault();
    //     let nameData =  name.value.trim();
    //     let nicknameData = nickname.value.trim();
    //     let userInfo = {
    //             name: nameData,
    //             nicknameck: nicknameData
    //         };
    //         authPopup.style.display = 'none';
    //         if(!nameData || !nicknameData){
    //           name.classList.add('authorization__modal_input-error');
    //           nickname.classList.add('authorization__modal_input-error');
    //           authPopup.style.display = 'block';
    //         }
    //       users.push(userInfo);
    //       console.log(users);
    //       nameOfuser.textContent = nameData;
    //       members.style.display = 'block';
    //       let membersList = renderUsers(users);
    //       usersList.innerHTML = membersList;
    //       sendBtn.removeAttribute('disabled');
    //       });


    sendBtn.addEventListener('click', (event) => {
      event.preventDefault();

      let messageData = messageText.value.trim();
      let messageInfo = {
       // name: name.value.trim() + ':',
        message: messageData
      };

      
      if(messageData.length == 0){
        
        messageText.classList.add('message__form_input-error');
      }
      socket.emit('msg', messageData);
      messageText.value = '';
        
    });

function addMessage(message){
  
  messagesListOnPage.push(message);
  let messagesList = renderMessages(messagesListOnPage);
        messages.innerHTML = messagesList;
        messageContainer.scrollTop = messageContainer.scrollHeight;
}
  

});
