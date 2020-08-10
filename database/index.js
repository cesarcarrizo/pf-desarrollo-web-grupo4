const mysql = require("mysql");

const config = {
  host: "localhost",
  user: "root",
  password: "admin",
  port: 3306,
  database: "techteam",
  connectionLimit: 10,
};

// iniciamos la conexion con un createPool para que siga a la escucha de posibles peticiones
const conx = mysql.createPool(config);

// objeto a devolver con los registros o el output de las operaciones
let registros = {};

registros.getProyAceptados = () => {
  return new Promise((resolve, reject) => {
    conx.query(
      `SELECT C.*, P.*, L.fecha_finalizacion_li FROM lista_proyectos as L INNER JOIN clientes AS C ON C.ced_cli_pk=L.ced_cli_fk_li INNER JOIN proyectos AS P ON P.cod_proy_pk=L.cod_li_pk WHERE L.estado_proy_li=1;`,
      (err, resultados) => {
        if (err) return reject(err);
        else {
          return resolve(JSON.parse(JSON.stringify(resultados)));
        }
      }
    );
  });
};

registros.getProyTerminados = () => {
  return new Promise((resolve, reject) => {
    conx.query(
      `SELECT C.*, P.* FROM lista_proyectos as L INNER JOIN clientes AS C ON C.ced_cli_pk=L.ced_cli_fk_li INNER JOIN proyectos AS P ON P.cod_proy_pk=L.cod_li_pk WHERE L.estado_proy_li=2;`,
      (err, resultados) => {
        if (err) return reject(err);
        else {
          return resolve(JSON.parse(JSON.stringify(resultados)));
        }
      }
    );
  });
};

registros.getSiguientePk = (nomTabla) => {
  return new Promise((resolve, reject) => {
    conx.query(
      `SELECT COUNT(*)+1 as pk FROM ${nomTabla};`,
      (err, resultados) => {
        if (err) return reject(err);
        else {
          return resolve(JSON.parse(JSON.stringify(resultados)));
        }
      }
    );
  });
};

registros.getCodEspecializacion = (nombreEsp) => {
  return new Promise((resolve, reject) => {
    conx.query(
      `SELECT cod_esp_pk FROM especialidades WHERE nom_esp='${nombreEsp}';`,
      (err, resultados) => {
        if (err) return reject(err);
        else {
          return resolve(JSON.parse(JSON.stringify(resultados)));
        }
      }
    );
  });
};

registros.getCodListaProyectos = (cedCliente) => {
  return new Promise((resolve, reject) => {
    conx.query(
      `SELECT cod_li_pk as p FROM lista_proyectos WHERE ced_cli_fk_li=${cedCliente};`,
      (err, resultados) => {
        if (err) return reject(err);
        else {
          return resolve(JSON.parse(JSON.stringify(resultados)));
        }
      }
    );
  });
};

registros.getAdminPeticiones = () => {
  return new Promise((resolve, reject) => {
    conx.query(
      `SELECT * FROM administradores WHERE estado_adm=0;`,
      (err, resultados) => {
        if (err) return reject(err);
        else {
          return resolve(JSON.parse(JSON.stringify(resultados)));
        }
      }
    );
  });
};

registros.getEncargados = () => {
  return new Promise((resolve, reject) => {
    conx.query(
      `select E.nom_esp, P.nom_pro, P.ape_pro, P.email_pro, P.telf_pro, E.desc_esp from profesionales as P inner join especialidades as E on E.ced_pro_fk_esp=P.ced_pro_pk;
      `,
      (err, resultados) => {
        if (err) return reject(err);
        else {
          return resolve(JSON.parse(JSON.stringify(resultados)));
        }
      }
    );
  });
};

registros.getProyPeticiones = () => {
  return new Promise((resolve, reject) => {
    conx.query(
      `SELECT C.*, P.*, E.nom_esp, S.nom_pro, S.ape_pro FROM lista_proyectos as L INNER JOIN clientes AS C ON C.ced_cli_pk=L.ced_cli_fk_li INNER JOIN proyectos AS P ON P.cod_proy_pk=L.cod_li_pk INNER JOIN especialidades AS E ON E.id_recurso_esp=L.cod_esp_fk_li INNER JOIN profesionales as S ON S.ced_pro_pk=E.ced_pro_fk_esp WHERE L.estado_proy_li=0;
      `,
      (err, resultados) => {
        if (err) return reject(err);
        else {
          return resolve(JSON.parse(JSON.stringify(resultados)));
        }
      }
    );
  });
};

registros.getProfPeticiones = () => {
  return new Promise((resolve, reject) => {
    conx.query(
      `SELECT * FROM profesionales WHERE estado_pro=0;`,
      (err, resultados) => {
        if (err) return reject(err);
        else {
          return resolve(JSON.parse(JSON.stringify(resultados)));
        }
      }
    );
  });
};
/*
  Funcion que selecciona un registro entero de una tabla bajo una condicional de tipo
  'igual a' y usando un where clause

  params:
  tabla: nombre de la tabla a consultar
  col: nombre de la columna del pk a hacer match
  pk: llave primaria a hacer match
*/
registros.select = (tabla, col, pk) => {
  return new Promise((resolve, reject) => {
    conx.query(
      `SELECT * FROM ${tabla} WHERE ${col} = ${pk};`,
      (err, resultados) => {
        if (err) return reject(err);
        else {
          return resolve(JSON.parse(JSON.stringify(resultados)));
        }
      }
    );
  });
};

/*
  Funcion que selecciona todos los registros de una tabla.

  params:
  tabla: nombre de la tabla a consultar
*/
registros.selectTodo = (tabla) => {
  return new Promise((resolve, reject) => {
    conx.query(`SELECT * FROM ${tabla};`, (err, resultados) => {
      if (err) return reject(err);
      else {
        return resolve(JSON.parse(JSON.stringify(resultados)));
      }
    });
  });
};

/*
  Funcion que inserta un registro nuevo a una tabla
  incluyendo la llave primaria.

  params:
  tabla: nombre de la tabla a consultar
  col: nombre de la columna del pk 
  pk: valor de la llave primaria
  nuevaData: arreglo bidimensional con los valores a insertar [["nombreCol1", "valor1"], ["nombreCol2", "valor2"], ...]
*/
registros.insert = (tabla, col, pk, nuevaData) => {
  return new Promise((resolve, reject) => {
    let columnas = ""; // string que me va a almacenar de las columnas (porque varian x tabla)
    let valores = ""; // string que me va a almacenar los valores (porque varian x tabla)

    for (var i = 0; i < nuevaData.length; i++) {
      columnas += `${nuevaData[i][0]},`;
      valores += `'${nuevaData[i][1]}',`; // los valores a insertar al ser cadenas de texto deben ir entre comillas simples

      // en la ultima iteracion quitamos la coma de la siguiente manera:
      if (i == nuevaData.length - 1) {
        columnas = columnas.substring(0, columnas.length - 1);
        valores = valores.substring(0, valores.length - 1);
      }
    }
    // si la tabla es administradores se agrega el estado inicial 0: pendiente (1: aceptado, 2: rechazado)
    if (tabla == "administradores") {
      columnas += ",estado_adm";
      valores += ",0";
    }
    // si la tabla es profesionales se agrega el estado inicial 0: pendiente (1: aceptado, 2: rechazado)
    if (tabla == "profesionales") {
      columnas += ",estado_pro";
      valores += ",0";
    }
    // si la tabla es usuarios se agrega el estado inicial 0: sin asignar (1: admin, 2: profesional)
    if (tabla == "usuarios") {
      columnas += ",tipo_usu";
      valores += ",0";
    }
    // si la tabla es lista_proyectos se agrega el estado inicial 0: sin asignar (1: admin, 2: profesional)
    if (tabla == "lista_proyectos") {
      columnas += ",estado_proy_li";
      valores += ",0";
    }
    conx.query(
      `INSERT INTO ${tabla} (${col},${columnas}) VALUES (${pk},${valores});`,
      (err, resultados) => {
        if (err) return reject(err);
        else {
          return resolve(JSON.parse(JSON.stringify(resultados)));
        }
      }
    );
  });
};

/*
  Funcion que elimina un registro de una tabla bajo una condicional de tipo
  'igual a' y usando un where clause.

  params:
  tabla: nombre de la tabla a consultar
  col: nombre de la columna del pk a hacer match
  pk: llave primaria a hacer match
*/
registros.delete = (tabla, col, pk) => {
  return new Promise((resolve, reject) => {
    conx.query(
      `DELETE FROM ${tabla} WHERE ${col} = ${pk};`,
      (err, resultados) => {
        if (err) return reject(err);
        else {
          return resolve(JSON.parse(JSON.stringify(resultados)));
        }
      }
    );
  });
};

/*
  Funcion que edita un registro de una tabla mediante su llave primaria
  y una clausula where, 'igual a'.

  params:
  tabla: nombre de la tabla a referenciar
  col: nombre de la columna de la llave primaria del registro a actualizar
  pk: valor de la llave primaria del registro a actualizar
  nuevaData: arreglo bidimensional con los valores a actualizar [["nombreCol1", "valornuevo1"], ["nombreCol2", "valornuevo2"], ...]
*/
registros.update = (tabla, col, pk, nuevaData) => {
  return new Promise((resolve, reject) => {
    let setter = ""; // string que me va a almacenar los sets de las columnas (porque varian en cantidad x tabla)
    for (let i = 0; i < nuevaData.length; i++) {
      setter += `${nuevaData[i][0]} = '${nuevaData[i][1]}',`;

      // en la ultima iteracion quitamos la coma de la siguiente manera:
      if (i == nuevaData.length - 1) {
        setter = setter.substring(0, setter.length - 1);
      }
    }
    conx.query(
      `UPDATE ${tabla} SET ${setter} WHERE ${col} = ${pk};`,
      (err, resultados) => {
        if (err) return reject(err);
        else {
          return resolve(JSON.parse(JSON.stringify(resultados)));
        }
      }
    );
  });
};

module.exports = registros;
