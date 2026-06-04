// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Decentralized Voting (DB-synced) Contract
/// @notice Stores elections, candidates and votes on-chain while allowing backend to keep richer metadata in DB.
///         The contract indexes elections by keccak256(externalElectionId) where externalElectionId is a string
///         (e.g., MongoDB ObjectId) passed from the backend.
contract Voting {
    address public admin;

    enum ElectionType { Village, District, State, Country }

    struct Candidate {
        string name;
        string party;
        string addr;       // candidate address (string for descriptive address)
        string voterId;
        string village;
        string district;
        string state;
        string country;
        uint256 voteCount;
    }

    struct Election {
        string externalId;       // Original external id (like MongoDB _id) as string
        string name;
        ElectionType electionType;
        string location;           // For region-based elections (village/district/state/country)
        string description;
        bool isActive;
        Candidate[] candidates;
    }

    struct Voter {
        bool isRegistered;
        bool exists;
        string voterId;
        string village;
        string district;
        string state;
        string country;
    }

    // mapping from keccak256(externalId) => Election
    mapping(bytes32 => Election) private elections;
    // store keys so we can iterate/list
    bytes32[] private electionKeys;
    mapping(bytes32 => bool) private electionExists;

    // voters mapping (on-chain voter metadata; admin must register voters)
    mapping(address => Voter) public voters;

    // track if an address has voted in a particular election
    mapping(bytes32 => mapping(address => bool)) public hasVoted;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    event ElectionCreated(string externalId, bytes32 key, string name, ElectionType electionType, string region);
    event CandidateAdded(string externalId, bytes32 key, string name);
    event VoterRegistered(address voter, string voterId, string village, string district, string state, string country);
    event Voted(string externalId, bytes32 key, address voter, uint candidateIndex);
    event ElectionClosed(string externalId, bytes32 key);

    constructor() {
        admin = msg.sender;
    }

    // --- Utilities ---
    function _keyOf(string memory externalId) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(externalId));
    }

    // --- Admin functions ---

    /// @notice Create an election identified by an externalId (e.g., DB _id)
    function createElection(
        string memory externalId,
        string memory name,
        ElectionType electionType,
        string memory location,
        string memory description
    ) public onlyAdmin {
        bytes32 key = _keyOf(externalId);
        require(!electionExists[key], "Election already exists");

        // create empty election
        Election storage e = elections[key];
        e.externalId = externalId;
        e.name = name;
        e.electionType = electionType;
        e.location = location;
        e.description = description;
        e.isActive = true;

        electionExists[key] = true;
        electionKeys.push(key);

        emit ElectionCreated(externalId, key, name, electionType, location);
    }

    /// @notice Add candidate to an existing election (admin)
    function addCandidate(
        string memory externalElectionId,
        string memory candName,
        string memory party,
        string memory addr,
        string memory voterId,
        string memory village,
        string memory district,
        string memory state,
        string memory country
    ) public onlyAdmin {
        bytes32 key = _keyOf(externalElectionId);
        require(electionExists[key], "Election does not exist");
        Election storage e = elections[key];

        e.candidates.push(Candidate({
            name: candName,
            party: party,
            addr: addr,
            voterId: voterId,
            village: village,
            district: district,
            state: state,
            country: country,
            voteCount: 0
        }));

        emit CandidateAdded(externalElectionId, key, candName);
    }

    /// @notice Register voter metadata on-chain (admin)
    function registerVoter(
        address _voter,
        string memory _voterId,
        string memory _village,
        string memory _district,
        string memory _state,
        string memory _country
    ) public onlyAdmin {
        voters[_voter] = Voter({
            isRegistered: true,
            exists: true,
            voterId: _voterId,
            village: _village,
            district: _district,
            state: _state,
            country: _country
        });

        emit VoterRegistered(_voter, _voterId, _village, _district, _state, _country);
    }

    /// @notice Close an election (admin)
    function closeElection(string memory externalElectionId) public onlyAdmin {
        bytes32 key = _keyOf(externalElectionId);
        require(electionExists[key], "Election not found");
        Election storage e = elections[key];
        e.isActive = false;

        emit ElectionClosed(externalElectionId, key);
    }

    // --- Voting function ---

    /// @notice Cast a vote in an election (msg.sender must be registered voter on-chain and eligible)
    function vote(string memory externalElectionId, uint candidateIndex) public {
        bytes32 key = _keyOf(externalElectionId);
        require(electionExists[key], "Election not found");

        Election storage e = elections[key];
        require(e.isActive, "Election not active");
        require(candidateIndex < e.candidates.length, "Invalid candidate index");

        // check voter registration
        Voter storage v = voters[msg.sender];
        require(v.exists && v.isRegistered, "Voter not registered on-chain");

        // check already voted
        require(!hasVoted[key][msg.sender], "Already voted in this election");

        // Eligibility checks based on election type
        if (e.electionType == ElectionType.Village) {
            require(_strEq(v.village, e.location), "Not eligible (village mismatch)");
        } else if (e.electionType == ElectionType.District) {
            require(_strEq(v.district, e.location), "Not eligible (district mismatch)");
        } else if (e.electionType == ElectionType.State) {
            require(_strEq(v.state, e.location), "Not eligible (state mismatch)");
        } else if (e.electionType == ElectionType.Country) {
            require(_strEq(v.country, e.location), "Not eligible (country mismatch)");
        }

        // record the vote
        e.candidates[candidateIndex].voteCount += 1;
        hasVoted[key][msg.sender] = true;

        emit Voted(externalElectionId, key, msg.sender, candidateIndex);
    }

    // --- View / Read functions ---

    /// @notice Return the number of elections stored on-chain
    function getElectionCount() external view returns (uint256) {
        return electionKeys.length;
    }

    /// @notice Get basic info about election by index (0..count-1)
    function getElectionByIndex(uint256 index) external view returns (
        string memory externalId,
        string memory name,
        ElectionType electionType,
        string memory region,
        string memory description,
        bool isActive,
        uint256 candidateCount
    ) {
        require(index < electionKeys.length, "Index OOB");
        bytes32 key = electionKeys[index];
        Election storage e = elections[key];
        return (e.externalId, e.name, e.electionType, e.location, e.description, e.isActive, e.candidates.length);
    }

    /// @notice Get candidate count for an election given external id
    function getCandidateCount(string memory externalElectionId) external view returns (uint256) {
        bytes32 key = _keyOf(externalElectionId);
        require(electionExists[key], "Election not found");
        return elections[key].candidates.length;
    }

    /// @notice Get candidate details by election external id and candidate index
    function getCandidateByIndex(string memory externalElectionId, uint256 candidateIndex) external view returns (
        string memory name,
        string memory party,
        string memory addr,
        string memory voterId,
        string memory village,
        string memory district,
        string memory state,
        string memory country,
        uint256 voteCount
    ) {
        bytes32 key = _keyOf(externalElectionId);
        require(electionExists[key], "Election not found");
        Election storage e = elections[key];
        require(candidateIndex < e.candidates.length, "Invalid candidate index");
        Candidate storage c = e.candidates[candidateIndex];
        return (c.name, c.party, c.addr, c.voterId, c.village, c.district, c.state, c.country, c.voteCount);
    }

    /// @notice Get results arrays (names and voteCounts) for an election
    function getResults(string memory externalElectionId) external view returns (string[] memory names, uint256[] memory votes) {
        bytes32 key = _keyOf(externalElectionId);
        require(electionExists[key], "Election not found");
        Election storage e = elections[key];

        uint n = e.candidates.length;
        names = new string[](n);
        votes = new uint256[](n);

        for (uint i = 0; i < n; i++) {
            names[i] = e.candidates[i].name;
            votes[i] = e.candidates[i].voteCount;
        }
        return (names, votes);
    }

    // --- helper string compare (keccak) ---
    function _strEq(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }
}
