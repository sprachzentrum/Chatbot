/**
 * H5P Exporter
 * Konvertiert interne Übungsformate in H5P-kompatibles JSON
 */

const { MultipleChoiceGenerator } = require('../generators/multipleChoice');
const { FillInBlanksGenerator } = require('../generators/fillInBlanks');
const { DragTextGenerator } = require('../generators/dragText');
const { TrueFalseGenerator } = require('../generators/trueFalse');
const { MarkTheWordsGenerator } = require('../generators/markTheWords');
const { DialogCardsGenerator } = require('../generators/dialogCards');
const { SortParagraphsGenerator } = require('../generators/sortParagraphs');
const { EssayGenerator } = require('../generators/essay');
const { ListeningGenerator } = require('../generators/listening');

const EXPORTERS = {
  multipleChoice: MultipleChoiceGenerator,
  fillInBlanks: FillInBlanksGenerator,
  dragText: DragTextGenerator,
  trueFalse: TrueFalseGenerator,
  markTheWords: MarkTheWordsGenerator,
  dialogCards: DialogCardsGenerator,
  sortParagraphs: SortParagraphsGenerator,
  essay: EssayGenerator,
  listening: ListeningGenerator,
};

class H5PExporter {
  /**
   * Exportiert eine einzelne Übung als H5P JSON
   */
  static export(exercise) {
    const Exporter = EXPORTERS[exercise.type];
    if (!Exporter) {
      throw new Error(`Kein H5P-Exporter für Übungstyp: ${exercise.type}`);
    }
    return Exporter.toH5P(exercise);
  }

  /**
   * Exportiert mehrere Übungen als H5P Column
   */
  static exportAsColumn(exercises, title = 'Übungen') {
    const content = exercises.map(exercise => {
      const h5p = this.export(exercise);
      return {
        content: h5p,
        useSeparator: 'auto',
      };
    });

    return {
      library: 'H5P.Column 1.16',
      params: { content },
      metadata: {
        contentType: 'Column',
        license: 'U',
        title,
      },
    };
  }

  /**
   * Exportiert eine ÖSD-Prüfung als H5P Column mit allen Teilen
   */
  static exportExamAsColumn(exam) {
    const content = [];

    // Titel
    content.push({
      content: {
        library: 'H5P.AdvancedText 1.1',
        params: {
          text: `<h2>${exam.name}</h2>
<p>Gesamtdauer: ${formatDuration(exam.totalDuration)} |
Gesamtpunkte: ${exam.totalPoints} |
Bestehensgrenze: ${exam.passPoints} Punkte (${exam.passPercent}%)</p>`,
        },
        metadata: { contentType: 'Text', license: 'U', title: exam.name },
      },
      useSeparator: 'auto',
    });

    // Module
    for (const [key, module] of Object.entries(exam.modules)) {
      // Modul-Header
      content.push({
        content: {
          library: 'H5P.AdvancedText 1.1',
          params: {
            text: `<h3>Modul: ${module.name}</h3><p>Dauer: ${module.durationFormatted}</p>`,
          },
          metadata: { contentType: 'Text', license: 'U', title: module.name },
        },
        useSeparator: 'auto',
      });

      // Teile mit Übungen
      for (const part of module.parts) {
        content.push({
          content: {
            library: 'H5P.AdvancedText 1.1',
            params: {
              text: `<h4>${part.name}</h4><p>${part.description}</p><p><em>Punkte: ${part.points}</em></p>`,
            },
            metadata: { contentType: 'Text', license: 'U', title: part.name },
          },
          useSeparator: 'auto',
        });

        // Falls Inhalt vorhanden, exportiere die Übung
        if (part.content) {
          try {
            const h5p = this.export(part.content);
            content.push({
              content: h5p,
              useSeparator: 'auto',
            });
          } catch {
            // Übung konnte nicht exportiert werden - Template anzeigen
          }
        }
      }
    }

    return {
      library: 'H5P.Column 1.16',
      params: { content },
      metadata: {
        contentType: 'Column',
        license: 'U',
        title: exam.name,
      },
    };
  }

  /**
   * Erstellt eine H5P content.json Datei
   */
  static createContentJson(h5pContent) {
    return JSON.stringify(h5pContent, null, 2);
  }

  /**
   * Erstellt eine h5p.json Manifest-Datei
   */
  static createManifest(title, mainLibrary = 'H5P.Column') {
    const libraryVersions = {
      'H5P.MultiChoice': { majorVersion: 1, minorVersion: 16 },
      'H5P.Blanks': { majorVersion: 1, minorVersion: 14 },
      'H5P.DragText': { majorVersion: 1, minorVersion: 10 },
      'H5P.TrueFalse': { majorVersion: 1, minorVersion: 8 },
      'H5P.MarkTheWords': { majorVersion: 1, minorVersion: 11 },
      'H5P.DialogCards': { majorVersion: 1, minorVersion: 9 },
      'H5P.SortParagraphs': { majorVersion: 0, minorVersion: 11 },
      'H5P.Essay': { majorVersion: 1, minorVersion: 5 },
      'H5P.Column': { majorVersion: 1, minorVersion: 16 },
      'H5P.Audio': { majorVersion: 1, minorVersion: 5 },
      'H5P.AdvancedText': { majorVersion: 1, minorVersion: 1 },
    };

    const lib = libraryVersions[mainLibrary] || { majorVersion: 1, minorVersion: 0 };

    return {
      title,
      language: 'de',
      mainLibrary,
      embedTypes: ['div'],
      license: 'U',
      defaultLanguage: 'de',
      preloadedDependencies: [
        {
          machineName: mainLibrary,
          majorVersion: lib.majorVersion,
          minorVersion: lib.minorVersion,
        },
      ],
    };
  }
}

function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} Minuten`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} Std. ${m} Min.` : `${h} Std.`;
}

module.exports = { H5PExporter };
