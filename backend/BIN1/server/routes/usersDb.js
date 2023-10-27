const { Router } = require("express");
const User = require("../models/User");
const router = new Router();

router.get("/users", async (req, res, next) => {
  //res.status(200).send(JSON.stringify(users));
  res.json(
    await User.findAll({
      where: req.query,
    })
  );
});

router.post("/users", async (req, res, next) => {
  try {
    res.status(201).json(await User.create(req.body));
  } catch (err) {
    res.status(422).json({
      email: err.message,
    });
  }
});

router.get("/users/:id", async (req, res, next) => {
  const user = await User.findByPk(parseInt(req.params.id));
  if (user) {
    res.json(user);
  } else {
    //res.status(404).end();
    res.sendStatus(404);
  }
});

router.patch("/users/:id", (req, res, next) => {
  try {
    const userIndex = users.findIndex((u) => u.id === req.params.id);
    if (userIndex === -1) {
      res.sendStatus(404);
    } else {
      const user = Object.assign({}, users[userIndex], req.body);
      if (user.email === undefined) {
        throw new Error("email not found");
      }
      users[userIndex] = user;
      res.json(user);
    }
  } catch (err) {
    res.status(422).json({
      email: err.message,
    });
  }
});

router.delete("/users/:id", (req, res, next) => {
  const userIndex = users.findIndex((u) => u.id === req.params.id);
  if (userIndex === -1) {
    res.sendStatus(404);
  } else {
    users.splice(userIndex, 1);
    res.sendStatus(204);
  }
});

router.put("/users/:id", (req, res, next) => {
  try {
    const userIndex = users.findIndex((u) => u.id === req.params.id);
    const user = req.body;
    user.id = req.params.id;
    if (userIndex === -1) {
      users.push(user);
      res.status(201).json(user);
    } else {
      users[userIndex] = user;
      res.json(user);
    }
  } catch (err) {
    res.status(422).json({
      email: err.message,
    });
  }
});

module.exports = router;
