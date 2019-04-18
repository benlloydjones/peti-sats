const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const petitionSchema = new Schema({
  publicId: { type: String, required: true },
  signatures: [
    {
      timeStamp: Date,
      signatureCount: Number,
    },
  ],
});

const Petition = model('Petition', petitionSchema);

module.exports = Petition;
