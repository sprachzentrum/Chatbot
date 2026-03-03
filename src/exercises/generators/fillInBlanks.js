/**
 * Fill in the Blanks Generator
 * H5P Content Type: H5P.Blanks
 */

const { generateId } = require('../utils');

class FillInBlanksGenerator {
  static name = 'Lückentext';
  static description = 'Text mit Lücken zum Ausfüllen (Grammatik, Vokabeln)';
  static h5pContentType = 'H5P.Blanks';
  static supportedLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  /**
   * @param {Object} params
   * @param {string} params.task - Aufgabenstellung
   * @param {Array<{text: string, blanks: Array<{answer: string|string[], hint?: string}>}>} params.sentences
   *   - text: Satz mit *Platzhaltern* für Lücken (markiert mit *...*)
   *   - blanks: Array der Lücken mit korrekten Antworten
   * @param {string} [params.level] - Sprachniveau
   * @param {boolean} [params.caseSensitive=false]
   * @param {boolean} [params.showSolutions=true]
   * @param {string} [params.context] - Optionaler Kontext/Lesetext
   */
  static generate(params) {
    const {
      task = 'Füllen Sie die Lücken aus.',
      sentences,
      level = 'B1',
      caseSensitive = false,
      showSolutions = true,
      context = null,
    } = params;

    if (!sentences || sentences.length === 0) {
      throw new Error('Lückentext benötigt mindestens einen Satz');
    }

    const exercise = {
      id: generateId(),
      type: 'fillInBlanks',
      h5pContentType: 'H5P.Blanks',
      level,
      content: {
        task,
        context,
        sentences: sentences.map((s, idx) => ({
          id: idx,
          text: s.text,
          blanks: s.blanks.map(b => ({
            answers: Array.isArray(b.answer) ? b.answer : [b.answer],
            hint: b.hint || null,
          })),
        })),
        behaviour: {
          caseSensitive,
          showSolutions,
          enableRetry: true,
          autoCheck: false,
          acceptSpellingErrors: level === 'A1' || level === 'A2',
          separateLines: false,
        },
        feedback: {
          correct: 'Alles richtig!',
          almostCorrect: 'Fast richtig! Überprüfen Sie die markierten Lücken.',
          incorrect: 'Versuchen Sie es noch einmal.',
        },
      },
    };

    return exercise;
  }

  static toH5P(exercise) {
    const { content } = exercise;

    // H5P Blanks format: Lücken werden mit *Antwort* markiert
    const h5pQuestions = content.sentences.map(s => {
      let text = s.text;
      let blankIdx = 0;
      // Ersetze Platzhalter durch H5P-Format: *answer1/answer2:hint*
      text = text.replace(/\*[^*]+\*/g, () => {
        const blank = s.blanks[blankIdx++];
        if (!blank) return '____';
        const answers = blank.answers.join('/');
        const hint = blank.hint ? `:${blank.hint}` : '';
        return `*${answers}${hint}*`;
      });
      return text;
    });

    return {
      library: 'H5P.Blanks 1.14',
      params: {
        media: { disableImageZooming: false },
        text: content.context
          ? `<div class="context">${content.context}</div><p>${content.task}</p>`
          : `<p>${content.task}</p>`,
        overallFeedback: [
          { from: 0, to: 50, feedback: content.feedback.incorrect },
          { from: 51, to: 99, feedback: content.feedback.almostCorrect },
          { from: 100, to: 100, feedback: content.feedback.correct },
        ],
        showSolutions: content.behaviour.showSolutions ? 'Show' : 'Hide',
        tryAgain: 'Nochmal versuchen',
        checkAnswer: 'Überprüfen',
        submitAnswer: 'Absenden',
        notFilledOut: 'Bitte füllen Sie alle Lücken aus',
        answerIsCorrect: ':ans ist korrekt',
        answerIsWrong: ':ans ist falsch',
        answeredCorrectly: 'Richtig ausgefüllt',
        answeredIncorrectly: 'Falsch ausgefüllt',
        solutionLabel: 'Richtige Antwort:',
        inputLabel: 'Lücke @num von @total',
        inputHasTipLabel: 'Hinweis verfügbar',
        tipLabel: 'Hinweis',
        behaviour: {
          enableRetry: content.behaviour.enableRetry,
          enableSolutionsButton: content.behaviour.showSolutions,
          enableCheckButton: true,
          caseSensitive: content.behaviour.caseSensitive,
          autoCheck: content.behaviour.autoCheck,
          acceptSpellingErrors: content.behaviour.acceptSpellingErrors,
        },
        questions: h5pQuestions.map(q => `<p>${q}</p>`),
      },
      subContentId: exercise.id,
      metadata: {
        contentType: 'Fill in the Blanks',
        license: 'U',
        title: content.task.substring(0, 60),
      },
    };
  }
}

module.exports = { FillInBlanksGenerator };
