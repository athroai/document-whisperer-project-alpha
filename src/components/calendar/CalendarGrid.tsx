
import React from 'react';
import { format, isSameMonth, isToday } from 'date-fns';
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
        const eventStart = new Date(event.start_time);
        return (
          eventStart.getFullYear() === day.getFullYear() &&
          eventStart.getMonth() === day.getMonth() &&
          eventStart.getDate() === day.getDate()
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
              cursor-pointer hover:bg-gray-50`}
            onClick={() => isCurrentMonth && onSelectDate(day)}
          >
            <div className="flex justify-between items-center mb-2">
              <span className={`text-sm font-medium ${
                isToday(day) ? 'bg-purple-600 text-white rounded-full px-2 py-1' : ''
              }`}>
                {format(day, 'd')}
              </span>
            </div>
            
            {dayEvents.slice(0, 2).map((event, eventIndex) => {
              const colorStyle = getEventColor(event.subject);
              return (
                <div 
                  key={`${event.id}-${eventIndex}`}
                  className={`text-xs p-1 mb-1 rounded truncate ${colorStyle.bg} ${colorStyle.text}`}
                  title={`${event.title} (${formatGMTTime(event.start_time)})`}
                >
                  {formatGMTTime(event.start_time)} - {event.title}
                </div>
              );
            })}
            
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500 text-center">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CalendarGrid;
