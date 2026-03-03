/**
 * Dialog Cards Generator
 * H5P Content Type: H5P.DialogCards
 */

const { generateId } = require('../utils');

class DialogCardsGenerator {
  static name = 'Dialogkarten';
  static description = 'Karteikarten zum Vokabellernen mit Vorder- und Rückseite';
  static h5pContentType = 'H5P.DialogCards';
  static supportedLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  /**
   * @param {Object} params
   * @param {string} params.title - Titel der Kartenserie
   * @param {Array<{front: string, back: string, tip?: string, image?: string}>} params.cards
   * @param {string} [params.level]
   * @param {string} [params.mode='normal'] - 'normal' oder 'repetition'
   */
  static generate(params) {
    const {
      title = 'Vokabelkarten',
      cards,
      level = 'A1',
      mode = 'normal',
    } = params;

    if (!cards || cards.length === 0) {
      throw new Error('Dialogkarten benötigen mindestens eine Karte');
    }

    const exercise = {
      id: generateId(),
      type: 'dialogCards',
      h5pContentType: 'H5P.DialogCards',
      level,
      content: {
        title,
        mode,
        cards: cards.map((c, idx) => ({
          id: idx,
          front: c.front,
          back: c.back,
          tip: c.tip || null,
          image: c.image || null,
        })),
        behaviour: {
          enableRetry: true,
          scaleTextNotCard: false,
          randomCards: false,
        },
      },
    };

    return exercise;
  }

  static toH5P(exercise) {
    const { content } = exercise;
    return {
      library: 'H5P.DialogCards 1.9',
      params: {
        title: `<p>${content.title}</p>`,
        mode: content.mode,
        description: '',
        dialogs: content.cards.map(c => ({
          text: `<p>${c.front}</p>`,
          answer: `<p>${c.back}</p>`,
          tips: c.tip ? { tip: c.tip } : {},
          image: c.image ? { path: c.image } : undefined,
        })),
        behaviour: {
          enableRetry: content.behaviour.enableRetry,
          disableBackwardsNavigation: false,
          scaleTextNotCard: content.behaviour.scaleTextNotCard,
          randomCards: content.behaviour.randomCards,
          quickProgression: false,
        },
        answer: 'Umdrehen',
        next: 'Weiter',
        prev: 'Zurück',
        retry: 'Nochmal',
        correctAnswer: 'Ich hatte Recht!',
        incorrectAnswer: 'Ich hatte Unrecht',
        round: 'Runde @round',
        cardsLeft: 'Noch @number Karten übrig',
        nextRound: 'Nächste Runde',
        startOver: 'Von vorne beginnen',
        showSummary: 'Nächste Runde',
        summary: 'Zusammenfassung',
        summaryCardsRight: 'Richtige Karten:',
        summaryCardsWrong: 'Falsche Karten:',
        summaryCardsNotShown: 'Nicht angezeigte Karten:',
        summaryOverallScore: 'Gesamtpunktzahl',
        summaryCardsCompleted: 'Abgeschlossene Karten:',
        summaryCompletedRounds: 'Abgeschlossene Runden:',
        summaryAllDone: 'Gut gemacht!',
      },
      subContentId: exercise.id,
      metadata: {
        contentType: 'Dialog Cards',
        license: 'U',
        title: content.title,
      },
    };
  }
}

module.exports = { DialogCardsGenerator };
