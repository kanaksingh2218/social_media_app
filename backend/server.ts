import express, { Request, Response } from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import environment from './shared/config/environment';
import connectDB from './shared/config/database';
import { protect } from './shared/middlewares/auth.middleware';

// Import Routes
import signupRoutes from './Authentication/signup/routes';
import loginRoutes from './Authentication/login/routes';
import postRoutes from './Feed/create-post/routes';
import getFeedRoutes from './Feed/get-feed/routes';
import likePostRoutes from './Feed/like-post/routes';
import addCommentRoutes from './Feed/add-comment/routes';
import forgotPasswordRoutes from './Authentication/forgot-password/routes';
import getCommentsRoutes from './Feed/get-comments/routes';
import ProfileRoutes from './Profile/routes';
import sendFriendRequestRoutes from './Friends/send-request/routes';
import acceptFriendRequestRoutes from './Friends/accept-request/routes';
import rejectFriendRequestRoutes from './Friends/reject-request/routes';
import getFriendsRoutes from './Friends/get-friends/routes';
import unfriendRoutes from './Friends/unfriend/routes';
import getSuggestionsRoutes from './Friends/get-suggestions/routes';
import getFriendRequestsRoutes from './Friends/get-requests/routes';
import getUserPostsRoutes from './Feed/get-user-posts/routes';
import highlightRoutes from './Profile/highlights/routes';

import notificationRoutes from './Notifications/routes';
import searchRoutes from './Search/routes';
import chatRoutes from './Chat/routes';

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
app.use('/api/auth', forgotPasswordRoutes);

// Post Routes
app.use('/api/posts', postRoutes);
app.use('/api/posts/feed', getFeedRoutes);
app.use('/api/posts/like', likePostRoutes);
app.use('/api/posts/comment', addCommentRoutes);
app.use('/api/posts/comments', getCommentsRoutes);
app.use('/api/posts/user', getUserPostsRoutes);

// Highlights Route
app.use('/api/highlights', highlightRoutes);

// Profile Routes
app.use('/api/profile', ProfileRoutes);

// Friend Routes
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
        io.to(data.receiverId).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: any) => {
    console.error('GLOBAL ERROR:', err.stack);
    res.status(500).json({ message: err.message || 'Something went wrong on the server' });
});

// Start server
httpServer.listen(environment.PORT, () => {
    console.log(`Server running on port ${environment.PORT}`);
});
