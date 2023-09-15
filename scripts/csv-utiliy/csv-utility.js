const fs = require("node:fs/promises");
const { stdin: input, stdout: output } = require("node:process");
const readline = require("node:readline/promises");

String.prototype.decodeCSV = function ({delimiter = ";"} = {}) {
  const [headersLine, ...valuesLines] = this.split(/\r?\n/);
  const headers = headersLine.split(";");
  return valuesLines.map((line) => {
    const values = line.split(delimiter);
    return values.reduce((acc, item, index) => {
      acc[headers[index]] = item;
      return acc;
    }, {});
  });
};

Array.prototype.encodeCSV = function ({delimiter = ";"} = {}) {
    const headers = Object.keys(this.at(0)).join(delimiter);
    const values = this.map(item => Object.values(item).join(delimiter));

    return `${headers}\n${values.join('\n')}`;
}


readline.Interface.prototype.choiceQuestion = async function (
  question,
  choices
) {
  let answer;
  do {
    answer = await this.question(question);
  } while (!choices.includes(answer));

  return answer;
};
const CSV_FILE = "./username.csv";

fs.access(CSV_FILE, fs.constants.R_OK)
  .then(() => fs.readFile(CSV_FILE))
  .then((data) => data.toString())
  .then((data) => data.decodeCSV())
  .then((data) => processMode(data));

async function processMode(data) {
  const rl = readline.createInterface({ input, output });

  let answer;
  do {
    console.table(data);
    answer = await rl.question("What do you to do (quit,save,swap)? ");
    await processAnswer(rl, answer, data);
  } while (answer !== "quit");

  rl.close();
}

async function processAnswer(rl, choice, data) {
  switch (choice) {
    case "swap":
      await processSwap(rl, data);
      break;
    case "save":
      await processSave(rl, data);
      break;
  }
}

async function processSwap(rl, data) {
  const headers = Object.keys(data[0]);
  const firstCol = await rl.choiceQuestion("First column ? ", headers);
  const secondCol = await rl.choiceQuestion("Second column ? ", headers);

  const indexFirstCol = headers.indexOf(firstCol);
  const indexSecondCol = headers.indexOf(secondCol);

  data.forEach((item, index) => {
    const entries = Object.entries(item);
    const firstColTuple = entries[indexFirstCol];
    const secondColTuple = entries[indexSecondCol];
    entries.splice(indexFirstCol, 1, secondColTuple);
    entries.splice(indexSecondCol, 1, firstColTuple);

    data[index] = Object.fromEntries(entries);
  });

  console.log("Swap done !");
}

async function processSave(rl, data) {
  const answer =
    (await rl.question("Where do you want to save (default: in-place) ? ")) ||
    "in-place";
  const filePath = answer === "in-place" ? CSV_FILE : answer;
  if (await checkWritable(filePath)) {
    await fs.writeFile(filePath, data.encodeCSV());
    console.log("File saved");
  } else {
    console.error(`File "${filePath}" not writable`);
  }
}

async function checkWritable(filePath) {
  try {
    await fs.access(filePath, fs.constants.F_OK);
    await fs.access(filePath, fs.constants.W_OK);
    return true;
  } catch (error) {
    return error.code === "ENOENT";
  }
}
