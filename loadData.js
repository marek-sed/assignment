require("dotenv").load();
const fetch = require("node-fetch");
const progress = require("cli-progress");
const { Client } = require("pg");
const { createParser } = require("./parser");
const { plantATree } = require("./plantATree");

// we ignore 2 nodes without wnid
const nodeCount = 60942;
const transformationBar = new progress.Bar({}, progress.Presets.shades_classic);
const storingBar = new progress.Bar({}, progress.Presets.shades_classic);

const url =
  "https://s3.amazonaws.com/static.operam.com/assignment/structure_released.xml";

const client = new Client();

const DROP_TABLE = "DROP TABLE IF EXISTS sysnet;";
const CREATE_TABLE = `CREATE TABLE sysnet
(id SERIAL PRIMARY KEY, name text NOT NULL, size integer NOT NULL);`;

const SAVE_RECORD =
  "INSERT INTO sysnet(name, size) VALUES($1, $2) RETURNING *;";

const GET_ALL = "SELECT * FROM sysnet ORDER BY (id);";

async function loadData(db) {
  try {
    await client.connect();
    await client.query(DROP_TABLE);
    await client.query(CREATE_TABLE);
    await client.query("DELETE FROM sysnet");
    console.log("fetching data");
    const res = await fetch(url);

    const Parser = createParser();
    Parser.wStream.on("closetag", () => {
      transformationBar.increment();
    });

    console.log("Parsing data from server");
    transformationBar.start(nodeCount + 2, 0);
    res.body.pipe(Parser.wStream);
    const parsedRecords = await Parser.parsedRecords;
    transformationBar.stop();
    await storeToDb(client, parsedRecords);

    const { rows } = await client.query(GET_ALL);
    plantATree(rows);
    client.end();
  } catch (e) {
    console.log("e", e);
  }
}

const storeToDb = async (client, records) => {
  console.log("storing data");
  storingBar.start(nodeCount, 0);
  const stored = [];
  try {
    for (let record of records) {
      storingBar.increment();
      const { name, size } = record;
      const { rows } = await client.query(SAVE_RECORD, [name, size]);
      stored.push(rows);
    }
  } catch (e) {
    console.log("storing failed", e);
  }

  storingBar.stop();
  return stored;
};

module.exports = {
  loadData
}
