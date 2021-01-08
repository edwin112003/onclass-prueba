
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');


// Get username and room from URL

var username= document.currentScript.getAttribute('username');
console.log('atributo:', username);
var room= document.currentScript.getAttribute('room');
console.log('atributo:', room);
var id_contacto = document.currentScript.getAttribute('id_usuario');
console.log('con',id_contacto);
var id_remitente = document.currentScript.getAttribute('id_remitente');
console.log('con',id_remitente);
var textooo = document.getElementById('nota').value;
console.log('asdasdadasd',textooo);
let file;
var hashfaso = '';
function EnviarFalso(){
hashfaso = 'pepe';
Enviar();
}
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
var texto = 'buenas';
var k = 'pepe';
console.log('lleva');
var array = {id:id_contacto};
fetch("/links/llaves2", {method: 'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(array)}).then(response => response.json()).then(data =>{
  var TC = CryptoJS.AES.encrypt(text, k).toString();
  console.log('rpueba',TC);
  //asimetrico
  console.log('llaves2',data);

  const keyrsa = new JSEncrypt();
 
  keyrsa.setPublicKey(data);

  let kc =keyrsa.encrypt(k);
  console.log('lleve del simetrico cifrada',kc);

  var llaveprivada = localStorage.getItem('llaveprivada');
  keyrsa.setPrivateKey(llaveprivada);
  var cade_c;
  if(hashfaso == ''){
    console.log('vacio');
     cade_c =CryptoJS.SHA1(TC).toString(CryptoJS.enc.Base64);
  }else{
    console.log('fake');
     cade_c =CryptoJS.SHA1(hashfaso).toString(CryptoJS.enc.Base64);
  }
  hashfaso = '';
  console.log('cc',cade_c);
  var array3 = {
    llave_privada : llaveprivada,
    hash : cade_c
  }
  fetch("/links/encriptar", {method: 'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(array3)}).then(response => response.json()).then(data =>{
    console.log('hash',data);
  console.log("n_cccccc",data);
  var ccc_simetrico = CryptoJS.AES.encrypt(data, k).toString();

  var objeto = {
    kc: kc,
    TC : TC,
    TCC : ccc_simetrico,
    id:id_remitente
  }
  socket.emit('fileMessage', objeto); 
  
  });
  
});




         
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
  
  console.log('asdasdasdasdasdasda',message.text.id);
  console.log('asdasdasdasdasdasda',id_remitente);
  if(message.text.id == id_remitente){
    console.log('asdasdasdasdasdasda',message.text.id);
  }else{

    console.log('dntro file',message);
    var array = {
      id:message.text.id
    }
  console.log('array',array);
  fetch("/links/llaves2", {method: 'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(array)}).then(response => response.json()).then(data =>{
  console.log('datadel2',data);
  
  var kc_de = message.text.kc;
  var TC_de = message.text.TC;
  var TCC_de = message.text.TCC;
  var id_remi = message.text.id;

  if(id_remi == id_remitente){
    console.log('buenabuenabuenabuenabuneaubuena saltamos cifrado'); 
  }else{
  console.log('llave',kc_de);
  console.log('cifrado',TC_de);
  console.log('ccc',TCC_de);

  //obtener privada
  const keyrsade = new JSEncrypt(); 
  var llaveprivada_de = localStorage.getItem('llaveprivada');
  keyrsade.setPrivateKey(llaveprivada_de);
  var k_de = keyrsade.decrypt(kc_de);
  console.log('llae_des',k_de);

  var txt = CryptoJS.AES.decrypt(TC_de, k_de).toString(CryptoJS.enc.Utf8);
  console.log(txt);
  var hash =CryptoJS.SHA1(TC_de).toString(CryptoJS.enc.Base64);

  var ccc_de = CryptoJS.AES.decrypt(TCC_de, k_de).toString(CryptoJS.enc.Utf8);
  console.log('ccc_de',ccc_de);
  keyrsade.setPrivateKey(data);
  var hash2 = keyrsade.decrypt(ccc_de);
  console.log("post-hash");
  var array2 = {
    llave : data,
    hash_cifrado : ccc_de
  }
  fetch("/links/descifrar", {method: 'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(array2)}).then(response => response.json()).then(data =>{
    console.log('hash',hash);
    console.log('hash2',data);

    if(hash == data){
      console.log('si son iguales ya quedo eso');
      document.getElementById("score").innerHTML = "No fue alterado";
      $('#exampleModalCenter').modal('show');
      $('#nota').summernote('code',txt);
    }else{
      console.log('no son iguales ):');
      document.getElementById("score").innerHTML = "Fue alterado";
      $('#exampleModalCenter').modal('show');
    }

    
  });
}
});
  }
  
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
  div.className = 'd-flex justify-content-center';
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.className = 'p-1';
  p.innerText = message.username;
  p.innerHTML += ` <span>${message.time}</span> `;
  div.appendChild(p);
  const para = document.createElement('p');
  para.className = 'p-1';
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
    li.className = 'list-group-item';
    li.innerText = user.username;
    userList.appendChild(li);
  });
 }

 
 console.log('fileeeeeee',file);
 
