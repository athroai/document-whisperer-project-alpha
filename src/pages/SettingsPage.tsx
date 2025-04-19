
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ExamBoard } from '@/types/athro';
import { useAuth } from '@/contexts/AuthContext';

const SettingsPage = () => {
  const { state, updateUser, logout } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(state.profile?.full_name || '');
  const [email, setEmail] = useState(state.user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // On line 22, change examBoard initialization to handle type issues:
  const [examBoard, setExamBoard] = useState<ExamBoard>(
    (state.profile?.examBoard as ExamBoard) || 'AQA'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password && password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive"
      });
      return;
    }

    try {
      const updates = {
        displayName,
        examBoard,
      };
      
      if (email !== state.user?.email) {
        Object.assign(updates, { email });
      }
      
      if (password) {
        Object.assign(updates, { password });
      }
      
      await updateUser(updates);
      
      toast({
        title: "Settings updated",
        description: "Your settings have been updated successfully.",
      });
      
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input 
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="examBoard">Exam Board</Label>
                  <Select value={examBoard} onValueChange={(value) => setExamBoard(value as ExamBoard)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam board" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AQA">AQA</SelectItem>
                      <SelectItem value="Edexcel">Edexcel</SelectItem>
                      <SelectItem value="OCR">OCR</SelectItem>
                      <SelectItem value="WJEC">WJEC</SelectItem>
                      <SelectItem value="CCEA">CCEA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input 
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank to keep current password"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input 
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Leave blank to keep current password"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => logout()}>Sign Out</Button>
                <Button type="submit">Save Changes</Button>
              </CardFooter>
            </Card>
          </form>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                <div>
                  <span className="font-medium">Name:</span> {state.profile?.full_name || 'Not set'}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {state.user?.email || 'Not set'}
                </div>
                <div>
                  <span className="font-medium">Exam Board:</span> {state.profile?.examBoard || 'Not set'}
                </div>
                <div>
                  <span className="font-medium">Account created:</span> {state.user?.created_at ? new Date(state.user.created_at).toLocaleDateString() : 'Unknown'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
