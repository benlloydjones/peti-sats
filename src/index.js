// @flow

const Koa = require('koa');
const petitions = require('./config/routes');
const fs = require('fs');
const morgan = require('koa-morgan');
const initDB = require('./lib/database');

const { port } = require('./config/environment');

const accessLogStream = fs.createWriteStream(`${__dirname}/logs/access.log`, {
  flags: 'a',
});

initDB();

const app = new Koa();

app.use(morgan('combined', { stream: accessLogStream }));
app.use(petitions.routes());

app.listen(port, () => {
  console.log(`app now listening on port ${port}`);
});
