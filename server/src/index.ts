import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:4173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'], credentials: true }));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'dashboard_secret_key_2024';
const PORT = process.env.PORT || 3001;

// ─── In-Memory Database ─────────────────────────────────────────────────────
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  avatar: string;
  color: string;
}

interface Widget {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'stat' | 'table' | 'text';
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  colorScheme: string;
  dataSource: string;
  timeRange: string;
  content?: string;
}

interface DashboardState {
  widgets: Widget[];
  title: string;
  lastUpdated: string;
  lastUpdatedBy: string;
}

interface ConnectedUser {
  socketId: string;
  user: User;
  cursor: { x: number; y: number };
  joinedAt: string;
}

// Demo users
const DEMO_USERS: Record<string, User> = {
  'admin@dashboard.com': {
    id: 'user-1',
    email: 'admin@dashboard.com',
    name: 'Alex Admin',
    role: 'admin',
    avatar: 'AA',
    color: '#6366f1',
  },
  'editor@dashboard.com': {
    id: 'user-2',
    email: 'editor@dashboard.com',
    name: 'Emma Editor',
    role: 'editor',
    avatar: 'EE',
    color: '#10b981',
  },
  'viewer@dashboard.com': {
    id: 'user-3',
    email: 'viewer@dashboard.com',
    name: 'Victor Viewer',
    role: 'viewer',
    avatar: 'VV',
    color: '#f59e0b',
  },
};

// Default dashboard state
let dashboardState: DashboardState = {
  title: 'Analytics Dashboard',
  widgets: [
    {
      id: 'widget-1',
      type: 'stat',
      title: 'Total Revenue',
      x: 0, y: 0, w: 3, h: 2,
      colorScheme: 'blue',
      dataSource: 'revenue',
      timeRange: '7d',
    },
    {
      id: 'widget-2',
      type: 'stat',
      title: 'Active Users',
      x: 3, y: 0, w: 3, h: 2,
      colorScheme: 'green',
      dataSource: 'users',
      timeRange: '7d',
    },
    {
      id: 'widget-3',
      type: 'stat',
      title: 'Conversion Rate',
      x: 6, y: 0, w: 3, h: 2,
      colorScheme: 'purple',
      dataSource: 'conversion',
      timeRange: '7d',
    },
    {
      id: 'widget-4',
      type: 'stat',
      title: 'Bounce Rate',
      x: 9, y: 0, w: 3, h: 2,
      colorScheme: 'red',
      dataSource: 'bounce',
      timeRange: '7d',
    },
    {
      id: 'widget-5',
      type: 'line',
      title: 'Revenue Over Time',
      x: 0, y: 2, w: 8, h: 4,
      colorScheme: 'blue',
      dataSource: 'sales',
      timeRange: '30d',
    },
    {
      id: 'widget-6',
      type: 'pie',
      title: 'Traffic Sources',
      x: 8, y: 2, w: 4, h: 4,
      colorScheme: 'purple',
      dataSource: 'traffic',
      timeRange: '30d',
    },
    {
      id: 'widget-7',
      type: 'bar',
      title: 'Revenue by Category',
      x: 0, y: 6, w: 6, h: 4,
      colorScheme: 'green',
      dataSource: 'categories',
      timeRange: '30d',
    },
    {
      id: 'widget-8',
      type: 'table',
      title: 'Recent Activity',
      x: 6, y: 6, w: 6, h: 4,
      colorScheme: 'blue',
      dataSource: 'activity',
      timeRange: '7d',
    },
  ],
  lastUpdated: new Date().toISOString(),
  lastUpdatedBy: 'System',
};

// Activity log
interface ActivityLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
}
const activityLog: ActivityLog[] = [];

// Connected users map: socketId -> ConnectedUser
const connectedUsers = new Map<string, ConnectedUser>();

// ─── REST API ───────────────────────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { email } = req.body as { email: string };
  const user = DEMO_USERS[email];
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: '24h',
  });
  return res.json({ token, user });
});

app.get('/api/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token' });
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string };
    const user = DEMO_USERS[decoded.email];
    if (!user) return res.status(401).json({ error: 'User not found' });
    return res.json({ user });
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

app.get('/api/dashboard', (req, res) => {
  res.json(dashboardState);
});

app.get('/api/activity', (_req, res) => {
  res.json(activityLog.slice(-20).reverse());
});

// ─── Socket.io ──────────────────────────────────────────────────────────────
io.on('connection', (socket: Socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // User joins
  socket.on('user:join', (user: User) => {
    const connectedUser: ConnectedUser = {
      socketId: socket.id,
      user,
      cursor: { x: 0, y: 0 },
      joinedAt: new Date().toISOString(),
    };
    connectedUsers.set(socket.id, connectedUser);

    // Send current dashboard state to new user
    socket.emit('dashboard:sync', dashboardState);

    // Broadcast updated user list
    io.emit('users:update', Array.from(connectedUsers.values()));

    // Log activity
    const log: ActivityLog = {
      id: uuidv4(),
      user: user.name,
      action: 'joined the dashboard',
      timestamp: new Date().toISOString(),
    };
    activityLog.push(log);
    io.emit('activity:new', log);

    console.log(`[Socket] ${user.name} joined. Total users: ${connectedUsers.size}`);
  });

  // Cursor movement — throttled on client side
  socket.on('cursor:move', (data: { x: number; y: number }) => {
    const connUser = connectedUsers.get(socket.id);
    if (connUser) {
      connUser.cursor = data;
      // Broadcast to all OTHER clients
      socket.broadcast.emit('cursor:update', {
        socketId: socket.id,
        user: connUser.user,
        cursor: data,
      });
    }
  });

  // Widget updates (add/edit/delete/move)
  socket.on('widget:update', (data: { widget: Widget; action: string; userName: string }) => {
    const { widget, action, userName } = data;

    if (action === 'add') {
      dashboardState.widgets.push(widget);
    } else if (action === 'edit') {
      const idx = dashboardState.widgets.findIndex((w) => w.id === widget.id);
      if (idx !== -1) dashboardState.widgets[idx] = widget;
    } else if (action === 'delete') {
      dashboardState.widgets = dashboardState.widgets.filter((w) => w.id !== widget.id);
    } else if (action === 'move') {
      const idx = dashboardState.widgets.findIndex((w) => w.id === widget.id);
      if (idx !== -1) {
        dashboardState.widgets[idx].x = widget.x;
        dashboardState.widgets[idx].y = widget.y;
        dashboardState.widgets[idx].w = widget.w;
      }
    }

    dashboardState.lastUpdated = new Date().toISOString();
    dashboardState.lastUpdatedBy = userName;

    // Broadcast to all clients including sender
    io.emit('widget:changed', { widget, action });

    // Activity log
    const log: ActivityLog = {
      id: uuidv4(),
      user: userName,
      action: `${action}d widget "${widget.title}"`,
      timestamp: new Date().toISOString(),
    };
    activityLog.push(log);
    io.emit('activity:new', log);
  });

  // Dashboard title update
  socket.on('dashboard:title', (data: { title: string; userName: string }) => {
    dashboardState.title = data.title;
    dashboardState.lastUpdated = new Date().toISOString();
    io.emit('dashboard:titleChanged', data.title);

    const log: ActivityLog = {
      id: uuidv4(),
      user: data.userName,
      action: `renamed dashboard to "${data.title}"`,
      timestamp: new Date().toISOString(),
    };
    activityLog.push(log);
    io.emit('activity:new', log);
  });

  // Dashboard import
  socket.on('dashboard:import', (data: { state: DashboardState; userName: string }) => {
    dashboardState = { ...data.state, lastUpdated: new Date().toISOString() };
    io.emit('dashboard:sync', dashboardState);

    const log: ActivityLog = {
      id: uuidv4(),
      user: data.userName,
      action: 'imported a dashboard layout',
      timestamp: new Date().toISOString(),
    };
    activityLog.push(log);
    io.emit('activity:new', log);
  });

  // Disconnect
  socket.on('disconnect', () => {
    const connUser = connectedUsers.get(socket.id);
    if (connUser) {
      connectedUsers.delete(socket.id);
      io.emit('users:update', Array.from(connectedUsers.values()));
      io.emit('cursor:remove', socket.id);

      const log: ActivityLog = {
        id: uuidv4(),
        user: connUser.user.name,
        action: 'left the dashboard',
        timestamp: new Date().toISOString(),
      };
      activityLog.push(log);
      io.emit('activity:new', log);
      console.log(`[Socket] ${connUser.user.name} disconnected.`);
    }
  });
});

// ─── Start Server ───────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard API ready`);
  console.log(`🔌 Socket.io ready\n`);
});
