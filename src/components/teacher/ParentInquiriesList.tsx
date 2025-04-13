
import React, { useState } from 'react';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ParentMessage } from '@/types/teacher';
import { ReplyDialog } from './ReplyDialog';
import { AlertCircle, CheckCircle2, Clock, MessageSquare } from 'lucide-react';

interface ParentInquiriesListProps {
  inquiries: ParentMessage[];
  loading: boolean;
  onReplySubmitted: (inquiryId: string, replyText: string) => void;
  onMarkAsRead?: (inquiryId: string) => void;
}

export const ParentInquiriesList: React.FC<ParentInquiriesListProps> = ({ 
  inquiries, 
  loading,
  onReplySubmitted,
  onMarkAsRead 
}) => {
  const [selectedInquiry, setSelectedInquiry] = useState<ParentMessage | null>(null);
  const [isReplyOpen, setIsReplyOpen] = useState(false);

  const handleReply = (inquiry: ParentMessage) => {
    if (inquiry.status === 'unread' && onMarkAsRead) {
      onMarkAsRead(inquiry.id);
    }
    setSelectedInquiry(inquiry);
    setIsReplyOpen(true);
  };

  const handleReplySubmit = (replyText: string) => {
    if (selectedInquiry) {
      onReplySubmitted(selectedInquiry.id, replyText);
      setIsReplyOpen(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unread':
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Unread</Badge>;
      case 'read':
        return <Badge variant="outline" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Read</Badge>;
      case 'replied':
        return <Badge variant="secondary" className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Replied</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatMessagePreview = (message: string) => {
    return message.length > 80 ? message.substring(0, 80) + '...' : message;
  };

  if (loading) {
    return <div className="flex justify-center my-8">Loading inquiries...</div>;
  }

  if (inquiries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <MessageSquare className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No inquiries yet</h3>
        <p className="text-muted-foreground max-w-md">
          When parents send inquiries about their children, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Parent</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Topic</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Received</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiries.map((inquiry) => (
              <TableRow key={inquiry.id}>
                <TableCell className="font-medium">
                  <div>
                    {inquiry.parentName}
                    <div className="text-xs text-muted-foreground">{inquiry.parentEmail}</div>
                  </div>
                </TableCell>
                <TableCell>
                  {/* In a real app, we'd resolve the student name from ID */}
                  Student {inquiry.studentId.substring(0, 5)}
                </TableCell>
                <TableCell>{inquiry.topic}</TableCell>
                <TableCell className="max-w-xs">
                  {formatMessagePreview(inquiry.message)}
                </TableCell>
                <TableCell>{formatTimestamp(inquiry.timestamp)}</TableCell>
                <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleReply(inquiry)}
                  >
                    Reply
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ReplyDialog
        open={isReplyOpen}
        onOpenChange={setIsReplyOpen}
        inquiry={selectedInquiry}
        onReplySubmit={handleReplySubmit}
      />
    </>
  );
};
