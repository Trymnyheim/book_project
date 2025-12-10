async function postJson(url, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  return res.json();
}

function saveToken(t) { localStorage.setItem('student_token', t); }
function getToken() { return localStorage.getItem('student_token'); }
function clearToken() { localStorage.removeItem('student_token'); }

document.getElementById('signup-form').addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.target;
  const name = f.name.value;
  const email = f.email.value;
  const password = f.password.value;
  const r = await postJson('/api/auth/signup', { name, email, password });
  if (r.token) {
    saveToken(r.token);
    showStudent(r.user || { name });
    loadBooks();
  } else {
    alert(r.error || 'Signup failed');
  }
});

document.getElementById('login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.target;
  const email = f.email.value;
  const password = f.password.value;
  const r = await postJson('/api/auth/login', { email, password });
  if (r.token) {
    saveToken(r.token);
    showStudent(r.user);
    loadBooks();
  } else {
    alert(r.error || 'Login failed');
  }
});

document.getElementById('logout').addEventListener('click', () => {
  clearToken();
  document.getElementById('student-area').style.display = 'none';
  document.getElementById('auth').style.display = 'block';
});

function showStudent(user) {
  document.getElementById('student-name').textContent = user.name || user.email;
  document.getElementById('auth').style.display = 'none';
  document.getElementById('student-area').style.display = 'block';
}

async function loadBooks() {
  const res = await fetch('/api/books');
  const rows = await res.json();
  const container = document.getElementById('books');
  container.innerHTML = '';
  const token = getToken();
  rows.forEach(b => {
    const d = document.createElement('div');
    d.innerHTML = `<strong>${b.title}</strong> — ${b.author} <button data-id="${b.id}">Rent</button>`;
    const btn = d.querySelector('button');
    btn.addEventListener('click', async () => {
      const due = null; // server can set default
      const r = await postJson('/api/rentals', { book_id: b.id }, token);
      if (r.error) alert(r.error);
      else alert('Rented!');
    });
    container.appendChild(d);
  });
}

// If token exists, try to show user
(async function init() {
  const token = getToken();
  if (token) {
    // Try to call a protected-ish endpoint to verify token; here we call /api/books and keep
    try { await loadBooks(); document.getElementById('auth').style.display = 'none'; document.getElementById('student-area').style.display = 'block'; } catch (e) { clearToken(); }
  }
})();
