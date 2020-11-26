const mongoose = require("mongoose");
mongoose.Promise = Promise;

const runModel = require("../mongo/models/run");
const Run = mongoose.model("run");

const getRuns = () => {
  const criteria = {};
  return Run.find(criteria);
}

const moment = require("moment");

const getRunAtTime = (date) => {
  return new Promise((resolve, reject) => {
    const criteria = {
      "time.start": { $lt: date },
      "time.end": { $gt: date },
    };

    Run.find(criteria)
      .then((runs) => resolve(runs[0]))
      .catch((err) => reject(err))
  });
};

const getNextRun = (currentRun) => {
  return new Promise((resolve, reject) => {
    if (currentRun) {
      const criteria = {
        "time.start": currentRun.time.end,
      };

      Run.find(criteria)
        .then((runs) => resolve(runs[0]))
        .catch((err) => reject(err));
    } else {
      resolve(null);
    }
  });
};

module.exports = {
  getRuns,
  getRunAtTime,
  getNextRun,
};
