const port = process.env.PORT || 3000;
const dbURI = process.env.MONGODB_URI || "mongodb://localhost/peti-stats";

module.exports = {
  port,
  dbURI
};
