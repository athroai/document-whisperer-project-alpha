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

const SettingsPage: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;
  
  // Profile settings state
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [examBoard, setExamBoard] = useState(user?.examBoard || 'none');
  
  // Notification settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [studyReminders, setStudyReminders] = useState(true);
  const [quizReminders, setQuizReminders] = useState(true);
  const [achievementNotifications, setAchievementNotifications] = useState(true);
  
  // Accessibility settings state
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  
  // Study preference state
  const [studyDuration, setStudyDuration] = useState('30');
  const [breakDuration, setBreakDuration] = useState('5');
  
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
  
  const handleSaveAccessibility = () => {
    toast({
      title: "Accessibility settings updated",
      description: "Your accessibility preferences have been saved.",
    });
  };
  
  const handleSaveStudyPreferences = () => {
    toast({
      title: "Study preferences updated",
      description: "Your study preferences have been saved.",
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-0.5 mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-gray-500">
            Manage your account preferences and settings
          </p>
        </div>
        
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
            <TabsTrigger value="study-preferences">Study Preferences</TabsTrigger>
          </TabsList>
          
          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                  Manage your personal information and account settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex flex-col items-center space-y-2">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-2xl bg-purple-100 text-purple-800">
                        {user?.displayName?.[0].toUpperCase() || user?.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm">
                      Change Avatar
                    </Button>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="examBoard">Exam Board</Label>
                      <Select 
                        value={examBoard} 
                        onValueChange={setExamBoard}
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
                        value={user?.role || 'student'}
                        disabled
                      />
                      <p className="text-xs text-gray-500">
                        Contact support to change your user type
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <Button onClick={handleSaveProfile}>Save Changes</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <Button>Update Password</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>
                  Actions here cannot be undone
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  When you delete your account, all of your data will be permanently removed.
                  This action cannot be undone.
                </p>
                <Button variant="destructive">Delete Account</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Control how you receive notifications and updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="study-reminders">Study Reminders</Label>
                    <p className="text-sm text-gray-500">Get reminded about your scheduled study sessions</p>
                  </div>
                  <Switch
                    id="study-reminders"
                    checked={studyReminders}
                    onCheckedChange={setStudyReminders}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="quiz-reminders">Quiz Reminders</Label>
                    <p className="text-sm text-gray-500">Get reminded about upcoming quizzes</p>
                  </div>
                  <Switch
                    id="quiz-reminders"
                    checked={quizReminders}
                    onCheckedChange={setQuizReminders}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="achievement-notifications">Achievement Notifications</Label>
                    <p className="text-sm text-gray-500">Get notified when you earn new achievements</p>
                  </div>
                  <Switch
                    id="achievement-notifications"
                    checked={achievementNotifications}
                    onCheckedChange={setAchievementNotifications}
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <Button onClick={handleSaveNotifications}>Save Preferences</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Accessibility Settings */}
          <TabsContent value="accessibility" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Accessibility</CardTitle>
                <CardDescription>
                  Customize your learning experience with accessibility options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="high-contrast">High Contrast Mode</Label>
                    <p className="text-sm text-gray-500">Increase visual contrast for better readability</p>
                  </div>
                  <Switch
                    id="high-contrast"
                    checked={highContrast}
                    onCheckedChange={setHighContrast}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="large-text">Large Text</Label>
                    <p className="text-sm text-gray-500">Increase text size throughout the application</p>
                  </div>
                  <Switch
                    id="large-text"
                    checked={largeText}
                    onCheckedChange={setLargeText}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="reduced-motion">Reduced Motion</Label>
                    <p className="text-sm text-gray-500">Minimize animations throughout the application</p>
                  </div>
                  <Switch
                    id="reduced-motion"
                    checked={reducedMotion}
                    onCheckedChange={setReducedMotion}
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <Button onClick={handleSaveAccessibility}>Save Preferences</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Study Preferences */}
          <TabsContent value="study-preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Study Preferences</CardTitle>
                <CardDescription>
                  Customize your study sessions and learning experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="study-duration">Default Study Session Duration (minutes)</Label>
                  <Input
                    id="study-duration"
                    type="number"
                    min="5"
                    step="5"
                    value={studyDuration}
                    onChange={(e) => setStudyDuration(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="break-duration">Default Break Duration (minutes)</Label>
                  <Input
                    id="break-duration"
                    type="number"
                    min="1"
                    step="1"
                    value={breakDuration}
                    onChange={(e) => setBreakDuration(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Preferred Study Time</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['Morning', 'Afternoon', 'Evening', 'Night'].map((time) => (
                      <Button
                        key={time}
                        variant="outline"
                        className="justify-center"
                        onClick={() => {}}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Preferred Learning Style</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {['Visual', 'Auditory', 'Reading/Writing', 'Kinesthetic'].map((style) => (
                      <Button
                        key={style}
                        variant="outline"
                        className="justify-center"
                        onClick={() => {}}
                      >
                        {style}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <Button onClick={handleSaveStudyPreferences}>Save Preferences</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPage;
