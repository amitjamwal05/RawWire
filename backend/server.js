require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const newsRoutes = require('./routes/newsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const otpRoutes = require('./routes/otpRoutes');

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all for local dev
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Make io available in routes via req.app.get('io')
app.set('io', io);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/news', newsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/otp', otpRoutes);

app.get('/', (req, res) => {
  res.send('News API with Socket.io is running');
});

// Ultra-lightweight endpoint specifically for cron-job.org
app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok' });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Self-ping logic to keep Render awake natively
  const https = require('https');
  setInterval(() => {
    https.get('https://rawwire.onrender.com/api/ping', (res) => {
      console.log(`Self-ping successful! Status: ${res.statusCode}`);
    }).on('error', (err) => {
      console.error('Self-ping failed:', err.message);
    });
  }, 14 * 60 * 1000); // Ping every 14 minutes
});
