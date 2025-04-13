
import React, { useEffect } from 'react';
import { useAthro } from '@/contexts/AthroContext';
import AthroBase from '@/components/athro/AthroBase';
import { Card } from '@/components/ui/card';
import { getAthroBySubject } from '@/config/athrosConfig';
import { useNavigate } from 'react-router-dom';

const AthroMathsPage: React.FC = () => {
  const { setActiveCharacter } = useAthro();
  const navigate = useNavigate();
  
  useEffect(() => {
    const mathsCharacter = getAthroBySubject('Mathematics');
    if (mathsCharacter) {
      setActiveCharacter(mathsCharacter);
    } else {
      // If character not found, redirect to subject selector
      navigate('/athro');
    }
  }, [setActiveCharacter, navigate]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">AthroMaths</h1>
        <p className="text-muted-foreground">Your personal GCSE Mathematics mentor</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 h-[calc(100vh-12rem)]">
          <AthroBase subject="Mathematics" />
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-4">
            <h2 className="font-medium mb-3">About AthroMaths</h2>
            <p className="text-sm text-muted-foreground">AthroMaths helps you tackle all aspects of GCSE Mathematics, from algebra to statistics, with step-by-step explanations and practice problems.</p>
            
            <h3 className="font-medium mt-4 mb-2">Supported Features:</h3>
            <ul className="text-sm space-y-1 list-disc pl-4">
              <li>Mathematical notation support</li>
              <li>Step-by-step problem solving</li>
              <li>Past paper practice</li>
              <li>Topic-specific review</li>
              <li>Exam board alignment</li>
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
              <li>Ask AthroMaths to explain concepts step-by-step</li>
              <li>Request practice problems on topics you find difficult</li>
              <li>Try solving past paper questions with guidance</li>
              <li>Save important explanations to review later</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AthroMathsPage;
