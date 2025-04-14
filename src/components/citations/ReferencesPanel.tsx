
import React, { useState } from 'react';
import { Citation } from '@/types/citations';
import { ChevronDown, ChevronUp, FileText, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReferencesPanelProps {
  citations: Citation[];
  onCitationClick?: (citation: Citation) => void;
}

const ReferencesPanel: React.FC<ReferencesPanelProps> = ({ citations, onCitationClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (citations.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 border border-gray-200 rounded-md">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full p-3 text-sm font-medium text-left bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <FileText size={16} />
          <span>AI References ({citations.length})</span>
        </div>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      <div className={cn("overflow-hidden transition-all", 
        isExpanded ? "max-h-96 overflow-y-auto" : "max-h-0")}>
        <div className="p-3 bg-white">
          <ul className="space-y-3">
            {citations.map((citation) => (
              <li key={citation.id} className="text-sm">
                <div 
                  className="flex gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-md"
                  onClick={() => onCitationClick?.(citation)}
                >
                  <span className="font-medium text-blue-500 min-w-[24px]">{citation.label}</span>
                  <div className="flex-1">
                    <div className="font-medium">{citation.filename}</div>
                    <div className="text-gray-600 text-xs">
                      {citation.page && `Page ${citation.page}`}
                      {citation.section && citation.page && ' • '}
                      {citation.section && `Section: ${citation.section}`}
                    </div>
                    {citation.highlight && (
                      <div className="mt-1 text-xs italic text-gray-500 border-l-2 border-gray-300 pl-2">
                        "{citation.highlight}"
                      </div>
                    )}
                  </div>
                  <ExternalLink size={16} className="text-gray-400 self-center flex-shrink-0" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReferencesPanel;
