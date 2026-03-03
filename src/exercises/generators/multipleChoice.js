/**
 * Multiple Choice Generator
 * H5P Content Type: H5P.MultiChoice
 */

const { generateId, shuffleArray } = require('../utils');

class MultipleChoiceGenerator {
  static name = 'Multiple Choice';
  static description = 'Fragen mit mehreren Antwortmöglichkeiten';
  static h5pContentType = 'H5P.MultiChoice';
  static supportedLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  /**
   * @param {Object} params
   * @param {string} params.question - Die Frage
   * @param {Array<{text: string, correct: boolean, tip?: string}>} params.answers - Antwortmöglichkeiten
   * @param {string} [params.media] - Optionales Bild/Audio/Video
   * @param {boolean} [params.singleAnswer=true] - Nur eine richtige Antwort
   * @param {string} [params.level] - Sprachniveau (A1-C2)
   * @param {Object} [params.feedback] - Feedback-Texte
   * @param {string} [params.context] - Lesetext/Kontext für die Frage
   */
  static generate(params) {
    const {
      question,
      answers,
      media = null,
      singleAnswer = true,
      level = 'B1',
      feedback = {},
      context = null,
    } = params;

    if (!question || !answers || answers.length < 2) {
      throw new Error('Multiple Choice benötigt eine Frage und mindestens 2 Antworten');
    }

    const correctCount = answers.filter(a => a.correct).length;
    if (correctCount === 0) {
      throw new Error('Mindestens eine Antwort muss korrekt sein');
    }

    const exercise = {
      id: generateId(),
      type: 'multipleChoice',
      h5pContentType: 'H5P.MultiChoice',
      level,
      content: {
        question,
        context,
        answers: answers.map((a, idx) => ({
          id: idx,
          text: a.text,
          correct: a.correct,
          tip: a.tip || null,
        })),
        behaviour: {
          singleAnswer: singleAnswer || correctCount === 1,
          shuffleAnswers: true,
          enableRetry: true,
          enableSolutionsButton: true,
          confirmCheckDialog: false,
          autoCheck: false,
          passPercentage: 100,
        },
        media,
        feedback: {
          correct: feedback.correct || 'Richtig!',
          incorrect: feedback.incorrect || 'Leider falsch. Versuchen Sie es noch einmal.',
          partial: feedback.partial || 'Teilweise richtig.',
        },
      },
    };

    return exercise;
  }

  /**
   * Generiert H5P-kompatibles JSON
   */
  static toH5P(exercise) {
    const { content } = exercise;
    return {
      library: 'H5P.MultiChoice 1.16',
      params: {
        media: content.media ? { type: content.media } : { disableImageZooming: false },
        answers: content.answers.map(a => ({
          correct: a.correct,
          tpiAndFeedback: {
            tip: a.tip || '',
            chosenFeedback: a.correct ? content.feedback.correct : content.feedback.incorrect,
            notChosenFeedback: '',
          },
          text: `<div>${a.text}</div>\n`,
        })),
        UI: {
          checkAnswerButton: 'Überprüfen',
          submitAnswerButton: 'Absenden',
          showSolutionButton: 'Lösung anzeigen',
          tryAgainButton: 'Nochmal versuchen',
          tipsLabel: 'Hinweis anzeigen',
          scoreBarLabel: 'Du hast :num von :total Punkten erreicht.',
          tipAvailable: 'Hinweis verfügbar',
          feedbackAvailable: 'Feedback verfügbar',
          readFeedback: 'Feedback lesen',
          wrongAnswer: 'Falsche Antwort',
          correctAnswer: 'Richtige Antwort',
          shouldCheck: 'Hätte ausgewählt werden sollen',
          shouldNotCheck: 'Hätte nicht ausgewählt werden sollen',
          noInput: 'Bitte antworten Sie, bevor Sie die Lösung ansehen',
          a11yCheck: 'Die Antworten überprüfen. Die Auswahlen werden als richtig, falsch oder fehlend markiert.',
          a11yShowSolution: 'Die Lösung anzeigen. Die richtigen Lösungen werden angezeigt.',
          a11yRetry: 'Die Aufgabe wiederholen. Alle Antworten werden zurückgesetzt.',
        },
        behaviour: content.behaviour,
        confirmCheck: {
          header: 'Fertig?',
          body: 'Sind Sie sicher, dass Sie die Aufgabe beenden möchten?',
          cancelLabel: 'Abbrechen',
          confirmLabel: 'Fertig',
        },
        confirmRetry: {
          header: 'Nochmal versuchen?',
          body: 'Sind Sie sicher, dass Sie es nochmal versuchen möchten?',
          cancelLabel: 'Abbrechen',
          confirmLabel: 'Bestätigen',
        },
        question: content.context
          ? `<div class="context">${content.context}</div><p>${content.question}</p>`
          : `<p>${content.question}</p>`,
      },
      subContentId: exercise.id,
      metadata: {
        contentType: 'Multiple Choice',
        license: 'U',
        title: content.question.substring(0, 60),
        authors: [],
        changes: [],
        extraTitle: content.question.substring(0, 60),
      },
    };
  }
}

module.exports = { MultipleChoiceGenerator };
