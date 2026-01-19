import jwt from 'jsonwebtoken';
import environment from '../config/environment';

export const generateToken = (userId: string) => {
    return jwt.sign({ id: userId }, environment.JWT_SECRET, {
        expiresIn: environment.JWT_EXPIRE as any,
    });
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, environment.JWT_SECRET);
};
