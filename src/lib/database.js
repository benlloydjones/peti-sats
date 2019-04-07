const { connect, connection } = require("mongoose");
const { dbURI } = require("../config/environment");

const initDB = () => {
  connect(
    dbURI,
    { useNewUrlParser: true }
  );
  connection.once("open", () => {
    console.log("connected to database");
  });
};

module.exports = initDB;
