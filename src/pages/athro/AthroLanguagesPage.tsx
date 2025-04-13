
import React, { useEffect } from 'react';
import { useAthro } from '@/contexts/AthroContext';
import AthroBase from '@/components/athro/AthroBase';
import { Card } from '@/components/ui/card';
import { getAthroBySubject } from '@/config/athrosConfig';
import { useNavigate } from 'react-router-dom';

const AthroLanguagesPage: React.FC = () => {
  const { setActiveCharacter } = useAthro();
  const navigate = useNavigate();
  
  useEffect(() => {
    const languagesCharacter = getAthroBySubject('Languages');
    if (languagesCharacter) {
      setActiveCharacter(languagesCharacter);
    } else {
      // If character not found, redirect to subject selector
      navigate('/athro');
    }
  }, [setActiveCharacter, navigate]); // Added both dependencies to prevent infinite rendering
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">AthroLanguages</h1>
        <p className="text-muted-foreground">Your personal GCSE Modern Foreign Languages tutor</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 h-[calc(100vh-12rem)]">
          <AthroBase showTopicSelector={true} />
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-4">
            <h2 className="font-medium mb-3">About AthroLanguages</h2>
            <p className="text-sm text-muted-foreground">AthroLanguages supports your learning of French, Spanish, and German with vocabulary practice, conversation skills, and grammar explanations.</p>
            
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
              <li>Practice conversations in your target language</li>
              <li>Ask for help with grammar and vocabulary</li>
              <li>Request translation exercises for practice</li>
              <li>Review past paper questions with guided explanations</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AthroLanguagesPage;
