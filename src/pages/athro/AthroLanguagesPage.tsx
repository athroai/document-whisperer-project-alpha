
import React, { useEffect, useState } from 'react';
import { useAthro } from '@/contexts/AthroContext';
import AthroBase from '@/components/athro/AthroBase';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAthroBySubject } from '@/config/athrosConfig';
import { useNavigate } from 'react-router-dom';
import { Globe } from 'lucide-react';
import LanguageSelector from '@/components/athro/LanguageSelector';

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
        localStorage.setItem('athroLanguagesLanguage', selectedLanguage);
      }
    } else {
      // If character not found, redirect to subject selector
      navigate('/athro/select');
    }
  }, [selectedLanguage, setActiveCharacter, navigate, setCurrentScienceSubject]);
  
  const handleSelectLanguage = (language: Language) => {
    setSelectedLanguage(language);
    setShowLanguageSelector(false);
    // Save preference
    localStorage.setItem('athroLanguagesLanguage', language);
  };
  
  const getLanguageLabel = () => {
    switch (selectedLanguage) {
      case 'french':
        return 'French 🇫🇷';
      case 'german':
        return 'German 🇩🇪';
      case 'spanish':
        return 'Spanish 🇪🇸';
      default:
        return 'Select Language';
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AthroLanguages</h1>
          <p className="text-muted-foreground">Your personal GCSE Modern Foreign Languages tutor</p>
        </div>
        
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => setShowLanguageSelector(true)}
        >
          <Globe className="h-4 w-4" />
          {getLanguageLabel()}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 h-[calc(100vh-12rem)]">
          <AthroBase showTopicSelector={true} />
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-4">
            <h2 className="font-medium mb-3">About AthroLanguages</h2>
            <p className="text-sm text-muted-foreground">AthroLanguages supports your learning of French, Spanish, and German with vocabulary practice, conversation skills, and grammar explanations.</p>
            
            <div className="mt-4">
              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                {getLanguageLabel()}
              </Badge>
            </div>
            
            <h3 className="font-medium mt-4 mb-2">Supported Features:</h3>
            <ul className="text-sm space-y-1 list-disc pl-4">
              <li>Multilingual support (French, Spanish, German)</li>
              <li>Grammar explanations</li>
              <li>Vocabulary practice</li>
              <li>Conversation exercises</li>
              <li>Translation help</li>
              <li>Past paper practice</li>
            </ul>
          </Card>
          
          {selectedLanguage === 'french' && (
            <Card className="p-4">
              <h2 className="font-medium mb-3">French Learning Tips</h2>
              <ul className="text-sm space-y-2 list-disc pl-4">
                <li>Practice gender agreement (le/la) with new vocabulary</li>
                <li>Master the different verb conjugation patterns</li>
                <li>Listen to French music and podcasts for pronunciation</li>
                <li>Focus on the different tenses step by step</li>
              </ul>
            </Card>
          )}
          
          {selectedLanguage === 'german' && (
            <Card className="p-4">
              <h2 className="font-medium mb-3">German Learning Tips</h2>
              <ul className="text-sm space-y-2 list-disc pl-4">
                <li>Learn the gender of nouns along with the noun (der/die/das)</li>
                <li>Practice the four cases (nominative, accusative, dative, genitive)</li>
                <li>Focus on word order in both main and subordinate clauses</li>
                <li>Understand separable and inseparable verb prefixes</li>
              </ul>
            </Card>
          )}
          
          {selectedLanguage === 'spanish' && (
            <Card className="p-4">
              <h2 className="font-medium mb-3">Spanish Learning Tips</h2>
              <ul className="text-sm space-y-2 list-disc pl-4">
                <li>Practice the difference between ser and estar</li>
                <li>Master the irregular verb patterns in the present tense</li>
                <li>Focus on gender agreement with adjectives</li>
                <li>Learn the most common phrases for conversation</li>
              </ul>
            </Card>
          )}
          
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
        </div>
      </div>
      
      <LanguageSelector
        isOpen={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
        onSelectLanguage={handleSelectLanguage}
        selectedLanguage={selectedLanguage}
      />
    </div>
  );
};

export default AthroLanguagesPage;
