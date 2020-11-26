const request = require("request");
const moment = require("moment-timezone");

moment.tz.setDefault("Europe/London");

const handlers = {
  GetCurrentRun: (event, context, callback) => {
    databaseRequest("/runs/now")
      .then((run) => {
        if (run) {
          const now = new Date();
          const name = run.name;
          const start = relativeTime(now, run.time.start);
          const end = relativeTime(now, run.time.end);

          const elapsedTime = hoursAndMinutes(moment.duration(moment(now).diff(run.time.start)).toISOString());
          const elapsed = elapsedTime ? `It's ${elapsedTime} in.` : "It just started!";

          callback(null, buildResponse(
            `The current run is ${name}. ${elapsed} It started at ${start} and finishes at ${end}`
          ));
        } else {
          callback(null, buildResponse("There doesn't appear to be a run on at the moment."));
        }
      })
      .catch((err) => handleError(err, callback));
  },

  GetNextRun: (event, context, callback) => {
    databaseRequest("/runs/next")
      .then((run) => {
        if (run) {
          const now = new Date();
          const name = run.name;
          const duration = hoursAndMinutes(run.time.duration);
          const start = relativeTime(now, run.time.start);
          const end = relativeTime(now, run.time.end);

          callback(null, buildResponse(
            `The next run is ${name}. It's ${duration} long, starts at ${start} and finishes at ${end}`
          ));
        } else {
          callback(null, buildResponse("There doesn't appear to be any more runs."));
        }
      })
      .catch((err) => handleError(err, callback));
  },

  GetRunAtTime: (event, context, callback) => {
    const slots = event.request.intent.slots;
    const dateTime = parseDateTime(slots.Date.value, slots.Time.value);

    if (isNaN(dateTime.getTime())) {
      return handleError(slots, callback);
    }

    databaseRequest(`/runs/at/${dateTime.toISOString()}`)
      .then((run) => {
        if (run) {
          const now = new Date();
          const name = run.name;
          const duration = hoursAndMinutes(run.time.duration);
          const start = relativeTime(now, run.time.start);
          const end = relativeTime(now, run.time.end);
          const date = relativeDateTime(now, dateTime);
          const tense = tenseNumber(now, dateTime);
          const tenseAt = tenseNumber(now, run.time.end) === -1 ? "was" : "is";
          const tenseStart = tenseNumber(now, run.time.start) === -1 ? "started" : "starts";
          const tenseEnd = tenseNumber(now, run.time.end) === -1 ? "finished" : "finishes";

          callback(null, buildResponse(
            `The run at ${date} ${tenseAt} ${name}. It's ${duration} long, ${tenseStart} at ${start} and ${tenseEnd} at ${end}`
          ));
        } else {
          callback(null, buildResponse(`There doesn't appear to be a run at ${date}.`));
        }
      });
  },
};

function handleError(err, callback) {
  console.error(err);
  callback(null, buildResponse("Something went wrong."));
}

exports.handler = (event, context, callback) => {
  if (event.request.type === "IntentRequest") {
    const intent = event.request.intent.name;

    if (handlers[intent]) {
      handlers[intent](event, context, callback);
    } else {
      handleError(new Error("Intent not supported"), callback);
    }
  }
};

function databaseRequest(route) {
  return new Promise((resolve, reject) => {
    request(`http://178.62.0.124:3000${route}`, (err, response, body) => {
      if (err) reject(err);
      resolve(body ? JSON.parse(body) : null);
    });
  });
}

function buildResponse(output) {
  return {
    version: "1.0",
    response: {
      outputSpeech: {
        type: "PlainText",
        text: output,
      },
      shouldEndSession: true,
    },
  };
}

function parseDateTime(date, time) {
  const formats = [
    "YYYY-MM-DD HH:mm",
    "YYYY-MM-DD HH",
    "YYYY-MM-DD",
    "HH:mm",
    "HH",
  ];

  const dateTimeString = [date, time].map((part) => part || "").join(" ");
  return moment(dateTimeString, formats).toDate();
}

function tenseNumber(from, to) {
  console.log(from, to);
  const epochFrom = Number(new Date(from));
  const epochTo = Number(new Date(to));

  if (epochFrom === epochTo) {
    return 0;
  } else {
    return (epochFrom > epochTo) ? -1 : 1;
  }
}

function relativeDateTime(from, to) {
  const tense = tenseNumber(from, to);
  const days = daysDifference(from, to);
  let relativeString = moment(to).format("HH:mm a ");

  if (days === 0) {
    relativeString += "today";
  } else if (days === 1) {
    relativeString += "tomorrow";
  } else if (days === -1) {
    relativeString += "yesterday";
  } else if (days > 1 && days < 7) {
    relativeString += `this ${moment(to).format("dddd")}`;
  } else if (days < 1 && days > -7) {
    relativeString += `last ${moment(to).format("dddd")}`;
  } else {
    relativeString += moment(to).format("dddd Do MMMM");
  }

  return relativeString;
}

function relativeDayWord(from, to) {
  switch (daysDifference(from, to)) {
    case 1: return "tomorrow";
    case -1: return "yesterday";
  }

  return "";
}

function daysDifference(from, to) {
  return moment(to).dayOfYear() - moment(from).dayOfYear();
}

function relativeTime(from, to) {
  const time = moment(to).format("h:mm A");
  const relativeDay = relativeDayWord(from, to);

  return `${time} ${relativeDay}`;
}

function hoursAndMinutes(isoDuration) {
  const duration = moment.duration(isoDuration);
  const hours = duration.hours();
  const minutes = duration.minutes();
  const parts = [];

  if (hours) { parts.push(`${hours} hour${numberPlural(hours)}`); }
  if (minutes) { parts.push(`${minutes} minute${numberPlural(minutes)}`); }

  return parts.join(" and ");
}

function numberPlural(number) {
  return Math.abs(number) === 1 ? "" : "s";
}
