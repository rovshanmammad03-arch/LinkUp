# Implementation Plan: Email Verification Registration

## Overview

This implementation plan breaks down the email verification registration feature into discrete coding tasks. The feature adds a verification code system to the existing registration flow, requiring users to verify their email address with a 6-digit code before their account is activated. Each task builds incrementally on previous work, with property-based tests validating correctness properties from the design document.

## Tasks

- [x] 1. Set up verification service and code generation
  - Create `src/services/verification.js` with core verification functions
  - Implement `generateVerificationCode()` function that returns 6-digit numeric string
  - Implement `generateAndStoreCode(email)` function that creates verification data with expiration
  - Implement email validation function `isValidEmail(email)` with proper format checking
  - Set up localStorage structure for verification data (`lu_verification_{email}`)
  - _Requirements: 1.1, 1.2, 1.3, 10.1, 10.2, 10.3, 10.4_

- [ ]* 1.1 Write property test for code generation
  - **Property 1: Registration Creates Complete Pending User**
  - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**
  - Test that any valid registration data creates pending user with 6-digit code, expiration set to 15 minutes, verified=false, and no session

- [ ]* 1.2 Write property test for email validation
  - **Property 10: Email Validation**
  - **Validates: Requirements 10.1, 10.4, 10.5**
  - Test that valid email formats are accepted and invalid formats are rejected without creating pending user

- [x] 2. Implement verification code validation logic
  - [x] 2.1 Create code verification functions in `src/services/verification.js`
    - Implement `verifyCode(email, code)` function with success/error responses
    - Implement `isCodeExpired(email)` function to check expiration timestamp
    - Implement `getRemainingAttempts(email)` function to track verification attempts
    - Add attempt tracking logic (max 5 attempts before requiring resend)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 2.2 Write property test for code validation logic
    - **Property 2: Code Validation Logic**
    - **Validates: Requirements 4.1, 4.2, 4.3**
    - Test that matching codes return success, non-matching codes return wrong_code error

  - [ ]* 2.3 Write property test for expired code detection
    - **Property 3: Expired Code Detection**
    - **Validates: Requirements 4.4, 7.1**
    - Test that codes with past expiration timestamps return expired error regardless of code match

  - [ ]* 2.4 Write property test for attempt limiting
    - **Property 4: Attempt Limiting**
    - **Validates: Requirements 4.5**
    - Test that after 5 failed attempts, verification is blocked until code resend

- [x] 3. Implement resend code functionality
  - [x] 3.1 Create resend logic in `src/services/verification.js`
    - Implement `resendCode(email)` function that invalidates old code and generates new one
    - Add cooldown tracking (60-second minimum between resends)
    - Implement `canResendCode(email)` function to check cooldown status
    - Reset attempt counter when new code is generated
    - _Requirements: 6.1, 6.2, 6.4, 6.5_

  - [ ]* 3.2 Write property test for resend functionality
    - **Property 7: Resend Generates Valid New Code**
    - **Validates: Requirements 6.1, 6.2, 6.4**
    - Test that resend generates new 6-digit code, invalidates old code, sets 15-minute expiration, and resets attempts

  - [ ]* 3.3 Write property test for resend cooldown
    - **Property 8: Resend Cooldown Enforcement**
    - **Validates: Requirements 6.5**
    - Test that resend requests within 60 seconds are rejected with cooldown error

- [x] 4. Update registration service to create pending users
  - [x] 4.1 Modify `src/services/db.js` to add user verification functions
    - Add `createPendingUser(userData)` function that creates user with verified=false
    - Add `activateUser(email)` function that sets verified=true and creates session
    - Add `cleanupExpiredPendingUsers()` function for 24-hour cleanup
    - Extend User model with `verified` and `createdAt` fields
    - _Requirements: 1.4, 1.5, 5.1, 5.2, 9.1, 9.2, 9.3_

  - [ ]* 4.2 Write property test for successful verification activation
    - **Property 5: Successful Verification Activates Account**
    - **Validates: Requirements 5.1, 5.2, 5.3**
    - Test that successful verification sets verified=true, creates session, and deletes verification data

  - [ ]* 4.3 Write property test for account expiration
    - **Property 9: Account Expiration and Cleanup**
    - **Validates: Requirements 9.1, 9.2, 9.3**
    - Test that pending accounts older than 24 hours are marked expired and allow re-registration

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Create email service simulator
  - Create `src/services/emailService.js` for simulated email sending
  - Implement `sendVerificationEmail(email, code)` function that logs to console
  - Add email template formatting with platform branding
  - Return success/error responses for error handling
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 7. Build VerifyEmail page component
  - [x] 7.1 Create `src/pages/VerifyEmail.jsx` component
    - Create component with props: `email`, `onVerified`, `onNavigate`
    - Add state for: code input, error message, loading, timeRemaining, canResend, resendCooldown, attemptsRemaining
    - Implement 6-digit code input field with validation
    - Display email address where code was sent
    - Add countdown timer showing time until expiration
    - Add resend button with cooldown state
    - Display remaining verification attempts
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 7.2 Implement verification submission logic
    - Add form submit handler that calls `verifyCode(email, code)`
    - Handle success: call `activateUser(email)` and trigger `onVerified` callback
    - Handle errors: display appropriate error messages (wrong_code, expired, too_many_attempts)
    - Update attempts remaining display after each attempt
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4_

  - [x] 7.3 Implement resend code functionality in component
    - Add click handler for resend button
    - Call `resendCode(email)` and handle cooldown errors
    - Update UI to show new code sent confirmation
    - Reset countdown timer to 15 minutes
    - Disable resend button during cooldown with countdown display
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 7.4 Add timer effects for expiration and cooldown
    - Implement useEffect for countdown timer (updates every second)
    - Calculate and display remaining time until code expiration
    - Implement cooldown timer for resend button
    - Auto-enable resend button when code expires
    - Clean up timers on component unmount
    - _Requirements: 3.4, 7.4_

  - [ ]* 7.5 Write property test for time calculation accuracy
    - **Property 11: Time Calculation Accuracy**
    - **Validates: Requirements 3.4, 7.4**
    - Test that remaining time and elapsed time calculations are accurate within 1 second

- [x] 8. Update Register page to integrate verification flow
  - [x] 8.1 Modify `src/pages/Register.jsx` to create pending users
    - Update registration submit handler to call `createPendingUser()` instead of creating verified user
    - Generate verification code using `generateAndStoreCode(email)`
    - Call `sendVerificationEmail(email, code)` to simulate email sending
    - Handle email send failures with error messages
    - Redirect to VerifyEmail page after successful pending user creation (do not create session)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.4_

  - [x] 8.2 Add email format validation to registration form
    - Add `isValidEmail(email)` validation before form submission
    - Display descriptive error messages for invalid email formats
    - Prevent pending user creation if email validation fails
    - _Requirements: 10.1, 10.2, 10.3, 10.5_

  - [x] 8.3 Handle duplicate email with expired pending account
    - Check for existing pending users with same email
    - If pending user is expired (>24 hours), delete old account
    - Allow new registration to proceed with fresh verification data
    - _Requirements: 9.1, 9.2, 9.3_

- [x] 9. Update Login page to prevent unverified user access
  - [x] 9.1 Modify `src/context/AuthContext.jsx` login function
    - Add verification status check in login function
    - Return `needsVerification: true` error for unverified users with correct credentials
    - Prevent session creation for unverified users
    - _Requirements: 5.5, 8.1, 8.2_

  - [x] 9.2 Update `src/pages/Login.jsx` to handle unverified users
    - Display "account not verified" error message when `needsVerification` is true
    - Add link/button to navigate to verification page
    - Provide option to resend verification code from login page
    - _Requirements: 8.2, 8.3, 8.4_

  - [ ]* 9.3 Write property test for unverified login prevention
    - **Property 6: Unverified Users Cannot Login**
    - **Validates: Requirements 5.5, 8.1**
    - Test that users with verified=false cannot login regardless of correct credentials

- [x] 10. Add internationalization for verification UI
  - Add translation keys to `public/locales/en/translation.json`
  - Add translation keys to `public/locales/az/translation.json`
  - Add translation keys to `public/locales/ru/translation.json`
  - Add translation keys to `public/locales/tr/translation.json`
  - Include keys for: verification page title, instructions, error messages, button labels, countdown text
  - _Requirements: 2.3, 3.2, 3.3, 7.1, 7.2, 8.2_

- [x] 11. Wire verification flow into App navigation
  - [x] 11.1 Update `src/App.jsx` to add VerifyEmail route
    - Import VerifyEmail component
    - Add route for 'verify-email' page
    - Pass email prop from registration state
    - Handle onVerified callback to navigate to dashboard/onboarding
    - _Requirements: 3.1, 5.4_

  - [x] 11.2 Test complete registration flow end-to-end
    - Test: Register → Receive code → Verify → Dashboard
    - Test: Register → Wrong code → Error → Resend → Verify → Dashboard
    - Test: Register → Expired code → Resend → Verify → Dashboard
    - Test: Register → Too many attempts → Resend → Verify → Dashboard
    - Test: Register → Try login before verify → Error → Verify → Login → Dashboard
    - _Requirements: All requirements integrated_

- [x] 12. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- Unit tests (not marked with `*`) validate specific examples and component behavior
- The implementation uses JavaScript (React with JSX) to match the existing codebase
- Email sending is simulated via console logging for development (production would use real email service)
- All verification data is stored in localStorage (production would use backend database)
- Checkpoints ensure incremental validation and provide opportunities for user feedback
