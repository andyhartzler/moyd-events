'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EventCard } from '@/components/events/EventCard';
import type { Event } from '@/types/database.types';

interface MobileEventCalendarProps {
  events: Event[];
}

export function MobileEventCalendar({ events }: MobileEventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.event_date.startsWith(dateStr));
  };

  const hasEventsForDay = (day: number) => {
    return getEventsForDay(day).length > 0;
  };

  const handleDayClick = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(date);
  };

  const renderCalendarDays = () => {
    const days = [];
    const totalDays = daysInMonth(currentDate);
    const firstDay = firstDayOfMonth(currentDate);
    const today = new Date();

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="aspect-square"></div>
      );
    }

    // Days of the month
    for (let day = 1; day <= totalDays; day++) {
      const hasEvents = hasEventsForDay(day);
      const isToday = today.getDate() === day &&
        today.getMonth() === currentDate.getMonth() &&
        today.getFullYear() === currentDate.getFullYear();
      const isSelected = selectedDate?.getDate() === day &&
        selectedDate?.getMonth() === currentDate.getMonth() &&
        selectedDate?.getFullYear() === currentDate.getFullYear();

      days.push(
        <button
          key={day}
          onClick={() => handleDayClick(day)}
          className={`aspect-square flex flex-col items-center justify-center rounded-full transition-all ${
            isSelected
              ? 'bg-white text-[#273351]'
              : isToday
              ? 'bg-white/30 text-white'
              : 'text-white hover:bg-white/20'
          }`}
        >
          <span className="text-sm font-medium">{day}</span>
          {hasEvents && (
            <div className="flex gap-0.5 mt-1">
              <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-[#273351]' : 'bg-white'}`}></div>
            </div>
          )}
        </button>
      );
    }

    return days;
  };

  // Get events for selected date
  const selectedDateEvents = selectedDate
    ? getEventsForDay(selectedDate.getDate())
    : [];

  return (
    <div className="space-y-6">
      {/* Month Calendar */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h2 className="text-lg font-bold text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
            <div key={`${day}-${idx}`} className="text-center text-white/70 font-semibold text-xs py-2">
              {day}
            </div>
          ))}
          {/* Calendar days */}
          {renderCalendarDays()}
        </div>
      </div>

      {/* Event List for Selected Date */}
      {selectedDate && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">
            Events on {monthNames[selectedDate.getMonth()]} {selectedDate.getDate()}
          </h3>
          {selectedDateEvents.length > 0 ? (
            <div className="space-y-4">
              {selectedDateEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <p className="text-white/70">No events on this day</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
