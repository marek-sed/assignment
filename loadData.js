const fetch = require("node-fetch");
const progress = require("cli-progress");

const url =
  "https://s3.amazonaws.com/static.operam.com/assignment/structure_released.xml";

// we ignore 2 nodes without wnid
const nodeCount = 60942;
const transformationBar = new progress.Bar({}, progress.Presets.shades_classic);


async function loadData(parser) {
  let records = null;
  try {
    console.log("fetching data");
    const res = await fetch(url);

    parser.wStream.on("closetag", () => {
      transformationBar.increment();
    });

    console.log("parsing data from server");
    transformationBar.start(nodeCount + 2, 0);
    res.body.pipe(parser.wStream);
    records = await parser.parsedRecords;
    transformationBar.stop();
  } catch (e) {
    console.log("e", e);
  }

  return records;
}

module.exports = {
  loadData
};
