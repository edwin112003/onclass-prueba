fetch("/links/Horario", {method: 'POST'}).then(response=>response.json()).then(data=>{
    console.log(data);
    let hora_final =0;
    let hora_inicio =0;
    let columnas = 0;
    let contador =0;
    
    for(let i=0; i<data.length; i++){

        let inicio_clase0 = data[i].horat_clase;
        console.log('hora0:',inicio_clase0); 

        if(hora_final<inicio_clase0){
            hora_final= inicio_clase0
            
        }
        if(hora_final>inicio_clase0){
            hora_final = hora_final;
        }     
    }
    for(let i=0; i<data.length; i++){

        let inicio_clase0 = data[i].horai_clase;

        console.log('hora0:',inicio_clase0); 

        if(hora_inicio == 0){
            hora_inicio = inicio_clase0;
        }else if(hora_inicio>inicio_clase0){
            hora_inicio= inicio_clase0
            
        }
        if(hora_inicio<inicio_clase0){
            hora_inicio = hora_inicio;
        }     
    }
    console.log("numero grande: ",hora_final);
    console.log("numero pequeño: ",hora_inicio);
    columnas = hora_final-hora_inicio;
    console.log('numero de columnas :', columnas);

        while(contador!=columnas){            
            let columna = document.createElement('tr'); 
            columna.setAttribute('id',`${hora_inicio}`);
            let relleno_horas = document.createElement('th');
            relleno_horas.appendChild(document.createTextNode(`${hora_inicio}:00-${hora_inicio+1}:00`));
            columna.appendChild(relleno_horas);   
        for(let j =0; j<7; j++){
            console.log('valor de j', j);
            let relleno = document.createElement('td');
            relleno.setAttribute('id',`${hora_inicio}${j+1}`);
            relleno.setAttribute('value',`${hora_inicio}${j+1}`);
            columna.appendChild(relleno);
        }
        document.getElementById("tbody").appendChild(columna);
        console.log(contador);
        contador++;
        hora_inicio++;
        }

    for(let i=0; i<data.length; i++){
        let dia_clase = data[i].desc_dia;
        let hora1_clase = data[i].horai_clase;
        let horat_clase = data[i].horat_clase;
        let conjunto = "";
        let diferencia = horat_clase - hora1_clase;
        
        switch(dia_clase){
            case "Lunes" :
                dia_clase = "1";

                for(let j = 0; j<diferencia;j++){
                    conjunto = `${hora1_clase+j}`+`${dia_clase}`;
                    console.log('conjunto: ',conjunto);
                    document.getElementById(conjunto).appendChild(document.createTextNode(`${data[i].nombre_clase}`));
                }                
                break;
            
            case "Martes" :
                    dia_clase = "2";
                    for(let j = 0; j<diferencia;j++){
                        conjunto = `${hora1_clase+j}`+`${dia_clase}`;
                        console.log('conjunto: ',conjunto);
                        document.getElementById(conjunto).appendChild(document.createTextNode(`${data[i].nombre_clase}`));
                    } 
                    break;
            case "Miercoles" :
                dia_clase = "3";
                for(let j = 0; j<diferencia;j++){
                    conjunto = `${hora1_clase+j}`+`${dia_clase}`;
                    console.log('conjunto: ',conjunto);
                    document.getElementById(conjunto).appendChild(document.createTextNode(`${data[i].nombre_clase}`));
                } 
                break;
            case "Jueves" :
                dia_clase = "4";
                for(let j = 0; j<diferencia;j++){
                    conjunto = `${hora1_clase+j}`+`${dia_clase}`;
                    console.log('conjunto: ',conjunto);
                    document.getElementById(conjunto).appendChild(document.createTextNode(`${data[i].nombre_clase}`));
                } 
                break;
            case "Viernes" :
                dia_clase = "5";
                for(let j = 0; j<diferencia;j++){
                    conjunto = `${hora1_clase+j}`+`${dia_clase}`;
                    console.log('conjunto: ',conjunto);
                    document.getElementById(conjunto).appendChild(document.createTextNode(`${data[i].nombre_clase}`));
                } 
                break;
            case "Sabado" :
                dia_clase = "6";
                for(let j = 0; j<diferencia;j++){
                    conjunto = `${hora1_clase+j}`+`${dia_clase}`;
                    console.log('conjunto: ',conjunto);
                    document.getElementById(conjunto).appendChild(document.createTextNode(`${data[i].nombre_clase}`));
                } 
                break;
            case "Domingo" :
                dia_clase = "7";
                for(let j = 0; j<diferencia;j++){
                    conjunto = `${hora1_clase+j}`+`${dia_clase}`;
                    console.log('conjunto: ',conjunto);
                    document.getElementById(conjunto).appendChild(document.createTextNode(`${data[i].nombre_clase}`));
                } 
                break;
        }
        
        
        console.log('dia de clase', dia_clase);
        console.log('hora de la clase incio', hora1_clase); 
    }        
        
    
        /*
    for(let i =0; i<columnas.length; i++){
        let columna = document.createElement('tr');
        let relleno = document.createElement('td');
        relleno.appendChild(document.createTextNode('asdasda'));
        columna.appendChild(relleno);
        for(let j =0; j<9; j++){
            columna.appendChild(relleno);
        
        document.getElementById("tbody").appendChild(columna);
    }*/
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