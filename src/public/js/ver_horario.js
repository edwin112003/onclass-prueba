fetch("/links/Horario", {method: 'POST'}).then(response=>response.json()).then(data=>{
    console.log(data);
    
    for(var i=0; i<data.length; i++){
        console.log("Nombre Clase: ",data[i].nombre_clase);
        console.log("Dia: ", data[i].desc_dia);
        console.log("Hora de inicio: ", data[i].horai_clase);
        console.log("Hora de termino: ", data[i].horat_clase);
        var columnas = 0;             
        var clase = data[i+1].horai_clase;
        console.log(typeof(clase));
        console.log("aAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",data[i+1].horai_clase);
        if(data[i].horai_clase < data[i+1].horai_clase){
            columnas++;
        }      
              
    }
    console.log("Numero de columnas: ",columnas);
});

/*
ya tienes el objeto mamon
esta dentro de un array
revisa primero como entrar a cada parametro del objeto para poder jugar con los datos

mi idea de momento del horario va a ser dependiendo del dia y de la hora de inicio de clase
dependiendo de estos es como los vas a acomodar en la tabla

pero primero seria bueno crear la tabla, quizas buscando la clase mas tarde y temprana 
siempre ira de lunes a domingo asi que el tamaño solo sera de arriba hacia abajo

Hechale gans si puedes

*/