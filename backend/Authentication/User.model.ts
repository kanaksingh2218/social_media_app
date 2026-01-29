import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    fullName: string;
    bio: string;
    profilePicture: string;
    coverPhoto: string;
    website: string;
    followers: mongoose.Types.ObjectId[];
    following: mongoose.Types.ObjectId[];
    friends: mongoose.Types.ObjectId[];
    isPrivate: boolean;
    resetPasswordToken?: string;
    resetPasswordExpire?: Date;
    comparePassword(password: string): Promise<boolean>;
    getResetPasswordToken(): string;
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    fullName: { type: String, required: true },
    bio: { type: String, default: '' },
    profilePicture: { type: String, default: '' },
    coverPhoto: { type: String, default: '' },
    website: { type: String, default: '' },
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isPrivate: { type: Boolean, default: false },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, { timestamps: true });

UserSchema.pre('save', async function (this: IUser) {
    if (!this.isModified('password')) return;

    try {
        console.log('Hashing password for user:', this.username);
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error: any) {
        console.error('Password hashing failed:', error);
        throw error;
    }
});

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function (this: IUser) {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire
    this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

    return resetToken;
};

// Add a virtual for 'id' to ensure both 'id' and '_id' work seamlessly
UserSchema.virtual('id').get(function (this: any) {
    return this._id.toHexString();
});

UserSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        return ret;
    }
});

export default mongoose.model<IUser>('User', UserSchema);
