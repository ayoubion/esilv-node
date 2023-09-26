// 87c2a2a8a98a4ba081c798f831e0e9a2
// https://newsapi.org/v2/top-headlines?country=ua&apiKey=API_KEY
const https = require("node:https");
const fs = require("node:fs/promises");
const { JSDOM } = require("jsdom");
require("../csv-utiliy/lib");

const request = https.request(
  //"https://newsapi.org/v2/top-headlines?country=ua&apiKey=87c2a2a8a98a4ba081c798f831e0e9a2",
  //"https://flylib.com/books/1/2/1/html/2/148_files/image001.gif",
  "https://fr.wikipedia.org/wiki/Liste_des_codes_HTTP",
  {
    headers: {
      "User-Agent": "scrapper",
    },
  },
  (res) => {
    console.log(res.statusCode);
    console.log(res.headers);
    let bufferList = [];

    // lecture des buffers de la réponse
    res.on("data", (data) => {
      bufferList.push(data);
    });

    // end de fin de lecture de buffers
    res.on("end", async () => {
      // Generic process
      let data = Buffer.concat(
        bufferList,
        bufferList.reduce((acc, b) => ((acc += b.length), acc), 0)
      );
      /* <=>
        let data = Buffer.concat(bufferList, bufferList.reduce((acc, b) => {
            acc += b.length;
            return acc;
        }, 0));
        */
      if (
        res.headers["content-type"].match(/^(application|text)\/json/i) ||
        res.headers["content-type"].match(/^(application|text)\/(x|ht)ml/i)
      ) {
        data = data.toString();
        if (res.headers["content-type"].match(/^(application|text)\/json/i)) {
          data = JSON.parse(data);
        }
        if (
          res.headers["content-type"].match(/^(application|text)\/(x|ht)ml/i)
        ) {
          data = new JSDOM(data).window.document;
        }
      }

      // Specific process
      // API JSON News API
      //data = data.articles.map(({ author, title, publishedAt }) => ({
      //  author,
      //  title,
      //  publishedAt: new Date(publishedAt),
      //}));
      // Page WEB
      const trs = data.querySelectorAll(
        "table.wikitable.alternance tr:not(:first-child)"
      );
      data = Array.from(trs).map((tr) => ({
        code: parseInt(tr.children[0].textContent.trim()),
        message: tr.children[1].textContent.trim(),
      }));
      // Save Data
      // API JSON News API
      data = data.encodeCSV();
      await fs.writeFile("./output.csv", data);
      // Image
      //const extension = res.headers["content-type"].replace(/^[^\/]+\//, '').replace(/;.*$/, '');
      //await fs.writeFile("./output." + extension, data);
      
      console.log("Process completed");
    });
  }
);

request.end();
