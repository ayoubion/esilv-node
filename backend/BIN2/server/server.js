const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const PORT = process.env.PORT || 3000;
const userRouter = require("./routes/user");
const { ValidationError } = require("sequelize");
const User = require("./models/User");
const app = express();

//function parseBody(req, res, next) {
//  if (!["POST", "PUT", "PATCH"].includes(req.//method)) next();
//  const bufferList = [];
//  req.on("data", function (data) {
//    bufferList.push(data);
//  });
//
//  req.on("end", function () {
//    let data = Buffer.concat(bufferList);
//    req.body = JSON.parse(data.toString());
//    next();
//  });
//}
//
//app.use(parseBody);

app.use(express.json());
//app.use(express.urlencoded({ extended: //true }));
//app.use(express.text());
//app.use(express.raw());

app.get("/", (req, res, next) => {
  res.send("Hello World!" + JSON.stringify(req.query));
});

app.post("/", (req, res, next) => {
  res.send("Hello World! from POST" + JSON.stringify(req.body));
});

app.put("/", (req, res, next) => {
  const bufferList = [];
  req.on("data", function (data) {
    bufferList.push(data);
  });

  req.on("end", function () {
    let data = Buffer.concat(bufferList);
    res.send("Hello World! from POST" + data.toString());
  });
});
app.patch("/", (req, res, next) => {
  res.send("Hello World! from PATCH" + JSON.stringify(req.body));
});

app.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({
    where: {
      email,
    },
  });
  if (!user) return res.sendStatus(401);
  if (!(await bcrypt.compare(password, user.password)))
    return res.sendStatus(401);

  res.json({
    token: jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2 days",
      }
    ),
  });
});

app.use(userRouter);

app.use((error, req, res, next) => {
  if (error instanceof ValidationError) {
    console.log(error);
    return res.status(422).json(/* TODO */ {});
    /**
     * Exemple:
     * {
     *    "email": [
     *        "Is not an email",
     *        "Cannot be empty"
     *    ]
     * }
     */
  }
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
