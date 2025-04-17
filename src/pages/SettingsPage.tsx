
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ExamBoard } from '@/types/athro';
import { supabase } from '@/lib/supabase';
import { Slider } from '@/components/ui/slider';

const SettingsPage: React.FC = () => {
  const { state, updateUser, logout } = useAuth();
  const user = state.user;
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [examBoard, setExamBoard] = useState<ExamBoard>(user?.examBoard || 'none');
  
  // Subject preferences state
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<{[subject: string]: {selected: boolean, confidence: number}}>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load all available subjects and user's selected subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        // Get all available subjects (default list)
        const defaultSubjects = [
          'Mathematics', 'Science', 'English', 'History', 
          'Geography', 'Welsh', 'Languages', 'Religious Education'
        ];
        
        // Get user's selected subjects with confidence levels
        const { data: preferences } = await supabase
          .from('student_subject_preferences')
          .select('subject, confidence_level')
          .eq('student_id', user.id);
        
        // Create a map of all subjects with their selection status and confidence
        const subjectMap: {[subject: string]: {selected: boolean, confidence: number}} = {};
        defaultSubjects.forEach(subject => {
          subjectMap[subject] = { selected: false, confidence: 5 };
        });
        
        // Mark selected subjects and set their confidence
        if (preferences && preferences.length > 0) {
          preferences.forEach(pref => {
            if (subjectMap[pref.subject]) {
              subjectMap[pref.subject] = { selected: true, confidence: pref.confidence_level };
            }
          });
        }
        
        setAvailableSubjects(defaultSubjects);
        setSelectedSubjects(subjectMap);
      } catch (error) {
        console.error('Error fetching subjects:', error);
        toast({
          title: "Error Loading Subjects",
          description: "There was a problem loading your subject preferences.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubjects();
  }, [user]);

  const handleSubjectToggle = (subject: string) => {
    setSelectedSubjects(prev => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        selected: !prev[subject].selected
      }
    }));
  };

  const handleConfidenceChange = (subject: string, confidence: number) => {
    setSelectedSubjects(prev => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        confidence
      }
    }));
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    
    try {
      // Update user profile
      updateUser({
        displayName,
        examBoard
      });
      
      // Update subject preferences
      const currentPrefs = Object.entries(selectedSubjects)
        .filter(([_, value]) => value.selected)
        .map(([subject, value]) => ({
          student_id: user.id,
          subject,
          confidence_level: value.confidence
        }));
      
      // First delete existing preferences
      await supabase
        .from('student_subject_preferences')
        .delete()
        .eq('student_id', user.id);
      
      // Then insert new preferences
      if (currentPrefs.length > 0) {
        await supabase
          .from('student_subject_preferences')
          .insert(currentPrefs);
      }
      
      toast({
        title: "Settings Saved",
        description: "Your settings and subject preferences have been updated.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error Saving Settings",
        description: "There was a problem saving your settings.",
        variant: "destructive",
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
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
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
        
        <TabsContent value="subjects">
          <Card>
            <CardHeader>
              <CardTitle>Subject Selection</CardTitle>
              <CardDescription>
                Choose which subjects you want to study and update your confidence levels
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Loading subjects...</div>
              ) : (
                <div className="space-y-4">
                  {availableSubjects.map(subject => (
                    <div key={subject} className="border rounded-lg p-4 bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`subject-${subject}`} 
                            checked={selectedSubjects[subject]?.selected || false}
                            onCheckedChange={() => handleSubjectToggle(subject)}
                          />
                          <Label htmlFor={`subject-${subject}`} className="font-medium">{subject}</Label>
                        </div>
                      </div>
                      
                      {selectedSubjects[subject]?.selected && (
                        <div className="flex items-center space-x-4 mt-3 ml-6">
                          <span className="text-sm text-gray-500 w-24">Confidence:</span>
                          <Slider
                            value={[selectedSubjects[subject]?.confidence || 5]}
                            max={10}
                            step={1}
                            onValueChange={(value) => handleConfidenceChange(subject, value[0])}
                            className="flex-1"
                          />
                          <span className="text-sm font-medium w-12 text-center">
                            {selectedSubjects[subject]?.confidence || 5}/10
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            
            <CardFooter>
              <Button onClick={handleSaveSettings}>
                <Save className="h-4 w-4 mr-2" />
                Save Subject Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
