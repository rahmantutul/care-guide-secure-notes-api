const express = require('express');
const {
  listMyNotes,
  getMyNote,
  createNote,
  updateMyNote,
  deleteMyNote
} = require('../controllers/noteController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', listMyNotes);
router.post('/', createNote);
router.get('/:id', getMyNote);
router.patch('/:id', updateMyNote);
router.delete('/:id', deleteMyNote);

module.exports = router;
