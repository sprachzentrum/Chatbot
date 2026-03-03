/**
 * True/False Generator
 * H5P Content Type: H5P.TrueFalse
 */

const { generateId } = require('../utils');

class TrueFalseGenerator {
  static name = 'Richtig/Falsch';
  static description = 'Aussagen als richtig oder falsch bewerten';
  static h5pContentType = 'H5P.TrueFalse';
  static supportedLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  /**
   * @param {Object} params
   * @param {string} params.question - Die Aussage
   * @param {boolean} params.correct - Ob die Aussage richtig ist
   * @param {string} [params.level]
   * @param {string} [params.context] - Lesetext/Kontext
   * @param {Object} [params.feedback]
   */
  static generate(params) {
    const {
      question,
      correct,
      level = 'B1',
      context = null,
      feedback = {},
    } = params;

    if (!question || correct === undefined) {
      throw new Error('Richtig/Falsch benötigt eine Aussage und die korrekte Antwort');
    }

    const exercise = {
      id: generateId(),
      type: 'trueFalse',
      h5pContentType: 'H5P.TrueFalse',
      level,
      content: {
        question,
        correct,
        context,
        labels: {
          trueLabel: 'Richtig',
          falseLabel: 'Falsch',
        },
        behaviour: {
          enableRetry: true,
          enableSolutionsButton: true,
          confirmCheckDialog: false,
        },
        feedback: {
          correct: feedback.correct || 'Richtig!',
          incorrect: feedback.incorrect || 'Leider falsch.',
        },
      },
    };

    return exercise;
  }

  static toH5P(exercise) {
    const { content } = exercise;
    return {
      library: 'H5P.TrueFalse 1.8',
      params: {
        media: { disableImageZooming: false },
        correct: content.correct ? 'true' : 'false',
        l10n: {
          trueText: content.labels.trueLabel,
          falseText: content.labels.falseLabel,
          score: 'Du hast @score von @total Punkten erreicht.',
          checkAnswer: 'Überprüfen',
          submitAnswer: 'Absenden',
          showSolutionButton: 'Lösung anzeigen',
          tryAgain: 'Nochmal versuchen',
          wrongAnswerMessage: content.feedback.incorrect,
          correctAnswerMessage: content.feedback.correct,
          scoreBarLabel: 'Du hast :num von :total Punkten erreicht.',
          a11yCheck: 'Die Antworten überprüfen.',
          a11yShowSolution: 'Die Lösung anzeigen.',
          a11yRetry: 'Aufgabe wiederholen.',
        },
        behaviour: content.behaviour,
        confirmCheck: {
          header: 'Fertig?',
          body: 'Sind Sie sicher?',
          cancelLabel: 'Abbrechen',
          confirmLabel: 'Fertig',
        },
        confirmRetry: {
          header: 'Nochmal versuchen?',
          body: 'Sind Sie sicher?',
          cancelLabel: 'Abbrechen',
          confirmLabel: 'Bestätigen',
        },
        question: content.context
          ? `<div class="context">${content.context}</div><p>${content.question}</p>`
          : `<p>${content.question}</p>`,
      },
      subContentId: exercise.id,
      metadata: {
        contentType: 'True/False Question',
        license: 'U',
        title: content.question.substring(0, 60),
      },
    };
  }
}

module.exports = { TrueFalseGenerator };
