import axios from 'axios';

// Base URL for the SCMS backend API
const API_BASE_URL = 'http://localhost:8081/api/v1';

/**
 * SCMS Authentication & Password Reset API Service
 * 
 * Note: During development, emails containing OTP codes are captured by Mailpit.
 * Developers can inspect sent emails at: http://localhost:8025
 */
export const authApi = {
  /**
   * Step 1: Request Password Reset Code
   * Sends an OTP verification code to the user's email address if an account exists.
   * 
   * @param {string} email - The user's registered email address.
   * @returns {Promise} Resolves with standard success message (HTTP 200).
   */
  requestResetCode: async (email) => {
    return await axios.post(`${API_BASE_URL}/password-reset/request`, {
      email,
    });
  },

  /**
   * Step 2: Verify OTP
   * Validates the 6-digit OTP code sent to the user's email.
   * 
   * @param {string} email - The user's registered email address.
   * @param {string} code - The 6-digit verification code received via email.
   * @returns {Promise} Resolves with response containing short-lived { resetToken } (HTTP 200).
   */
  verifyOtpCode: async (email, code) => {
    return await axios.post(`${API_BASE_URL}/password-reset/verify-code`, {
      email,
      code,
    });
  },

  /**
   * Step 3: Complete Password Reset
   * Submits the new password along with the short-lived reset token obtained from Step 2.
   * 
   * @param {string} email - The user's email address.
   * @param {string} resetToken - The short-lived token returned by verifyOtpCode.
   * @param {string} newPassword - The user's new desired password.
   * @param {string} confirmPassword - Must match newPassword.
   * @returns {Promise} Resolves with success confirmation (HTTP 200).
   */
  completePasswordReset: async (
    email,
    resetToken,
    newPassword,
    confirmPassword
  ) => {
    return await axios.post(`${API_BASE_URL}/password-reset/complete`, {
      email,
      resetToken,
      newPassword,
      confirmPassword,
    });
  },

  /**
   * Step 4: Login with New Password
   * Standard authentication endpoint to verify credentials and retrieve a JWT token.
   * 
   * @param {string} email - Registered user email.
   * @param {string} password - User password.
   * @returns {Promise} Resolves with authentication JWT token response.
   */
  login: async (email, password) => {
    return await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
    });
  },
};