import { Task, Habit, AIInsight } from '../types';

export const api = {
  async getTasks(): Promise<Task[]> {
    const res = await fetch('/api/tasks');
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
  },
  async addTask(task: Task) {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    if (!res.ok) throw new Error('Failed to add task');
  },
  async updateTask(task: Task) {
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    if (!res.ok) throw new Error('Failed to update task');
  },
  async deleteTask(id: string) {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete task');
  },

  async getHabits(): Promise<Habit[]> {
    const res = await fetch('/api/habits');
    if (!res.ok) throw new Error('Failed to fetch habits');
    return res.json();
  },
  async addHabit(habit: Habit) {
    const res = await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(habit)
    });
    if (!res.ok) throw new Error('Failed to add habit');
  },
  async updateHabit(habit: Habit) {
    const res = await fetch(`/api/habits/${habit.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(habit)
    });
    if (!res.ok) throw new Error('Failed to update habit');
  },
  async deleteHabit(id: string) {
    const res = await fetch(`/api/habits/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete habit');
  },

  async getInsights(): Promise<AIInsight[]> {
    const res = await fetch('/api/insights');
    if (!res.ok) throw new Error('Failed to fetch insights');
    return res.json();
  },
  async addInsight(insight: AIInsight) {
    const res = await fetch('/api/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(insight)
    });
    if (!res.ok) throw new Error('Failed to add insight');
  },
  async deleteInsight(taskId: string) {
    const res = await fetch(`/api/insights/${taskId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete insight');
  }
};
