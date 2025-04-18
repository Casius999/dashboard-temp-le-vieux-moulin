/**
 * Configuration et gestion des WebSockets
 */
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('config');
const logger = require('../utils/logger');

let io;
const connectedClients = new Map();

/**
 * Initialise Socket.IO avec le serveur HTTP
 * @param {Object} server - Instance du serveur HTTP
 */
exports.init = (server) => {
  io = socketIo(server, {
    cors: {
      origin: config.get('cors.origin'),
      methods: ['GET', 'POST'],
      credentials: true
    },
    path: '/socket.io'
  });

  // Middleware d'authentification
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }
      
      // Vérification du token JWT
      const decoded = jwt.verify(token, config.get('auth.secret'));
      socket.user = decoded;
      next();
    } catch (err) {
      logger.error('Socket authentication failed:', { error: err.message });
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Gestion des connexions
  io.on('connection', (socket) => {
    const userId = socket.user.id;
    connectedClients.set(socket.id, { userId, socket });
    
    logger.info(`Client connected: ${socket.id} (User: ${userId})`);
    
    // Rejoindre la room pour l'utilisateur
    socket.join(`user:${userId}`);
    
    // Rejoindre la room pour les rôles
    if (socket.user.roles) {
      socket.user.roles.forEach(role => {
        socket.join(`role:${role}`);
      });
    }
    
    // Émettre les informations de connexion
    socket.emit('connection:established', {
      id: socket.id,
      timestamp: new Date().toISOString()
    });
    
    // Abonnements aux événements
    setupEventListeners(socket);
    
    // Gestion de la déconnexion
    socket.on('disconnect', () => {
      connectedClients.delete(socket.id);
      logger.info(`Client disconnected: ${socket.id} (User: ${userId})`);
    });
  });
  
  logger.info('Socket.IO initialized');
};

/**
 * Configure les écouteurs d'événements pour un socket
 * @param {Object} socket - Instance de socket
 */
function setupEventListeners(socket) {
  // Abonnement aux mises à jour de stock
  socket.on('stock:subscribe', (data) => {
    const itemId = data?.itemId;
    
    if (itemId) {
      // Abonnement à un stock spécifique
      socket.join(`stock:${itemId}`);
      logger.debug(`Client ${socket.id} subscribed to stock ${itemId}`);
    } else {
      // Abonnement à tous les stocks
      socket.join('stock:all');
      logger.debug(`Client ${socket.id} subscribed to all stock updates`);
    }
  });
  
  // Désabonnement aux mises à jour de stock
  socket.on('stock:unsubscribe', (data) => {
    const itemId = data?.itemId;
    
    if (itemId) {
      socket.leave(`stock:${itemId}`);
      logger.debug(`Client ${socket.id} unsubscribed from stock ${itemId}`);
    } else {
      socket.leave('stock:all');
      logger.debug(`Client ${socket.id} unsubscribed from all stock updates`);
    }
  });
  
  // Abonnement aux ventes
  socket.on('sale:subscribe', () => {
    socket.join('sale:all');
    logger.debug(`Client ${socket.id} subscribed to sales updates`);
  });
  
  // Désabonnement aux ventes
  socket.on('sale:unsubscribe', () => {
    socket.leave('sale:all');
    logger.debug(`Client ${socket.id} unsubscribed from sales updates`);
  });
  
  // Abonnement aux équipements
  socket.on('equipment:subscribe', (data) => {
    const equipmentId = data?.equipmentId;
    
    if (equipmentId) {
      socket.join(`equipment:${equipmentId}`);
      logger.debug(`Client ${socket.id} subscribed to equipment ${equipmentId}`);
    } else {
      socket.join('equipment:all');
      logger.debug(`Client ${socket.id} subscribed to all equipment updates`);
    }
  });
  
  // Désabonnement aux équipements
  socket.on('equipment:unsubscribe', (data) => {
    const equipmentId = data?.equipmentId;
    
    if (equipmentId) {
      socket.leave(`equipment:${equipmentId}`);
      logger.debug(`Client ${socket.id} unsubscribed from equipment ${equipmentId}`);
    } else {
      socket.leave('equipment:all');
      logger.debug(`Client ${socket.id} unsubscribed from all equipment updates`);
    }
  });
  
  // Ping pour maintenir la connexion active
  socket.on('ping', (data, callback) => {
    if (typeof callback === 'function') {
      callback({
        timestamp: new Date().toISOString(),
        received: data
      });
    }
  });
}

/**
 * Émet un événement à tous les clients connectés
 * @param {string} event - Nom de l'événement
 * @param {Object} data - Données à émettre
 */
exports.emitToAll = (event, data) => {
  if (!io) {
    logger.warn('Socket.IO not initialized, cannot emit to all');
    return;
  }
  
  io.emit(event, data);
  logger.debug(`Emitted ${event} to all clients`, { data });
};

/**
 * Émet un événement à un utilisateur spécifique
 * @param {string} userId - ID de l'utilisateur
 * @param {string} event - Nom de l'événement
 * @param {Object} data - Données à émettre
 */
exports.emitToUser = (userId, event, data) => {
  if (!io) {
    logger.warn('Socket.IO not initialized, cannot emit to user');
    return;
  }
  
  io.to(`user:${userId}`).emit(event, data);
  logger.debug(`Emitted ${event} to user ${userId}`, { data });
};

/**
 * Émet un événement à un rôle spécifique
 * @param {string} role - Nom du rôle
 * @param {string} event - Nom de l'événement
 * @param {Object} data - Données à émettre
 */
exports.emitToRole = (role, event, data) => {
  if (!io) {
    logger.warn('Socket.IO not initialized, cannot emit to role');
    return;
  }
  
  io.to(`role:${role}`).emit(event, data);
  logger.debug(`Emitted ${event} to role ${role}`, { data });
};

/**
 * Émet un événement à une room spécifique
 * @param {string} room - Nom de la room
 * @param {string} event - Nom de l'événement
 * @param {Object} data - Données à émettre
 */
exports.emitToRoom = (room, event, data) => {
  if (!io) {
    logger.warn('Socket.IO not initialized, cannot emit to room');
    return;
  }
  
  io.to(room).emit(event, data);
  logger.debug(`Emitted ${event} to room ${room}`, { data });
};

/**
 * Récupère le nombre de clients connectés
 * @returns {number} Nombre de clients connectés
 */
exports.getConnectedClientsCount = () => {
  return connectedClients.size;
};

/**
 * Ferme toutes les connexions Socket.IO
 */
exports.close = () => {
  if (!io) {
    return;
  }
  
  io.close();
  logger.info('Socket.IO connections closed');
};

/**
 * Récupère l'instance Socket.IO
 * @returns {Object} Instance Socket.IO
 */
exports.getIo = () => io;
