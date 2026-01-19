import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.util';

export const protect = (req: any, res: Response, next: NextFunction) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        console.warn('Auth protect: No token found in headers');
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Auth protect: Token verification failed', error);
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};
