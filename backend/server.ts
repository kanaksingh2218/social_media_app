import express, { Request, Response } from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import environment from './shared/config/environment';
import connectDB from './shared/config/database';

// Import Routes
import signupRoutes from './1) Authentication/signup/routes';
import loginRoutes from './1) Authentication/login/routes';
import createPostRoutes from './2) Feed/create-post/routes';
import getFeedRoutes from './2) Feed/get-feed/routes';
import likePostRoutes from './2) Feed/like-post/routes';
import addCommentRoutes from './2) Feed/add-comment/routes';
import getCommentsRoutes from './2) Feed/get-comments/routes';
import getProfileRoutes from './5) Profile/get-profile/routes';
import updateProfileRoutes from './5) Profile/update-profile/routes';
import followUserRoutes from './5) Profile/follow-user/routes';
import unfollowUserRoutes from './5) Profile/unfollow-user/routes';
import uploadAvatarRoutes from './5) Profile/upload-avatar/routes';
import sendFriendRequestRoutes from './3) Friends/send-request/routes';
import acceptFriendRequestRoutes from './3) Friends/accept-request/routes';
import rejectFriendRequestRoutes from './3) Friends/reject-request/routes';
import getFriendsRoutes from './3) Friends/get-friends/routes';
import unfriendRoutes from './3) Friends/unfriend/routes';
import getSuggestionsRoutes from './3) Friends/get-suggestions/routes';
import getFriendRequestsRoutes from './3) Friends/get-requests/routes';
import getUserPostsRoutes from './2) Feed/get-user-posts/routes';

import notificationRoutes from './6) Notifications/routes';
import searchRoutes from './7) Search/routes';
import chatRoutes from './4) Chat/routes';

// Initialize express app
const app = express();
const httpServer = http.createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
    cors: { origin: environment.FRONTEND_URL, methods: ['GET', 'POST'] },
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
connectDB();

// Mount Routes
app.use('/api/auth/signup', signupRoutes);
app.use('/api/auth/login', loginRoutes);
app.use('/api/posts/create', createPostRoutes);
app.use('/api/posts/feed', getFeedRoutes);
app.use('/api/posts/like', likePostRoutes);
app.use('/api/posts/comment', addCommentRoutes);
app.use('/api/posts/comments', getCommentsRoutes);
app.use('/api/posts/user', getUserPostsRoutes);
app.use('/api/profile', getProfileRoutes);
app.use('/api/profile/update', updateProfileRoutes);
app.use('/api/profile/follow', followUserRoutes);
app.use('/api/profile/unfollow', unfollowUserRoutes);
app.use('/api/profile/upload-avatar', uploadAvatarRoutes);
app.use('/api/friends/send', sendFriendRequestRoutes);
app.use('/api/friends/accept', acceptFriendRequestRoutes);
app.use('/api/friends/reject', rejectFriendRequestRoutes);
app.use('/api/friends/list', getFriendsRoutes);
app.use('/api/friends/unfriend', unfriendRoutes);
app.use('/api/friends/suggestions', getSuggestionsRoutes);
app.use('/api/friends/requests', getFriendRequestsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => res.send('API Running'));

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their room`);
    });

    socket.on('send_message', (data) => {
        // data: { senderId, receiverId, content, createdAt }
        io.to(data.receiverId).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Start server
httpServer.listen(environment.PORT, () => {
    console.log(`Server running on port ${environment.PORT}`);
});
