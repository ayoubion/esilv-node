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

Array.prototype.sum = function () {
  return this.reduce((acc, item) => acc + item, 0);
};