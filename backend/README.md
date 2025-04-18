# Backend Dashboard - Le Vieux Moulin

Ce répertoire contient le serveur backend Node.js pour le dashboard de pilotage du restaurant "Le Vieux Moulin". Il sert de couche d'abstraction entre le frontend et les différents modules du système.

## Technologie

- **Node.js 18+** : Environnement d'exécution JavaScript
- **Express.js** : Framework web
- **Socket.io** : Communication en temps réel
- **Axios** : Client HTTP pour les requêtes aux services internes
- **Winston** : Journalisation
- **JWT** : Authentification basée sur tokens
- **Joi** : Validation des données
- **MongoDB** (optionnel) : Pour le stockage local et la mise en cache

## Structure du projet

```
├── controllers/       # Contrôleurs API
│   ├── auth.js        # Authentification
│   ├── stocks.js      # Gestion des stocks
│   ├── sales.js       # Analyse des ventes
│   ├── marketing.js   # Suivi marketing
│   ├── finance.js     # Rapports financiers
│   ├── staff.js       # Gestion du personnel
│   └── dashboard.js   # Configuration du dashboard
│
├── middleware/        # Middleware Express
│   ├── auth.js        # Vérification d'authentification
│   ├── validate.js    # Validation des requêtes
│   ├── rateLimit.js   # Limitation de débit
│   ├── errorHandler.js # Gestion globale des erreurs
│   └── logger.js      # Journalisation des requêtes
│
├── routes/            # Définition des routes API
│   ├── auth.js        # Routes d'authentification
│   ├── stocks.js      # Routes des stocks
│   ├── sales.js       # Routes des ventes
│   ├── marketing.js   # Routes marketing
│   ├── finance.js     # Routes financières
│   ├── staff.js       # Routes du personnel
│   ├── dashboard.js   # Routes de configuration
│   └── index.js       # Regroupement des routes
│
├── services/          # Services métier
│   ├── iotService.js  # Communication avec le module IoT
│   ├── mlService.js   # Communication avec le module IA/ML
│   ├── apiService.js  # Communication avec le module d'intégration API
│   ├── marketingService.js # Communication avec le module marketing
│   ├── accountingService.js # Communication avec le module comptabilité
│   └── cacheService.js # Gestion du cache
│
├── socketHandlers/    # Gestionnaires WebSocket
│   ├── index.js       # Configuration principale
│   ├── stockHandlers.js # Événements liés aux stocks
│   ├── salesHandlers.js # Événements liés aux ventes
│   └── systemHandlers.js # Événements système
│
├── models/            # Modèles de données (si MongoDB)
│   ├── user.js        # Modèle utilisateur
│   ├── dashboardConfig.js # Configuration du dashboard
│   └── log.js         # Modèle de log
│
├── utils/             # Fonctions utilitaires
│   ├── logger.js      # Configuration de la journalisation
│   ├── auth.js        # Utilitaires d'authentification
│   ├── validation.js  # Schémas de validation
│   ├── formatter.js   # Formatage des données
│   └── helpers.js     # Fonctions d'aide diverses
│
├── config/            # Configuration
│   ├── default.js     # Configuration par défaut
│   ├── development.js # Configuration de développement
│   └── production.js  # Configuration de production
│
├── public/            # Fichiers statiques (build frontend)
│
├── app.js             # Application Express
├── server.js          # Point d'entrée du serveur
├── .env.example       # Exemple de variables d'environnement
├── package.json       # Dépendances et scripts
└── README.md          # Documentation
```

## Installation

```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer le fichier .env selon votre environnement
```

## Scripts disponibles

```bash
# Mode développement avec rechargement automatique
npm run dev

# Mode production
npm start

# Tests
npm test

# Tests avec coverage
npm run test:coverage

# Lint
npm run lint

# Formattage du code
npm run format
```

## Configuration

Le système utilise une configuration hiérarchique :

1. `config/default.js` - Valeurs par défaut
2. `config/[NODE_ENV].js` - Surcharge en fonction de l'environnement
3. Variables d'environnement - Surcharge finale

Principales options de configuration :

- **server** : Port, host, timeout
- **cors** : Configuration CORS
- **auth** : Paramètres d'authentification (secret JWT, expiration)
- **services** : URLs et paramètres des services internes
- **database** : Configuration MongoDB (si utilisé)
- **redis** : Configuration Redis (si utilisé)
- **logging** : Niveau et destination des logs

## API REST

L'API REST suit les principes RESTful avec les conventions suivantes :

- Base de l'URL : `/api/v1`
- Format de réponse standardisé :
  ```json
  {
    "success": true,
    "data": { ... },
    "error": null
  }
  ```
- Codes HTTP appropriés (200, 201, 400, 401, 403, 404, 500)
- Prise en charge de la pagination et du filtrage
- Documentation Swagger disponible sur `/api-docs`

### Points d'entrée principaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/v1/auth/login` | Authentification |
| GET | `/api/v1/stocks` | Liste des stocks |
| GET | `/api/v1/sales` | Données de vente |
| GET | `/api/v1/marketing/campaigns` | Campagnes marketing |
| GET | `/api/v1/finance/summary` | Résumé financier |
| GET | `/api/v1/staff/schedule` | Planning du personnel |
| GET | `/api/v1/dashboard/overview` | Vue d'ensemble |

## WebSockets

Le système utilise Socket.io pour la communication en temps réel :

- **Namespace** : `/dashboard`
- **Authentification** : Basée sur JWT (via query parameter ou handshake)
- **Rooms** : Séparation par fonction et par utilisateur

### Événements principaux

| Événement | Direction | Description |
|-----------|-----------|-------------|
| `stock:update` | Serveur → Client | Mise à jour du niveau de stock |
| `stock:alert` | Serveur → Client | Alerte de stock |
| `sale:new` | Serveur → Client | Nouvelle vente |
| `sale:kpi_update` | Serveur → Client | Mise à jour des KPI de vente |
| `equipment:status` | Serveur → Client | État des équipements |
| `system:notification` | Serveur → Client | Notifications système |

## Communication avec les modules externes

Le backend communique avec les autres modules du système "Le Vieux Moulin" :

### Module IoT

- **Protocol** : MQTT via MQTT.js
- **Topics principaux** :
  - `levieuxmoulin/iot/+/weight` - Données de poids
  - `levieuxmoulin/iot/+/temperature` - Données de température
  - `levieuxmoulin/iot/+/fryer` - Données des friteuses

### Module IA/ML

- **Protocol** : API REST via Axios
- **Endpoints principaux** :
  - `GET /api/predictions/stock` - Prévisions de stock
  - `GET /api/predictions/sales` - Prévisions de ventes
  - `GET /api/recommendations/recipes` - Recommandations de recettes

### Module Intégration API

- **Protocol** : API REST via Axios
- **Services intégrés** :
  - Caisse enregistreuse (POS)
  - Fournisseurs
  - Réservation
  - CRM

### Module Marketing

- **Protocol** : API REST via Axios
- **Endpoints principaux** :
  - `GET /api/marketing/campaigns` - Campagnes marketing
  - `GET /api/marketing/social` - Données des réseaux sociaux
  - `GET /api/marketing/promotions` - Promotions

### Module Comptabilité

- **Protocol** : API REST via Axios
- **Endpoints principaux** :
  - `GET /api/accounting/summary` - Résumé comptable
  - `GET /api/accounting/reports` - Rapports détaillés
  - `GET /api/accounting/costs` - Analyse des coûts

## Mise en cache

Le système utilise plusieurs stratégies de mise en cache :

1. **Cache en mémoire** : Pour les données fréquemment accédées
2. **Redis** (si configuré) : Pour le cache distribué
3. **MongoDB** (si configuré) : Pour les données persistantes

Stratégies de mise en cache par type de données :

- **Données statiques** : Cache longue durée (24h)
- **Données semi-dynamiques** : Cache moyenne durée (1h)
- **Données en temps réel** : Pas de cache ou très court (30s)

## Journalisation

La journalisation est configurée avec Winston :

- **Niveaux** : error, warn, info, debug
- **Formats** : JSON (production), colorisé (développement)
- **Destinations** :
  - Console
  - Fichier (avec rotation)
  - MongoDB (optionnel)
  - Service externe (optionnel, ex: ELK)

## Sécurité

Le backend implémente plusieurs mesures de sécurité :

1. **Authentification JWT** : Tokens signés avec expiration
2. **Middleware de validation** : Validation stricte des entrées
3. **Middleware d'autorisation** : Contrôle d'accès basé sur les rôles
4. **Protection contre les injections** : Validation et échappement
5. **En-têtes de sécurité** : Via Helmet.js
6. **Rate limiting** : Protection contre les attaques par force brute
7. **CORS** : Configuration stricte pour les origines autorisées

## Performances

Pour garantir de bonnes performances, le backend :

1. **Utilise des opérations asynchrones** : Non-bloquantes via async/await
2. **Implémente la mise en cache** : Réduction des appels API redondants
3. **Compresse les réponses** : Via compression middleware
4. **Limite la taille des payloads** : Validation des entrées
5. **Utilise des connexions persistantes** : Pools de connexions

## Déploiement

### Docker

```bash
# Construire l'image
docker build -t levieuxmoulin/dashboard-backend .

# Lancer le conteneur
docker run -d -p 5000:5000 --name dashboard-backend \
  -e NODE_ENV=production \
  -e PORT=5000 \
  -e JWT_SECRET=your_jwt_secret \
  -v /path/to/logs:/app/logs \
  levieuxmoulin/dashboard-backend
```

### PM2

```bash
# Installer PM2 globalement
npm install -g pm2

# Démarrer l'application
pm2 start server.js --name dashboard-backend

# Configurer le démarrage automatique
pm2 startup
pm2 save
```

## Tests

Le système utilise Jest pour les tests automatisés :

```bash
# Exécuter tous les tests
npm test

# Exécuter un test spécifique
npm test -- -t "authentication"

# Mode watch (pour le développement)
npm test -- --watch
```

Types de tests :

- **Tests unitaires** : Fonctions et classes isolées
- **Tests d'intégration** : API et interactions entre composants
- **Tests de charge** : Performance sous charge (avec Artillery)

## Résolution des problèmes

### Échec de connexion aux services externes

1. Vérifiez la configuration des URLs dans le fichier .env
2. Vérifiez que les services sont actifs
3. Vérifiez les logs pour les erreurs détaillées
4. Tester manuellement les requêtes avec un client comme Postman

### Erreurs WebSocket

1. Vérifiez que le client se connecte au bon endpoint
2. Assurez-vous que l'authentification est configurée correctement
3. Vérifiez les règles CORS si nécessaire
4. Consultez les logs côté serveur pour les erreurs de connexion

### Problèmes de performance

1. Activez les logs de debug pour identifier les goulots d'étranglement
2. Vérifiez la configuration de mise en cache
3. Analysez les temps de réponse des services externes
4. Surveillez l'utilisation mémoire et CPU

## Guide de développement

### Ajout d'un nouveau contrôleur

1. Créez un nouveau fichier dans `controllers/`
2. Suivez le modèle des contrôleurs existants
3. Créez les schémas de validation dans `utils/validation.js`
4. Ajoutez les routes dans `routes/`
5. Créez des tests pour le nouveau contrôleur

### Intégration d'un nouveau service externe

1. Créez un nouveau service dans `services/`
2. Configurez les paramètres de connexion dans `config/`
3. Implémentez les méthodes d'accès aux données
4. Ajoutez une couche d'abstraction pour faciliter les tests
5. Créez des tests mock pour le nouveau service
