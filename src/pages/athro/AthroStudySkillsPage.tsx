
import React, { useEffect } from 'react';
import { useAthro } from '@/contexts/AthroContext';
import AthroBase from '@/components/athro/AthroBase';
import { Card } from '@/components/ui/card';
import { getAthroBySubject } from '@/config/athrosConfig';
import { useNavigate } from 'react-router-dom';

const AthroStudySkillsPage: React.FC = () => {
  const { setActiveCharacter } = useAthro();
  const navigate = useNavigate();
  
  useEffect(() => {
    const studySkillsCharacter = getAthroBySubject('Study Skills');
    if (studySkillsCharacter) {
      setActiveCharacter(studySkillsCharacter);
    } else {
      // If character not found, redirect to subject selector
      navigate('/athro');
    }
  }, [setActiveCharacter, navigate]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">AthroTime</h1>
        <p className="text-muted-foreground">Your personal study skills mentor</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 h-[calc(100vh-12rem)]">
          <AthroBase subject="Study Skills" />
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-4">
            <h2 className="font-medium mb-3">About AthroTime</h2>
            <p className="text-sm text-muted-foreground">AthroTime helps you develop effective study habits, manage your time, and create revision strategies for GCSE success.</p>
            
            <h3 className="font-medium mt-4 mb-2">Supported Features:</h3>
            <ul className="text-sm space-y-1 list-disc pl-4">
              <li>Study timetable creation</li>
              <li>Revision technique guidance</li>
              <li>Time management strategies</li>
              <li>Memory improvement techniques</li>
              <li>Exam preparation support</li>
              <li>Personal organization tips</li>
            </ul>
          </Card>
          
          <Card className="p-4">
            <h2 className="font-medium mb-3">Exam Boards</h2>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                All Exam Boards
              </span>
            </div>
          </Card>
          
          <Card className="p-4">
            <h2 className="font-medium mb-3">Study Tips</h2>
            <ul className="text-sm space-y-2 list-disc pl-4">
              <li>Ask for help creating a personalized study schedule</li>
              <li>Get advice on the best revision techniques for your learning style</li>
              <li>Learn how to break down complex topics into manageable chunks</li>
              <li>Discover strategies to maintain focus during study sessions</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AthroStudySkillsPage;
