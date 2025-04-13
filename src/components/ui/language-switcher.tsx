
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

type Language = {
  code: 'en' | 'cy' | 'es' | 'fr' | 'de';
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'cy', name: 'Welsh', nativeName: 'Cymraeg', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' }
];

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { state, updateUser } = useAuth();
  const { t, changeLanguage } = useTranslation();
  
  const currentLanguage = state.user?.preferredLanguage || 'en';
  const isWelshEligible = state.user?.welshEligible || false;
  
  // If user is not Welsh eligible, don't render the component
  if (!isWelshEligible) {
    return null;
  }
  
  const handleLanguageChange = (langCode: 'en' | 'cy' | 'es' | 'fr' | 'de') => {
    // Update language in the translation system
    changeLanguage(langCode);
    
    // Save user preference if logged in
    if (state.user) {
      updateUser({ 
        preferredLanguage: langCode 
      });
    }
    
    // Also store in localStorage for persistence across sessions
    localStorage.setItem('preferredLanguage', langCode);
  };
  
  const selectedLanguage = languages.find(lang => lang.code === currentLanguage) || languages[0];
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={`gap-1 ${className}`}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{selectedLanguage.flag} {selectedLanguage.name}</span>
          <span className="sm:hidden">{selectedLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="cursor-pointer"
          >
            <span className="mr-2">{language.flag}</span>
            {language.nativeName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
