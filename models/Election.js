const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['active', 'ended'], default: 'active' },
  type: { type: String, enum: ['village', 'district', 'state','country'], default: 'village' },
  location:String,

  startDate: Date,
  endDate: Date,
  candidates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' }]
}, { timestamps: true });

module.exports = mongoose.model('Election', electionSchema);
