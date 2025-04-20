
import React, { useMemo } from 'react';
import { format, isSameMonth, isToday, parseISO } from 'date-fns';
import { getEventColor } from '@/utils/calendarUtils';
import { CalendarEvent } from '@/types/calendar';
import { formatGMTTime } from '@/utils/timeUtils';

interface CalendarGridProps {
  days: Date[];
  currentMonth: Date;
  events: CalendarEvent[];
  onSelectDate: (date: Date) => void;
}

const CalendarGrid = ({ days, currentMonth, events, onSelectDate }: CalendarGridProps) => {
  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      try {
        if (!event.start_time) {
          return false;
        }
        
        const eventDate = parseISO(event.start_time);
        
        return (
          eventDate.getFullYear() === day.getFullYear() &&
          eventDate.getMonth() === day.getMonth() &&
          eventDate.getDate() === day.getDate()
        );
      } catch (err) {
        return false;
      }
    });
  };

  // Day names in correct order starting with Sunday
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Memoize the calendar days to prevent re-rendering
  const calendarDays = useMemo(() => {
    return days.map((day, index) => {
      const dayEvents = getEventsForDay(day);
      const isCurrentMonth = isSameMonth(day, currentMonth);
      const isCurrentDay = isToday(day);

      return (
        <div 
          key={index}
          className={`border rounded-lg p-2 ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'} 
            cursor-pointer hover:bg-gray-50 min-h-[120px] transition-colors duration-200`}
          onClick={() => isCurrentMonth && onSelectDate(day)}
        >
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm font-medium ${
              isCurrentDay ? 'bg-purple-600 text-white rounded-full px-2 py-1' : ''
            }`}>
              {format(day, 'd')}
            </span>
            <span className="text-xs text-gray-400">
              {format(day, 'EEE')}
            </span>
          </div>
          
          <div className="space-y-1">
            {dayEvents.length === 0 ? (
              <div className="text-xs text-gray-400 italic">No events</div>
            ) : (
              <>
                {dayEvents.slice(0, 3).map((event, eventIndex) => {
                  const colorStyle = getEventColor(event.subject || '');
                  let formattedTime = 'TBD';
                  try {
                    formattedTime = formatGMTTime(event.start_time);
                  } catch (err) {
                    // Silent fail, already showing TBD as fallback
                  }
                  
                  return (
                    <div 
                      key={`${event.id}-${eventIndex}`}
                      className={`text-xs p-1 rounded truncate ${colorStyle.bg} ${colorStyle.text}`}
                      title={`${event.title} (${formattedTime})`}
                    >
                      {formattedTime} - {event.title}
                    </div>
                  );
                })}
                
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 text-center font-medium mt-1">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      );
    });
  }, [days, currentMonth, events, onSelectDate]);

  return (
    <div className="grid grid-cols-7 gap-2">
      {dayNames.map(day => (
        <div key={day} className="font-semibold text-gray-600 text-center">{day}</div>
      ))}
      
      {calendarDays}
    </div>
  );
};

export default CalendarGrid;
