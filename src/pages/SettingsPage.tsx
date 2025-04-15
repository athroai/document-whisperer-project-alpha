
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

const SettingsPage = () => {
  const { state, updateUser } = useAuth();
  const { user } = state;
  
  // Profile settings state
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [examBoard, setExamBoard] = useState<'wjec' | 'ocr' | 'aqa' | 'none'>(
    (user?.examBoard as 'wjec' | 'ocr' | 'aqa' | 'none') || 'none'
  );
  
  // Notification settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [appNotifications, setAppNotifications] = useState(true);
  const [studyReminders, setStudyReminders] = useState(true);
  
  // Theme settings state
  const [darkMode, setDarkMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  
  // License information
  const licenseStatus = user?.licenseExempt ? "Exempted" : "Active";
  const schoolName = "St. Thomas High School";
  const licenseExpiry = "2025-12-31";
  const licenseType = "Educational Institution";
  
  const handleSaveProfile = () => {
    // Would update the user profile in a real implementation
    // Save exam board preference to local storage for the mock implementation
    if (user) {
      const savedUser = localStorage.getItem('athro_user');
      if (savedUser) {
        const updatedUser = JSON.parse(savedUser);
        updatedUser.examBoard = examBoard;
        updatedUser.displayName = displayName;
        localStorage.setItem('athro_user', JSON.stringify(updatedUser));
      }
    }
    
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved.",
    });
  };
  
  const handleSaveNotifications = () => {
    toast({
      title: "Notification preferences updated",
      description: "Your notification settings have been saved.",
    });
  };
  
  const handleSaveTheme = () => {
    toast({
      title: "Theme preferences updated", 
      description: "Your theme settings have been saved."
    });
  };

  if (!user) {
    return <div className="p-8">Please log in to access settings.</div>;
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="license">License</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your account information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center mb-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-purple-200 text-purple-800 text-2xl">
                    {user.displayName?.[0].toUpperCase() || user.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      disabled={true}
                    />
                    <p className="text-xs text-gray-500">
                      Contact support to change your email address
                    </p>
                  </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="examBoard">Exam Board</Label>
                      <Select 
                        value={examBoard} 
                        onValueChange={(value: 'wjec' | 'ocr' | 'aqa' | 'none') => setExamBoard(value)}
                      >
                        <SelectTrigger id="examBoard">
                          <SelectValue placeholder="Select exam board" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wjec">WJEC</SelectItem>
                          <SelectItem value="aqa">AQA</SelectItem>
                          <SelectItem value="ocr">OCR</SelectItem>
                          <SelectItem value="none">None / Not specified</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        Your preferred exam board for study materials and quizzes
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">User Type</Label>
                      <Input
                        id="role"
                        value={user.role}
                        disabled={true}
                      />
                      <p className="text-xs text-gray-500">
                        Your account type determines available features
                      </p>
                    </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveProfile}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Email Notifications</h3>
                  <p className="text-sm text-gray-500">Receive updates via email</p>
                </div>
                <Switch 
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">App Notifications</h3>
                  <p className="text-sm text-gray-500">Receive in-app notifications</p>
                </div>
                <Switch 
                  checked={appNotifications}
                  onCheckedChange={setAppNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Study Reminders</h3>
                  <p className="text-sm text-gray-500">Get reminders for scheduled study sessions</p>
                </div>
                <Switch 
                  checked={studyReminders}
                  onCheckedChange={setStudyReminders}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveNotifications}>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>
                Customize the application appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Dark Mode</h3>
                  <p className="text-sm text-gray-500">Use dark color scheme</p>
                </div>
                <Switch 
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">High Contrast</h3>
                  <p className="text-sm text-gray-500">Increase contrast for better readability</p>
                </div>
                <Switch 
                  checked={highContrast}
                  onCheckedChange={setHighContrast}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Large Text</h3>
                  <p className="text-sm text-gray-500">Increase text size throughout the app</p>
                </div>
                <Switch 
                  checked={largeText}
                  onCheckedChange={setLargeText}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveTheme}>Save Theme</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="license">
          <Card>
            <CardHeader>
              <CardTitle>License Information</CardTitle>
              <CardDescription>
                View details about your Athro AI license
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">License Status</h3>
                    <p className="font-medium">{licenseStatus}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">School/Institution</h3>
                    <p className="font-medium">{schoolName}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Expiry Date</h3>
                    <p className="font-medium">{licenseExpiry}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">License Type</h3>
                    <p className="font-medium">{licenseType}</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">License Management</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline">Contact Support</Button>
                  <Button>Upgrade License</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
