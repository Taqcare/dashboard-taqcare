import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, isWithinInterval, isSameDay, isAfter, isBefore, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DatePickerProps {
  value: string;
  onChange: (value: string, startDate?: Date, endDate?: Date) => void;
}

interface DateRange {
  start: Date | null;
  end: Date | null;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<DateRange>({ 
    start: null, 
    end: null 
  });
  const [isSelectingRange, setIsSelectingRange] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const calculateDateRange = (preset: string): DateRange => {
    const today = new Date();
    const ranges: { [key: string]: DateRange } = {
      'Today': {
        start: startOfDay(today),
        end: endOfDay(today)
      },
      'Yesterday': {
        start: startOfDay(subDays(today, 1)),
        end: endOfDay(subDays(today, 1))
      },
      'Last 7 Days': {
        start: startOfDay(subDays(today, 6)),
        end: endOfDay(today)
      },
      'Last 30 Days': {
        start: startOfDay(subDays(today, 29)),
        end: endOfDay(today)
      },
      'Last 90 Days': {
        start: startOfDay(subDays(today, 89)),
        end: endOfDay(today)
      },
      'Last 365 Days': {
        start: startOfDay(subDays(today, 364)),
        end: endOfDay(today)
      },
      'Last Month': {
        start: startOfMonth(subMonths(today, 1)),
        end: endOfMonth(subMonths(today, 1))
      },
      'Last Week': {
        start: startOfWeek(subDays(today, 7)),
        end: endOfWeek(subDays(today, 7))
      },
      'This Week': {
        start: startOfWeek(today),
        end: endOfWeek(today)
      },
      'This Month': {
        start: startOfMonth(today),
        end: endOfMonth(today)
      },
      'This Quarter': {
        start: startOfQuarter(today),
        end: endOfQuarter(today)
      },
      'This Year': {
        start: startOfYear(today),
        end: endOfYear(today)
      }
    };

    return ranges[preset] || { start: startOfDay(today), end: endOfDay(today) };
  };

  const presets = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Last 7 Days', value: 'last7days' },
    { label: 'Last 30 Days', value: 'last30days' },
    { label: 'Last 90 Days', value: 'last90days' },
    { label: 'Last 365 Days', value: 'last365days' },
    { label: 'Last Month', value: 'lastMonth' },
    { label: 'Last Week', value: 'lastWeek' },
    { label: 'This Week', value: 'thisWeek' },
    { label: 'This Month', value: 'thisMonth' },
    { label: 'This Quarter', value: 'thisQuarter' },
    { label: 'This Year', value: 'thisYear' },
    { label: 'Last Year', value: 'lastYear', disabled: true }
  ];

  const handlePresetSelect = (preset: string) => {
    const range = calculateDateRange(preset);
    setDateRange(range);
    setIsSelectingRange(false);
    onChange(preset, range.start || undefined, range.end || undefined);
    setIsOpen(false);
  };

  const handleDateSelect = (date: Date) => {
    if (isAfter(date, new Date())) {
      return;
    }

    if (!isSelectingRange) {
      setDateRange({ start: date, end: null });
      setIsSelectingRange(true);
    } else {
      let start = dateRange.start;
      let end = date;

      if (start && isAfter(start, end)) {
        [start, end] = [end, start];
      }

      setDateRange({ start, end });
      setIsSelectingRange(false);
      
      if (start && end) {
        const rangeStr = `${format(start, 'dd/MM/yyyy')} - ${format(end, 'dd/MM/yyyy')}`;
        onChange(rangeStr, start, end);
        setIsOpen(false);
      }
    }
    setSelectedDate(date);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDayOfMonth };
  };

  const isInRange = (date: Date) => {
    if (!dateRange.start || !dateRange.end) {
      return dateRange.start && isSameDay(date, dateRange.start);
    }
    return isWithinInterval(date, { 
      start: startOfDay(dateRange.start), 
      end: endOfDay(dateRange.end) 
    });
  };

  const isFutureDate = (date: Date) => {
    return isAfter(date, new Date());
  };

  const getDateStyles = (date: Date) => {
    const isSelected = dateRange.start && isSameDay(date, dateRange.start);
    const isEnd = dateRange.end && isSameDay(date, dateRange.end);
    const inRange = isInRange(date);
    const isTodayDate = isToday(date);
    const isFuture = isFutureDate(date);

    let className = 'h-8 text-sm rounded-lg flex items-center justify-center transition-colors ';

    if (isFuture) {
      className += 'bg-gray-100 text-gray-400 cursor-not-allowed ';
    } else if (isSelected || isEnd) {
      className += 'bg-blue-600 text-white hover:bg-blue-700 ';
    } else if (inRange) {
      className += 'bg-blue-100 text-blue-800 hover:bg-blue-200 ';
    } else if (isTodayDate) {
      className += 'bg-gray-100 text-gray-900 hover:bg-gray-200 ';
    } else {
      className += 'hover:bg-gray-100 ';
    }

    return className;
  };

  const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 w-full sm:w-auto"
      >
        <Calendar className="h-4 w-4 text-gray-600" />
        <span className="text-sm text-gray-700 truncate">{value}</span>
        <ChevronDown className="h-4 w-4 text-gray-600" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 w-[calc(100vw-2rem)] sm:w-[550px] left-0 sm:left-auto">
          <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-1/3 border-b sm:border-b-0 sm:border-r border-gray-200 p-4 overflow-y-auto max-h-[330px]">
              {presets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => !preset.disabled && handlePresetSelect(preset.label)}
                  className={`w-full text-left px-3 py-2 rounded-lg mb-1 text-sm ${
                    preset.disabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : value === preset.label
                      ? 'bg-gray-100 text-gray-900'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {preset.label}
                  {value === preset.label && (
                    <span className="float-right text-blue-600">✓</span>
                  )}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-2/3 p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm font-medium">
                  {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    →
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-medium text-gray-500"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {emptyDays.map((day) => (
                  <div key={`empty-${day}`} className="h-8" />
                ))}
                {days.map((day) => {
                  const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                  const isFuture = isFutureDate(date);
                  return (
                    <button
                      key={day}
                      onClick={() => !isFuture && handleDateSelect(date)}
                      className={getDateStyles(date)}
                      disabled={isFuture}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 text-xs text-gray-500">
                {isSelectingRange && dateRange.start ? (
                  <span>Select end date</span>
                ) : (
                  <span>Select start date or use preset</span>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 p-4 flex justify-between items-center flex-wrap gap-2">
            <div className="text-xs sm:text-sm text-gray-600">
              Timezone: America/Sao Paulo
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsSelectingRange(false);
                  setDateRange({ start: null, end: null });
                }}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (dateRange.start && dateRange.end) {
                    const rangeStr = `${format(dateRange.start, 'dd/MM/yyyy')} - ${format(dateRange.end, 'dd/MM/yyyy')}`;
                    onChange(rangeStr, dateRange.start, dateRange.end);
                  }
                  setIsOpen(false);
                }}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                disabled={!dateRange.start || !dateRange.end}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;