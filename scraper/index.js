const scraper = require("./scraper");

scraper().then((runs) => {
  console.log(JSON.stringify(runs, null, 2));
});
