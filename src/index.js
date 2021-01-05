const express = require('express');
const path = require('path');
//buenas

const exphbs = require('express-handlebars');
const session = require('express-session');
const validator = require('express-validator');
const passport = require('passport');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser'); 
const formatMessage = require('./lib/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./lib/users');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const router = express.Router();

const { captureRejectionSymbol } = require('events');

require('./lib/passport');

//configurar el servidor
var port = process.env.PORT || 8080;
app.set('port', port);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
    defaultLayout : 'main',
    layout: 'login',
    layoutsDir: path.join(app.get('views'),'layouts'), 
    partialsDir: path.join(app.get('views'),'partials'),
    extname : '.hbs'
}));
app.set('view engine', '.hbs');


//Middlewares
app.use(session({
  secret: 'abcdefg',
  resave: true,
  saveUninitialized: false
}));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser()); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(passport.initialize());
app.use(passport.session());


//socket


//globales

app.use((req,res,next)=>{
  app.locals.success = req.flash('success');
  app.locals.message = req.flash('message'); 

    app.locals.user = req.user;
    next();
});

//ruta

app.use(require('./routes'));
app.use('/links',require('./routes/links'));
const botName = 'ChatCord Bot';
io.on('connection', socket => {
    console.log('entrada de nuevo socket');
    socket.on('joinRoom', ({ username, room }) => {
      const user = userJoin(socket.id, username, room);
  
      socket.join(user.room);
  
      // Welcome current user
      socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));
  
      // Broadcast when a user connects
      socket.broadcast
        .to(user.room)
        .emit(
          'message',
          formatMessage(botName, `${user.username} has joined the chat`)
        );
  
      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    });
  
    // Listen for chatMessage
    socket.on('chatMessage', msg => {
      const user = getCurrentUser(socket.id);
  
      io.to(user.room).emit('message', formatMessage(user.username, msg));
    });
    socket.on('fileMessage', msg => {
      const user = getCurrentUser(socket.id);
  
      io.to(user.room).emit('file', formatMessage(user.username, msg));
    });
  
    // Runs when client disconnects
    socket.on('disconnect', () => {
      const user = userLeave(socket.id);
  
      if (user) {
        io.to(user.room).emit(
          'message',
          formatMessage(botName, `${user.username} has left the chat`)
        );
  
        // Send users and room info
        io.to(user.room).emit('roomUsers', {
          room: user.room,
          users: getRoomUsers(user.room)
        });
      }
    });
  });
//archivos publicos

//inciar servidor
http.listen(app.get('port'), ()=>{
    console.log('Server en : ', app.get('port'));  
});

