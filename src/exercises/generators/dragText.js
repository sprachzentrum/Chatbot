/**
 * Drag Text Generator
 * H5P Content Type: H5P.DragText
 */

const { generateId } = require('../utils');

class DragTextGenerator {
  static name = 'Text zuordnen (Drag & Drop)';
  static description = 'Wörter an die richtige Stelle im Text ziehen';
  static h5pContentType = 'H5P.DragText';
  static supportedLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  /**
   * @param {Object} params
   * @param {string} params.task - Aufgabenstellung
   * @param {string} params.text - Text mit *markierten* Drag-Wörtern
   *   Beispiel: "Der Hund *frisst* einen *Knochen*."
   * @param {string} [params.level]
   * @param {boolean} [params.instantFeedback=false]
   * @param {Array<string>} [params.distractors] - Zusätzliche falsche Wörter
   */
  static generate(params) {
    const {
      task = 'Ziehen Sie die Wörter an die richtige Stelle.',
      text,
      level = 'B1',
      instantFeedback = false,
      distractors = [],
    } = params;

    if (!text) {
      throw new Error('Drag Text benötigt einen Text mit markierten Wörtern');
    }

    // Extrahiere die Drag-Wörter
    const dragWords = [];
    const regex = /\*([^*]+)\*/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      dragWords.push(match[1]);
    }

    if (dragWords.length === 0) {
      throw new Error('Text muss mindestens ein markiertes Wort enthalten (mit *Wort*)');
    }

    const exercise = {
      id: generateId(),
      type: 'dragText',
      h5pContentType: 'H5P.DragText',
      level,
      content: {
        task,
        text,
        dragWords,
        distractors,
        behaviour: {
          instantFeedback,
          enableRetry: true,
          enableSolutionsButton: true,
          enableCheckButton: true,
        },
        feedback: {
          correct: 'Alles richtig!',
          incorrect: 'Einige Wörter sind nicht an der richtigen Stelle.',
        },
      },
    };

    return exercise;
  }

  static toH5P(exercise) {
    const { content } = exercise;

    // H5P DragText format: Drag-Wörter mit *Wort* markiert
    // Distraktoren mit \n am Ende der Zeile
    let textField = content.text;
    if (content.distractors.length > 0) {
      textField += '\n' + content.distractors.map(d => `*${d}*`).join('\n');
    }

    return {
      library: 'H5P.DragText 1.10',
      params: {
        media: { disableImageZooming: false },
        taskDescription: `<p>${content.task}</p>`,
        textField,
        overallFeedback: [
          { from: 0, to: 50, feedback: content.feedback.incorrect },
          { from: 51, to: 100, feedback: content.feedback.correct },
        ],
        checkAnswer: 'Überprüfen',
        submitAnswer: 'Absenden',
        tryAgain: 'Nochmal versuchen',
        showSolution: 'Lösung anzeigen',
        dropZoneIndex: 'Ablagezone @index.',
        empty: 'Ablagezone @index ist leer.',
        contains: 'Ablagezone @index enthält @draggable.',
        ariaDraggableIndex: '@index von @count ziehbare Elemente.',
        tipLabel: 'Hinweis anzeigen',
        correctText: 'Richtig!',
        incorrectText: 'Falsch!',
        resetDropTitle: 'Zurücksetzen',
        resetDropDescription: 'Sind Sie sicher, dass Sie die Ablagezone zurücksetzen möchten?',
        grabbed: '@content wurde aufgenommen.',
        cancelledDragging: 'Ziehen abgebrochen. @content wurde zurückgelegt.',
        correctAnswer: 'Richtige Antwort:',
        behaviour: content.behaviour,
      },
      subContentId: exercise.id,
      metadata: {
        contentType: 'Drag the Words',
        license: 'U',
        title: content.task.substring(0, 60),
      },
    };
  }
}

module.exports = { DragTextGenerator };
