/**
 * Configuration par défaut du dashboard backend
 */
module.exports = {
  server: {
    port: process.env.PORT || 5000,
    host: process.env.HOST || 'localhost',
    bodyLimit: process.env.BODY_PARSER_LIMIT || '1mb',
    timeout: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10)
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  
  auth: {
    secret: process.env.JWT_SECRET || 'dev_secret_key',
    expiration: process.env.JWT_EXPIRATION || '1d',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10)
  },
  
  services: {
    central: {
      url: process.env.CENTRAL_API_URL || 'http://localhost:8000/api',
      apiKey: process.env.CENTRAL_API_KEY || '',
      timeout: 10000
    },
    iot: {
      url: process.env.IOT_SERVICE_URL || 'http://localhost:8001/api',
      timeout: 5000
    },
    ml: {
      url: process.env.ML_SERVICE_URL || 'http://localhost:8002/api',
      timeout: 15000
    },
    marketing: {
      url: process.env.MARKETING_SERVICE_URL || 'http://localhost:8003/api',
      timeout: 10000
    },
    accounting: {
      url: process.env.ACCOUNTING_SERVICE_URL || 'http://localhost:8004/api',
      timeout: 10000
    }
  },
  
  mqtt: {
    enabled: true,
    url: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
    clientId: process.env.MQTT_CLIENT_ID || 'dashboard_backend',
    username: process.env.MQTT_USERNAME || '',
    password: process.env.MQTT_PASSWORD || '',
    topics: {
      stockWeight: 'levieuxmoulin/iot/+/weight',
      temperature: 'levieuxmoulin/iot/+/temperature',
      fryer: 'levieuxmoulin/iot/+/fryer'
    }
  },
  
  mongodb: {
    enabled: true,
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/dashboard',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  
  redis: {
    enabled: process.env.REDIS_URL ? true : false,
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD || '',
    ttl: {
      short: parseInt(process.env.CACHE_DURATION_SHORT || '60', 10),
      medium: parseInt(process.env.CACHE_DURATION_MEDIUM || '3600', 10),
      long: parseInt(process.env.CACHE_DURATION_LONG || '86400', 10)
    }
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
    maxSize: process.env.LOG_MAX_SIZE || '10m',
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '7', 10)
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '15', 10) * 60 * 1000, // 15 minutes par défaut
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // Limite chaque adresse IP à 100 requêtes par fenêtre
    standardHeaders: true,
    legacyHeaders: false
  },
  
  compression: {
    level: parseInt(process.env.COMPRESSION_LEVEL || '6', 10)
  },
  
  // Endpoints des services internes
  endpoints: {
    stocks: {
      getAll: '/api/v1/stocks',
      getById: '/api/v1/stocks/:id',
      getCategories: '/api/v1/stocks/categories',
      getAlerts: '/api/v1/stocks/alerts'
    },
    sales: {
      getAll: '/api/v1/sales',
      getSummary: '/api/v1/sales/summary',
      getByProduct: '/api/v1/sales/products',
      getHourly: '/api/v1/sales/hourly',
      getTrends: '/api/v1/sales/trends'
    },
    marketing: {
      getCampaigns: '/api/v1/marketing/campaigns',
      getCampaignById: '/api/v1/marketing/campaigns/:id',
      getSocial: '/api/v1/marketing/social',
      getPromotions: '/api/v1/marketing/promotions'
    },
    finance: {
      getSummary: '/api/v1/finance/summary',
      getReports: '/api/v1/finance/reports',
      getExpenses: '/api/v1/finance/expenses',
      getRevenue: '/api/v1/finance/revenue',
      getPredictions: '/api/v1/finance/predictions'
    },
    staff: {
      getSchedule: '/api/v1/staff/schedule',
      getPerformance: '/api/v1/staff/performance',
      getHours: '/api/v1/staff/hours',
      getCosts: '/api/v1/staff/costs'
    },
    dashboard: {
      getOverview: '/api/v1/dashboard/overview',
      getKpi: '/api/v1/dashboard/kpi',
      getAlerts: '/api/v1/dashboard/alerts',
      getConfig: '/api/v1/dashboard/config'
    }
  }
};
