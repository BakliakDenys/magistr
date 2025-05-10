const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Users = require('./userModel');
const router = express.Router();

const JWT_SECRET = 'your-secret-key';


// Реєстрація
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Перевірка, чи існує користувач
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Користувач з таким email вже існує.' });
    }

    // Створення нового користувача 
    const newUser = new Users({ email, password });
    await newUser.save();

    res.status(201).json({ message: 'Реєстрація успішна!' });
  } catch (error) {
    console.error('Помилка при реєстрації:', error);
    res.status(500).json({ message: 'Помилка сервера під час реєстрації.' });
  }
});


// Вхід
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Users.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Невірний email або пароль.' });
    }

    const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '2h' });

    res.status(200).json({ message: 'Успішний вхід!', token, user: { email: user.email } });
  } catch (error) {
    console.error('Помилка при вході:', error);
    res.status(500).json({ message: 'Помилка сервера.' });
  }
});

module.exports = router;
