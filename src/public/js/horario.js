//Intentar poner las horas con js 
for(let j=1; j<4; j++){
    if(j==1 || j==3){
        for(let i=0; i<25; i++){
            let a = document.createElement("option");
            a.setAttribute("class", "dropdown-item");    
            if(i.toString().length == 1){            
                a.setAttribute("name", "horai");
                a.setAttribute("value", "0"+i.toString());
                a.appendChild(document.createTextNode("0"+i.toString()));
                document.getElementById("inhoras"+j.toString()).appendChild(a);
            }else{
                a.setAttribute("name", "horai");
                a.setAttribute("value", i.toString());
                a.appendChild(document.createTextNode(i.toString()));
                document.getElementById("inhoras"+j.toString()).appendChild(a);
            }
        }
    }else{
        for(let i=0; i<25; i++){
            let a = document.createElement("option");
            a.setAttribute("class", "dropdown-item");    
            if(i.toString().length == 1){            
                a.setAttribute("name", "horat");
                a.setAttribute("value", "0"+i.toString());
                a.appendChild(document.createTextNode("0"+i.toString()));
                document.getElementById("inhoras"+j.toString()).appendChild(a);
            }else{
                a.setAttribute("name", "horat");
                a.setAttribute("value", i.toString());
                a.appendChild(document.createTextNode(i.toString()));
                document.getElementById("inhoras"+j.toString()).appendChild(a);
            }
        }
    }    
}

