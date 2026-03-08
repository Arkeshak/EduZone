import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { authApi } from '@/services/authService';
import { validatePassword } from '@/utils/passwordValidation';

const ActivateAccount = () => {
    const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { token } = useParams();

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
            await authApi.activateAccount({ token, password: formData.password });
            setSuccess(true);
            toast.success('Account activated successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to activate account');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center">
                    <CardHeader>
                        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <CardTitle>Account Activated!</CardTitle>
                        <CardDescription>
                            Your account has been successfully activated and your password has been set.
                        </CardDescription>
                    </CardHeader>
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
            <Card className="max-w-md w-full">
                <CardHeader>
                    <CardTitle>Activate Your Account</CardTitle>
                    <CardDescription>
                        Please set a password to activate your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none" htmlFor="password">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="pl-9 pr-10"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
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
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="pl-9 pr-10"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading ? 'Activating...' : 'Activate Account'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center border-t p-4 mt-2">
                    <Link to="/login" className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
};

export default ActivateAccount;
