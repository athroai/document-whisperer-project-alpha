
import React from 'react';
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
        if (!event.start_time) return false;
        
        const eventDate = parseISO(event.start_time);
        
        return (
          eventDate.getFullYear() === day.getFullYear() &&
          eventDate.getMonth() === day.getMonth() &&
          eventDate.getDate() === day.getDate()
        );
      } catch (err) {
        console.error('Error parsing event date:', err, event);
        return false;
      }
    });
  };

  return (
    <div className="grid grid-cols-7 gap-2">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="font-semibold text-gray-600">{day}</div>
      ))}
      
      {days.map((day, index) => {
        const dayEvents = getEventsForDay(day);
        const isCurrentMonth = isSameMonth(day, currentMonth);

        return (
          <div 
            key={index}
            className={`border p-2 ${!isCurrentMonth ? 'bg-gray-100 text-gray-400' : 'bg-white'} 
              cursor-pointer hover:bg-gray-50 min-h-[100px]`}
            onClick={() => isCurrentMonth && onSelectDate(day)}
          >
            <div className="flex justify-between items-center mb-2">
              <span className={`text-sm font-medium ${
                isToday(day) ? 'bg-purple-600 text-white rounded-full px-2 py-1' : ''
              }`}>
                {format(day, 'd')}
              </span>
            </div>
            
            {dayEvents.length === 0 ? (
              <div className="text-xs text-gray-400 italic">No events</div>
            ) : (
              <>
                {dayEvents.slice(0, 3).map((event, eventIndex) => {
                  const colorStyle = getEventColor(event.subject);
                  
                  let formattedTime;
                  try {
                    formattedTime = formatGMTTime(event.start_time);
                  } catch (e) {
                    formattedTime = '??:??';
                    console.error('Error formatting time:', e, event);
                  }
                  
                  return (
                    <div 
                      key={`${event.id}-${eventIndex}`}
                      className={`text-xs p-1 mb-1 rounded truncate ${colorStyle.bg} ${colorStyle.text}`}
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
        );
      })}
    </div>
  );
};

export default CalendarGrid;
