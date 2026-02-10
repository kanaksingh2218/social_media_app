import { Router } from 'express';
import sendRequestRoutes from './send-request/routes';
import acceptRequestRoutes from './accept-request/routes';
import rejectRequestRoutes from './reject-request/routes';
import unfriendRoutes from './unfriend/routes';
import getSuggestionsRoutes from './get-suggestions/routes';
import getFriendRequestsRoutes from './get-requests/routes';
import cancelRequestRoutes from './cancel-request/routes';
import getFriendsRoutes from './get-friends/routes';

const router = Router();

router.use('/send', sendRequestRoutes);
router.use('/accept', acceptRequestRoutes);
router.use('/reject', rejectRequestRoutes);
router.use('/unfriend', unfriendRoutes);
router.use('/suggestions', getSuggestionsRoutes);
router.use('/requests', getFriendRequestsRoutes);
router.use('/cancel', cancelRequestRoutes);
router.use('/list', getFriendsRoutes);

export default router;
