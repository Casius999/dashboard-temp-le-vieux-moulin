# Frontend Dashboard - Le Vieux Moulin

Ce répertoire contient l'application React frontend pour le dashboard de pilotage du restaurant "Le Vieux Moulin".

## Technologie

- **React 18** : Bibliothèque JavaScript pour l'interface utilisateur
- **Redux Toolkit** : Gestion d'état avancée
- **Material-UI v5** : Framework de composants UI
- **Recharts** : Bibliothèque de visualisation de données
- **Axios** : Client HTTP pour les requêtes API
- **Socket.io Client** : Communication WebSocket

## Structure du projet

```
├── public/            # Fichiers statiques publics
│   ├── index.html     # Page HTML principale
│   ├── favicon.ico    # Favicon
│   └── assets/        # Images et ressources statiques
│
├── src/               # Code source
│   ├── components/    # Composants réutilisables
│   │   ├── common/    # Composants génériques (boutons, cartes, etc.)
│   │   ├── layout/    # Composants de mise en page (header, sidebar, etc.)
│   │   ├── charts/    # Composants de visualisation
│   │   ├── tables/    # Composants de tableaux
│   │   ├── forms/     # Composants de formulaires
│   │   └── widgets/   # Widgets spécifiques au dashboard
│   │
│   ├── views/         # Pages principales
│   │   ├── Overview/  # Page d'accueil et vue d'ensemble
│   │   ├── Stocks/    # Gestion des stocks
│   │   ├── Sales/     # Analyse des ventes
│   │   ├── Marketing/ # Suivi marketing
│   │   ├── Finance/   # Rapports financiers
│   │   ├── Staff/     # Gestion du personnel
│   │   └── Settings/  # Configuration du dashboard
│   │
│   ├── store/         # Configuration Redux
│   │   ├── slices/    # Slices Redux par domaine fonctionnel
│   │   ├── api/       # Configuration des appels API
│   │   └── index.js   # Configuration du store
│   │
│   ├── services/      # Services API et WebSocket
│   │   ├── api.js     # Client API principal
│   │   ├── socket.js  # Client WebSocket
│   │   └── auth.js    # Service d'authentification
│   │
│   ├── utils/         # Fonctions utilitaires
│   │   ├── formatters.js  # Formatage des données
│   │   ├── validators.js  # Validation des entrées
│   │   └── helpers.js     # Fonctions d'aide diverses
│   │
│   ├── hooks/         # Hooks React personnalisés
│   ├── constants/     # Constantes et énumérations
│   ├── themes/        # Thèmes et styles globaux
│   ├── locales/       # Fichiers de traduction
│   ├── App.js         # Composant racine
│   ├── Routes.js      # Configuration des routes
│   └── index.js       # Point d'entrée
│
├── .env.example       # Exemple de variables d'environnement
├── package.json       # Dépendances et scripts
├── jsconfig.json      # Configuration JavaScript
└── README.md          # Documentation
```

## Installation

```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer le fichier .env.local selon votre environnement
```

## Scripts disponibles

```bash
# Mode développement
npm start

# Compilation pour production
npm run build

# Tests
npm test

# Tests avec coverage
npm run test:coverage

# Analyse du bundle
npm run analyze

# Lint
npm run lint

# Formattage du code
npm run format
```

## Styles et thèmes

Le dashboard utilise Material-UI avec un thème personnalisé. Les éléments de thème sont définis dans `src/themes/`:

- `light.js` - Thème clair
- `dark.js` - Thème sombre
- `typography.js` - Configuration de la typographie
- `colors.js` - Palette de couleurs

Pour modifier le thème, éditez ces fichiers ou créez de nouveaux thèmes.

## Visualisations

Les composants de visualisation de données sont basés sur Recharts et se trouvent dans `src/components/charts/`. Types de graphiques disponibles :

- `AreaChart` - Graphique à aires
- `BarChart` - Diagramme en barres
- `LineChart` - Graphique linéaire
- `PieChart` - Diagramme circulaire
- `RadarChart` - Graphique radar
- `GaugeChart` - Jauge
- `HeatMap` - Carte de chaleur

## Gestion d'état

L'application utilise Redux Toolkit pour la gestion d'état. Les données sont organisées en "slices" par domaine fonctionnel :

- `auth` - Authentification et utilisateur courant
- `stocks` - Données de stocks
- `sales` - Données de ventes
- `marketing` - Données marketing
- `finance` - Données financières
- `staff` - Données du personnel
- `settings` - Configuration du dashboard
- `ui` - État d'interface (thème, langue, etc.)

## Communication en temps réel

La communication en temps réel est gérée via Socket.io. Le service WebSocket se trouve dans `src/services/socket.js` et offre :

- Connexion automatique au serveur
- Reconnexion en cas de perte de connexion
- Abonnement à des événements spécifiques
- Gestion des erreurs et journalisation

## Tests

Les tests sont organisés en parallèle de la structure du code source :

```
├── __tests__/
│   ├── components/    # Tests des composants
│   ├── views/         # Tests des pages
│   ├── store/         # Tests Redux
│   ├── services/      # Tests des services
│   └── utils/         # Tests des utilitaires
```

## Guide de développement

### Ajout d'un nouveau composant

1. Créez le composant dans le dossier approprié
2. Exportez-le depuis le fichier index.js du dossier
3. Créez des tests unitaires
4. Ajoutez la documentation

### Ajout d'une nouvelle page

1. Créez un nouveau dossier dans `src/views/`
2. Ajoutez les composants spécifiques à cette page
3. Créez un fichier index.js exportant le composant principal
4. Ajoutez la route dans `src/Routes.js`

### Connexion à une nouvelle API

1. Ajoutez les endpoints dans `src/services/api.js`
2. Créez un slice Redux dans `src/store/slices/`
3. Implémentez les actions asynchrones avec createAsyncThunk
4. Connectez l'UI aux données via useSelector et useDispatch

## Performance

Conseils pour maintenir de bonnes performances :

- Utilisez React.memo pour les composants purement fonctionnels
- Implémentez la virtualisation pour les longues listes (react-window)
- Optimisez les rendus avec React.useMemo et React.useCallback
- Utilisez la pagination côté serveur pour les grands ensembles de données
- Surveillez la taille du bundle avec npm run analyze

## Résolution des problèmes

### Le développement en mode hot reload ne fonctionne pas
- Vérifiez que le service WebSocket est accessible
- Vérifiez les règles de CORS côté serveur
- Redémarrez le serveur de développement

### Les données ne se chargent pas
- Vérifiez la configuration API dans .env.local
- Consultez la console pour les erreurs
- Vérifiez que le backend est actif et accessible

### Les graphiques ne s'affichent pas correctement
- Vérifiez le format des données fournies
- Assurez-vous que les dimensions du conteneur sont définies
- Consultez la documentation Recharts pour les exigences spécifiques
