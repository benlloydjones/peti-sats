const fetch = require("isomorphic-fetch");

const petitionUrl = "https://petition.parliament.uk/petitions.json?state=open";
const petitionInterval = 1000 * 60 * 60;

let intervalId = null;
const petitions = {};

async function getPetitions(url, timeStamp) {
  if (!timeStamp) {
    const now = new Date();
    timeStamp = now.toString();
  }
  const {
    links: { next },
    data
  } = await fetch(url, { method: "GET" })
    .then(res => {
      if (!res.ok) throw Error("oh noes!");
      return res.json();
    })
    .then(json => json)
    .catch(err => console.warn(err.message));
  updatePetitions(data, timeStamp);
  if (!next) {
    return;
  }
  await getPetitions(next, timeStamp);
}

function updatePetitions(newData, timestamp) {
  Object.keys(newData).forEach(key => {
    const {
      id,
      attributes: { signature_count }
    } = newData[key];
    petitions[id] = {
      ...petitions[id],
      [timestamp]: signature_count
    };
  });
}

const stopFetchingPetitions = ctx => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    ctx.body = "You stopped the service!";
  } else {
    ctx.status = 400;
    ctx.body = "No service to stop";
  }
};

const startFetchingPetitions = ctx => {
  if (intervalId === null) {
    getPetitions(petitionUrl);
    intervalId = setInterval(() => getPetitions(petitionUrl), petitionInterval);
    ctx.status = 200;
    ctx.body = "Service has started";
  } else {
    ctx.status = 400;
    ctx.body = "Service already running";
  }
};

const getPetitionById = ctx => {
  const { id } = ctx.params;

  if (petitions[id]) {
    const responseObject = { id, signaturesByTime: petitions[id] };
    ctx.status = 200;
    ctx.type = "application/json";
    ctx.body = JSON.stringify(responseObject);
  } else {
    ctx.status = 404;
    ctx.body = `Could not find petition with id ${id}`;
  }
};

const getAllPetitions = ctx => {
  ctx.status = 200;
  ctx.type = "application/json";
  ctx.body = JSON.stringify(petitions);
};

module.exports = {
  stopFetchingPetitions,
  startFetchingPetitions,
  getPetitionById,
  getAllPetitions
};
