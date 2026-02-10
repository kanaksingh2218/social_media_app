import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import environment from './shared/config/environment';
import jwt from 'jsonwebtoken';

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
    io = new Server(httpServer, {
        cors: { origin: environment.FRONTEND_URL, methods: ['GET', 'POST'] },
    });

    // Middleware for authentication
    io.use((socket: any, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('Authentication error'));

        try {
            const decoded = jwt.verify(token, environment.JWT_SECRET);
            socket.userId = (decoded as any).id;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket: any) => {
        console.log('User connected:', socket.userId);

        // Join user's own room for private notifications
        socket.join(socket.userId);
        console.log(`User ${socket.userId} joined their room`);

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
