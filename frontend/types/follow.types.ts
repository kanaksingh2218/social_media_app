export type FollowStatus =
    | 'none'
    | 'requested'
    | 'pending_acceptance'
    | 'following'
    | 'self'
    | 'loading'
    | 'error';

export interface Relationship {
    _id: string;
    sender: string;
    receiver: string;
    status: 'pending' | 'accepted' | 'rejected';
    requestType: 'follow' | 'friend';
    createdAt: string;
    updatedAt: string;
}

export interface User {
    _id: string;
    id?: string;
    fullName: string;
    username: string;
    avatar?: string;
    email?: string;
}

export interface FollowButtonProps {
    userId: string;
    initialStatus?: FollowStatus;
    onSuccess?: () => void;
    size?: 'small' | 'medium' | 'large';
    variant?: 'primary' | 'secondary';
}

export interface FollowListItem extends User {
    followStatus?: FollowStatus;
}

export interface FollowResponse {
    success: boolean;
    message: string;
    relationship?: Relationship;
    isFriend?: boolean;
    isPending?: boolean;
    status: string;
}

export interface FollowStatusResponse {
    success: boolean;
    status: FollowStatus;
}

export interface BulkFollowStatusResponse {
    success: boolean;
    statuses: Record<string, FollowStatus>;
}

export interface FollowListResponse {
    success: boolean;
    count: number;
    followers?: User[];
    following?: User[];
}

export interface PendingRequestsResponse {
    success: boolean;
    count: number;
    requests: Relationship[];
}
