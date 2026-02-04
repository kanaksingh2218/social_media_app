import mongoose from 'mongoose';
import Relationship from '../models/Relationship.model';

export type FollowStatus = 'not_following' | 'pending_sent' | 'pending_received' | 'following' | 'friends';

/**
 * Get follow status between two users
 */
export const getFollowStatus = async (currentUserId: string, targetUserId: string): Promise<FollowStatus> => {
    if (!currentUserId || !targetUserId) return 'not_following';
    if (currentUserId === targetUserId) return 'not_following'; // Or handling as self

    const currentId = new mongoose.Types.ObjectId(currentUserId);
    const targetId = new mongoose.Types.ObjectId(targetUserId);

    // Check for relationship where I am the sender
    const sentReq = await Relationship.findOne({
        sender: currentId,
        receiver: targetId,
        requestType: 'follow'
    });

    if (sentReq) {
        if (sentReq.status === 'pending') return 'pending_sent';
        if (sentReq.status === 'accepted') {
            // Check if they also follow me (Mutual = Friends)
            const receivedReq = await Relationship.findOne({
                sender: targetId,
                receiver: currentId,
                status: 'accepted',
                requestType: 'follow'
            });
            return receivedReq ? 'friends' : 'following';
        }
    }

    // Check for relationship where I am the receiver (pending request from them?)
    // Actually, 'pending_received' implies they sent me a request I haven't accepted.
    const receivedReq = await Relationship.findOne({
        sender: targetId,
        receiver: currentId,
        requestType: 'follow'
    });

    if (receivedReq && receivedReq.status === 'pending') {
        return 'pending_received';
    }

    return 'not_following';
};

/**
 * Get bulk follow statuses for strict UI rendering efficiency
 */
export const getBulkFollowStatus = async (currentUserId: string, targetUserIds: string[]): Promise<Record<string, FollowStatus>> => {
    const statuses: Record<string, FollowStatus> = {};

    if (!currentUserId || targetUserIds.length === 0) return statuses;

    const currentId = new mongoose.Types.ObjectId(currentUserId);
    const targetObjectIds = targetUserIds.map(id => new mongoose.Types.ObjectId(id));

    // Find all relationships involving current user and targets
    const relationships = await Relationship.find({
        $or: [
            { sender: currentId, receiver: { $in: targetObjectIds } },
            { sender: { $in: targetObjectIds }, receiver: currentId }
        ],
        requestType: 'follow'
    });

    for (const targetId of targetUserIds) {
        if (targetId === currentUserId) {
            statuses[targetId] = 'not_following';
            continue;
        }

        const sent = relationships.find(r =>
            r.sender.toString() === currentUserId && r.receiver.toString() === targetId
        );
        const received = relationships.find(r =>
            r.sender.toString() === targetId && r.receiver.toString() === currentUserId
        );

        if (sent?.status === 'pending') {
            statuses[targetId] = 'pending_sent';
        } else if (received?.status === 'pending') {
            statuses[targetId] = 'pending_received';
        } else if (sent?.status === 'accepted' && received?.status === 'accepted') {
            statuses[targetId] = 'friends';
        } else if (sent?.status === 'accepted') {
            statuses[targetId] = 'following';
        } else {
            statuses[targetId] = 'not_following';
        }
    }

    return statuses;
};

/**
 * Validate follow action
 */
export const validateFollowAction = (currentUserId: string, targetUserId: string) => {
    if (!currentUserId || !targetUserId) throw new Error('User IDs required');
    if (currentUserId === targetUserId) throw new Error('Cannot follow yourself');
    if (!mongoose.Types.ObjectId.isValid(currentUserId) || !mongoose.Types.ObjectId.isValid(targetUserId)) {
        throw new Error('Invalid User ID');
    }
};
