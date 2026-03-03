/**
 * Mark the Words Generator
 * H5P Content Type: H5P.MarkTheWords
 */

const { generateId } = require('../utils');

class MarkTheWordsGenerator {
  static name = 'Wörter markieren';
  static description = 'Bestimmte Wörter im Text identifizieren und markieren';
  static h5pContentType = 'H5P.MarkTheWords';
  static supportedLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  /**
   * @param {Object} params
   * @param {string} params.task - Aufgabenstellung (z.B. "Markieren Sie alle Verben")
   * @param {string} params.text - Text mit *markierten* korrekten Wörtern
   * @param {string} [params.level]
   */
  static generate(params) {
    const {
      task = 'Markieren Sie die gesuchten Wörter.',
      text,
      level = 'B1',
    } = params;

    if (!text) {
      throw new Error('Mark the Words benötigt einen Text');
    }

    const correctWords = [];
    const regex = /\*([^*]+)\*/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      correctWords.push(match[1]);
    }

    if (correctWords.length === 0) {
      throw new Error('Text muss mindestens ein markiertes Wort enthalten');
    }

    const exercise = {
      id: generateId(),
      type: 'markTheWords',
      h5pContentType: 'H5P.MarkTheWords',
      level,
      content: {
        task,
        text,
        correctWords,
        behaviour: {
          enableRetry: true,
          enableSolutionsButton: true,
        },
        feedback: {
          correct: 'Alles richtig markiert!',
          incorrect: 'Einige Wörter fehlen oder sind falsch markiert.',
        },
      },
    };

    return exercise;
  }

  static toH5P(exercise) {
    const { content } = exercise;
    return {
      library: 'H5P.MarkTheWords 1.11',
      params: {
        media: { disableImageZooming: false },
        taskDescription: `<p>${content.task}</p>`,
        textField: content.text,
        overallFeedback: [
          { from: 0, to: 50, feedback: content.feedback.incorrect },
          { from: 51, to: 100, feedback: content.feedback.correct },
        ],
        checkAnswerButton: 'Überprüfen',
        submitAnswerButton: 'Absenden',
        tryAgainButton: 'Nochmal versuchen',
        showSolutionButton: 'Lösung anzeigen',
        behaviour: content.behaviour,
      },
      subContentId: exercise.id,
      metadata: {
        contentType: 'Mark the Words',
        license: 'U',
        title: content.task.substring(0, 60),
      },
    };
  }
}

module.exports = { MarkTheWordsGenerator };
