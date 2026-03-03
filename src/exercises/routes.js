/**
 * API-Routen für den Übungsgenerator
 */

const express = require('express');
const router = express.Router();
const {
  generateExercise,
  generateOesdExam,
  exportAsH5P,
  getAvailableTypes,
  getOesdStructure,
} = require('./index');
const { H5PExporter } = require('./exporters/h5pExporter');
const { getAllExamples, getExamplesForLevel } = require('./templates/examples');
const { calculateMaxScore } = require('./utils');

// ====== Übungstypen ======

/**
 * GET /api/exercises/types
 * Gibt alle verfügbaren Übungstypen zurück
 */
router.get('/api/exercises/types', (req, res) => {
  try {
    const types = getAvailableTypes();
    res.json({ success: true, types });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ====== Übung generieren ======

/**
 * POST /api/exercises/generate
 * Generiert eine einzelne Übung
 * Body: { type: string, params: object }
 */
router.post('/api/exercises/generate', (req, res) => {
  try {
    const { type, params } = req.body;
    if (!type || !params) {
      return res.status(400).json({
        success: false,
        error: 'Bitte geben Sie "type" und "params" an.',
      });
    }

    const exercise = generateExercise(type, params);
    const maxScore = calculateMaxScore(exercise);

    res.json({
      success: true,
      exercise,
      maxScore,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ====== H5P Export ======

/**
 * POST /api/exercises/export/h5p
 * Exportiert eine Übung als H5P JSON
 * Body: { exercise: object } oder { type: string, params: object }
 */
router.post('/api/exercises/export/h5p', (req, res) => {
  try {
    let exercise;

    if (req.body.exercise) {
      exercise = req.body.exercise;
    } else if (req.body.type && req.body.params) {
      exercise = generateExercise(req.body.type, req.body.params);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Bitte geben Sie eine Übung oder type+params an.',
      });
    }

    const h5p = exportAsH5P(exercise);
    const manifest = H5PExporter.createManifest(
      exercise.content?.task || exercise.content?.question || exercise.content?.title || 'Übung',
      exercise.h5pContentType
    );

    res.json({
      success: true,
      h5p,
      manifest,
      contentJson: H5PExporter.createContentJson(h5p),
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/exercises/export/h5p/column
 * Exportiert mehrere Übungen als H5P Column
 * Body: { exercises: object[], title?: string }
 */
router.post('/api/exercises/export/h5p/column', (req, res) => {
  try {
    const { exercises, title } = req.body;
    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Bitte geben Sie ein Array von Übungen an.',
      });
    }

    const h5p = H5PExporter.exportAsColumn(exercises, title);
    const manifest = H5PExporter.createManifest(title || 'Übungen', 'H5P.Column');

    res.json({
      success: true,
      h5p,
      manifest,
      contentJson: H5PExporter.createContentJson(h5p),
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ====== ÖSD Prüfungssimulation ======

/**
 * GET /api/exercises/oesd/structure
 * Gibt die ÖSD-Prüfungsstruktur zurück
 */
router.get('/api/exercises/oesd/structure', (req, res) => {
  try {
    const structure = getOesdStructure();
    res.json({ success: true, structure });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/exercises/oesd/generate
 * Generiert eine ÖSD-Prüfungssimulation
 * Body: { level: string, modules?: string[], topic?: string, content?: object }
 */
router.post('/api/exercises/oesd/generate', (req, res) => {
  try {
    const { level, modules, topic, content } = req.body;
    if (!level) {
      return res.status(400).json({
        success: false,
        error: 'Bitte geben Sie ein Prüfungsniveau an (A1, A2, B1, B2, C1).',
      });
    }

    const exam = generateOesdExam(level, { modules, topic, content });

    res.json({
      success: true,
      exam,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/exercises/oesd/export/h5p
 * Exportiert eine ÖSD-Prüfung als H5P
 * Body: { exam: object }
 */
router.post('/api/exercises/oesd/export/h5p', (req, res) => {
  try {
    const { exam } = req.body;
    if (!exam) {
      return res.status(400).json({
        success: false,
        error: 'Bitte geben Sie eine Prüfungssimulation an.',
      });
    }

    const h5p = H5PExporter.exportExamAsColumn(exam);
    const manifest = H5PExporter.createManifest(exam.name, 'H5P.Column');

    res.json({
      success: true,
      h5p,
      manifest,
      contentJson: H5PExporter.createContentJson(h5p),
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ====== Beispiele ======

/**
 * GET /api/exercises/examples
 * Gibt alle Beispielübungen zurück
 */
router.get('/api/exercises/examples', (req, res) => {
  try {
    const { level } = req.query;
    if (level) {
      const examples = getExamplesForLevel(level.toUpperCase());
      res.json({ success: true, level: level.toUpperCase(), examples });
    } else {
      const examples = getAllExamples();
      res.json({ success: true, examples });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/exercises/examples/generate
 * Generiert eine Übung aus einem Beispiel
 * Body: { exampleId: string }
 */
router.post('/api/exercises/examples/generate', (req, res) => {
  try {
    const { exampleId } = req.body;
    const allExamples = getAllExamples();

    let example;
    for (const level of Object.values(allExamples)) {
      example = level.find(e => e.id === exampleId);
      if (example) break;
    }

    if (!example) {
      return res.status(404).json({
        success: false,
        error: `Beispiel "${exampleId}" nicht gefunden.`,
      });
    }

    const exercise = generateExercise(example.type, example.params);
    const h5p = exportAsH5P(exercise);

    res.json({
      success: true,
      exercise,
      h5p,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
