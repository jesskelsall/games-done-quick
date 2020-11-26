const scraper = require("../scraper/scraper");
const updateDatabase = require("./database");
const postToSlack = require("./slack");

scraper()
  .then((runs) => updateDatabase(runs))
  .then(() => process.exit())
  .catch((err) => {
    console.error(err);

    postToSlack(":rotating_light: GDQ updater errored out! Check server mail for more info.")
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  });
