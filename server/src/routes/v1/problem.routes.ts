import { Router } from 'express';
import { getAllProblems } from '../../controllers/problem.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// Only authenticated users can see the problem list
router.get('/', authenticate, getAllProblems);

export default router;