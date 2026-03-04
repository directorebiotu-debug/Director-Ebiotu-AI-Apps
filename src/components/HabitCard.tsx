import React, { useState } from 'react';
import { Habit } from '../types';
import { Check, Edit2, Trash2, Calendar as CalendarIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HabitCardProps {
  key?: React.Key;
  habit: Habit;
  onToggle: (habitId: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
}

export default function HabitCard({ habit, onToggle, onEdit, onDelete }: HabitCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Generate last 28 days for the calendar view
  const today = new Date();
  const last28Days = Array.from({ length: 28 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (27 - i));
    return d.toISOString().split('T')[0];
  });

  const historySet = new Set(habit.history || []);
  if (habit.completedToday) {
    historySet.add(today.toISOString().split('T')[0]);
  }
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card rounded-xl p-4 border border-card-border relative group/card"
    >
      <div className="flex items-start gap-4">
        <button 
          onClick={() => onToggle(habit.id)}
          className={`mt-0.5 w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors border ${
            habit.completedToday 
              ? 'bg-accent border-accent text-white' 
              : 'border-secondary/50 text-transparent hover:border-accent'
          }`}
        >
          <Check className="w-4 h-4" strokeWidth={3} />
        </button>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg mb-0.5 text-primary">
                {habit.title}
              </h3>
              <p className="text-sm font-medium text-secondary">
                {habit.completedToday ? 'Completed' : 'Not started'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onEdit(habit)}
                className="p-1.5 text-secondary hover:text-primary rounded-lg transition-colors opacity-0 group-hover/card:opacity-100"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onDelete(habit.id)}
                className="p-1.5 text-secondary hover:text-red-400 rounded-lg transition-colors opacity-0 group-hover/card:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-secondary hover:text-primary transition-colors"
              >
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <CalendarIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-card-border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-secondary uppercase tracking-wider">Last 28 Days</span>
                    <span className="text-xs font-medium text-accent">{habit.streak} Day Streak</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1.5">
                    {last28Days.map((dateStr, i) => {
                      const isCompleted = historySet.has(dateStr);
                      return (
                        <div 
                          key={dateStr}
                          title={dateStr}
                          className={`aspect-square rounded-sm ${
                            isCompleted ? 'bg-accent' : 'bg-bg border border-card-border'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
