const mysql = require("mysql");
const conexion = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "$pass123",
  database: "api_usuarios",
});

conexion.connect((error) => {
  if (error) {
    console.error("El error de conexion es:" + error);
    return;
  }
  console.log("Conectado a la BD");
});

module.exports = conexion;
