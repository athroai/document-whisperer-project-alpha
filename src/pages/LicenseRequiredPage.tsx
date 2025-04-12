
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const LicenseRequiredPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-purple-700">License Required</CardTitle>
          <CardDescription>
            Access to this feature requires a school license
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/40369f55-a9f5-48fb-bcf9-fdf91c946daa.png"
              alt="Athro Logo"
              className="h-20"
            />
          </div>
          
          <p className="text-center">
            Your account isn't currently linked to a school with an active Athro AI license.
            Please contact your teacher or school administrator to get access.
          </p>
          
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-md mt-6">
            <p className="text-sm text-amber-800">
              If you believe this is an error or your school already has a license,
              please use the school code provided by your teacher to link your account.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Link to="/home" className="w-full">
            <Button className="w-full">Return Home</Button>
          </Link>
          <Link to="/settings" className="w-full">
            <Button variant="outline" className="w-full">Enter School Code</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LicenseRequiredPage;
