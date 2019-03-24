// @flow

const Koa = require("koa");
const Router = require("koa-router");
const fetch = require("isomorphic-fetch");

const app = new Koa();
const router = new Router();

let petitions;

const getPetitions = async (url, timeStamp) => {
  if (!timeStamp) {
    timeStamp = Date.now();
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
};

function updatePetitions(newData, timestamp) {
  if (!petitions) {
    petitions = Object.keys(newData).reduce((acc, key) => {
      const {
        id,
        attributes: { signature_count }
      } = newData[key];
      acc.set(id, new Map([[timestamp, signature_count]]));
      return acc;
    }, new Map());
  } else {
    Object.keys(newData).forEach(key => {
      const {
        id,
        attributes: { signature_count }
      } = newData[key];
      if (petitions.has(id)) {
        petitions.get(id).set(timestamp, signature_count);
      } else {
        petitions.set(id, new Map([[timestamp, signature_count]]));
      }
    });
  }
}

const url = "https://petition.parliament.uk/petitions.json?state=open";
const interval = 1000 * 60 * 60;

getPetitions(url);

let intervalId = setInterval(() => getPetitions(url), interval);

router.get("/petitions/:id", ctx => {
  const { id: idString } = ctx.params;
  const id = Number(idString);

  if (petitions.has(id)) {
    const responseObject = { id };
    const timeSignatureMap = petitions.get(id);

    timeSignatureMap.forEach((value, key) => {
      const dateKey = new Date(key).toISOString();
      responseObject[dateKey] = value;
    });
    ctx.status = 200;
    ctx.type = "application/json";
    ctx.body = JSON.stringify(responseObject);
  } else {
    ctx.status = 404;
  }
});

router.post("/stop", ctx => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    ctx.body = "You stopped the service!";
  } else {
    ctx.status = 400;
    ctx.body = "No service to stop";
  }
});

router.post("/start", ctx => {
  if (intervalId === null) {
    intervalId = setInterval(() => getPetitions(url), interval);
    ctx.status = 200;
    ctx.body = "Service has started";
  } else {
    ctx.status = 400;
    ctx.body = "Service already running";
  }
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);
