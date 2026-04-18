/**
 * RESET PASSWORD PAGE
 * 
 * File Purpose: Set new password using reset token from email
 * Used for: Completing password reset process
 * 
 * Features:
 * - Enter new password
 * - Confirm password
 * - Password strength validation
 * - Show/hide password toggle
 * - Success confirmation
 * - Redirect to login
 * 
 * URL: /reset-password/:token (token from email link)
 * Flow: User clicks email link → Redirected here → Enter new password → Password updated → Redirect to login
 */

import { useState } from 'react';
import { validatePassword } from '@/utils/passwordValidation';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { authApi } from '@/services/authService';

const ResetPassword = () => {
    const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        const passwordError = validatePassword(formData.password);
        if (passwordError) {
            toast.error(passwordError);
            return;
        }

        setLoading(true);

        try {
            await authApi.resetPassword(token, formData.password);

            setLoading(false);
            setSuccess(true);
            toast.success('Password reset successfully');
        } catch (err) {
            setLoading(false);
            toast.error(err.response?.data?.message || 'Failed to reset password');
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                {/* 
                  SUCCESS SCREEN
                  Purpose: Confirm password was reset successfully
                  Elements:
                  - Green checkmark icon
                  - Success heading
                  - Message with next steps
                  - Button to proceed to login
                  Used for: Confirming password reset completed
                */}
                <Card className="max-w-md w-full text-center">
                    <CardHeader>
                        {/* Green checkmark icon indicating success */}
                        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <CardTitle>Password Reset Complete</CardTitle>
                        {/* Instructions for next step */}
                        <CardDescription>
                            Your password has been successfully updated. You can now login with your new password.
                        </CardDescription>
                    </CardHeader>
                    {/* 
                      PROCEED TO LOGIN BUTTON
                      Purpose: Navigate to login page after password reset
                      Action: Click to go to login
                      Used for: User to login with new password
                    */}
                    <CardFooter>
                        <Button className="w-full" asChild>
                            <Link to="/login">Proceed to Login</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            {/* 
              RESET PASSWORD FORM
              Purpose: Allow user to set new password
              Fields:
              - New Password (required)
              - Confirm Password (required)
              - Both have show/hide toggle
              - Password validation applied
              Used for: Completing password reset process after email link
            */}
            <Card className="max-w-md w-full">
                <CardHeader>
                    {/* Form heading and description */}
                    <CardTitle>Set New Password</CardTitle>
                    <CardDescription>
                        Create a robust password to secure your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none" htmlFor="password">
                                New Password
                            </label>
                            {/* 
                              NEW PASSWORD INPUT FIELD
                              Purpose: Collect new password from user
                              Icon: Lock icon on left
                              Type: Password (hidden by default) with show/hide toggle
                              Toggle: Eye icon on right - click to show/hide password
                              Validation: Required field, password strength checked
                              Action on change: Updates formData.password state
                              Action on toggle: Switches between text and password input type
                              Used for: Setting new password for account
                            */}
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="enter your password...."
                                    className="pl-9 pr-10"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                                {/* Show/hide password toggle button */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none" htmlFor="confirmPassword">
                                Confirm Password
                            </label>
                            {/* 
                              CONFIRM PASSWORD INPUT FIELD
                              Purpose: Verify new password matches (prevent typos)
                              Icon: Lock icon on left
                              Type: Password (hidden by default) with show/hide toggle
                              Toggle: Eye icon on right - click to show/hide password
                              Validation: Required field, must match password field
                              Action on change: Updates formData.confirmPassword state
                              Action on toggle: Switches between text and password input type
                              Used for: Confirming password was entered correctly
                            */}
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="enter your confirm password...."
                                    className="pl-9 pr-10"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                />
                                {/* Show/hide password toggle button */}
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        {/* 
                          RESET PASSWORD BUTTON (Main Submit Button)
                          Purpose: Submit new password and complete reset
                          Color: Blue (primary/standard color)
                          Size: Full width
                          States:
                          - Normal: Blue, clickable
                          - Loading: Shows "Reseting Password..." text, disabled
                          Validation before submit:
                          - Passwords must match
                          - Password must meet strength requirements
                          Action: Click to submit password reset
                          Result on success: Shows success screen
                          Result on failure: Error toast message shown
                          Used for: Main action to complete password reset
                        */}
                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading ? 'Reseting Password...' : 'Reset Password'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center border-t p-4 mt-2">
                    {/* 
                      BACK TO LOGIN LINK (Footer)
                      Purpose: Navigate back to login page
                      Location: Bottom of form
                      Icon: Left arrow
                      Text: "Back to Login"
                      Action: Click to go back to login
                      Used for: User wants to login after password reset or if they realize they don't need password reset
                    */}
                    <Link to="/login" className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
};

export default ResetPassword;
