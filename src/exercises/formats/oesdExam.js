/**
 * ÖSD Prüfungssimulations-Generator
 *
 * Generiert vollständige Prüfungssimulationen nach dem ÖSD-Format:
 * - ÖSD Zertifikat A1
 * - ÖSD Zertifikat A2
 * - ÖSD Zertifikat B1 (ZB1)
 * - ÖSD Zertifikat B2
 * - ÖSD Zertifikat C1
 *
 * Jede Prüfung besteht aus den Modulen:
 * - Lesen (Leseverstehen)
 * - Hören (Hörverstehen)
 * - Schreiben (Schriftlicher Ausdruck)
 * - Sprechen (Mündlicher Ausdruck) - ab A2
 */

const { generateId, validateLevel, formatDuration } = require('../utils');

// ÖSD Prüfungsstrukturen pro Niveau
const OESD_STRUCTURE = {
  A1: {
    name: 'ÖSD Zertifikat A1',
    totalDuration: 75,
    modules: {
      lesen: {
        name: 'Lesen',
        duration: 25,
        parts: [
          {
            id: 'lesen_1',
            name: 'Teil 1: Kurze Texte verstehen',
            description: 'Lesen Sie die Texte und die Aufgaben. Kreuzen Sie an: Richtig oder Falsch.',
            exerciseType: 'trueFalse',
            itemCount: 5,
            points: 5,
            sampleTopic: 'Schilder, Hinweise, kurze Mitteilungen',
          },
          {
            id: 'lesen_2',
            name: 'Teil 2: Informationen finden',
            description: 'Lesen Sie die Texte und die Aufgaben. Kreuzen Sie die richtige Antwort an.',
            exerciseType: 'multipleChoice',
            itemCount: 5,
            points: 5,
            sampleTopic: 'Anzeigen, kurze Beschreibungen',
          },
          {
            id: 'lesen_3',
            name: 'Teil 3: Detailliertes Lesen',
            description: 'Lesen Sie den Text und die Aufgaben. Kreuzen Sie an: Richtig oder Falsch.',
            exerciseType: 'trueFalse',
            itemCount: 5,
            points: 5,
          },
        ],
      },
      hoeren: {
        name: 'Hören',
        duration: 20,
        parts: [
          {
            id: 'hoeren_1',
            name: 'Teil 1: Kurze Gespräche',
            description: 'Sie hören 5 kurze Gespräche. Sie hören jeden Text 2 Mal.',
            exerciseType: 'multipleChoice',
            itemCount: 5,
            points: 5,
            playCount: 2,
          },
          {
            id: 'hoeren_2',
            name: 'Teil 2: Informationen verstehen',
            description: 'Sie hören einen Text. Sie hören den Text 2 Mal.',
            exerciseType: 'trueFalse',
            itemCount: 5,
            points: 5,
            playCount: 2,
          },
        ],
      },
      schreiben: {
        name: 'Schreiben',
        duration: 30,
        parts: [
          {
            id: 'schreiben_1',
            name: 'Teil 1: Formular ausfüllen',
            description: 'Ergänzen Sie das Formular.',
            exerciseType: 'fillInBlanks',
            itemCount: 5,
            points: 5,
          },
          {
            id: 'schreiben_2',
            name: 'Teil 2: Kurze Mitteilung',
            description: 'Schreiben Sie eine kurze Nachricht (ca. 30 Wörter).',
            exerciseType: 'essay',
            itemCount: 1,
            points: 10,
            minWords: 25,
            maxWords: 40,
          },
        ],
      },
    },
    totalPoints: 45,
    passPercent: 60,
  },

  A2: {
    name: 'ÖSD Zertifikat A2',
    totalDuration: 120,
    modules: {
      lesen: {
        name: 'Lesen',
        duration: 30,
        parts: [
          {
            id: 'lesen_1',
            name: 'Teil 1: Korrespondenz lesen',
            description: 'Lesen Sie den Text und die Aufgaben. Kreuzen Sie die richtige Antwort an.',
            exerciseType: 'multipleChoice',
            itemCount: 5,
            points: 5,
          },
          {
            id: 'lesen_2',
            name: 'Teil 2: Informationen aus Medien entnehmen',
            description: 'Lesen Sie die Texte und ordnen Sie zu.',
            exerciseType: 'dragText',
            itemCount: 5,
            points: 5,
          },
          {
            id: 'lesen_3',
            name: 'Teil 3: Detailliertes Lesen',
            description: 'Lesen Sie den Text und die Aufgaben. Richtig oder Falsch?',
            exerciseType: 'trueFalse',
            itemCount: 5,
            points: 5,
          },
        ],
      },
      hoeren: {
        name: 'Hören',
        duration: 25,
        parts: [
          {
            id: 'hoeren_1',
            name: 'Teil 1: Alltagsgespräche',
            description: 'Sie hören 5 kurze Texte. Hören Sie jeden Text 2 Mal.',
            exerciseType: 'multipleChoice',
            itemCount: 5,
            points: 5,
            playCount: 2,
          },
          {
            id: 'hoeren_2',
            name: 'Teil 2: Radiomeldungen',
            description: 'Sie hören 5 Texte. Richtig oder Falsch?',
            exerciseType: 'trueFalse',
            itemCount: 5,
            points: 5,
            playCount: 2,
          },
          {
            id: 'hoeren_3',
            name: 'Teil 3: Gespräch verstehen',
            description: 'Sie hören ein Gespräch. Kreuzen Sie die richtige Antwort an.',
            exerciseType: 'multipleChoice',
            itemCount: 5,
            points: 5,
            playCount: 2,
          },
        ],
      },
      schreiben: {
        name: 'Schreiben',
        duration: 30,
        parts: [
          {
            id: 'schreiben_1',
            name: 'Teil 1: Mitteilung schreiben',
            description: 'Schreiben Sie eine Nachricht (ca. 50 Wörter). Bearbeiten Sie alle 3 Punkte.',
            exerciseType: 'essay',
            itemCount: 1,
            points: 15,
            minWords: 40,
            maxWords: 60,
          },
        ],
      },
      sprechen: {
        name: 'Sprechen',
        duration: 10,
        parts: [
          {
            id: 'sprechen_1',
            name: 'Teil 1: Sich vorstellen',
            description: 'Stellen Sie sich vor. Sprechen Sie über: Name, Alter, Herkunft, Wohnort, Beruf/Schule, Hobbys.',
            exerciseType: 'speaking',
            itemCount: 1,
            points: 10,
          },
          {
            id: 'sprechen_2',
            name: 'Teil 2: Gespräch über ein Alltagsthema',
            description: 'Sprechen Sie mit Ihrem Partner über ein Alltagsthema. Stellen Sie Fragen und antworten Sie.',
            exerciseType: 'speaking',
            itemCount: 1,
            points: 10,
          },
        ],
      },
    },
    totalPoints: 80,
    passPercent: 60,
  },

  B1: {
    name: 'ÖSD Zertifikat B1',
    totalDuration: 165,
    modules: {
      lesen: {
        name: 'Lesen',
        duration: 45,
        parts: [
          {
            id: 'lesen_1',
            name: 'Teil 1: Globalverstehen',
            description: 'Lesen Sie die Überschriften und die Texte. Welche Überschrift passt zu welchem Text?',
            exerciseType: 'dragText',
            itemCount: 5,
            points: 5,
          },
          {
            id: 'lesen_2',
            name: 'Teil 2: Detailverstehen',
            description: 'Lesen Sie den Text und die Aufgaben. Wählen Sie die richtige Antwort.',
            exerciseType: 'multipleChoice',
            itemCount: 5,
            points: 5,
          },
          {
            id: 'lesen_3',
            name: 'Teil 3: Selektives Lesen',
            description: 'Lesen Sie die Situationen und die Anzeigen. Welche Anzeige passt?',
            exerciseType: 'dragText',
            itemCount: 5,
            points: 5,
          },
          {
            id: 'lesen_4',
            name: 'Teil 4: Meinungen verstehen',
            description: 'Lesen Sie die Texte. Richtig oder Falsch?',
            exerciseType: 'trueFalse',
            itemCount: 7,
            points: 7,
          },
        ],
      },
      hoeren: {
        name: 'Hören',
        duration: 30,
        parts: [
          {
            id: 'hoeren_1',
            name: 'Teil 1: Alltagsgespräche',
            description: 'Sie hören 5 kurze Texte. Richtig oder Falsch?',
            exerciseType: 'trueFalse',
            itemCount: 5,
            points: 5,
            playCount: 1,
          },
          {
            id: 'hoeren_2',
            name: 'Teil 2: Radiomeldung',
            description: 'Sie hören einen Text. Wählen Sie die richtige Antwort.',
            exerciseType: 'multipleChoice',
            itemCount: 5,
            points: 5,
            playCount: 2,
          },
          {
            id: 'hoeren_3',
            name: 'Teil 3: Gespräch',
            description: 'Sie hören ein Gespräch. Richtig oder Falsch?',
            exerciseType: 'trueFalse',
            itemCount: 7,
            points: 7,
            playCount: 2,
          },
        ],
      },
      schreiben: {
        name: 'Schreiben',
        duration: 60,
        parts: [
          {
            id: 'schreiben_1',
            name: 'Teil 1: E-Mail schreiben',
            description: 'Schreiben Sie eine E-Mail (ca. 80 Wörter). Bearbeiten Sie alle 3 Punkte der Aufgabe.',
            exerciseType: 'essay',
            itemCount: 1,
            points: 20,
            minWords: 70,
            maxWords: 100,
          },
          {
            id: 'schreiben_2',
            name: 'Teil 2: Meinung äußern',
            description: 'Schreiben Sie Ihre Meinung zu einem Thema (ca. 80 Wörter).',
            exerciseType: 'essay',
            itemCount: 1,
            points: 20,
            minWords: 70,
            maxWords: 100,
          },
        ],
      },
      sprechen: {
        name: 'Sprechen',
        duration: 15,
        parts: [
          {
            id: 'sprechen_1',
            name: 'Teil 1: Gemeinsam planen',
            description: 'Sie planen mit Ihrem Partner etwas. Besprechen Sie die Punkte auf dem Aufgabenblatt.',
            exerciseType: 'speaking',
            itemCount: 1,
            points: 15,
          },
          {
            id: 'sprechen_2',
            name: 'Teil 2: Ein Thema präsentieren',
            description: 'Präsentieren Sie ein Thema. Sprechen Sie über: persönliche Erfahrung, Situation in Ihrem Land, Vor- und Nachteile.',
            exerciseType: 'speaking',
            itemCount: 1,
            points: 15,
          },
        ],
      },
    },
    totalPoints: 100,
    passPercent: 60,
  },

  B2: {
    name: 'ÖSD Zertifikat B2',
    totalDuration: 200,
    modules: {
      lesen: {
        name: 'Lesen',
        duration: 60,
        parts: [
          {
            id: 'lesen_1',
            name: 'Teil 1: Globalverstehen',
            description: 'Lesen Sie die Texte und ordnen Sie die Überschriften zu.',
            exerciseType: 'dragText',
            itemCount: 5,
            points: 5,
          },
          {
            id: 'lesen_2',
            name: 'Teil 2: Detailverstehen',
            description: 'Lesen Sie den Artikel und wählen Sie die richtige Antwort.',
            exerciseType: 'multipleChoice',
            itemCount: 5,
            points: 10,
          },
          {
            id: 'lesen_3',
            name: 'Teil 3: Selektives Lesen',
            description: 'Welche Aussage passt zu welcher Person?',
            exerciseType: 'dragText',
            itemCount: 5,
            points: 5,
          },
          {
            id: 'lesen_4',
            name: 'Teil 4: Sprachbausteine',
            description: 'Ergänzen Sie den Text. Wählen Sie das richtige Wort.',
            exerciseType: 'fillInBlanks',
            itemCount: 10,
            points: 10,
          },
        ],
      },
      hoeren: {
        name: 'Hören',
        duration: 30,
        parts: [
          {
            id: 'hoeren_1',
            name: 'Teil 1: Gespräch global verstehen',
            description: 'Sie hören ein Gespräch. Richtig oder Falsch?',
            exerciseType: 'trueFalse',
            itemCount: 5,
            points: 5,
            playCount: 1,
          },
          {
            id: 'hoeren_2',
            name: 'Teil 2: Radiobeitrag',
            description: 'Sie hören einen Radiobeitrag. Wählen Sie die richtige Antwort.',
            exerciseType: 'multipleChoice',
            itemCount: 5,
            points: 10,
            playCount: 2,
          },
          {
            id: 'hoeren_3',
            name: 'Teil 3: Statements',
            description: 'Sie hören Statements verschiedener Personen. Ordnen Sie die Aussagen zu.',
            exerciseType: 'dragText',
            itemCount: 5,
            points: 5,
            playCount: 2,
          },
        ],
      },
      schreiben: {
        name: 'Schreiben',
        duration: 60,
        parts: [
          {
            id: 'schreiben_1',
            name: 'Teil 1: Argumentation',
            description: 'Schreiben Sie einen Forumsbeitrag zu einem Thema (ca. 150 Wörter). Äußern Sie Ihre Meinung mit Begründung.',
            exerciseType: 'essay',
            itemCount: 1,
            points: 25,
            minWords: 120,
            maxWords: 180,
          },
          {
            id: 'schreiben_2',
            name: 'Teil 2: Formelle E-Mail',
            description: 'Schreiben Sie eine formelle E-Mail (ca. 120 Wörter).',
            exerciseType: 'essay',
            itemCount: 1,
            points: 15,
            minWords: 100,
            maxWords: 150,
          },
        ],
      },
      sprechen: {
        name: 'Sprechen',
        duration: 20,
        parts: [
          {
            id: 'sprechen_1',
            name: 'Teil 1: Präsentation',
            description: 'Halten Sie eine Präsentation zu einem vorgegebenen Thema (ca. 4 Minuten).',
            exerciseType: 'speaking',
            itemCount: 1,
            points: 15,
          },
          {
            id: 'sprechen_2',
            name: 'Teil 2: Diskussion',
            description: 'Diskutieren Sie mit Ihrem Gesprächspartner über ein Thema. Vertreten Sie Ihren Standpunkt.',
            exerciseType: 'speaking',
            itemCount: 1,
            points: 15,
          },
        ],
      },
    },
    totalPoints: 120,
    passPercent: 60,
  },

  C1: {
    name: 'ÖSD Zertifikat C1',
    totalDuration: 235,
    modules: {
      lesen: {
        name: 'Lesen',
        duration: 90,
        parts: [
          {
            id: 'lesen_1',
            name: 'Teil 1: Globalverstehen & Detailverstehen',
            description: 'Lesen Sie den Text und wählen Sie die richtige Antwort.',
            exerciseType: 'multipleChoice',
            itemCount: 5,
            points: 10,
          },
          {
            id: 'lesen_2',
            name: 'Teil 2: Lückentext',
            description: 'Ergänzen Sie die fehlenden Wörter im Text.',
            exerciseType: 'fillInBlanks',
            itemCount: 10,
            points: 10,
          },
          {
            id: 'lesen_3',
            name: 'Teil 3: Zuordnung',
            description: 'Ordnen Sie die Zusammenfassungen den Textabschnitten zu.',
            exerciseType: 'dragText',
            itemCount: 5,
            points: 5,
          },
          {
            id: 'lesen_4',
            name: 'Teil 4: Sprachbausteine',
            description: 'Wählen Sie für jede Lücke die richtige Antwort.',
            exerciseType: 'multipleChoice',
            itemCount: 10,
            points: 10,
          },
        ],
      },
      hoeren: {
        name: 'Hören',
        duration: 40,
        parts: [
          {
            id: 'hoeren_1',
            name: 'Teil 1: Präsentation/Vortrag',
            description: 'Sie hören einen Vortrag. Notieren Sie die wichtigsten Informationen.',
            exerciseType: 'fillInBlanks',
            itemCount: 10,
            points: 10,
            playCount: 2,
          },
          {
            id: 'hoeren_2',
            name: 'Teil 2: Radiobeitrag',
            description: 'Sie hören einen Radiobeitrag. Wählen Sie die richtige Antwort.',
            exerciseType: 'multipleChoice',
            itemCount: 5,
            points: 10,
            playCount: 2,
          },
          {
            id: 'hoeren_3',
            name: 'Teil 3: Diskussion',
            description: 'Sie hören eine Diskussion. Welche Meinung vertritt welche Person?',
            exerciseType: 'dragText',
            itemCount: 5,
            points: 5,
            playCount: 1,
          },
        ],
      },
      schreiben: {
        name: 'Schreiben',
        duration: 90,
        parts: [
          {
            id: 'schreiben_1',
            name: 'Aufgabe 1: Zusammenfassung & Stellungnahme',
            description: 'Lesen Sie den Artikel und schreiben Sie eine Zusammenfassung mit eigener Stellungnahme (ca. 250 Wörter).',
            exerciseType: 'essay',
            itemCount: 1,
            points: 30,
            minWords: 220,
            maxWords: 300,
          },
          {
            id: 'schreiben_2',
            name: 'Aufgabe 2: Formeller Brief',
            description: 'Schreiben Sie einen formellen Brief (Beschwerde/Anfrage, ca. 150 Wörter).',
            exerciseType: 'essay',
            itemCount: 1,
            points: 20,
            minWords: 130,
            maxWords: 180,
          },
        ],
      },
      sprechen: {
        name: 'Sprechen',
        duration: 20,
        parts: [
          {
            id: 'sprechen_1',
            name: 'Aufgabe 1: Präsentation',
            description: 'Halten Sie eine Präsentation zu einem vorgegebenen Thema (ca. 5 Minuten). Gehen Sie auf Vor- und Nachteile ein.',
            exerciseType: 'speaking',
            itemCount: 1,
            points: 20,
          },
          {
            id: 'sprechen_2',
            name: 'Aufgabe 2: Diskussion',
            description: 'Führen Sie ein Gespräch mit dem Prüfer über das Thema Ihrer Präsentation.',
            exerciseType: 'speaking',
            itemCount: 1,
            points: 15,
          },
        ],
      },
    },
    totalPoints: 145,
    passPercent: 60,
  },
};

class OesdExamGenerator {
  /**
   * Generiert eine vollständige ÖSD-Prüfungssimulation
   * @param {string} level - A1, A2, B1, B2, C1
   * @param {Object} options
   * @param {string[]} [options.modules] - Welche Module (lesen, hoeren, schreiben, sprechen)
   * @param {Object} [options.content] - Vordefinierter Inhalt für die Übungen
   * @param {string} [options.topic] - Thema für die Schreib-/Sprechaufgaben
   */
  static generate(level, options = {}) {
    validateLevel(level);
    if (level === 'C2') {
      throw new Error('ÖSD C2 wird noch nicht unterstützt. Verfügbar: A1, A2, B1, B2, C1');
    }

    const structure = OESD_STRUCTURE[level];
    if (!structure) {
      throw new Error(`Keine ÖSD-Struktur für Niveau ${level} gefunden`);
    }

    const { modules: selectedModules, content: providedContent = {}, topic } = options;
    const modulesToGenerate = selectedModules || Object.keys(structure.modules);

    const exam = {
      id: generateId(),
      type: 'oesdExam',
      level,
      name: structure.name,
      totalDuration: structure.totalDuration,
      totalPoints: structure.totalPoints,
      passPercent: structure.passPercent,
      passPoints: Math.ceil(structure.totalPoints * structure.passPercent / 100),
      topic: topic || null,
      modules: {},
      metadata: {
        createdAt: new Date().toISOString(),
        format: 'oesd-simulation',
        version: '1.0',
      },
    };

    for (const moduleKey of modulesToGenerate) {
      const moduleStructure = structure.modules[moduleKey];
      if (!moduleStructure) continue;

      exam.modules[moduleKey] = {
        name: moduleStructure.name,
        duration: moduleStructure.duration,
        durationFormatted: formatDuration(moduleStructure.duration),
        parts: moduleStructure.parts.map(part => ({
          ...part,
          // Wenn Inhalt vorgegeben ist, verwende ihn
          content: providedContent[part.id] || null,
          // Erstelle ein leeres Template für den Übungstyp
          template: generatePartTemplate(part, level, topic),
        })),
      };
    }

    return exam;
  }

  /**
   * Gibt die vollständige ÖSD-Prüfungsstruktur zurück
   */
  static getStructure() {
    return Object.entries(OESD_STRUCTURE).map(([level, data]) => ({
      level,
      name: data.name,
      totalDuration: data.totalDuration,
      totalDurationFormatted: formatDuration(data.totalDuration),
      totalPoints: data.totalPoints,
      passPercent: data.passPercent,
      passPoints: Math.ceil(data.totalPoints * data.passPercent / 100),
      modules: Object.entries(data.modules).map(([key, mod]) => ({
        id: key,
        name: mod.name,
        duration: mod.duration,
        durationFormatted: formatDuration(mod.duration),
        parts: mod.parts.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          exerciseType: p.exerciseType,
          itemCount: p.itemCount,
          points: p.points,
        })),
      })),
    }));
  }
}

/**
 * Erstellt ein Template/Gerüst für einen Prüfungsteil
 */
function generatePartTemplate(part, level, topic) {
  const template = {
    partId: part.id,
    exerciseType: part.exerciseType,
    level,
    itemCount: part.itemCount,
    points: part.points,
    instructions: part.description,
  };

  switch (part.exerciseType) {
    case 'multipleChoice':
      template.items = Array.from({ length: part.itemCount }, (_, i) => ({
        question: '',
        answers: [
          { text: '', correct: false },
          { text: '', correct: false },
          { text: '', correct: true },
        ],
      }));
      break;

    case 'trueFalse':
      template.items = Array.from({ length: part.itemCount }, (_, i) => ({
        question: '',
        correct: null, // true oder false
        context: '',
      }));
      break;

    case 'fillInBlanks':
      template.items = [{
        text: '', // Text mit *Lücken*
        blanks: Array.from({ length: part.itemCount }, () => ({
          answer: '',
          hint: '',
        })),
      }];
      break;

    case 'dragText':
      template.items = [{
        text: '', // Text mit *Drag-Wörtern*
        distractors: [],
      }];
      break;

    case 'essay':
      template.items = [{
        task: '',
        introduction: '',
        minWords: part.minWords || 50,
        maxWords: part.maxWords || 200,
        criteria: [],
        sampleSolution: '',
      }];
      break;

    case 'speaking':
      template.items = [{
        task: part.description,
        preparationTime: level === 'C1' ? 3 : level === 'B2' ? 2 : 1,
        speakingTime: part.id.includes('1') ? 4 : 3,
        criteria: getSpeakingCriteria(level),
        topic: topic || '',
        prompts: [],
      }];
      break;
  }

  return template;
}

function getSpeakingCriteria(level) {
  const criteria = {
    A2: [
      'Aufgabenbewältigung',
      'Flüssigkeit und Interaktion',
      'Wortschatz',
      'Grammatik',
      'Aussprache',
    ],
    B1: [
      'Aufgabenbewältigung und Inhalt',
      'Flüssigkeit und Interaktion',
      'Wortschatz und Ausdruck',
      'Grammatik und Strukturen',
      'Aussprache und Intonation',
    ],
    B2: [
      'Inhalt und Argumentation',
      'Flüssigkeit und Kohärenz',
      'Ausdruck und Wortschatz',
      'Korrektheit (Grammatik)',
      'Aussprache und Intonation',
    ],
    C1: [
      'Inhaltliche Angemessenheit',
      'Textorganisation und Kohärenz',
      'Lexikalische Kompetenz',
      'Grammatische Korrektheit',
      'Phonetische Kompetenz',
    ],
  };
  return criteria[level] || criteria.B1;
}

module.exports = { OesdExamGenerator, OESD_STRUCTURE };
