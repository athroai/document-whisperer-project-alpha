
import React, { useEffect } from 'react';
import { useAthro } from '@/contexts/AthroContext';
import AthroBase from '@/components/athro/AthroBase';
import { Card } from '@/components/ui/card';
import { getAthroBySubject } from '@/config/athrosConfig';
import { useNavigate } from 'react-router-dom';

const AthroWelshPage: React.FC = () => {
  const { setActiveCharacter } = useAthro();
  const navigate = useNavigate();
  
  useEffect(() => {
    const welshCharacter = getAthroBySubject('Welsh');
    if (welshCharacter) {
      setActiveCharacter(welshCharacter);
    } else {
      // If character not found, redirect to subject selector
      navigate('/athro');
    }
  }, [setActiveCharacter, navigate]); // Added both dependencies to prevent infinite rendering
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">AthroWelsh</h1>
        <p className="text-muted-foreground">Eich mentor Cymraeg ar gyfer TGAU</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 h-[calc(100vh-12rem)]">
          <AthroBase showTopicSelector={true} />
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-4">
            <h2 className="font-medium mb-3">About AthroWelsh</h2>
            <p className="text-sm text-muted-foreground">Bydd AthroWelsh yn eich helpu i ddatblygu eich sgiliau iaith Gymraeg ar gyfer arholiadau TGAU, gan gynnwys siarad, ysgrifennu, a deall.</p>
            
            <h3 className="font-medium mt-4 mb-2">Supported Features:</h3>
            <ul className="text-sm space-y-1 list-disc pl-4">
              <li>Welsh language support</li>
              <li>Grammar explanations</li>
              <li>Vocabulary practice</li>
              <li>Writing techniques</li>
              <li>Literature analysis</li>
              <li>Past paper practice</li>
            </ul>
          </Card>
          
          <Card className="p-4">
            <h2 className="font-medium mb-3">Exam Boards</h2>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                WJEC
              </span>
            </div>
          </Card>
          
          <Card className="p-4">
            <h2 className="font-medium mb-3">Study Tips</h2>
            <ul className="text-sm space-y-2 list-disc pl-4">
              <li>Practice conversations in Welsh with AthroWelsh</li>
              <li>Ask for help with grammar and vocabulary</li>
              <li>Get feedback on your Welsh writing</li>
              <li>Review Welsh literature with guided explanations</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AthroWelshPage;
