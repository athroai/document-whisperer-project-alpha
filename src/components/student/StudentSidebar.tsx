
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home,
  BookOpen,
  ClipboardList,
  MessageSquare,
  BarChart3,
  FileText,
  Calendar,
  Clock
} from 'lucide-react';

const StudentSidebar: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-6">Student Portal</h2>
        <nav className="space-y-1">
          <NavLink
            to="/student"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </NavLink>

          <NavLink
            to="/student/assignments"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <ClipboardList className="mr-2 h-4 w-4" />
            Assignments
          </NavLink>

          <NavLink
            to="/student/timetable"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <Clock className="mr-2 h-4 w-4" />
            Study Timetable
          </NavLink>

          <NavLink
            to="/student/progress"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Progress
          </NavLink>

          <NavLink
            to="/student/resources"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <FileText className="mr-2 h-4 w-4" />
            Resources
          </NavLink>

          <NavLink
            to="/student/feedback"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Feedback
          </NavLink>

          <NavLink
            to="/athro"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Study with Athro
          </NavLink>

          <NavLink
            to="/calendar"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <Calendar className="mr-2 h-4 w-4" />
            Calendar
          </NavLink>
        </nav>
      </div>
    </div>
  );
};

export default StudentSidebar;
