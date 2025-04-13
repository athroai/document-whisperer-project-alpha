
import React, { useEffect, useState } from 'react';
import { useAthro } from '@/contexts/AthroContext';
import AthroBase from '@/components/athro/AthroBase';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAthroBySubject } from '@/config/athrosConfig';
import { useNavigate } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Language = 'french' | 'german' | 'spanish';

const AthroLanguagesPage: React.FC = () => {
  const { setActiveCharacter, currentScienceSubject, setCurrentScienceSubject } = useAthro();
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('french');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  
  useEffect(() => {
    // Show language selector on first load
    if (!localStorage.getItem('athroLanguagesLanguage')) {
      setShowLanguageSelector(true);
    } else {
      // Load saved language preference
      const savedLanguage = localStorage.getItem('athroLanguagesLanguage') as Language;
      if (['french', 'german', 'spanish'].includes(savedLanguage)) {
        setSelectedLanguage(savedLanguage);
      }
    }
  }, []);
  
  useEffect(() => {
    const languagesCharacter = getAthroBySubject('Languages');
    if (languagesCharacter) {
      setActiveCharacter(languagesCharacter);
      
      // If setCurrentScienceSubject exists, use it to update the language section
      // This is the same pattern used in AthroSciencePage for biology/chemistry/physics
      if (setCurrentScienceSubject && selectedLanguage) {
        setCurrentScienceSubject(selectedLanguage);
        // Save the preference for future visits
        localStorage.setItem('athroLanguagesLanguage', selectedLanguage);
      }
    } else {
      // If character not found, redirect to subject selector
      navigate('/athro');
    }
  }, [setActiveCharacter, navigate, selectedLanguage, setCurrentScienceSubject]);
  
  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value as Language);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">AthroLanguages</h1>
        <p className="text-muted-foreground">Your personal GCSE Languages mentor</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="mb-6 p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Globe className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-medium">Currently studying: </span>
              <Badge className="ml-2 capitalize">{selectedLanguage}</Badge>
            </div>
            <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="french">French</SelectItem>
                <SelectItem value="german">German</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
              </SelectContent>
            </Select>
          </Card>
          
          <div className="h-[calc(100vh-16rem)]">
            <AthroBase subject="Languages" />
          </div>
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-4">
            <h2 className="font-medium mb-3">About AthroLanguages</h2>
            <p className="text-sm text-muted-foreground">AthroLanguages helps you develop your speaking, listening, reading, and writing skills in your chosen language for GCSE success.</p>
            
            <h3 className="font-medium mt-4 mb-2">Supported Languages:</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant={selectedLanguage === 'french' ? 'default' : 'outline'}>French</Badge>
              <Badge variant={selectedLanguage === 'german' ? 'default' : 'outline'}>German</Badge>
              <Badge variant={selectedLanguage === 'spanish' ? 'default' : 'outline'}>Spanish</Badge>
            </div>
            
            <h3 className="font-medium mt-4 mb-2">Supported Features:</h3>
            <ul className="text-sm space-y-1 list-disc pl-4">
              <li>Vocabulary practice</li>
              <li>Grammar explanations</li>
              <li>Conversation practice</li>
              <li>Reading comprehension</li>
              <li>Past paper practice</li>
              <li>Topic-specific review</li>
            </ul>
          </Card>
          
          <Card className="p-4">
            <h2 className="font-medium mb-3">Exam Boards</h2>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                WJEC
              </span>
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                AQA
              </span>
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                OCR
              </span>
            </div>
          </Card>
          
          <Card className="p-4">
            <h2 className="font-medium mb-3">Study Tips</h2>
            <ul className="text-sm space-y-2 list-disc pl-4">
              <li>Ask AthroLanguages to help with vocabulary</li>
              <li>Practice conversations in your chosen language</li>
              <li>Request translations and explanations</li>
              <li>Review past paper questions with guided explanations</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AthroLanguagesPage;
