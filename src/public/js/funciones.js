$("#from").datepicker({
    minDate: 'D',
    dateFormat: "dd/mm/yy",
    defaultDate: "+1w",
    onClose: function (selectedDate) {
        $("#to").datepicker("option", "minDate", selectedDate);
    }
});

$("#to").datepicker({
    onClose: function (selectedDate) {
        $("#from").datepicker("option", "maxDate", selectedDate);
    }
});
// ********* otro tipo de vista *********************************************
$("#from1").datepicker({
    minDate: 'D',
    dateFormat: "dd/mm/yy",
    defaultDate: "+1w",
    numberOfMonths: 2,
    onClose: function (selectedDate) {
        $("#to1").datepicker("option", "minDate", selectedDate);
        return $("#to1").datepicker("show");
    }
});
$("#to1").datepicker({
    minDate: '+1D',
    dateFormat: "dd/mm/yy",
    defaultDate: "+1w",
    numberOfMonths: 2
});
// ********* formato de las fechas ******************************************
$(function ($) {
    $.datepicker.regional['es'] = {
        closeText: 'Cerrar',
        prevText: '<Ant',
        nextText: 'Sig>',
        currentText: 'Hoy',
        monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
        dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Juv', 'Vie', 'Sáb'],
        dayNamesMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'],
        weekHeader: 'Sm',
        dateFormat: 'dd/mm/yy',
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
      
    };
    $.datepicker.setDefaults($.datepicker.regional['es']);
});
