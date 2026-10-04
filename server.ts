import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import * as dotenv from 'dotenv';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import {
  getOrCreateUser,
  fetchFullCrowdState,
  syncFullCrowdState,
  seedInitialCrowdStateIfEmpty,
} from './src/db/repository.ts';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' }));

  // Authenticated User Profile & Sync Endpoint
  app.post('/api/auth/sync-user', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || 'user@smartcrowd.edu';
      const role = req.body?.role || 'System Administrator';

      if (!uid) {
        return res.status(400).json({ error: 'Invalid user identifier' });
      }

      const dbUser = await getOrCreateUser(uid, email, role);
      res.json({ user: dbUser });
    } catch (error: any) {
      console.error('Error syncing user:', error);
      res.status(500).json({ error: error.message || 'Failed to synchronize user profile' });
    }
  });

  // Load Full Crowd Management State (Protected by Firebase Auth)
  app.get('/api/crowd-state', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (req.user?.uid) {
        await getOrCreateUser(req.user.uid, req.user.email || 'user@smartcrowd.edu');
      }
      const state = await fetchFullCrowdState();
      res.json(state);
    } catch (error: any) {
      console.error('Error fetching crowd state:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch crowd state' });
    }
  });

  // Persist Full Crowd Management State (Protected by Firebase Auth)
  app.put('/api/crowd-state', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { zones, liveAreas, queues, staff, alerts } = req.body || {};
      if (!Array.isArray(zones) || !Array.isArray(queues)) {
        return res.status(400).json({ error: 'Invalid crowd state payload' });
      }
      const result = await syncFullCrowdState({
        zones,
        liveAreas: Array.isArray(liveAreas) ? liveAreas : [],
        queues,
        staff: Array.isArray(staff) ? staff : [],
        alerts: Array.isArray(alerts) ? alerts : [],
      });
      res.json(result);
    } catch (error: any) {
      console.error('Error saving crowd state:', error);
      res.status(500).json({ error: error.message || 'Failed to save crowd state' });
    }
  });

  // Reset Database to Initial Demo Baseline (Protected by Firebase Auth)
  app.post('/api/crowd-state/reset', requireAuth, async (_req: AuthRequest, res) => {
    try {
      const {
        INITIAL_ZONES,
        INITIAL_LIVE_AREAS,
        INITIAL_QUEUES,
        INITIAL_STAFF,
        INITIAL_ALERTS,
      } = await import('./src/data/mockData.ts');

      await syncFullCrowdState({
        zones: INITIAL_ZONES,
        liveAreas: INITIAL_LIVE_AREAS,
        queues: INITIAL_QUEUES,
        staff: INITIAL_STAFF,
        alerts: INITIAL_ALERTS,
      });

      await seedInitialCrowdStateIfEmpty();
      const freshState = await fetchFullCrowdState();
      res.json(freshState);
    } catch (error: any) {
      console.error('Error resetting crowd state:', error);
      res.status(500).json({ error: error.message || 'Failed to reset crowd state' });
    }
  });

  // Vite middleware for development or static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmartCrowd server running on http://localhost:${PORT}`);
  });
}

startServer();
