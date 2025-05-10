const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();
const profileRoutes = require('./public/profile');
const authRoutes = require('./authRoutes');
const meetingsModule = require('./public/meetings');
const meetings = meetingsModule.router;
const Meeting = meetingsModule.Meeting;

// Підключення до MongoDB Atlas
async function connectToDB() {
  try {
    await mongoose.connect('mongodb+srv://savchenkop15:0000000000@cluster0.keexang.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Підключено до MongoDB Atlas');
  } catch (error) {
    console.error('❌ Помилка підключення до MongoDB:', error);
  }
}
connectToDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // HTML, CSS, JS

// Авторизація та профіль
app.use('/api/auth', authRoutes);
app.use('/api', profileRoutes);

// Зустріч
app.use('/uploads', express.static('uploads'));
app.use('/api/meetings', meetings);


// Відгуки
const feedbackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  feedback: { type: String, required: true },
  rating: { type: String, required: true, enum: ['1', '2', '3', '4', '5'] },
  date: { type: Date, default: Date.now }
});
const Feedback = mongoose.model('Feedback', feedbackSchema);

app.post('/api/feedback', async (req, res) => {
  try {
    const { name, feedback, rating } = req.body;
    const validRatings = ['1', '2', '3', '4', '5'];
    if (!rating || !validRatings.includes(rating)) {
      return res.status(400).json({ message: 'Невірна або відсутня оцінка.' });
    }
    const newFeedback = new Feedback({ name, feedback, rating });
    await newFeedback.save();
    res.status(201).json({ message: 'Відгук збережено успішно!' });
  } catch (error) {
    console.error('❌ Помилка при збереженні відгуку:', error);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

app.get('/api/feedbacks', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ date: -1 });
    res.json(feedbacks);
  } catch (error) {
    console.error('❌ Помилка при отриманні відгуків:', error);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

// Сторінки
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.get('/users', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'users.html'));
});
app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});


app.delete('/api/meetings/:id', async (req, res) => {
  const meetingId = req.params.id;
  const userEmail = req.headers['x-user-email'];

  if (!mongoose.Types.ObjectId.isValid(meetingId)) {
    return res.status(400).json({ message: 'Невалідний ID зустрічі' });
  }

  try {
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) return res.status(404).json({ message: 'Зустріч не знайдена' });

    if (meeting.creatorEmail !== userEmail) {
      return res.status(403).json({ message: 'У вас немає прав на видалення цієї зустрічі' });
    }

    await Meeting.findByIdAndDelete(meetingId);
    res.json({ message: 'Зустріч успішно видалена' });
  } catch (err) {
    console.error('❌ DELETE /api/meetings/:id error:', err);
    res.status(500).json({ message: 'Помилка сервера' });
  }
});

// Запуск
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер працює на http://localhost:${PORT}`);
});
