
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Search, CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AssignmentFiltersProps {
  classId: string;
  setClassId: (value: string) => void;
  subject: string;
  setSubject: (value: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  dueDateFrom: Date | undefined;
  setDueDateFrom: (value: Date | undefined) => void;
}

const AssignmentFilters: React.FC<AssignmentFiltersProps> = ({
  classId,
  setClassId,
  subject,
  setSubject,
  searchTerm,
  setSearchTerm,
  dueDateFrom,
  setDueDateFrom
}) => {
  // Mock class data (would come from API in real app)
  const classesMock = [
    { id: "class1", name: "Year 10 Mathematics" },
    { id: "class2", name: "Year 11 Biology" },
    { id: "class3", name: "Year 9 Science" }
  ];
  
  // Mock subject data (would come from API in real app)
  const subjectsMock = [
    { id: "mathematics", name: "Mathematics" },
    { id: "science", name: "Science" },
    { id: "english", name: "English" }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <Label htmlFor="class-filter">Class</Label>
        <Select value={classId} onValueChange={setClassId}>
          <SelectTrigger id="class-filter">
            <SelectValue placeholder="Filter by class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classesMock.map(c => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="subject-filter">Subject</Label>
        <Select value={subject} onValueChange={setSubject}>
          <SelectTrigger id="subject-filter">
            <SelectValue placeholder="Filter by subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjectsMock.map(s => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="due-date-filter">Due Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="due-date-filter"
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              {dueDateFrom ? (
                format(dueDateFrom, "PPP")
              ) : (
                <span>Filter by due date</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dueDateFrom}
              onSelect={setDueDateFrom}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div>
        <Label htmlFor="search-filter">Search</Label>
        <div className="relative">
          <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="search-filter"
            placeholder="Search assignments..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default AssignmentFilters;
