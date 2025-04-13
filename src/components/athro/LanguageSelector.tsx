
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Globe } from 'lucide-react';

type Language = 'french' | 'german' | 'spanish';

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  selectedLanguage, 
  onLanguageChange 
}) => {
  const handleChange = (value: string) => {
    onLanguageChange(value as Language);
  };

  return (
    <Card className="p-4 flex items-center justify-between">
      <div className="flex items-center">
        <Globe className="h-5 w-5 text-blue-600 mr-2" />
        <span className="font-medium">Currently studying: </span>
        <Badge className="ml-2 capitalize">{selectedLanguage}</Badge>
      </div>
      <Select value={selectedLanguage} onValueChange={handleChange}>
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
  );
};

export default LanguageSelector;
