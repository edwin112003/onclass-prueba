
const express = require('express');
const router = express.Router();
const pool = require('../database');
const passport = require('passport');
const {isLoggedIn}= require('../lib/auth'); 

var cloudinary = require('cloudinary').v2;
//buenas

cloudinary.config({ 
    cloud_name: 'dgvhkv4ng', 
    api_key: '442196388442844', 
    api_secret: 'AA0SdOf7vslkTGBAK1xaefXei18' 
  });

router.get('/index', (req,res)=>{
    res.render('links/index');
});
//Login


router.get('/login', (req,res)=>{
    res.render('links/login', {layout: 'login'}); 
});
router.post('/login', (req,res,next)=>{
    console.log('estoy aqui');
    passport.authenticate('local.login',{        
        successRedirect: '/links/Horario',
        failureRedirect: '/links/login',
        failureFlash: true
    })(req,res,next);
});

//login final 

//cerrar sesion
router.get('/logout', (req,res)=>{
    req.logOut();
    res.redirect('/links/login');
});
//cerrar sesion final

//rutas del chat
router.get('/chat', isLoggedIn, (req,res)=>{
    console.log('chat:',  req.params);
    console.log('chat:',  req.body);
    res.render('links/chat', {layout: 'login'});
});
router.get('/chat_menu', isLoggedIn, async (req,res)=>{
    const contactos = await pool.query('call GetCont (?)',req.app.locals.user.id_usuario);
    
    contactos.pop();
    console.log(contactos[0]); 
    res.render('links/chat_menu', {layout : 'login', usuarios: contactos[0]});
});
router.post('/chat_menu', isLoggedIn, (req,res)=>{
    console.log('bodu:', req.body) ;
    const {username,room} = req.body;     
    const newlink = {
        username,
        room
        };
    console.log(newlink.room);
    res.render('links/chat', {layout: 'login',newlink : newlink.room});
});
//rutas del chat final    
router.get('/index_login',isLoggedIn, (req,res)=>{
    res.render('links/index_login'); 
});
router.get('/registro', (req,res)=>{
    res.render('links/registro', {layout: 'login'}); 
}); 
router.get('/clase_resto_dia', isLoggedIn,(req,res)=>{
    res.render('links/clase_resto_dia'); 
}); 
router.get('/Horario', isLoggedIn, async (req,res)=>{
    const clase = await pool.query("call GetClas (?)", req.app.locals.user.id_usuario);
    clase.pop();
    console.log("Vamos a crear el horario", clase[0][0]);
    res.render('links/Horario', {clases: clase[0][0]}); 
});
router.get('/contactos',isLoggedIn, (req,res)=>{
    res.render('links/contactos'); 
});
router.get('/clase_proyecto',isLoggedIn, (req,res)=>{
    res.render('links/clase_proyecto'); 
});

router.get('/perfil', isLoggedIn,async (req,res)=>{

    const contactos = await pool.query('call GetCont (?)',req.app.locals.user.id_usuario);
    contactos.pop();
    console.log(contactos);

    console.log('pepepepepepe',contactos[0]);

    res.render('links/perfil', {layout: 'login',usuarios: contactos[0]}); 
});

router.get('/editar_perfil/:id',isLoggedIn, async (req,res)=>{
    const {id} = req.params;
    console.log(id);
    const perfil = await pool.query('select * from E_Usuario where id_usuario = ?',[id]);
    res.render('links/editar_perfil', {perfil: perfil[0]});
});

router.post('/editar_perfil/:id',isLoggedIn, async (req,res)=>{
    const {id} = req.params;
    console.log('asdasdasdasdasdasdasdasdasdadsasdasd');

    const {usertag, contra, correo_usuario, nombre_usuario} = req.body;     
    const newlink = {
        usertag,
        contra,
        correo_usuario,
        nombre_usuario
    };
    console.log(newlink);

    await pool.query('call EditUsu(?,?,?,?,?)',
    [id,
     newlink.usertag, 
     newlink.contra,
     newlink.correo_usuario,
     newlink.nombre_usuario,
     newlink.llave_usuario,]);
    res.redirect('/links/perfil'); 
});




router.get('/material_clase',isLoggedIn, (req,res)=>{
    res.render('links/material_clase'); 
});
router.get('/pendientes', isLoggedIn,(req,res)=>{
    res.render('links/pendientes', {layout: 'login'});
});
router.get('/clase_notas', isLoggedIn,(req,res)=>{
    res.render('links/clase_notas'); 
});
router.get('/clase_tomar_nota',isLoggedIn, (req,res)=>{
    res.render('links/clase_tomar_nota', {layout: 'login'}); 
});
router.get('/clase_mensajes',isLoggedIn, (req,res)=>{
    res.render('links/clase_mensajes'); 
});
router.get('/clase_pendiente', isLoggedIn,(req,res)=>{
    res.render('links/clase_pendiente'); 
});
router.get('/proyecto', isLoggedIn,(req,res)=>{
    res.render('links/proyecto'); 
});
router.get('/editar_horario', isLoggedIn, async (req,res)=>{  
    const clase = await pool.query("call GetClas (?)", req.app.locals.user.id_usuario);
    clase.pop();
    res.render('links/editar_horario', {clases: clase[0]}); 
});
router.post('/editar_horario/:id', isLoggedIn, async (req,res)=>{  
    const id = req.params;  
    
        let {nombre, dia, horai, horat} = req.body;
        let clase ={
            nombre,
            dia,
            horai,
            horat
        };        
        clase.dia=parseInt(clase.dia);
        clase.horai=parseInt(clase.horai);
        clase.horat=parseInt(clase.horat);
       await pool.query("call SaveClas (?, ?, ?, ?, ?)", [clase.nombre, clase.dia, clase.horai, clase.horat, id.id]);        
        res.redirect('/links/editar_horario'); 
});
router.post('/editar_clase', isLoggedIn, async (req, res)=>{
    
    let {dia, horai, id} = req.body;
        let clase = {
            dia,
            horai,
            id
        };
        clase.dia=parseInt(clase.dia);
        clase.horai=parseInt(clase.horai);
        clase.id=parseInt(clase.id);
        const editar_clase = await pool.query('call GetClasHora (?, ?, ?)', [clase.dia, clase.horai, clase.id]);            
            editar_clase.pop();
            console.log(editar_clase[0]);
            let obj = editar_clase[0][0];
            console.log(obj);
    res.render('links/editar_clase', {obj});
});
router.post('/update_clase/:id', isLoggedIn, async(req,res)=>{
    const params = req.params;
    const {nombre, dia, horai, horat} = req.body;
    const new_clase = {
        nombre,
        dia,
        horai,
        horat
    };    
    params.id = parseInt(params.id);
    new_clase.dia=parseInt(new_clase.dia);
    new_clase.horai=parseInt(new_clase.horai);
    new_clase.horat=parseInt(new_clase.horat);
    await pool.query('call EditClas (?, ?, ?, ?, ?)', [params.id, new_clase.nombre, new_clase.dia, new_clase.horai, new_clase.horat]);
    res.redirect('/links/editar_horario');
});
router.post('/delete_clase', isLoggedIn, async(req, res)=>{
    let id = req.body.id;
    id= parseInt(id);
    console.log(id);
    await pool.query('call DelClas (?)', [id]);
    res.redirect('/links/editar_horario');
});

router.get('/ver', isLoggedIn,async (req,res)=>{
    const clase = await pool.query('call GetCont(?)',11);
    clase.pop();
    res.render('links/ver', {usuarios: clase[0]});
});
router.get('/mostrar_cosas', isLoggedIn,async (req,res)=>{
    const e_usuario = await pool.query('select * from E_Usuario');
    res.render('links/mostrar_cosas', {e_usuario});

    
});
router.post('/registro', async (req,res)=>{
    const {usertag, contra, correo_usuario, nombre_usuario, llave_usuario} = req.body;     
    const newlink = {
        usertag,
        contra,
        correo_usuario,
        nombre_usuario,
        llave_usuario
    };
    console.log(newlink);
    await pool.query('call SaveUsu(? ,? ,? ,? ,?)',[newlink.usertag, newlink.contra, newlink.correo_usuario, newlink.nombre_usuario, newlink.llave_usuario]);
    res.redirect('/links/login');
});
/*Req para subir pdf*/
    var url_mysql = "";
    var response ='';
router.post("/save_pdf",isLoggedIn,async(req,res)=>{
await cloudinary.uploader.upload("data:image/png;base64,"+req.body.pdf,{format:'jpg', public_id: req.body.nombre}, function(error, result) { response = result;});
res.json({ url: response.url }); 
});
router.post("/save_nota",isLoggedIn,(req,res)=>{
    req.app.locals.nota = req.body.nota;
    console.log("buenas", req.app.locals.nota);
    res.json({tag: req.app.locals.user.usertag});
    });
/*Esta es la url que se va a meter a la basede datos*/
url_mysql = response.url;

router.get('/agregar_contacto',isLoggedIn, (req,res)=>{
    res.render('links/agregar_contacto');
});
router.post('/agregar_contacto',isLoggedIn, async (req,res)=>{
    const {id_contacto} = req.body;     
    const newlink = {
        id_contacto
    };
    await pool.query('call SaveCont(? ,?)',[req.app.locals.user.id_usuario,newlink.id_contacto]);
    res.redirect('/links/perfil');
});
router.get('/eliminar_contacto/:id',isLoggedIn, async (req,res)=>{
    const id_contacto = req.params;
    console.log(id_contacto);
    await pool.query('call DelCont(?,?)',[req.app.locals.user.id_usuario,id_contacto.id]);
    res.redirect('/links/perfil');  
});
module.exports = router;
