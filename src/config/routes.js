const Router = require("koa-router");
const {
  stopFetchingPetitions,
  startFetchingPetitions,
  getPetitionById,
  getAllPetitions
} = require("../lib/getPetitionStats");

const petitions = new Router();

petitions.post("stop", "/stop", ctx => stopFetchingPetitions(ctx));

petitions.post("start", "/start", ctx => startFetchingPetitions(ctx));

petitions.get("getPetition", "/petitions/:id", ctx => getPetitionById(ctx));

petitions.get("getAllPetitions", "/petitions", ctx => getAllPetitions(ctx));

module.exports = petitions;
