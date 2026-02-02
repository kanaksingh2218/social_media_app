import { Router } from 'express';
import getProfileRoutes from './get-profile/routes';
import updateProfileRoutes from './update-profile/routes';
import followUserRoutes from './follow-user/routes';
import unfollowUserRoutes from './unfollow-user/routes';
import getFollowersRoutes from './get-followers/routes';
import getFollowingRoutes from './get-following/routes';
import uploadAvatarRoutes from './upload-avatar/routes';
import removeAvatarRoutes from './remove-avatar/routes';
import { removeFollower } from './remove-follower/controller';
import { protect } from '../shared/middlewares/auth.middleware';

const router = Router();

console.log('[DEBUG] Profile Routes Module Loaded');

router.post('/remove-follower/:userId', protect, removeFollower);
router.use('/update', updateProfileRoutes);
router.use('/follow', followUserRoutes);
router.use('/unfollow', unfollowUserRoutes);
router.use('/followers', getFollowersRoutes);
router.use('/following', getFollowingRoutes);
router.use('/upload-avatar', uploadAvatarRoutes);
router.use('/remove-avatar', removeAvatarRoutes);
router.use('/', getProfileRoutes);

console.log('[DEBUG] Profile routes mounted, including /remove-avatar');

export default router;
