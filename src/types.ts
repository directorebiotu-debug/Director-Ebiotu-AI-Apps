export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  subtasks: Subtask[];
  priority: 'Low' | 'Medium' | 'High';
  deadline?: string;
  notes?: string;
  completed?: boolean;
}

export interface Habit {
  id: string;
  title: string;
  completedToday: boolean;
  streak: number;
}

export interface AIInsight {
  taskId: string;
  message: string;
}
