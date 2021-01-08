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


//errores
/*if(app.get('env') === 'development') { 
  console.log("Estamos1");
  app.use(function(err, req, res, next) { 
    console.log("Estamos2");
    res.status(err.status ); 
    console.log("Estamos3");
    res.render('error', { 
      message: err.message, 
      error: err }); 
  }); 
  console.log("Estamos4");
}
console.log("Estamos5");
app.use(function(err, req, res, next) { 
  console.log("Estamos6");
  res.status(err.status );
  console.log("Estamos7"); 
  res.render('error', { 
    message: err.message, 
    error: {} }); 
}); 
console.log("Estamos8");*/
//socket


//globales

app.use((req,res,next)=>{
  app.locals.success = req.flash('success');
  app.locals.message = req.flash('message'); 

    app.locals.user = req.user;
    next();
});

//Manejo de errores

function error404(req, res, next){
  let error = new Error(),
      locals = {
          title: 'Error 404',
          description: 'Recurso no encontrado',
          error : error
      }
  error.status = 404;
  res.render('links/error_404', {layout: 'login', locals:locals});
  
}
//ruta
app.use(require('./routes'));
app.use('/links',require('./routes/links'));
const botName = 'Onclass bot';
io.on('connection', socket => {
    console.log('entrada de nuevo socket');
    socket.on('joinRoom', ({ username, room }) => {
      const user = userJoin(socket.id, username, room);
  
      socket.join(user.room);
  
      // Welcome current user
      socket.emit('message', formatMessage(botName, 'Bienvenido a tu chat!'));
  
      // Broadcast when a user connects
      socket.broadcast
        .to(user.room)
        .emit(
          'message',
          formatMessage(botName, `${user.username} se ha unido al chat :)`)
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
          formatMessage(botName, `${user.username} se ha ido del chat ):`)
        );
  
        // Send users and room info
        io.to(user.room).emit('roomUsers', {
          room: user.room,
          users: getRoomUsers(user.room)
        });
      }
    });
  });

  app.use(error404);
//archivos publicos

//inciar servidor
http.listen(app.get('port'), ()=>{
    console.log('Server en : ', app.get('port'));  
});

