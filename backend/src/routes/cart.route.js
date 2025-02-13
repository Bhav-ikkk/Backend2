import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { participateInEvent, getUserEvents } from '../controllers/cart.controller.js';

const router = express.Router();

router.post('/participate', protectRoute, participateInEvent);
router.get('/user-events', protectRoute, getUserEvents);

export default router;
