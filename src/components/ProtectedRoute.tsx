
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode | (({ user }: { user: any }) => React.ReactNode);
  requireLicense?: boolean;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireLicense = false,
  requiredRole
}) => {
  const { state, updateUser } = useAuth();
  const { user, loading } = state;
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Check for required role if specified
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/home" />;
  }
  
  // If license is required and user doesn't have a license exemption, check license
  if (requireLicense && !user.licenseExempt && !user.email.endsWith('@nexastream.co.uk')) {
    // Mock license check - in production would check against Firestore
    if (!user.schoolId) {
      return <Navigate to="/license-required" />;
    }
  }

  // Redirect teachers to dashboard if trying to access student routes
  if (user.role === 'teacher' && window.location.pathname === '/home') {
    return <Navigate to="/teacher-dashboard" />;
  }
  
  // Handle function children that need user data
  if (typeof children === 'function') {
    return children({ user });
  }
  
  return children;
};

export default ProtectedRoute;
