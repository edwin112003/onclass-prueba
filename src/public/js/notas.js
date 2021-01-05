var clase = document.currentScript.getAttribute('clase');
var nota = ""
if (typeof(localStorage.getItem('nota')) != "undefined") {
    nota = localStorage.getItem('nota');
}
    
function guardar(descargar){
    var name = document.getElementById("nombre").value;
    var text = $('#nota').summernote('code');
    var opt = {
        margin:       1,
        filename:     name+'.pdf',
        image:        { type: 'jpeg', quality: 1 },
    };
    if(descargar){        
        if(text == null ||html2pdf().from(img) === undefined || nota == null ||text == "" || nota == ""){
            text= "No guardaste nada en tu nota crack. Atte: OnClass";
            html2pdf().set(opt).from(text).to('pdf').save();
        }else{
            // New Promise-based usage:
        html2pdf().set(opt).from(text).to('pdf').output().then(function(pdf){
            var file = btoa(pdf);
            var array = {pdf: file, nombre: name, clase: clase};
        });
        html2pdf().set(opt).from(text).to('pdf').save();
        }

    }else{
        console.log("si");
        // New Promise-based usage:
        html2pdf().set(opt).from(text).to('pdf').output().then(function(pdf){
            var file = btoa(pdf);
            var array = {pdf: file, nombre: name, clase: clase};
            fetch("/links/save_pdf", {method: 'POST',headers:{'Content-Type': 'application/json'},  body:JSON.stringify(array)}).then(response => response.json()).then(data =>{
               
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
    $('#nota').css('font-size',"18px");
});

function saveNota() {
    console.log("body");
    var text = $('#nota').summernote('code');
    localStorage.setItem('nota', text);
    /*await fetch("/links/save_nota", {method: 'POST',credentials: 'include',headers:{'Content-Type': 'application/json'},  body:JSON.stringify(array)});*/
}
