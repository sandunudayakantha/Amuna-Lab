import express from 'express';
import { authStaff } from '../middleware/auth.js';
import {
    getTodayAppointments,
    getPendingInvoices,
    getTotalRevenue,
    getRecentActivity,
    getUpcomingAppointments
} from '../controllers/receptionistController.js';

const router = express.Router();

// Appointments
router.get('/appointments/today', authStaff, getTodayAppointments);
router.get('/appointments/upcoming', authStaff, getUpcomingAppointments);
router.get('/appointments/recent-activity', authStaff, getRecentActivity);

// Invoices
router.get('/invoices/pending', authStaff, getPendingInvoices);
router.get('/invoices/total-revenue', authStaff, getTotalRevenue);

export default router; 