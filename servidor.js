/*
    En este archivo se encuentra todo el control del back-end
*/
const dbtest = require("./database");

const enrutador = require("./rutas");
const path = require("path"); // modulo para apuntar correctamente los archivos
const database = require("./database"); // modulo con la logica CRUD de la base de datos
const bodyParser = require("body-parser"); //modulo para traer la data de las vistas al servidor

const express = require("express");
const PORT = process.env.PORT || 3000; // puerto por el cual opera el servidor

//instancia del servidor
const app = express();

//configuramos el motor de renderizado y de templates EJS
app.set("trust proxy", 1);
// Seteamos el motor de renderizado para las vistas
app.set("view engine", "ejs");
// y le indicamos donde estan las vistas
app.set("views", path.join(__dirname, "./vistas"));

// configuramos el body parser para traer la data de las vistas al servidor
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// colocamos los recursos estaticos
app.use("/static", express.static(path.join(__dirname, "./vistas/recursos")));

//configuramos en enrutador pasandole el modulo de la base de datos para que
//pueda operar sobre la misma
app.use("/", enrutador(database));

app.listen(PORT, () => {
  console.log(`Servidor escuchando por el puerto ${PORT}...`);
  // console.log(await dbtest.getSiguientePk("proyectos"));
});
