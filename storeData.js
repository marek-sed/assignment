const progress = require("cli-progress");

const storingBar = new progress.Bar({}, progress.Presets.shades_classic);
function storeDataFactory(queries) {
  return async function(records) {
    console.log('storing data')
    storingBar.start(records.length, 0);
    try {
      for (let record of records) {
        const { rows } = await queries.saveRecord(record);
        storingBar.increment();
      }
    } catch (e) {
      console.log("storing failed", e);
    }
    storingBar.stop();
  };
}

module.exports = {
  storeDataFactory
};
