$(document).ready(function() {
    $('.task-item input[type=checkbox]').bind('click',function(evento) {
        // Busco el id del elemento clickeado
        var id = evento.currentTarget.id;
        // Veo si esta completado o no
        var completada = evento.currentTarget.checked;

        // Hago un request AJAX para informar que fue completado o no
        $.ajax('/' + id + '/completado', {
            data: JSON.stringify({completada: completada}),
            type : 'POST',
            contentType : 'application/json'
        });

        // Obtengo el valor de pendientes actual
        var pendientes = parseInt($('.pending-task-count').html());
        // le resto o agrego uno
        pendientes += (completada)?-1:1;
        // Actualizo el elemento
        $('.pending-task-count').html(pendientes);
    });
});
