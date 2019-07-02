document.addEventListener('DOMContentLoaded', function() {
let name = document.querySelector('#name'),
    nickname = document.querySelector('#nickname'),
    authForm = document.querySelector('.authorization__modal_form'),
    sendBtn = document.querySelector('#sendBtn'),
    messageText = document.querySelector('#messageText'),
    messages = document.querySelector('#messages');
    messageContainer = document.querySelector('.message__container'),
    usersList = document.querySelector('#usersList'),
    authPopup = document.querySelector('#authPopup'),
    loadPhoto = document.querySelector('#loadPhoto'),
    inputFile = document.querySelector('#inputFile'),
    //inputFileMessage = document.querySelector('#inputFileMessage'),
    fileLoadPopup = document.querySelector('#fileLoadPopup'),
    fileloadForm = document.querySelector('.fileload__modal_form'),
    droparea = document.querySelector('.droparea'),
    cancel = document.querySelector('#cancel'),
    sendPhoto = document.querySelector('#sendPhoto'),
    container = document.querySelector('.container'),
    nameOfuser = document.querySelector('.users__block_name'),
    members = document.querySelector('.users__block_list'),
    usersList = document.querySelector('#usersList'),
    messagesPhoto = document.querySelector('#messagesPhoto'),
    templateOfMessage = document.querySelector('#messageList').textContent,
    templateOfUsers = document.querySelector('#listOfUsers').textContent,
    renderUsers = Handlebars.compile(templateOfUsers),
    renderMessages = Handlebars.compile(templateOfMessage),
    users = [],
    messagesListOnPage = [],
    socket = io.connect('http://localhost:3000/'),
    max = 512000;

  socket.on('connected', function (msg) {
    //socket.emit('receiveHistory');
  });

  socket.on('messageAddedToServer', addMessage);
  socket.on('userAuthorized', userAuthorized);
  socket.on('memberListChanged', updateMemberList);
  socket.on('updateUserAvatar', () => {console.log('updateUserAvatar')});

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
    socket.emit('msgToServer', messageData);
    console.log('msgToServer');
    messageText.value = '';
      
  });

  authForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (name.value && nickname.value) {
      socket.emit('authSend', {'name': name.value, 'nickname': nickname.value});
    }
  })

  loadPhoto.addEventListener('click', (event) => {
    toggleHide(fileLoadPopup);
  });

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
          bigImage.src =  e.target.result;
        };
      })(file);

      // Read in the image file as a data URL.
      reader.readAsDataURL(file);

    };
  });

  fileloadForm.addEventListener('submit', (event)=>{
    event.preventDefault();
    socket.emit('userAvatarToServer');

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
    console.log('messageAddedToServer');
    messagesListOnPage.push(message);
    let messagesList = renderMessages(messagesListOnPage);
          messages.innerHTML = messagesList;
          messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  function userAuthorized (obj) {
    nameOfuser.innerHTML = obj.name;
    toggleHide(authPopup);
  }

  function updateMemberList (obj) {
    const newMember = document.createElement('li');

    newMember.innerHTML = obj.name;
    members.appendChild(newMember);
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

    if (file.size > max) {
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

  

});
