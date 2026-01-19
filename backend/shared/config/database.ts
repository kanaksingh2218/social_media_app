import mongoose from 'mongoose';
import environment from './environment';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(environment.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error: ${error.message}`);
        } else {
            console.error('An unknown error occurred during database connection');
        }
        process.exit(1);
    }
};

export default connectDB;
