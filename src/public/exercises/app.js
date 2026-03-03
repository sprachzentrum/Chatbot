/**
 * Übungsgenerator - Frontend-Logik
 */

// State
const state = {
  selectedType: null,
  selectedLevel: 'B1',
  currentExercise: null,
  currentH5P: null,
  oesdLevel: null,
  types: [],
  examples: {},
};

// ====== Initialisierung ======

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  loadExerciseTypes();
  loadExamples();
  initEventListeners();
});

function initTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
    });
  });
}

function initEventListeners() {
  // Level Selector (Generator)
  document.querySelectorAll('.level-btn[data-level]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.level-btn[data-level]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.selectedLevel = btn.dataset.level;
    });
  });

  // ÖSD Level Selector
  document.querySelectorAll('[data-oesd-level]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-oesd-level]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.oesdLevel = btn.dataset.oesdLevel;
    });
  });

  // Example Level Filter
  document.querySelectorAll('[data-example-level]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-example-level]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderExamples(btn.dataset.exampleLevel);
    });
  });

  // Buttons
  document.getElementById('btn-generate').addEventListener('click', generateExercise);
  document.getElementById('btn-export-h5p').addEventListener('click', exportAsH5P);
  document.getElementById('btn-preview').addEventListener('click', showPreview);
  document.getElementById('btn-copy-json').addEventListener('click', () => copyToClipboard('result-json'));
  document.getElementById('btn-download-h5p').addEventListener('click', downloadH5P);
  document.getElementById('btn-show-structure').addEventListener('click', showOesdStructure);
  document.getElementById('btn-generate-oesd').addEventListener('click', generateOesdExam);
  document.getElementById('btn-copy-oesd').addEventListener('click', () => copyToClipboard('oesd-result-json'));
  document.getElementById('btn-download-oesd').addEventListener('click', downloadOesd);
  document.getElementById('btn-export-json').addEventListener('click', exportFromJson);
  document.getElementById('btn-copy-export').addEventListener('click', () => copyToClipboard('export-content-json'));
  document.getElementById('btn-download-export').addEventListener('click', downloadExport);
}

// ====== API Calls ======

async function api(path, method = 'GET', body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(path, opts);
  const data = await res.json();

  if (!data.success) {
    throw new Error(data.error || 'API-Fehler');
  }
  return data;
}

// ====== Übungstypen laden ======

async function loadExerciseTypes() {
  try {
    const data = await api('/api/exercises/types');
    state.types = data.types;
    renderExerciseTypes();
  } catch (err) {
    console.error('Fehler beim Laden der Übungstypen:', err);
  }
}

function renderExerciseTypes() {
  const container = document.getElementById('exercise-types');
  container.innerHTML = state.types.map(t => `
    <div class="type-card" data-type="${t.id}">
      <h3>${t.name}</h3>
      <p>${t.description}</p>
      <span class="h5p-tag">${t.h5pContentType}</span>
    </div>
  `).join('');

  container.querySelectorAll('.type-card').forEach(card => {
    card.addEventListener('click', () => selectExerciseType(card.dataset.type));
  });
}

function selectExerciseType(typeId) {
  state.selectedType = typeId;

  document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
  document.querySelector(`.type-card[data-type="${typeId}"]`).classList.add('selected');

  const type = state.types.find(t => t.id === typeId);
  document.getElementById('form-title').textContent = type.name + ' konfigurieren';

  renderDynamicFields(typeId);

  document.getElementById('exercise-form').classList.remove('hidden');
  document.getElementById('result-area').classList.add('hidden');
}

// ====== Dynamische Formularfelder ======

function renderDynamicFields(typeId) {
  const container = document.getElementById('dynamic-fields');

  const fieldTemplates = {
    multipleChoice: `
      <div class="form-group">
        <label>Kontext / Lesetext (optional)</label>
        <textarea id="field-context" placeholder="Lesetext, auf den sich die Frage bezieht..."></textarea>
      </div>
      <div class="form-group">
        <label>Frage</label>
        <input type="text" id="field-question" placeholder="Welche Aussage ist richtig?">
      </div>
      <div class="form-group">
        <label>Antworten (markieren Sie die richtige/n)</label>
        <div id="answers-container">
          <div class="answer-row">
            <input type="checkbox" class="answer-correct">
            <input type="text" class="answer-text" placeholder="Antwort A">
            <button class="btn btn-danger" onclick="removeAnswer(this)" title="Entfernen">&times;</button>
          </div>
          <div class="answer-row">
            <input type="checkbox" class="answer-correct">
            <input type="text" class="answer-text" placeholder="Antwort B">
            <button class="btn btn-danger" onclick="removeAnswer(this)" title="Entfernen">&times;</button>
          </div>
          <div class="answer-row">
            <input type="checkbox" class="answer-correct" checked>
            <input type="text" class="answer-text" placeholder="Antwort C (richtig)">
            <button class="btn btn-danger" onclick="removeAnswer(this)" title="Entfernen">&times;</button>
          </div>
        </div>
        <button class="btn btn-secondary" onclick="addAnswer()" style="margin-top:.5rem">+ Antwort hinzufügen</button>
      </div>
    `,

    fillInBlanks: `
      <div class="form-group">
        <label>Aufgabenstellung</label>
        <input type="text" id="field-task" value="Füllen Sie die Lücken aus.">
      </div>
      <div class="form-group">
        <label>Sätze mit Lücken</label>
        <div class="alert alert-info">
          Markieren Sie die Lücken mit Sternchen: *richtige Antwort*<br>
          Mehrere Antworten: *Antwort1/Antwort2*<br>
          Mit Hinweis: *Antwort:Hinweis*
        </div>
        <textarea id="field-sentences" rows="8" placeholder="Ich *komme* aus Deutschland.
Er *wohnt/lebt* in Wien.
Wir *sprechen:Verb* Deutsch."></textarea>
      </div>
    `,

    dragText: `
      <div class="form-group">
        <label>Aufgabenstellung</label>
        <input type="text" id="field-task" value="Ziehen Sie die Wörter an die richtige Stelle.">
      </div>
      <div class="form-group">
        <label>Text mit Drag-Wörtern</label>
        <div class="alert alert-info">
          Markieren Sie die ziehbaren Wörter mit Sternchen: *Wort*
        </div>
        <textarea id="field-text" rows="6" placeholder="Der Hund *frisst* einen *Knochen* im *Garten*."></textarea>
      </div>
      <div class="form-group">
        <label>Distraktoren (falsche Wörter, optional, kommagetrennt)</label>
        <input type="text" id="field-distractors" placeholder="trinkt, schläft">
      </div>
    `,

    trueFalse: `
      <div class="form-group">
        <label>Kontext / Lesetext (optional)</label>
        <textarea id="field-context" rows="3" placeholder="Kontext-Text..."></textarea>
      </div>
      <div class="form-group">
        <label>Aussage</label>
        <input type="text" id="field-question" placeholder="Wien ist die Hauptstadt von Österreich.">
      </div>
      <div class="form-group">
        <label>Die Aussage ist:</label>
        <select id="field-correct">
          <option value="true">Richtig</option>
          <option value="false">Falsch</option>
        </select>
      </div>
    `,

    markTheWords: `
      <div class="form-group">
        <label>Aufgabenstellung</label>
        <input type="text" id="field-task" value="Markieren Sie die gesuchten Wörter.">
      </div>
      <div class="form-group">
        <label>Text mit markierten Wörtern</label>
        <div class="alert alert-info">
          Markieren Sie die zu findenden Wörter mit Sternchen: *Wort*
        </div>
        <textarea id="field-text" rows="6" placeholder="Wenn ich mehr Zeit *hätte*, *würde* ich ins Kino gehen."></textarea>
      </div>
    `,

    dialogCards: `
      <div class="form-group">
        <label>Titel der Kartenserie</label>
        <input type="text" id="field-title" placeholder="Vokabelkarten Thema XY">
      </div>
      <div class="form-group">
        <label>Karten (eine pro Zeile: Vorderseite | Rückseite | Hinweis)</label>
        <div class="alert alert-info">
          Format: Vorderseite | Rückseite | Hinweis (optional)
        </div>
        <textarea id="field-cards" rows="8" placeholder="Guten Morgen! | Good morning! | Vormittag
Auf Wiedersehen! | Goodbye! | Formell
Wie geht es Ihnen? | How are you? | Sie-Form"></textarea>
      </div>
    `,

    sortParagraphs: `
      <div class="form-group">
        <label>Aufgabenstellung</label>
        <input type="text" id="field-task" value="Bringen Sie die Absätze in die richtige Reihenfolge.">
      </div>
      <div class="form-group">
        <label>Absätze in korrekter Reihenfolge (einer pro Zeile)</label>
        <textarea id="field-paragraphs" rows="8" placeholder="Liebe Frau Müller,
vielen Dank für Ihre Nachricht.
Ich möchte mich für den Kurs anmelden.
Mit freundlichen Grüßen"></textarea>
      </div>
    `,

    essay: `
      <div class="form-group">
        <label>Aufgabenstellung</label>
        <textarea id="field-task" rows="3" placeholder="Schreiben Sie eine E-Mail an..."></textarea>
      </div>
      <div class="form-group">
        <label>Einleitung / Kontext (optional)</label>
        <textarea id="field-introduction" rows="2" placeholder="Situationsbeschreibung..."></textarea>
      </div>
      <div class="form-group">
        <label>Schlüsselwörter (kommagetrennt, für automatische Bewertung)</label>
        <input type="text" id="field-keywords" placeholder="Wohnung, Miete, einziehen, Zimmer">
      </div>
      <div class="form-group">
        <label>Minimale Wortanzahl</label>
        <input type="number" id="field-minwords" value="80">
      </div>
      <div class="form-group">
        <label>Maximale Wortanzahl</label>
        <input type="number" id="field-maxwords" value="120">
      </div>
      <div class="form-group">
        <label>Musterlösung (optional)</label>
        <textarea id="field-solution" rows="4" placeholder="Beispieltext..."></textarea>
      </div>
    `,

    listening: `
      <div class="form-group">
        <label>Titel</label>
        <input type="text" id="field-title" placeholder="Hörverstehen: Gespräch im Café">
      </div>
      <div class="form-group">
        <label>Audio-URL (optional)</label>
        <input type="text" id="field-audio" placeholder="https://example.com/audio.mp3">
      </div>
      <div class="form-group">
        <label>Transkript (optional)</label>
        <textarea id="field-transcript" rows="4" placeholder="Transkript des Audios..."></textarea>
      </div>
      <div class="form-group">
        <label>Anzahl Abspielvorgänge</label>
        <input type="number" id="field-playcount" value="2" min="1" max="5">
      </div>
      <div class="alert alert-info">
        Aufgaben werden über die API als JSON definiert.
      </div>
    `,
  };

  container.innerHTML = fieldTemplates[typeId] || '<p>Diesen Übungstyp über die API konfigurieren.</p>';
}

function addAnswer() {
  const container = document.getElementById('answers-container');
  const row = document.createElement('div');
  row.className = 'answer-row';
  row.innerHTML = `
    <input type="checkbox" class="answer-correct">
    <input type="text" class="answer-text" placeholder="Neue Antwort">
    <button class="btn btn-danger" onclick="removeAnswer(this)" title="Entfernen">&times;</button>
  `;
  container.appendChild(row);
}

function removeAnswer(btn) {
  const container = document.getElementById('answers-container');
  if (container.children.length > 2) {
    btn.closest('.answer-row').remove();
  }
}

// ====== Übung generieren ======

async function generateExercise() {
  try {
    const params = collectFormParams();
    if (!params) return;

    const data = await api('/api/exercises/generate', 'POST', {
      type: state.selectedType,
      params,
    });

    state.currentExercise = data.exercise;
    showResult(data.exercise, 'exercise');
  } catch (err) {
    showError(err.message);
  }
}

async function exportAsH5P() {
  try {
    const params = collectFormParams();
    if (!params) return;

    const data = await api('/api/exercises/export/h5p', 'POST', {
      type: state.selectedType,
      params,
    });

    state.currentH5P = data;
    showResult(data.h5p, 'h5p');
  } catch (err) {
    showError(err.message);
  }
}

function collectFormParams() {
  if (!state.selectedType) {
    showError('Bitte wählen Sie zuerst einen Übungstyp.');
    return null;
  }

  const params = { level: state.selectedLevel };

  switch (state.selectedType) {
    case 'multipleChoice': {
      params.question = document.getElementById('field-question')?.value;
      params.context = document.getElementById('field-context')?.value || null;
      const rows = document.querySelectorAll('.answer-row');
      params.answers = Array.from(rows).map(row => ({
        text: row.querySelector('.answer-text').value,
        correct: row.querySelector('.answer-correct').checked,
      })).filter(a => a.text);

      if (!params.question) { showError('Bitte geben Sie eine Frage ein.'); return null; }
      if (params.answers.length < 2) { showError('Mindestens 2 Antworten nötig.'); return null; }
      if (!params.answers.some(a => a.correct)) { showError('Mindestens eine Antwort muss korrekt sein.'); return null; }
      break;
    }

    case 'fillInBlanks': {
      params.task = document.getElementById('field-task')?.value;
      const sentencesRaw = document.getElementById('field-sentences')?.value || '';
      params.sentences = sentencesRaw.split('\n').filter(s => s.trim()).map(s => {
        const blanks = [];
        const regex = /\*([^*]+)\*/g;
        let match;
        while ((match = regex.exec(s)) !== null) {
          const parts = match[1].split(':');
          const answers = parts[0].split('/');
          blanks.push({
            answer: answers,
            hint: parts[1] || '',
          });
        }
        return { text: s, blanks };
      });

      if (params.sentences.length === 0) { showError('Bitte geben Sie Sätze mit Lücken ein.'); return null; }
      break;
    }

    case 'dragText':
      params.task = document.getElementById('field-task')?.value;
      params.text = document.getElementById('field-text')?.value;
      params.distractors = (document.getElementById('field-distractors')?.value || '')
        .split(',').map(d => d.trim()).filter(Boolean);
      if (!params.text) { showError('Bitte geben Sie einen Text ein.'); return null; }
      break;

    case 'trueFalse':
      params.question = document.getElementById('field-question')?.value;
      params.context = document.getElementById('field-context')?.value || null;
      params.correct = document.getElementById('field-correct')?.value === 'true';
      if (!params.question) { showError('Bitte geben Sie eine Aussage ein.'); return null; }
      break;

    case 'markTheWords':
      params.task = document.getElementById('field-task')?.value;
      params.text = document.getElementById('field-text')?.value;
      if (!params.text) { showError('Bitte geben Sie einen Text ein.'); return null; }
      break;

    case 'dialogCards': {
      params.title = document.getElementById('field-title')?.value;
      const cardsRaw = document.getElementById('field-cards')?.value || '';
      params.cards = cardsRaw.split('\n').filter(l => l.trim()).map(line => {
        const parts = line.split('|').map(p => p.trim());
        return {
          front: parts[0] || '',
          back: parts[1] || '',
          tip: parts[2] || undefined,
        };
      });
      if (params.cards.length === 0) { showError('Bitte geben Sie Karten ein.'); return null; }
      break;
    }

    case 'sortParagraphs': {
      params.task = document.getElementById('field-task')?.value;
      const parasRaw = document.getElementById('field-paragraphs')?.value || '';
      params.paragraphs = parasRaw.split('\n').filter(p => p.trim());
      if (params.paragraphs.length < 2) { showError('Mindestens 2 Absätze nötig.'); return null; }
      break;
    }

    case 'essay': {
      params.task = document.getElementById('field-task')?.value;
      params.introduction = document.getElementById('field-introduction')?.value || null;
      const keywordsRaw = document.getElementById('field-keywords')?.value || '';
      params.keywords = keywordsRaw.split(',').map(k => k.trim()).filter(Boolean).map(k => ({ keyword: k }));
      params.minWords = parseInt(document.getElementById('field-minwords')?.value) || 80;
      params.maxWords = parseInt(document.getElementById('field-maxwords')?.value) || 120;
      params.sampleSolution = document.getElementById('field-solution')?.value || null;
      if (!params.task) { showError('Bitte geben Sie eine Aufgabenstellung ein.'); return null; }
      break;
    }

    case 'listening': {
      params.title = document.getElementById('field-title')?.value;
      params.audioUrl = document.getElementById('field-audio')?.value || null;
      params.transcript = document.getElementById('field-transcript')?.value || null;
      params.playCount = parseInt(document.getElementById('field-playcount')?.value) || 2;
      params.tasks = [{ question: 'Aufgabe 1' }]; // Placeholder
      if (!params.title) { showError('Bitte geben Sie einen Titel ein.'); return null; }
      break;
    }
  }

  return params;
}

// ====== Ergebnis anzeigen ======

function showResult(data, mode) {
  const area = document.getElementById('result-area');
  const jsonArea = document.getElementById('result-json');
  const previewArea = document.getElementById('result-preview');
  const alertArea = document.getElementById('result-alert');

  area.classList.remove('hidden');

  alertArea.innerHTML = '<div class="alert alert-success">Übung erfolgreich generiert!</div>';
  jsonArea.classList.remove('hidden');
  jsonArea.querySelector('pre').textContent = JSON.stringify(data, null, 2);

  if (mode === 'exercise') {
    previewArea.classList.remove('hidden');
    previewArea.innerHTML = renderExercisePreview(data);
  } else {
    previewArea.classList.add('hidden');
  }

  area.scrollIntoView({ behavior: 'smooth' });
}

function showPreview() {
  if (state.currentExercise) {
    const previewArea = document.getElementById('result-preview');
    previewArea.classList.remove('hidden');
    previewArea.innerHTML = renderExercisePreview(state.currentExercise);
  } else {
    generateExercise();
  }
}

function renderExercisePreview(exercise) {
  if (!exercise || !exercise.content) return '<p>Keine Vorschau verfügbar.</p>';

  const c = exercise.content;
  let html = `<span class="badge badge-blue">${exercise.level || ''}</span>
    <span class="badge badge-gray">${exercise.type}</span>`;

  switch (exercise.type) {
    case 'multipleChoice':
      html += `<h3 style="margin-top:.5rem">${c.question}</h3>`;
      if (c.context) html += `<div style="background:#f8fafc;padding:.75rem;border-radius:6px;margin:.5rem 0;font-size:.9rem">${c.context}</div>`;
      html += '<ul style="list-style:none;padding:0">';
      c.answers.forEach(a => {
        const icon = a.correct ? '<span style="color:green">&#10004;</span>' : '<span style="color:#ccc">&#9675;</span>';
        html += `<li style="padding:.4rem 0">${icon} ${a.text}</li>`;
      });
      html += '</ul>';
      break;

    case 'fillInBlanks':
      html += `<h3 style="margin-top:.5rem">${c.task}</h3>`;
      c.sentences.forEach(s => {
        let display = s.text.replace(/\*([^*]+)\*/g, '<span style="background:#dbeafe;padding:2px 6px;border-radius:4px;border-bottom:2px solid #2563eb">____</span>');
        html += `<p style="margin:.5rem 0">${display}</p>`;
      });
      break;

    case 'dragText':
      html += `<h3 style="margin-top:.5rem">${c.task}</h3>`;
      let display = c.text.replace(/\*([^*]+)\*/g, '<span style="background:#fef3c7;padding:2px 8px;border-radius:4px;border:1px dashed #d97706;cursor:move">$1</span>');
      html += `<p>${display}</p>`;
      break;

    case 'trueFalse':
      if (c.context) html += `<div style="background:#f8fafc;padding:.75rem;border-radius:6px;margin:.5rem 0;font-size:.9rem">${c.context}</div>`;
      html += `<h3 style="margin-top:.5rem">${c.question}</h3>`;
      html += `<p>Antwort: <strong style="color:${c.correct ? 'green' : 'red'}">${c.correct ? 'Richtig' : 'Falsch'}</strong></p>`;
      break;

    case 'markTheWords':
      html += `<h3 style="margin-top:.5rem">${c.task}</h3>`;
      let markDisplay = c.text.replace(/\*([^*]+)\*/g, '<span style="background:#dcfce7;padding:2px 6px;border-radius:4px;border:1px solid #22c55e;cursor:pointer">$1</span>');
      html += `<p>${markDisplay}</p>`;
      break;

    case 'dialogCards':
      html += `<h3 style="margin-top:.5rem">${c.title}</h3>`;
      html += '<div style="display:flex;gap:.5rem;flex-wrap:wrap">';
      c.cards.forEach(card => {
        html += `<div style="border:1px solid #e2e8f0;border-radius:8px;padding:.75rem;min-width:150px;text-align:center">
          <div style="font-weight:600">${card.front}</div>
          <div style="color:#64748b;font-size:.85rem;margin-top:.25rem">${card.back}</div>
        </div>`;
      });
      html += '</div>';
      break;

    case 'sortParagraphs':
      html += `<h3 style="margin-top:.5rem">${c.task}</h3>`;
      c.paragraphs.forEach((p, i) => {
        html += `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:.5rem .75rem;margin:.25rem 0;cursor:move">
          <span style="color:#94a3b8;font-size:.8rem">${i + 1}.</span> ${p.text}
        </div>`;
      });
      break;

    case 'essay':
      html += `<h3 style="margin-top:.5rem">${c.task}</h3>`;
      if (c.introduction) html += `<div style="background:#f8fafc;padding:.75rem;border-radius:6px;margin:.5rem 0;font-size:.9rem">${c.introduction}</div>`;
      html += `<p style="color:#64748b;font-size:.85rem">Wortanzahl: ${c.wordLimits.min}-${c.wordLimits.max} Wörter</p>`;
      if (c.criteria && c.criteria.length > 0) {
        html += '<p style="font-weight:500;margin-top:.5rem">Bewertungskriterien:</p><ul style="font-size:.85rem;color:#475569">';
        c.criteria.forEach(cr => { html += `<li>${cr}</li>`; });
        html += '</ul>';
      }
      break;

    default:
      html += `<pre>${JSON.stringify(c, null, 2)}</pre>`;
  }

  return html;
}

function showError(message) {
  const alertArea = document.getElementById('result-alert');
  const area = document.getElementById('result-area');
  area.classList.remove('hidden');
  alertArea.innerHTML = `<div class="alert alert-error">${message}</div>`;
  area.scrollIntoView({ behavior: 'smooth' });
}

// ====== ÖSD Prüfung ======

async function showOesdStructure() {
  if (!state.oesdLevel) {
    alert('Bitte wählen Sie ein Prüfungsniveau.');
    return;
  }

  try {
    const data = await api('/api/exercises/oesd/structure');
    const level = data.structure.find(s => s.level === state.oesdLevel);
    if (!level) throw new Error('Niveau nicht gefunden');

    const container = document.getElementById('oesd-structure');
    container.classList.remove('hidden');

    document.getElementById('oesd-title').textContent = level.name;

    document.getElementById('oesd-summary').innerHTML = `
      <div class="exam-stat">
        <div class="value">${level.totalDurationFormatted}</div>
        <div class="label">Gesamtdauer</div>
      </div>
      <div class="exam-stat">
        <div class="value">${level.totalPoints}</div>
        <div class="label">Gesamtpunkte</div>
      </div>
      <div class="exam-stat">
        <div class="value">${level.passPoints}</div>
        <div class="label">Bestehensgrenze (${level.passPercent}%)</div>
      </div>
      <div class="exam-stat">
        <div class="value">${level.modules.length}</div>
        <div class="label">Module</div>
      </div>
    `;

    document.getElementById('oesd-modules').innerHTML = level.modules.map(mod => `
      <div class="oesd-module">
        <h3>${mod.name} <span class="badge badge-blue">${mod.durationFormatted}</span></h3>
        ${mod.parts.map(part => `
          <div class="oesd-part">
            <div class="part-header">
              <strong>${part.name}</strong>
              <span class="badge badge-green">${part.points} Punkte</span>
            </div>
            <p style="font-size:.85rem;color:#64748b;margin-top:.25rem">${part.description}</p>
            <span class="badge badge-orange">${part.exerciseType}</span>
            <span class="badge badge-gray">${part.itemCount} Aufgaben</span>
          </div>
        `).join('')}
      </div>
    `).join('');

    container.scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    alert('Fehler: ' + err.message);
  }
}

async function generateOesdExam() {
  if (!state.oesdLevel) {
    alert('Bitte wählen Sie ein Prüfungsniveau.');
    return;
  }

  try {
    const topic = document.getElementById('oesd-topic').value || undefined;
    const data = await api('/api/exercises/oesd/generate', 'POST', {
      level: state.oesdLevel,
      topic,
    });

    const container = document.getElementById('oesd-result');
    container.classList.remove('hidden');
    container.querySelector('pre').textContent = JSON.stringify(data.exam, null, 2);
    container.scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    alert('Fehler: ' + err.message);
  }
}

// ====== Beispiele ======

async function loadExamples() {
  try {
    const data = await api('/api/exercises/examples');
    state.examples = data.examples;
    renderExamples('all');
  } catch (err) {
    console.error('Fehler beim Laden der Beispiele:', err);
  }
}

function renderExamples(level) {
  const container = document.getElementById('examples-grid');
  let examples = [];

  if (level === 'all') {
    for (const [lvl, exs] of Object.entries(state.examples)) {
      examples.push(...exs.map(e => ({ ...e, level: lvl })));
    }
  } else {
    examples = (state.examples[level] || []).map(e => ({ ...e, level }));
  }

  container.innerHTML = examples.map(ex => {
    const previewText = ex.params.question || ex.params.task || ex.params.title || ex.params.text || '';
    return `
      <div class="example-card" data-example="${ex.id}">
        <span class="badge badge-blue">${ex.level}</span>
        <div class="type">${ex.type}</div>
        <div class="preview">${previewText.substring(0, 80)}${previewText.length > 80 ? '...' : ''}</div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.example-card').forEach(card => {
    card.addEventListener('click', () => loadExample(card.dataset.example));
  });
}

async function loadExample(exampleId) {
  try {
    const data = await api('/api/exercises/examples/generate', 'POST', { exampleId });

    const container = document.getElementById('example-result');
    container.classList.remove('hidden');

    document.getElementById('example-preview').innerHTML = renderExercisePreview(data.exercise);
    document.getElementById('example-json').querySelector('pre').textContent = JSON.stringify(data.h5p, null, 2);

    container.scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    alert('Fehler: ' + err.message);
  }
}

// ====== H5P Export Tab ======

async function exportFromJson() {
  try {
    const raw = document.getElementById('export-json-input').value;
    if (!raw.trim()) {
      alert('Bitte geben Sie JSON ein.');
      return;
    }

    const parsed = JSON.parse(raw);
    const data = await api('/api/exercises/export/h5p', 'POST', parsed);

    const container = document.getElementById('export-result');
    container.classList.remove('hidden');

    document.getElementById('export-content-json').querySelector('pre').textContent = data.contentJson;
    document.getElementById('export-manifest-json').querySelector('pre').textContent = JSON.stringify(data.manifest, null, 2);

    container.scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    alert('Fehler: ' + err.message);
  }
}

// ====== Hilfsfunktionen ======

function copyToClipboard(elementId) {
  const text = document.getElementById(elementId).querySelector('pre').textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = event.target;
    const original = btn.textContent;
    btn.textContent = 'Kopiert!';
    setTimeout(() => { btn.textContent = original; }, 2000);
  }).catch(() => {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  });
}

function downloadJSON(data, filename) {
  const blob = new Blob([typeof data === 'string' ? data : JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadH5P() {
  if (state.currentH5P) {
    downloadJSON(state.currentH5P.h5p, 'content.json');
  } else if (state.currentExercise) {
    downloadJSON(state.currentExercise, 'exercise.json');
  }
}

function downloadOesd() {
  const pre = document.getElementById('oesd-result-json').querySelector('pre');
  if (pre.textContent) {
    downloadJSON(pre.textContent, `oesd-${state.oesdLevel}-exam.json`);
  }
}

function downloadExport() {
  const content = document.getElementById('export-content-json').querySelector('pre').textContent;
  if (content) {
    downloadJSON(content, 'content.json');
  }
  const manifest = document.getElementById('export-manifest-json').querySelector('pre').textContent;
  if (manifest) {
    setTimeout(() => downloadJSON(manifest, 'h5p.json'), 500);
  }
}
