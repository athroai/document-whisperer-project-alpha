
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/loading-spinner';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const { login, state } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (state.user && !state.loading) {
      navigate('/home');
    }
  }, [state.user, state.loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Missing information", "Please fill in all required fields");
      return;
    }
    
    try {
      await login(email, password);
      toast.success("Login successful!", "Welcome back to Athro AI");
      navigate('/home');
    } catch (error) {
      // Error is already handled in the AuthContext
    }
  };

  // Show loading while checking auth state
  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-100 to-white">
        <div className="text-center">
          <LoadingSpinner className="mx-auto" />
          <p className="mt-4 text-purple-800">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-100 to-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/">
          <img
            src="/lovable-uploads/40369f55-a9f5-48fb-bcf9-fdf91c946daa.png"
            alt="Athro Logo"
            className="h-24 mx-auto"
          />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-purple-800">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Log in to continue your GCSE studies with your Athro mentor
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox 
                  id="remember-me" 
                  checked={rememberMe} 
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-purple-600 hover:text-purple-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={state.loading}
              >
                {state.loading ? "Logging in..." : "Log in"}
              </Button>
            </div>
          </form>

          {state.error && (
            <div className="mt-4 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
              {state.error}
            </div>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  New to Athro?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link to="/signup">
                <Button
                  variant="outline"
                  className="w-full border-purple-300 text-purple-600 hover:bg-purple-50"
                >
                  Create an account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
