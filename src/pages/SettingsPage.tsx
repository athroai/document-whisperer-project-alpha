
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ExamBoard } from '@/types/athro';

const SettingsPage: React.FC = () => {
  const { state, updateUser, logout } = useAuth();
  const user = state.user;
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [examBoard, setExamBoard] = useState<ExamBoard>(user?.examBoard || 'none');

  const handleSaveSettings = () => {
    if (user) {
      updateUser({
        displayName,
        examBoard
      });
      toast({
        title: "Settings Saved",
        description: "Your settings have been updated successfully.",
      });
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <Tabs defaultValue="account" className="mb-8">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account information
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name">Display Name</Label>
                <Input 
                  id="name" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  value={user?.email || ''}
                  disabled
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="role">Account Type</Label>
                <Input 
                  id="role" 
                  value={user?.role || ''}
                  disabled
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
              <Button 
                onClick={handleSaveSettings}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Study Preferences</CardTitle>
              <CardDescription>
                Customize your learning experience
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="examBoard">Exam Board</Label>
                <Select 
                  value={examBoard}
                  onValueChange={(value: ExamBoard) => setExamBoard(value)}
                >
                  <SelectTrigger id="examBoard">
                    <SelectValue placeholder="Select exam board" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No preference</SelectItem>
                    <SelectItem value="aqa">AQA</SelectItem>
                    <SelectItem value="edexcel">Edexcel</SelectItem>
                    <SelectItem value="ocr">OCR</SelectItem>
                    <SelectItem value="wjec">WJEC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="pomodoro">Auto-start Pomodoro timer</Label>
                <Switch id="pomodoro" />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications">Study reminders</Label>
                <Switch id="notifications" />
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                onClick={handleSaveSettings}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
