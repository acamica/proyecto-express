var express = require('express');
var exphbs  = require('express-handlebars');
var tareas = require('./modules/tarea/rutas');
var bodyParser = require('body-parser');
var session = require('express-session');

// Creo la instancia de express
var app = express();

// Le indico que maneje sesiones por cookies
app.use(session({
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 9*60*1000 }, // Expira en 9 minutos (ver modelo para saber porque)
    secret: 'sshhhh es un secreto'
}));

// Que sirva contenido estatico desde la carpeta public
app.use(express.static('public'));

// Que interprete submits de formulario y pedidos json
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configuro el motor de templates
var hbs = exphbs.create({
    defaultLayout: 'principal',
    helpers: require('./views/helpers')
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Monto las rutas
app.use('/', tareas);

// Manejo de paginas no encontradas
app.use(function(req, res) {
    res.status(404).render('no_encontrada');
});

// Manejo de pagina de error
app.use(function(err, req, res, next) {
    console.log(err);
    res.status(500).render('error');
});

// Defino el puerto en el que escucha el servidor. Puede venir por
// variables de entorno (por heroku) o usar el 8000
app.set('port', (process.env.PORT || 8000));

// Escucho en el puerto indicado
app.listen(app.get('port'), function () {
    console.log('Escuchando en el puerto %d', app.get('port'));
});
