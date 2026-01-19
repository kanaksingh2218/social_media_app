import dotenv from 'dotenv';

dotenv.config();

interface Environment {
    PORT: number;
    MONGODB_URI: string;
    JWT_SECRET: string;
    JWT_EXPIRE: string;
    NODE_ENV: string;
    FRONTEND_URL: string;
}

const environment: Environment = {
    PORT: parseInt(process.env.PORT || '5000', 10),
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/social-media',
    JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
    NODE_ENV: process.env.NODE_ENV || 'development',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
};

// Validate required environment variables
const requiredVars: (keyof Environment)[] = ['MONGODB_URI', 'JWT_SECRET'];
requiredVars.forEach((varName) => {
    if (!process.env[varName] && environment.NODE_ENV === 'production') {
        console.warn(`WARNING: Environment variable ${varName} is missing!`);
    }
});

export default environment;
