
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface LicenseCheckProps {
  children: React.ReactNode;
}

const LicenseCheck: React.FC<LicenseCheckProps> = ({ children }) => {
  const { state } = useAuth();
  const { user, isLoading } = state;
  
  // Loading state
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  // Not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Nexastream users or license exempt users have access
  if (user.licenseExempt || (user.email && user.email.endsWith('@nexastream.co.uk'))) {
    return <>{children}</>;
  }
  
  // School has active license or mock data for now
  if (user.schoolId) {
    return <>{children}</>;
  }
  
  // No license - show license required page
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-purple-700">License Required</CardTitle>
          <CardDescription>
            Access to this feature requires a school license
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center mb-6">
            Your account isn't currently linked to a school with an active Athro AI license.
            Please contact your teacher or school administrator to get access.
          </p>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-sm text-amber-800">
              If you believe this is an error or your school already has a license,
              please use the school code provided by your teacher to link your account.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full" onClick={() => window.location.href = '/home'}>
            Return Home
          </Button>
          <Button variant="outline" className="w-full" onClick={() => window.location.href = '/settings'}>
            Enter School Code
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LicenseCheck;
