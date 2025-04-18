/**
 * Contrôleur pour la gestion des stocks
 */
const logger = require('../utils/logger');
const iotService = require('../services/iotService');
const mlService = require('../services/mlService');
const cacheService = require('../services/cacheService');
const socketManager = require('../socketHandlers');
const { ClientError, ServerError } = require('../utils/errors');

// Cache keys
const CACHE_KEYS = {
  ALL_STOCKS: 'stocks:all',
  STOCK_BY_ID: (id) => `stocks:${id}`,
  CATEGORIES: 'stocks:categories',
  ALERTS: 'stocks:alerts'
};

// Cache TTL (en secondes)
const CACHE_TTL = {
  SHORT: 60,      // 1 minute
  MEDIUM: 300,    // 5 minutes
  LONG: 3600      // 1 heure
};

/**
 * Récupère tous les stocks
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 */
exports.getAllStocks = async (req, res, next) => {
  try {
    // Filtres optionnels
    const { category, minLevel, maxLevel } = req.query;
    
    // Vérifier si les données sont en cache
    const cacheKey = CACHE_KEYS.ALL_STOCKS + (category ? `:${category}` : '');
    const cachedData = await cacheService.get(cacheKey);
    
    if (cachedData && !req.query.refresh) {
      logger.debug('Stocks retrieved from cache');
      return res.json({
        success: true,
        data: cachedData,
        cached: true
      });
    }
    
    // Récupération des données depuis le service IoT
    const stocks = await iotService.getStocks({ category });
    
    // Filtrage des résultats si nécessaire
    let filteredStocks = stocks;
    
    if (minLevel) {
      filteredStocks = filteredStocks.filter(stock => 
        (stock.currentLevel / stock.maxLevel) * 100 >= parseFloat(minLevel)
      );
    }
    
    if (maxLevel) {
      filteredStocks = filteredStocks.filter(stock => 
        (stock.currentLevel / stock.maxLevel) * 100 <= parseFloat(maxLevel)
      );
    }
    
    // Mise en cache des résultats
    await cacheService.set(cacheKey, filteredStocks, CACHE_TTL.SHORT);
    
    res.json({
      success: true,
      data: filteredStocks,
      count: filteredStocks.length
    });
  } catch (error) {
    logger.error('Error retrieving stocks:', { error: error.message });
    next(error);
  }
};

/**
 * Récupère un stock par son ID
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 */
exports.getStockById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Vérifier si les données sont en cache
    const cacheKey = CACHE_KEYS.STOCK_BY_ID(id);
    const cachedData = await cacheService.get(cacheKey);
    
    if (cachedData && !req.query.refresh) {
      logger.debug(`Stock ${id} retrieved from cache`);
      return res.json({
        success: true,
        data: cachedData,
        cached: true
      });
    }
    
    // Récupération des données depuis le service IoT
    const stock = await iotService.getStockById(id);
    
    if (!stock) {
      throw new ClientError('Stock not found', 404);
    }
    
    // Récupération des prédictions depuis le service ML
    const predictions = await mlService.getStockPredictions(id);
    
    // Combinaison des données
    const stockWithPredictions = {
      ...stock,
      predictions: predictions || []
    };
    
    // Mise en cache des résultats
    await cacheService.set(cacheKey, stockWithPredictions, CACHE_TTL.SHORT);
    
    res.json({
      success: true,
      data: stockWithPredictions
    });
  } catch (error) {
    logger.error(`Error retrieving stock ${req.params.id}:`, { error: error.message });
    next(error);
  }
};

/**
 * Récupère les catégories de stock
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 */
exports.getCategories = async (req, res, next) => {
  try {
    // Vérifier si les données sont en cache
    const cachedData = await cacheService.get(CACHE_KEYS.CATEGORIES);
    
    if (cachedData && !req.query.refresh) {
      logger.debug('Stock categories retrieved from cache');
      return res.json({
        success: true,
        data: cachedData,
        cached: true
      });
    }
    
    // Récupération des catégories depuis le service IoT
    const categories = await iotService.getStockCategories();
    
    // Mise en cache des résultats
    await cacheService.set(CACHE_KEYS.CATEGORIES, categories, CACHE_TTL.LONG);
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    logger.error('Error retrieving stock categories:', { error: error.message });
    next(error);
  }
};

/**
 * Récupère les alertes de stock
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 */
exports.getAlerts = async (req, res, next) => {
  try {
    // Les alertes sont toujours récupérées en temps réel
    const alerts = await iotService.getStockAlerts();
    
    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });
  } catch (error) {
    logger.error('Error retrieving stock alerts:', { error: error.message });
    next(error);
  }
};

/**
 * Gère une mise à jour en temps réel d'un niveau de stock
 * @param {Object} data - Données de mise à jour
 */
exports.handleStockUpdate = (data) => {
  try {
    // Invalidation du cache
    cacheService.del(CACHE_KEYS.ALL_STOCKS);
    cacheService.del(CACHE_KEYS.STOCK_BY_ID(data.itemId));
    
    // Notification aux clients connectés via WebSocket
    socketManager.emitToAll('stock:update', data);
    
    // Vérification des seuils d'alerte
    if (data.alertType) {
      socketManager.emitToAll('stock:alert', {
        itemId: data.itemId,
        alertType: data.alertType,
        level: data.currentLevel,
        timestamp: new Date().toISOString()
      });
    }
    
    logger.info(`Stock update processed: ${data.itemId}`, { data });
  } catch (error) {
    logger.error('Error handling stock update:', { error: error.message, data });
  }
};
