import React, { useState } from 'react';
import { Habit } from '../types';
import { motion } from 'motion/react';

interface HabitFormProps {
  onSubmit: (habit: Omit<Habit, 'id' | 'completedToday' | 'streak'>) => void;
  onCancel: () => void;
  initialHabit?: Habit;
}

export default function HabitForm({ onSubmit, onCancel, initialHabit }: HabitFormProps) {
  const [title, setTitle] = useState(initialHabit?.title || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
    });
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 border border-card-border"
      onSubmit={handleSubmit}
    >
      <h2 className="text-xl font-semibold text-primary mb-6">
        {initialHabit ? 'Edit Habit' : 'Create New Habit'}
      </h2>
      
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">Habit Name</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Drink 2L of water"
            className="w-full px-4 py-2.5 rounded-xl bg-bg border border-card-border text-primary focus:outline-none focus:border-accent transition-all"
            required
          />
        </div>
      </div>

      <div className="mt-8 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-sm font-medium text-secondary hover:text-primary transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-xl transition-all active:scale-95"
        >
          {initialHabit ? 'Save Changes' : 'Create Habit'}
        </button>
      </div>
    </motion.form>
  );
}
