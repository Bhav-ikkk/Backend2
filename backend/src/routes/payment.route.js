import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';  // Authentication middleware
import { createCheckoutSession, handleStripeWebhook, verifyPayment } from '../controllers/payment.controller.js';

const router = express.Router();

// Route to create Stripe checkout session
router.post('/create-checkout-session', protectRoute, createCheckoutSession);

// Webhook to handle Stripe events like payment completion
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Route to verify the payment status
router.post('/verify-payment', protectRoute, verifyPayment);

export default router;
