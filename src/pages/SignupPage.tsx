
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';
import { UserRole } from '@/types/auth';

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [welshEligible, setWelshEligible] = useState(false);
  const { signup, state } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Missing information", {
        description: "Please fill in all required fields"
      });
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Invalid email", {
        description: "Please enter a valid email address"
      });
      return;
    }
    
    // Validate password length
    if (password.length < 8) {
      toast.error("Password too short", {
        description: "Password must be at least 8 characters long"
      });
      return;
    }
    
    try {
      await signup(email, password, role, { 
        welshEligible,
        preferredLanguage: 'en' // Default to English
      });
      
      toast.success("Account created!", {
        description: "Welcome to Athro AI"
      });
      navigate('/home');
    } catch (error) {
      // Error is already handled in the AuthContext
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
          {t('signup.welcomeTitle')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t('signup.welcomeMessage')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email">{t('auth.email')}</Label>
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
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('signup.passwordRequirements')}
              </p>
            </div>

            <div>
              <Label htmlFor="role" className="mb-2 block">
                {t('signup.roleLabel')}
              </Label>
              <RadioGroup 
                value={role}
                onValueChange={(value) => setRole(value as UserRole)}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="student" id="student" />
                  <Label htmlFor="student">{t('signup.roleStudent')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="parent" id="parent" />
                  <Label htmlFor="parent">{t('signup.roleParent')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="teacher" id="teacher" />
                  <Label htmlFor="teacher">{t('signup.roleTeacher')}</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <div className="flex items-start space-x-2 mt-4">
                <Checkbox 
                  id="welsh-eligible" 
                  checked={welshEligible}
                  onCheckedChange={(checked) => setWelshEligible(checked === true)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label 
                    htmlFor="welsh-eligible" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {t('signup.welshLanguageQuestion')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('signup.welshLanguageYes')}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={state.loading}
              >
                {state.loading ? "Creating account..." : t('signup.welcomeTitle')}
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
                  {t('auth.hasAccount')}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link to="/login">
                <Button
                  variant="outline"
                  className="w-full border-purple-300 text-purple-600 hover:bg-purple-50"
                >
                  {t('common.login')}
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
