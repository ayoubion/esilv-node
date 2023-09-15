const fs = require("node:fs/promises");
const path = require("node:path");

const STRUCT_FILE = "./structure";

const virtualStructure = [];
fs.access(STRUCT_FILE, fs.constants.R_OK)
  .then(() => fs.readFile(STRUCT_FILE))
  .then((data) => data.toString())
  .then((data) => data.split(/\n\r?/))
  .then((data) =>
    data.reduce(
      (acc, item) => {
        if (/^\s*$/.test(item)) return acc;

        const { level, ...node } = determineFileInfos(item);

        if (level > acc.level) {
          if (Array.isArray(acc.cursor))
            acc.cursor = acc.cursor[acc.cursor.length - 1];
          else {
            acc.cursor = acc.cursor.children[acc.cursor.children.length - 1];
          }
          acc.level = level;
        } else if (level < acc.level) {
          acc.cursor = acc.cursor.parent;
          acc.level = level;
        }

        node.parent = acc.cursor;

        if (Array.isArray(acc.cursor)) acc.cursor.push(node);
        else {
          acc.cursor.children.push(node);
        }

        return acc;
      },
      {
        result: virtualStructure,
        cursor: virtualStructure,
        level: 0,
      }
    )
  )

  .then(({ result }) => generateStructure(result))
  .then(() => console.log("Structure created"));

function determineFileInfos(item) {
  const node = {};
  if (/^\s*\w/i.test(item) && !/.*->.*/.test(item)) {
    node.type = "folder";
    node.children = [];
  } else if (/^\s*-\s+\w/i.test(item)) {
    node.type = "file";
  } else if (/.*->.*/.test(item)) {
    node.type = "link";
    node.source = item.replace(/^.*->\s+/, "");
  }
  node.name = item.replace(/^\s*-?\s+/, "").replace(/\s+->.*/, "");

  const level = item.match(/^\s*/)[0].length;

  return { level, ...node };
}

async function generateStructure(structure, currentPath = "./") {
  if (Array.isArray(structure)) {
    await Promise.all(structure.map((sub) => generateStructure(sub)));
  } else {
    const filePath = path.join(currentPath, structure.name);
    switch (structure.type) {
      case "folder":
        if (!(await fileExists(filePath))) await fs.mkdir(filePath);
        await Promise.all(
          structure.children.map((sub) => generateStructure(sub, filePath))
        );
        break;
      case "file":
        if (!(await fileExists(filePath))) await fs.writeFile(filePath, "");
        break;
      case "link":
        if (!(await fileExists(filePath)))
          await fs.symlink(
            path.join(process.cwd(), structure.source),
            filePath
          );
        break;
    }
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath, fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}
