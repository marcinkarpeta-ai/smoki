import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDatePolish, formatDayOfWeek, getTrainingSessions, getNextTrainingDate } from '@/utils/dateUtils';
import { useMemo, useState } from 'react';

interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const [showPicker, setShowPicker] = useState(false);
  
  const sessions = useMemo(() => {
    const currentMonth = new Date(selectedDate);
    return getTrainingSessions(currentMonth);
  }, [selectedDate]);
  
  const currentIndex = sessions.findIndex(s => s.date === selectedDate);
  
  const handlePrev = () => {
    if (currentIndex > 0) {
      onDateChange(sessions[currentIndex - 1].date);
    }
  };
  
  const handleNext = () => {
    if (currentIndex < sessions.length - 1) {
      onDateChange(sessions[currentIndex + 1].date);
    }
  };

  return (
    <div className="relative">
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handlePrev}
            disabled={currentIndex <= 0}
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center tap-target transition-all",
              currentIndex > 0 
                ? "bg-secondary hover:bg-secondary/80 text-foreground" 
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="flex-1 text-center tap-target"
          >
            <div className="flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-primary font-bold text-lg">
                {formatDayOfWeek(selectedDate)}
              </span>
            </div>
            <p className="text-foreground font-semibold mt-1">
              {formatDatePolish(selectedDate)}
            </p>
          </button>
          
          <button
            onClick={handleNext}
            disabled={currentIndex >= sessions.length - 1}
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center tap-target transition-all",
              currentIndex < sessions.length - 1 
                ? "bg-secondary hover:bg-secondary/80 text-foreground" 
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      {showPicker && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-card rounded-2xl p-3 z-10 max-h-64 overflow-y-auto animate-slide-up">
          <div className="space-y-1">
            {sessions.map((session) => (
              <button
                key={session.date}
                onClick={() => {
                  onDateChange(session.date);
                  setShowPicker(false);
                }}
                className={cn(
                  "w-full p-3 rounded-xl text-left tap-target flex items-center justify-between transition-all",
                  session.date === selectedDate 
                    ? "gradient-primary text-primary-foreground" 
                    : "hover:bg-secondary"
                )}
              >
                <span className="font-medium">{formatDatePolish(session.date)}</span>
                <span className={cn(
                  "text-sm",
                  session.date === selectedDate ? "text-primary-foreground/80" : "text-muted-foreground"
                )}>
                  {session.dayOfWeek}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
