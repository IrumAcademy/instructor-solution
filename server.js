const fs = require('node:fs');
const path = require('node:path');

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) process.loadEnvFile(envPath);

const app = require('./src/app');

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`instructor-solution API listening on :${port}`);
});
