
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ParentMessage } from '@/types/teacher';
import { formatDistanceToNow } from 'date-fns';

interface ReplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inquiry: ParentMessage | null;
  onReplySubmit: (replyText: string) => void;
}

export const ReplyDialog: React.FC<ReplyDialogProps> = ({
  open,
  onOpenChange,
  inquiry,
  onReplySubmit
}) => {
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    
    setIsSubmitting(true);
    onReplySubmit(replyText);
    setReplyText('');
    setIsSubmitting(false);
  };

  if (!inquiry) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reply to {inquiry.parentName}</DialogTitle>
          <DialogDescription>
            Regarding student {inquiry.studentId.substring(0, 5)} • {inquiry.topic}
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-muted p-4 rounded-md my-4">
          <div className="text-xs text-muted-foreground mb-1">
            Original message • {formatDistanceToNow(new Date(inquiry.timestamp), { addSuffix: true })}
          </div>
          <p>{inquiry.message}</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Textarea
              placeholder="Type your reply here..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="min-h-[150px]"
              required
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !replyText.trim()}
              >
                Send Reply
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
