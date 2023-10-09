require("../csv-utiliy/lib");
const fs = require("node:fs/promises");
const https = require("node:https");
const path = require("node:path");
const { JSDOM } = require("jsdom");
//const InputUrl =
//  "https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records?limit=20";
//const InputUrl = "https://fr.wikipedia.org/wiki/Liste_des_codes_HTTP";
const InputUrl =
  "https://www.powertrafic.fr/wp-content/uploads/2023/04/image-ia-exemple.png";

https
  .request(InputUrl, function (res) {
    if (res.statusCode === 200) {
      const bufferList = [];
      res.on("data", function (data) {
        bufferList.push(data);
      });

      res.on("end", function () {
        let data = Buffer.concat(bufferList);

        if (res.headers["content-type"].includes("application/json")) {
          data = JSON.parse(data.toString());
        }
        if (res.headers["content-type"].includes("text/html")) {
          data = new JSDOM(data.toString()).window.document;
        }
        if (res.headers["content-type"].includes("image/") || res.headers["content-type"].includes("video/")) {
          const extension = res.headers["content-type"].split("/")[1];
          fs.writeFile(path.join(process.cwd(), "image." + extension), data);
          return;
        }

        //data = processData(data);
        data = processData2(data);

        saveData(data);
      });
    }
  })
  .end();

// calculer le prix moyen de chaque carburant par ville
function processData(data) {
  data = data.results;
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

// get code and message for wikipedia http codes page
processData2 = (document) => {
  return Array.from(
    document.querySelectorAll("table.wikitable.alternance tr:not(:first-child)")
  ).map(function (tr) {
    return {
      code: parseInt(tr.children[0].textContent.trim()),
      message: tr.children[1].textContent.trim(),
    };
  });
};
