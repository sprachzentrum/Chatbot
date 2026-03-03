// --- Helpers ---
async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (res.status === 401) { window.location.href = '/login.html'; return null; }
  return res.json();
}

function $(sel) { return document.querySelector(sel); }
function formatDate(d) {
  if (!d) return '-';
  const date = new Date(d + 'Z');
  return date.toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function formatTime(d) {
  if (!d) return '';
  const date = new Date(d + 'Z');
  return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

// --- Navigation ---
const mainContent = $('#mainContent');
let currentPage = 'dashboard';

document.querySelectorAll('.sidebar a[data-page]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('active'));
    link.classList.add('active');
    currentPage = link.dataset.page;
    loadPage(currentPage);
  });
});

$('#logoutBtn').addEventListener('click', async (e) => {
  e.preventDefault();
  await api('/api/logout', { method: 'POST' });
  window.location.href = '/login.html';
});

// --- Modal ---
function showModal(html) {
  $('#modalContent').innerHTML = html;
  $('#modal').classList.add('active');
}
function closeModal() {
  $('#modal').classList.remove('active');
}
$('#modal').addEventListener('click', (e) => {
  if (e.target === $('#modal')) closeModal();
});

// --- Auth Check ---
(async () => {
  const auth = await api('/api/auth/check');
  if (!auth || !auth.authenticated) {
    window.location.href = '/login.html';
    return;
  }
  loadPage('dashboard');
})();

// --- Page Router ---
async function loadPage(page) {
  const pages = { dashboard: renderDashboard, whatsapp: renderWhatsApp, chat: renderChat, contacts: renderContacts, courses: renderCourses, enrollments: renderEnrollments, faq: renderFaq, settings: renderSettings };
  if (pages[page]) await pages[page]();
}

// --- Dashboard ---
async function renderDashboard() {
  const stats = await api('/api/stats');
  if (!stats) return;
  mainContent.innerHTML = `
    <h1>Dashboard</h1>
    <div class="stats-grid">
      <div class="stat-card"><div class="label">Kontakte</div><div class="value">${stats.totalContacts}</div></div>
      <div class="stat-card"><div class="label">Nachrichten gesamt</div><div class="value">${stats.totalMessages}</div></div>
      <div class="stat-card"><div class="label">Nachrichten heute</div><div class="value">${stats.messagesToday}</div></div>
      <div class="stat-card"><div class="label">Neue Kontakte heute</div><div class="value">${stats.newContactsToday}</div></div>
      <div class="stat-card"><div class="label">Aktive Kurse</div><div class="value">${stats.totalCourses}</div></div>
      <div class="stat-card"><div class="label">Anmeldungen</div><div class="value">${stats.totalEnrollments}</div></div>
      <div class="stat-card"><div class="label">FAQ-Einträge</div><div class="value">${stats.totalFaqs}</div></div>
    </div>
    <div class="card">
      <div class="card-header"><h2>Top FAQ-Einträge</h2></div>
      <div class="card-body">
        <table>
          <tr><th>Stichwort</th><th>Frage</th><th>Aufrufe</th></tr>
          ${stats.topFaqs.map(f => `<tr><td>${f.keyword}</td><td>${f.question}</td><td>${f.usage_count}</td></tr>`).join('')}
        </table>
      </div>
    </div>`;
}

// --- WhatsApp ---
async function renderWhatsApp() {
  const status = await api('/api/whatsapp/status');
  if (!status) return;
  let statusClass = 'status-disconnected';
  let statusText = 'Nicht verbunden';
  if (status.status === 'connected') { statusClass = 'status-connected'; statusText = 'Verbunden'; }
  else if (status.status === 'qr') { statusClass = 'status-qr'; statusText = 'QR-Code scannen'; }
  else if (status.status === 'authenticated') { statusClass = 'status-connected'; statusText = 'Authentifiziert'; }

  mainContent.innerHTML = `
    <h1>WhatsApp-Verbindung</h1>
    <div class="card">
      <div class="card-header">
        <h2>Status</h2>
        <span class="status-badge ${statusClass}">${statusText}</span>
      </div>
      <div class="card-body">
        ${status.status === 'qr' && status.qrCode ? `
          <div class="qr-code">
            <p>Scannen Sie den QR-Code mit WhatsApp:</p>
            <p style="font-size:0.85rem;color:var(--text-light);margin:0.5rem 0">WhatsApp > Einstellungen > Verknüpfte Geräte > Gerät verknüpfen</p>
            <img src="${status.qrCode}" alt="QR Code">
          </div>` : ''}
        ${status.status === 'connected' ? '<p>WhatsApp ist verbunden und der Bot empfängt Nachrichten.</p>' : ''}
        ${status.status === 'disconnected' ? '<p>WhatsApp ist nicht verbunden. Bitte starten Sie den Server neu, um einen neuen QR-Code zu erhalten.</p>' : ''}
      </div>
    </div>`;

  if (status.status === 'qr') {
    setTimeout(() => { if (currentPage === 'whatsapp') renderWhatsApp(); }, 5000);
  }
}

// --- Chat ---
let selectedPhone = null;
async function renderChat() {
  const contacts = await api('/api/contacts');
  if (!contacts) return;
  mainContent.innerHTML = `
    <h1>Nachrichten</h1>
    <div class="chat-container">
      <div class="chat-list" id="chatList">
        ${contacts.map(c => `
          <div class="chat-item ${c.phone === selectedPhone ? 'active' : ''}" data-phone="${c.phone}">
            <span class="time">${formatTime(c.last_message_at)}</span>
            <div class="name">${c.name || c.phone}</div>
            <div class="preview">${c.message_count} Nachrichten</div>
          </div>`).join('')}
        ${contacts.length === 0 ? '<div style="padding:1rem;color:var(--text-light)">Noch keine Konversationen</div>' : ''}
      </div>
      <div class="chat-messages-area" id="chatArea">
        <div class="chat-header-bar" id="chatHeader">Wählen Sie eine Konversation</div>
        <div class="chat-messages" id="chatMessages"></div>
        <div class="chat-input" id="chatInput" style="display:none">
          <input type="text" id="chatMsgInput" placeholder="Nachricht eingeben...">
          <button id="chatSendBtn">Senden</button>
        </div>
      </div>
    </div>`;

  document.querySelectorAll('.chat-item').forEach(item => {
    item.addEventListener('click', () => loadChat(item.dataset.phone, contacts));
  });

  if (selectedPhone) loadChat(selectedPhone, contacts);
}

async function loadChat(phone, contacts) {
  selectedPhone = phone;
  document.querySelectorAll('.chat-item').forEach(i => i.classList.toggle('active', i.dataset.phone === phone));
  const contact = contacts.find(c => c.phone === phone);
  const messages = await api(`/api/messages/${phone}`);
  if (!messages) return;

  $('#chatHeader').textContent = contact ? (contact.name || contact.phone) : phone;
  $('#chatInput').style.display = 'flex';
  $('#chatMessages').innerHTML = messages.map(m => `
    <div class="message ${m.direction}">
      <div>${m.body}</div>
      <div class="time">${formatTime(m.created_at)}</div>
    </div>`).join('');

  const chatMessages = $('#chatMessages');
  chatMessages.scrollTop = chatMessages.scrollHeight;

  $('#chatSendBtn').onclick = sendChatMessage;
  $('#chatMsgInput').onkeydown = (e) => { if (e.key === 'Enter') sendChatMessage(); };
}

async function sendChatMessage() {
  const input = $('#chatMsgInput');
  const message = input.value.trim();
  if (!message || !selectedPhone) return;
  input.value = '';
  await api('/api/messages/send', { method: 'POST', body: { phone: selectedPhone, message } });
  const contacts = await api('/api/contacts');
  if (contacts) loadChat(selectedPhone, contacts);
}

// --- Kontakte ---
async function renderContacts() {
  const contacts = await api('/api/contacts');
  if (!contacts) return;
  mainContent.innerHTML = `
    <h1>Kontakte</h1>
    <div class="card">
      <div class="card-body">
        <table>
          <tr><th>Name</th><th>Telefon</th><th>Sprache</th><th>Nachrichten</th><th>Letzte Nachricht</th><th>Notizen</th></tr>
          ${contacts.map(c => `<tr>
            <td>${c.name || '-'}</td><td>${c.phone}</td><td>${c.language_pref}</td>
            <td>${c.message_count}</td><td>${formatDate(c.last_message_at)}</td>
            <td>${c.notes || '-'}</td>
          </tr>`).join('')}
          ${contacts.length === 0 ? '<tr><td colspan="6" style="text-align:center;color:var(--text-light)">Noch keine Kontakte</td></tr>' : ''}
        </table>
      </div>
    </div>`;
}

// --- Kurse ---
async function renderCourses() {
  const courses = await api('/api/courses');
  if (!courses) return;
  mainContent.innerHTML = `
    <h1>Kurse</h1>
    <div class="card">
      <div class="card-header">
        <h2>Kursübersicht</h2>
        <button class="btn btn-primary" onclick="showCourseModal()">+ Neuer Kurs</button>
      </div>
      <div class="card-body">
        <table>
          <tr><th>Name</th><th>Sprache</th><th>Stufe</th><th>Zeiten</th><th>Preis</th><th>Teilnehmer</th><th>Aktiv</th><th></th></tr>
          ${courses.map(c => `<tr>
            <td>${c.name}</td><td>${c.language}</td><td>${c.level}</td>
            <td>${c.schedule || '-'}</td><td>${c.price ? c.price + '€' : '-'}</td>
            <td>${c.enrolled}/${c.max_participants}</td>
            <td>${c.active ? '<span class="status-badge status-connected">Aktiv</span>' : '<span class="status-badge status-disconnected">Inaktiv</span>'}</td>
            <td>
              <button class="btn btn-primary btn-sm" onclick='showCourseModal(${JSON.stringify(c)})'>Bearbeiten</button>
              <button class="btn btn-danger btn-sm" onclick="deleteCourse(${c.id})">Löschen</button>
            </td>
          </tr>`).join('')}
          ${courses.length === 0 ? '<tr><td colspan="8" style="text-align:center;color:var(--text-light)">Noch keine Kurse angelegt</td></tr>' : ''}
        </table>
      </div>
    </div>`;
}

function showCourseModal(course = null) {
  const isEdit = !!course;
  showModal(`
    <h2>${isEdit ? 'Kurs bearbeiten' : 'Neuer Kurs'}</h2>
    <form id="courseForm">
      <div class="form-group"><label>Kursname</label><input name="name" value="${course?.name || ''}" required></div>
      <div class="form-group"><label>Sprache</label><input name="language" value="${course?.language || ''}" required placeholder="z.B. Deutsch, Englisch"></div>
      <div class="form-group"><label>Stufe</label><select name="level">
        ${['A1','A2','B1','B2','C1','C2'].map(l => `<option ${course?.level === l ? 'selected' : ''}>${l}</option>`).join('')}
      </select></div>
      <div class="form-group"><label>Beschreibung</label><textarea name="description">${course?.description || ''}</textarea></div>
      <div class="form-group"><label>Zeiten</label><input name="schedule" value="${course?.schedule || ''}" placeholder="z.B. Mo+Mi 18:00-20:00"></div>
      <div class="form-group"><label>Preis (€)</label><input name="price" type="number" step="0.01" value="${course?.price || ''}"></div>
      <div class="form-group"><label>Max. Teilnehmer</label><input name="max_participants" type="number" value="${course?.max_participants || 15}"></div>
      ${isEdit ? `<div class="form-group"><label><input type="checkbox" name="active" ${course.active ? 'checked' : ''}> Aktiv</label></div>` : ''}
      <div class="modal-actions">
        <button type="button" class="btn" onclick="closeModal()">Abbrechen</button>
        <button type="submit" class="btn btn-primary">${isEdit ? 'Speichern' : 'Erstellen'}</button>
      </div>
    </form>`);
  $('#courseForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = { name: fd.get('name'), language: fd.get('language'), level: fd.get('level'), description: fd.get('description'), schedule: fd.get('schedule'), price: parseFloat(fd.get('price')) || null, max_participants: parseInt(fd.get('max_participants')) || 15, active: isEdit ? !!fd.get('active') : true };
    if (isEdit) await api(`/api/courses/${course.id}`, { method: 'PUT', body: data });
    else await api('/api/courses', { method: 'POST', body: data });
    closeModal();
    renderCourses();
  });
}

async function deleteCourse(id) {
  if (!confirm('Kurs wirklich löschen?')) return;
  await api(`/api/courses/${id}`, { method: 'DELETE' });
  renderCourses();
}

// --- Anmeldungen ---
async function renderEnrollments() {
  const enrollments = await api('/api/enrollments');
  if (!enrollments) return;
  mainContent.innerHTML = `
    <h1>Kursanmeldungen</h1>
    <div class="card">
      <div class="card-body">
        <table>
          <tr><th>Kontakt</th><th>Kurs</th><th>Status</th><th>Datum</th><th></th></tr>
          ${enrollments.map(e => `<tr>
            <td>${e.contact_name || e.contact_phone}</td><td>${e.course_name}</td>
            <td><span class="status-badge ${e.status === 'confirmed' ? 'status-connected' : e.status === 'cancelled' ? 'status-disconnected' : 'status-qr'}">${e.status === 'pending' ? 'Ausstehend' : e.status === 'confirmed' ? 'Bestätigt' : 'Storniert'}</span></td>
            <td>${formatDate(e.created_at)}</td>
            <td>
              ${e.status === 'pending' ? `<button class="btn btn-accent btn-sm" onclick="updateEnrollment(${e.id},'confirmed')">Bestätigen</button>` : ''}
              ${e.status !== 'cancelled' ? `<button class="btn btn-danger btn-sm" onclick="updateEnrollment(${e.id},'cancelled')">Stornieren</button>` : ''}
            </td>
          </tr>`).join('')}
          ${enrollments.length === 0 ? '<tr><td colspan="5" style="text-align:center;color:var(--text-light)">Noch keine Anmeldungen</td></tr>' : ''}
        </table>
      </div>
    </div>`;
}

async function updateEnrollment(id, status) {
  await api(`/api/enrollments/${id}/status`, { method: 'PUT', body: { status } });
  renderEnrollments();
}

// --- FAQ ---
async function renderFaq() {
  const faqs = await api('/api/faq');
  if (!faqs) return;
  mainContent.innerHTML = `
    <h1>FAQ / Automatische Antworten</h1>
    <div class="card">
      <div class="card-header">
        <h2>FAQ-Einträge</h2>
        <button class="btn btn-primary" onclick="showFaqModal()">+ Neuer Eintrag</button>
      </div>
      <div class="card-body">
        <table>
          <tr><th>Stichwort(e)</th><th>Frage</th><th>Antwort</th><th>Kategorie</th><th>Aufrufe</th><th>Aktiv</th><th></th></tr>
          ${faqs.map(f => `<tr>
            <td><strong>${f.keyword}</strong></td><td>${f.question}</td>
            <td style="max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${f.answer}</td>
            <td>${f.category}</td><td>${f.usage_count}</td>
            <td>${f.active ? 'Ja' : 'Nein'}</td>
            <td>
              <button class="btn btn-primary btn-sm" onclick='showFaqModal(${JSON.stringify(f).replace(/'/g, "&#39;")})'>Bearbeiten</button>
              <button class="btn btn-danger btn-sm" onclick="deleteFaq(${f.id})">Löschen</button>
            </td>
          </tr>`).join('')}
        </table>
      </div>
    </div>`;
}

function showFaqModal(faq = null) {
  const isEdit = !!faq;
  showModal(`
    <h2>${isEdit ? 'FAQ bearbeiten' : 'Neuer FAQ-Eintrag'}</h2>
    <form id="faqForm">
      <div class="form-group"><label>Stichwort(e) (kommagetrennt)</label><input name="keyword" value="${faq?.keyword || ''}" required placeholder="z.B. kurse, kursangebot"></div>
      <div class="form-group"><label>Frage</label><input name="question" value="${faq?.question || ''}" required placeholder="Welche Kurse gibt es?"></div>
      <div class="form-group"><label>Antwort</label><textarea name="answer" required>${faq?.answer || ''}</textarea></div>
      <div class="form-group"><label>Kategorie</label><input name="category" value="${faq?.category || 'Allgemein'}" placeholder="Allgemein"></div>
      ${isEdit ? `<div class="form-group"><label><input type="checkbox" name="active" ${faq.active ? 'checked' : ''}> Aktiv</label></div>` : ''}
      <div class="modal-actions">
        <button type="button" class="btn" onclick="closeModal()">Abbrechen</button>
        <button type="submit" class="btn btn-primary">${isEdit ? 'Speichern' : 'Erstellen'}</button>
      </div>
    </form>`);
  $('#faqForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = { keyword: fd.get('keyword'), question: fd.get('question'), answer: fd.get('answer'), category: fd.get('category') || 'Allgemein', active: isEdit ? !!fd.get('active') : true };
    if (isEdit) await api(`/api/faq/${faq.id}`, { method: 'PUT', body: data });
    else await api('/api/faq', { method: 'POST', body: data });
    closeModal();
    renderFaq();
  });
}

async function deleteFaq(id) {
  if (!confirm('FAQ-Eintrag wirklich löschen?')) return;
  await api(`/api/faq/${id}`, { method: 'DELETE' });
  renderFaq();
}

// --- Einstellungen ---
async function renderSettings() {
  const settings = await api('/api/settings');
  if (!settings) return;
  mainContent.innerHTML = `
    <h1>Einstellungen</h1>
    <div class="card">
      <div class="card-header"><h2>Bot-Konfiguration</h2></div>
      <div class="card-body">
        <form id="settingsForm">
          <div class="form-group"><label>Bot-Name</label><input name="bot_name" value="${settings.bot_name || ''}"></div>
          <div class="form-group"><label>Willkommensnachricht</label><textarea name="welcome_message">${settings.welcome_message || ''}</textarea></div>
          <div class="form-group"><label>Nachricht außerhalb der Öffnungszeiten</label><textarea name="out_of_hours_message">${settings.out_of_hours_message || ''}</textarea></div>
          <div class="form-group"><label>Öffnungszeiten</label><input name="business_hours" value="${settings.business_hours || ''}" placeholder="08:00-18:00"></div>
          <div class="form-group">
            <label>Automatische Antworten</label>
            <label class="toggle">
              <input type="checkbox" name="auto_reply" ${settings.auto_reply === '1' ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </div>
          <button type="submit" class="btn btn-primary">Einstellungen speichern</button>
        </form>
      </div>
    </div>`;
  $('#settingsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
      bot_name: fd.get('bot_name'),
      welcome_message: fd.get('welcome_message'),
      out_of_hours_message: fd.get('out_of_hours_message'),
      business_hours: fd.get('business_hours'),
      auto_reply: fd.get('auto_reply') ? '1' : '0',
    };
    await api('/api/settings', { method: 'PUT', body: data });
    alert('Einstellungen gespeichert!');
  });
}
