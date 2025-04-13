
// Fix translation function call by removing the second parameter
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAthro } from '@/contexts/AthroContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AthroChat from './AthroChat';
import AthroProfile from './AthroProfile';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from '@/hooks/useTranslation';

interface AthroBaseProps {
  subject: string;
  allowScience?: boolean;
}

const AthroBase: React.FC<AthroBaseProps> = ({ subject, allowScience = false }) => {
  const [activeTab, setActiveTab] = useState<string>('chat');
  const { athroCharacters, setActiveCharacter, activeCharacter } = useAthro();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  useEffect(() => {
    // Find the character for this subject
    const character = athroCharacters?.find(
      (char) => char.subject.toLowerCase() === subject.toLowerCase()
    );
    
    if (character) {
      setActiveCharacter(character);
    }
  }, [subject, athroCharacters, setActiveCharacter]);
  
  const handleBackClick = () => {
    navigate('/athro/select');
  };
  
  if (!activeCharacter) {
    return <div>Loading...</div>;
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
          <AthroProfile character={activeCharacter} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AthroBase;
