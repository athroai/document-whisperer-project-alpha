
import React from 'react';
import { Citation } from '@/types/citations';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, FileText } from 'lucide-react';

interface CitationSidebarProps {
  citations: Citation[];
  onCitationClick?: (citation: Citation) => void;
  currentMessageId?: string;
}

const CitationSidebar: React.FC<CitationSidebarProps> = ({
  citations,
  onCitationClick,
  currentMessageId,
}) => {
  if (!citations || citations.length === 0) {
    return null;
  }

  return (
    <div className="w-72 border-l border-gray-200 bg-gray-50 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h3 className="font-medium text-gray-900">
          References ({citations.length})
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Sources cited in this conversation
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {citations.map((citation) => (
            <div
              key={citation.id}
              className="bg-white p-3 rounded-md border border-gray-200 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <span className="font-mono text-sm bg-lime-100 text-lime-800 py-0.5 px-1.5 rounded">
                    {citation.label}
                  </span>
                  <FileText className="h-4 w-4 text-gray-400 ml-2" />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => onCitationClick?.(citation)}
                >
                  <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                </Button>
              </div>

              <h4 className="font-medium text-gray-900 mt-2 line-clamp-1">
                {citation.filename}
              </h4>

              {(citation.section || citation.page) && (
                <div className="text-xs text-gray-500 mt-1 space-x-2">
                  {citation.section && <span>Section: {citation.section}</span>}
                  {citation.page && <span>Page: {citation.page}</span>}
                </div>
              )}

              {citation.highlight && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600 border-l-2 border-gray-300">
                  <p className="line-clamp-3 italic">"{citation.highlight}"</p>
                </div>
              )}

              {citation.url && (
                <div className="mt-2 text-right">
                  <Button
                    variant="link"
                    size="sm"
                    asChild
                    className="h-auto p-0 text-xs"
                  >
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center"
                    >
                      View Source <ArrowRight className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CitationSidebar;
