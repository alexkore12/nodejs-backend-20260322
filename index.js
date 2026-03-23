/**
 * Node.js Backend API
 * Seguridad mejorada con Helmet, Rate Limiting, y mejores prácticas
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet - Security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

// CORS - Restricted
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:8080'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // Stricter for auth endpoints
    message: { error: 'Too many authentication attempts, please try again later.' },
});

app.use(limiter);

// Body parser with size limit
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ============================================
// IN-MEMORY DATABASE (replace with real DB)
// ============================================

// Passwords should be hashed in production - using simple comparison for demo
const users = [
    { id: 1, username: 'admin', password: 'admin123', email: 'admin@example.com', role: 'admin' },
    { id: 2, username: 'user', password: 'user123', email: 'user@example.com', role: 'user' }
];

let nextId = 3;

// Helper functions
const findUserByUsername = (username) => users.find(u => u.username === username);
const findUserById = (id) => users.find(u => u.id === id);

// ============================================
// AUTH MIDDLEWARE
// ============================================

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

const requireRole = (role) => (req, res, next) => {
    if (!req.user || req.user.role !== role) {
        return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
};

// ============================================
// VALIDATION MIDDLEWARE
// ============================================

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// ============================================
// ROUTES
// ============================================

// Root
app.get('/', (req, res) => {
    res.json({
        name: 'Node.js Backend API',
        version: '2.0.0',
        status: 'running',
        docs: '/api/docs',
        security: 'enabled'
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '2.0.0'
    });
});

// Auth routes with rate limiting
app.post('/api/auth/login', 
    authLimiter,
    [
        body('username').trim().isLength({ min: 3, max: 30 }).escape(),
        body('password').isLength({ min: 6, max: 100 })
    ],
    validate,
    (req, res) => {
        const { username, password } = req.body;
        
        const user = findUserByUsername(username);
        
        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            token,
            user: { id: user.id, username: user.username, email: user.email, role: user.role }
        });
    }
);

app.post('/api/auth/register', 
    authLimiter,
    [
        body('username').trim().isLength({ min: 3, max: 30 }).escape()
            .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Username can only contain letters, numbers, underscore and dash'),
        body('password').isLength({ min: 6, max: 100 })
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('Password must contain at least one uppercase, one lowercase and one number'),
        body('email').isEmail().normalizeEmail()
    ],
    validate,
    (req, res) => {
        const { username, password, email } = req.body;
        
        if (findUserByUsername(username)) {
            return res.status(409).json({ error: 'Username already exists' });
        }
        
        const newUser = {
            id: nextId++,
            username,
            password, // In production: bcrypt.hash(password, 10)
            email,
            role: 'user'
        };
        
        users.push(newUser);
        
        const token = jwt.sign(
            { id: newUser.id, username: newUser.username, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.status(201).json({
            token,
            user: { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role }
        });
    }
);

// Protected routes
app.get('/api/profile', authenticate, (req, res) => {
    const user = findUserById(req.user.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
});

// Users CRUD
app.get('/api/users', authenticate, requireRole('admin'), (req, res) => {
    const usersWithoutPassword = users.map(({ password, ...u }) => u);
    res.json(usersWithoutPassword);
});

app.get('/api/users/:id', authenticate, (req, res) => {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId) || userId < 1) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const user = findUserById(userId);
    
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    if (req.user.role !== 'admin' && req.user.id !== user.id) {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
});

app.put('/api/users/:id', 
    authenticate,
    [
        body('username').optional().trim().isLength({ min: 3, max: 30 }).escape(),
        body('email').optional().isEmail().normalizeEmail(),
        body('role').optional().isIn(['admin', 'user', 'guest'])
    ],
    validate,
    (req, res) => {
        const userId = parseInt(req.params.id);
        
        if (isNaN(userId) || userId < 1) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        
        const user = findUserById(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        if (req.user.role !== 'admin' && req.user.id !== user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const { username, email, role } = req.body;
        
        if (username) user.username = username;
        if (email) user.email = email;
        if (role && req.user.role === 'admin') user.role = role;
        
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    }
);

app.delete('/api/users/:id', authenticate, requireRole('admin'), (req, res) => {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId) || userId < 1) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    users.splice(userIndex, 1);
    res.json({ message: 'User deleted', id: userId });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    // Don't expose internal errors in production
    const message = process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message;
    
    res.status(500).json({ error: message });
});

// ============================================
// START SERVER
// ============================================

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`✓ Server running on port ${PORT}`);
        console.log(`✓ JWT Secret: ${JWT_SECRET.substring(0, 5)}...`);
        console.log(`✓ Security headers: enabled`);
        console.log(`✓ Rate limiting: enabled`);
    });
}

module.exports = app;
