import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
    post: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    text: string;
    parentComment?: mongoose.Types.ObjectId;
    replyCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const CommentSchema: Schema = new Schema({
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, maxlength: 1000 },
    parentComment: { type: Schema.Types.ObjectId, ref: 'Comment', default: null, index: true },
    replyCount: { type: Number, default: 0 }
}, { timestamps: true });

// Index for efficient retrieval of comments for a specific post
CommentSchema.index({ post: 1, createdAt: -1 });

export default mongoose.model<IComment>('Comment', CommentSchema);
