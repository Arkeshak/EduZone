/**
 * PASSWORD VALIDATION UTILITY
 * 
 * Purpose: Checks if a password is strong enough based on strict security rules.
 * Requirements: 8+ chars, Uppercase, Lowercase, Number, and Special Character.
 */
export const validatePassword = (password) => {
    const minLength = 8;

    // REGEX CHECKS: Each line tests one specific requirement
    const hasUpperCase = /[A-Z]/.test(password); // Contains A-Z
    const hasLowerCase = /[a-z]/.test(password); // Contains a-z
    const hasNumber = /[0-9]/.test(password);    // Contains 0-9
    const hasSpecialChar = /[!@#$%^&*]/.test(password); // Contains special symbols

    // RUN THE CHECKS: Returns a friendly error message if any check fails
    if (password.length < minLength) {
        return "Password must be at least 8 characters long.";
    }
    if (!hasUpperCase) {
        return "Password must contain at least one uppercase letter.";
    }
    if (!hasLowerCase) {
        return "Password must contain at least one lowercase letter.";
    }
    if (!hasNumber) {
        return "Password must contain at least one number.";
    }
    if (!hasSpecialChar) {
        return "Password must contain at least one special character (!@#$%^&*).";
    }

    // Success: Returns null if everything is correct
    return null;
};
