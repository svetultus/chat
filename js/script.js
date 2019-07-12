document.addEventListener('DOMContentLoaded', function() {
let name = document.querySelector('#name'),
    nickname = document.querySelector('#nickname'),
    authForm = document.querySelector('.authorization__modal_form'),
    sendBtn = document.querySelector('#sendBtn'),
    messageForm = document.querySelector('#message-form'),
    messageText = document.querySelector('#messageText'),
    messages = document.querySelector('#messages');
    messageContainer = document.querySelector('.message-list__container'),
    usersList = document.querySelector('#usersList'),
    authPopup = document.querySelector('#authPopup'),
    loadPhoto = document.querySelector('#loadPhoto'),
    inputFile = document.querySelector('#inputFile'),
    //inputFileMessage = document.querySelector('#inputFileMessage'),
    fileLoadPopup = document.querySelector('#fileLoadPopup'),
    fileloadForm = document.querySelector('.fileload__modal_form'),
    avatarImage = document.querySelector("#avatarImage"),
    droparea = document.querySelector('.droparea'),
    cancel = document.querySelector('#cancel'),
    sendPhoto = document.querySelector('#sendPhoto'),
    container = document.querySelector('.container'),
    nameOfuser = document.querySelector('.users__block_name'),
    members = document.querySelector('#usersList'),
    messagesPhoto = document.querySelector('#messagesPhoto'),
    templateOfMessage = document.querySelector('#messageList').textContent,
    templateOfUsers = document.querySelector('#listOfUsers').textContent,
    renderUsers = Handlebars.compile(templateOfUsers),
    renderMessages = Handlebars.compile(templateOfMessage),
    //messagesListOnPage = [],
    socket = io.connect('http://localhost:3000/'),
    maxFileSize = 512000,
    currentUser = {
      nickName: '',
      name: '',
      avatar: null
    },
    chatHistory = [];
    let storage;

  socket.on('connected', function (msg) {
    //socket.emit('receivechatHistory');
    if (storageAvailable('localStorage')) {
      storage = localStorage;
    };
  });
  socket.on('messageAddedToServer', addMessage);
  socket.on('userAuthorized', userAuthorized);
  socket.on('memberListChanged', updateMemberList);
  socket.on('updateUserAvatar', (user) => {
    if (user.nickName === currentUser.nickName && user.avatar) {
      avatarImage.src = user.avatar;
      document.querySelector(".no_photo").classList.add("no_photo-o");
    };
    // if (user.avatar) {
    //   console.log('поменять картинки');
    //   changeAvatarInHistory(user);
    // }
  });
  socket.on('historySend', updateHistoryFromServer);

  messageForm.addEventListener('submit', (event) => {
    event.preventDefault();

    let messageData = {
      user: currentUser,
      message: messageText.value.trim()
    }

    if(messageData.length == 0){
      messageText.classList.add('message__form_input-error');
    }
    socket.emit('msgToServer', messageData);
    //console.log('msgToServer');
    messageText.value = '';
      
  });

  authForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (name.value && nickname.value) {
      currentUser.nickName = nickname.value;
      currentUser.name = name.value;
      socket.emit('authSend', currentUser);
    }
  })

  inputFile.addEventListener('change', (event) => {
    const targetInput = event.target;
    const file = event.target.files[0];
    

    if (checkFile(file, event.target)) {
      let bigImage = targetInput.parentElement.querySelector('.image_input');
      let reader = new FileReader();

      // Closure to capture the file information.
      reader.onload = (function() {
        return function(e) {
          event.target.dataset.title = "";
          bigImage.src = e.target.result;
          currentUser.avatar = "./img/" + currentUser.nickName + ".jpg";
        };
      })(file);

      // Read in the image file as a data URL.
      reader.readAsDataURL(file);
    };
  });

  fileloadForm.addEventListener('submit', (event)=>{
    event.preventDefault();
    socket.emit('userAvatarToServer', currentUser, inputFile.files[0]);
    toggleHide(fileLoadPopup);
    // socket.emit('userAvatarToServer', inputFile.files[0]);
  });

  fileloadForm.addEventListener('reset', (event)=>{
    const form = event.target;
    const message = form.querySelector('.inputFileMessage');
    const bigImage = form.querySelector('.image_input');

    inputFile.dataset.title = 'Перетащите сюда файл';

    message.innerHTML = "";
    message.classList.remove = ['success', 'error'];
    bigImage.removeAttribute('src');
    toggleHide(fileLoadPopup);
  });

  function addMessage(message){
    //console.log('messageAddedToServer');
    chatHistory.push(message);
    //saveChatHistoryInStorage();
    //messagesListOnPage.push(message);
    let messagesList = renderMessages(chatHistory);
          messages.innerHTML = messagesList;
          messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  function userAuthorized (obj) {
    //console.log(obj);
    currentUser = obj;
    nameOfuser.innerHTML = currentUser.name;
    if(currentUser.avatar) {
      avatarImage.src = currentUser.avatar;
      document.querySelector(".no_photo").classList.add("no_photo-o");
    }
    toggleHide(authPopup);
    loadPhoto.addEventListener('click', (event) => {
      toggleHide(fileLoadPopup);
    });
    // if (getChatHistoryFromStorage()) {
    //   let messagesList = renderMessages(chatHistory);
    //       messages.innerHTML = messagesList;
    //       messageContainer.scrollTop = messageContainer.scrollHeight;
    // };
  }

  function updateMemberList (users) {
    // console.log('users');
    // console.log(users);
    let usersList = renderUsers(users);
    members.innerHTML = usersList;

      // let docFrag = document.createDocumentFragment();

      // users.forEach((elem)=> {
      //   const newMember = document.createElement('li');
      //   const img = document.createElement('img');

      //   newMember.dataset.nickname = elem.nickName;
      //   newMember.innerHTML = elem.name;

      //   img.src = elem.avatar;
      //   img.alt = elem.name;
      //   newMember.appendChild(img);

      //   docFrag.appendChild(newMember);
      // })
      // members.innerHTML = "";
      // members.appendChild(docFrag);
  }

  function toggleHide (element) {
    element.classList.add("toggleHide");
    setTimeout(()=> {
      element.classList.toggle('hidden');
      element.classList.toggle('showed');
      element.classList.remove('toggleHide');
    }, 1000);
  }

  function checkFile (file, input) {
    const parent = input.closest('.fileload_block');
    const message = parent.querySelector('.inputFileMessage');
    let error = '';

    if (file.size > maxFileSize) {
      error += 'Слишком большой файл. Допускаются файлы размером меньше 512 кБ. <br />';
    };
    if (file.type !== "image/jpeg") {
      error += 'Тип файла не допустим: допускаются файлы типа jpg.';
    } 
    
    if (error) {
      message.innerHTML = error;
      message.classList.add ='error';
      message.classList.remove ='success';

      return false;
    } else {
      message.innerHTML = `Файл ${file.name} готов к загрузке. Нажмите кнопку "Загрузить" для завершения.`;
      message.classList.add ='success';
      message.classList.remove ='error';

      return true;
    }
  }

  function storageAvailable(type) {
    try {
      var storage = window[type],
        x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    }
    catch(e) {
      return false;
    }
  }
  
  function saveChatHistoryInStorage () {
      storage['chatMessages'] = JSON.stringify(chatHistory);
  }
  
  function getChatHistoryFromStorage () {
      let chatMessages = JSON.parse(storage.getItem('chatMessages'));
  
      if (chatMessages !== null) {
          chatHistory = chatMessages;
      };
      return true;
  }
  
  function updateHistoryFromServer (chatHistoryFromServer) {
    chatHistory = chatHistoryFromServer;

    let messagesList = renderMessages(chatHistory);
    messages.innerHTML = messagesList;
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  // function changeAvatarInHistory (user) {
  //   let photos = document.querySelectorAll(".messagesPhoto[data-userNickName='"+user.nickName+"']");
    
  //   photos.forEach((elem)=>{
  //     elem.src = user.avatar;
  //   });
  // }
});
