const Router = require('koa-router');
const {
  stopFetchingPetitions,
  startFetchingPetitions,
  getPetitionById,
  getAllPetitions,
} = require('../controllers/petitions');

const petitions = new Router();

petitions.post('stop', '/stop', ctx => stopFetchingPetitions(ctx));

petitions.post('start', '/start', ctx => startFetchingPetitions(ctx));

petitions.get('getPetition', '/petitions/:id', ctx => getPetitionById(ctx));

petitions.get(
  'getAllPetitions',
  '/petitions',
  async ctx => await getAllPetitions(ctx)
);

module.exports = petitions;
