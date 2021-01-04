var nota = document.currentScript.getAttribute('nota');
    console.log(nota);
function guardar(descargar){
    var img = document.getElementById("img");
    var name = document.getElementById("nombre").value;
    var text = $('#nota').summernote('code');
    var opt = {
        margin:       1,
        filename:     name+'.pdf',
        image:        { type: 'jpeg', quality: 1 },
    };
    if(descargar){
        
        
        if(html2pdf().from(text) == null ||html2pdf().from(img) === undefined || html2pdf().from(nota) == null || html2pdf().from(text) == "" || html2pdf().from(nota) == "null"){
            text= "OnClass";
            html2pdf().set(opt).from(text).to('pdf').save();
        }else{
            // New Promise-based usage:
        html2pdf().set(opt).from(text).to('pdf').output().then(function(pdf){
            var file = btoa(pdf);
            var array = {pdf: file, nombre: name};
            fetch("/links/save_pdf", {method: 'POST',headers:{'Content-Type': 'application/json'},  body:JSON.stringify(array)});
        });
        html2pdf().set(opt).from(text).to('pdf').save();
        }

    }else{
        console.log("si");
        // New Promise-based usage:
        html2pdf().set(opt).from(text).to('pdf').output().then(function(pdf){
            var file = btoa(pdf);
            var array = {pdf: file, nombre: name};
            fetch("/links/save_pdf", {method: 'POST',headers:{'Content-Type': 'application/json'},  body:JSON.stringify(array)}).then(response => response.json()).then(data =>{
                img.src = data.url;
            });
        });
    }
        
}
$(document).ready(function() {
    $('#nota').summernote({
        height: 300,                 // set editor height
        minHeight: null,             // set minimum height of editor
        maxHeight: null,             // set maximum height of editor
        focus: true,                  // set focus to editable area after initializing summernote
        toolbar: [
            ['style', ['style']],
            ['font', ['bold', 'underline', 'clear']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['table', ['table']],
            ['insert', ['link', 'picture']],
            ['view', ['codeview', 'help']],
          ]
    });
    if (nota != "") {
        $('#nota').summernote('code',nota);
    }
    
});

async function saveNota() {
    console.log("body");
    var text = $('#nota').summernote('code');
    var array = {nota: text};
    await fetch("/links/save_nota", {method: 'POST',headers:{'Content-Type': 'application/json'},  body:JSON.stringify(array)});
}
