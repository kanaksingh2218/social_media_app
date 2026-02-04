import mongoose from 'mongoose';
import FriendRequest from '../../Friends/FriendRequest.model';
import { AppError } from '../middlewares/error.middleware';

export class RelationshipService {
    /**
     * Check for existing requests in EITHER direction
     */
    static async checkExistingRequest(userId1: string, userId2: string) {
        return await FriendRequest.findOne({
            $or: [
                { sender: userId1, receiver: userId2 },
                { sender: userId2, receiver: userId1 }
            ],
            status: 'pending'
        }).lean();
    }

    /**
     * Create a friend request with duplicate prevention
     */
    static async createRequest(senderId: string, receiverId: string, requestType: 'friend' | 'follow' = 'friend') {
        const existing = await this.checkExistingRequest(senderId, receiverId);

        if (existing) {
            const isFromMe = existing.sender.toString() === senderId;
            throw new AppError(400, isFromMe ? 'Request already sent' : 'This user already sent you a request');
        }

        return await FriendRequest.create({
            sender: senderId,
            receiver: receiverId,
            status: 'pending',
            requestType
        });
    }

    /**
     * Cancel a request sent by current user
     */
    static async cancelRequest(senderId: string, receiverId: string) {
        // We only allow cancelling if YOU are the sender
        const deleted = await FriendRequest.findOneAndDelete({
            sender: new mongoose.Types.ObjectId(senderId),
            receiver: new mongoose.Types.ObjectId(receiverId),
            status: 'pending'
        });

        if (!deleted) {
            // Check if it failed because it doesn't exist at all, or because directions were swapped
            // But for "Cancel" we generally only want to cancel what WE sent.
            // If the user meant to "Reject" a request sent TO them, that's a different action.
            // So 404 is appropriate if no request from ME exists.

            // However, to be idempotent as per previous fix:
            return null;
        }

        return deleted;
    }
}
