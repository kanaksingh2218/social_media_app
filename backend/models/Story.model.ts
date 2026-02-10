import mongoose, { Schema, Document } from 'mongoose';

export interface IStory extends Document {
    user: mongoose.Types.ObjectId;
    image: string;
    viewers: mongoose.Types.ObjectId[];
    createdAt: Date;
    expiresAt: Date;
}

const StorySchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    image: { type: String, required: true },
    viewers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

// TTL Index: Expires after 24 hours (86400 seconds)
StorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export default mongoose.model<IStory>('Story', StorySchema);
