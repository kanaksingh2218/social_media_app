import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
    author: mongoose.Types.ObjectId;
    content?: string;
    images: string[];
    likes: mongoose.Types.ObjectId[];
    commentCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const PostSchema: Schema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String, trim: true, maxlength: 2000 },
    images: {
        type: [String],
        validate: {
            validator: function (v: string[]) {
                return v && v.length > 0;
            },
            message: 'A post must have at least one image.'
        }
    },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    commentCount: { type: Number, default: 0 },
}, { timestamps: true });

// Index for efficient feed filtering and sorting
PostSchema.index({ author: 1, createdAt: -1 });
// Text index for content search
PostSchema.index({ content: 'text' });

export default mongoose.model<IPost>('Post', PostSchema);
