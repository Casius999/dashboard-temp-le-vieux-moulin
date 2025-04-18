/**
 * Application Express pour le dashboard Le Vieux Moulin
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const config = require('config');
const logger = require('./utils/logger');

// Routes
const routes = require('./routes');

// Middleware
const errorHandler = require('./middleware/errorHandler');
const authenticate = require('./middleware/authenticate');

// Initialisation de l'application Express
const app = express();

// Configuration de la limite de débit
const limiter = rateLimit({
  windowMs: config.get('rateLimit.windowMs'),
  max: config.get('rateLimit.max'),
  standardHeaders: config.get('rateLimit.standardHeaders'),
  legacyHeaders: config.get('rateLimit.legacyHeaders')
});

// Configuration CORS
app.use(cors({
  origin: config.get('cors.origin'),
  methods: config.get('cors.methods'),
  allowedHeaders: config.get('cors.allowedHeaders')
}));

// Sécurité avec Helmet
app.use(helmet());

// Compression des réponses
app.use(compression({
  level: config.get('compression.level')
}));

// Limitation du débit pour toutes les requêtes
app.use(limiter);

// Journalisation des requêtes HTTP
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
} else {
  app.use(morgan('dev'));
}

// Parsing du corps des requêtes
app.use(express.json({ limit: config.get('server.bodyLimit') }));
app.use(express.urlencoded({ extended: true, limit: config.get('server.bodyLimit') }));

// Fichiers statiques (frontend build)
app.use(express.static(path.join(__dirname, 'public')));

// Routes d'API
app.use('/api/v1/auth', routes.auth);
app.use('/api/v1/stocks', authenticate, routes.stocks);
app.use('/api/v1/sales', authenticate, routes.sales);
app.use('/api/v1/marketing', authenticate, routes.marketing);
app.use('/api/v1/finance', authenticate, routes.finance);
app.use('/api/v1/staff', authenticate, routes.staff);
app.use('/api/v1/dashboard', authenticate, routes.dashboard);

// Route pour la documentation API
if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', require('./swagger'));
}

// Route par défaut pour le frontend (React SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware de gestion des erreurs
app.use(errorHandler);

module.exports = app;
