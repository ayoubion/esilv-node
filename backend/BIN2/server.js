const express = require("express");
const PORT = process.env.PORT || 3000;
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

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
