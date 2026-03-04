import React, { useState } from 'react';
import { Task, Habit, AIInsight } from './types';
import { generateTaskInsight } from './lib/gemini';
import TaskCard from './components/TaskCard';
import HabitCard from './components/HabitCard';
import TaskForm from './components/TaskForm';
import AIInsightCard from './components/AIInsightCard';
import LiveAudio from './components/LiveAudio';
import { LayoutGrid, CheckSquare, Plus, BarChart2, Settings, User, Leaf, Activity, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'tasks' | 'habits' | 'insights' | 'completed'>('tasks');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Project Presentation',
      description: '',
      subtasks: [
        { id: '1-1', title: 'Research market trends', completed: true },
        { id: '1-2', title: 'Draft outline', completed: true },
        { id: '1-3', title: 'Design final slides', completed: false },
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Client Sync: Q4 Roadmap',
      description: '',
      deadline: '2:00 PM',
      subtasks: [],
      createdAt: new Date().toISOString()
    }
  ]);
  const [habits, setHabits] = useState<Habit[]>([
    { id: '1', title: 'Morning Meditation', completedToday: true, streak: 3 },
  ]);
  const [insights, setInsights] = useState<AIInsight[]>([
    { taskId: '1', message: "You're 60% through your morning flow. Focus on the final slides next. You've been most productive in these 20-minute bursts." }
  ]);
  
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);

  const handleAddTask = async (newTaskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: crypto.randomUUID(),
    };
    
    setTasks([newTask, ...tasks]);
    setIsAddingTask(false);
    
    // Generate AI Insight
    setIsGeneratingInsight(true);
    const insightMessage = await generateTaskInsight(newTask);
    setInsights(prev => [{ taskId: newTask.id, message: insightMessage }, ...prev]);
    setIsGeneratingInsight(false);
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: task.subtasks.map(st => 
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          )
        };
      }
      return task;
    }));
  };

  const handleAddSubtask = (taskId: string, title: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: [...task.subtasks, { id: crypto.randomUUID(), title, completed: false }]
        };
      }
      return task;
    }));
  };

  const handleDeleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          subtasks: task.subtasks.filter(st => st.id !== subtaskId)
        };
      }
      return task;
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    setInsights(insights.filter(i => i.taskId !== taskId));
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const isCurrentlyCompleted = task.completed || (task.subtasks.length > 0 && task.subtasks.every(s => s.completed));
        return {
          ...task,
          completed: !isCurrentlyCompleted,
          subtasks: task.subtasks.map(s => ({ ...s, completed: !isCurrentlyCompleted }))
        };
      }
      return task;
    }));
  };

  const handleToggleHabit = (habitId: string) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const wasCompleted = habit.completedToday;
        return {
          ...habit,
          completedToday: !wasCompleted,
          streak: wasCompleted ? Math.max(0, habit.streak - 1) : habit.streak + 1
        };
      }
      return habit;
    }));
  };

  const dismissInsight = (taskId: string) => {
    setInsights(insights.filter(i => i.taskId !== taskId));
  };

  return (
    <div className="min-h-screen bg-bg text-primary pb-32">
      <div className="max-w-md mx-auto p-6">
        {/* Header */}
        <header className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Leaf className="w-6 h-6 text-accent -rotate-12" fill="currentColor" />
              <h1 className="text-2xl font-bold text-primary">Today's Flow</h1>
            </div>
            <p className="text-sm text-secondary">Tuesday, Oct 24 • Focus Mode Active</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-[#1A2622] flex items-center justify-center text-accent">
            <User className="w-5 h-5" />
          </button>
        </header>

        <div className="space-y-4">
          {/* Habits */}
          {activeTab === 'habits' && habits.map(habit => (
            <HabitCard 
              key={habit.id} 
              habit={habit} 
              onToggle={handleToggleHabit} 
            />
          ))}

          {/* Tasks */}
          {activeTab === 'tasks' && (
            <>
              {tasks.filter(t => !(t.completed || (t.subtasks.length > 0 && t.subtasks.every(s => s.completed)))).length === 0 ? (
                <div className="text-center py-12 bg-card rounded-2xl border border-card-border border-dashed">
                  <CheckSquare className="w-12 h-12 text-secondary/50 mx-auto mb-3" />
                  <h3 className="text-primary font-medium mb-1">All caught up!</h3>
                  <p className="text-secondary text-sm">You've finished all your active tasks.</p>
                </div>
              ) : (
                tasks.filter(t => !(t.completed || (t.subtasks.length > 0 && t.subtasks.every(s => s.completed)))).map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onToggleTask={handleToggleTask}
                    onToggleSubtask={handleToggleSubtask} 
                    onAddSubtask={handleAddSubtask}
                    onDeleteSubtask={handleDeleteSubtask}
                    onDeleteTask={handleDeleteTask}
                    onEditTask={setEditingTask}
                  />
                ))
              )}
            </>
          )}

          {/* Completed Tasks */}
          {activeTab === 'completed' && (
            <>
              {tasks.filter(t => t.completed || (t.subtasks.length > 0 && t.subtasks.every(s => s.completed))).length === 0 ? (
                <div className="text-center py-12 bg-card rounded-2xl border border-card-border border-dashed">
                  <CheckCircle className="w-12 h-12 text-secondary/50 mx-auto mb-3" />
                  <h3 className="text-primary font-medium mb-1">No completed tasks</h3>
                  <p className="text-secondary text-sm">Tasks you finish will appear here.</p>
                </div>
              ) : (
                tasks.filter(t => t.completed || (t.subtasks.length > 0 && t.subtasks.every(s => s.completed))).map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onToggleTask={handleToggleTask}
                    onToggleSubtask={handleToggleSubtask} 
                    onAddSubtask={handleAddSubtask}
                    onDeleteSubtask={handleDeleteSubtask}
                    onDeleteTask={handleDeleteTask}
                    onEditTask={setEditingTask}
                  />
                ))
              )}
            </>
          )}

          {/* AI Insights */}
          {activeTab === 'insights' && (
            <AnimatePresence>
              {insights.map(insight => (
                <AIInsightCard 
                  key={insight.taskId} 
                  message={insight.message} 
                  onDismiss={() => dismissInsight(insight.taskId)} 
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-nav-bg rounded-[2rem] px-6 py-3 flex items-center shadow-2xl z-40">
        <div className="flex flex-1 justify-around">
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`flex flex-col items-center gap-1 w-12 transition-colors ${activeTab === 'tasks' ? 'text-white' : 'text-white/70 hover:text-white'}`}
          >
            <CheckSquare className="w-5 h-5" />
            <span className="text-[10px] font-medium">Tasks</span>
          </button>
          <button 
            onClick={() => setActiveTab('habits')}
            className={`flex flex-col items-center gap-1 w-12 transition-colors ${activeTab === 'habits' ? 'text-white' : 'text-white/70 hover:text-white'}`}
          >
            <Activity className="w-5 h-5" />
            <span className="text-[10px] font-medium">Habits</span>
          </button>
        </div>
        
        <div className="w-16 flex justify-center relative">
          <button 
            onClick={() => setIsAddingTask(!isAddingTask)}
            className="absolute -top-5 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg transform transition-transform active:scale-95 border-[6px]"
            style={{ borderColor: 'var(--color-bg)' }}
          >
            <Plus className="w-6 h-6 text-accent" strokeWidth={3} />
          </button>
        </div>

        <div className="flex flex-1 justify-around">
          <button 
            onClick={() => setActiveTab('insights')}
            className={`flex flex-col items-center gap-1 w-12 transition-colors ${activeTab === 'insights' ? 'text-white' : 'text-white/70 hover:text-white'}`}
          >
            <BarChart2 className="w-5 h-5" />
            <span className="text-[10px] font-medium">Insights</span>
          </button>
          <button 
            onClick={() => setActiveTab('completed')}
            className={`flex flex-col items-center gap-1 w-12 transition-colors ${activeTab === 'completed' ? 'text-white' : 'text-white/70 hover:text-white'}`}
          >
            <CheckCircle className="w-5 h-5" />
            <span className="text-[10px] font-medium">Done</span>
          </button>
        </div>
      </div>

      {/* Task Form Modal */}
      <AnimatePresence>
        {(isAddingTask || editingTask) && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md"
            >
              <TaskForm 
                initialTask={editingTask || undefined}
                onSubmit={editingTask ? handleEditTask : handleAddTask} 
                onCancel={() => {
                  setIsAddingTask(false);
                  setEditingTask(null);
                }} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <LiveAudio />
    </div>
  );
}
