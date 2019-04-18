const fetch = require('isomorphic-fetch');
const Petition = require('../models/petition');

const petitionUrl = 'https://petition.parliament.uk/petitions.json?state=open';
const petitionInterval = 1000 * 60 * 60;

let intervalId = null;

async function getPetitions(url, timeStamp) {
  if (!timeStamp) {
    const now = new Date();
    timeStamp = now.toString();
  }
  const {
    links: { next },
    data,
  } = await fetch(url, { method: 'GET' })
    .then(res => {
      if (!res.ok) throw Error('oh noes!');
      return res.json();
    })
    .then(json => json)
    .catch(err => console.warn(err.message));
  data.forEach(petition => updatePetition(petition, timeStamp));
  if (!next) {
    return;
  }
  await getPetitions(next, timeStamp);
}

const updatePetition = async (petitionData, timeStamp) => {
  const {
    id: publicId,
    attributes: { signature_count: signatureCount },
  } = petitionData;

  let petition = await Petition.findOne({ publicId }).exec();

  if (petition) {
    petition.signatures.push({
      timeStamp,
      signatureCount,
    });
  } else {
    petition = new Petition({
      publicId,
      signatures: [{ timeStamp, signatureCount }],
    });
  }

  petition.save();
};

const stopFetchingPetitions = ctx => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    ctx.body = 'You stopped the service!';
  } else {
    ctx.status = 400;
    ctx.body = 'No service to stop';
  }
};

const startFetchingPetitions = ctx => {
  if (intervalId === null) {
    getPetitions(petitionUrl);
    intervalId = setInterval(() => getPetitions(petitionUrl), petitionInterval);
    ctx.status = 200;
    ctx.body = 'Service has started';
  } else {
    ctx.status = 400;
    ctx.body = 'Service already running';
  }
};

const getPetitionById = async ctx => {
  const {
    params: { id },
  } = ctx;
  const govData = await fetch(
    `https://petition.parliament.uk/petitions/${id}.json`,
    { method: 'GET' }
  )
    .then(res => {
      if (res.status === 404) {
        return null;
      }
      if (!res.ok) throw Error(res.error);
      return res.json();
    })
    .then(json => json)
    .catch(err => {
      console.error(err);
    });

  if (!govData) {
    ctx.status = 404;
    ctx.body`Petition id: ${id} does not exist on the the government petition site`;
  } else {
    const petition = await Petition.findOne({ publicId: id }).exec();
    govData.addedData = petition;
    ctx.status = 200;
    ctx.type = 'application/json';
    ctx.body = JSON.stringify(govData);
  }
};

const getAllPetitions = async ctx => {
  const petitions = await fetch(
    'https://petition.parliament.uk/petitions.json',
    { method: 'GET' }
  )
    .then(res => {
      if (!res.ok) throw Error(res.error);
      return res.json();
    })
    .then(json => json)
    .catch(err => {
      console.error(err);
      return null;
    });

  if (!petitions) {
    ctx.status = 500;
    ctx.body = 'Unable to fetch petition';
  } else {
    ctx.status = 200;
    ctx.type = 'application/json';
    ctx.body = JSON.stringify(petitions);
  }
};

module.exports = {
  stopFetchingPetitions,
  startFetchingPetitions,
  getPetitionById,
  getAllPetitions,
};
