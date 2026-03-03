/**
 * Beispiel-Übungen für verschiedene Niveaus
 * Diese dienen als Vorlagen und Demonstrationen
 */

const EXAMPLES = {
  // === A1 Beispiele ===
  a1_multipleChoice: {
    type: 'multipleChoice',
    params: {
      question: 'Wie heißen Sie?',
      level: 'A1',
      answers: [
        { text: 'Ich heiße Anna.', correct: true },
        { text: 'Ich bin gut.', correct: false },
        { text: 'Ich komme aus Wien.', correct: false },
      ],
      feedback: {
        correct: 'Richtig! "Ich heiße..." ist die korrekte Antwort auf "Wie heißen Sie?"',
        incorrect: 'Das ist leider nicht die richtige Antwort auf die Frage "Wie heißen Sie?"',
      },
    },
  },

  a1_fillInBlanks: {
    type: 'fillInBlanks',
    params: {
      task: 'Ergänzen Sie die Verben in der richtigen Form.',
      level: 'A1',
      sentences: [
        {
          text: 'Ich *komme* aus Deutschland.',
          blanks: [{ answer: ['komme'], hint: 'kommen - ich ...' }],
        },
        {
          text: 'Er *wohnt* in Wien.',
          blanks: [{ answer: ['wohnt'], hint: 'wohnen - er ...' }],
        },
        {
          text: 'Wir *sprechen* Deutsch.',
          blanks: [{ answer: ['sprechen'], hint: 'sprechen - wir ...' }],
        },
      ],
    },
  },

  a1_dialogCards: {
    type: 'dialogCards',
    params: {
      title: 'Begrüßungen und Verabschiedungen',
      level: 'A1',
      cards: [
        { front: 'Guten Morgen!', back: 'Good morning!', tip: 'Vormittag' },
        { front: 'Guten Tag!', back: 'Good day! / Hello!', tip: 'Tagsüber' },
        { front: 'Guten Abend!', back: 'Good evening!', tip: 'Abend' },
        { front: 'Auf Wiedersehen!', back: 'Goodbye!', tip: 'Formell' },
        { front: 'Tschüss!', back: 'Bye!', tip: 'Informell' },
        { front: 'Wie geht es Ihnen?', back: 'How are you? (formal)', tip: 'Sie-Form' },
        { front: 'Wie geht\'s?', back: 'How are you? (informal)', tip: 'Du-Form' },
      ],
    },
  },

  a1_trueFalse: {
    type: 'trueFalse',
    params: {
      question: 'Wien ist die Hauptstadt von Österreich.',
      correct: true,
      level: 'A1',
      context: 'Österreich ist ein Land in Europa. Wien ist eine große Stadt.',
    },
  },

  // === A2 Beispiele ===
  a2_multipleChoice: {
    type: 'multipleChoice',
    params: {
      question: 'Was bedeutet diese Anzeige?',
      level: 'A2',
      context: 'Deutschkurs A2 - Beginn: 5. März. Montag und Mittwoch, 18:00-20:00 Uhr. Anmeldung bis 28. Februar. Kosten: 250 Euro.',
      answers: [
        { text: 'Der Kurs beginnt am 28. Februar.', correct: false, tip: 'Schauen Sie auf das Datum nach "Beginn"' },
        { text: 'Der Kurs ist an zwei Tagen pro Woche.', correct: true },
        { text: 'Der Kurs kostet 280 Euro.', correct: false },
      ],
    },
  },

  a2_dragText: {
    type: 'dragText',
    params: {
      task: 'Ergänzen Sie die Sätze mit den richtigen Wörtern.',
      level: 'A2',
      text: 'Am Wochenende *gehe* ich gern ins Kino. Mein Bruder *spielt* lieber Fußball. Meine Mutter *liest* ein Buch und mein Vater *kocht* das Abendessen.',
      distractors: ['trinkt', 'fährt'],
    },
  },

  // === B1 Beispiele ===
  b1_multipleChoice: {
    type: 'multipleChoice',
    params: {
      question: 'Warum schreibt die Autorin diesen Artikel?',
      level: 'B1',
      context: 'Immer mehr junge Menschen in Österreich entscheiden sich für ein Auslandssemester. Die Gründe sind vielfältig: Neben besseren Sprachkenntnissen gewinnen die Studierenden auch interkulturelle Erfahrungen und verbessern ihre Chancen auf dem Arbeitsmarkt. Allerdings gibt es auch Herausforderungen, wie Heimweh und die Organisation des Auslandsaufenthalts.',
      answers: [
        { text: 'Sie möchte über die Vor- und Nachteile eines Auslandssemesters informieren.', correct: true },
        { text: 'Sie will junge Menschen davon überzeugen, ins Ausland zu gehen.', correct: false },
        { text: 'Sie berichtet über ihre eigenen Erfahrungen im Ausland.', correct: false },
      ],
    },
  },

  b1_fillInBlanks: {
    type: 'fillInBlanks',
    params: {
      task: 'Ergänzen Sie die Konnektoren.',
      level: 'B1',
      sentences: [
        {
          text: 'Ich lerne Deutsch, *weil/da* ich in Wien studieren möchte.',
          blanks: [{ answer: ['weil', 'da'], hint: 'Grund/Kausalität' }],
        },
        {
          text: '*Obwohl/Obgleich* es regnet, gehe ich spazieren.',
          blanks: [{ answer: ['Obwohl', 'Obgleich'], hint: 'Gegengrund/Konzessivität' }],
        },
        {
          text: 'Ich bleibe zu Hause, *damit* ich für die Prüfung lernen kann.',
          blanks: [{ answer: ['damit'], hint: 'Zweck/Finalität' }],
        },
      ],
    },
  },

  b1_essay: {
    type: 'essay',
    params: {
      task: 'Schreiben Sie eine E-Mail an Ihren Freund/Ihre Freundin. Sie haben eine neue Wohnung gefunden. Schreiben Sie über: Wo ist die Wohnung? Wie ist die Wohnung? Wann ziehen Sie ein?',
      level: 'B1',
      introduction: 'Ihr Freund Peter / Ihre Freundin Maria hat gefragt, ob Sie schon eine Wohnung gefunden haben.',
      keywords: [
        { keyword: 'Wohnung', points: 1 },
        { keyword: ['Zimmer', 'Räume'], points: 1 },
        { keyword: ['Miete', 'Euro', 'kostet'], points: 1 },
        { keyword: ['einziehen', 'umziehen'], points: 1 },
      ],
      sampleSolution: 'Lieber Peter, ich habe endlich eine schöne Wohnung gefunden! Sie liegt in der Mariahilfer Straße, im 6. Bezirk. Die Wohnung hat zwei Zimmer, eine Küche und ein Bad. Sie ist nicht so groß, aber sehr hell und gemütlich. Die Miete beträgt 650 Euro im Monat. Ich ziehe am 1. April ein. Kommst du mir beim Umzug helfen? Liebe Grüße',
    },
  },

  b1_sortParagraphs: {
    type: 'sortParagraphs',
    params: {
      task: 'Bringen Sie die Teile der E-Mail in die richtige Reihenfolge.',
      level: 'B1',
      paragraphs: [
        'Liebe Frau Müller,',
        'vielen Dank für Ihre schnelle Antwort. Ich möchte mich gern für den Deutschkurs B1 anmelden.',
        'Könnten Sie mir bitte noch mitteilen, welche Bücher ich für den Kurs brauche?',
        'Ich freue mich auf den Kursbeginn am 5. März.',
        'Mit freundlichen Grüßen, Anna Schmidt',
      ],
    },
  },

  // === B2 Beispiele ===
  b2_multipleChoice: {
    type: 'multipleChoice',
    params: {
      question: 'Welche Aussage stimmt mit dem Text überein?',
      level: 'B2',
      context: 'Die Digitalisierung verändert den Arbeitsmarkt grundlegend. Während einige Berufe durch Automatisierung wegfallen, entstehen gleichzeitig neue Berufsfelder im IT-Bereich. Experten betonen, dass lebenslanges Lernen und die Bereitschaft, sich anzupassen, entscheidend für den beruflichen Erfolg sein werden. Besonders gefragt sind Kompetenzen in den Bereichen Datenanalyse, künstliche Intelligenz und digitale Kommunikation.',
      answers: [
        { text: 'Die Digitalisierung führt ausschließlich zum Verlust von Arbeitsplätzen.', correct: false },
        { text: 'Anpassungsfähigkeit und Weiterbildung werden immer wichtiger.', correct: true },
        { text: 'Nur IT-Spezialisten haben in Zukunft gute Berufschancen.', correct: false },
      ],
    },
  },

  b2_essay: {
    type: 'essay',
    params: {
      task: 'Schreiben Sie einen Forumsbeitrag zum Thema "Sollten Universitäten komplett auf Online-Lehre umstellen?" Äußern Sie Ihre Meinung und begründen Sie diese. Gehen Sie auf Vor- und Nachteile ein.',
      level: 'B2',
      keywords: [
        { keyword: ['Online-Lehre', 'E-Learning', 'Fernstudium', 'digitale Lehre'], points: 2 },
        { keyword: ['Vorteil', 'positiv', 'Flexibilität'], points: 1 },
        { keyword: ['Nachteil', 'Problem', 'Herausforderung'], points: 1 },
        { keyword: ['Meinung', 'finde', 'denke', 'meiner Ansicht'], points: 1 },
        { keyword: ['Kontakt', 'sozial', 'Austausch', 'Diskussion'], points: 1 },
      ],
    },
  },

  b2_markTheWords: {
    type: 'markTheWords',
    params: {
      task: 'Markieren Sie alle Konjunktiv-II-Formen im Text.',
      level: 'B2',
      text: 'Wenn ich mehr Zeit *hätte*, *würde* ich öfter ins Theater gehen. Mein Freund *könnte* mir dabei helfen, Karten zu besorgen. Es *wäre* schön, wenn wir gemeinsam die neue Aufführung sehen *könnten*.',
    },
  },

  // === C1 Beispiele ===
  c1_fillInBlanks: {
    type: 'fillInBlanks',
    params: {
      task: 'Ergänzen Sie die fehlenden Wörter. Achten Sie auf die korrekte Form.',
      level: 'C1',
      sentences: [
        {
          text: 'Die Studie kommt zu dem *Ergebnis/Schluss*, dass der Klimawandel weitreichende Folgen haben wird.',
          blanks: [{ answer: ['Ergebnis', 'Schluss'], hint: 'Nomen - Resultat' }],
        },
        {
          text: '*Angesichts/Aufgrund* der steigenden Lebenshaltungskosten fordern Gewerkschaften höhere Löhne.',
          blanks: [{ answer: ['Angesichts', 'Aufgrund'], hint: 'Präposition - kausal' }],
        },
        {
          text: 'Es ist *unbestritten/unumstritten*, dass Bildung der Schlüssel zu gesellschaftlicher Teilhabe ist.',
          blanks: [{ answer: ['unbestritten', 'unumstritten'], hint: 'Adjektiv - ohne Widerspruch' }],
        },
      ],
    },
  },

  c1_essay: {
    type: 'essay',
    params: {
      task: 'Lesen Sie den folgenden Artikel und verfassen Sie eine Stellungnahme. Fassen Sie die Hauptargumente zusammen und nehmen Sie begründet Stellung.',
      level: 'C1',
      introduction: 'Artikel: "Sollte das Wahlalter auf 16 Jahre gesenkt werden? Befürworter argumentieren, dass junge Menschen früh politische Verantwortung übernehmen sollten. Kritiker hingegen bezweifeln die politische Reife von 16-Jährigen und verweisen auf die fehlende Lebenserfahrung."',
      keywords: [
        { keyword: ['Zusammenfassung', 'zusammenfassend', 'Kern', 'Hauptargument'], points: 2 },
        { keyword: ['Befürworter', 'dafür', 'Pro'], points: 1 },
        { keyword: ['Kritiker', 'dagegen', 'Contra', 'Gegenargument'], points: 1 },
        { keyword: ['Stellungnahme', 'Position', 'Standpunkt', 'meines Erachtens'], points: 2 },
        { keyword: ['Begründung', 'weil', 'da', 'denn', 'aufgrund'], points: 1 },
        { keyword: ['Schlussfolgerung', 'abschließend', 'zusammenfassend', 'Fazit'], points: 1 },
      ],
    },
  },
};

/**
 * Gibt alle Beispiele für ein bestimmtes Niveau zurück
 */
function getExamplesForLevel(level) {
  const prefix = level.toLowerCase() + '_';
  return Object.entries(EXAMPLES)
    .filter(([key]) => key.startsWith(prefix))
    .map(([key, value]) => ({ id: key, ...value }));
}

/**
 * Gibt alle verfügbaren Beispiele zurück, gruppiert nach Niveau
 */
function getAllExamples() {
  const levels = ['a1', 'a2', 'b1', 'b2', 'c1'];
  const grouped = {};
  for (const level of levels) {
    grouped[level.toUpperCase()] = getExamplesForLevel(level.toUpperCase());
  }
  return grouped;
}

module.exports = { EXAMPLES, getExamplesForLevel, getAllExamples };
