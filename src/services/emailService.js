/**
 * Email Service Simulator
 * Simulates email sending for development environment
 * In production, this would integrate with a real email service (SendGrid, AWS SES, Mailgun)
 */

/**
 * Simulates sending verification email to user
 * Logs email content to console for development/testing
 * @param {string} email - Recipient email address
 * @param {string} code - 6-digit verification code
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendVerificationEmail(email, code) {
    try {
        // Validate inputs
        if (!email || typeof email !== 'string') {
            return { success: false, error: 'invalid_email' };
        }
        
        if (!code || typeof code !== 'string' || code.length !== 6) {
            return { success: false, error: 'invalid_code' };
        }
        
        // Format email template with platform branding
        const emailTemplate = formatVerificationEmail(email, code);
        
        // Simulate email sending by logging to console
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 SIMULATED EMAIL SENT');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(emailTemplate);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // Simulate async email sending delay
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return { success: true };
    } catch (error) {
        console.error('Email service error:', error);
        return { success: false, error: 'email_send_failed' };
    }
}

/**
 * Formats verification email template with platform branding
 * @param {string} email - Recipient email address
 * @param {string} code - 6-digit verification code
 * @returns {string} Formatted email content
 */
function formatVerificationEmail(email, code) {
    return `
To: ${email}
From: LinkUp <noreply@linkup.az>
Subject: Verify Your LinkUp Account

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Welcome to LinkUp! 🎉

Thank you for registering. To complete your account setup, please verify your email address.

Your verification code is:

    ${code}

This code will expire in 15 minutes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Instructions:
1. Enter this code on the verification page
2. If you didn't request this code, please ignore this email
3. Need a new code? Click the "Resend Code" button on the verification page

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Best regards,
The LinkUp Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
}
