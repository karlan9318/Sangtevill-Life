import express from 'express';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import dotenv from 'dotenv';
import {
  INITIAL_USERS,
  INITIAL_POSTS,
  INITIAL_ARCHIVES,
  INITIAL_VOTES,
  INITIAL_CHAT_ROOMS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_SMS_LOGS,
  INITIAL_FACILITIES,
  INITIAL_VISITOR_VEHICLES,
} from './src/data/mockInitialData.ts';

dotenv.config();

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const ROOT_DIR = path.resolve(import.meta.dirname);
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(ROOT_DIR, 'data'));
const DB_FILE = path.join(DATA_DIR, 'santeville-db.json');

interface ServerDbState {
  users: typeof INITIAL_USERS;
  posts: typeof INITIAL_POSTS;
  archives: typeof INITIAL_ARCHIVES;
  votes: typeof INITIAL_VOTES;
  chatRooms: typeof INITIAL_CHAT_ROOMS;
  chatMessages: typeof INITIAL_CHAT_MESSAGES;
  smsLogs: typeof INITIAL_SMS_LOGS;
  facilities: typeof INITIAL_FACILITIES;
  visitorVehicles: typeof INITIAL_VISITOR_VEHICLES;
  monthlyParkingLimitHours: number;
  updatedAt: string;
}

const VALID_STATE_KEYS = [
  'users',
  'posts',
  'archives',
  'votes',
  'chatRooms',
  'chatMessages',
  'smsLogs',
  'facilities',
  'visitorVehicles',
  'monthlyParkingLimitHours',
] as const;

type StateKey = (typeof VALID_STATE_KEYS)[number];

const createSeedState = (): ServerDbState => ({
  users: INITIAL_USERS,
  posts: INITIAL_POSTS,
  archives: INITIAL_ARCHIVES,
  votes: INITIAL_VOTES,
  chatRooms: INITIAL_CHAT_ROOMS,
  chatMessages: INITIAL_CHAT_MESSAGES,
  smsLogs: INITIAL_SMS_LOGS,
  facilities: INITIAL_FACILITIES,
  visitorVehicles: INITIAL_VISITOR_VEHICLES,
  monthlyParkingLimitHours: 100,
  updatedAt: new Date().toISOString(),
});

const ensureDbInitialized = (): ServerDbState => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const seed = createSeedState();
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf-8');
    return seed;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<ServerDbState>;
    const seed = createSeedState();
    return {
      users: Array.isArray(parsed.users) ? parsed.users : seed.users,
      posts: Array.isArray(parsed.posts) ? parsed.posts : seed.posts,
      archives: Array.isArray(parsed.archives) ? parsed.archives : seed.archives,
      votes: Array.isArray(parsed.votes) ? parsed.votes : seed.votes,
      chatRooms: Array.isArray(parsed.chatRooms) ? parsed.chatRooms : seed.chatRooms,
      chatMessages: parsed.chatMessages && typeof parsed.chatMessages === 'object' ? parsed.chatMessages : seed.chatMessages,
      smsLogs: Array.isArray(parsed.smsLogs) ? parsed.smsLogs : seed.smsLogs,
      facilities: Array.isArray(parsed.facilities) ? parsed.facilities : seed.facilities,
      visitorVehicles: Array.isArray(parsed.visitorVehicles) ? parsed.visitorVehicles : seed.visitorVehicles,
      monthlyParkingLimitHours:
        typeof parsed.monthlyParkingLimitHours === 'number' && parsed.monthlyParkingLimitHours > 0
          ? parsed.monthlyParkingLimitHours
          : 100,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    const seed = createSeedState();
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf-8');
    return seed;
  }
};

let dbState: ServerDbState = ensureDbInitialized();

const persistDb = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(dbState, null, 2), 'utf-8');
  fs.renameSync(tmpFile, DB_FILE);
};

const getLocalNetworkUrls = (port: number): string[] => {
  const urls: string[] = [];
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        urls.push(`http://${iface.address}:${port}`);
      }
    }
  }
  return urls;
};

const DOWNLOADABLE_ARTIFACTS: Record<string, { filePath: string; downloadName: string; contentType: string }> = {
  'install-server.sh': {
    filePath: path.join(ROOT_DIR, 'install-server.sh'),
    downloadName: 'install-server.sh',
    contentType: 'application/x-sh; charset=utf-8',
  },
  'install-server.ps1': {
    filePath: path.join(ROOT_DIR, 'install-server.ps1'),
    downloadName: 'install-server.ps1',
    contentType: 'text/plain; charset=utf-8',
  },
  Dockerfile: {
    filePath: path.join(ROOT_DIR, 'Dockerfile'),
    downloadName: 'Dockerfile',
    contentType: 'text/plain; charset=utf-8',
  },
  'docker-compose.yml': {
    filePath: path.join(ROOT_DIR, 'docker-compose.yml'),
    downloadName: 'docker-compose.yml',
    contentType: 'text/yaml; charset=utf-8',
  },
  'santeville-life.service': {
    filePath: path.join(ROOT_DIR, 'deploy', 'santeville-life.service'),
    downloadName: 'santeville-life.service',
    contentType: 'text/plain; charset=utf-8',
  },
  'nginx.conf.example': {
    filePath: path.join(ROOT_DIR, 'deploy', 'nginx.conf.example'),
    downloadName: 'nginx.conf.example',
    contentType: 'text/plain; charset=utf-8',
  },
  'capacitor.config.json': {
    filePath: path.join(ROOT_DIR, 'capacitor.config.json'),
    downloadName: 'capacitor.config.json',
    contentType: 'application/json; charset=utf-8',
  },
  'build-mobile-app.sh': {
    filePath: path.join(ROOT_DIR, 'scripts', 'build-mobile-app.sh'),
    downloadName: 'build-mobile-app.sh',
    contentType: 'application/x-sh; charset=utf-8',
  },
  'SERVER_AND_MOBILE_INSTALL.md': {
    filePath: path.join(ROOT_DIR, 'SERVER_AND_MOBILE_INSTALL.md'),
    downloadName: 'SERVER_AND_MOBILE_INSTALL.md',
    contentType: 'text/markdown; charset=utf-8',
  },
};

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  app.use(express.json({ limit: '15mb' }));

  // Health & Server Info API
  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      service: 'santeville-life-server',
      version: '1.0.0',
      nodeVersion: process.version,
      port: PORT,
      dataFile: DB_FILE,
      updatedAt: dbState.updatedAt,
      counts: {
        users: dbState.users.length,
        posts: dbState.posts.length,
        votes: dbState.votes.length,
        facilities: dbState.facilities.length,
        visitorVehicles: dbState.visitorVehicles.length,
      },
    });
  });

  app.get('/api/install-info', (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host || `localhost:${PORT}`;
    res.json({
      serviceName: '상떼빌라이프 통합 커뮤니티 서버',
      currentOrigin: `${protocol}://${host}`,
      networkUrls: getLocalNetworkUrls(PORT),
      port: PORT,
      dataDirectory: DATA_DIR,
      artifacts: Object.keys(DOWNLOADABLE_ARTIFACTS),
    });
  });

  // Downloadable Server & Mobile Installer Files
  app.get('/api/download/:artifact', (req, res) => {
    const item = DOWNLOADABLE_ARTIFACTS[req.params.artifact];
    if (!item || !fs.existsSync(item.filePath)) {
      res.status(404).json({ error: '요청하신 설치 파일을 찾을 수 없습니다.' });
      return;
    }
    res.setHeader('Content-Type', item.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${item.downloadName}"`);
    res.sendFile(item.filePath);
  });

  // Full State Read
  app.get('/api/state', (_req, res) => {
    res.json(dbState);
  });

  // Atomic Slice Update
  app.put('/api/state/:key', (req, res) => {
    const key = req.params.key as StateKey;
    if (!VALID_STATE_KEYS.includes(key)) {
      res.status(400).json({ error: '유효하지 않은 상태 키입니다.' });
      return;
    }
    const { value } = req.body as { value?: unknown };
    if (value === undefined) {
      res.status(400).json({ error: 'value 필드가 필요합니다.' });
      return;
    }
    (dbState as unknown as Record<string, unknown>)[key] = value;
    dbState.updatedAt = new Date().toISOString();
    persistDb();
    res.json({ ok: true, key, updatedAt: dbState.updatedAt });
  });

  // Database Backup Download (for server admins)
  app.get('/api/backup', (_req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="santeville-backup-${new Date().toISOString().slice(0, 10)}.json"`
    );
    res.send(JSON.stringify(dbState, null, 2));
  });

  // Mount Vite middleware in development or serve built static files in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        ws: { server: httpServer },
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(ROOT_DIR, 'dist');
    app.use(express.static(distDir, { maxAge: '1h' }));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        next();
        return;
      }
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  httpServer.listen(PORT, HOST, () => {
    console.log(`[상떼빌라이프 서버] 실행 중: http://${HOST}:${PORT} (NODE_ENV=${process.env.NODE_ENV || 'development'})`);
    console.log(`[상떼빌라이프 DB] 데이터 저장 경로: ${DB_FILE}`);
  });
}

startServer().catch((err) => {
  console.error('[상떼빌라이프 서버 시작 오류]', err);
  process.exit(1);
});
