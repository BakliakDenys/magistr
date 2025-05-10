document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const email = localStorage.getItem('email');

  if (!token || !email) {
    alert('Користувач не авторизований.');
    window.location.href = '/login.html';
    return;
  }
   document.body.classList.remove('hidden');

  document.querySelector('#email').value = email;

  // Завантаження профілю
  fetch('/api/profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(res => {
      if (!res.ok) throw new Error('Не вдалося завантажити профіль');
      return res.json();
    })
    .then(profile => {
      if (profile) {
        document.querySelector('#firstName').value = profile.firstName || '';
        document.querySelector('#lastName').value = profile.lastName || '';
        document.querySelector('#city').value = profile.city || '';
        document.querySelector('#country').value = profile.country || '';
        document.querySelector('#hobby').value = profile.hobby || '';
        document.querySelector('#birthdate').value = profile.birthdate
          ? new Date(profile.birthdate).toISOString().split('T')[0]
          : '';

        if (profile.avatarUrl) {
          document.querySelector('#avatarImage').src = profile.avatarUrl;
        }
      }
    });

  // Збереження профілю
  document.querySelector('#profileForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const profileData = {
      email,
      firstName: document.querySelector('#firstName').value,
      lastName: document.querySelector('#lastName').value,
      city: document.querySelector('#city').value,
      country: document.querySelector('#country').value,
      hobby: document.querySelector('#hobby').value,
      birthdate: document.querySelector('#birthdate').value
    };

    fetch('/api/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    })
      .then(res => {
        if (!res.ok) throw new Error('Не вдалося зберегти');
        return res.json();
      })
      .then(() => {
        alert('Профіль збережено успішно!');
        window.location.href = '/profile.html';
      })
      .catch(err => {
        console.error('❌ Помилка збереження:', err);
        alert('Не вдалося зберегти профіль.');
      });
  });

  // Завантаження фото
  document.querySelector('#avatarInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await fetch('/api/profile/photo', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) throw new Error('Не вдалося завантажити фото');

      const data = await res.json();
      document.querySelector('#avatarImage').src = data.avatarUrl;
    } catch (err) {
      alert('Помилка при завантаженні фото');
      console.error(err);
    }
  });
});
