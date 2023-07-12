const express = require("express");
const router = express.Router();
const conexion = require("./database/db");
const ejs = require("ejs");
const crud = require("./controllers/crud");

router.get("/", (req, res) => {
  const getUsersQuery = "SELECT * FROM users";
  const getNotificationsQuery = "SELECT * FROM notifications";

  const getUsers = new Promise((resolve, reject) => {
    conexion.query(getUsersQuery, (error, users) => {
      if (error) {
        reject(error);
      } else {
        resolve(users);
      }
    });
  });

  const getNotifications = new Promise((resolve, reject) => {
    conexion.query(getNotificationsQuery, (error, notifications) => {
      if (error) {
        reject(error);
      } else {
        resolve(notifications);
      }
    });
  });

  Promise.all([getUsers, getNotifications])
    .then(([users, notifications]) => {
      res.render("index", {
        user: null,
        results: users,
        notifications: notifications,
      });
    })
    .catch((error) => {
      throw error;
    });
});

router.get("/create", (req, res) => {
  res.render("create");
});

router.get("/edit/:id", (req, res) => {
  const id = req.params.id;
  conexion.query("SELECT * FROM users WHERE id=?", [id], (error, results) => {
    if (error) {
      throw error;
    } else {
      res.render("edit", { user: results[0] });
    }
  });
});

router.get("/delete/:id", (req, res) => {
  const id = req.params.id;
  conexion.query("DELETE FROM users WHERE id= ?", [id], (error, results) => {
    if (error) {
      throw error;
    } else {
      res.redirect("/");
    }
  });
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await User.deleteUser(id);

    // Obtener todos los usuarios restantes
    const users = await User.getAllUsers();

    // Actualizar los IDs de los usuarios restantes
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      await User.updateUser(user.id, { id: i + 1 });
    }

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/save", crud.save);
router.post("/update", crud.update);

module.exports = router;
