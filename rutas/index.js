/*
    Este modulo se encarga de hacer el enrutamiento hacia las vistas,
    controla las peticiones y las respuestas del servidor.
*/

const express = require("express");

const router = express.Router();

// database: objeto importado del modulo database que se pasa desde el servidor
module.exports = (database) => {
  let datosAdminEnsesionado = [];
  let datosProfEnsesionado = [];
  let tipoUsuario = 0;

  //////////////////////////// LOGIN ADMIN //////////////////////////////
  //ruta del inicio de sesion del admin
  router.get("/loginA", (req, res) => {
    res.render("paginas/loginA");
  });
  router.post("/loginA", async (req, res) => {
    try {
      // hago una consulta para verificar que los datos existan
      let consulta = await database.select(
        "usuarios",
        "ced_usu_pk",
        req.body.ced
      );
      //si la contresena es correcta se prosigue direccionar
      if (consulta[0].passwd_usu == req.body.passwd) {
        let registro = await database.select(
          "administradores",
          "ced_adm_pk",
          req.body.ced
        );
        if (registro[0].estado_adm == 0) {
          //res.redirect('/');
          res.send("Pendiente");
        }
        if (registro[0].estado_adm == 1) {
          // una vez validado se guarda la info en un objeto global
          datosAdminEnsesionado = registro;
          console.log(datosAdminEnsesionado);
          res.redirect("/menuAdmin");
        }
        if (registro[0].estado_adm == 2) {
          res.send("REchaazado");
        }
      } else {
        res.send("No hubo match en el passwd");
      }
    } catch (err) {
      console.log(err);
      res.send("No existe el nombre de usuario");
    }
  });

  //////////////////////////// MENU ADMIN //////////////////////////////
  //ruta del menu del admin
  router.get("/menuAdmin", (req, res) => {
    res.render("paginas/menuAdmin", {
      // todos son strings
      ced_adm_pk: datosAdminEnsesionado[0].ced_adm_pk,
      nom_adm: datosAdminEnsesionado[0].nom_adm,
      ape_adm: datosAdminEnsesionado[0].ape_adm,
      telf_adm: datosAdminEnsesionado[0].telf_adm,
      email_adm: datosAdminEnsesionado[0].email_adm,
    });
  });

  //////////////////////////// SOLICITUDES PARA SER ADMIN //////////////////
  router.get("/solicitudesAdm", async (req, res) => {
    res.render("paginas/solicitudesAdm", {
      peticiones: await database.getAdminPeticiones(),
    });
  });

  //////////////////////////// REGISTRO ADMIN //////////////////////////////
  // ruta del registro para ser administrador
  router.get("/registroAdmin", (req, res) => {
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

  //////////////////////////// LOGIN PROFESIONAL ///////////////////////////////////
  //ruta del inicio de sesion
  router.get("/loginP", (req, res) => {
    res.render("paginas/loginP");
  });
  router.post("/loginP", async (req, res) => {
    try {
      // hago una consulta para verificar que los datos existan
      let consulta = await database.select(
        "usuarios",
        "ced_usu_pk",
        req.body.ced
      );
      //si la contresena es correcta se prosigue direccionar
      if (consulta[0].passwd_usu == req.body.passwd) {
        let registro = await database.select(
          "profesionales",
          "ced_pro_pk",
          req.body.ced
        );
        if (registro[0].estado_adm == 0) {
          //res.redirect('/');
          res.send("Pendiente");
        }
        if (registro[0].estado_adm == 1) {
          res.redirect("/menuProf");
        }
        if (registro[0].estado_adm == 2) {
          res.send("REchaazado");
        }
      } else {
        res.send("No hubo match en el passwd");
      }
    } catch (err) {
      console.log(err);
      res.send("No existe el nombre de usuario");
    }
  });

  //////////////////////////// REGISTRO PROFESIONAL /////////////////////
  // ruta para registrar una solicitud nueva para ser profesional
  router.get("/registroProf", (req, res) => {
    res.render("paginas/registroProf");
  });
  router.post("/registroProf", async (req, res) => {
    /* 
      al crear un profesional, se inicia con estado pendiente,
      seguidamente se crea un usuario.
    */

    // creo un arreglo bidimensional con el nombre de las columnas y los valores a insertar (tomados del req.body)
    let dataProf = [
      ["nom_pro", req.body.nom_pro],
      ["ape_pro", req.body.ape_pro],
      ["telf_pro", req.body.telf_pro],
      ["email_pro", req.body.email_pro],
      ["resi_pro", req.body.resi_pro], //el estado se maneja desde el modulo database
    ];
    //una vez von los datos en el arreglo procedo a hacer la insercion
    await database.insert(
      "profesionales",
      "ced_pro_pk",
      req.body.ced_pro_pk,
      dataProf
    );

    //inmediatamente paso a crear un usuario, se preparan los datos
    let dataUsuario = [["passwd_usu", req.body.passwd_usu]]; // el tipo de usuario se maneja desde el modulo database
    //una vez von los datos en el arreglo procedo a hacer la insercion
    await database.insert(
      "usuarios",
      "ced_usu_pk",
      req.body.ced_pro_pk,
      dataUsuario
    );

    // si todo salio bien me redirige al inicio
    res.redirect("/");
  });

  //////////////////////////// PERSONAL //////////////////////////////
  router.get("/personal", (req, res) => {
    res.render("paginas/personal");
    // fix
  });

  //////////////////////////// ABOUT //////////////////////////////////
  // ruta para sobre nosotros
  router.get("/about", (req, res) => {
    res.render("paginas/about");
  });

  //////////////////////////// HOME ////////////////////////////////////
  // ruta de la pagina home
  router.get("/", (req, res) => {
    res.render("paginas/index");
  });

  //////////////////////////// ELECCION DE LOGIN ////////////////////////////////
  //ruta de la pagina eleccion (especifica que usuario va a iniciar sesion)
  router.get("/eleccion", (req, res) => {
    res.render("paginas/eleccion");
  });

  //////////////////////////// SERVICIOS ///////////////////////////////////
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

  return router;
};
