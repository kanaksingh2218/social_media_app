import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    recipient: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    type: 'like' | 'comment' | 'friend_request' | 'follow';
    post?: mongoose.Types.ObjectId;
    message?: string;
    read: boolean;
}

const NotificationSchema: Schema = new Schema({
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['like', 'comment', 'friend_request', 'follow'], required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    message: { type: String },
    read: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<INotification>('Notification', NotificationSchema);
