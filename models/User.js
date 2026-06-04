// backend/models/User.js
const mongoose = require("mongoose");

const EncryptedKeySchema = new mongoose.Schema({
  iv: String,
  authTag: String,
  data: String,
}, { _id: false });

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // or email
  passwordHash: { type: String },
  role: { type: String, enum: ["voter","admin","candidate"], default: "voter" },

  // blockchain mapping
  address: { type: String, required: true, unique: true },
  encryptedPrivateKey: { type: EncryptedKeySchema },

  // voter metadata
  voterId: String,
  village: String,
  district: String,
  state: String,
  country: String,

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);
