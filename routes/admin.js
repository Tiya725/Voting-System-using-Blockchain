const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const electionController = require('../controllers/electionController');

const {protect, isAdmin} = require("../middlewares/authMiddlewares")



// Election management
router.post('/create', protect, isAdmin, adminController.createElection);
router.post('/:electionId/candidate', protect, isAdmin, adminController.addCandidate);
router.post('/:electionId/close', protect, isAdmin, adminController.closeElection);
router.get('/',  protect, isAdmin, electionController.getElections);
router.patch('/:id/status', protect, isAdmin, adminController.updateElectionStatus);
router.get('/:id/results', protect, isAdmin, electionController.getElectionResults);

module.exports = router;
