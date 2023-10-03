require("../csv-utiliy/lib");
const fs = require("node:fs/promises");
const https = require("node:https");
const path = require("node:path");
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

        if (res.headers["content-type"].includes("application/json")) {
          data = JSON.parse(data);
        }

        data = processData(data.results);

        saveData(data);
      });
    }
  })
  .end();

// calculer le prix moyen de chaque carburant par ville
function processData(data) {
  const cities = {};
  for (const item of data) {
    cities[item.cp] = cities[item.cp] ?? {
      CP: parseInt(item.cp),
      Ville: item.ville,
      CODE_DEPT: parseInt(item.code_departement),
      DEP: item.departement,
      CODE_REG: parseInt(item.code_region),
      REGION: item.region,
      carburants: {
        GAZOLE: [],
        SP95: [],
        E85: [],
        GPLC: [],
        E10: [],
        SP98: [],
      },
    };

    for (const carburant in cities[item.cp].carburants) {
      //cities[item.cp].GAZOLE.push(parseFloat(item.gazole_prix));
      if (!isNaN(parseFloat(item[carburant.toLowerCase() + "_prix"]))) {
        cities[item.cp].carburants[carburant].push(
          parseFloat(item[carburant.toLowerCase() + "_prix"])
        );
      }
    }
  }

  for (const cp in cities) {
    //cities[cp].GAZOLE =
    //  cities[cp].GAZOLE.reduce((acc, item) => acc + item, 0) /
    //  cities[cp].GAZOLE.length;
    for (const carburant in cities[cp].carburants) {
      cities[cp][carburant.toUpperCase()] =
        cities[cp].carburants[carburant].sum() /
        (cities[cp].carburants[carburant].length || 1);
    }
    delete cities[cp].carburants;
  }

  return Object.values(cities);
}

// CP;Ville;CODE_DEPT;DEP;CODE_REG;REGION;GAZOLE;SP95;E85;GPLC;E10;SP98
function saveData(data) {
  fs.writeFile(path.join(process.cwd(), "data.csv"), data.encodeCSV());
}
