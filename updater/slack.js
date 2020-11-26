const request = require("request");

const credentials = require("./slackCredentials");

module.exports = (message) => {
  return new Promise((resolve, reject) => {
    const postOptions = {
      method: "POST",
      json: true,
      url: credentials.url,
      body: {
        username: "Games Done Quick",
        icon_emoji: ":video_game:",
        text: message,
        channel: credentials.channel,
      },
    };

    request.post(postOptions, (err, res, body) => {
      if (err) return reject(err);
      body === "ok" ? resolve(body) : reject(`Couldn't post a message to Slack: ${body}`);
    });
  });
}
