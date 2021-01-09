const nodemailer = require('nodemailer');
const express = require('express');
const router = express.Router();
const pool = require('../database');
const passport = require('passport');
const {isLoggedIn, isNotLoggedIn}= require('../lib/auth'); 
const NodeRSA = require('node-rsa');
const crypto =require('crypto');
const hash = crypto.createHash('sha256'); 
var cloudinary = require('cloudinary').v2;
//buenas

cloudinary.config({ 
    cloud_name: 'dgvhkv4ng', 
    api_key: '442196388442844', 
    api_secret: 'AA0SdOf7vslkTGBAK1xaefXei18' 
  });

router.get('/index', isNotLoggedIn,(req,res)=>{
    res.render('links/index');
});

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
//login
router.get('/login',isNotLoggedIn, (req,res)=>{
    res.render('links/login', {layout: 'login'}); 
});
router.post('/login', (req,res,next)=>{
    passport.authenticate('local.login',{        
        successRedirect: '/links/Horario',
        failureRedirect: '/links/login',
        failureFlash: true
    })(req,res,next);
});

//login final 

//cerrar sesion
router.get('/logout', isLoggedIn,(req,res)=>{
    req.logOut();
    res.redirect('/links/login');
});
//cerrar sesion final

//rutas del chat
router.get('/chat', isLoggedIn, (req,res)=>{
    res.render('links/chat', {layout: 'login'});
});
router.get('/chat_menu', isLoggedIn, async (req,res)=>{
    const grupos = await pool.query('call GetT(?)',req.app.locals.user.id_usuario);
    grupos.pop();
    const contactos = await pool.query('call GetCont (?)',req.app.locals.user.id_usuario);
    
    contactos.pop();
    res.render('links/chat_menu', {layout : 'login', usuarios: contactos[0], grupos : grupos[0]});
});
router.post('/chat_menu', isLoggedIn, (req,res)=>{
    try {
        const {username,room} = req.body;     
    const newlink = {
        username,
        room
        };
    let sala_vista = newlink.room.split(':');
    let sala = sala_vista[0];
    let id_contacto = sala_vista[1];
    res.render('links/chat', {layout: 'login',newlink :sala,contacto : id_contacto});
    } catch (error) {
        req.flash('message', 'No tienes equipo, porque no creas uno');  
        res.redirect('/links/grupo');
    }
    
});

//rutas del chat final
router.get('/registro', (req,res)=>{
    res.render('links/registro', {layout: 'login'}); 
}); 
router.get('/clase_resto_dia', isLoggedIn,async(req,res)=>{
    try{   
        const fecha = new Date();
        let hora = fecha.getHours();
        for(let i=0; i<6; i++){
            hora = hora-1
            if(hora == 0){
                hora=24;
                hora++;
            }
        }   
        let dia = fecha.getDay();        
        let clase;
        let contador = 0;
        if(dia==0) dia=7;        
        const clase_actual = await pool.query('call GetClasDia (?,?)', [dia, req.app.locals.user.id_usuario]);
        clase_actual.pop();      
        clase_actual[0].forEach(async element=>{
            let h1 = element.horai_clase;
            let resta = element.horat_clase - element.horai_clase;
            for(let i =0; i<resta; i++){
                if(h1 == hora){
                    contador++;                    
                    nombre_clase = element.nombre_clase;
                    clase = element; 
                }
                h1 ++;
            }                     
        });
        if(contador == 1){    
            const resto_dia = await pool.query('call GetRestoDia(?,?,?)', [clase.horai_clase, req.app.locals.user.id_usuario, dia]);
            resto_dia.pop();
            throw res.render('links/clase_resto_dia', {clase: clase, resto: resto_dia[0]});            
        }else{            
            throw res.redirect('/links/Horario');
        }   
    }catch(error){
    }
}); 
router.get('/Horario', isLoggedIn, async (req,res)=>{
    const clase = await pool.query("call GetClas (?)", req.app.locals.user.id_usuario);
    clase.pop();
    const clas = clase[0];
    res.render('links/Horario', {clases: clas}); 
});
router.post('/llaves', isLoggedIn, async (req,res)=>{
    const key = new NodeRSA().generateKeyPair();
    const llavepublica = key.exportKey("public");
    const llaveprivada = key.exportKey("private"); 
    await pool.query("call SaveKey(?,?)",[req.app.locals.user.id_usuario, llavepublica]);
    res.json(llaveprivada);    
});
router.post('/llaves2', isLoggedIn, async (req,res)=>{
    let id = parseInt(req.body.id);
    const obtllaves= await pool.query("call GetKey(?)",[id]);
    obtllaves.pop();
    let llavepriv = obtllaves[0][0].llave_usuario;
    res.json(llavepriv);    
});
router.post('/descifrar', isLoggedIn, async (req,res)=>{
    
    const key = new NodeRSA();
    key.importKey(req.body.llave,'pkcs8-public');

    var hashnuevo = key.decryptPublic(req.body.hash_cifrado).toString();

    res.json(hashnuevo);    
});
router.post('/encriptar', isLoggedIn, async (req,res)=>{
    
    const key = new NodeRSA();
    key.importKey(req.body.llave_privada,'pkcs1');
    var hash_cifrado = key.encryptPrivate(req.body.hash,'base64');
     
    res.json(hash_cifrado);    
});
router.post('/Horario', isLoggedIn, async (req,res)=>{
    const clase = await pool.query("call GetClas (?)", req.app.locals.user.id_usuario);
    clase.pop();
    const clas = clase[0];
    res.json(clas);
    
});
router.get('/perfil', isLoggedIn,async (req,res)=>{

    const contactos = await pool.query('call GetCont (?)',req.app.locals.user.id_usuario);
    contactos.pop();
    res.render('links/perfil', {layout: 'login',usuarios: contactos[0]}); 
});
router.post('/vista_editar_perfil', isLoggedIn, async(req,res)=>{
    const {id} = req.body;
    const perfil = await pool.query('call GetUsu (?)',[id]);
    res.render('links/editar_perfil', {perfil: perfil[0][0]});
});
router.post('/editar_perfil',isLoggedIn, async (req,res)=>{
    const {id} = req.body;
    const {usertag, correo_usuario, nombre_usuario} = req.body;     
    const newlink = {
        usertag,
        correo_usuario,
        nombre_usuario
    };
    await pool.query('call EditUsu(?,?,?,?)',
    [id,
     newlink.usertag, 
     newlink.correo_usuario,
     newlink.nombre_usuario,
     newlink.llave_usuario,]);
    res.redirect('/links/perfil'); 
});

router.get('/material_clase',isLoggedIn, async (req,res)=>{
    try{   
        let fecha = new Date();
        let hora = fecha.getHours();
        for(let i=0; i<6; i++){
            hora = hora-1
            if(hora == 0){
                hora=24;
                hora++;
            }
        }      
        hora = 19;  
        let dia = fecha.getDay();
        let nombre_clase = '';
        let clase;
        let contador = 0;
        if(dia==0) dia=7;        
        const clase_actual = await pool.query('call GetClasDia (?,?)', [5, req.app.locals.user.id_usuario]);
        clase_actual.pop();
        console.log('clase actual',clase_actual[0]);      
        clase_actual[0].forEach(async element=>{
            let h1 = element.horai_clase;
            let resta = element.horat_clase - element.horai_clase;
            for(let i =0; i<resta; i++){
                if(h1 == hora){
                    console.log('contador antes del mas',contador);
                    contador++;
                    console.log('contador despues del mas',contador);                    
                    nombre_clase = element.nombre_clase;
                    clase = element;  
                }
                h1 ++;
            }                     
        });
        if(contador == 1){    
            const notas = await pool.query('call GetNotClas(?,?)', [req.app.locals.user.id_usuario, nombre_clase]);
            notas.pop();
            throw res.render('links/material_clase', {clase : clase, notas: notas[0]});
        }else{                
            req.flash('success', 'No tienes clase ahorita, tranqui tomate un descanso crack');        
            throw res.redirect('/links/Horario');
        }   
    }catch(error){
        
    }
});
router.get('/pendientes', isLoggedIn, async (req,res)=>{
    const clase = await pool.query("call GetClas (?)", req.app.locals.user.id_usuario);
    clase.pop();
    res.render('links/pendientes', {layout: 'login', clases: clase[0]});
});
router.post('/editar_pendiente_vista', isLoggedIn, async(req,res)=>{
    try {
        const {id, nombre, desc, clase, fecha} = req.body;
    const newlink = {
        id,
        nombre, 
        desc, 
        clase,
        fecha
    }
    const fecha_nueva = newlink.fecha.split('/');
    
    if(fecha_nueva[1]==undefined || fecha_nueva[2]==undefined){
        req.flash('message', 'Pon bien la fecha');
        throw res.redirect('/links/pendientes');
    }
    const fecha_base = `${fecha_nueva[2]}-${fecha_nueva[1]}-${fecha_nueva[0]}`;
    await pool.query('call EditPen (?, ?, ?, ?, ?)', [newlink.id, newlink.nombre, newlink.desc, newlink.clase, fecha_base]);
    throw res.redirect('/links/pendientes');
    } catch (error) { 
    }
});
router.post('/cambiar_estado_a_nt', isLoggedIn, async(req,res)=>{
    const {id_estado} = req.body;
    const newlink = {
        id_estado
    }
    await pool.query('call EditPenS(?,?)', [newlink.id_estado,false]);
    res.redirect('/links/terminados');
});
router.post('/cambiar_estado_a_t', isLoggedIn, async(req,res)=>{
    const {id_estado} = req.body;
    const newlink = {
        id_estado
    }
    await pool.query('call EditPenS(?,?)', [newlink.id_estado,true]);
    res.redirect('/links/no_terminados');
});
router.post('/pendientes',isLoggedIn, async (req,res)=>{
    try {
        const {nombre, descripcion, clase,fecha} = req.body;     
        const newlink = {
            nombre,
            descripcion,
            clase,
            fecha
        };
        if(newlink.nombre == ''){
            req.flash('message', 'Dale un nombre al pendiente');
            throw res.redirect('/links/pendientes');
        }
        if(newlink.descripcion == ''){
            req.flash('message', 'Dale una descripcion al pendiente');
            throw res.redirect('/links/pendientes');
        }
        if(newlink.fecha == ''){
            req.flash('message', 'Coloca una fecha porfa');
            throw res.redirect('/links/pendientes');
        }
        if(newlink.clase == 'Seleccione una clase'){
            req.flash('message', 'Selecciona una clase plocs');
            throw res.redirect('/links/pendientes');
        }
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
    } catch (error) {
        req.flash('message', 'Pon el formato de la fecha bien');
        res.redirect('/links/pendientes');
    }    
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
router.get('/clase_tomar_nota',isLoggedIn, async(req,res)=>{
    try{   
        const fecha = new Date();
        let hora = fecha.getHours();
        for(let i=0; i<6; i++){
            hora = hora-1
            if(hora == 0){
                hora=24;
                hora++;
            }
        }   
        let dia = fecha.getDay();
        let nombre_clase = '';
        let clase;
        let contador = 0;
        if(dia==0) dia=7;        
        const clase_actual = await pool.query('call GetClasDia (?,?)', [dia, req.app.locals.user.id_usuario]);
        clase_actual.pop();      
        clase_actual[0].forEach(async element=>{
            let h1 = element.horai_clase;
            let resta = element.horat_clase - element.horai_clase;
            for(let i =0; i<resta; i++){
                if(h1 == hora){
                    contador++;                    
                    nombre_clase = element.nombre_clase;
                    clase = element; 
                }
                h1 ++;
            }                     
        });
        if(contador == 1){    
            const notas = await pool.query('call GetNotClas(?,?)', [req.app.locals.user.id_usuario, nombre_clase]);
            notas.pop()
            throw res.render('links/clase_tomar_nota', {layout: 'login', clase: clase});
        }else{            
            throw res.redirect('/links/Horario');
        }   
    }catch(error){
    }
});
router.get('/clase_pendiente', isLoggedIn,async(req,res)=>{
    try{   
        const fecha = new Date();
        let hora = fecha.getHours();
        for(let i=0; i<6; i++){
            hora = hora-1
            if(hora == 0){
                hora=24;
                hora++;
            }
        }   
        let dia = fecha.getDay();
        let nombre_clase = '';
        let clase;
        let contador = 0;
        if(dia==0) dia=7;        
        const clase_actual = await pool.query('call GetClasDia (?,?)', [dia, req.app.locals.user.id_usuario]);
        clase_actual.pop();      
        clase_actual[0].forEach(async element=>{
            let h1 = element.horai_clase;
            let resta = element.horat_clase - element.horai_clase;
            for(let i =0; i<resta; i++){
                if(h1 == hora){
                    contador++;                    
                    nombre_clase = element.nombre_clase;
                    clase = element; 
                }
                h1 ++;
            }                     
        });
        if(contador == 1){    
            const pendientes = await pool.query('call GetPenClas (?,?)', [req.app.locals.user.id_usuario, nombre_clase]);
            pendientes.pop();
            for(let i=0; i<pendientes[0].length;i++){
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
            throw res.render('links/clase_pendiente', {clase: clase, pendientes: pendientes[0]}); 
            
        }else{            
            throw res.redirect('/links/Horario');
        }   
    }catch(error){
    }
});
router.get('/editar_horario', isLoggedIn, async (req,res)=>{  
    const clase = await pool.query("call GetClas (?)", req.app.locals.user.id_usuario);
    clase.pop();
    res.render('links/editar_horario', {clases: clase[0]}); 
});
router.post('/editar_horario/:id', isLoggedIn, async (req,res)=>{  
    try { 
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
        if(clase.nombre == ''){
            req.flash('message', 'Ponle un nombre a la clase');
            throw res.redirect('/links/editar_horario');
        }
        if(clase.horai == clase.horat){
            req.flash('message', 'La hora de inicio no puede ser igual a la hora final');
            throw res.redirect('/links/editar_horario');
        }
        if(clase.horai>clase.horat){
            req.flash('message', 'La hora de inicio no puede ser mayor a la hora final');
            throw res.redirect('/links/editar_horario');
        }
        const clases_dia = await pool.query("call GetDiaClas(?,?)",[req.app.locals.user.id_usuario, clase.dia] );
        clases_dia.pop();
        clases_dia[0].forEach(element => {
            let hi = element.horai_clase;
            let hi2 = clase.horai;
            const resta = element.horat_clase- element.horai_clase;
            const resta2 = clase.horat - clase.horai;
            for(let i =0; i<resta; i++){                
                hi2=clase.horai;
                for(let j = 0; j<resta2; j++){                       
                    if(hi2 == hi){
                        req.flash('message', 'No pueden haber dos o mas clases en el mismo horario');                                                
                        throw res.redirect('/links/editar_horario');
                    }
                    hi2++;
                } 
                hi ++;
            }
        });

        await pool.query("call SaveClas (?, ?, ?, ?, ?)", [clase.nombre, clase.dia, clase.horai, clase.horat, id.id]);        
        res.redirect('/links/editar_horario'); 

    } catch (error) {
        res.redirect('/links/editar_horario'); 
        console.log(error);
    }

       
});
router.post('/editar_clase', isLoggedIn, async (req, res)=>{
    try {
        let {dia, horai, id} = req.body;
        let clase = {
            dia,
            horai,
            id //usuario
        };
        clase.dia=parseInt(clase.dia);
        clase.horai=parseInt(clase.horai);
        clase.id=parseInt(clase.id);
        const editar_clase = await pool.query('call GetClasHora (?, ?, ?)', [clase.dia, clase.horai, clase.id]);            
        editar_clase.pop();
        let obj = editar_clase[0][0];
        if(obj.nombre_clase == undefined){       
            throw res.redirect('/links/editar_horario');
        }else{
            res.render('links/editar_clase', {obj});
        }
        
    } catch (error) {
        req.flash('message', 'Si vas a editar porfavor selecciona un dia y una hora de inicio');
        res.redirect('/links/editar_horario');
    }
    
});
router.post('/update_clase/:id', isLoggedIn, async(req,res)=>{
    try {
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
        if(new_clase.horai == new_clase.horat){
            req.flash('message', 'La hora de inicio no puede ser igual a la hora final');
            throw res.redirect('/links/editar_horario');
        }
        if(new_clase.horai>new_clase.horat){
            req.flash('message', 'La hora de inicio no puede ser mayor a la hora final');
            throw res.redirect('/links/editar_horario');
        }
        const clases_dia = await pool.query("call GetDiaClas(?,?)",[req.app.locals.user.id_usuario, new_clase.dia] );
        clases_dia.pop();

        clases_dia[0].forEach(element => {
            let hi = element.horai_clase;
            let hi2 = new_clase.horai;
            const resta = element.horat_clase- element.horai_clase;
            const resta2 = new_clase.horat - new_clase.horai;
            for(let i =0; i<resta; i++){                
                hi2=new_clase.horai;
                for(let j = 0; j<resta2; j++){        
                    if(hi2 == hi){
                        if(params.id != element.id_clase){
                            req.flash('message', 'No pueden haber dos o mas clases en el mismo horario');                                                
                            throw res.redirect('/links/editar_horario');                            
                        }
                        
                    }
                    hi2++;
                } 
                hi ++;
            }
        });
        await pool.query('call EditClas(?, ?, ?, ?, ?)', [params.id, new_clase.nombre, new_clase.dia, new_clase.horai, new_clase.horat]);
        res.redirect('/links/editar_horario');
    } catch (error) {
        console.log('errrroorororr',error);
        res.redirect('/links/editar_horario');
    }    
});
router.post('/delete_clase', isLoggedIn, async(req, res)=>{
    let id = req.body.id;
    id= parseInt(id);
    await pool.query('call DelClas (?)', [id]);
    res.redirect('/links/editar_horario');
});
router.post('/registro', isNotLoggedIn,async (req,res)=>{ 
    try {
    const {usertag, contra, correo_usuario, nombre_usuario} = req.body;   
    //aqui hice cambio para meter el for para identidifcar el repetido
    const allusers = await pool.query('call GetAllUsu');
    
    const newlink = {
        usertag,
        contra,
        correo_usuario,
        nombre_usuario
    };
    
        for (let i = 0; i < allusers[0].length; i++) {
      if(allusers[0][i].usertag == newlink.usertag){
        req.flash('message', 'Ese usuario ya existe');
         throw res.redirect('/links/registro');          
        }     
    }
    console.log('buenas reist');
    var crypto = require('crypto'); 
    var secret = 'abcdeg'; //make this your secret!! 
    var algorithm = 'sha256'; //consider using sha256 
    var hash, hmac;
    
    hmac = crypto.createHmac(algorithm, secret); 
    hmac.update(newlink.contra); 
    hash = hmac.digest('hex'); 
    console.log("contra cifrada con hash:", hash);
     await pool.query('call SaveUsu(? ,? ,? ,? ,?)',[newlink.usertag, hash, newlink.correo_usuario, newlink.nombre_usuario, null]);
     res.redirect('/links/login');

    } catch (error) {
        console.log(error);
    }
    
      
});

/*Req para subir pdf*/
    var url_mysql = "";
    var response ='';
router.post("/save_pdf",isLoggedIn,async(req,res)=>{
        if(req.app.locals.nota == ""){
            req.app.locals.nota = "No pusiste nada en tu nota crack. Atte: OnClass";
        }else{
            await cloudinary.uploader.upload("data:image/png;base64,"+req.body.pdf,{format:'jpg', public_id: req.body.nombre}, function(error, result) { response = result;});
            const url_repo = response.url;
            const nombre_nota = req.body.nombre;
            const id_usuario = req.app.locals.user.id_usuario;
            const clase = req.body.clase;
            await pool.query('call SaveNota (?,?,?,?)', [id_usuario, url_repo, nombre_nota, clase]);

            res.json({ url: response.url });
        }
    });
router.post("/save_nota",isLoggedIn,(req,res)=>{
        req.app.locals.nota = req.body.nota;
        res.json({tag: req.app.locals.user.usertag});
        });  
url_mysql = response.url;

router.get('/agregar_contacto',isLoggedIn, (req,res)=>{
    res.render('links/agregar_contacto');
});
router.post('/agregar_contacto',isLoggedIn, async (req,res)=>{
    try {
        let cont =0;
        const {id_contacto} = req.body;     
        const newlink = {
            id_contacto
        };
        const usuarios = await pool.query('call GetAllId');
        usuarios.pop();
        for(let i=0; i<usuarios[0].length; i++){
            if(usuarios[0][i].id_usuario == newlink.id_contacto){
                cont++;
                
            }
        }
        const contactos = await pool.query('call GetCont (?)', [req.app.locals.user.id_usuario]);
        contactos.pop();
        for(let i=0; i<contactos[0].length; i++){
            if(contactos[0][i].id_usuario == newlink.id_contacto){
                cont--;
            }
        }
        if(cont==1){
            await pool.query('call SaveCont(? ,?)',[req.app.locals.user.id_usuario,newlink.id_contacto]);
                throw res.redirect('/links/perfil');
        }else{
            throw res.redirect('/links/perfil');
        }
    } catch (error) {
        
    }
});
router.get('/eliminar_contacto/:id',isLoggedIn, async (req,res)=>{
    const id_contacto = req.params;
    await pool.query('call DelCont(?,?)',[req.app.locals.user.id_usuario,id_contacto.id]);
    res.redirect('/links/perfil');  
});
router.get('/grupo', isLoggedIn, async (req,res)=>{
    const grupos = await pool.query('call GetT(?)',req.app.locals.user.id_usuario);
    grupos.pop();
    const contactos = await pool.query('call GetCont (?)',req.app.locals.user.id_usuario);
    contactos.pop();

    res.render('links/grupo',{contactos : contactos[0], grupos: grupos[0]});
});
router.post('/grupo', isLoggedIn, async (req,res)=>{
    try {
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
    } catch (error) {
        res.redirect('/links/grupo');
    }
    
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
router.post('/agregar_tarea_integrante',isLoggedIn, async (req,res)=>{
    const {id_usuario,nombre_equipo} = req.body;
    const newLink = {
        id_usuario,
        nombre_equipo
    }
    res.render('links/agregar_tarea_equipo',{layout: 'login', datos: newLink});
});
router.post('/agregar_equipo_pendiente',isLoggedIn, async (req,res)=>{
    try {
        const {nombre, descripcion,nombre_equipo,id_integrante,fecha} = req.body;     
        const newlink = {
            nombre,
            descripcion,
            nombre_equipo,
            id_integrante,
            fecha
        };
        if(newlink.nombre == ''){
            req.flash('message', 'Dale un nombre al pendiente');
            throw res.redirect('/links/grupo');
        }
        if(newlink.descripcion == ''){
            req.flash('message', 'Dale una descripcion al pendiente');
            throw res.redirect('/links/grupo');
        }
        if(newlink.fecha == ''){
            req.flash('message', 'Coloca una fecha porfa');
            throw res.redirect('/links/grupo');
        }
        const fecha_nueva = newlink.fecha.split('/');
        const fecha_base = `${fecha_nueva[2]}-${fecha_nueva[1]}-${fecha_nueva[0]}`;
        await pool.query('call SavePen(?,?,?,?,?,?,?)',
        [newlink.nombre,
        newlink.descripcion, 
        2,
        false,
        newlink.id_integrante,
        newlink.nombre_equipo,
        fecha_base]);
        res.redirect('/links/grupo');
    } catch (error) {
        console.log(error);
        req.flash('message', 'El formato de la fecha es incorrecto');
        res.redirect('/links/grupo');
    }    
});
router.post('/agregar_integrante',isLoggedIn, async (req,res)=>{
    try {
        let cont =0;
        const {clave, nombre, id_nuevo_inte} = req.body;
        const newLink = {
            clave,
            nombre,
            id_nuevo_inte
        }
        const equipo = await pool.query('call GetUsuT (?)', [newLink.clave]);
        equipo.pop();
        for(let i=0; i<equipo[0].length; i++){
            if(equipo[0][i].id_usuario == newLink.id_nuevo_inte){
                req.flash('message', 'El usuario ya esta agregado');
                cont++;
            }
        }
        if(cont==0){
            await pool.query('call SaveInt(?,?,?)', [newLink.clave, newLink.id_nuevo_inte, newLink.nombre]);
            throw res.redirect('/links/grupo');
        }else{
            throw res.redirect('/links/grupo');
        }
        
    } catch (error) {
        
    }
});
router.post('/eliminar_equipo',isLoggedIn, async (req,res)=>{
    const {clave} = req.body;
    const newLink = {
        clave
    }
    await pool.query('call DelT(?)', [newLink.clave]);
    res.redirect('/links/grupo');
});
router.post('/eliminar_cuenta', isLoggedIn, async(req,res)=>{
    const {id} = req.body;
    const newLink = {
        id
    }
    await pool.query('call DelUsu(?)',[newLink.id]);
    req.logOut();
    res.redirect('/links/Horario');
});
router.get('/terminos_condiciones', (req,res)=>{
    res.render('links/terminos_condiciones', {layout:'login'});
});
router.post('/correo',(req,res)=>{
    contentHTML = 
    `<h1>Buenas la fecha de entrega de tu tarea esta cerca</h1>
    <ul>
        <li>Nombre de la tarea: `+req.body.nombre+`</li>
        <li>Fecha de entrega: `+req.body.fecha+`</li>
    </ul>`
    ;

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'savestudios@onclass.online',
            pass: 'paulaonclass'
        }
    });

    let info = transporter.sendMail({
        from: 'savestudios@onclass.online', // sender address,
        to: req.body.correo,
        subject: '¡SE ACABA EL TIEMPO!',
        html: contentHTML
    });
    req.flash('success', 'Correo enviado correctamente');
    res.redirect('/links/no_terminados')
});
router.use(error404);

module.exports = router;
