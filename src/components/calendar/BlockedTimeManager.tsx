
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { BlockedTimePreference } from '@/types/calendar';
import { useBlockedTimes } from '@/hooks/useBlockedTimes';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Trash, Clock, Edit } from 'lucide-react';

interface BlockedTimeManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BlockedTimeManager: React.FC<BlockedTimeManagerProps> = ({ open, onOpenChange }) => {
  const { blockedTimes, addBlockedTime, updateTime, removeBlockedTime, isLoading } = useBlockedTimes();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<string>('1'); // Monday default
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const resetForm = () => {
    setTitle('');
    setDayOfWeek('1');
    setStartTime('09:00');
    setEndTime('10:00');
    setReason('');
    setPriority('medium');
    setIsAdding(false);
    setEditingId(null);
  };
  
  const handleStartEditing = (blockedTime: BlockedTimePreference) => {
    setTitle(blockedTime.title);
    setDayOfWeek(blockedTime.day_of_week.toString());
    setStartTime(blockedTime.start_time);
    setEndTime(blockedTime.end_time);
    setReason(blockedTime.reason || '');
    setPriority(blockedTime.priority);
    setEditingId(blockedTime.id);
    setIsAdding(true);
  };

  const handleSubmit = async () => {
    if (!title) {
      return;
    }
    
    const timeData = {
      title,
      day_of_week: parseInt(dayOfWeek),
      start_time: startTime,
      end_time: endTime,
      reason,
      priority
    };

    if (editingId) {
      await updateTime(editingId, timeData);
    } else {
      await addBlockedTime(timeData);
    }
    
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this blocked time?")) {
      await removeBlockedTime(id);
    }
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const formatTimeRange = (start: string, end: string) => {
    try {
      const startDate = parse(start, 'HH:mm', new Date());
      const endDate = parse(end, 'HH:mm', new Date());
      return `${format(startDate, 'h:mm a')} - ${format(endDate, 'h:mm a')}`;
    } catch (error) {
      return `${start} - ${end}`;
    }
  };
  
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isAdding ? (editingId ? 'Edit Blocked Time' : 'Add New Blocked Time') : 'Manage Blocked Times'}</DialogTitle>
          <DialogDescription>
            {isAdding 
              ? 'Define times when you are not available for study sessions'
              : 'View and manage your blocked time slots'}
          </DialogDescription>
        </DialogHeader>
        
        {!isAdding ? (
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-center py-4">Loading your blocked times...</p>
            ) : blockedTimes.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {blockedTimes.map(time => (
                  <Card key={time.id} className="shadow-sm">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{time.title}</h4>
                          <p className="text-sm text-gray-500">
                            {dayNames[time.day_of_week]}, {formatTimeRange(time.start_time, time.end_time)}
                          </p>
                          {time.reason && (
                            <p className="text-xs text-gray-600 mt-1">{time.reason}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityStyle(time.priority)}`}>
                            {time.priority}
                          </span>
                          <Button variant="ghost" size="sm" onClick={() => handleStartEditing(time)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(time.id)}>
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-gray-500">No blocked times defined yet</p>
            )}
            
            <Button onClick={() => setIsAdding(true)} className="w-full">
              Add New Blocked Time
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Doctor's Appointment"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="day">Day of Week</Label>
              <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                <SelectTrigger id="day">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {dayNames.map((day, index) => (
                    <SelectItem key={index} value={index.toString()}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why this time is blocked"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Priority</Label>
              <RadioGroup value={priority} onValueChange={(val: 'low' | 'medium' | 'high') => setPriority(val)}>
                <div className="flex items-center space-x-8">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="low" />
                    <Label htmlFor="low" className="cursor-pointer">Low</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium" className="cursor-pointer">Medium</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="high" />
                    <Label htmlFor="high" className="cursor-pointer">High</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
            
            <DialogFooter className="sm:justify-between">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingId ? 'Update' : 'Add'} Blocked Time
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BlockedTimeManager;
