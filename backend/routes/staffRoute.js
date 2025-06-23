import express from 'express';
import { staffLogin, getStaffProfile, updateStaffProfile } from '../controllers/staffController.js';
import { authStaff } from '../middleware/auth.js';

const router = express.Router();

// Staff Authentication Routes
router.post('/login', staffLogin);
router.get('/profile', authStaff, getStaffProfile);
router.put('/update', authStaff, updateStaffProfile);

export default router; 