import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import * as sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import fs from 'fs';
import { promises as fsPromises } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_for_dev';
const PORT = 3000;

async function startServer() {
  try {
    const app = express();
    app.use(express.json({ limit: '100mb' }));
    app.use(cookieParser());

    // Health check endpoint - must be first
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      await fsPromises.mkdir(uploadDir, { recursive: true });
    }
    app.use('/uploads', express.static(uploadDir));

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({ 
    storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
  });

  // Database setup
  let db: any;
  if (process.env.DB_NAME) {
    const mysql = (await import('mysql2/promise')).default;
    const pool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50)
      );
    `);
    // Tương thích hướng xuối (add columns nếu DB cũ chưa có)
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255)`).catch(() => {});
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50)`).catch(() => {});
    await pool.query(`
      CREATE TABLE IF NOT EXISTS app_data (
        user_id INT PRIMARY KEY,
        settings LONGTEXT,
        participants LONGTEXT,
        winners LONGTEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );
    `);

    db = {
      run: async (sql: string, params: any[] = []) => {
        if (sql.includes('INSERT OR REPLACE INTO app_data')) {
            sql = 'INSERT INTO app_data (user_id, settings, participants, winners) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE settings = VALUES(settings), participants = VALUES(participants), winners = VALUES(winners)';
        }
        const [result] = await pool.execute(sql, params) as any;
        return { lastID: result.insertId };
      },
      get: async (sql: string, params: any[] = []) => {
        const [rows] = await pool.execute(sql, params) as any;
        return rows[0];
      },
      all: async (sql: string, params: any[] = []) => {
        const [rows] = await pool.execute(sql, params) as any;
        return rows;
      }
    };
    console.log('Connected to MySQL Database from environment variables');
  } else {
    // Fallback SQLite
    db = await open({
      filename: './database.sqlite',
      driver: (sqlite3 as any).default?.Database || sqlite3.Database
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        email TEXT,
        phone TEXT
      );

      CREATE TABLE IF NOT EXISTS app_data (
        user_id INTEGER PRIMARY KEY,
        settings TEXT,
        participants TEXT,
        winners TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );
    `);
    console.log('Connected to local SQLite Database');
  }

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Forbidden' });
      req.user = user;
      next();
    });
  };

  // Auth Routes
  app.post('/api/auth/register', async (req, res) => {
    const { username, password, email, phone } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
    if (!email) return res.status(400).json({ error: 'Email là bắt buộc' });
    if (!phone) return res.status(400).json({ error: 'Số điện thoại là bắt buộc' });

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await db.run('INSERT INTO users (username, password, email, phone) VALUES (?, ?, ?, ?)', [username, hashedPassword, email, phone]);
      
      // Initialize empty data for new user
      await db.run('INSERT INTO app_data (user_id, settings, participants, winners) VALUES (?, ?, ?, ?)', 
        [result.lastID, JSON.stringify({}), JSON.stringify([]), JSON.stringify({})]);

      res.json({ success: true });
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed') || error.message.includes('Duplicate entry')) {
        res.status(400).json({ error: 'Tên đăng nhập đã tồn tại' });
      } else {
        res.status(500).json({ error: 'Server error' });
      }
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);

    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.json({ user: { id: user.id, username: user.username } });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
  });

  app.get('/api/auth/me', authenticateToken, (req: any, res) => {
    res.json({ user: req.user });
  });

  // Data Routes
  app.get('/api/data', authenticateToken, async (req: any, res) => {
    const data = await db.get('SELECT * FROM app_data WHERE user_id = ?', [req.user.id]);
    if (!data) {
        return res.json({ settings: {}, participants: [], winners: {} });
    }
    res.json({
      settings: JSON.parse(data.settings || '{}'),
      participants: JSON.parse(data.participants || '[]'),
      winners: JSON.parse(data.winners || '{}')
    });
  });

  app.post('/api/data', authenticateToken, async (req: any, res) => {
    const { settings, participants, winners } = req.body;
    await db.run(
      'INSERT OR REPLACE INTO app_data (user_id, settings, participants, winners) VALUES (?, ?, ?, ?)',
      [req.user.id, JSON.stringify(settings), JSON.stringify(participants), JSON.stringify(winners)]
    );
    res.json({ success: true });
  });

  app.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  });

  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('FATAL SERVER ERROR:', error);
    process.exit(1);
  }
}

startServer().catch(err => {
  console.error('SERVER STARTUP ERROR:', err);
  process.exit(1);
});
