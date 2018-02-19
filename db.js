const DROP_TABLE = "DROP TABLE IF EXISTS sysnet;";
const CREATE_TABLE = `CREATE TABLE sysnet
(id SERIAL PRIMARY KEY, name text NOT NULL, size integer NOT NULL);`;

const SAVE_RECORD =
  "INSERT INTO sysnet(name, size) VALUES($1, $2) RETURNING *;";

const GET_ALL = "SELECT * FROM sysnet ORDER BY (id);";

function db(client) {
  return {
    async initTable() {
      await client.query(DROP_TABLE);
      return await client.query(CREATE_TABLE);
    },

    async saveRecord({ name, size }) {
      try {
        return await client.query(SAVE_RECORD, [name, size]);
      } catch (e) {
        console.log("storing failed", e);
      }
    },

    async selectAll() {
      return await client.query(GET_ALL);
    }
  };
}

module.exports = {
  db
};
