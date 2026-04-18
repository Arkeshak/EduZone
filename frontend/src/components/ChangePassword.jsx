/**
 * CHANGE PASSWORD COMPONENT
 * 
 * File Purpose: Modal/form for users to change their account password
 * Used for: Security management, password updates for logged-in users
 * 
 * Features:
 * - Current password input (for verification)
 * - New password input with strength validation
 * - Confirm password input
 * - Show/hide password toggles
 * - Loading state during submission
 * - Success/error messages
 * 
 * Validation:
 * - Current password must match
 * - New password must meet strength requirements (8 chars, upper, lower, number, special)
 * - Passwords must match
 * 
 * Usage: Can be embedded in user profile page or opened as modal/dialog
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, Save, X } from 'lucide-react';
import { authApi } from '@/services/authService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { validatePassword } from '@/utils/passwordValidation';

const ChangePassword = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        const passwordError = validatePassword(formData.newPassword);
        if (passwordError) {
            toast.error(passwordError);
            return;
        }

        setLoading(true);
        try {
            await authApi.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            toast.success("Password changed successfully");
            setIsOpen(false);
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            /* 
              CHANGE PASSWORD TOGGLE BUTTON
              Purpose: Open the change password form/modal
              When closed: Shows button to open the form
              Icon: Lock icon + text "Change Password"
              Color: Outlined (secondary button style)
              Size: Full width on mobile, auto on desktop (sm:w-auto)
              Action: Click to open change password card
              Used for: Security management in user profile
            */
            <Button variant="outline" onClick={() => setIsOpen(true)} className="w-full sm:w-auto">
                <Lock className="w-4 h-4 mr-2" /> Change Password
            </Button>
        );
    }

return (
    <Card className="mt-6 border-blue-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            {/* Form title */}
            <CardTitle className="text-lg font-medium">Change Password</CardTitle>
            {/* 
                  CLOSE BUTTON (Form Header)
                  Purpose: Close the change password form
                  Icon: X icon
                  Action: Click to close form and reset state
                  Location: Top right of card
                  Used for: Dismissing the form without saving
                */}
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="w-4 h-4" />
            </Button>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Current Password</label>
                    {/* 
                          CURRENT PASSWORD INPUT FIELD
                          Purpose: Verify user identity before allowing password change
                          Type: Password (hidden by default) with show/hide toggle
                          Icon: None (uses standard eye toggle)
                          Validation: Required field, must match user's current password
                          Toggle: Eye icon on right - click to show/hide password
                          Action on change: Updates formData.currentPassword state
                          Action on toggle: Switches between text and password input type
                          Used for: Security verification before allowing password change
                        */}
                    <div className="relative">
                        <Input
                            type={showCurrentPassword ? "text" : "password"}
                            value={formData.currentPassword}
                            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                            required
                        />
                        {/* Show/hide password toggle button */}
                        <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                        >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">New Password</label>
                    {/* 
                          NEW PASSWORD INPUT FIELD
                          Purpose: Collect new password from user
                          Type: Password (hidden by default) with show/hide toggle
                          Icon: None (uses standard eye toggle)
                          Validation: Required, must meet strength requirements:
                          - Minimum 8 characters
                          - At least 1 uppercase letter
                          - At least 1 lowercase letter
                          - At least 1 number
                          - At least 1 special character
                          Toggle: Eye icon on right - click to show/hide password
                          Action on change: Updates formData.newPassword state
                          Action on toggle: Switches between text and password input type
                          Helper text: Shows password requirements below field
                          Used for: Setting new password for account
                        */}
                    <div className="relative">
                        <Input
                            type={showNewPassword ? "text" : "password"}
                            value={formData.newPassword}
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                            required
                        />
                        {/* Show/hide password toggle button */}
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                        >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {/* Password requirements helper text */}
                    <p className="text-xs text-gray-500">
                        Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Confirm New Password</label>
                    {/* 
                          CONFIRM NEW PASSWORD INPUT FIELD
                          Purpose: Verify new password matches (prevent typos)
                          Type: Password (hidden by default) with show/hide toggle
                          Icon: None (uses standard eye toggle)
                          Validation: Required, must match new password field
                          Toggle: Eye icon on right - click to show/hide password
                          Action on change: Updates formData.confirmPassword state
                          Action on toggle: Switches between text and password input type
                          Used for: Confirming password was entered correctly
                        */}
                    <div className="relative">
                        <Input
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                        />
                        {/* Show/hide password toggle button */}
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                        >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    {/* 
                          CANCEL BUTTON (Form Footer)
                          Purpose: Close the form without saving changes
                          Color: Ghost (transparent/secondary)
                          Action: Click to close form
                          Used for: User decides not to change password
                        */}
                    <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                    {/* 
                          UPDATE PASSWORD BUTTON (Form Submit)
                          Purpose: Save new password and complete change
                          Color: Blue (primary/standard color)
                          States:
                          - Normal: Blue, clickable
                          - Loading: Shows "Updating..." text, disabled
                          Validation before submit:
                          - Current password must be provided and correct
                          - New password must meet strength requirements
                          - Passwords must match
                          Action: Click to submit password change
                          Result on success: Success toast shown, form closes, password updated
                          Result on failure: Error toast message shown with reason
                          Used for: Main action to save password change
                        */}
                    <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                        {loading ? 'Updating...' : 'Update Password'}
                    </Button>
                </div>
            </form>
        </CardContent>
    </Card>
);
};

export default ChangePassword;
