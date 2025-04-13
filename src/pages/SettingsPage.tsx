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
import { useTranslation } from '@/hooks/useTranslation';

const SettingsPage = () => {
  const { state, updateUser } = useAuth();
  const { user } = state;
  const { t, changeLanguage } = useTranslation();
  
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
  
  // Language settings state
  const [welshEligible, setWelshEligible] = useState(user?.welshEligible || false);
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'cy'>(
    (user?.preferredLanguage as 'en' | 'cy') || 'en'
  );
  
  // License information
  const licenseStatus = user?.licenseExempt ? "Exempted" : "Active";
  const schoolName = "St. Thomas High School";
  const licenseExpiry = "2025-12-31";
  const licenseType = "Educational Institution";
  
  useEffect(() => {
    if (user) {
      setWelshEligible(user.welshEligible || false);
      setPreferredLanguage((user.preferredLanguage as 'en' | 'cy') || 'en');
    }
  }, [user]);
  
  const handleSaveProfile = () => {
    if (user) {
      updateUser({
        displayName,
        examBoard
      });
      
      toast({
        title: t('common.save'),
        description: t('settings.profileDescription'),
      });
    }
  };
  
  const handleSaveNotifications = () => {
    toast({
      title: t('common.save'),
      description: t('settings.notificationsDescription'),
    });
  };
  
  const handleSaveTheme = () => {
    toast({
      title: t('common.save'), 
      description: t('settings.themeDescription')
    });
  };
  
  const handleSaveLanguage = () => {
    if (user) {
      updateUser({
        welshEligible,
        preferredLanguage
      });
      
      // Update the language in the translation system
      changeLanguage(preferredLanguage);
      
      toast({
        title: t('common.save'),
        description: t('settings.languageDescription'),
      });
    }
  };

  if (!user) {
    return <div className="p-8">Please log in to access settings.</div>;
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{t('settings.title')}</h1>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">{t('settings.profile')}</TabsTrigger>
          <TabsTrigger value="notifications">{t('settings.notifications')}</TabsTrigger>
          <TabsTrigger value="theme">{t('settings.theme')}</TabsTrigger>
          <TabsTrigger value="language">{t('settings.language')}</TabsTrigger>
          <TabsTrigger value="license">{t('settings.license')}</TabsTrigger>
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
        
        <TabsContent value="language">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.language')}</CardTitle>
              <CardDescription>
                {t('settings.languageDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{t('settings.welshSupport')}</h3>
                  <p className="text-sm text-gray-500">
                    {t('signup.welshLanguageYes')}
                  </p>
                </div>
                <Switch 
                  checked={welshEligible}
                  onCheckedChange={setWelshEligible}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="preferredLanguage">{t('settings.preferredLanguage')}</Label>
                <Select 
                  value={preferredLanguage} 
                  onValueChange={(value: 'en' | 'cy') => setPreferredLanguage(value)}
                  disabled={!welshEligible}
                >
                  <SelectTrigger id="preferredLanguage">
                    <SelectValue placeholder={t('settings.preferredLanguage')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="cy">Cymraeg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveLanguage}>{t('common.save')}</Button>
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
