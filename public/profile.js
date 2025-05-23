const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authMiddleware = require('./authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- Модель профілю ---
const profileSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  firstName: String,
  lastName: String,
  city: String,
  country: String,
  hobby: String,
  birthdate: String,
  avatarUrl: String, // нове поле

  badge: { type: String, enum: ['mentor', 'startup'] },

  startupData: {
    startupName: String,
    industry: String,
    stage: { type: String, enum: ['ідея', 'MVP', 'масштабування'] },
    needs: [String],
    description: String
  },

  mentorData: {
    experience: String,
    industries: [String],
    comfortableStages: [String],
    requestTypes: [String],
    description: String
  }

});
const Profile = mongoose.model('profile', profileSchema);

// --- Налаштування multer ---
const uploadDir = path.join(__dirname, '../public/uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, req.user.email.replace(/[@.]/g, '_') + ext);
  }
});

const upload = multer({ storage });

// --- GET профілю ---
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ email: req.user.email });
    if (!profile) return res.status(404).json({ message: 'Користувача не знайдено.' });

    res.json(profile);
  } catch (error) {
    console.error('Помилка при отриманні профілю:', error);
    res.status(500).json({ message: 'Помилка сервера.' });
  }
});

// --- POST профілю ---
router.post('/profile', authMiddleware, async (req, res) => {
  const {
    firstName, lastName, city, country, hobby, birthdate,
    badge, startupData, mentorData
  } = req.body;

  const updateData = {
    firstName, lastName, city, country, hobby, birthdate, badge
  };

  if (badge === 'startup') updateData.startupData = startupData;
  if (badge === 'mentor') updateData.mentorData = mentorData;

  try {
    const profile = await Profile.findOneAndUpdate(
      { email: req.user.email },
      updateData,
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (error) {
    console.error('Помилка при оновленні профілю:', error);
    res.status(500).json({ message: 'Не вдалося оновити профіль.' });
  }
});

// --- POST фото ---
router.post('/profile/photo', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    const avatarUrl = '/uploads/' + req.file.filename;
    const profile = await Profile.findOneAndUpdate(
      { email: req.user.email },
      { avatarUrl },
      { new: true, upsert: true }
    );
    res.json({ avatarUrl });
  } catch (err) {
    console.error('Помилка при збереженні фото:', err);
    res.status(500).json({ message: 'Помилка сервера при завантаженні фото.' });
  }
});

module.exports = {
  router,
  Profile
};

// --- ВСІ КОРИСТУВАЧІ ---
router.get('/profiles', authMiddleware, async (req, res) => {
  try {
    const profiles = await Profile.find({}, '-_id firstName lastName email city country hobby birthdate avatarUrl');
    res.json(profiles);
  } catch (err) {
    console.error('Помилка при отриманні списку профілів:', err);
    res.status(500).json({ message: 'Помилка сервера.' });
  }
});
