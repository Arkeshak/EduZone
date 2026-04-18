/**
 * FORGOT PASSWORD PAGE
 * 
 * File Purpose: Allow users to reset forgotten passwords
 * Used for: Password recovery via email
 * 
 * Features:
 * - Enter email address
 * - Send password reset link to email
 * - Success message showing email  
 * - Link to return to login
 * 
 * Flow: Enter email → Submit → Receive reset email → Click link in email → Go to ResetPassword page
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { authApi } from '@/services/authService';
import eduBg from '../assets/education_hero.png';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await authApi.forgotPassword(email);
            setLoading(false);
            setSubmitted(true);
            toast.success('Reset link sent to your email');
        } catch (err) {
            console.error(err);
            setLoading(false);
            toast.error(err.response?.data?.message || 'Failed to send reset link');
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen relative flex items-center justify-center p-4">
                {/* Background Image & Overlay */}
                <div className="absolute inset-0 z-0">
                    <img src={eduBg} alt="Background" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 to-slate-900/90 backdrop-blur-sm"></div>
                </div>

                {/* 
                  SUCCESS MESSAGE SCREEN
                  Purpose: Confirm password reset email was sent
                  Elements:
                  - Green success icon (checkmark)
                  - Heading: "Check your email"
                  - Message: Shows email where link was sent
                  - Buttons: Try another email, Back to Login
                  Used for: Confirming email was sent successfully
                */}
                <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[2rem] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] max-w-md w-full text-center relative z-10 animate-in fade-in zoom-in">
                    {/* 
                      SUCCESS ICON
                      Purpose: Visual indicator of successful action
                      Color: Green circle with checkmark
                      Used for: Quick visual confirmation
                    */}
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
                        <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    {/* Success heading and message */}
                    <h2 className="text-3xl font-bold text-white mb-2">Check your email</h2>
                    {/* Shows email address for confirmation */}
                    <p className="text-slate-300 mb-6 font-medium">
                        We have sent a password reset link to <br /><span className="text-white font-bold">{email}</span>
                    </p>

                    <div className="space-y-3">
                        {/* 
                          TRY ANOTHER EMAIL BUTTON
                          Purpose: Go back to forgot password form
                          Action: Click to reset form and try different email
                          Used for: User wants to send reset to different email
                        */}
                        <Button variant="ghost" className="w-full h-12 text-slate-300 hover:text-white hover:bg-white/5" onClick={() => setSubmitted(false)}>
                            Try another email
                        </Button>
                        {/* 
                          BACK TO LOGIN LINK
                          Purpose: Navigate back to login page
                          Action: Click to return to login
                          Used for: User wants to login after requesting password reset
                        */}
                        <Link to="/login" className="block text-sm text-slate-400 hover:text-white transition-colors pt-2">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4">
            {/* Background Image & Overlay */}
            <div className="absolute inset-0 z-0">
                <img src={eduBg} alt="Background" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 to-slate-900/90 backdrop-blur-sm"></div>
            </div>

            <div className="max-w-md w-full relative z-10 animate-in fade-in zoom-in duration-500">
                {/* 
                  BACK TO LOGIN LINK
                  Purpose: Navigate back to login page
                  Location: Top left, above form
                  Icon: Left arrow
                  Action: Click to go back to login
                  Used for: Users who remember password or want to try login instead
                */}
                <Link to="/login" className="inline-flex items-center text-sm text-slate-300 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                </Link>

                <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 p-8 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                    {/* 
                      PAGE HEADER
                      Purpose: Display title and instructions
                      Elements:
                      - Icon: Alert/help icon in indigo circle
                      - Heading: "Forgot Password?"
                      - Description: Instructions to enter email
                      Used for: Explaining what page is for
                    */}
                    <div className="text-center mb-8">
                        {/* Icon with animation on hover */}
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-6 shadow-lg shadow-indigo-600/30 rotate-3 transform hover:scale-110 transition-transform">
                            <AlertCircle className="w-8 h-8 text-white" />
                        </div>
                        {/* Heading */}
                        <h1 className="text-3xl font-bold text-white mb-2">Forgot Password?</h1>
                        {/* Instructions */}
                        <p className="text-slate-300">Enter your email to reset your password</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1" htmlFor="email">
                                Email Address
                            </label>
                            {/* 
                              EMAIL INPUT FIELD
                              Purpose: Collect email for password reset
                              Icon: Mail icon inside input on left
                              Validation: Required field, must be valid email
                              Action: On change, updates email state
                              Used for: Finding user account to reset password
                            */}
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-white transition-colors" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="enter your email...."
                                    className="pl-12 pr-4 py-6 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:border-white/30"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        {/* 
                          SEND RESET LINK BUTTON
                          Purpose: Submit email and send password reset link
                          Color: Indigo (default/universal color)
                          Size: Full width
                          States:
                          - Normal: Indigo, clickable, raised on hover
                          - Loading: Shows "Sending Link..." text
                          - Hover: Brighter indigo, slightly raised
                          Action: Click to request password reset
                          Result on success: Shows success screen with email confirmation
                          Result on failure: Error toast message shown
                          Used for: Main action to initiate password reset
                        */}
                        <Button className="w-full h-12 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg rounded-xl transition-all hover:-translate-y-0.5" type="submit" disabled={loading}>
                            {loading ? 'Sending Link...' : 'Send Reset Link'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
