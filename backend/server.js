// ==========================================
// THREATLEDGER - BACKEND SERVER
// ==========================================

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/user');

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());
// ==========================================
// JWT AUTHENTICATION MIDDLEWARE
// ==========================================

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please login first.',
    });
  }

  const token = authHeader.split(' ')[1];

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      success: false,
      message: 'Authentication configuration error.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please login again.',
    });
  }
}
// ==========================================
// THREAT MODEL
// ==========================================

const threatSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      trim: true,
    },

    indicator: {
      type: String,
      required: true,
      trim: true,
    },

    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },

    description: {
      type: String,
      default: '',
    },

    status: {
      type: String,
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

const Threat =
  mongoose.models.Threat ||
  mongoose.model('Threat', threatSchema);

// ==========================================
// HEALTH API
// ==========================================

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'ThreatLedger API is healthy!',
    database:
      mongoose.connection.readyState === 1
        ? 'Connected'
        : 'Disconnected',
  });
});

// ==========================================
// USER REGISTRATION
// ==========================================

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !name.trim() ||
      !email.trim() ||
      password.length < 8
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Name, email and password of at least 8 characters are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
    });
  }
});

// ==========================================
// USER LOGIN
// ==========================================

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is missing from .env');

      return res.status(500).json({
        success: false,
        message: 'Authentication configuration error.',
      });
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h',
      }
    );

    return res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
    });
  }
});

// ==========================================
// GET ALL THREATS
// ==========================================

app.get('/api/threats', authenticateToken, async (req, res) => {
  try {
    const threats = await Threat.find().sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      count: threats.length,
      data: threats,
    });
  } catch (error) {
    console.error('Fetch threats error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Could not fetch threats.',
    });
  }
});

// ==========================================
// ADD NEW THREAT
// ==========================================

app.post('/api/threats', authenticateToken, async (req, res) => {
  try {
    const {
      type,
      indicator,
      severity,
      description,
    } = req.body;

    if (
      typeof type !== 'string' ||
      !type.trim() ||
      typeof indicator !== 'string' ||
      !indicator.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Threat type and indicator are required.',
      });
    }

    const allowedSeverities = [
      'Low',
      'Medium',
      'High',
      'Critical',
    ];

    const finalSeverity =
      severity === undefined ? 'Medium' : severity;

    if (!allowedSeverities.includes(finalSeverity)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid threat severity.',
      });
    }

    const threat = await Threat.create({
      type: type.trim(),
      indicator: indicator.trim(),
      severity: finalSeverity,
      description:
        typeof description === 'string'
          ? description
          : '',
    });

    return res.status(201).json({
      success: true,
      message: 'Threat saved successfully!',
      data: threat,
    });
  } catch (error) {
    console.error('Save threat error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Could not save threat.',
    });
  }
});

// ==========================================
// CONNECT TO MONGODB AND START SERVER
// ==========================================

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error(
        'MONGODB_URI is missing from the .env file.'
      );
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log('MongoDB connected successfully!');

    app.listen(PORT, () => {
      console.log(
        `ThreatLedger backend running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error('Startup failed:', error.message);
    process.exit(1);
  }
}

startServer();