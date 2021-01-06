fetch("/links/llaves", {method: 'POST'}).then(response => response.json()).then(data =>{
    localStorage.setItem('llaveprivada',data);
});