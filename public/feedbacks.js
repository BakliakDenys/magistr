document.addEventListener('DOMContentLoaded', async () => {
  const feedbackList = document.getElementById('feedbackList');
  const spinner = document.getElementById('spinner');

  spinner.style.display = 'flex';

  try {
    const response = await fetch('/api/feedbacks');
    const feedbacks = await response.json();

    // Чекаємо мінімум 2 секунд
    await new Promise(resolve => setTimeout(resolve, 2000));

    spinner.style.display = 'none';

    if (feedbacks.length === 0) {
      feedbackList.innerHTML = '<p>Поки що немає відгуків.</p>';
      return;
    }

 feedbacks.forEach((item, index) => {
  const feedbackElement = document.createElement('div');
  feedbackElement.classList.add('feedback-item', 'fade-in');
  feedbackElement.style.animationDelay = `${index * 0.2}s`;

  const formattedDate = new Date(item.date).toLocaleString('uk-UA', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  // Генеруємо аватар з ініціалами
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random&size=50`;

  feedbackElement.innerHTML = `
    <div class="feedback-header">
      <img src="${avatarUrl}" alt="User" class="feedback-avatar">
      <div>
        <h3>${item.name}</h3>
        <div class="stars">
          ${'★'.repeat(item.rating || 5)}${'☆'.repeat(5 - (item.rating || 5))}
        </div>
        <small>${formattedDate}</small>
      </div>
    </div>
    <p class="feedback-text">${item.feedback}</p>
  `;
  feedbackList.appendChild(feedbackElement);
});

  } catch (error) {
    console.error('Помилка при завантаженні відгуків:', error);
    spinner.style.display = 'none';
    feedbackList.innerHTML = '<p>Сталася помилка при завантаженні відгуків.</p>';
  }
});
