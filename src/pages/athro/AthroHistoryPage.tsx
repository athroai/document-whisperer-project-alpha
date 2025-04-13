
import React, { useEffect } from 'react';
import { useAthro } from '@/contexts/AthroContext';
import AthroBase from '@/components/athro/AthroBase';
import { Card } from '@/components/ui/card';
import { getAthroBySubject } from '@/config/athrosConfig';
import { useNavigate } from 'react-router-dom';

const AthroHistoryPage: React.FC = () => {
  const { setActiveCharacter } = useAthro();
  const navigate = useNavigate();
  
  useEffect(() => {
    const historyCharacter = getAthroBySubject('History');
    if (historyCharacter) {
      setActiveCharacter(historyCharacter);
    } else {
      // If character not found, redirect to subject selector
      navigate('/athro');
    }
  }, [setActiveCharacter, navigate]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">AthroHistory</h1>
        <p className="text-muted-foreground">Your personal GCSE History companion</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 h-[calc(100vh-12rem)]">
          <AthroBase subject="History" />
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-4">
            <h2 className="font-medium mb-3">About AthroHistory</h2>
            <p className="text-sm text-muted-foreground">AthroHistory guides you through historical periods, events, and source analysis with engaging explanations and exam-focused techniques.</p>
            
            <h3 className="font-medium mt-4 mb-2">Supported Features:</h3>
            <ul className="text-sm space-y-1 list-disc pl-4">
              <li>Timeline explanations</li>
              <li>Historical source analysis</li>
              <li>Key event breakdowns</li>
              <li>Essay structure guidance</li>
              <li>Past paper practice</li>
              <li>Topic-specific review</li>
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
              <li>Ask AthroHistory to explain key historical events</li>
              <li>Practice analyzing historical sources and documents</li>
              <li>Get help structuring history essays</li>
              <li>Review past paper questions with guided explanations</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AthroHistoryPage;
