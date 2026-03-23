"""
Node.js Backend Security Module
Comprehensive security utilities for Node.js applications
"""

const crypto = require('crypto');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cryptojs = require('crypto-js');

// Security configuration
const SECURITY_CONFIG = {
    // JWT settings
    jwt: {
        expiresIn: '24h',
        algorithm: 'HS256'
    },
    // Password hashing
    password: {
        saltRounds: 12,
        minLength: 8
    },
    // Rate limiting
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP'
    },
    // CORS
    cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
        credentials: true,
        maxAge: 86400
    }
};

/**
 * Password hashing with bcrypt
 */
async function hashPassword(password) {
    const bcrypt = require('bcrypt');
    
    if (password.length < SECURITY_CONFIG.password.minLength) {
        throw new Error(`Password must be at least ${SECURITY_CONFIG.password.minLength} characters`);
    }
    
    return await bcrypt.hash(password, SECURITY_CONFIG.password.saltRounds);
}

/**
 * Password verification
 */
async function verifyPassword(password, hash) {
    const bcrypt = require('bcrypt');
    return await bcrypt.compare(password, hash);
}

/**
 * Generate secure random token
 */
function generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate JWT token
 */
function generateJWT(payload, secret = process.env.JWT_SECRET) {
    const jwt = require('jsonwebtoken');
    
    return jwt.sign(payload, secret, {
        expiresIn: SECURITY_CONFIG.jwt.expiresIn,
        algorithm: SECURITY_CONFIG.jwt.algorithm
    });
}

/**
 * Verify JWT token
 */
function verifyJWT(token, secret = process.env.JWT_SECRET) {
    const jwt = require('jsonwebtoken');
    
    try {
        return jwt.verify(token, secret, {
            algorithms: [SECURITY_CONFIG.jwt.algorithm]
        });
    } catch (error) {
        return null;
    }
}

/**
 * Data encryption (AES-256)
 */
function encryptData(data, key = process.env.ENCRYPTION_KEY) {
    if (!key) throw new Error('Encryption key required');
    
    const encrypted = cryptojs.AES.encrypt(
        JSON.stringify(data),
        key
    ).toString();
    
    return encrypted;
}

/**
 * Data decryption
 */
function decryptData(encryptedData, key = process.env.ENCRYPTION_KEY) {
    if (!key) throw new Error('Encryption key required');
    
    const decrypted = cryptojs.AES.decrypt(encryptedData, key);
    const data = decrypted.toString(cryptojs.enc.Utf8);
    
    return JSON.parse(data);
}

/**
 * Input sanitization
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
        .replace(/[<>]/g, '') // Remove < and >
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .trim();
}

/**
 * SQL injection prevention (basic)
 */
function escapeSQL(input) {
    if (typeof input !== 'string') return input;
    
    return input
        .replace(/'/g, "''")
        .replace(/;/g, '')
        .replace(/--/g, '')
        .replace(/\/\*/g, '')
        .replace(/\*\//g, '');
}

/**
 * Generate CSRF token
 */
function generateCSRFToken() {
    return crypto.randomBytes(32).toString('hex');
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate password strength
 */
function validatePasswordStrength(password) {
    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    
    return {
        valid: score >= 4,
        score,
        checks,
        suggestions: [
            !checks.length && 'Add at least 8 characters',
            !checks.uppercase && 'Add uppercase letters',
            !checks.lowercase && 'Add lowercase letters',
            !checks.number && 'Add numbers',
            !checks.special && 'Add special characters'
        ].filter(Boolean)
    };
}

/**
 * Security middleware factory
 */
function createSecurityMiddleware(app) {
    // Helmet
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"]
            }
        },
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        }
    }));
    
    // Rate limiting
    const limiter = rateLimit({
        windowMs: SECURITY_CONFIG.rateLimit.windowMs,
        max: SECURITY_CONFIG.rateLimit.max,
        message: SECURITY_CONFIG.rateLimit.message,
        standardHeaders: true,
        legacyHeaders: false
    });
    app.use('/api/', limiter);
    
    // Request size limit
    app.use(express.json({ limit: '10kb' }));
    app.use(express.urlencoded({ extended: true, limit: '10kb' }));
}

/**
 * Audit logging
 */
function createAuditLogger() {
    const fs = require('fs');
    const path = require('path');
    
    const logFile = path.join(process.env.LOG_DIR || './logs', 'audit.log');
    
    return function log(event) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            ...event
        };
        
        fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    };
}

module.exports = {
    SECURITY_CONFIG,
    hashPassword,
    verifyPassword,
    generateSecureToken,
    generateJWT,
    verifyJWT,
    encryptData,
    decryptData,
    sanitizeInput,
    escapeSQL,
    generateCSRFToken,
    isValidEmail,
    validatePasswordStrength,
    createSecurityMiddleware,
    createAuditLogger
};
