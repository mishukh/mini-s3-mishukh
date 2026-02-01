const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./services/Database');
const apiRoutes = require('./routes/api');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet());
app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send(`
      <h1>Mini-S3 System</h1>
      <p>System is Running.</p>
      <ul>
        <li>POST /api/upload (Multipart Form)</li>
        <li>GET /api/files</li>
        <li>GET /api/files/:id</li>
      </ul>
    `);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Storage Nodes: ./nodes/node1, ./nodes/node2, ./nodes/node3`);
});
