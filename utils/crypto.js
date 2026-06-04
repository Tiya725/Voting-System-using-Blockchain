// backend/utils/crypto.js
const crypto = require("crypto");

const ALGO = "aes-256-gcm"; // authenticated encryption
const KEY = Buffer.from(process.env.ENC_KEY, "hex"); // 32 bytes

if (KEY.length !== 32) {
  throw new Error("ENC_KEY must be 32 bytes (64 hex chars)");
}

function encryptPrivateKey(plaintext) {
  const iv = crypto.randomBytes(12); // 12 bytes recommended for GCM
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
    data: encrypted.toString("hex"),
  };
}

function decryptPrivateKey(enc) {
  const iv = Buffer.from(enc.iv, "hex");
  const authTag = Buffer.from(enc.authTag, "hex");
  const encrypted = Buffer.from(enc.data, "hex");

  const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

module.exports = { encryptPrivateKey, decryptPrivateKey };
