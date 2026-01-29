import nodemailer from 'nodemailer';
import environment from '../config/environment';



export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
    try {
        let transporterConfig;

        console.log('DEBUG: NODE_ENV=', environment.NODE_ENV);
        console.log('DEBUG: SMTP_EMAIL=', environment.SMTP_EMAIL ? 'Set' : 'Not Set');

        if (environment.SMTP_EMAIL && environment.SMTP_PASSWORD) {
            console.log('DEBUG: Using Gmail SMTP with App Password');
            transporterConfig = {
                service: 'gmail',
                auth: {
                    user: environment.SMTP_EMAIL,
                    pass: environment.SMTP_PASSWORD,
                },
            };
        } else if (environment.NODE_ENV === 'development') {
            console.log('DEBUG: Using Ethereal Email (Development Fallback)');
            const testAccount = await nodemailer.createTestAccount();
            transporterConfig = {
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: testAccount.user, // generated ethereal user
                    pass: testAccount.pass, // generated ethereal password
                },
            };
        } else {
            throw new Error('SMTP configuration missing for non-development environment');
        }

        const transporter = nodemailer.createTransport(transporterConfig);

        const info = await transporter.sendMail({
            from: environment.SMTP_EMAIL || '"Social Media App" <noreply@socialapp.com>',
            to,
            subject,
            text,
            html,
        });

        console.log(`Email sent to ${to}`);

        if (environment.NODE_ENV === 'development' && !process.env.SMTP_EMAIL) {
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }

    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Email sending failed');
    }
};
