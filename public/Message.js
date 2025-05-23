const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  meetingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting' },
  senderEmail: String,
  text: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);