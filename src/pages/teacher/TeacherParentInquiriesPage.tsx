
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card, 
  CardContent,
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ParentInquiriesService } from '@/services/parentInquiriesService';
import { ParentInquiriesList } from '@/components/teacher/ParentInquiriesList';
import { InquiryStatusFilter } from '@/components/teacher/InquiryStatusFilter';
import { InquiryTopicFilter } from '@/components/teacher/InquiryTopicFilter';
import { InquiryClassFilter } from '@/components/teacher/InquiryClassFilter';
import { ParentMessage } from '@/types/teacher';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Mail } from 'lucide-react';

const TeacherParentInquiriesPage: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState<ParentMessage[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<ParentMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');

  useEffect(() => {
    const fetchInquiries = async () => {
      setLoading(true);
      try {
        const teacherId = user?.id || '';
        const data = await ParentInquiriesService.getInquiriesForTeacher(teacherId);
        setInquiries(data);
        setFilteredInquiries(data);
      } catch (error) {
        console.error('Error fetching parent inquiries:', error);
        toast({
          title: "Error",
          description: "Failed to load parent inquiries.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, [user, toast]);

  useEffect(() => {
    // Apply filters when they change
    let result = [...inquiries];
    
    if (statusFilter !== 'all') {
      result = result.filter(inquiry => inquiry.status === statusFilter);
    }
    
    if (classFilter !== 'all') {
      result = result.filter(inquiry => inquiry.classId === classFilter);
    }
    
    if (topicFilter !== 'all') {
      result = result.filter(inquiry => inquiry.topic === topicFilter);
    }
    
    setFilteredInquiries(result);
  }, [inquiries, statusFilter, classFilter, topicFilter]);

  const handleReplySubmitted = async (inquiryId: string, replyText: string) => {
    try {
      await ParentInquiriesService.sendReply(inquiryId, user?.id || '', replyText);
      
      // Update the local inquiries
      setInquiries(prevInquiries => 
        prevInquiries.map(inquiry => 
          inquiry.id === inquiryId 
            ? { ...inquiry, reply: replyText, status: 'replied' }
            : inquiry
        )
      );
      
      // Get parent name from the inquiry
      const inquiry = inquiries.find(inq => inq.id === inquiryId);
      
      toast({
        title: "Reply Sent",
        description: `Your reply has been sent to ${inquiry?.parentName}`,
        duration: 3000
      });
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: "Error",
        description: "Failed to send reply. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const getUnreadCount = () => {
    return inquiries.filter(inquiry => inquiry.status === 'unread').length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Parent Inquiries</h1>
          <p className="text-muted-foreground">
            Manage and respond to messages from parents about their children's progress.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {getUnreadCount() > 0 && (
            <Badge variant="destructive" className="text-sm">
              {getUnreadCount()} unread
            </Badge>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <InquiryStatusFilter value={statusFilter} onChange={setStatusFilter} />
        <InquiryClassFilter value={classFilter} onChange={setClassFilter} />
        <InquiryTopicFilter value={topicFilter} onChange={setTopicFilter} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare size={18} />
            Parent Inquiries
          </CardTitle>
          <CardDescription>
            Showing {filteredInquiries.length} {filteredInquiries.length === 1 ? 'inquiry' : 'inquiries'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ParentInquiriesList 
            inquiries={filteredInquiries} 
            loading={loading} 
            onReplySubmitted={handleReplySubmitted}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherParentInquiriesPage;
