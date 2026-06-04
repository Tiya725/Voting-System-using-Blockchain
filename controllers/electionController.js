const Election = require('../models/Election');
const Candidate = require('../models/Candidate');

const contract = require('../blockchain/blockchain');


// 🧩 Get all elections
exports.getElections = async (req, res) => {
  try {
    const electionsdata = await Election.find();
    console.log(electionsdata)
    res.status(200).json({ success: true, electionsdata });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🧩 Get single election details
exports.getElectionById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find election by ID and populate candidates
    const electionData = await Election.findById(id).populate('candidates');

    if (!electionData) {
      return res.status(404).json({ success: false, message: 'Election not found' });
    }

    res.status(200).json({ success: true, electionData });
  } catch (error) {
    console.error('Error fetching election:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


// 🧩 Get election results
exports.getElectionResults = async (req, res) => {
  try {
    const { id } = req.params;

    const election = await Election.findById(id);
    if (!election) return res.status(404).json({ message: 'Election not found' });

    // Fetch results from blockchain
    const [names, votes] = await contract.getResults(id.toString());

    const formatted = names.map((name, i) => ({
      name,
      votes: votes[i].toString(),
    }));

    res.status(200).json({
      success: true,
      electionId: id,
      candidates: formatted,
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.castVote = async (req, res) => {
  try {
    const { electionId, candidateIndex } = req.body;
    const user = req.user; // fetched from auth middleware (after login)

    // Find election in DB
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ success: false, message: "Election not found" });
    }

    // Check if election is active
    if (election.status !== "active") {
      return res.status(400).json({ success: false, message: "Election is not active" });
    }

    // Check if candidate index is valid
    const candidatesCount = election.candidates.length;
    if (candidateIndex >= candidatesCount) {
      return res.status(400).json({ success: false, message: "Invalid candidate index" });
    }

    // ⚙️ Interact with blockchain
    // externalElectionId = MongoDB _id (string)
    const tx = await contract.vote(election._id.toString(), candidateIndex);
    await tx.wait();

    console.log(`✅ Vote recorded on blockchain. TX: ${tx.hash}`);

    res.status(200).json({
      success: true,
      message: "Vote cast successfully",
      transactionHash: tx.hash,
    });
  } catch (error) {
    console.error("Error casting vote:", error);
    res.status(500).json({
      success: false,
      message: error.reason || error.message,
    });
  }
};

exports.getResult = async (req, res) => {
  const electionId = req.params.id;

  try {
    // Call the contract view function
    const [names, votes] = await electionContract.getResults(electionId);

    // Combine names + votes into array of objects
    const combined = names.map((name, index) => ({
      name,
      votes: votes[index].toNumber ? votes[index].toNumber() : Number(votes[index]),
    }));

    // Sort descending by votes
    combined.sort((a, b) => b.votes - a.votes);

    // Return response
    res.json({
      success: true,
      electionId: electionId,
      results: combined,
      totalCandidates: combined.length,
      topCandidate: combined[0] || null,
    });
  } catch (err) {
    console.error("Error fetching results:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch results from contract",
    });
  }
}