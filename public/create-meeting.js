document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const email = localStorage.getItem('email');
  document.body.classList.remove('hidden');
const creatorEmail = localStorage.getItem('email');

  // ======== СТОРІНКА ЗУСТРІЧЕЙ (meetings.html) ========
  const container = document.getElementById('meetingsContainer');
  if (container) {
    const filterRegisteredCheckbox = document.getElementById('filterRegistered');
    const filterCreatedCheckbox = document.getElementById('filterCreated');
    const filterOnlineCheckbox = document.getElementById('filterOnline');
    const filterOfflineCheckbox = document.getElementById('filterOffline');
    const searchInput = document.getElementById('searchInput');
    let meetings = [];

    async function fetchMeetings() {
      try {
        const res = await fetch('/api/meetings');
        if (!res.ok) throw new Error('Не вдалося завантажити зустрічі');
        meetings = await res.json();
        applyFilters();
      } catch (err) {
        console.error('❌', err);
      }
    }

    function renderMeetings(data) {
      container.innerHTML = '';
      if (data.length === 0) {
        container.innerHTML = '<p>Зустрічей не знайдено</p>';
        return;
      }

      data.forEach(meeting => {
        const card = document.createElement('div');
        card.className = 'meeting-card';
        card.innerHTML = `
          <img src="${meeting.imageUrl}" alt="Зображення зустрічі" class="meeting-img">
          <h3>${meeting.title}</h3>
          <p>${meeting.date} — ${meeting.startTime}–${meeting.endTime}</p>
          <p>${meeting.type} (${meeting.format})</p>
        `;
        card.onclick = () => {
          window.location.href = "/meeting.html?id=" + meeting._id;
        };
        container.appendChild(card);
      });
    }

    function applyFilters() {
      let filtered = meetings;

      if (filterRegisteredCheckbox?.checked) {
        filtered = filtered.filter(m => m.participants?.includes(email));
      }

      if (filterCreatedCheckbox?.checked) {
        filtered = filtered.filter(m => m.creatorEmail === email);
      }

      if (filterOnlineCheckbox?.checked && !filterOfflineCheckbox?.checked) {
        filtered = filtered.filter(m => m.format === 'Онлайн');
      }

      if (filterOfflineCheckbox?.checked && !filterOnlineCheckbox?.checked) {
        filtered = filtered.filter(m => m.format === 'Офлайн');
      }

      const query = searchInput?.value.trim().toLowerCase();
      if (query) {
        filtered = filtered.filter(m => m.title.toLowerCase().includes(query));
      }

      renderMeetings(filtered);
    }

    // Події фільтрів
    filterRegisteredCheckbox?.addEventListener('change', applyFilters);
    filterCreatedCheckbox?.addEventListener('change', applyFilters);
    filterOnlineCheckbox?.addEventListener('change', applyFilters);
    filterOfflineCheckbox?.addEventListener('change', applyFilters);
    searchInput?.addEventListener('input', applyFilters);

    await fetchMeetings();
  }

  // ======== СТОРІНКА meeting.html (деталі однієї зустрічі) ========
  const deleteBtn = document.getElementById('deleteMeetingBtn');
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!email) {
    console.warn('❗ Email користувача не знайдено в localStorage');
  }

  if (deleteBtn && id && email) {
    try {
      const res = await fetch(`/api/meetings/${id}`);
      if (!res.ok) throw new Error('Не вдалося отримати зустріч');
      const meeting = await res.json();

      if (meeting.creatorEmail === email) {
        deleteBtn.style.display = 'inline-block';
        deleteBtn.addEventListener('click', async () => {
          if (confirm('Ви справді хочете видалити цю зустріч?')) {
            try {
              const delRes = await fetch(`/api/meetings/${id}`, {
                method: 'DELETE',
                headers: {
                  'x-user-email': email
                }
              });

              if (delRes.ok) {
                alert('Зустріч видалено');
                window.location.href = '/meetings.html';
              } else {
                const err = await delRes.json();
                alert('Помилка: ' + err.message);
                console.error('Помилка видалення:', err);
              }
            } catch (err) {
              console.error('❌ Помилка при видаленні зустрічі:', err);
              alert('Сталася помилка при видаленні зустрічі');
            }
          }
        });
      }
    } catch (err) {
      console.error('❌ Помилка при завантаженні зустрічі:', err);
    }
  }

  // ======== СТОРІНКА create-meeting.html ========
  const createForm = document.getElementById('createMeetingForm');
  if (createForm) {
    createForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(createForm);
      formData.append('creatorEmail', email); // 🔥 ось ця потрібна стрічка

      try {
        const res = await fetch('/api/meetings', {
          method: 'POST',
          body: formData
        });

        if (res.ok) {
          alert('Зустріч створено!');
          window.location.href = '/meetings.html';
        } else {
          const err = await res.json();
          alert('Помилка: ' + err.message);
        }
      } catch (err) {
        console.error('❌ Помилка створення зустрічі:', err);
        alert('Помилка з’єднання з сервером');
      }
    });
  }

});
