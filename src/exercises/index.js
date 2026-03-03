/**
 * Übungsgenerator - Hauptmodul
 * Generiert H5P-kompatible Übungen und ÖSD-Prüfungssimulationen
 */

const { MultipleChoiceGenerator } = require('./generators/multipleChoice');
const { FillInBlanksGenerator } = require('./generators/fillInBlanks');
const { DragTextGenerator } = require('./generators/dragText');
const { TrueFalseGenerator } = require('./generators/trueFalse');
const { MarkTheWordsGenerator } = require('./generators/markTheWords');
const { DialogCardsGenerator } = require('./generators/dialogCards');
const { SortParagraphsGenerator } = require('./generators/sortParagraphs');
const { EssayGenerator } = require('./generators/essay');
const { ListeningGenerator } = require('./generators/listening');
const { OesdExamGenerator } = require('./formats/oesdExam');
const { H5PExporter } = require('./exporters/h5pExporter');

const GENERATORS = {
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

/**
 * Erstellt eine einzelne Übung
 */
function generateExercise(type, params) {
  const Generator = GENERATORS[type];
  if (!Generator) {
    throw new Error(`Unbekannter Übungstyp: ${type}. Verfügbar: ${Object.keys(GENERATORS).join(', ')}`);
  }
  return Generator.generate(params);
}

/**
 * Erstellt eine ÖSD-Prüfungssimulation
 */
function generateOesdExam(level, options = {}) {
  return OesdExamGenerator.generate(level, options);
}

/**
 * Exportiert eine Übung als H5P-kompatibles JSON
 */
function exportAsH5P(exercise) {
  return H5PExporter.export(exercise);
}

/**
 * Gibt alle verfügbaren Übungstypen zurück
 */
function getAvailableTypes() {
  return Object.entries(GENERATORS).map(([key, gen]) => ({
    id: key,
    name: gen.name,
    description: gen.description,
    h5pContentType: gen.h5pContentType,
    supportedLevels: gen.supportedLevels || ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
  }));
}

/**
 * Gibt die ÖSD-Prüfungsstruktur zurück
 */
function getOesdStructure() {
  return OesdExamGenerator.getStructure();
}

module.exports = {
  generateExercise,
  generateOesdExam,
  exportAsH5P,
  getAvailableTypes,
  getOesdStructure,
  GENERATORS,
};
