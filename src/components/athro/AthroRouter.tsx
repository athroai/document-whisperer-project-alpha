
import React, { useEffect } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { useAthro } from '@/contexts/AthroContext';
import AthroChat from './AthroChat';
import AthroSubjectSelect from './AthroSubjectSelect';
import { AthroSubject } from '@/types/athro';

interface KnowledgeResponse {
  enhancedContext: string;
  hasKnowledgeResults: boolean;
  citations: any[];
}

const AthroRouter: React.FC = () => {
  const { subject } = useParams<{ subject?: string }>();
  const navigate = useNavigate();
  const { currentSubject, setCurrentSubject } = useAthro();

  // Mock function to fetch knowledge for a query
  const fetchKnowledgeForQuery = async (query: string): Promise<KnowledgeResponse> => {
    // In a real implementation, this would call your knowledge search service
    console.log('Fetching knowledge for:', query);
    return {
      enhancedContext: 'Enhanced context from knowledge base',
      hasKnowledgeResults: Math.random() > 0.5, // Randomly have results or not for testing
      citations: []
    };
  };
  
  // Update current subject when route changes
  useEffect(() => {
    if (subject) {
      // Convert first letter to uppercase and rest to lowercase
      const formattedSubject = subject.charAt(0).toUpperCase() + subject.slice(1).toLowerCase();
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
