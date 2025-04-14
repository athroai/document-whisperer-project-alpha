
import React from 'react';
import { Citation } from '@/types/citations';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface InlineCitationProps {
  citation: Citation;
  onClick?: () => void;
}

const InlineCitation: React.FC<InlineCitationProps> = ({ citation, onClick }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <sup 
            className="text-blue-500 font-medium cursor-pointer hover:text-blue-700 transition-colors"
            onClick={onClick}
          >
            {citation.label}
          </sup>
        </TooltipTrigger>
        <TooltipContent className="bg-white p-3 max-w-xs shadow-lg rounded-md border border-gray-200">
          <div className="text-sm">
            <p className="font-bold">{citation.filename}</p>
            {citation.page && <p>Page: {citation.page}</p>}
            {citation.section && <p>Section: {citation.section}</p>}
            {citation.highlight && (
              <p className="mt-2 italic text-gray-700 border-l-2 border-gray-300 pl-2">
                "{citation.highlight}"
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              {new Date(citation.timestamp).toLocaleString()}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default InlineCitation;
