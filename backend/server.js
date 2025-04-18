/**
 * Serveur principal du dashboard Le Vieux Moulin
 */
const http = require('http');
const app = require('./app');
const config = require('config');
const logger = require('./utils/logger');
const socketManager = require('./socketHandlers');
const mongoConnector = require('./utils/mongoConnector');
const redisConnector = require('./utils/redisConnector');
const mqttClient = require('./utils/mqttClient');

// Configuration du port
const port = config.get('server.port');
app.set('port', port);

// Création du serveur HTTP
const server = http.createServer(app);

// Configuration de Socket.io
socketManager.init(server);

// Gestion des erreurs serveur
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  switch (error.code) {
    case 'EACCES':
      logger.error(`Port ${port} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(`Port ${port} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

// Gestion du démarrage du serveur
function onListening() {
  const addr = server.address();
  logger.info(`Server running on port ${addr.port}`);
}

// Connexion à MongoDB si activé
if (config.get('mongodb.enabled')) {
  mongoConnector.connect()
    .then(() => {
      logger.info('Connected to MongoDB');
    })
    .catch((err) => {
      logger.error('Failed to connect to MongoDB', { error: err.message });
    });
}

// Connexion à Redis si activé
if (config.get('redis.enabled')) {
  redisConnector.connect()
    .then(() => {
      logger.info('Connected to Redis');
    })
    .catch((err) => {
      logger.error('Failed to connect to Redis', { error: err.message });
    });
}

// Connexion au broker MQTT si activé
if (config.get('mqtt.enabled')) {
  mqttClient.connect()
    .then(() => {
      logger.info('Connected to MQTT broker');
      
      // Abonnement aux topics
      const topics = config.get('mqtt.topics');
      Object.values(topics).forEach(topic => {
        mqttClient.subscribe(topic);
        logger.info(`Subscribed to MQTT topic: ${topic}`);
      });
    })
    .catch((err) => {
      logger.error('Failed to connect to MQTT broker', { error: err.message });
    });
}

// Gestion de l'arrêt propre du serveur
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  // Fermeture de Socket.io
  socketManager.close();
  
  // Fermeture du serveur HTTP
  server.close(() => {
    logger.info('HTTP server closed');
    
    // Fermeture des connexions à MongoDB et Redis
    if (config.get('mongodb.enabled')) {
      mongoConnector.disconnect()
        .then(() => logger.info('MongoDB connection closed'))
        .catch(err => logger.error('Error disconnecting from MongoDB', { error: err.message }));
    }
    
    if (config.get('redis.enabled')) {
      redisConnector.disconnect()
        .then(() => logger.info('Redis connection closed'))
        .catch(err => logger.error('Error disconnecting from Redis', { error: err.message }));
    }
    
    // Fermeture de la connexion MQTT
    if (config.get('mqtt.enabled')) {
      mqttClient.disconnect()
        .then(() => logger.info('MQTT connection closed'))
        .catch(err => logger.error('Error disconnecting from MQTT', { error: err.message }));
    }
    
    process.exit(0);
  });
});

// Gestion des erreurs non rattrapées
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { error: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', { reason: reason });
});

// Démarrage du serveur
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

module.exports = server;
