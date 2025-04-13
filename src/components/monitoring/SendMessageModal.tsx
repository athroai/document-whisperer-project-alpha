
import React, { useState } from 'react';
import { StudentSession } from '@/types/monitoring';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { monitoringService } from '@/services/monitoringService';
import { useToast } from '@/hooks/use-toast';

interface SendMessageModalProps {
  student: StudentSession | null;
  open: boolean;
  onClose: () => void;
}

const SendMessageModal: React.FC<SendMessageModalProps> = ({
  student,
  open,
  onClose,
}) => {
  const [message, setMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const { toast } = useToast();
  
  const quickMessages = [
    "Doing great - keep it up!",
    "Take your time on this one.",
    "Let me know if you need help.",
    "Good progress today!",
    "Try reading the question again."
  ];
  
  if (!student) {
    return null;
  }
  
  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    try {
      setIsSending(true);
      await monitoringService.sendMessageToStudent(student.studentId, message);
      
      toast({
        title: "Message sent",
        description: `Your message has been sent to ${student.studentName}.`
      });
      
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to send message",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };
  
  const handleSelectQuickMessage = (quickMessage: string) => {
    setMessage(quickMessage);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Message to {student.studentName}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="message" className="mb-2 block">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a supportive message..."
              className="min-h-[100px]"
            />
          </div>
          
          <div>
            <Label className="mb-1 block">Quick Messages</Label>
            <div className="flex flex-wrap gap-2">
              {quickMessages.map((quickMessage, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectQuickMessage(quickMessage)}
                >
                  {quickMessage}
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSendMessage}
            disabled={!message.trim() || isSending}
          >
            {isSending ? 'Sending...' : 'Send Message'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendMessageModal;
