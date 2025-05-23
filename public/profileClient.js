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

  // Показ/приховування полів за роллю
  const badgeSelect = document.getElementById('badge');
  badgeSelect.addEventListener('change', () => {
    const badge = badgeSelect.value;
    document.getElementById('startupFields').style.display = badge === 'startup' ? 'block' : 'none';
    document.getElementById('mentorFields').style.display = badge === 'mentor' ? 'block' : 'none';
  });

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
        document.querySelector('#badge').value = profile.badge || '';
        badgeSelect.dispatchEvent(new Event('change'));

        if (profile.avatarUrl) {
          document.querySelector('#avatarImage').src = profile.avatarUrl;
        }

        if (profile.badge === 'startup' && profile.startupData) {
          document.querySelector('#startupName').value = profile.startupData.startupName || '';
          document.querySelector('#startupIndustry').value = profile.startupData.industry || '';
          document.querySelector('#startupStage').value = profile.startupData.stage || '';
          document.querySelector('#startupNeeds').value = (profile.startupData.needs || []).join(', ');
          document.querySelector('#startupDescription').value = profile.startupData.description || '';
        }

        if (profile.badge === 'mentor' && profile.mentorData) {
          document.querySelector('#mentorExperience').value = profile.mentorData.experience || '';
          document.querySelector('#mentorIndustries').value = (profile.mentorData.industries || []).join(', ');
          document.querySelector('#mentorStages').value = (profile.mentorData.comfortableStages || []).join(', ');
          document.querySelector('#mentorRequests').value = (profile.mentorData.requestTypes || []).join(', ');
          document.querySelector('#mentorDescription').value = profile.mentorData.description || '';
        }
      }
    })
    .catch(err => {
      console.error('Помилка завантаження профілю:', err);
    });

  // Збереження профілю
  document.querySelector('#profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const profileData = {
      email,
      firstName: document.querySelector('#firstName').value,
      lastName: document.querySelector('#lastName').value,
      city: document.querySelector('#city').value,
      country: document.querySelector('#country').value,
      hobby: document.querySelector('#hobby').value,
      birthdate: document.querySelector('#birthdate').value,
      badge: document.querySelector('#badge').value
    };

    if (profileData.badge === 'startup') {
      profileData.startupData = {
        startupName: document.querySelector('#startupName').value,
        industry: document.querySelector('#startupIndustry').value,
        stage: document.querySelector('#startupStage').value,
        needs: document.querySelector('#startupNeeds').value.split(',').map(s => s.trim()),
        description: document.querySelector('#startupDescription').value
      };
    } else if (profileData.badge === 'mentor') {
      profileData.mentorData = {
        experience: document.querySelector('#mentorExperience').value,
        industries: document.querySelector('#mentorIndustries').value.split(',').map(s => s.trim()),
        comfortableStages: document.querySelector('#mentorStages').value.split(',').map(s => s.trim()),
        requestTypes: document.querySelector('#mentorRequests').value.split(',').map(s => s.trim()),
        description: document.querySelector('#mentorDescription').value
      };
    }

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      if (!res.ok) throw new Error('Не вдалося зберегти');
      await res.json();
      alert('Профіль збережено успішно!');
      window.location.href = '/profile.html';
    } catch (err) {
      console.error('❌ Помилка збереження:', err);
      alert('Не вдалося зберегти профіль.');
    }
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
