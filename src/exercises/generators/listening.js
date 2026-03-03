/**
 * Listening Comprehension Generator
 * Eigenes Format für Hörverstehen (nicht direkt H5P, aber H5P-Column kompatibel)
 *
 * Kombiniert Audio mit Multiple Choice / True-False / Fill in Blanks
 */

const { generateId } = require('../utils');

class ListeningGenerator {
  static name = 'Hörverstehen';
  static description = 'Hörverständnisübungen mit Audio und verschiedenen Aufgabentypen';
  static h5pContentType = 'H5P.Column';
  static supportedLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  /**
   * @param {Object} params
   * @param {string} params.title - Titel der Hörübung
   * @param {string} [params.audioUrl] - URL zur Audiodatei
   * @param {string} [params.transcript] - Transkript des Audios
   * @param {string} [params.context] - Kontextinformation
   * @param {Array<Object>} params.tasks - Array von Aufgaben
   *   Jede Aufgabe hat: { type: 'multipleChoice'|'trueFalse'|'fillInBlanks', ...params }
   * @param {string} [params.level]
   * @param {number} [params.playCount=2] - Wie oft darf das Audio abgespielt werden
   */
  static generate(params) {
    const {
      title,
      audioUrl = null,
      transcript = null,
      context = null,
      tasks,
      level = 'B1',
      playCount = 2,
    } = params;

    if (!title || !tasks || tasks.length === 0) {
      throw new Error('Hörverstehen benötigt einen Titel und mindestens eine Aufgabe');
    }

    const exercise = {
      id: generateId(),
      type: 'listening',
      h5pContentType: 'H5P.Column',
      level,
      content: {
        title,
        audioUrl,
        transcript,
        context,
        playCount,
        tasks: tasks.map((t, idx) => ({
          id: idx,
          ...t,
        })),
        instructions: getListeningInstructions(level, playCount),
      },
    };

    return exercise;
  }

  static toH5P(exercise) {
    const { content } = exercise;

    // Baue eine H5P Column mit den einzelnen Aufgaben
    const columnContent = [];

    // Instruktionen
    columnContent.push({
      content: {
        library: 'H5P.AdvancedText 1.1',
        params: {
          text: `<h3>${content.title}</h3><p>${content.instructions}</p>`,
        },
        metadata: { contentType: 'Text', license: 'U', title: 'Instruktionen' },
      },
      useSeparator: 'auto',
    });

    // Audio-Player (falls vorhanden)
    if (content.audioUrl) {
      columnContent.push({
        content: {
          library: 'H5P.Audio 1.5',
          params: {
            files: [{ path: content.audioUrl, mime: 'audio/mpeg' }],
            playerMode: 'full',
            fitToWrapper: false,
          },
          metadata: { contentType: 'Audio', license: 'U', title: 'Audio' },
        },
        useSeparator: 'auto',
      });
    }

    // Aufgaben hinzufügen (als einfache Textbeschreibung im Column-Format)
    content.tasks.forEach((task, idx) => {
      columnContent.push({
        content: {
          library: 'H5P.AdvancedText 1.1',
          params: {
            text: `<p><strong>Aufgabe ${idx + 1}:</strong> ${task.question || task.task || ''}</p>`,
          },
          metadata: { contentType: 'Text', license: 'U', title: `Aufgabe ${idx + 1}` },
        },
        useSeparator: 'auto',
      });
    });

    return {
      library: 'H5P.Column 1.16',
      params: { content: columnContent },
      subContentId: exercise.id,
      metadata: {
        contentType: 'Column',
        license: 'U',
        title: content.title,
      },
    };
  }
}

function getListeningInstructions(level, playCount) {
  const instructions = {
    A1: `Sie hören den Text ${playCount} Mal. Lesen Sie zuerst die Aufgaben. Hören Sie dann den Text und kreuzen Sie die richtige Antwort an.`,
    A2: `Sie hören den Text ${playCount} Mal. Lesen Sie zuerst die Aufgaben. Hören Sie dann den Text und lösen Sie die Aufgaben.`,
    B1: `Sie hören den Text ${playCount} Mal. Lesen Sie zuerst die Aufgaben (1 Minute). Hören Sie dann den Text und lösen Sie die Aufgaben.`,
    B2: `Sie hören den Text ${playCount} Mal. Lesen Sie zuerst die Aufgaben (2 Minuten). Hören Sie dann und lösen Sie die Aufgaben während des Hörens.`,
    C1: `Sie hören den Text ${playCount} Mal. Lesen Sie die Aufgaben. Hören Sie den Text und notieren Sie Ihre Antworten. Sie haben danach 5 Minuten zum Übertragen.`,
  };
  return instructions[level] || instructions.B1;
}

module.exports = { ListeningGenerator };
