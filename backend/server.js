const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Threat database schema
const threatSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    indicator: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    status: {
      type: String,
      default: 'Pending',
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Threat model
const Threat = mongoose.model('Threat', threatSchema);

// Health check API
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'ThreatLedger backend is running!',
    database: mongoose.connection.readyState === 1
      ? 'Connected'
      : 'Disconnected',
  });
});

// Get all threats from MongoDB
app.get('/api/threats', async (req, res) => {
  try {
    const threats = await Threat.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: threats.length,
      data: threats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not fetch threats.',
    });
  }
});

// Add a new threat to MongoDB
app.post('/api/threats', async (req, res) => {
  try {
    const { type, indicator, severity, description } = req.body;

    if (!type || !indicator) {
      return res.status(400).json({
        success: false,
        message: 'Threat type and indicator are required.',
      });
    }

    const threat = await Threat.create({
      type,
      indicator,
      severity,
      description,
    });

    res.status(201).json({
      success: true,
      message: 'Threat saved successfully!',
      data: threat,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not save threat.',
    });
  }
});

// Connect to MongoDB and start server
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing from the .env file.');
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log('MongoDB connected successfully!');

    app.listen(PORT, () => {
      console.log(`ThreatLedger backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Startup failed:', error.message);
    process.exit(1);
  }
}

startServer();