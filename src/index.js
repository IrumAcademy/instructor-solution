import { Hono } from 'hono';
import { cors } from 'hono/cors';

import authRoutes from './routes/auth';
import instructorRoutes from './routes/instructor';
import videoSourcesRoutes from './routes/videoSources';
import videosRoutes from './routes/videos';
import coursesRoutes from './routes/courses';
import inquiriesRoutes from './routes/inquiries';

const app = new Hono();

app.use('*', cors());

app.route('/api/auth', authRoutes);
app.route('/api/instructor', instructorRoutes);
app.route('/api/video-sources', videoSourcesRoutes);
app.route('/api/videos', videosRoutes);
app.route('/api/courses', coursesRoutes);
app.route('/api/inquiries', inquiriesRoutes);

app.notFound((c) => c.json({ error: 'Not found' }, 404));
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;
