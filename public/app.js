// Lightweight UI logic for Library Demo
const $ = sel => document.querySelector(sel);
const qs = sel => Array.from(document.querySelectorAll(sel));

async function fetchStats(){
  try{
    const r = await fetch('/api/stats');
    if(!r.ok) return;
    const j = await r.json();
    $('#stat-total').innerText = `Books: ${j.totalBooks}`;
    $('#stat-lent').innerText = `Lent: ${j.lent}`;
    $('#stat-subs').innerText = `Subscribers: ${j.subscribers}`;
  }catch(e){console.warn('stats',e.message)}
}

async function searchBooks(){
  const title = $('#qTitle').value;
  const author = $('#qAuthor').value;
  const available = $('#qAvailable').checked;
  const params = new URLSearchParams();
  if(title) params.set('title', title);
  if(author) params.set('author', author);
  if(available) params.set('available', 'true');
  const res = await fetch('/api/books?' + params.toString());
  const books = await res.json();
  renderBooks(books);
  fetchStats();
}

function renderBooks(list){
  const cont = $('#books'); cont.innerHTML = '';
  if(!list.length){ cont.innerHTML = '<div class="card">No books found</div>'; return }
  for(const b of list){
    const el = document.createElement('div'); el.className = 'book-card';
    el.innerHTML = `<h4>${escapeHtml(b.title)}</h4>
      <div class="book-meta">${escapeHtml(b.author)} • ${escapeHtml(b.publisher||'—')}</div>
      <div>ISBN: ${escapeHtml(b.isbn||'—')}</div>
      <div style="margin-top:8px">Available: <strong>${b.available_copies}</strong> / ${b.total_copies}</div>
      <div class="book-actions" style="margin-top:10px">
        <button class="btn" data-id="${b.id}" data-action="details">Details</button>
        <button class="btn primary" data-id="${b.id}" data-action="rent">Rent</button>
      </div>`;
    cont.appendChild(el);
  }
}

function escapeHtml(s){ if(s===null||s===undefined) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

// Modal helpers
function showModal(html){ $('#modalBody').innerHTML = html; $('#modal').classList.remove('hidden'); }
function hideModal(){ $('#modal').classList.add('hidden'); $('#modalBody').innerHTML = '' }

async function onBookAction(e){
  const btn = e.target.closest('button'); if(!btn) return;
  const id = btn.dataset.id; const action = btn.dataset.action;
  if(action === 'details'){
    const r = await fetch('/api/books/' + id); const book = await r.json();
    showModal(`<h3>${escapeHtml(book.title)}</h3>
      <p><strong>Author:</strong> ${escapeHtml(book.author)}</p>
      <p><strong>Publisher:</strong> ${escapeHtml(book.publisher||'—')}</p>
      <p><strong>ISBN:</strong> ${escapeHtml(book.isbn||'—')}</p>
      <p><strong>Available:</strong> ${book.available_copies} / ${book.total_copies}</p>
      <div style="margin-top:12px"><button id="modalRent" class="btn primary">Rent this book</button></div>`);
    $('#modalBody').querySelector('#modalRent').addEventListener('click', async ()=>{
      const userId = $('#userId').value || prompt('Enter user id');
      if(!userId) return alert('User id required');
      const rr = await fetch('/api/rentals', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ book_id: id, user_id: userId }) });
      const body = await rr.json();
      if(!rr.ok) return alert('Error: '+(body.error||body.message||JSON.stringify(body)));
      alert('Rented successfully'); hideModal(); searchBooks();
    });
  } else if(action === 'rent'){
    const userId = $('#userId').value || prompt('Enter user id');
    if(!userId) return alert('User id required');
    const rr = await fetch('/api/rentals', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ book_id: id, user_id: userId }) });
    const body = await rr.json();
    if(!rr.ok) return alert('Error: '+(body.error||body.message||JSON.stringify(body)));
    alert('Rented successfully'); searchBooks();
  }
}

async function viewHistory(){
  const uid = $('#userId').value.trim(); if(!uid) return alert('Enter user id');
  const r = await fetch('/api/users/' + encodeURIComponent(uid) + '/history');
  const rows = await r.json();
  const out = rows.map(rt => `<div><strong>${escapeHtml(rt.title || rt.book_id)}</strong> — ${new Date(rt.rented_at).toLocaleString()} — ${rt.status}${rt.returned_at?(' — returned ' + new Date(rt.returned_at).toLocaleString()):''}</div>`).join('');
  $('#history').innerHTML = out || '<div>No rentals</div>';
}

// Wire events
document.addEventListener('click', e=>{
  if(e.target.matches('[data-action]')) onBookAction(e);
});
$('#searchBtn').addEventListener('click', searchBooks);
$('#closeModal').addEventListener('click', hideModal);
$('#viewHistory').addEventListener('click', viewHistory);

// initial
searchBooks(); fetchStats();
