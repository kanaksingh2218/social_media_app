import mongoose, { Schema, Document } from 'mongoose';

export interface IFollowRequest extends Document {
    from: mongoose.Types.ObjectId;
    to: mongoose.Types.ObjectId;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: Date;
}

const followRequestSchema = new Schema({
    from: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    to: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent duplicate requests
followRequestSchema.index({ from: 1, to: 1 }, { unique: true });

// Index for faster queries
followRequestSchema.index({ to: 1, status: 1 });

export default mongoose.model<IFollowRequest>('FollowRequest', followRequestSchema);
