const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const contract = require('../blockchain/blockchain');

// 🧩 Create new election
exports.createElection = async (req, res) => {
  try {
    console.log(req.body)
    const { name, type, location, description, startDate, endDate } = req.body;

    if (!name || type === undefined || !location)
      return res.status(400).json({ message: 'Name, type, and region are required' });

    const typeMap = { village: 0, district: 1, state: 2, country: 3 };
    const typeIndex = typeMap[type.toLowerCase()];

    // Save in MongoDB
    const election = new Election({
      name,
      description,
      region: type,
      location,
      startDate,
      endDate
    });
    await election.save();

    // Sync with blockchain (using MongoDB _id as externalId)
    const tx = await contract.createElection(
      election._id.toString(), // externalId
      name,
      typeIndex,  // enum index (0-3)
      location,
      description,
    );
    await tx.wait();

    res.status(201).json({
      success: true,
      message: 'Election created successfully',
      election,
    });
  } catch (error) {
    console.error('Error creating election:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🧩 Add candidate to election
exports.addCandidate = async (req, res) => {
  try {
    const { electionId } = req.params;
    const { name, party, address, voterId, village, district, state } = req.body;

    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ message: 'Election not found' });

    const candidate = new Candidate({
      name,
      party,
      address,
      voterId,
      village,
      district,
      state,
      country:"india",
      election: election._id,
    });
    await candidate.save();

    election.candidates.push(candidate._id);
    await election.save();

    // Push to blockchain
    const tx = await contract.addCandidate(
      election._id.toString(), // externalElectionId
      name,
      party,
      address || '',
      voterId || '',
      village || '',
      district || '',
      state || '',
      "india"
    );
    await tx.wait();

    res.status(201).json({
      success: true,
      message: 'Candidate added successfully',
      candidate,
    });
  } catch (error) {
    console.error('Error adding candidate:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// End election (admin)
exports.closeElection = async (req, res) => {
  const electionId = req.params.electionId;
  try {
    const election = await Election.findById(electionId)
    if (!election) return res.status(404).json({ message: 'Election not found' });
    election.status = "ended"
    await election.save()
    // optional: check that requester is admin (your auth system). This route itself uses the server signer for transaction.
    const tx = await contract.closeElection(electionId);
    const receipt = await tx.wait();

    
    return res.json({ success: true, txHash: receipt.transactionHash });
  } catch (err) {
    console.error("endElection error:", err);
    return res.status(500).json({ success: false, error: err.message || err.toString() });
  }
};

// 🧩 Close election (on-chain + DB)
exports.updateElectionStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const election = await Election.findById(id);
    if (!election) return res.status(404).json({ message: 'Election not found' });

    election.isActive = false;
    await election.save();

    // Sync with blockchain
    const tx = await contract.closeElection(id.toString());
    await tx.wait();

    res.status(200).json({
      success: true,
      message: 'Election closed successfully',
    });
  } catch (error) {
    console.error('Error closing election:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
