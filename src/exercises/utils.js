/**
 * Hilfsfunktionen für den Übungsgenerator
 */

const crypto = require('crypto');

function generateId() {
  return crypto.randomUUID ? crypto.randomUUID() :
    `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Validiert ein Sprachniveau
 */
function validateLevel(level) {
  const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  if (!validLevels.includes(level)) {
    throw new Error(`Ungültiges Sprachniveau: ${level}. Gültig: ${validLevels.join(', ')}`);
  }
  return level;
}

/**
 * Konvertiert Minuten in ein lesbares Zeitformat
 */
function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} Minuten`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} Stunde${h > 1 ? 'n' : ''} ${m} Minuten` : `${h} Stunde${h > 1 ? 'n' : ''}`;
}

/**
 * Berechnet die maximale Punktzahl einer Übung
 */
function calculateMaxScore(exercise) {
  switch (exercise.type) {
    case 'multipleChoice':
      return 1;
    case 'fillInBlanks':
      return exercise.content.sentences.reduce((sum, s) => sum + s.blanks.length, 0);
    case 'dragText':
      return exercise.content.dragWords.length;
    case 'trueFalse':
      return 1;
    case 'markTheWords':
      return exercise.content.correctWords.length;
    case 'dialogCards':
      return exercise.content.cards.length;
    case 'sortParagraphs':
      return exercise.content.paragraphs.length;
    case 'essay':
      return exercise.content.keywords.length || exercise.content.behaviour.pointsHost;
    case 'listening':
      return exercise.content.tasks.length;
    default:
      return 0;
  }
}

module.exports = {
  generateId,
  shuffleArray,
  validateLevel,
  formatDuration,
  calculateMaxScore,
};
