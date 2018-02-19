require("dotenv").load();
const { db } = require("./db");
const { Client } = require("pg");
const { createParser } = require("./parser");
const { loadData } = require("./loadData");
const { storeDataFactory } = require("./storeData");
const { treeOfLife } = require("./eden");

async function initData() {
  const client = new Client();
  await client.connect();
  const queries = db(client);
  await queries.initTable();

  const parser = createParser();
  const parsedRecords = await loadData(parser);

  const storeData = storeDataFactory(queries);
  await storeData(parsedRecords);

  const { rows } = await queries.selectAll();
  const tree = treeOfLife(rows); 
  client.end();
  return tree;
}

initData().then(tree => console.log('tree', tree));