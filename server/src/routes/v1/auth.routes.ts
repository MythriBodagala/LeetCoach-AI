import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { register, login } from '../../controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, (req, res) => {
  res.json({ 
    message: 'You have access to this protected route!',
    userData: req.user // This comes from the middleware
  });
});

export default router;