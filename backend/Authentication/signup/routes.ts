import { Router } from 'express';
import { signup } from './controller';

const router = Router();

import { validateSignup } from '../../shared/middlewares/validation.middleware';

router.post('/', validateSignup, signup);

export default router;
