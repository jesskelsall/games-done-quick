const mongoose = require("mongoose");
mongoose.Promise = Promise;

const connect = require("../mongo");
const runModel = require("../mongo/models/run");

function castRuns(runs) {
  return new Promise((resolve, reject) => {
    const Run = mongoose.model("run");

    try {
      resolve(runs.map((run) => {
        return new Run(run);
      }));

    } catch (err) {
      reject(err);
    }
  });
}

module.exports = (runs) => {
  const Run = mongoose.model("run");

  return connect()
    .then(() => Run.remove({}))
    .then(() => castRuns(runs))
    .then((docs) => Run.insertMany(docs));
};
