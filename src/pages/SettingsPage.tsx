
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { UserRole } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/ui/loading-spinner';

const SettingsPage: React.FC = () => {
  const { state, updateUser } = useAuth();
  const { user, loading } = state;
  
  const [displayName, setDisplayName] = useState('');
  const [examBoard, setExamBoard] = useState<'wjec' | 'ocr' | 'aqa' | 'none'>('none');
  const [welshEligible, setWelshEligible] = useState(false);
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'cy' | 'es' | 'fr' | 'de'>('en');
  const [isUpdating, setIsUpdating] = useState(false);
  const [schools, setSchools] = useState<{id: string; name: string}[]>([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [loadingSchools, setLoadingSchools] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setExamBoard(user.examBoard || 'none');
      setWelshEligible(user.welshEligible || false);
      setPreferredLanguage(user.preferredLanguage || 'en');
      setSelectedSchool(user.schoolId || '');
    }
  }, [user]);

  useEffect(() => {
    const fetchSchools = async () => {
      if (!user) return;
      
      try {
        setLoadingSchools(true);
        const { data, error } = await supabase
          .from('schools')
          .select('id, name')
          .order('name');
          
        if (error) throw error;
        
        setSchools(data);
      } catch (err) {
        console.error('Error fetching schools:', err);
      } finally {
        setLoadingSchools(false);
      }
    };
    
    fetchSchools();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setIsUpdating(true);
      
      await updateUser({
        displayName,
        examBoard,
        welshEligible,
        preferredLanguage,
        schoolId: selectedSchool || undefined
      });
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error('Profile update failed', error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 flex justify-center">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p>Please log in to view settings</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user.email}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={user.role}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="school">School</Label>
                  {loadingSchools ? (
                    <div className="flex items-center space-x-2">
                      <LoadingSpinner className="h-4 w-4" />
                      <span className="text-sm">Loading schools...</span>
                    </div>
                  ) : (
                    <Select 
                      value={selectedSchool} 
                      onValueChange={setSelectedSchool}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a school" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {schools.map((school) => (
                          <SelectItem key={school.id} value={school.id}>
                            {school.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isUpdating}
                  className="mt-4"
                >
                  {isUpdating ? 
                    <LoadingSpinner className="mr-2 h-4 w-4" /> : 
                    null
                  }
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="examBoard">Exam Board</Label>
                  <Select 
                    value={examBoard} 
                    onValueChange={(value) => setExamBoard(value as 'wjec' | 'ocr' | 'aqa' | 'none')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam board" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="wjec">WJEC</SelectItem>
                      <SelectItem value="ocr">OCR</SelectItem>
                      <SelectItem value="aqa">AQA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="welsh-eligible"
                      checked={welshEligible}
                      onCheckedChange={setWelshEligible}
                    />
                    <Label htmlFor="welsh-eligible">Welsh Language Eligible</Label>
                  </div>
                  <p className="text-sm text-gray-500">
                    Enable Welsh language features and content
                  </p>
                </div>
                
                <Button onClick={handleSubmit} disabled={isUpdating}>
                  {isUpdating ? 'Saving...' : 'Save Settings'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Preferred Language</Label>
                  <Select 
                    value={preferredLanguage} 
                    onValueChange={(value) => setPreferredLanguage(value as 'en' | 'cy' | 'es' | 'fr' | 'de')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="cy">Welsh</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={handleSubmit} disabled={isUpdating}>
                  {isUpdating ? 'Saving...' : 'Save Preferences'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
