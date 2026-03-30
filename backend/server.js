const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const dns = require('dns');
const connectDB = require('./config/db');

// Fix for Node.js DNS resolution issues with MongoDB SRV
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));

// Health check
app.get('/', (req, res) => res.json({ message: 'Job Portal API running ✅' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
