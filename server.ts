import express from 'express';
import { createServer as createViteServer } from 'vite';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import db from './server/db';
import crypto from 'crypto';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-dev';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

// Middleware to check auth
const requireAuth = (req: any, res: any, next: any) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// --- AUTH ROUTES ---

app.get('/api/auth/url', (req, res) => {
  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).json({ error: 'Google OAuth not configured' });
  }
  const redirectUri = `${APP_URL}/auth/callback`;
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent'
  });
  res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
});

app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('No code provided');

  try {
    const redirectUri = `${APP_URL}/auth/callback`;
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenResponse.json();
    if (tokenData.error) throw new Error(tokenData.error_description || tokenData.error);

    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = await userResponse.json();

    // Upsert user
    const stmt = db.prepare('INSERT INTO users (id, email, name, picture) VALUES (?, ?, ?, ?) ON CONFLICT(email) DO UPDATE SET name=excluded.name, picture=excluded.picture RETURNING id');
    let userId = crypto.randomUUID();
    
    // Check if user exists by email
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(userData.email) as any;
    if (existingUser) {
      userId = existingUser.id;
      db.prepare('UPDATE users SET name = ?, picture = ? WHERE id = ?').run(userData.name, userData.picture, userId);
    } else {
      db.prepare('INSERT INTO users (id, email, name, picture) VALUES (?, ?, ?, ?)').run(userId, userData.email, userData.name, userData.picture);
    }

    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
    
    res.cookie('auth_token', token, {
      secure: true,
      sameSite: 'none',
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  } catch (err: any) {
    console.error('OAuth Error:', err);
    res.status(500).send(`Authentication failed: ${err.message}`);
  }
});

app.get('/api/auth/me', requireAuth, (req: any, res) => {
  const user = db.prepare('SELECT id, email, name, picture FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('auth_token', { secure: true, sameSite: 'none', httpOnly: true });
  res.json({ success: true });
});

// --- DATA ROUTES ---

// Tasks
app.get('/api/tasks', requireAuth, (req: any, res) => {
  const tasks = db.prepare('SELECT * FROM tasks WHERE user_id = ?').all(req.userId);
  res.json(tasks.map((t: any) => ({
    ...t,
    completed: !!t.completed,
    subtasks: JSON.parse(t.subtasks)
  })));
});

app.post('/api/tasks', requireAuth, (req: any, res) => {
  const { id, title, priority, deadline, notes, completed, subtasks } = req.body;
  db.prepare('INSERT INTO tasks (id, user_id, title, priority, deadline, notes, completed, subtasks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
    id, req.userId, title, priority, deadline, notes, completed ? 1 : 0, JSON.stringify(subtasks || [])
  );
  res.json({ success: true });
});

app.put('/api/tasks/:id', requireAuth, (req: any, res) => {
  const { title, priority, deadline, notes, completed, subtasks } = req.body;
  db.prepare('UPDATE tasks SET title = ?, priority = ?, deadline = ?, notes = ?, completed = ?, subtasks = ? WHERE id = ? AND user_id = ?').run(
    title, priority, deadline, notes, completed ? 1 : 0, JSON.stringify(subtasks || []), req.params.id, req.userId
  );
  res.json({ success: true });
});

app.delete('/api/tasks/:id', requireAuth, (req: any, res) => {
  db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  res.json({ success: true });
});

// Habits
app.get('/api/habits', requireAuth, (req: any, res) => {
  const habits = db.prepare('SELECT * FROM habits WHERE user_id = ?').all(req.userId);
  res.json(habits.map((h: any) => ({
    ...h,
    completedToday: !!h.completedToday,
    history: JSON.parse(h.history)
  })));
});

app.post('/api/habits', requireAuth, (req: any, res) => {
  const { id, title, completedToday, streak, history } = req.body;
  db.prepare('INSERT INTO habits (id, user_id, title, completedToday, streak, history) VALUES (?, ?, ?, ?, ?, ?)').run(
    id, req.userId, title, completedToday ? 1 : 0, streak, JSON.stringify(history || [])
  );
  res.json({ success: true });
});

app.put('/api/habits/:id', requireAuth, (req: any, res) => {
  const { title, completedToday, streak, history } = req.body;
  db.prepare('UPDATE habits SET title = ?, completedToday = ?, streak = ?, history = ? WHERE id = ? AND user_id = ?').run(
    title, completedToday ? 1 : 0, streak, JSON.stringify(history || []), req.params.id, req.userId
  );
  res.json({ success: true });
});

app.delete('/api/habits/:id', requireAuth, (req: any, res) => {
  db.prepare('DELETE FROM habits WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  res.json({ success: true });
});

// Insights
app.get('/api/insights', requireAuth, (req: any, res) => {
  const insights = db.prepare('SELECT * FROM insights WHERE user_id = ?').all(req.userId);
  res.json(insights);
});

app.post('/api/insights', requireAuth, (req: any, res) => {
  const { taskId, message } = req.body;
  db.prepare('INSERT OR REPLACE INTO insights (taskId, user_id, message) VALUES (?, ?, ?)').run(taskId, req.userId, message);
  res.json({ success: true });
});

app.delete('/api/insights/:taskId', requireAuth, (req: any, res) => {
  db.prepare('DELETE FROM insights WHERE taskId = ? AND user_id = ?').run(req.params.taskId, req.userId);
  res.json({ success: true });
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
