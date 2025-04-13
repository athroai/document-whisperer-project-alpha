
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAthro } from '@/contexts/AthroContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AthroChat from './AthroChat';
import AthroProfile from './AthroProfile';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from '@/hooks/useTranslation';

interface AthroBaseProps {
  subject: string;
  allowScience?: boolean;
}

const AthroBase: React.FC<AthroBaseProps> = ({ 
  subject, 
  allowScience = false
}) => {
  const [activeTab, setActiveTab] = useState<string>('chat');
  const { characters, setActiveCharacter, activeCharacter } = useAthro();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  useEffect(() => {
    // Find the character for this subject
    const character = characters?.find(
      (char) => char.subject.toLowerCase() === subject.toLowerCase()
    );
    
    if (character) {
      setActiveCharacter(character);
    } else {
      console.warn(`No character found for subject: ${subject}`);
    }
  }, [subject, characters, setActiveCharacter]);
  
  const handleBackClick = () => {
    navigate('/athro/select');
  };
  
  // Show a loading state if activeCharacter is not available yet
  if (!activeCharacter && characters?.length > 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="mb-4 flex items-center">
          <Button variant="ghost" size="sm" onClick={handleBackClick} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Loading Athro...</h1>
        </div>
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-lg text-muted-foreground">Preparing your study session...</p>
        </div>
      </div>
    );
  }
  
  // If there's no character at all (not even loading), show an error state
  if (!activeCharacter) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="mb-4 flex items-center">
          <Button variant="ghost" size="sm" onClick={handleBackClick} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Subject Not Available</h1>
        </div>
        <Alert className="mt-4" variant="destructive">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertDescription>
            We couldn't find an Athro for {subject}. Please try selecting a different subject.
          </AlertDescription>
        </Alert>
        <Button onClick={handleBackClick} className="mt-4">
          Return to Subject Selection
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={handleBackClick} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{activeCharacter.name}</h1>
        </div>
        
        {subject.toLowerCase() === 'welsh' && (
          <LanguageSelector />
        )}
      </div>
      
      {allowScience && subject.toLowerCase() === 'science' && (
        <Alert className="mb-4">
          <AlertDescription>
            {t('athro.selectScience')}
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="chat">{t('athro.studySession')}</TabsTrigger>
          <TabsTrigger value="topics">{t('athro.topics')}</TabsTrigger>
          <TabsTrigger value="about">{t('athro.aboutTitle', { name: activeCharacter.name })}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="mt-0">
          <AthroChat />
        </TabsContent>
        
        <TabsContent value="topics" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Topic selection would go here */}
            <div className="p-6 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">{t('athro.selectTopic')}</h3>
              <p className="text-muted-foreground">
                Topics selection coming soon...
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="about" className="mt-0">
          <AthroProfile />
        </TabsContent>
      </Tabs>
      
      {/* Debug information - only visible during development */}
      {import.meta.env.DEV && (
        <div className="mt-8 p-4 border border-dashed rounded-md bg-slate-50">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Debug Information:</h3>
          <div className="text-xs text-slate-600 space-y-1">
            <div><strong>Subject:</strong> {subject}</div>
            <div><strong>Character Name:</strong> {activeCharacter?.name}</div>
            <div><strong>Current Tab:</strong> {activeTab}</div>
            <div><strong>Allow Science Selection:</strong> {allowScience ? 'Yes' : 'No'}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AthroBase;
