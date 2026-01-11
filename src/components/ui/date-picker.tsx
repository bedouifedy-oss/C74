'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  min?: string;
  id?: string;
  name?: string;
  className?: string;
  placeholder?: string;
  locale?: string;
}

export function DatePicker({ 
  value, 
  onChange, 
  min, 
  id, 
  name, 
  className,
  placeholder = "Select date",
  locale = 'en'
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const selectedDate = value ? new Date(value) : null;
  const minDate = min ? new Date(min) : new Date();

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDateSelect = (day: number) => {
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    // Check if selected date is before min date
    if (selected < minDate && formatDate(selected) !== formatDate(minDate)) {
      return;
    }
    
    onChange(formatDate(selected));
    setIsOpen(false);
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isToday = formatDate(date) === formatDate(new Date());
      const isSelected = selectedDate && formatDate(date) === formatDate(selectedDate);
      const isDisabled = date < minDate && formatDate(date) !== formatDate(minDate);

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateSelect(day)}
          disabled={isDisabled}
          className={cn(
            "p-2 rounded-lg text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors",
            isToday && "bg-neutral-100 dark:bg-neutral-800 font-semibold",
            isSelected && "bg-blue-500 text-white hover:bg-blue-600",
            isDisabled && "text-neutral-400 cursor-not-allowed"
          )}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onClick={() => setIsOpen(!isOpen)}
          placeholder={placeholder}
          className="cursor-pointer"
          readOnly
        />
        <Calendar 
          className={cn(
            "absolute top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4 pointer-events-none",
            locale === 'ar-TN' ? "left-3" : "right-3"
          )} 
        />
      </div>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-1 z-20 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg p-4 w-80">
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={previousMonth}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h3 className="font-semibold">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="p-2 text-center text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
