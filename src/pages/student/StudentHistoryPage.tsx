
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getMockStudentHistory, getHistoryByType } from '@/services/mockHistoryService';
import HistoryEntryCard from '@/components/history/HistoryEntryCard';
import { HistoryEntry } from '@/types/history';
import { useNavigate } from 'react-router-dom';
import { Clock, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

const StudentHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<'all' | 'goal' | 'assignment' | 'quiz' | 'session'>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  
  const allHistory = getMockStudentHistory();
  
  // Get unique subjects for the filter
  const uniqueSubjects = Array.from(new Set(allHistory.map(entry => entry.subject)));
  
  // Filter history based on selected tab and subject filter
  const filteredHistory = React.useMemo(() => {
    let filtered = allHistory;
    
    // Filter by type if not "all"
    if (selectedTab !== 'all') {
      filtered = filtered.filter(entry => entry.type === selectedTab);
    }
    
    // Filter by subject if not "all"
    if (subjectFilter !== 'all') {
      filtered = filtered.filter(entry => entry.subject === subjectFilter);
    }
    
    // Sort by date (newest first)
    return [...filtered].sort((a, b) => 
      new Date(b.dateCompleted).getTime() - new Date(a.dateCompleted).getTime()
    );
  }, [allHistory, selectedTab, subjectFilter]);
  
  // Handle review action
  const handleReview = (entryId: string) => {
    const entry = allHistory.find(e => e.id === entryId);
    if (!entry) return;
    
    // Navigate based on the type of entry
    switch (entry.type) {
      case 'assignment':
        navigate(`/student/assignments/${entry.activityId}`);
        break;
      case 'quiz':
        navigate(`/quiz/${entry.activityId}`);
        break;
      case 'goal':
        // For now, the dialog will show details
        break;
      case 'session':
        navigate(`/study`);
        break;
    }
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Clock className="h-16 w-16 text-gray-300 mb-4" />
      <h3 className="text-lg font-medium">No history entries found</h3>
      <p className="text-gray-500 mt-2 max-w-md">
        As you complete activities like assignments, quizzes, and study sessions, they'll appear here for review.
      </p>
    </div>
  );
  
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Your Learning History</h1>
        <p className="text-gray-500">Review your past activities and progress</p>
      </header>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <Tabs value={selectedTab} onValueChange={(val) => setSelectedTab(val as any)} className="w-full">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="goal">Goals</TabsTrigger>
            <TabsTrigger value="assignment">Assignments</TabsTrigger>
            <TabsTrigger value="quiz">Quizzes</TabsTrigger>
            <TabsTrigger value="session">Study Sessions</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {uniqueSubjects.map((subject, index) => (
                <SelectItem key={index} value={subject}>{subject}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {filteredHistory.length > 0 ? (
        <div>
          {/* Group entries by month */}
          {filteredHistory.reduce((groups: Record<string, JSX.Element[]>, entry) => {
            const monthYear = format(new Date(entry.dateCompleted), 'MMMM yyyy');
            if (!groups[monthYear]) {
              groups[monthYear] = [];
            }
            
            groups[monthYear].push(
              <div key={entry.id} className="mb-4">
                <HistoryEntryCard entry={entry} onReview={handleReview} />
              </div>
            );
            
            return groups;
          }, Object.entries({})).map(([monthYear, entries], index) => (
            <div key={index} className="mb-8">
              <h2 className="text-lg font-medium text-gray-700 mb-4">{monthYear}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {entries}
              </div>
            </div>
          ))}
        </div>
      ) : (
        renderEmptyState()
      )}
    </div>
  );
};

export default StudentHistoryPage;
