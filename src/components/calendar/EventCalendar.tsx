'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { Event } from '@/types/database.types';

interface EventCalendarProps {
  events: Event[];
}

export function EventCalendar({ events }: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

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
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.event_date.startsWith(dateStr));
  };

  const renderCalendarDays = () => {
    const days = [];
    const totalDays = daysInMonth(currentDate);
    const firstDay = firstDayOfMonth(currentDate);

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="min-h-24 bg-white/20 border border-white/30"></div>
      );
    }

    // Days of the month
    for (let day = 1; day <= totalDays; day++) {
      const dayEvents = getEventsForDay(day);
      const isToday = new Date().getDate() === day &&
        new Date().getMonth() === currentDate.getMonth() &&
        new Date().getFullYear() === currentDate.getFullYear();

      days.push(
        <div
          key={day}
          className={`min-h-24 border border-white/30 p-2 transition-all ${
            isToday ? 'bg-white/40 ring-2 ring-white' : 'bg-white/20 hover:bg-white/30'
          }`}
        >
          <div className={`text-sm font-bold mb-1 ${isToday ? 'text-white' : 'text-white/90'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayEvents.map(event => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="block text-xs bg-blue-500/80 hover:bg-blue-600/80 text-white px-2 py-1 rounded truncate transition-colors"
                title={event.title}
              >
                {event.title}
              </Link>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h2 className="text-2xl font-bold text-white">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-white font-bold text-sm py-2">
            {day}
          </div>
        ))}
        {/* Calendar days */}
        {renderCalendarDays()}
      </div>
    </div>
  );
}
