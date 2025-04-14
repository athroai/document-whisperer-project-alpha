
import React, { useEffect } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { useAthro } from '@/contexts/AthroContext';
import AthroChat from './AthroChat';
import AthroSubjectSelect from './AthroSubjectSelect';
import { getSubjectFromPath } from '@/utils/subjectRouteUtils';
import { fetchKnowledgeForQuery } from '@/services/fileAwareService';

const AthroRouter: React.FC = () => {
  const { subject } = useParams<{ subject?: string }>();
  const navigate = useNavigate();
  const { currentSubject, setCurrentSubject, characters } = useAthro();
  
  // Update current subject when route changes
  useEffect(() => {
    if (subject) {
      // Convert path to formal subject name using our utility function
      const formattedSubject = getSubjectFromPath(subject);
      setCurrentSubject(formattedSubject);
    }
  }, [subject, setCurrentSubject]);
  
  return (
    <Routes>
      <Route index element={<AthroSubjectSelect />} />
      <Route path="select" element={<AthroSubjectSelect />} />
      <Route 
        path=":subject" 
        element={
          <AthroChat 
            fetchKnowledgeForQuery={fetchKnowledgeForQuery} 
            isLoading={false} 
          />
        } 
      />
    </Routes>
  );
};

export default AthroRouter;
