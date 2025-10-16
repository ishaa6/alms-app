require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const { initDB } = require('./config/db');
const { initMailer } = require('./config/mail');

const logRequests = require('./middleware/logger');

const authRoutes = require('./routes/auth');
const attendanceRoutes = require('./routes/attendance');
const leaveRoutes = require('./routes/leave');
const userRoutes = require('./routes/user');
const mapRoutes = require('./routes/map')

const app = express();

app.use(logRequests);    // Log all requests and responses
app.use(express.json());

app.use(cors());
app.use(bodyParser.json());

app.use('/api', authRoutes);
app.use('/api', attendanceRoutes);
app.use('/api', leaveRoutes);
app.use('/api/users/', userRoutes);
app.use('/api', mapRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));

(async () => {
  try {
    await initDB();
    await initMailer();

    console.log('🚀 App is ready');

  } catch (err) {
    console.error('❌ Startup failed:', err.message);
  }
})();