
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode | (({ user }: { user: any }) => React.ReactNode);
  requireLicense?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireLicense = false 
}) => {
  const { state, updateUser } = useAuth();
  const { user, loading } = state;
  const [showExamBoardDialog, setShowExamBoardDialog] = useState(false);
  const [examBoard, setExamBoard] = useState<string>(user?.examBoard || 'none');
  
  // Check if user needs to select an exam board preference
  useEffect(() => {
    if (user && !loading && !user.examBoard && user.role !== 'teacher') {
      setShowExamBoardDialog(true);
    }
  }, [user, loading]);
  
  // Save exam board preference
  const saveExamBoardPreference = () => {
    if (user) {
      updateUser({ examBoard: examBoard as 'wjec' | 'ocr' | 'aqa' | 'none' });
      toast({
        title: "Preference saved",
        description: `Your exam board preference has been set to ${examBoard === 'none' ? 'No Preference' : examBoard.toUpperCase()}`,
      });
      setShowExamBoardDialog(false);
    }
  };
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
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
    return (
      <>
        {children({ user })}
        
        {/* Exam Board Preference Dialog */}
        <Dialog open={showExamBoardDialog} onOpenChange={setShowExamBoardDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Select Your Exam Board</DialogTitle>
              <DialogDescription>
                This helps us tailor quiz questions to your specific curriculum.
                You can change this later in your settings.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Select value={examBoard} onValueChange={setExamBoard}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an exam board" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wjec">WJEC</SelectItem>
                  <SelectItem value="ocr">OCR</SelectItem>
                  <SelectItem value="aqa">AQA</SelectItem>
                  <SelectItem value="none">No Preference</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button onClick={saveExamBoardPreference}>Save Preference</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }
  
  return (
    <>
      {children}
      
      {/* Exam Board Preference Dialog */}
      <Dialog open={showExamBoardDialog} onOpenChange={setShowExamBoardDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Your Exam Board</DialogTitle>
            <DialogDescription>
              This helps us tailor quiz questions to your specific curriculum.
              You can change this later in your settings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Select value={examBoard} onValueChange={setExamBoard}>
              <SelectTrigger>
                <SelectValue placeholder="Select an exam board" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wjec">WJEC</SelectItem>
                <SelectItem value="ocr">OCR</SelectItem>
                <SelectItem value="aqa">AQA</SelectItem>
                <SelectItem value="none">No Preference</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={saveExamBoardPreference}>Save Preference</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProtectedRoute;
