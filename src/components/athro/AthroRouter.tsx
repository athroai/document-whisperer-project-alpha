
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import AthroChat from './AthroChat';
import AthroSubjectSelect from './AthroSubjectSelect';
import { AthroSubject } from '@/types/athro';
import { useAthro } from '@/contexts/AthroContext';
import { useAuth } from '@/contexts/AuthContext';
import { searchKnowledgeBase } from '@/services/knowledgeBaseService';
import { createCitationsFromKnowledgeResults } from '@/services/fileAwareAiService';
import { Citation } from '@/types/citations';

interface Knowledge {
  enhancedContext: string;
  hasKnowledgeResults: boolean;
  citations: Citation[];
}

const AthroRouter: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth().state;
  const { characters, activeCharacter, setActiveCharacter } = useAthro();
  const [isLoading, setIsLoading] = useState(false);
  
  // Check the URL for subject path
  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const subjectPath = pathParts[2];
    
    if (subjectPath && subjectPath !== 'select') {
      try {
        // Try to find a character with the matching subject
        const subject = subjectPath.charAt(0).toUpperCase() + subjectPath.slice(1);
        const foundCharacter = characters.find(
          c => c.subject.toLowerCase() === subject.toLowerCase()
        );
        
        if (foundCharacter) {
          setActiveCharacter(foundCharacter);
        } else {
          console.error('Invalid subject in URL:', subjectPath);
          navigate('/athro/select', { replace: true });
        }
      } catch (error) {
        console.error('Error processing subject in URL:', error);
        navigate('/athro/select', { replace: true });
      }
    }
  }, [location.pathname, setActiveCharacter, navigate, characters]);
  
  // Redirect to subject selection if no subject is selected
  useEffect(() => {
    if (location.pathname === '/athro' || location.pathname === '/athro/') {
      navigate('/athro/select', { replace: true });
    }
  }, [location.pathname, navigate]);

  // Function to fetch knowledge for a given query
  const fetchKnowledgeForQuery = async (query: string): Promise<Knowledge> => {
    setIsLoading(true);
    try {
      if (!activeCharacter) {
        return {
          enhancedContext: '',
          hasKnowledgeResults: false,
          citations: []
        };
      }
      
      const subjectString = activeCharacter.subject.toLowerCase();
      const searchResults = await searchKnowledgeBase(query, subjectString);
      
      if (!searchResults || searchResults.length === 0) {
        return {
          enhancedContext: '',
          hasKnowledgeResults: false,
          citations: []
        };
      }
      
      // Create citations from the search results
      const citations = createCitationsFromKnowledgeResults(searchResults);
      
      // Create enhanced context from the search results
      const enhancedContext = searchResults
        .map(result => result.chunk.content)
        .join('\n\n');
      
      return {
        enhancedContext,
        hasKnowledgeResults: true,
        citations
      };
    } catch (error) {
      console.error('Error fetching knowledge for query:', error);
      return {
        enhancedContext: '',
        hasKnowledgeResults: false,
        citations: []
      };
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Routes>
      <Route path="/select" element={<AthroSubjectSelect />} />
      <Route 
        path="/:subject" 
        element={
          <AthroChat 
            fetchKnowledgeForQuery={fetchKnowledgeForQuery} 
            isLoading={isLoading} 
          />
        } 
      />
    </Routes>
  );
};

export default AthroRouter;
