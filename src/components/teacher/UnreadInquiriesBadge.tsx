
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { ParentInquiriesService } from '@/services/parentInquiriesService';
import { useAuth } from '@/contexts/AuthContext';

export const UnreadInquiriesBadge: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { state } = useAuth();
  const { user } = state;

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (user && user.id) {
        try {
          const count = await ParentInquiriesService.getUnreadCount(user.id);
          setUnreadCount(count);
        } catch (error) {
          console.error('Error fetching unread count:', error);
        }
      }
    };

    fetchUnreadCount();
    
    // In a real app, we would use a real-time listener here
    const interval = setInterval(fetchUnreadCount, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [user]);

  if (unreadCount === 0) {
    return null;
  }

  return (
    <Badge variant="destructive" className="ml-auto">
      {unreadCount}
    </Badge>
  );
};
