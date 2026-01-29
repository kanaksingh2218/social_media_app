import { Request, Response } from 'express';
import User from '../User.model';
import crypto from 'crypto';
import { sendEmail } from '../../shared/utils/email.util';
import environment from '../../shared/config/environment';

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (user) {
            // Generate reset token using model method
            const resetToken = user.getResetPasswordToken();
            await user.save({ validateBeforeSave: false });

            console.log('DEBUG: Generated Reset Token:', resetToken);
            const resetUrl = `${environment.FRONTEND_URL}/reset-password/${resetToken}`;
            console.log('DEBUG: Generated Reset URL:', resetUrl);

            const message = `Reset your password using this link:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;

            const html = `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #e1306c; text-align: center;">Instagram Password Reset</h2>
                    <p>Hello,</p>
                    <p>You are receiving this email because you (or someone else) requested a password reset for your account.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #0095f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
                    </div>
                    <p>Or copy and paste this link in your browser:</p>
                    <p style="word-break: break-all;"><a href="${resetUrl}">${resetUrl}</a></p>
                    <p>This link will expire in 10 minutes.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #777; text-align: center;">Social Media App</p>
                </div>
            `;

            try {
                await sendEmail(user.email, 'Password Reset Token', message, html);
                return res.status(200).json({ message: 'Email sent' });
            } catch (error) {
                user.resetPasswordToken = undefined;
                user.resetPasswordExpire = undefined;
                await user.save({ validateBeforeSave: false });
                return res.status(500).json({ message: 'Email could not be sent' });
            }
        }

        // Security: Don't reveal if user exists
        res.status(200).json({ message: 'If an account exists, email sent' });

    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const token = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
