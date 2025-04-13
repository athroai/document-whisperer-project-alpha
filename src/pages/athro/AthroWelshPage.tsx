
// Fix translation function call by removing the second parameter
import React from 'react';
import AthroBase from '@/components/athro/AthroBase';
import { useAthro } from '@/contexts/AthroContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const AthroWelshPage: React.FC = () => {
  const { language, t } = useTranslation();
  const { activeCharacter } = useAthro();
  
  // Determine if we should display a language recommendation notice
  const showLanguageRecommendation = !activeCharacter || language !== 'cy';

  return (
    <div className="container mx-auto px-4 py-6">
      {showLanguageRecommendation && (
        <Card className="mb-6 border-cyan-200 bg-cyan-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-cyan-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-cyan-800">Welsh Language Support</h3>
                <p className="text-sm text-cyan-700 mt-1">
                  For the best experience with AthroWelsh, we recommend switching to Welsh language mode.
                  You can change your language preference in the top right corner.
                </p>
                
                <div className="mt-3">
                  <Button variant="outline" size="sm" className="border-cyan-300 text-cyan-700 hover:bg-cyan-100">
                    Learn more about Welsh language learning
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <AthroBase subject="Welsh" />
    </div>
  );
};

export default AthroWelshPage;
