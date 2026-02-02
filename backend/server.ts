import express, { Request, Response } from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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
import deleteCommentRoutes from './Feed/delete-comment/routes';
import ProfileRoutes from './Profile/routes';
import sendFriendRequestRoutes from './Friends/send-request/routes';
import acceptFriendRequestRoutes from './Friends/accept-request/routes';
import rejectFriendRequestRoutes from './Friends/reject-request/routes';
import getFriendsRoutes from './Friends/get-friends/routes';
import unfriendRoutes from './Friends/unfriend/routes';
import getSuggestionsRoutes from './Friends/get-suggestions/routes';
import getFriendRequestsRoutes from './Friends/get-requests/routes';
import getUserPostsRoutes from './Feed/get-user-posts/routes';
import deletePostRoutes from './Feed/delete-post/routes';
import updatePostRoutes from './Feed/update-post/routes';
import getPostRoutes from './Feed/get-post/routes';
import searchPostsRoutes from './Feed/search/routes';
import trendingRoutes from './Feed/trending/routes';
import highlightRoutes from './Profile/highlights/routes';
import notificationRoutes from './Notifications/routes';
import searchRoutes from './Search/routes';
import chatRoutes from './Chat/routes';

// ... (omitted imports)

// Post Routes


// Initialize express app
const app = express();
const httpServer = http.createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
    cors: { origin: environment.FRONTEND_URL, methods: ['GET', 'POST'] },
});

// Middlewares
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" } // Allow images from backend to be loaded on frontend
}));
app.use(cors());
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-7', // set `RateLimit` and `RateLimit-Policy` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

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
app.use('/api/posts/comment', addCommentRoutes); // Post new comment
app.use('/api/posts/comments', getCommentsRoutes); // Get comments
app.use('/api/posts/comments/delete', deleteCommentRoutes); // Delete comment
app.use('/api/posts/user', getUserPostsRoutes);
app.use('/api/posts/update', updatePostRoutes);
app.use('/api/posts/delete', deletePostRoutes);
app.use('/api/posts/get', getPostRoutes);
app.use('/api/posts/search', searchPostsRoutes);
app.use('/api/posts/trending', trendingRoutes);

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

// Import error handlers
import { errorHandler, notFoundHandler } from './shared/middlewares/error.middleware';

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

// Start server
httpServer.listen(environment.PORT, () => {
    console.log(`Server running on port ${environment.PORT}`);
});
