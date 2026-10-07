const express = require('express');
const {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  groupUsersByInterests
} = require('../controllers/userController');
const { listAllNotes } = require('../controllers/noteController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get('/users', listUsers);
router.post('/users', createUser);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/users/grouped-by-interests', groupUsersByInterests);
router.get('/notes', listAllNotes);

module.exports = router;
