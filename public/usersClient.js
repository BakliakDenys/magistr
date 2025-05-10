document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Потрібна авторизація');
    window.location.href = '/login.html';
    return;
  }

  document.body.classList.remove('hidden');

  const searchInput = document.getElementById('searchInput1');
  const container = document.getElementById('usersContainer');
  let allUsers = [];

  function renderUsers(users) {
    container.innerHTML = '';
    users.forEach(user => {
      const card = document.createElement('div');
      card.className = 'user-card';

      const avatarUrl = user.avatarUrl ? user.avatarUrl : 'avatar.png';

      card.innerHTML = `
        <img src="${avatarUrl}" alt="Аватар" style="width:80px;height:80px;border-radius:50%;margin-bottom:10px;">
        <strong>${user.firstName || 'Без імені'} ${user.lastName || ''}</strong><br>
        <em>${user.email}</em>
        <div class="extra-info">
          <p><strong>Місто:</strong> ${user.city || '—'}</p>
          <p><strong>Країна:</strong> ${user.country || '—'}</p>
          <p><strong>Хобі:</strong> ${user.hobby || '—'}</p>
          <p><strong>Дата нар.:</strong> ${user.birthdate || '—'}</p>
        </div>
      `;
      container.appendChild(card);
    });
  }

  fetch('/api/profiles', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(users => {
      allUsers = users;
      renderUsers(users);
    })
    .catch(err => {
      console.error('Помилка при завантаженні користувачів:', err);
      alert('Не вдалося завантажити список користувачів');
    });

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const filtered = allUsers.filter(user =>
      (user.firstName + ' ' + user.lastName).toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
    renderUsers(filtered);
  });
});
