import mongoose from 'mongoose';
import Relationship from '../../models/Relationship.model';
import { AppError } from '../middlewares/error.middleware';

export class RelationshipService {
    /**
     * Check for existing requests in EITHER direction (for friends) or specific direction (for follow)
     * For 'friend' type, we check both directions because friendship is mutual.
     * For 'follow' type, we check if sender -> receiver already exists.
     */
    static async checkExistingRequest(senderId: string, receiverId: string, type: 'friend' | 'follow' = 'friend') {
        if (type === 'friend') {
            return await Relationship.findOne({
                $or: [
                    { sender: senderId, receiver: receiverId, requestType: 'friend' },
                    { sender: receiverId, receiver: senderId, requestType: 'friend' }
                ],
                status: 'pending'
            }).lean();
        } else {
            return await Relationship.findOne({
                sender: senderId,
                receiver: receiverId,
                requestType: 'follow',
                status: { $in: ['pending', 'accepted'] } // Check if already following or requested
            }).lean();
        }
    }

    /**
     * Create a relationship request with duplicate prevention
     */
    static async createRequest(senderId: string, receiverId: string, requestType: 'friend' | 'follow' = 'friend') {
        const existing = await this.checkExistingRequest(senderId, receiverId, requestType);

        if (existing) {
            const isFromMe = existing.sender.toString() === senderId.toString();

            if (requestType === 'follow' && existing.status === 'accepted') {
                throw new AppError(400, 'Already following this user');
            }

            throw new AppError(400, isFromMe ? 'Request already sent' : 'This user already sent you a request');
        }

        return await Relationship.create({
            sender: senderId,
            receiver: receiverId,
            status: 'pending', // Default to pending, controller handles 'accepted' if public
            requestType
        });
    }

    /**
     * Cancel a request sent by current user
     */
    static async cancelRequest(senderId: string, receiverId: string) {
        // We only allow cancelling if YOU are the sender
        const deleted = await Relationship.findOneAndDelete({
            sender: new mongoose.Types.ObjectId(senderId),
            receiver: new mongoose.Types.ObjectId(receiverId),
            status: 'pending'
        });

        // Loophole: If it was a 'friend' request, we might want to be more flexible, 
        // but typically 'cancel' implies 'I sent it, I cancel it'. 
        // 'Rejecting' is for when someone sent it to YOU.

        return deleted;
    }
}
