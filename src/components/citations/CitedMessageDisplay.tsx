
import React, { useState } from 'react';
import { Citation, CitedMessage } from '@/types/citations';
import { renderWithCitations } from '@/utils/citationUtils';
import ReferencesPanel from './ReferencesPanel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface CitedMessageDisplayProps {
  message: CitedMessage;
}

const CitedMessageDisplay: React.FC<CitedMessageDisplayProps> = ({ message }) => {
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  
  const handleCitationClick = (citation: Citation) => {
    setSelectedCitation(citation);
  };
  
  const renderedContent = renderWithCitations(
    message.content,
    message.citations,
    handleCitationClick
  );
  
  return (
    <div className="cited-message">
      <div className="message-content">{renderedContent}</div>
      
      <ReferencesPanel 
        citations={message.citations} 
        onCitationClick={handleCitationClick} 
      />
      
      <Dialog open={!!selectedCitation} onOpenChange={(open) => !open && setSelectedCitation(null)}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>Reference: {selectedCitation?.label} {selectedCitation?.filename}</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            {selectedCitation?.url && selectedCitation.filename.endsWith('.pdf') ? (
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <AspectRatio ratio={4/3} className="bg-gray-100">
                  <iframe 
                    src={`${selectedCitation.url}#page=${selectedCitation.page || 1}`}
                    className="w-full h-full"
                    title={`Document: ${selectedCitation.filename}`}
                  />
                </AspectRatio>
              </div>
            ) : (
              <div className="p-4 border border-gray-200 rounded-md">
                <p className="text-center text-gray-500">
                  {selectedCitation?.highlight || 'No preview available for this reference'}
                </p>
                {selectedCitation?.url && (
                  <div className="mt-4 text-center">
                    <a 
                      href={selectedCitation.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Open Source Document
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CitedMessageDisplay;
