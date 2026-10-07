const Note = require('../models/Note');
const { getPagination, paginatedResponse } = require('../utils/pagination');

async function listMyNotes(req, res, next) {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { owner: req.user._id };

    const [notes, total] = await Promise.all([
      Note.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Note.countDocuments(filter)
    ]);

    res.json(paginatedResponse({ data: notes, total, page, limit }));
  } catch (error) {
    next(error);
  }
}

async function listAllNotes(req, res, next) {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const [notes, total] = await Promise.all([
      Note.find()
        .populate('owner', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Note.countDocuments()
    ]);

    res.json(paginatedResponse({ data: notes, total, page, limit }));
  } catch (error) {
    next(error);
  }
}

async function getMyNote(req, res, next) {
  try {
    const note = await Note.findOne({ _id: req.params.id, owner: req.user._id });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({ note });
  } catch (error) {
    next(error);
  }
}

async function createNote(req, res, next) {
  try {
    const { title, body } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required' });
    }

    const note = await Note.create({
      title,
      body,
      owner: req.user._id
    });

    res.status(201).json({ note });
  } catch (error) {
    next(error);
  }
}

async function updateMyNote(req, res, next) {
  try {
    const updates = {};

    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.body !== undefined) updates.body = req.body.body;

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({ note });
  } catch (error) {
    next(error);
  }
}

async function deleteMyNote(req, res, next) {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({ message: 'Note deleted' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listMyNotes,
  listAllNotes,
  getMyNote,
  createNote,
  updateMyNote,
  deleteMyNote
};
