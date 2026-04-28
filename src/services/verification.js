/**
 * Email Verification Service
 * Handles verification code generation, storage, and validation
 */

/**
 * Generates a 6-digit numeric verification code
 * @returns {string} 6-digit code as string (with leading zeros preserved)
 */
export function generateVerificationCode() {
    // Generate random number between 0 and 999999
    const code = Math.floor(Math.random() * 1000000);
    // Pad with leading zeros to ensure 6 digits
    return code.toString().padStart(6, '0');
}

/**
 * Validates email format using standard email validation rules
 * Accepts emails with subdomains and plus addressing
 * Rejects emails without valid domain or with invalid characters
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email format is valid
 */
export function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    
    // Basic structure check: must have exactly one @ symbol
    const atCount = (email.match(/@/g) || []).length;
    if (atCount !== 1) return false;
    
    const parts = email.split('@');
    const localPart = parts[0];
    const domain = parts[1];
    
    // Local part (before @) must not be empty
    if (!localPart || localPart.length === 0) return false;
    
    // Domain must not be empty and must contain at least one dot
    if (!domain || domain.length === 0 || !domain.includes('.')) return false;
    
    // Domain must have content before and after the dot
    const domainParts = domain.split('.');
    for (let i = 0; i < domainParts.length; i++) {
        if (domainParts[i].length === 0) return false;
    }
    
    // Basic character validation (allow alphanumeric, dots, plus, hyphens, underscores)
    const validEmailRegex = /^[a-zA-Z0-9._+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    return validEmailRegex.test(email);
}

/**
 * Generates verification code and stores it with expiration data
 * @param {string} email - User's email address
 * @returns {{code: string, expiresAt: number, createdAt: number}} Verification data
 */
export function generateAndStoreCode(email) {
    const code = generateVerificationCode();
    const now = Date.now();
    const expiresAt = now + 15 * 60 * 1000; // 15 minutes (900000ms)
    
    const verificationData = {
        email,
        code,
        expiresAt,
        attempts: 0,
        lastResendAt: now,
        createdAt: now
    };
    
    // Store in localStorage with key format: lu_verification_{email}
    const storageKey = `lu_verification_${email}`;
    localStorage.setItem(storageKey, JSON.stringify(verificationData));
    
    return {
        code,
        expiresAt,
        createdAt: now
    };
}

/**
 * Checks if verification code has expired
 * @param {string} email - User's email address
 * @returns {boolean} True if code has expired
 */
export function isCodeExpired(email) {
    const storageKey = `lu_verification_${email}`;
    const data = localStorage.getItem(storageKey);
    
    if (!data) return true; // No verification data means expired/invalid
    
    const verificationData = JSON.parse(data);
    const now = Date.now();
    
    return now > verificationData.expiresAt;
}

/**
 * Gets remaining attempts for verification
 * @param {string} email - User's email address
 * @returns {number} Number of attempts remaining (0-5)
 */
export function getRemainingAttempts(email) {
    const storageKey = `lu_verification_${email}`;
    const data = localStorage.getItem(storageKey);
    
    if (!data) return 0; // No verification data
    
    const verificationData = JSON.parse(data);
    const maxAttempts = 5;
    const attemptsUsed = verificationData.attempts || 0;
    
    return Math.max(0, maxAttempts - attemptsUsed);
}

/**
 * Validates verification code for an email
 * @param {string} email - User's email address
 * @param {string} code - Code entered by user
 * @returns {{success: boolean, error?: string}} Result object
 */
export function verifyCode(email, code) {
    const storageKey = `lu_verification_${email}`;
    const data = localStorage.getItem(storageKey);
    
    // No verification data found
    if (!data) {
        return { success: false, error: 'wrong_code' };
    }
    
    const verificationData = JSON.parse(data);
    
    // Check if code has expired
    if (isCodeExpired(email)) {
        return { success: false, error: 'expired' };
    }
    
    // Check if too many attempts have been made
    const remainingAttempts = getRemainingAttempts(email);
    if (remainingAttempts <= 0) {
        return { success: false, error: 'too_many_attempts' };
    }
    
    // Validate the code (compare as strings to preserve leading zeros)
    const submittedCode = String(code).trim();
    const storedCode = String(verificationData.code);
    
    if (submittedCode !== storedCode) {
        // Increment attempts counter on failed verification
        verificationData.attempts = (verificationData.attempts || 0) + 1;
        localStorage.setItem(storageKey, JSON.stringify(verificationData));
        
        return { success: false, error: 'wrong_code' };
    }
    
    // Code matches and is not expired - success!
    return { success: true };
}

/**
 * Checks if a new verification code can be resent (cooldown check)
 * @param {string} email - User's email address
 * @returns {boolean} True if cooldown period has passed (60 seconds)
 */
export function canResendCode(email) {
    const storageKey = `lu_verification_${email}`;
    const data = localStorage.getItem(storageKey);
    
    if (!data) return true; // No verification data, can send
    
    const verificationData = JSON.parse(data);
    const now = Date.now();
    const cooldownPeriod = 60 * 1000; // 60 seconds (60000ms)
    const timeSinceLastResend = now - (verificationData.lastResendAt || 0);
    
    return timeSinceLastResend >= cooldownPeriod;
}

/**
 * Invalidates existing code and generates new one (resend functionality)
 * @param {string} email - User's email address
 * @returns {{success: boolean, code?: string, error?: string}} Result object
 */
export function resendCode(email) {
    // Check cooldown period
    if (!canResendCode(email)) {
        return { success: false, error: 'cooldown_active' };
    }
    
    // Generate new code and store it
    const { code, expiresAt, createdAt } = generateAndStoreCode(email);
    
    // Return success with the new code
    return { success: true, code };
}
