import { Router } from 'express';
import { login } from './controller';

const router = Router();

router.post('/', login);

export default router;
