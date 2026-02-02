import { Router } from 'express';
import { login } from './controller';

const router = Router();

import { validateLogin } from '../../shared/middlewares/validation.middleware';

router.post('/', validateLogin, login);

export default router;
