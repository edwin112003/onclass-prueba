fetch("/links/Horario", {method: 'POST'}).then(response=>response.json()).then(data=>{
    let hora_final =0;
    let hora_inicio =0;
    let columnas = 0;
    let contador =0;
    for(let i=0; i<data.length; i++){

        let inicio_clase0 = data[i].horat_clase;

        if(hora_final<inicio_clase0){
            hora_final= inicio_clase0
            
        }
        if(hora_final>inicio_clase0){
            hora_final = hora_final;
        }     
    }
    for(let i=0; i<data.length; i++){

        let inicio_clase0 = data[i].horai_clase;

        if(hora_inicio == 0){
            hora_inicio = inicio_clase0;
        }else if(hora_inicio>inicio_clase0){
            hora_inicio= inicio_clase0
            
        }
        if(hora_inicio<inicio_clase0){
            hora_inicio = hora_inicio;
        }     
    }
    columnas = hora_final-hora_inicio;

        while(contador!=columnas){            
            let columna = document.createElement('tr'); 
            columna.setAttribute('id',`${hora_inicio}`);
            let relleno_horas = document.createElement('th');
            relleno_horas.appendChild(document.createTextNode(`${hora_inicio}:00-${hora_inicio+1}:00`));
            columna.appendChild(relleno_horas);   
        for(let j =0; j<7; j++){
            let relleno = document.createElement('td');
            relleno.setAttribute('id',`${hora_inicio}${j+1}`);
            relleno.setAttribute('value',`${hora_inicio}${j+1}`);
            columna.appendChild(relleno);
        }
        document.getElementById("tbody").appendChild(columna);
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
                    document.getElementById(conjunto).appendChild(document.createTextNode(`${data[i].nombre_clase}`));
                }                
                break;
            
            case "Martes" :
                    dia_clase = "2";
                    for(let j = 0; j<diferencia;j++){
                        conjunto = `${hora1_clase+j}`+`${dia_clase}`;
                        document.getElementById(conjunto).appendChild(document.createTextNode(`${data[i].nombre_clase}`));
                    } 
                    break;
            case "Miercoles" :
                dia_clase = "3";
                for(let j = 0; j<diferencia;j++){
                    conjunto = `${hora1_clase+j}`+`${dia_clase}`;
                    document.getElementById(conjunto).appendChild(document.createTextNode(`${data[i].nombre_clase}`));
                } 
                break;
            case "Jueves" :
                dia_clase = "4";
                for(let j = 0; j<diferencia;j++){
                    conjunto = `${hora1_clase+j}`+`${dia_clase}`;
                    document.getElementById(conjunto).appendChild(document.createTextNode(`${data[i].nombre_clase}`));
                } 
                break;
            case "Viernes" :
                dia_clase = "5";
                for(let j = 0; j<diferencia;j++){
                    conjunto = `${hora1_clase+j}`+`${dia_clase}`;
                    document.getElementById(conjunto).appendChild(document.createTextNode(`${data[i].nombre_clase}`));
                } 
                break;
            case "Sabado" :
                dia_clase = "6";
                for(let j = 0; j<diferencia;j++){
                    conjunto = `${hora1_clase+j}`+`${dia_clase}`;
                    document.getElementById(conjunto).appendChild(document.createTextNode(`${data[i].nombre_clase}`));
                } 
                break;
            case "Domingo" :
                dia_clase = "7";
                for(let j = 0; j<diferencia;j++){
                    conjunto = `${hora1_clase+j}`+`${dia_clase}`;
                    document.getElementById(conjunto).appendChild(document.createTextNode(`${data[i].nombre_clase}`));
                } 
                break;
        }
    }    
});
let hora = 5;
let gmt = hora;
let f = new Date();
let h = f.getHours();
let resta = 3-6;
let prueba = 25%resta;
console.log('prueba mod',prueba);

    console.log('gmt=j',gmt);
    for(let i=0; i<6; i++){
        gmt = gmt-1
        if(gmt == 0){
            gmt=24;
            gmt++;
        }
        
        console.log('hora for',gmt);
    }
    
    console.log('hora final',gmt);

