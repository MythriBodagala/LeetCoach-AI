import { Router } from 'express';
import { submitAttempt } from '../../controllers/attempt.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { getMyAttempts } from '../../controllers/attempt.controller';
import { reviewAttempt } from '../../controllers/attempt.controller';
const router = Router();

// Only logged-in users can submit solutions
router.post('/', authenticate, submitAttempt);
// Add this line below your POST route
router.get('/', authenticate, getMyAttempts);
router.post('/:id/review', authenticate, reviewAttempt);
export default router;