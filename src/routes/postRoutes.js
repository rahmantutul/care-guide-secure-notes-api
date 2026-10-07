const express = require('express');
const {
  listPosts,
  createPost,
  getUserPostsWithLookup
} = require('../controllers/postController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', listPosts);
router.post('/', authenticate, createPost);
router.get('/by-user/:userId', getUserPostsWithLookup);

module.exports = router;
