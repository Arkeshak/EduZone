/**
 * PASSWORD VALIDATION UTILITY
 * 
 * File Purpose: Validate password strength requirements
 * Used in: Registration, password change, password reset forms
 * 
 * Password Requirements:
 * 1. Minimum 8 characters
 * 2. At least one uppercase letter (A-Z)
 * 3. At least one lowercase letter (a-z)
 * 4. At least one number (0-9)
 * 5. At least one special character (!@#$%^&*)
 * 
 * Examples of valid passwords:
 * - MyPassword123!
 * - Teacher@2024
 * - Donate$500now
 * 
 * Examples of invalid passwords:
 * - "short" (too short, no caps, no numbers, no special chars)
 * - "password" (no caps, no numbers, no special chars)
 * - "Password1" (no special characters)
 * - "Password!" (no numbers)
 */

/**
 * VALIDATE PASSWORD FUNCTION
 * 
 * Purpose: Check if password meets all security requirements
 * 
 * Input:
 * - password: String to validate
 * 
 * Returns:
 * - null: Password is valid and meets all requirements
 * - String: Error message describing what's wrong
 * 
 * Usage:
 * const error = validatePassword(userInput);
 * if (error) {
 *   showErrorMessage(error);  // Show specific requirement that failed
 * } else {
 *   submitForm();  // Password is strong, safe to submit
 * }
 * 
 * Real-world example (from form):
 * const [password, setPassword] = useState('');
 * const [error, setError] = useState('');
 * 
 * const handlePasswordChange = (e) => {
 *   const pwd = e.target.value;
 *   setPassword(pwd);
 *   setError(validatePassword(pwd) || '');  // Update error as user types
 * };
 */
export const validatePassword = (password) => {
    // Define all validation rules
    const minLength = 8;

    // Check regex patterns for each requirement
    // /[A-Z]/ matches: any uppercase letter
    const hasUpperCase = /[A-Z]/.test(password);

    // /[a-z]/ matches: any lowercase letter
    const hasLowerCase = /[a-z]/.test(password);

    // /[0-9]/ matches: any digit
    const hasNumber = /[0-9]/.test(password);

    // /[!@#$%^&*]/ matches: special characters in this set
    const hasSpecialChar = /[!@#$%^&*]/.test(password);

    // Check each requirement in order and return first error found
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

    // All requirements met - password is valid
    return null;
};
