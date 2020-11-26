const mongoose = require("mongoose");

module.exports = () => {
  return new Promise((resolve, reject) => {
    const run = require("./models/run");

    const host = "localhost";
    const port = "27017";
    const database = "gdq";

    mongoose.connect(`${host}:${port}/${database}`, (err) => {
      err ? reject(err) : resolve();
    });
  });
};
