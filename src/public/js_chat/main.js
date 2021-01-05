const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room from URL

var username= document.currentScript.getAttribute('username');
console.log('atributo:', username);
var room= document.currentScript.getAttribute('room');
console.log('atributo:', room);
var textooo = document.getElementById('nota').value;
console.log('asdasdadasd',textooo);
let file;

const Enviar = ()=>{
  $('#nota').summernote({
    height: 300,                 // set editor height
    minHeight: null,             // set minimum height of editor
    maxHeight: null,             // set maximum height of editor
    focus: true,                  // set focus to editable area after initializing summernote
    toolbar: [
        ['style', ['style']],
        ['font', ['bold', 'underline', 'clear']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['table', ['table']],
        ['insert', ['link', 'picture']],
        ['view', ['codeview', 'help']],
      ]
});
var text = $('#nota').summernote('code');
console.log(text);
    socket.emit('fileMessage', text);
      
 }
async function ObtenerSala() {
  var room = document.getElementById('room').value;
  console.log('sala: ',room);
  var array = {room: room};
  await fetch("/links/guardar_sala", {method: 'POST',headers:{'Content-Type': 'application/json'},  body:JSON.stringify(array)});
}

const socket = io();
// Join chatroom


socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Message from server
socket.on('message', message => {
  console.log(message);
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});
socket.on('file', message => {
  console.log('dntro file',message);
  $('#nota').summernote('code',message.text);
});

// Message submit
  chatForm.addEventListener('submit', e => {
    e.preventDefault(); 
  
    // Get message text
    let msg = e.target.elements.msg.value;
    console.log(msg);
    msg = msg.trim();
    
    if (!msg){
      return false;
    }
  
    // Emit message to server
    socket.emit('chatMessage', msg);
  
    // Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
  });

chatForm.addEventListener('submit', e => {
  e.preventDefault(); 

  // Get message text
  let msg = e.target.elements.msg.value;
  console.log(msg);
  msg = msg.trim();
  
  if (!msg){
    return false;
  }

  // Emit message to server
  socket.emit('chatMessage', msg);

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});


// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach(user=>{
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
 }

 
 console.log('fileeeeeee',file);
 
