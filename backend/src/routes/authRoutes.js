import { Router } from 'express';
import { login } from '../controllers/authController.js';
import { validateBody } from '../middleware/validateBody.js';
import { loginSchema } from '../schemas/index.js';

const router = Router();
router.post('/login', validateBody(loginSchema), login);

export default router;
