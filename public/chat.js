const express = require('express');
const router = express.Router();
const authMiddleware = require('./authMiddleware');
const Message = require('./Message');

// Отримати повідомлення для зустрічі
router.get('/:meetingId', authMiddleware, async (req, res) => {
  const messages = await Message.find({ meetingId: req.params.meetingId }).sort({ createdAt: 1 });
  res.json(messages);
});

// Надіслати повідомлення
router.post('/', authMiddleware, async (req, res) => {
  const { meetingId, text } = req.body;
  const message = new Message({
    meetingId,
    senderEmail: req.user.email,
    text,
  });

  await message.save();
  res.json(message);
});

module.exports = router;