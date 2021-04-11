const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const pool = require('../database');


passport.use('local.login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done)=>{
    const rows = await pool.query('select * from e_usuario where usertag = ?', [username]);
    if(rows.length > 0){
        //notaaa para ellogin use nombre de usuario como contraseña porque no me deja por la ñ
        const user = rows[0];
        user.nota = "";
        var crypto = require('crypto');  
        var text  = 'I love cupcakes'; 
        var secret = 'abcdeg'; //make this your secret!! 
        var algorithm = 'sha256'; //consider using sha256 
        var hash, hmac;
        
        hmac = crypto.createHmac(algorithm, secret); 
        hmac.update(password); 
        hash = hmac.digest('hex'); 
        console.log("contra cifrada con hash: 222222", hash);

        if(user.pass_usuario == hash){
            const clases = await pool.query("call GetClas (?)", [user.id_usuario]);
            clases.pop();
            
            const clas = clases[0];            
            done(null, user, req.flash('success', 'Bienvenido ' +user.nombre_usuario));
            
        }else{
            done(null, false,req.flash('message', 'Contraseña incorrecta'));
        }
    }
    else{
        done(null, false,req.flash('message', 'Usuario incorrecto'));
    }
}));

passport.serializeUser((user,done)=>{
    done(null, user.id_usuario);
});
passport.deserializeUser(async (id,done)=>{
    const rows = await pool.query('select * from e_usuario where id_usuario = ?', [id]);
    const user = rows[0];
    user.room = "";
    done(null, user);
});
