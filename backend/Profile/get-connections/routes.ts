import { Router } from 'express';
import { getFollowers, getFollowing } from './controller';
import { protect } from '../../shared/middlewares/auth.middleware';

const router = Router();

router.get('/followers/:userId', getFollowers); // Public or Protected? Let's generic auth for now if needed, but usually public info
router.get('/following/:userId', getFollowing);

export default router;
