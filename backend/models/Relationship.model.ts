import mongoose, { Schema, Document } from 'mongoose';

export interface IRelationship extends Document {
    sender: mongoose.Types.ObjectId;
    receiver: mongoose.Types.ObjectId;
    status: 'pending' | 'accepted' | 'rejected';
    requestType: 'follow' | 'friend';
    createdAt: Date;
    updatedAt: Date;
}

const RelationshipSchema: Schema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    requestType: {
        type: String,
        enum: ['follow', 'friend'],
        default: 'follow'
    }
}, { timestamps: true });

// Compound unique index to prevent duplicates
RelationshipSchema.index({ sender: 1, receiver: 1, requestType: 1 }, { unique: true });

// Indexes for fast queries
RelationshipSchema.index({ sender: 1, status: 1 });
RelationshipSchema.index({ receiver: 1, status: 1 });

export default mongoose.model<IRelationship>('Relationship', RelationshipSchema);
