document.addEventListener('DOMContentLoaded', () => {
  const feedbackForm = document.getElementById('feedbackForm');
  const message = document.getElementById('message');
  const userInfoDiv = document.getElementById('userInfo');
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  const token = localStorage.getItem('token');
  const email = localStorage.getItem('email');
  
  // Обробка форми відгуку
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!token || !email) {
        alert('Щоб залишити відгук, будь ласка, авторизуйтеся.');
        window.location.href = '/login.html';
        return;
      }

      const name = document.getElementById('name').value.trim();
      const feedback = document.getElementById('feedback').value.trim();
      const rating = document.querySelector('input[name="rating"]:checked')?.value;

      if (!rating) {
        alert('Будь ласка, виберіть оцінку!');
        return;
      }

      if (feedback.length < 10) {
        alert('Відгук має містити щонайменше 10 символів.');
        return;
      }

      try {
        const response = await fetch('/api/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ name, feedback, rating })
        });

        const result = await response.json();

        if (response.ok) {
          message.textContent = result.message;
          message.style.display = 'block';
          feedbackForm.reset();
          setTimeout(() => (message.style.display = 'none'), 3000);
        } else {
          alert(result.message || 'Помилка при відправленні відгуку.');
        }
      } catch (error) {
        console.error('Помилка:', error);
        alert('Сталася помилка при відправленні відгуку.');
      }
    });
  }

fetch('/api/profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(res => {
      if (!res.ok) throw new Error('Не вдалося завантажити ім`я');
      return res.json();
    })
    .then(profile => {
      if (profile) {
        document.querySelector('#name').value = profile.firstName || '';
      }
    });

  // Реєстрація
  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();

      if (!email || !password) {
        alert('Будь ласка, заповніть всі поля.');
        return;
      }

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (response.ok) {
          alert(result.message);
          window.location.href = '/login.html';
        } else {
          alert(result.message || 'Помилка при реєстрації.');
        }
      } catch (error) {
        console.error('Помилка:', error);
        alert('Сталася помилка при реєстрації.');
      }
    });
  }

  // Вхід
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();

      if (!email || !password) {
        alert('Будь ласка, заповніть всі поля.');
        return;
      }

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('email', data.user.email);
          window.location.href = '/index.html';
        } else {
          alert(data.message || 'Помилка при вході');
        }
      } catch (error) {
        console.error('Помилка:', error);
        alert('Сталася помилка при вході.');
      }
    });
  }

  // Вивід email і аватару у профілі
const emailSpan = document.getElementById('userEmail');
const avatarImage = document.getElementById('avatarImage');
const authButton = document.getElementById('authButton');

if (emailSpan) {
  if (email) {
    emailSpan.textContent = email;
  } else {
    emailSpan.textContent = 'Не авторизовано';
  }
}

if (authButton) {
  if (token && email) {
    authButton.textContent = 'Вийти';
    authButton.onclick = logout;
  } else {
    authButton.textContent = 'Увійти';
    authButton.onclick = () => window.location.href = '/login.html';
  }
}

if (token && avatarImage) {
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
      if (profile.avatarUrl) {
        avatarImage.src = profile.avatarUrl;
      }
    })
    .catch(err => {
      console.error('Помилка при завантаженні профілю:', err);
    });
}else {
    avatarImage.style.display = 'none';
  }

});

// Функція виходу
function logout() {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('email');
  window.location.href = '/login.html';
}


  const menuToggle = document.getElementById('menuToggle');
  const sideMenu = document.getElementById('sideMenu');
  const createMeetingToggle = document.getElementById('createMeetingToggle');
  const createMeetingSubmenu = document.getElementById('createMeetingSubmenu');

  menuToggle.addEventListener('click', () => {
    sideMenu.classList.toggle('open');
  });

  createMeetingToggle.addEventListener('click', () => {
    createMeetingSubmenu.classList.toggle('open');
  });

  // Закриття меню при кліку поза ним
  document.addEventListener('click', (e) => {
    if (
      !sideMenu.contains(e.target) &&
      !menuToggle.contains(e.target)
    ) {
      sideMenu.classList.remove('open');
      createMeetingSubmenu.classList.remove('open');
    }
  });

  // Закриття меню при кліку на будь-який пункт
  sideMenu.querySelectorAll('.nav-button:not(.submenu-toggle)').forEach(link => {
    link.addEventListener('click', () => {
      sideMenu.classList.remove('open');
      createMeetingSubmenu.classList.remove('open');
    });
  });

    const currentPath = window.location.pathname;
  document.querySelectorAll('.side-menu .nav-button').forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });
