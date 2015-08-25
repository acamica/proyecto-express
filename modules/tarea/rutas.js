var express = require('express');
var _       = require('lodash');
var uuid    = require('uuid');
var Tarea   = require('./modelo');

// Creo el modulo
var modulo  = express.Router();

/*
 * Middleware que agrega el nombre de la vista a res.locals para el componente de navegacion.
 * Noten que no parece cumplir con la firma del middleware al tener un
 * primer parametro extra, pero vean que esta pensado para ser usado con _.partial
 * que basicamente te devuelve una nueva funcion con el primer parametro precargado
 */
function setearVista (vista, req, res, next) {
    res.locals.view = vista;
    next();
}

/*
 * Middleware que cuenta la cantidad de tareas pendientes para un usuario
 */
function contarPendientes (req, res, next) {
    var pendientes = Tarea.buscarPendientes(obtenerUsuarioId(req));
    res.locals.pendientes = Object.keys(pendientes).length;
    next();
}

/**
 * Middleware que carga todas las tareas para un usuario.
 */
function buscarTodas (req, res, next) {
    res.locals.tareas = Tarea.buscarTodas(obtenerUsuarioId(req));
    next();
}

/**
 * Middleware que carga las tareas completas para un usuario.
 */
function buscarCompletas (req, res, next) {
    res.locals.tareas = Tarea.buscarCompletas(obtenerUsuarioId(req));
    next();
}

/**
 * Middleware que carga las tareas pendientes para un usuario y ya
 * que las tiene, las cuenta.
 */
function buscarPendientes (req, res, next) {
    res.locals.tareas = Tarea.buscarPendientes(obtenerUsuarioId(req));
    res.locals.pendientes = Object.keys(res.locals.tareas).length;
    next();
}

/**
 * Funcion helper que devuelve el id del usuario (guardado en la sesion).
 * Si no existe, lo crea con dos tareas basicas y luego elimina todas las
 * tareas en 10 minutos.
 * Como problema de hacerlo de esta forma, si el usuario usa la app por mas
 * de 10 minutos, se le van a borrar las tareas.
 * Claramente esto no deberia pasar en una aplicacion real con los datos guardados
 * en una base, aca se hace para que no se pierda la memoria.
 */
function obtenerUsuarioId (req) {
    var usuarioId = req.session.usuarioId;
    // Si no existe el usuario
    if (!usuarioId) {
        usuarioId = req.session.usuarioId = uuid.v4();
        Tarea.crear(usuarioId, 'Hacer el proyecto de express');
        Tarea.crear(usuarioId, 'Conquistar el mundo');
        // Despues de 10 minutos borramos todas las tareas del usuario
        setTimeout(function() {
            Tarea.borrarTodas(usuarioId);
        }, 600000);
    }
    return usuarioId;
}

/*
 * Middleware que imprime la lista de tareas
 */
function imprimirLista (req, res) {
    res.render('tarea/lista');
}

// Ruta principal, muestra todas las tareas
modulo.get('/', [
    _.partial(setearVista, 'todas'),
    buscarTodas,
    contarPendientes,
    imprimirLista
]);

// Muestra las tareas completas
modulo.get('/completas', [
    _.partial(setearVista, 'completas'),
    buscarCompletas,
    contarPendientes,
    imprimirLista
]);

// Muestra las tareas pendientes, noten que no llama al middleware
// contarPendientes porque la cuenta ya la hace buscarPendientes
modulo.get('/pendientes', [
    _.partial(setearVista, 'pendientes'),
    buscarPendientes,
    imprimirLista
]);

// Ruta para crear una tarea
modulo.post('/crear', function (req, res) {
    Tarea.crear(obtenerUsuarioId(req), req.body.titulo);
    res.redirect('/');
});

// Middleware para obtener una tarea desde su id
modulo.param('id', function (req, res, next, id) {
    var tarea = Tarea.buscarUno(obtenerUsuarioId(req), id);
    if (tarea) {
        res.locals.tarea = tarea;
        next();
    } else {
        res.status(404).send('tarea no encontrada');
    }
});

// Ruta para marcar una tarea como completa
modulo.post('/:id/completado', function (req, res) {
    res.locals.tarea.completada = req.body.completada;
    res.send('ok');
});

module.exports = modulo;
