const { Router } = require("express");
const { ValidationError } = require("sequelize");
const User = require("../models/User");
const router = new Router();

router.get("/users", async (req, res, next) => {
  const users = await User.findAll({
    where: req.query,
  });
  res.json(users);
});

router.post("/users", async (req, res, next) => {
  try {
    res.status(201).json(await User.create(req.body));
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(422).json({});
    }
  }
});

router.get("/users/:id", async (req, res, next) => {
  const user = await User.findByPk(parseInt(req.params.id));
  if (!user) res.sendStatus(404);
  else res.json(user);
});

router.put("/users/:id", async (req, res, next) => {
  const result = await User.destroy({
    where: {
      id: parseInt(req.params.id),
    },
  });
  const user = await User.create({
    ...req.body,
    id: parseInt(req.params.id),
  });

  res.status(result ? 200 : 201).json(user);
});

router.delete("/users/:id", async (req, res, next) => {
  const result = await User.destroy({
    where: {
      id: parseInt(req.params.id),
    },
  });

  res.sendStatus(result ? 204 : 404);
});

module.exports = router;
