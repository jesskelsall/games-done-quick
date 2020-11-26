const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const runSchema = new Schema({
  time: {
    start: Date,
    setup: String,
    duration: String,
    end: Date,
  },
  name: String,
  runners: [String],
  category: String,
});

module.exports = mongoose.model("run", runSchema);
