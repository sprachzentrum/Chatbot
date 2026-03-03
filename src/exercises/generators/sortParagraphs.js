/**
 * Sort Paragraphs Generator
 * H5P Content Type: H5P.SortParagraphs
 */

const { generateId, shuffleArray } = require('../utils');

class SortParagraphsGenerator {
  static name = 'Absätze sortieren';
  static description = 'Textabschnitte in die richtige Reihenfolge bringen';
  static h5pContentType = 'H5P.SortParagraphs';
  static supportedLevels = ['A2', 'B1', 'B2', 'C1', 'C2'];

  /**
   * @param {Object} params
   * @param {string} params.task - Aufgabenstellung
   * @param {Array<string>} params.paragraphs - Absätze in korrekter Reihenfolge
   * @param {string} [params.level]
   */
  static generate(params) {
    const {
      task = 'Bringen Sie die Absätze in die richtige Reihenfolge.',
      paragraphs,
      level = 'B1',
    } = params;

    if (!paragraphs || paragraphs.length < 2) {
      throw new Error('Sortieren benötigt mindestens 2 Absätze');
    }

    const exercise = {
      id: generateId(),
      type: 'sortParagraphs',
      h5pContentType: 'H5P.SortParagraphs',
      level,
      content: {
        task,
        paragraphs: paragraphs.map((p, idx) => ({
          id: idx,
          text: p,
          correctPosition: idx,
        })),
        behaviour: {
          enableRetry: true,
          enableSolutionsButton: true,
          scoringMode: 'positions',
          applyPenalties: false,
        },
        feedback: {
          correct: 'Perfekte Reihenfolge!',
          incorrect: 'Die Reihenfolge stimmt noch nicht.',
        },
      },
    };

    return exercise;
  }

  static toH5P(exercise) {
    const { content } = exercise;
    return {
      library: 'H5P.SortParagraphs 0.11',
      params: {
        taskDescription: `<p>${content.task}</p>`,
        paragraphs: content.paragraphs.map(p => p.text),
        l10n: {
          checkAnswer: 'Überprüfen',
          submitAnswer: 'Absenden',
          showSolution: 'Lösung anzeigen',
          tryAgain: 'Nochmal versuchen',
          up: 'Nach oben',
          down: 'Nach unten',
          disabled: 'Deaktiviert',
          correctAnswer: 'Richtige Antwort',
          wrongAnswer: 'Falsche Antwort',
          header: 'Sortieren',
        },
        overallFeedback: [
          { from: 0, to: 50, feedback: content.feedback.incorrect },
          { from: 51, to: 100, feedback: content.feedback.correct },
        ],
        behaviour: content.behaviour,
      },
      subContentId: exercise.id,
      metadata: {
        contentType: 'Sort the Paragraphs',
        license: 'U',
        title: content.task.substring(0, 60),
      },
    };
  }
}

module.exports = { SortParagraphsGenerator };
