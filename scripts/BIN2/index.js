const fs = require("node:fs/promises");
const https = require("node:https");
const InputUrl =
  "https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records?limit=20";

https
  .request(InputUrl, function (res) {
    if (res.statusCode === 200) {
      const bufferList = [];
      res.on("data", function (data) {
        bufferList.push(data);
      });

      res.on("end", function () {
        let data = Buffer.concat(bufferList).toString();
        data = JSON.parse(data);
        console.log(data);

        // CSV contenant le prix moyen de chaque carburant par ville
        // CP;Ville;CODE_DEPT;DEP;CODE_REG;REGION;GAZOLE;SP95;E85;GPLC;E10;SP98
      });
    }
  })
  .end();
