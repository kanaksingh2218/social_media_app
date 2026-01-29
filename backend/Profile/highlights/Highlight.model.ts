import mongoose, { Schema, Document } from 'mongoose';

export interface IHighlight extends Document {
    user: mongoose.Types.ObjectId;
    title: string;
    coverImage: string;
    posts: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const HighlightSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    coverImage: { type: String, default: '' },
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
}, { timestamps: true });

export default mongoose.model<IHighlight>('Highlight', HighlightSchema);
