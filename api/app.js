const express = require("express");
const mongoose = require("mongoose");

const connect = require("../mongo");
const database = require("./database");

function setupServer() {
  return new Promise((resolve, reject) => {
    const app = express();

    app.get("/runs", (req, res) => {
      database.getRuns()
        .then((runs) => res.send(runs))
        .catch((err) => res.send(`${err.name}: ${err.message}`).statusCode(500));
    });

    app.get("/runs/now", (req, res) => {
      const date = new Date();

      database.getRunAtTime(date)
        .then((run) => res.send(run))
        .catch((err) => res.send(`${err.name}: ${err.message}`).statusCode(500));
    });

    app.get("/runs/next", (req, res) => {
      const date = new Date();

      database.getRunAtTime(date)
        .then((run) => database.getNextRun(run))
        .then((run) => res.send(run))
        .catch((err) => res.send(`${err.name}: ${err.message}`).statusCode(500));
    });

    app.get("/runs/at/:timestamp", (req, res) => {
      const date = new Date(req.params.timestamp);

      database.getRunAtTime(date)
        .then((run) => res.send(run))
        .catch((err) => res.send(`${err.name}: ${err.message}`).statusCode(500));
    });

    resolve(app);
  });
}

function startServer(app) {
  return new Promise((resolve, reject) => {

    const server = app.listen(3000, () => {
      const port = server.address().port;

      resolve(`GDQ API listening on port ${port}`);
    });

  });
}

connect()
  .then(() => setupServer())
  .then((app) => startServer(app))
  .then((message) => {
    console.log(message);
  })
  .catch((err) => {
    console.error("Could not start the GDQ API server:");
    console.error(err);
  });
