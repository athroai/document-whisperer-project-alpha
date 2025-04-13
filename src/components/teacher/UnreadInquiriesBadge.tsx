
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { ParentInquiriesService } from '@/services/parentInquiriesService';

export const UnreadInquiriesBadge: React.FC = () => {
  const [count, setCount] = useState(0);
  const { state } = useAuth();
  const { user } = state;

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (user && (user.role === 'teacher' || user.role === 'admin')) {
        try {
          const unreadCount = await ParentInquiriesService.getUnreadCount(user.id);
          setCount(unreadCount);
        } catch (error) {
          console.error('Failed to fetch unread inquiries count:', error);
        }
      }
    };

    fetchUnreadCount();
    
    // In a real app, we would set up a listener or polling here
    const intervalId = setInterval(fetchUnreadCount, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, [user]);

  if (count === 0) return null;

  return (
    <Badge variant="destructive" className="ml-auto">
      {count}
    </Badge>
  );
};
