import { Hono } from 'hono';
import { cors } from 'hono/cors';

import authRoutes from './routes/auth.js';
import instructorRoutes from './routes/instructor.js';
import videoSourcesRoutes from './routes/videoSources.js';
import videosRoutes from './routes/videos.js';
import coursesRoutes from './routes/courses.js';
import inquiriesRoutes from './routes/inquiries.js';
import testimonialsRoutes from './routes/testimonials.js';

const app = new Hono({ strict: false });

app.use('*', cors());

app.route('/api/auth', authRoutes);
app.route('/api/instructor', instructorRoutes);
app.route('/api/video-sources', videoSourcesRoutes);
app.route('/api/videos', videosRoutes);
app.route('/api/courses', coursesRoutes);
app.route('/api/inquiries', inquiriesRoutes);
app.route('/api/testimonials', testimonialsRoutes);

app.notFound((c) => c.json({ error: 'Not found' }, 404));
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;
