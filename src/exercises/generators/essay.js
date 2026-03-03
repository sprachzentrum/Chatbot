/**
 * Essay / Free Text Generator
 * H5P Content Type: H5P.Essay
 *
 * Für Schreibaufgaben bei ÖSD-Prüfungen
 */

const { generateId } = require('../utils');

class EssayGenerator {
  static name = 'Schreibaufgabe (Essay)';
  static description = 'Freie Textproduktion mit Schlüsselwort-Bewertung';
  static h5pContentType = 'H5P.Essay';
  static supportedLevels = ['A2', 'B1', 'B2', 'C1', 'C2'];

  /**
   * @param {Object} params
   * @param {string} params.task - Aufgabenstellung
   * @param {string} [params.introduction] - Einleitungstext/Kontext
   * @param {Array<{keyword: string|string[], alternatives?: string[], points?: number, occurrences?: number, caseSensitive?: boolean, forgiveMistakes?: boolean}>} [params.keywords]
   * @param {number} [params.minWords] - Minimale Wortanzahl
   * @param {number} [params.maxWords] - Maximale Wortanzahl
   * @param {string} [params.level]
   * @param {string} [params.sampleSolution] - Musterlösung
   * @param {Array<string>} [params.criteria] - Bewertungskriterien
   */
  static generate(params) {
    const {
      task,
      introduction = null,
      keywords = [],
      minWords = 0,
      maxWords = 0,
      level = 'B1',
      sampleSolution = null,
      criteria = [],
    } = params;

    if (!task) {
      throw new Error('Schreibaufgabe benötigt eine Aufgabenstellung');
    }

    // Wortlimits basierend auf Level
    const wordLimits = {
      A2: { min: 30, max: 60 },
      B1: { min: 80, max: 120 },
      B2: { min: 120, max: 180 },
      C1: { min: 200, max: 300 },
      C2: { min: 250, max: 400 },
    };

    const limits = wordLimits[level] || wordLimits.B1;

    const exercise = {
      id: generateId(),
      type: 'essay',
      h5pContentType: 'H5P.Essay',
      level,
      content: {
        task,
        introduction,
        keywords: keywords.map(k => ({
          keyword: Array.isArray(k.keyword) ? k.keyword : [k.keyword],
          alternatives: k.alternatives || [],
          points: k.points || 1,
          occurrences: k.occurrences || 1,
          caseSensitive: k.caseSensitive || false,
          forgiveMistakes: k.forgiveMistakes !== false,
        })),
        wordLimits: {
          min: minWords || limits.min,
          max: maxWords || limits.max,
        },
        sampleSolution,
        criteria: criteria.length > 0 ? criteria : getDefaultCriteria(level),
        behaviour: {
          enableRetry: true,
          ignoreScoring: keywords.length === 0,
          pointsHost: 10,
        },
        feedback: {
          tooShort: `Ihr Text ist zu kurz. Mindestens ${minWords || limits.min} Wörter.`,
          tooLong: `Ihr Text ist zu lang. Maximal ${maxWords || limits.max} Wörter.`,
        },
      },
    };

    return exercise;
  }

  static toH5P(exercise) {
    const { content } = exercise;
    return {
      library: 'H5P.Essay 1.5',
      params: {
        media: { disableImageZooming: false },
        taskDescription: content.introduction
          ? `<div>${content.introduction}</div><p><strong>${content.task}</strong></p>`
          : `<p><strong>${content.task}</strong></p>`,
        solution: {
          introduction: 'Musterlösung:',
          sample: content.sampleSolution || 'Keine Musterlösung verfügbar.',
        },
        keywords: content.keywords.map(k => ({
          keyword: k.keyword[0],
          alternatives: k.alternatives,
          options: {
            points: k.points,
            occurrences: k.occurrences,
            caseSensitive: k.caseSensitive,
            forgiveMistakes: k.forgiveMistakes,
          },
        })),
        overallFeedback: [
          { from: 0, to: 33, feedback: 'Versuchen Sie, mehr relevante Begriffe einzubeziehen.' },
          { from: 34, to: 66, feedback: 'Guter Ansatz! Einige wichtige Punkte fehlen noch.' },
          { from: 67, to: 100, feedback: 'Sehr gut! Ihr Text enthält die wichtigsten Punkte.' },
        ],
        behaviour: content.behaviour,
        checkAnswer: 'Überprüfen',
        submitAnswer: 'Absenden',
        tryAgain: 'Nochmal versuchen',
        showSolution: 'Musterlösung anzeigen',
        remainingChars: 'Verbleibende Zeichen: @chars',
        notEnoughChars: 'Bitte schreiben Sie mindestens @chars Zeichen.',
        messageSave: 'Gespeichert',
        ariaYourResult: 'Ihr Ergebnis: @score von @total Punkten.',
        scoreBarLabel: 'Du hast :num von :total Punkten erreicht.',
      },
      subContentId: exercise.id,
      metadata: {
        contentType: 'Essay',
        license: 'U',
        title: content.task.substring(0, 60),
      },
    };
  }
}

function getDefaultCriteria(level) {
  const criteria = {
    A2: [
      'Aufgabenerfüllung: Alle Punkte der Aufgabenstellung bearbeitet',
      'Wortschatz: Grundwortschatz korrekt verwendet',
      'Grammatik: Einfache Strukturen überwiegend korrekt',
    ],
    B1: [
      'Aufgabenerfüllung: Alle Punkte ausführlich bearbeitet',
      'Textaufbau: Logischer Aufbau mit Einleitung und Schluss',
      'Wortschatz: Angemessener Wortschatz für das Thema',
      'Grammatik: Grundstrukturen korrekt, komplexere Strukturen weitgehend korrekt',
    ],
    B2: [
      'Aufgabenerfüllung: Differenzierte Bearbeitung aller Punkte',
      'Textaufbau: Klare Gliederung mit Absätzen und Überleitungen',
      'Wortschatz: Differenzierter und variierter Wortschatz',
      'Grammatik: Komplexe Strukturen überwiegend korrekt',
      'Ausdruck: Angemessener Stil und Register',
    ],
    C1: [
      'Aufgabenerfüllung: Umfassende und differenzierte Bearbeitung',
      'Textaufbau: Kohärenter, gut strukturierter Text',
      'Wortschatz: Breiter, differenzierter Wortschatz mit idiomatischen Wendungen',
      'Grammatik: Komplexe Strukturen korrekt und variiert',
      'Ausdruck: Stilistisch angemessen, klare Argumentationsstruktur',
      'Kohäsion: Vielfältige Konnektoren und Verweismittel',
    ],
  };
  return criteria[level] || criteria.B1;
}

module.exports = { EssayGenerator };
