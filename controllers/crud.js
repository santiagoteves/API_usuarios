const conexion = require("../database/db");

exports.save = (req, res) => {
  const user = req.body.user;
  const rol = req.body.rol;

  // Insertar usuario en la tabla "users"
  conexion.query(
    "INSERT INTO users SET ?",
    { user: user, rol: rol },
    (error, results) => {
      if (error) {
        console.log(error);
      } else {
        // Eliminar todas las notificaciones existentes excepto las de eliminación
        conexion.query(
          "DELETE FROM notifications WHERE message NOT LIKE 'El usuario%'",
          (error) => {
            if (error) {
              console.log(error);
            } else {
              // Crear notificación de creación de usuario
              const message = `El usuario ${user} se creó correctamente`;
              insertNotification(results.insertId, message);

              res.redirect("/");
            }
          }
        );
      }
    }
  );
};

exports.update = (req, res) => {
  const id = req.body.id;
  const user = req.body.user;
  const rol = req.body.rol;

  // Obtener información del usuario antes de actualizarlo
  conexion.query("SELECT * FROM users WHERE id=?", [id], (error, results) => {
    if (error) {
      console.log(error);
    } else {
      const previousUser = results[0].user;
      const previousRol = results[0].rol;

      // Actualizar usuario en la tabla "users"
      conexion.query(
        "UPDATE users SET ? WHERE id= ?",
        [{ user: user, rol: rol }, id],
        (error, results) => {
          if (error) {
            console.log(error);
          } else {
            // Eliminar la notificación anterior de edición de usuario si existe
            conexion.query(
              "DELETE FROM notifications WHERE message LIKE ?",
              [`El usuario ${previousUser} se modificó%`],
              (error) => {
                if (error) {
                  console.log(error);
                } else {
                  // Eliminar todas las notificaciones existentes excepto las de eliminación
                  conexion.query(
                    "DELETE FROM notifications WHERE message NOT LIKE 'El usuario%'",
                    (error) => {
                      if (error) {
                        console.log(error);
                      } else {
                        // Crear notificación de edición de usuario
                        let message = `El usuario ${previousUser} se modificó a ${user}`;
                        if (previousRol !== rol) {
                          message += ` y el rol ${previousRol} se modificó a ${rol}`;
                        }
                        insertNotification(id, message);

                        res.redirect("/");
                      }
                    }
                  );
                }
              }
            );
          }
        }
      );
    }
  });
};

exports.delete = (req, res) => {
  const id = req.params.id;

  // Obtener información del usuario antes de eliminarlo
  conexion.query("SELECT * FROM users WHERE id=?", [id], (error, results) => {
    if (error) {
      console.log(error);
    } else {
      // Eliminar usuario de la tabla "users"
      conexion.query("DELETE FROM users WHERE id=?", [id], (error) => {
        if (error) {
          console.log(error);
        } else {
          // Eliminar la notificación anterior de eliminación de usuario si existe
          conexion.query(
            "DELETE FROM notifications WHERE message LIKE ?",
            [`El usuario ${results[0].user} se eliminó%`],
            (error) => {
              if (error) {
                console.log(error);
              } else {
                // Eliminar todas las notificaciones existentes excepto las de eliminación
                conexion.query(
                  "DELETE FROM notifications WHERE message NOT LIKE 'El usuario%'",
                  (error) => {
                    if (error) {
                      console.log(error);
                    } else {
                      // Crear notificación de eliminación de usuario
                      const message = `El usuario ${results[0].user} se eliminó correctamente`;
                      insertNotification(id, message);

                      res.redirect("/");
                    }
                  }
                );
              }
            }
          );
        }
      });
    }
  });
};

function insertNotification(userId, message) {
  // Insertar notificación en la tabla "notifications"
  conexion.query(
    "INSERT INTO notifications (userId, message) VALUES (?, ?)",
    [userId, message],
    (error, results) => {
      if (error) {
        console.log(error);
      }
    }
  );
}
