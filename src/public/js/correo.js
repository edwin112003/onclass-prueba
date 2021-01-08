let correo = document.currentScript.getAttribute('correo');
console.log(correo);
function Correo(nombre,fecha){
    console.log('buenasdasdasdasdasdasdadsasdasdasdasd');
    var array ={
        nombre,
        fecha,
        correo
    }
    console.log(array);
    fetch("/links/correo", {method: 'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(array)}).then(response => response.json()).then(data =>{
               
      });
}
