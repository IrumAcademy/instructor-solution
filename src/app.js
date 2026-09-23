const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const instructorRoutes = require('./routes/instructor');
const videoSourcesRoutes = require('./routes/videoSources');
const videosRoutes = require('./routes/videos');
const coursesRoutes = require('./routes/courses');
const inquiriesRoutes = require('./routes/inquiries');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/video-sources', videoSourcesRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/inquiries', inquiriesRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
