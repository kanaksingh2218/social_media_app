import express, { Request, Response } from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import environment from './shared/config/environment';
import connectDB from './shared/config/database';
import { protect } from './shared/middlewares/auth.middleware';

// Import Routes
import authRoutes from './Authentication';
import meRoutes from './Authentication/me/routes';
import friendsRoutes from './Friends';
import postsRouter from './Feed/posts.routes';

// Profile Routes
import ProfileRoutes from './Profile/routes';
import highlightRoutes from './Profile/highlights/routes';



// Other Routes
import followRequestsRoutes from './routes/followRequests.routes';
import notificationRoutes from './routes/notification.routes';
import searchRoutes from './Search/routes';


import chatRoutes from './Chat/routes';
import userRoutes from './routes/user.routes';
import followRoutes from './routes/follow.routes';
import storyRoutes from './routes/story.routes';
import blockRoutes from './routes/block.routes';

import { errorHandler, notFoundHandler } from './shared/middlewares/error.middleware';
import { initSocket } from './socket';

// Initialize express app
const app = express();
const httpServer = http.createServer(app);

// Socket.io initialization
const io = initSocket(httpServer);

// Middlewares
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" } // Allow images from backend to be loaded on frontend
}));

// Restrict CORS in production
const corsOptions = {
    origin: [environment.FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Static Files - IMPORTANT: Serve uploads directory

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.set('trust proxy', 1);


// Rate Limiting - Disabled in development
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 1000, // Increased for development - reduce to 100 for production
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    handler: (req, res, next, options) => {
        console.warn(`[RATE LIMIT] IP ${req.ip} hit the limit! Method: ${req.method}, URL: ${req.originalUrl}`);
        res.status(options.statusCode).json({ message: options.message });
    },
    skip: (req) => {
        // Skip rate limiting in development
        return environment.NODE_ENV === 'development';
    }
});
app.use('/api', limiter);

// ==========================================
// ROUTES
// ==========================================

// Auth Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/me', meRoutes); // Explicit registration to ensure match



// Feed Routes - Unified
app.use('/api/posts', postsRouter);
app.use('/api/feed', postsRouter); // Still supporting /api/feed for backward compatibility

// Profile Routes
app.use('/api/profile', ProfileRoutes);
app.use('/api/highlights', highlightRoutes);


// Friend Routes
app.use('/api/friends', friendsRoutes);


// Other Routes
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);


app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);
app.use('/api/users', followRequestsRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/block', blockRoutes);



// Health check endpoint

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', environment: environment.NODE_ENV });
});



// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

// Start server
const startServer = async () => {
    try {
        // Database connection
        await connectDB();

        httpServer.on('error', (error: any) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ FATAL: Port ${environment.PORT} is already in use.`);
                console.error(`Possible solutions:`);
                console.error(`1. Kill all node processes: 'taskkill /F /IM node.exe'`);
                console.error(`2. Check for "ghost" processes on port ${environment.PORT}`);
                process.exit(1);
            } else {
                console.error('❌ Server error:', error);
            }
        });

        httpServer.listen(environment.PORT, '0.0.0.0', () => {
            console.log(`✅ Server running on http://localhost:${environment.PORT}`);
            console.log(`✅ MongoDB connected`);
            console.log(`✅ Health check: http://localhost:${environment.PORT}/api/health`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
