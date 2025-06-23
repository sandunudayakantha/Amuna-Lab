import express from 'express';
import aiAnalysisController from '../controllers/aiAnalysisController.js';

const router = express.Router();

// Route for AI analysis
router.post('/', aiAnalysisController.analyzeTestResults);

export default router; 