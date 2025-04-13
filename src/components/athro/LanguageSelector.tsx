
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Globe, ArrowRight } from 'lucide-react';

type Language = 'french' | 'german' | 'spanish';

interface LanguageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLanguage: (language: Language) => void;
  selectedLanguage?: Language;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  isOpen,
  onClose,
  onSelectLanguage,
  selectedLanguage
}) => {
  const languages = [
    {
      code: 'french',
      name: 'French',
      flag: '🇫🇷',
      description: 'Learn French grammar, vocabulary, and practice conversation skills',
      greeting: 'Bonjour!'
    },
    {
      code: 'german',
      name: 'German',
      flag: '🇩🇪',
      description: 'Master German cases, sentence structure, and authentic conversations',
      greeting: 'Guten Tag!'
    },
    {
      code: 'spanish',
      name: 'Spanish',
      flag: '🇪🇸',
      description: 'Explore Spanish tenses, vocabulary, and cultural expressions',
      greeting: '¡Hola!'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Select Language
          </DialogTitle>
          <DialogDescription>
            Choose the language you'd like to study with AthroLanguages
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {languages.map((language) => (
            <Card
              key={language.code}
              className={`p-4 cursor-pointer hover:border-primary transition-colors ${
                selectedLanguage === language.code ? 'border-2 border-primary' : ''
              }`}
              onClick={() => onSelectLanguage(language.code as Language)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{language.flag}</span>
                  <div>
                    <h3 className="font-medium">{language.name}</h3>
                    <p className="text-sm text-muted-foreground">{language.description}</p>
                  </div>
                </div>
                <Button 
                  variant={selectedLanguage === language.code ? "default" : "ghost"}
                  size="sm"
                  className="gap-1"
                >
                  {language.greeting} <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LanguageSelector;
