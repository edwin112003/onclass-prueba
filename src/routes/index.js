const express = require('express');
const router = express.Router();


router.get('/', (req,res)=>{
    res.render('links/index',{layout: 'login'});
});


/*router.get('/', function(req, res, next) { 
    console.log("Estamos9");
    err = { 
        message: 'Example error message', 
        error: 'Some error'
    }; 
    console.log("Estamos10");
    if(err){
        console.log("Estamos11");
        next(err.message);
    }  
    if(!err){ 
        console.log("Estamos12");
        res.render('links/index', {layout: 'login' }); 
    } 
}); */

module.exports = router; 