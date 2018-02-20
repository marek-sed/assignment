require("dotenv").load();
const { db } = require("./db");
const { Client } = require("pg");
const { createParser } = require("./parser");
const { fetchData } = require("./fetchData");
const { storeDataFactory } = require("./storeData");
const { treeOfLife } = require("./eden");
const express = require('express');

async function initData(queries) {
  await queries.initTable();

  const parser = createParser();
  const parsedRecords = await loadData(parser);

  const storeData = storeDataFactory(queries);
  await storeData(parsedRecords);

  return tree;
}

async function getTree(queries) {
  const { rows } = await queries.selectAll();
  return treeOfLife(rows); 
}

const app = express();
async function startServer() {
  const client = new Client();
  await client.connect();
  const queries = db(client);
  // await initData(queries);
  const tree = await getTree(queries);
  client.end();

  app.get('/', (req, res) => {
    res.send('Hello World');
  });

  app.get('/tree', (req, res) => {
    res.json(tree);
  })

  app.listen(3001, () => {
    console.log('listening on port 3001')
  });
}

startServer()