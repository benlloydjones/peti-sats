const mongoose = require("mongoose");
const { Schema } = mongoose;

const petitionSchema = new Schema({
  publicId: { type: String, required: true },
  signatures: [
    {
      time: Date,
      signatureCount: Number
    }
  ]
});

module.exports = petitionSchema;
