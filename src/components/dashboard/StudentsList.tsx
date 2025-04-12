
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StudentConfidence {
  date: string;
  confidence: number;
}

interface Student {
  id: string;
  name: string;
  email: string;
  confidenceTrend: StudentConfidence[];
  lastStudy: string;
  lastQuiz?: {
    date: string;
    score: number;
    subject: string;
  };
  subjects: Record<string, {
    confidence: number;
    averageScore: number;
    sessionsThisWeek: number;
  }>;
}

interface StudentsListProps {
  students: Student[];
  selectedStudent: string | null;
  setSelectedStudent: (id: string | null) => void;
  isLoading?: boolean;
}

const StudentsList: React.FC<StudentsListProps> = ({ 
  students, 
  selectedStudent, 
  setSelectedStudent,
  isLoading = false
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Filter students by name or email
  const filteredStudents = students.filter(student => {
    const query = searchQuery.toLowerCase();
    return student.name.toLowerCase().includes(query) || 
           student.email.toLowerCase().includes(query);
  });
  
  // Get confidence trend for each student
  const getConfidenceTrend = (student: Student) => {
    if (student.confidenceTrend.length < 2) {
      return { icon: <Minus className="h-4 w-4 text-gray-400" />, color: 'text-gray-400' };
    }
    
    const sorted = [...student.confidenceTrend].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const first = sorted[0].confidence;
    const last = sorted[sorted.length - 1].confidence;
    
    if (last > first) {
      return { icon: <TrendingUp className="h-4 w-4 text-green-500" />, color: 'text-green-500' };
    } else if (last < first) {
      return { icon: <TrendingDown className="h-4 w-4 text-red-500" />, color: 'text-red-500' };
    } else {
      return { icon: <Minus className="h-4 w-4 text-gray-400" />, color: 'text-gray-400' };
    }
  };

  return (
    <div className="lg:col-span-1">
      <Card className="h-full">
        <CardContent className="p-4">
          <div className="flex items-center mb-4">
            <h2 className="text-lg font-medium">Students</h2>
            <span className="text-sm text-muted-foreground ml-2">({filteredStudents.length})</span>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 border rounded-md animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No students found
            </div>
          ) : (
            <div className="space-y-2 max-h-[calc(100vh-240px)] overflow-y-auto pr-2">
              {filteredStudents.map((student) => {
                const confidenceTrend = getConfidenceTrend(student);
                
                return (
                  <Button
                    key={student.id}
                    variant={selectedStudent === student.id ? "secondary" : "ghost"}
                    className={`w-full justify-start font-normal ${
                      selectedStudent === student.id ? 'bg-secondary' : ''
                    }`}
                    onClick={() => setSelectedStudent(student.id)}
                  >
                    <div className="flex flex-col items-start">
                      <div className="flex items-center w-full justify-between">
                        <span className="font-medium">{student.name}</span>
                        {confidenceTrend.icon}
                      </div>
                      <span className="text-sm text-muted-foreground">{student.email}</span>
                    </div>
                  </Button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentsList;
