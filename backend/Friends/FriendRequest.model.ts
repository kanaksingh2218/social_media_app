import mongoose, { Schema, Document } from 'mongoose';

export interface IFriendRequest extends Document {
    sender: mongoose.Types.ObjectId;
    receiver: mongoose.Types.ObjectId;
    status: 'pending' | 'accepted' | 'rejected';
    requestType: 'friend' | 'follow';
    createdAt: Date;
    updatedAt: Date;
}

const FriendRequestSchema: Schema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    requestType: { type: String, enum: ['friend', 'follow'], default: 'friend' }
}, { timestamps: true });

// Prevent duplicate requests in the same direction at the database level
FriendRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true, partialFilterExpression: { status: 'pending' } });

// Business Rules Validation
FriendRequestSchema.pre('save', async function (this: any) {
    // 1. A user cannot send a friend request to themselves
    if (this.sender.equals(this.receiver)) {
        throw new Error('A user cannot send a friend request to themselves.');
    }

    // 2. Ensure only one active (pending) request exists between two users (in either direction)
    if (this.isNew || this.isModified('status')) {
        const FriendRequest = mongoose.model('FriendRequest');
        const existingRequest = await FriendRequest.findOne({
            $or: [
                { sender: this.sender, receiver: this.receiver, status: 'pending' },
                { sender: this.receiver, receiver: this.sender, status: 'pending' }
            ],
            _id: { $ne: this._id }
        });

        if (existingRequest) {
            throw new Error('A pending friend request already exists between these users.');
        }
    }
});

export default mongoose.model<IFriendRequest>('FriendRequest', FriendRequestSchema);
