import Database from 'better-sqlite3';

const db = new Database('app.db');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    picture TEXT
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    priority TEXT NOT NULL,
    deadline TEXT,
    notes TEXT,
    completed BOOLEAN DEFAULT 0,
    subtasks TEXT DEFAULT '[]',
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS habits (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    completedToday BOOLEAN DEFAULT 0,
    streak INTEGER DEFAULT 0,
    history TEXT DEFAULT '[]',
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS insights (
    taskId TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    message TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

export default db;
