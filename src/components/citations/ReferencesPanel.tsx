
import React from 'react';
import { Citation } from '@/types/citations';
import { Button } from '@/components/ui/button';
import { FileText, ArrowRight } from 'lucide-react';

interface ReferencesPanelProps {
  citations: Citation[];
  onCitationClick?: (citation: Citation) => void;
  compact?: boolean;
}

const ReferencesPanel: React.FC<ReferencesPanelProps> = ({ 
  citations,
  onCitationClick,
  compact = false 
}) => {
  if (!citations || citations.length === 0) {
    return null;
  }

  return (
    <div className={`mt-3 pt-3 border-t border-gray-200 ${compact ? '' : 'space-y-2'}`}>
      <div className="flex items-center justify-between">
        <h5 className="text-sm font-medium text-gray-700">References</h5>
        {citations.length > 3 && !compact && (
          <Button variant="link" size="sm" className="p-0 h-auto text-xs">
            View All
          </Button>
        )}
      </div>
      
      {compact ? (
        <div className="flex flex-wrap gap-1 mt-2">
          {citations.map((citation) => (
            <Button
              key={citation.id}
              variant="outline"
              size="sm"
              className="h-6 text-xs py-0 px-2 bg-gray-50"
              onClick={() => onCitationClick?.(citation)}
            >
              <span className="font-mono">{citation.label}</span>
            </Button>
          ))}
        </div>
      ) : (
        <div className="space-y-2 mt-2">
          {citations.slice(0, 3).map((citation) => (
            <div 
              key={citation.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-md text-sm"
            >
              <div className="flex items-center space-x-2">
                <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-700">
                  {citation.label}
                </span>
                <span className="text-gray-700 truncate max-w-[200px]">
                  {citation.filename}
                </span>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-7 w-7 p-0"
                onClick={() => onCitationClick?.(citation)}
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReferencesPanel;
