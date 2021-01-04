
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
    const grupos = await pool.query('call GetT(?)',req.app.locals.user.id_usuario);
    grupos.pop();
    const contactos = await pool.query('call GetCont (?)',req.app.locals.user.id_usuario);
    
    contactos.pop();
    console.log(contactos[0]); 
    res.render('links/chat_menu', {layout : 'login', usuarios: contactos[0], grupos : grupos[0]});
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
router.get('/clase_resto_dia', isLoggedIn,async(req,res)=>{
    const fecha = new Date();
    const hora = fecha.getHours();
    let dia = fecha.getDay();
    if(dia==0){
        dia=7;
    }
    const clase_actual = await pool.query('call GetClasHora (?,?,?)', [dia, hora, req.app.locals.user.id_usuario]);
    clase_actual.pop();
    res.render('links/clase_resto_dia', {clase: clase_actual[0][0]}); 
}); 
router.get('/Horario', isLoggedIn, async (req,res)=>{
    const fecha = new Date();
    const hora = fecha.getHours();
    let dia = fecha.getDay();
    if(dia==0){
        dia=7;
    }
    const clase_actual = await pool.query('call GetClasHora (?,?,?)', [dia, hora, req.app.locals.user.id_usuario]);
    clase_actual.pop();
    console.log(clase_actual);
    const clase = await pool.query("call GetClas (?)", req.app.locals.user.id_usuario);
    clase.pop();
    const clas = clase[0];
    
    res.render('links/Horario', {clases: clas}); 
});
router.post('/Horario',  async (req,res)=>{
    const clase = await pool.query("call GetClas (?)", req.app.locals.user.id_usuario);
    clase.pop();
    const clas = clase[0];
    res.json(clas);
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




router.get('/material_clase',isLoggedIn, async(req,res)=>{
    const fecha = new Date();
    const hora = fecha.getHours();
    let dia = fecha.getDay();
    if(dia==0){
        dia=7;
    }
    const clase_actual = await pool.query('call GetClasHora (?,?,?)', [dia, hora, req.app.locals.user.id_usuario]);
    clase_actual.pop();
    const nombre_clase = clase_actual[0][0].nombre_clase;
    const notas_clase = await pool.query('call GetNotClas (?,?)', [req.app.locals.user.id_usuario, nombre_clase]);
    notas_clase.pop();
    res.render('links/material_clase', {clase : clase_actual[0][0], notas: notas_clase[0]}); 
});
router.get('/pendientes', isLoggedIn, async (req,res)=>{
    const clase = await pool.query("call GetClas (?)", req.app.locals.user.id_usuario);
    clase.pop();
   
    res.render('links/pendientes', {layout: 'login', clases: clase[0]});
});
router.post('/editar_pendiente_vista', isLoggedIn, async(req,res)=>{
    console.log(req.body);
    const {id, nombre, desc, clase, fecha} = req.body;
    const newlink = {
        id,
        nombre, 
        desc, 
        clase,
        fecha
    }
    const fecha_nueva = newlink.fecha.split('/');
    const fecha_base = `${fecha_nueva[2]}-${fecha_nueva[1]}-${fecha_nueva[0]}`;

    await pool.query('call EditPen (?, ?, ?, ?, ?)', [newlink.id, newlink.nombre, newlink.desc, newlink.clase, fecha_base]);
    res.redirect('/links/pendientes');
});
router.post('/cambiar_estado_a_nt', isLoggedIn, async(req,res)=>{
    console.log('llega a nt');
    const {id_estado} = req.body;
    const newlink = {
        id_estado
    }
    console.log(newlink);
    await pool.query('call EditPenS(?,?)', [newlink.id_estado,false]);
    res.redirect('/links/terminados');
});
router.post('/cambiar_estado_a_t', isLoggedIn, async(req,res)=>{
    console.log('llega a nt');
    const {id_estado} = req.body;
    const newlink = {
        id_estado
    }
    console.log(newlink);
    await pool.query('call EditPenS(?,?)', [newlink.id_estado,true]);
    res.redirect('/links/no_terminados');
});
router.post('/pendientes',isLoggedIn, async (req,res)=>{
    const {nombre, descripcion, clase,fecha} = req.body;     
    const newlink = {
        nombre,
        descripcion,
        clase,
        fecha
    };
    const fecha_nueva = newlink.fecha.split('/');
    const fecha_base = `${fecha_nueva[2]}-${fecha_nueva[1]}-${fecha_nueva[0]}`;


    await pool.query('call SavePen(?,?,?,?,?,?,?)',
    [newlink.nombre,
     newlink.descripcion, 
     1,
     false,
     req.app.locals.user.id_usuario,
     newlink.clase,
     fecha_base]);

    res.redirect('/links/pendientes');
});
router.get('/no_terminados', isLoggedIn, async (req,res)=>{
    const clase = await pool.query("call GetClas (?)", req.app.locals.user.id_usuario);
    clase.pop();
    const pendientes = await pool.query("call GetPenNT(?)", req.app.locals.user.id_usuario);
    pendientes.pop();
   for(let i =0; i<pendientes[0].length;i++){
       let fecha_sint = pendientes[0][i].fecha_entrega.toString();
       let fecha_media =  fecha_sint.split(' ');
       let fecha_muestra = `${fecha_media[2]}-${fecha_media[1]}-${fecha_media[3]}`;
        
        let estado = pendientes[0][i].estado_pendiente;
        if(estado == 0){
            let estado2 = pendientes[0][i].estado_pendiente.toString();
            estado2 = 'Sin terminar';
            pendientes[0][i].estado_pendiente = estado2;
        }else{
            pendientes[0][i].estado_pendiente = 'Terminado';
        }

       pendientes[0][i].fecha_entrega = fecha_muestra;
   }
   
    res.render('links/no_terminados', {layout: 'login', clases: clase[0], pendientes : pendientes[0]});
});
router.get('/terminados', isLoggedIn, async (req,res)=>{
    const clase = await pool.query("call GetClas (?)", req.app.locals.user.id_usuario);
    clase.pop();
    const pendientes = await pool.query("call GetPenT(?)", req.app.locals.user.id_usuario);
    pendientes.pop();
   for(let i =0; i<pendientes[0].length;i++){
       let fecha_sint = pendientes[0][i].fecha_entrega.toString();
       let fecha_media =  fecha_sint.split(' ');
       let fecha_muestra = `${fecha_media[2]}-${fecha_media[1]}-${fecha_media[3]}`;
        
        let estado = pendientes[0][i].estado_pendiente;
        if(estado == 0){
            let estado2 = pendientes[0][i].estado_pendiente.toString(); 
            estado2 = 'Sin terminar';
            pendientes[0][i].estado_pendiente = estado2;
        }else{
            pendientes[0][i].estado_pendiente = 'Terminado';
        }

       pendientes[0][i].fecha_entrega = fecha_muestra;
   }
   
    res.render('links/terminados', {layout: 'login', clases: clase[0], pendientes : pendientes[0]});
});

router.post('/editar_pendiente',isLoggedIn, async (req,res)=>{
    const {id} = req.body;     
    const newlink = {
        id
    };
    console.log('estamos aqui',newlink.id);

    const pendiente = await pool.query('call GetPenId(?)',
    [newlink.id]);
    pendiente.pop();
    const clase = await pool.query("call GetClas (?)", req.app.locals.user.id_usuario);
    clase.pop();
    let fecha_valor =pendiente[0][0].fecha_entrega; 
    let fecha_sint = pendiente[0][0].fecha_entrega.toString();
    let fecha_media =  fecha_sint.split(' ');
    let fecha_muestra = `${fecha_media[2]}-${fecha_media[1]}-${fecha_media[3]}`;
    

    res.render('links/editar_pendiente',{pendiente: pendiente[0],fecha_muestra,fecha_valor, clases: clase[0]});
});

router.get('/pendientes_grupo', isLoggedIn, async (req,res)=>{
    
    res.render('links/pendientes_grupo', {layout: 'login'});
});
router.get('/clase_notas', isLoggedIn,(req,res)=>{
    res.render('links/clase_notas'); 
});
router.get('/clase_tomar_nota',isLoggedIn, async(req,res)=>{
    const fecha = new Date();
    const hora = fecha.getHours();
    let dia = fecha.getDay();
    if(dia==0){
        dia=7;
    }
    const clase_actual = await pool.query('call GetClasHora (?,?,?)', [dia, hora, req.app.locals.user.id_usuario]);
    clase_actual.pop();
    res.render('links/clase_tomar_nota', {layout: 'login', clase: clase_actual[0][0]}); 
});
router.get('/clase_mensajes',isLoggedIn, (req,res)=>{
    res.render('links/clase_mensajes'); 
});
router.get('/clase_pendiente', isLoggedIn,async(req,res)=>{
    const fecha = new Date();
    const hora = fecha.getHours();
    let dia = fecha.getDay();
    if(dia==0){
        dia=7;
    }
    const clase_actual = await pool.query('call GetClasHora (?,?,?)', [dia, hora, req.app.locals.user.id_usuario]);
    clase_actual.pop();
    const nombre_clase = clase_actual[0][0].nombre_clase;
    const pendientes = await pool.query('call GetPenClas (?,?)', [req.app.locals.user.id_usuario, nombre_clase]);
    pendientes.pop();
    for(let i=0; i<pendientes[0].length;i++){
        let estado = pendientes[0][i].estado_pendiente;
        if(estado == 0){
            let estado2 = pendientes[0][i].estado_pendiente.toString();
            estado2 = 'Sin terminar';
            pendientes[0][i].estado_pendiente = estado2;
        }else{
            pendientes[0][i].estado_pendiente = 'Terminado';
        }
    }    
    res.render('links/clase_pendiente', {clase: clase_actual[0][0], pendientes: pendientes[0]}); 
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
console.log('URL repo: ',response.url);
console.log('Nombre nota: ', req.body.nombre);
console.log('ID usuario: ',req.app.locals.user.id_usuario);
console.log('Nombre clase: ', req.body.clase);
const url_repo = response.url;
const nombre_nota = req.body.nombre;
const id_usuario = req.app.locals.user.id_usuario;
const clase = req.body.clase;
await pool.query('call SaveNota (?,?,?,?)', [id_usuario, url_repo, nombre_nota, clase]);

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
router.get('/grupo', isLoggedIn, async (req,res)=>{
    const grupos = await pool.query('call GetT(?)',req.app.locals.user.id_usuario);
    grupos.pop();
    const contactos = await pool.query('call GetCont (?)',req.app.locals.user.id_usuario);
    contactos.pop();

    console.log(grupos);
    res.render('links/grupo',{contactos : contactos[0], grupos: grupos[0]});
});
router.post('/grupo', isLoggedIn, async (req,res)=>{
    const {nombre, check_usuarios} = req.body;
    const newLink= {
        nombre,
        check_usuarios
    } 
    check_usuarios.push(req.app.locals.user.id_usuario); 
    const ultimo = await pool.query('call Ult()');
    ultimo.pop();
    
    for(let i=0; i<newLink.check_usuarios.length; i++){
        await pool.query('call SaveT(?,?,?)',[ultimo[0][0].id_registroE,newLink.check_usuarios[i],newLink.nombre]);
    }
    res.redirect('/links/grupo');
});

router.post('/detalle_grupo',isLoggedIn, async (req,res)=>{
    const {id, nombre} = req.body;
    const newLink = {
        id,
        nombre
    }
    const integrantes = await pool.query('call GetUsuT(?)',[newLink.id]);

    const contactos = await pool.query('call GetCont (?)',req.app.locals.user.id_usuario);
    contactos.pop();
    res.render('links/detalle_grupo', {integrantes : integrantes[0], nombres: newLink,contactos : contactos[0]});
});
router.post('/eliminar_integrante',isLoggedIn, async (req,res)=>{
    const {id_usuario, clave} = req.body;
    const newLink = {
        id_usuario,
        clave
    }
    await pool.query('call DelUsuT(?,?)',[newLink.clave, newLink.id_usuario]);

    res.redirect('/links/grupo');
});
router.post('/agregar_integrante',isLoggedIn, async (req,res)=>{
    const {clave, nombre, id_nuevo_inte} = req.body;
    const newLink = {
        clave,
        nombre,
        id_nuevo_inte
    }
    await pool.query('call SaveInt(?,?,?)', [newLink.clave, newLink.id_nuevo_inte, newLink.nombre]);
    res.redirect('/links/grupo');
});
router.post('/eliminar_equipo',isLoggedIn, async (req,res)=>{
    const {clave} = req.body;
    const newLink = {
        clave
    }
    await pool.query('call DelT(?)', [newLink.clave]);
    res.redirect('/links/grupo');
});
module.exports = router;
