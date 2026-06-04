const express = require('express');
const router = express.Router();
const electionController = require('../controllers/electionController');

const {protect, isAdmin} = require("../middlewares/authMiddlewares")



// Election management
router.get('/', electionController.getElections);
router.get('/:id', electionController.getElectionById)
router.post('/vote',protect, electionController.castVote)
router.get('/:id/results', protect, electionController.getElectionResults);

module.exports = router;
