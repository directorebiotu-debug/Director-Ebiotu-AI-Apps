import React, { useState } from 'react';
import { Task, Subtask } from '../types';
import { Plus, X, Calendar, AlignLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface TaskFormProps {
  onSubmit: (task: Omit<Task, 'id'>) => void;
  onCancel: () => void;
  initialTask?: Task;
}

export default function TaskForm({ onSubmit, onCancel, initialTask }: TaskFormProps) {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [subtasks, setSubtasks] = useState<string[]>(
    initialTask?.subtasks.length ? initialTask.subtasks.map(s => s.title) : ['']
  );
  const [priority, setPriority] = useState<Task['priority']>(initialTask?.priority || 'Medium');
  const [deadline, setDeadline] = useState(initialTask?.deadline || '');
  const [notes, setNotes] = useState(initialTask?.notes || '');

  const handleAddSubtask = () => {
    setSubtasks([...subtasks, '']);
  };

  const handleSubtaskChange = (index: number, value: string) => {
    const newSubtasks = [...subtasks];
    newSubtasks[index] = value;
    setSubtasks(newSubtasks);
  };

  const handleRemoveSubtask = (index: number) => {
    const newSubtasks = subtasks.filter((_, i) => i !== index);
    setSubtasks(newSubtasks);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const validSubtasks: Subtask[] = subtasks
      .filter(s => s.trim())
      .map((s, index) => {
        // Try to preserve existing subtask ID and completion status if editing
        const existingSubtask = initialTask?.subtasks[index];
        return {
          id: existingSubtask?.id || crypto.randomUUID(),
          title: s.trim(),
          completed: existingSubtask?.completed || false
        };
      });

    onSubmit({
      title: title.trim(),
      subtasks: validSubtasks,
      priority,
      deadline,
      notes,
      completed: initialTask?.completed || false
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
        {initialTask ? 'Edit Task' : 'Create New Task'}
      </h2>
      
      <div className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">Task Name</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Edit client video"
            className="w-full px-4 py-2.5 rounded-xl bg-bg border border-card-border text-primary focus:outline-none focus:border-accent transition-all"
            required
          />
        </div>

        {/* Subtasks */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">Break it down (Subtasks)</label>
          <div className="space-y-2">
            {subtasks.map((subtask, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={subtask}
                  onChange={(e) => handleSubtaskChange(index, e.target.value)}
                  placeholder={`Step ${index + 1}`}
                  className="flex-1 px-4 py-2 rounded-xl bg-bg border border-card-border text-primary focus:outline-none focus:border-accent transition-all text-sm"
                />
                {subtasks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(index)}
                    className="p-2 text-secondary hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddSubtask}
            className="mt-2 flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Step
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Task['priority'])}
              className="w-full px-4 py-2.5 rounded-xl bg-bg border border-card-border text-primary focus:outline-none focus:border-accent transition-all"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Deadline (Optional)</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg border border-card-border text-primary focus:outline-none focus:border-accent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">Notes (Optional)</label>
          <div className="relative">
            <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-secondary" />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any extra context..."
              rows={3}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg border border-card-border text-primary focus:outline-none focus:border-accent transition-all resize-none"
            />
          </div>
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
          {initialTask ? 'Save Changes' : 'Create Task'}
        </button>
      </div>
    </motion.form>
  );
}
