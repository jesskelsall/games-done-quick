const cheerio = require("cheerio");
const moment = require("moment");
const request = require("request");

module.exports = function scraper() {
  return new Promise((resolve, reject) => {

    const url = "https://gamesdonequick.com/schedule";

    request(url, (err, response, html) => {
      if (err) return reject(err);

      const $ = cheerio.load(html);

      const table = $("#runTable");
      const tableRows = $(table).children("tbody").children("tr");

      const runs = [];
      let run = {};
      let count = 5;

      $(tableRows).each((rowIndex, row) => {
        const columns = $(row).children("td");

        let classes = $(row).attr("class");
        classes = classes ? classes.split(" ") : [];

        // First row
        if (classes.length === 0) {

          // Start time
          const rawTime = $(columns).eq(0).text().trim();
          if (rawTime) run.time = { start: new Date(rawTime) };

          // Run name
          const rawName = $(columns).eq(1).text().trim();
          if (rawName) run.name = rawName;

          // Runners
          const rawRunners = $(columns).eq(2).text().trim();
          if (rawRunners) run.runners = rawRunners.split(",").map((runner) => runner.trim());

          // Setup duration
          const rawSetup = $(columns).eq(3).text().trim();
          if (rawSetup) run.time.setup = moment.duration(rawSetup).toISOString();

        // Second row
        } else if (classes.includes("second-row")) {

          // Duration
          const rawDuration = $(columns).eq(0).text().trim();
          if (rawDuration) run.time.duration = moment.duration(rawDuration).toISOString();

          // Category
          const rawCategory = $(columns).eq(1).text().trim();
          if (rawCategory) run.category = rawCategory;

          // Computed end time
          if (run.time.start) {
            let duration = moment.duration(0);

            if (run.time.setup) duration = duration.add(moment.duration(run.time.setup));
            if (run.time.duration) duration = duration.add(moment.duration(run.time.duration));
            if (duration.asSeconds() === 0) duration = duration.add(moment.duration(1, "hours"));

            run.time.end = moment(run.time.start).add(duration).toDate();
          }

          runs.push(run);
          run = {};
        }
      });

      resolve(runs);

    });

  });

}
