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
        user.room = "";
        if(password == user.nombre_usuario){
            console.log('llega');
            console.log('ussser: ', user);
            const clases = await pool.query("call GetClas (?)", [user.id_usuario]);
            clases.pop();
            const clas = clases[0];
            
            done(null, user, null);
            
        }else{
            console.log('mal algo');
            done(null, false,null);
        }
    }
    else{
        console.log('mla usuario')
        done(null, false, null);
    }
}));

passport.serializeUser((user,done)=>{
    done(null, user.id_usuario);
});
passport.deserializeUser(async (id,done)=>{
    const rows = await pool.query('select * from e_usuario where id_usuario = ?', [id]);
    const user = rows[0];
    user.nota = "";
    user.room = "";
    done(null, user);
});
