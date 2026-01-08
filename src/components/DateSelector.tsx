import { ChevronLeft, ChevronRight, Calendar, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDatePolish, formatDayOfWeek, getTrainingSessions } from '@/utils/dateUtils';
import { useMemo, useState } from 'react';

interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  cancelledDates?: string[];
}

export function DateSelector({ selectedDate, onDateChange, cancelledDates = [] }: DateSelectorProps) {
  const [showPicker, setShowPicker] = useState(false);
  
  const sessions = useMemo(() => {
    const currentMonth = new Date(selectedDate);
    return getTrainingSessions(currentMonth);
  }, [selectedDate]);
  
  const currentIndex = sessions.findIndex(s => s.date === selectedDate);
  const isCurrentCancelled = cancelledDates.includes(selectedDate);
  
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
      <div className={cn(
        "glass-card rounded-2xl p-4",
        isCurrentCancelled && "border border-destructive/50"
      )}>
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
              {isCurrentCancelled ? (
                <Ban className="w-5 h-5 text-destructive" />
              ) : (
                <Calendar className="w-5 h-5 text-primary" />
              )}
              <span className={cn(
                "font-bold text-lg",
                isCurrentCancelled ? "text-destructive" : "text-primary"
              )}>
                {formatDayOfWeek(selectedDate)}
              </span>
            </div>
            <p className={cn(
              "font-semibold mt-1",
              isCurrentCancelled ? "text-destructive/80 line-through" : "text-foreground"
            )}>
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
            {sessions.map((session) => {
              const isCancelled = cancelledDates.includes(session.date);
              return (
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
                      : isCancelled
                        ? "bg-destructive/10 hover:bg-destructive/20"
                        : "hover:bg-secondary"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {isCancelled && <Ban className="w-4 h-4 text-destructive" />}
                    <span className={cn(
                      "font-medium",
                      isCancelled && session.date !== selectedDate && "text-destructive line-through"
                    )}>
                      {formatDatePolish(session.date)}
                    </span>
                  </div>
                  <span className={cn(
                    "text-sm",
                    session.date === selectedDate ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}>
                    {session.dayOfWeek}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
