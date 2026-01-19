import { Router } from 'express';
import { signup } from './controller';

const router = Router();

router.post('/', signup);

export default router;
