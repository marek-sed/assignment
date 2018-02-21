require("dotenv").load();
const express = require("express");
const path = require('path');
const { Pool } = require("pg");
const { db } = require("./server/db");
const { createParser } = require("./server/parser");
const { fetchData } = require("./server/fetchData");
const { storeDataFactory } = require("./server/storeData");
const { plantATree } = require("./server/tree");

async function getTree(queries) {
  const { rows } = await queries.selectAll();
  return plantATree(rows);
}

const app = express();
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

if (process.env.NODE_ENV === 'development') {
  const args = ["start"];
  const opts = { stdio: "inherit", cwd: "client", shell: true };
  require("child_process").spawn("npm", args, opts);
}

async function startServer() {
  const pool = new Pool();
  await pool.connect();
  const queries = db(pool);

  app.get("/tree", async (req, res) => {
    const tree = await getTree(queries);
    res.json(tree);
  });

  app.listen(3001, () => {
    console.log("listening on port 3001");
  });
}

startServer();
