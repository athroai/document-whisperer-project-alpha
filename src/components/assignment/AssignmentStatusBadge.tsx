
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, AlertCircle, FileCheck, Eye } from 'lucide-react';

interface AssignmentStatusBadgeProps {
  status: 'submitted' | 'marked' | 'returned' | 'not-started' | 'in-progress';
  className?: string;
}

export const AssignmentStatusBadge: React.FC<AssignmentStatusBadgeProps> = ({ status, className }) => {
  switch (status) {
    case 'submitted':
      return (
        <Badge variant="secondary" className={className}>
          <FileCheck className="h-3 w-3 mr-1" />
          Submitted
        </Badge>
      );
    
    case 'marked':
      return (
        <Badge variant="default" className={`bg-green-100 text-green-800 hover:bg-green-100 ${className}`}>
          <CheckCircle className="h-3 w-3 mr-1" />
          Marked
        </Badge>
      );
    
    case 'returned':
      return (
        <Badge variant="default" className={`bg-blue-100 text-blue-800 hover:bg-blue-100 ${className}`}>
          <Eye className="h-3 w-3 mr-1" />
          Feedback Available
        </Badge>
      );
    
    case 'in-progress':
      return (
        <Badge variant="outline" className={`bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200 ${className}`}>
          <Clock className="h-3 w-3 mr-1" />
          In Progress
        </Badge>
      );
    
    case 'not-started':
    default:
      return (
        <Badge variant="outline" className={`bg-gray-50 text-gray-800 hover:bg-gray-100 ${className}`}>
          <AlertCircle className="h-3 w-3 mr-1" />
          Not Started
        </Badge>
      );
  }
};
