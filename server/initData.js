require("dotenv").load();
const express = require("express");

const { db } = require("./db");
const { Client } = require("pg");
const { createParser } = require("./parser");
const { fetchData } = require("./fetchData");
const { storeDataFactory } = require("./storeData");

async function initData() {
  const client = new Client();
  await client.connect();

  const queries = db(client);
  await queries.initTable();

  const parser = createParser();
  const parsedRecords = await fetchData(parser);

  const storeData = storeDataFactory(queries);
  const data = await storeData(parsedRecords);
  client.end();

  return data;
}

initData().then(() => console.log('data initialized'));