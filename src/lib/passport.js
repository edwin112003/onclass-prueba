const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const pool = require('../database');
const NodeRSA = require('node-rsa');

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

        //generar llaves
        const key = new NodeRSA().generateKeyPair();
        const llavepublica = key.exportKey("public");
        const llaveprivada = key.exportKey("private");
        console.log('pu',llavepublica);
        console.log('pri',llaveprivada);
        let m_encr =key.encryptPrivate('buenas');
        let m_d = key.decryptPublic(m_encr);
        let mensaje = m_d.toString();
        //generar llaves


        
        if(password == user.pass_usuario){
            const clases = await pool.query("call GetClas (?)", [user.id_usuario]);
            clases.pop();
            await pool.query("call SaveKey(?,?)",[user.id_usuario, llavepublica]);
            const clas = clases[0];            
            done(null, user, req.flash('success', 'Buenas ' +user.nombre_usuario));
            
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
