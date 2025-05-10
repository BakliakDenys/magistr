const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const authMiddleware = require('./authMiddleware');

// Схема зустрічей
const meetingSchema = new mongoose.Schema({
  creatorEmail: String,
  title: String,
  type: String,
  format: String,
  location: String,
  date: String,
  startTime: String,
  endTime: String,
  description: String,
  imageUrl: String,
  participants: [String],
  createdAt: { type: Date, default: Date.now },
  maxParticipants: Number
});
const Meeting = mongoose.model('Meeting', meetingSchema);

// Налаштування multer
const uploadDir = path.join(__dirname, '../uploads/meetings');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Додати зустріч
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const {
      title, type, format, location, date,
      startTime, endTime, maxParticipants, description
    } = req.body;

    const meeting = new Meeting({
      creatorEmail: req.user.email,
      title,
      type,
      format,
      location,
      date,
      startTime,
      endTime,
      maxParticipants,
      description,
      imageUrl: req.file ? `/uploads/meetings/${req.file.filename}` : '',
      participants: [],
    });

    await meeting.save();
    res.json(meeting);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка при збереженні зустрічі' });
  }
});

// Отримати всі зустрічі
router.get('/', async (req, res) => {
  try {
    const meetings = await Meeting.find();
    res.json(meetings);
  } catch (err) {
    console.error('❌ GET /api/meetings error:', err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

// Отримати одну зустріч
router.get('/:id', async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: 'Зустріч не знайдена' });
    res.json(meeting);
  } catch (err) {
    console.error('❌ GET /api/meetings/:id error:', err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

// Записатись на зустріч
router.post('/:id/register', authMiddleware, async (req, res) => {
  const meetingId = req.params.id;
  const email = req.user.email;

  try {
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) return res.status(404).json({ message: 'Зустріч не знайдена' });

    if (meeting.participants.includes(email)) {
      return res.status(400).json({ message: 'Ви вже записані на цю зустріч' });
    }

    if (meeting.maxParticipants && meeting.participants.length >= meeting.maxParticipants) {
      return res.status(400).json({ message: 'Досягнуто ліміту учасників' });
    }

    meeting.participants.push(email);
    await meeting.save();

    res.json({ message: 'Ви записались на зустріч' });
  } catch (err) {
    console.error('❌ POST /api/meetings/:id/register error:', err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

module.exports = { router, Meeting };
