const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');
const { getPagination, paginatedResponse } = require('../utils/pagination');

async function listPosts(req, res, next) {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const [posts, total] = await Promise.all([
      Post.find()
        .populate('author', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments()
    ]);

    res.json(paginatedResponse({ data: posts, total, page, limit }));
  } catch (error) {
    next(error);
  }
}

async function createPost(req, res, next) {
  try {
    const { title, body } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required' });
    }

    const post = await Post.create({
      title,
      body,
      author: req.user._id
    });

    res.status(201).json({ post });
  } catch (error) {
    next(error);
  }
}

async function getUserPostsWithLookup(req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const [result] = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.params.userId) } },
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'author',
          as: 'posts'
        }
      },
      {
        $project: {
          passwordHash: 0
        }
      }
    ]);

    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ data: result });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listPosts,
  createPost,
  getUserPostsWithLookup
};
