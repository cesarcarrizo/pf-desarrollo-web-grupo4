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
  router.post("/solicitudesAdm", async (req, res) => {
    try {
      if (req.body.contratado == "Contratar") {
        let pk = req.body.seleccion.split(" ", 1);
        // se actualizan los estados de acceso
        await database.update("administradores", "ced_adm_pk", pk[0], [
          ["estado_adm", "1"], //1: contratado
        ]);
        await database.update("usuarios", "ced_usu_pk", pk[0], [
          ["tipo_usu", "1"], // 1: administrador
        ]);
      }
      if (req.body.rechazado == "Rechazar") {
        let pk = req.body.seleccion.split(" ", 1);
        // se actualizan los estados de acceso
        await database.update("administradores", "ced_adm_pk", pk[0], [
          ["estado_adm", "2"], //2: rechazdo
        ]);
        await database.update("usuarios", "ced_usu_pk", pk[0], [
          ["tipo_usu", "1"],
        ]);
      }
      res.redirect("/solicitudesAdm");
    } catch (err) {
      console.log(err);
      res.redirect("/solicitudesAdm");
    }
  });

  //////////////////////////// SOLICITUDES PARA SER PROFESIONAL ///////////////
  router.get("/solicitudesProf", async (req, res) => {
    res.render("paginas/solicitudesProf", {
      peticiones: await database.getProfPeticiones(),
    });
  });
  router.post("/solicitudesProf", async (req, res) => {
    try {
      if (req.body.contratado == "Contratar") {
        let pk = req.body.seleccion.split(" ", 1);
        // se actualizan los estados de acceso
        await database.update("profesionales", "ced_pro_pk", pk[0], [
          ["estado_pro", "1"],
        ]);
        await database.update("usuarios", "ced_usu_pk", pk[0], [
          ["tipo_usu", "2"], // 2: profesional
        ]);
      }
      if (req.body.rechazado == "Rechazar") {
        let pk = req.body.seleccion.split(" ", 1);
        // se actualizan los estados de acceso
        await database.update("profesionales", "ced_pro_pk", pk[0], [
          ["estado_pro", "2"], // 2: rechazado
        ]);
        await database.update("usuarios", "ced_usu_pk", pk[0], [
          ["tipo_usu", "2"],
        ]);
      }
      res.redirect("/solicitudesProf");
    } catch (err) {
      console.log(err);
      res.redirect("/solicitudesProf");
    }
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
    try {
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
    } catch (err) {
      console.log(err);
      res.send("usuario ya registrado!");
    }

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
        if (registro[0].estado_pro == 0) {
          //res.redirect('/');
          res.send("Pendiente");
        }
        if (registro[0].estado_pro == 1) {
          datosProfEnsesionado = registro;
          console.log(datosProfEnsesionado);
          res.redirect("/menuProf");
        }
        if (registro[0].estado_pro == 2) {
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

  //////////////////////////// MENU PROFESIONAL //////////////////////////////
  //ruta del menu del admin
  router.get("/menuProf", (req, res) => {
    res.render("paginas/menuProf", {
      prof: datosProfEnsesionado,
    });
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
  router.post("/servicios", (req, res) => {
    res.redirect("/llenarSolicitud");
  });

  ///////////////////////// LLENAR SOLICITUD CLIENTE //////////////////////////
  router.get("/llenarSolicitud", async (req, res) => {
    let especialidades = await database.selectTodo("especialidades");
    let recursos = await database.selectTodo("recursos");

    res.render("paginas/llenarSolicitud", {
      esp: especialidades,
      res: recursos,
    });
  });
  router.post("/llenarSolicitud", async (req, res) => {
    //insertar en la bd el cliente
    let cliData = [
      ["nom_cli", req.body.nom_cli],
      ["ape_cli", req.body.ape_cli],
      ["telf_cli", req.body.telf_cli],
      ["email_cli", req.body.email_cli],
    ];
    let queryC = await database.insert(
      "clientes",
      "ced_cli_pk",
      req.body.ced_cli_pk,
      cliData
    );

    //insertar en la bd el proyecto
    let dato = await database.getSiguientePk("proyectos");
    let hoy = new Date();
    let fecha_solicitud_proy =
      hoy.getFullYear() + "-" + (hoy.getMonth() + 1) + "-" + hoy.getDate();

    let nombreEsp = req.body.seleccion.split("-", 1);
    nombreEsp[0] = nombreEsp[0].substring(0, nombreEsp[0].length - 1);
    let cod_esp_fk_proy = await database.getCodEspecializacion(nombreEsp[0]);

    let proyData = [
      ["ced_cli_fk_proy", req.body.ced_cli_pk],
      ["cod_esp_fk_proy", cod_esp_fk_proy[0].cod_esp_pk],
      ["fecha_solicitud_proy", fecha_solicitud_proy],
      ["desc_proy", req.body.desc_proy],
    ];

    let queryP = await database.insert(
      "proyectos",
      "cod_proy_pk",
      dato[0].pk,
      proyData
    );

    // insertamos el proyecto en la lista_proyectos para que puedan ser respondida la solicitud por el profesional
    let dato1 = await database.getSiguientePk("lista_proyectos");

    let liData = [
      ["ced_cli_fk_li", req.body.ced_cli_pk],
      ["cod_esp_fk_li", cod_esp_fk_proy[0].cod_esp_pk],
      ["fecha_finalizacion_li", "pendiente"],
    ];

    let queryL = await database.insert(
      "lista_proyectos",
      "cod_li_pk",
      dato1[0].pk,
      liData
    );

    // checking..
    /*
    console.log("\nINSERCION TABLA clientes: " + JSON.stringify(queryC));
    console.log("\nINSERCION TABLA proyectos: " + JSON.stringify(queryP));
    console.log("\nINSERCION TABLA lista_proyectos: " + JSON.stringify(queryL));
    */
    res.redirect("/");
  });
  /////////////////// PROYECTOS ENVIADOS ////////////////////////////////
  router.get("/solicitudesUsu", async (req, res) => {
    //res.send(await database.getProyPeticiones());
    res.render("paginas/solicitudesUsu", {
      peticiones: await database.getProyPeticiones(),
    });
  });
  router.post("/solicitudesUsu", async (req, res) => {
    let query = null;
    let seleccion = req.body.seleccion.split(" ", 1);
    if (req.body.contratado == "Contratar") {
      let pk = await database.getCodListaProyectos(seleccion[0]);
      // se actualizan los estados de acceso
      query = await database.update("lista_proyectos", "cod_li_pk", pk[0].p, [
        ["estado_proy_li", "1"], //1: contratado
      ]);
    }
    if (req.body.rechazado == "Rechazar") {
      let pk = await database.getCodListaProyectos(seleccion[0]);
      // se actualizan los estados de acceso
      query = await database.update("lista_proyectos", "cod_li_pk", pk[0].p, [
        ["estado_proy_li", "2"],
      ]);
    }

    res.redirect("/solicitudesUsu");
    console.log(query);
  });

  ////////////////// PROYECTOS EN PROCESO ////////////////////////////
  router.get("/proyectos", async (req, res) => {
    let infoCli = [];
    let infoProy = [];
    let proyAceptados = await database.getProyAceptados();
    console.log(proyAceptados);
    res.render("paginas/proyectos", { proyAceptados });
  });

  return router;
};
