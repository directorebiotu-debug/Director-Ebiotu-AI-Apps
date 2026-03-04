import React from 'react';
import { Habit } from '../types';
import { Check, MoreVertical } from 'lucide-react';
import { motion } from 'motion/react';

interface HabitCardProps {
  key?: React.Key;
  habit: Habit;
  onToggle: (habitId: string) => void;
}

export default function HabitCard({ habit, onToggle }: HabitCardProps) {
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
            <button className="p-1.5 text-secondary hover:text-primary transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
