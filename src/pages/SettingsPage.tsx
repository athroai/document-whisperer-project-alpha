
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { Key, Shield, LogOut, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import AdminSettings from '@/components/AdminSettings';

const SettingsPage: React.FC = () => {
  const { state, updateUser, logout } = useAuth();
  const user = state.user;
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [examBoard, setExamBoard] = useState(user?.examBoard || 'none');
  const [showAdminSettings, setShowAdminSettings] = useState(false);

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
          <TabsTrigger value="admin">Admin</TabsTrigger>
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
                  onValueChange={setExamBoard}
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
        
        <TabsContent value="admin">
          <Card>
            <CardHeader>
              <CardTitle>Admin Settings</CardTitle>
              <CardDescription>
                Configure system-wide settings
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Configure OpenAI API key for all users and other administrative settings.
                  </p>
                  <Button 
                    variant="outline" 
                    className="flex items-center"
                    onClick={() => setShowAdminSettings(true)}
                  >
                    <Shield className="h-4 w-4 mr-2 text-amber-500" />
                    Open Admin Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <AdminSettings open={showAdminSettings} onOpenChange={setShowAdminSettings} />
    </div>
  );
};

export default SettingsPage;
