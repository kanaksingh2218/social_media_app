import { Router } from 'express';
import getProfileRoutes from './get-profile/routes';
import updateProfileRoutes from './update-profile/routes';
import uploadAvatarRoutes from './upload-avatar/routes';
import removeAvatarRoutes from './remove-avatar/routes';

import getConnectionsRoutes from './get-connections/routes';

const router = Router();

// Only profile management routes
router.use('/update', updateProfileRoutes);
router.use('/upload-avatar', uploadAvatarRoutes);
router.use('/remove-avatar', removeAvatarRoutes);
router.use('/', getConnectionsRoutes); // Mounts /followers/:id and /following/:id
router.use('/', getProfileRoutes);

export default router;
