import React, { useState } from 'react';
import { Task } from '../types';
import { Check, ChevronDown, ChevronUp, MoreVertical, Plus, Trash2, X, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TaskCardProps {
  key?: React.Key;
  task: Task;
  onToggleTask: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
}

export default function TaskCard({ task, onToggleTask, onToggleSubtask, onAddSubtask, onDeleteSubtask, onDeleteTask, onEditTask }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const completedCount = task.subtasks.filter(s => s.completed).length;
  const totalCount = task.subtasks.length;
  const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const isFullyCompleted = task.completed || (totalCount > 0 && completedCount === totalCount);

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
      onAddSubtask(task.id, newSubtaskTitle.trim());
      setNewSubtaskTitle('');
      setIsAddingSubtask(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl p-4 border border-card-border relative group/card"
    >
      <div className="flex items-start gap-4">
        {/* Main Task Checkbox */}
        <button 
          onClick={() => onToggleTask(task.id)}
          className={`mt-0.5 w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors border ${
            isFullyCompleted 
              ? 'bg-accent border-accent text-white' 
              : 'border-secondary/50 text-transparent hover:border-accent'
          }`}
        >
          <Check className="w-4 h-4" strokeWidth={3} />
        </button>

        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className={`font-semibold text-lg mb-0.5 ${isFullyCompleted ? 'text-primary' : 'text-primary'}`}>
                {task.title}
              </h3>
              <div className="text-sm font-medium">
                {isFullyCompleted ? (
                  <span className="text-secondary">Completed</span>
                ) : totalCount > 0 ? (
                  <span className="text-accent">In Progress • {progress}%</span>
                ) : task.deadline ? (
                  <span className="text-secondary">Scheduled for {task.deadline}</span>
                ) : (
                  <span className="text-secondary">Not started</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onEditTask(task)}
                className="p-1.5 text-secondary hover:text-primary rounded-lg transition-colors opacity-0 group-hover/card:opacity-100"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onDeleteTask(task.id)}
                className="p-1.5 text-secondary hover:text-red-400 rounded-lg transition-colors opacity-0 group-hover/card:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              {totalCount > 0 && (
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 text-secondary hover:text-primary transition-colors"
                >
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              )}
              {totalCount === 0 && (
                <button className="p-1.5 text-secondary hover:text-primary transition-colors">
                  <ChevronDown className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {totalCount > 0 && isExpanded && (
            <div className="w-full bg-track rounded-full h-1.5 mt-4 mb-4 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-accent h-full rounded-full"
              />
            </div>
          )}

          {/* Subtasks */}
          <AnimatePresence>
            {isExpanded && totalCount > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative mt-2"
              >
                {/* Vertical Line */}
                <div className="absolute left-[-20px] top-1 bottom-2 w-[2px] bg-track" />
                
                <div className="space-y-3">
                  {task.subtasks.map((subtask) => (
                    <div key={subtask.id} className="group flex items-center gap-3">
                      <button
                        onClick={() => onToggleSubtask(task.id, subtask.id)}
                        className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors border ${
                          subtask.completed 
                            ? 'bg-accent border-accent text-white' 
                            : 'border-secondary/50 text-transparent hover:border-accent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                      </button>
                      <span className={`text-sm flex-1 ${subtask.completed ? 'text-secondary line-through' : 'text-primary'}`}>
                        {subtask.title}
                      </span>
                      <button
                        onClick={() => onDeleteSubtask(task.id, subtask.id)}
                        className="p-1 text-secondary hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Add Subtask Inline */}
                  {isAddingSubtask ? (
                    <form onSubmit={handleAddSubtask} className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        value={newSubtaskTitle}
                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                        placeholder="New step..."
                        className="flex-1 px-3 py-1.5 text-sm rounded bg-bg border border-card-border text-primary focus:outline-none focus:border-accent transition-all"
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={!newSubtaskTitle.trim()}
                        className="p-1.5 bg-accent text-white rounded hover:bg-accent-hover transition-colors disabled:opacity-50"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingSubtask(false);
                          setNewSubtaskTitle('');
                        }}
                        className="p-1.5 text-secondary hover:text-primary rounded transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  ) : (
                    <button
                      onClick={() => setIsAddingSubtask(true)}
                      className="flex items-center gap-2 text-sm font-medium text-secondary hover:text-primary transition-colors mt-2"
                    >
                      <Plus className="w-4 h-4" /> Add Step
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
