function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ') // Залишає літери та цифри
    .split(/\s+/)
    .filter(Boolean);
}

function computeTF(doc) {
  const tokens = tokenize(doc);
  const tf = {};
  const len = tokens.length;

  tokens.forEach(token => {
    tf[token] = (tf[token] || 0) + 1;
  });

  for (let word in tf) {
    tf[word] /= len;
  }

  return tf;
}

function computeIDF(docs) {
  const idf = {};
  const totalDocs = docs.length;

  docs.forEach(doc => {
    const tokens = new Set(tokenize(doc));
    tokens.forEach(token => {
      idf[token] = (idf[token] || 0) + 1;
    });
  });

  for (let word in idf) {
    idf[word] = Math.log(totalDocs / idf[word]);
  }

  return idf;
}

function computeTFIDF(tf, idf) {
  const tfidf = {};
  for (let word in tf) {
    tfidf[word] = tf[word] * (idf[word] || 0);
  }
  return tfidf;
}

function cosineSimilarity(vecA, vecB) {
  const allWords = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dot = 0, magA = 0, magB = 0;

  for (let word of allWords) {
    const a = vecA[word] || 0;
    const b = vecB[word] || 0;
    dot += a * b;
    magA += a * a;
    magB += b * b;
  }

  return dot / (Math.sqrt(magA) * Math.sqrt(magB) || 1);
}

module.exports = {
  tokenize,
  computeTF,
  computeIDF,
  computeTFIDF,
  cosineSimilarity
};
