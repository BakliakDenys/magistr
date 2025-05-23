const express = require('express');
const router = express.Router();
const authMiddleware = require('./authMiddleware');
const { Profile } = require('./profile');

const {
  tokenize,
  computeTF,
  computeIDF,
  computeTFIDF,
  cosineSimilarity
} = require('./tfidf');

router.get('/mentor/matches', authMiddleware, async (req, res) => {
  try {
    const mentor = await Profile.findOne({ email: req.user.email });

    if (!mentor || mentor.badge !== 'mentor') {
      return res.status(400).json({ message: 'Користувач не є ментором' });
    }

    const startups = await Profile.find({ badge: 'startup' });

    // Побудова тексту ментора з вагами
    const mentorText = [
      (mentor.mentorData.requestTypes || []).join(' ').repeat(5),       // Найважливіше
      (mentor.mentorData.industries || []).join(' ').repeat(2),
      mentor.mentorData.description || '',
      (mentor.mentorData.comfortableStages || []).join(' ')
    ].join(' ');

    // Побудова текстів стартапів з вагами
    const startupTexts = startups.map(s => [
      (s.startupData.needs || []).join(' ').repeat(5),                  // Найважливіше
      (s.startupData.industry || '').repeat(2),
      s.startupData.description || '',
      s.startupData.stage || ''
    ].join(' '));

    const idf = computeIDF([...startupTexts, mentorText]);              // Враховує всі тексти
    const mentorTFIDF = computeTFIDF(computeTF(mentorText), idf);

    const scored = startups.map((startup, index) => {
      const tfidf = computeTFIDF(computeTF(startupTexts[index]), idf);
      const score = cosineSimilarity(mentorTFIDF, tfidf);
      console.log(`🎯 [${startup.startupData.startupName}] → Score: ${score.toFixed(3)}`);
      return { startup, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const top3 = scored
      .filter(item => item.score > 0.01)
      .slice(0, 3)
      .map(item => ({
        email: item.startup.email,
        name: item.startup.startupData.startupName,
        industry: item.startup.startupData.industry,
        stage: item.startup.startupData.stage,
        description: item.startup.startupData.description,
        score: item.score.toFixed(3),
        avatarUrl: item.startup.avatarUrl
      }));

    res.json(top3);

  } catch (err) {
    console.error('Помилка при пошуку збігів:', err);
    res.status(500).json({ message: 'Помилка сервера.' });
  }
});

module.exports = router;
