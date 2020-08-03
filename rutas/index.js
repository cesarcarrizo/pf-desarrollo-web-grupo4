/*
    Este modulo se encarga de hacer el enrutamiento hacia las vistas,
    controla las peticiones y las respuestas del servidor.
*/

const express = require("express");

const router = express.Router();

// database: objeto importado del modulo database que se pasa desde el servidor
module.exports = (database) => {
  // ruta de la pagina home
  router.get("/", (req, res) => {
    res.render("paginas/index");
  });

  // ruta de la pagina servicios
  router.get("/servicios", (req, res) => {
    res.render("paginas/servicios", {
      servicios: [
        "Networking",
        "PC Support & Instalación",
        "Back Up SDD & HDD",
        "Recuperación de datos",
        "Soporte Remoto",
        "Soporte Smartphone",
        "Reparaciones PC/Mac",
        "Consultorias",
        "IT",
        "Training",
        "Infosec",
      ],
    });
  });

  // ruta del registro para ser administrador
  router.get("/registroAdmin", async (req, res) => {
    res.render("paginas/registroAdmin");
  });
  // cuando el formulario del admin se envia se controla con:
  router.post("/registroAdmin", async (req, res) => {
    /* 
      al crear un administrador, se inicia con estado pendiente,
      seguidamente se crea un usuario.
    */

    // creo un arreglo bidimensional con el nombre de las columnas y los valores a insertar (tomados del req.body)
    let dataAdmin = [
      ["nom_adm", req.body.nom_adm],
      ["ape_adm", req.body.ape_adm],
      ["telf_adm", req.body.telf_adm],
      ["email_adm", req.body.email_adm], //el estado se maneja desde el modulo database
    ];
    //una vez von los datos en el arreglo procedo a hacer la insercion
    await database.insert(
      "administradores",
      "ced_adm_pk",
      req.body.ced_adm_pk,
      dataAdmin
    );

    //inmediatamente paso a crear un usuario, se preparan los datos
    let dataUsuario = [["passwd_usu", req.body.passwd_usu]]; // el tipo de usuario se maneja desde el modulo database
    //una vez von los datos en el arreglo procedo a hacer la insercion
    await database.insert(
      "usuarios",
      "ced_usu_pk",
      req.body.ced_adm_pk,
      dataUsuario
    );

    // si todo salio bien me redirige al inicio
    res.redirect("/");
  });

  router.get("/personal", (req, res) => {
    res.render("paginas/personal");
    // fix
  });

  return router;
};
