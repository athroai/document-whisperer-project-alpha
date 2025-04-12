
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Student } from '@/types/dashboard';

interface StudentsListProps {
  students: Student[];
  selectedStudent: string | null;
  setSelectedStudent: (id: string) => void;
}

const StudentsList = ({ 
  students, 
  selectedStudent, 
  setSelectedStudent 
}: StudentsListProps) => {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Students List</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto max-h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Last Activity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow 
                  key={student.id} 
                  className={`cursor-pointer ${selectedStudent === student.id ? 'bg-muted' : ''}`}
                  onClick={() => setSelectedStudent(student.id)}
                >
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.lastStudy}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentsList;
