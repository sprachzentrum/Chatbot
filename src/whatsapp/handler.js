const queries = require('../database/queries');
const { sendMessage } = require('./client');

const userState = new Map();

function setupMessageHandler(client) {
  client.on('message', async (msg) => {
    try {
      if (msg.from === 'status@broadcast') return;

      const phone = msg.from.replace('@c.us', '');
      const contact = await msg.getContact();
      const contactName = contact.pushname || contact.name || phone;

      queries.getOrCreateContact(phone, contactName);
      queries.saveMessage(phone, 'in', msg.body);

      const autoReply = queries.getSetting('auto_reply');
      if (autoReply !== '1') return;

      const response = await generateResponse(phone, msg.body);
      if (response) {
        await msg.reply(response);
        queries.saveMessage(phone, 'out', response);
      }
    } catch (err) {
      console.error('[Handler] Fehler bei Nachrichtenverarbeitung:', err);
    }
  });
}

async function generateResponse(phone, text) {
  const normalized = text.toLowerCase().trim();
  const state = userState.get(phone);

  // Begrüßung
  if (['hallo', 'hi', 'hey', 'moin', 'guten tag', 'guten morgen', 'guten abend'].some(g => normalized.startsWith(g))) {
    const welcome = queries.getSetting('welcome_message');
    return `${welcome}\n\nSchreiben Sie eines der folgenden Stichworte:\n` +
      '- *kurse* - Kursangebot ansehen\n' +
      '- *preise* - Preisinformationen\n' +
      '- *anmeldung* - Kursanmeldung\n' +
      '- *zeiten* - Kurszeiten\n' +
      '- *einstufung* - Einstufungstest\n' +
      '- *kontakt* - Kontaktdaten\n' +
      '- *hilfe* - Alle Optionen anzeigen';
  }

  // Hilfe-Menü
  if (['hilfe', 'help', 'menü', 'menu', 'optionen', '?'].includes(normalized)) {
    return '📋 *Menü - Sprachzentrum Bot*\n\n' +
      'Folgende Befehle stehen Ihnen zur Verfügung:\n\n' +
      '- *kurse* - Unser Kursangebot\n' +
      '- *kursübersicht* - Detaillierte Kursliste\n' +
      '- *preise* - Preisinformationen\n' +
      '- *anmeldung* - Sich für einen Kurs anmelden\n' +
      '- *zeiten* - Wann finden Kurse statt?\n' +
      '- *einstufung* - Einstufungstest\n' +
      '- *kontakt* - So erreichen Sie uns\n' +
      '- *standort* - Wo sind wir?\n\n' +
      'Oder stellen Sie einfach Ihre Frage!';
  }

  // Kursübersicht
  if (['kursübersicht', 'kursuebersicht', 'kursliste', 'alle kurse'].includes(normalized)) {
    const courses = queries.getActiveCourses();
    if (courses.length === 0) {
      return 'Aktuell sind keine Kurse verfügbar. Bitte kontaktieren Sie uns direkt.';
    }
    let response = '📚 *Aktuelle Kurse:*\n\n';
    for (const course of courses) {
      response += `*${course.name}*\n`;
      response += `  Sprache: ${course.language} | Stufe: ${course.level}\n`;
      if (course.schedule) response += `  Zeiten: ${course.schedule}\n`;
      if (course.price) response += `  Preis: ${course.price}€\n`;
      response += '\n';
    }
    response += 'Für Anmeldung schreiben Sie: *anmelden [Kursname]*';
    return response;
  }

  // Kursanmeldung
  if (normalized.startsWith('anmelden ')) {
    const courseName = text.substring(9).trim();
    const courses = queries.getActiveCourses();
    const course = courses.find(c =>
      c.name.toLowerCase().includes(courseName.toLowerCase())
    );

    if (!course) {
      return `Kurs "${courseName}" nicht gefunden. Schreiben Sie *kursübersicht* für eine Liste aller Kurse.`;
    }

    const result = queries.createEnrollment(phone, course.id);
    if (result.duplicate) {
      return `Sie sind bereits für *${course.name}* angemeldet.`;
    }

    return `✅ *Anmeldung erfolgreich!*\n\n` +
      `Kurs: ${course.name}\n` +
      `Sprache: ${course.language} | Stufe: ${course.level}\n` +
      (course.schedule ? `Zeiten: ${course.schedule}\n` : '') +
      `\nWir bestätigen Ihre Anmeldung in Kürze. Bei Fragen schreiben Sie einfach hier!`;
  }

  // FAQ-Suche
  const faq = queries.findFaqByKeyword(normalized);
  if (faq) {
    return faq.answer;
  }

  // Fallback
  return 'Vielen Dank für Ihre Nachricht! Leider konnte ich Ihre Anfrage nicht zuordnen.\n\n' +
    'Schreiben Sie *hilfe* für eine Übersicht der verfügbaren Optionen oder warten Sie auf eine Antwort unseres Teams.';
}

module.exports = { setupMessageHandler };
