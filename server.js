// backend/server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bodyParser = require("body-parser");
const { ethers } = require("ethers");
const { encryptPrivateKey, decryptPrivateKey } = require("./utils/crypto");
const User = require("./models/User");

const adminRoutes = require('./routes/admin');
const electionRoutes = require('./routes/election');
const contract = require("./blockchain/blockchain")

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;
const MONGO = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:7545";

if (!JWT_SECRET) throw new Error("Set JWT_SECRET in .env");

// connect to DB
mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => { console.error(err); process.exit(1); });

// helper: create and save user w/ generated wallet
app.get("/api/test",async(req,res) => {
    res.send("okay")
})
app.use('/api/admin', adminRoutes);
app.use('/api/election', electionRoutes);


app.post("/api/register", async (req, res) => {
  try {
    console.log(req.body)
    const { username, password, role = "voter", address, voterId, village, district, state, country } = req.body;

    if (!username || !address) {
      return res.status(400).json({ error: "Username and wallet address required" });
    }

    // check if username exists
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ error: "Username already exists" });

    // check if wallet address is already registered
    const walletExists = await User.findOne({ address });
    if (walletExists) return res.status(400).json({ error: "Wallet already registered" });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      passwordHash,
      role,
      address,
      voterId,
      village,
      district,
      state,
      country
    });

    await user.save();

    // 🔗 Register voter on blockchain (only for voters)
   if (role === "voter") {
  try {
    const tx = await contract.registerVoter(
      address,
      voterId || "",
      village || "",
      district || "",
      state || "",
      country || "India"
    );
    await tx.wait();
    console.log(`✅ Registered voter ${username} on-chain`);
  } catch (err) {
    console.log("⚠️ Blockchain failed, skipping...");
  }
}

    // Generate JWT
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      message: "User registered successfully",
      user: { id: user._id, username: user.username, role: user.role, address: user.address },
      token
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed", details: err.message });
  }
});

// login -> returns JWT
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "username and password required" });

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ 
      success: true,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        address: user.address,
      },
      token:token
     });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

// middleware to protect routes
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Missing auth header" });
  const parts = auth.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return res.status(401).json({ error: "Invalid auth format" });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// Example protected route: get current user info
app.get("/api/me", authMiddleware, async (req, res) => {
  const u = await User.findById(req.user.userId).select("-passwordHash -encryptedPrivateKey");
  res.json({ user: u });
});

// Helper to obtain a signer (wallet) for a user (decrypts private key)
async function getSignerForUser(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  const privateKey = decryptPrivateKey(user.encryptedPrivateKey);
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(privateKey, provider);
  return { wallet, user };
}

// quick route to show the address (protected)
app.get("/api/address", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.userId).select("address");
  res.json({ address: user.address });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
