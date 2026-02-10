import { Router } from 'express';
import signupRoutes from './signup/routes';
import loginRoutes from './login/routes';
import meRoutes from './me/routes';
import forgotPasswordRoutes from './forgot-password/routes';

const router = Router();

router.use('/signup', signupRoutes);
router.use('/login', loginRoutes);
router.use('/me', meRoutes);
router.use('/', forgotPasswordRoutes); // forgot-password/routes.ts already has /forgot-password prefix

export default router;
