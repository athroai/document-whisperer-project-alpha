
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'parent' | 'teacher'>('student');
  const { signup, state } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    // Validate password length
    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    // Check if too many attempts
    if (attemptCount > 4) {
      toast({
        title: "Too many attempts",
        description: "Please wait a few minutes before trying again",
        variant: "destructive",
      });
      
      // Reset attempt count after 2 minutes
      setTimeout(() => setAttemptCount(0), 120000);
      return;
    }
    
    try {
      setIsChecking(true);
      setAttemptCount(prev => prev + 1);
      
      await signup(email, password, role);
      
      // Reset attempt count on success
      setAttemptCount(0);
      
      toast({
        title: "Account created!",
        description: "Welcome to Athro AI",
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // More specific error handling
      if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
        toast({
          title: "Account exists",
          description: "An account with this email already exists. Please log in instead.",
          variant: "destructive",
        });
      } else if (error.message?.includes('rate limit') || error.message?.includes('Too many') || error.message?.includes('429')) {
        toast({
          title: "Too many attempts",
          description: "Please wait a few minutes before trying again.",
          variant: "destructive",
        });
        
        // Reset attempt count after 2 minutes
        setTimeout(() => setAttemptCount(0), 120000);
      } else {
        toast({
          title: "Signup failed",
          description: error.message || "Please try again",
          variant: "destructive",
        });
      }
    } finally {
      setIsChecking(false);
    }
  };

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
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join Athro AI and start your GCSE learning journey today
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
                disabled={isChecking}
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                disabled={isChecking}
              />
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 8 characters long
              </p>
            </div>

            <div>
              <Label htmlFor="role" className="mb-2 block">
                I am a:
              </Label>
              <RadioGroup 
                value={role}
                onValueChange={(value) => setRole(value as 'student' | 'parent' | 'teacher')}
                className="flex flex-col space-y-1"
                disabled={isChecking}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="student" id="student" />
                  <Label htmlFor="student">Student</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="parent" id="parent" />
                  <Label htmlFor="parent">Parent</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="teacher" id="teacher" />
                  <Label htmlFor="teacher">Teacher</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={state.isLoading || isChecking}
              >
                {state.isLoading || isChecking ? (
                  <span className="flex items-center">
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </span>
                ) : "Sign up"}
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
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link to="/login">
                <Button
                  variant="outline"
                  className="w-full border-purple-300 text-purple-600 hover:bg-purple-50"
                  disabled={isChecking}
                >
                  Log in instead
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
