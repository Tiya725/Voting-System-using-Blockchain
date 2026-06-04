const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  party: String,
  election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election' },
  address: String,
  voterId: String,
  village: String,
  district: String,
  state: String,
  country: String
}, { timestamps: true });

module.exports = mongoose.model('Candidate', candidateSchema);
