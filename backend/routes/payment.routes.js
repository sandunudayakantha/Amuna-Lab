import express from 'express';
import { createPaymentIntent, handlePaymentSuccess, handlePaymentFailure, confirmPaymentIntent } from '../controllers/payment.controller.js';

const router = express.Router();

router.post('/create-payment-intent', createPaymentIntent);
router.post('/payment-success', handlePaymentSuccess);
router.post('/payment-failure', handlePaymentFailure);
router.post('/confirm-payment', confirmPaymentIntent);

export default router; 