import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Typography, 
  Grid,
  LinearProgress,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import { 
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { fetchStocks } from '../../store/slices/stocksSlice';

// Composant qui affiche un indicateur de niveau de stock
const StockLevelIndicator = ({ value, max, warningThreshold, criticalThreshold, name, unit }) => {
  let color = 'success';
  let icon = <CheckCircleIcon fontSize="small" />;
  
  const percentage = (value / max) * 100;
  
  if (percentage <= criticalThreshold) {
    color = 'error';
    icon = <ErrorIcon fontSize="small" />;
  } else if (percentage <= warningThreshold) {
    color = 'warning';
    icon = <WarningIcon fontSize="small" />;
  }
  
  return (
    <Box sx={{ mb: 2, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" color="text.secondary">
          {name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {icon}
          <Typography variant="body2" sx={{ ml: 0.5 }}>
            {value} {unit}
          </Typography>
        </Box>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={percentage} 
        color={color}
        sx={{ height: 8, borderRadius: 4 }}
      />
    </Box>
  );
};

const StockOverview = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { stocks, loading, error } = useSelector((state) => state.stocks);
  const [anchorEl, setAnchorEl] = useState(null);
  const [timeRange, setTimeRange] = useState('day'); // 'day', 'week', 'month'

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    handleMenuClose();
  };

  const handleRefresh = () => {
    dispatch(fetchStocks());
  };

  useEffect(() => {
    dispatch(fetchStocks());
    
    // Mise à jour périodique des stocks
    const interval = setInterval(() => {
      dispatch(fetchStocks());
    }, 60000); // 1 minute
    
    return () => clearInterval(interval);
  }, [dispatch]);

  // Simuler des données pour l'exemple
  const mockStocks = [
    { id: 1, name: 'Farine', currentLevel: 35, maxLevel: 50, unit: 'kg', warningThreshold: 30, criticalThreshold: 15 },
    { id: 2, name: 'Tomates', currentLevel: 8, maxLevel: 20, unit: 'kg', warningThreshold: 30, criticalThreshold: 15 },
    { id: 3, name: 'Mozzarella', currentLevel: 5, maxLevel: 15, unit: 'kg', warningThreshold: 30, criticalThreshold: 15 },
    { id: 4, name: 'Basilic', currentLevel: 0.3, maxLevel: 1, unit: 'kg', warningThreshold: 30, criticalThreshold: 15 },
    { id: 5, name: 'Huile d\'olive', currentLevel: 4, maxLevel: 10, unit: 'L', warningThreshold: 30, criticalThreshold: 15 }
  ];

  // Données de consommation (simulées)
  const consumptionData = [
    { name: 'Lun', farine: 4, tomates: 3, mozzarella: 2 },
    { name: 'Mar', farine: 3, tomates: 4, mozzarella: 3 },
    { name: 'Mer', farine: 5, tomates: 2, mozzarella: 2 },
    { name: 'Jeu', farine: 4, tomates: 3, mozzarella: 4 },
    { name: 'Ven', farine: 7, tomates: 5, mozzarella: 5 },
    { name: 'Sam', farine: 9, tomates: 7, mozzarella: 6 },
    { name: 'Dim', farine: 6, tomates: 4, mozzarella: 3 }
  ];

  // Calcul du statut global des stocks
  const criticalCount = mockStocks.filter(stock => 
    (stock.currentLevel / stock.maxLevel) * 100 <= stock.criticalThreshold
  ).length;
  
  const warningCount = mockStocks.filter(stock => 
    (stock.currentLevel / stock.maxLevel) * 100 <= stock.warningThreshold && 
    (stock.currentLevel / stock.maxLevel) * 100 > stock.criticalThreshold
  ).length;

  let statusColor = 'success';
  let statusText = t('stocks.status.good');
  
  if (criticalCount > 0) {
    statusColor = 'error';
    statusText = t('stocks.status.critical');
  } else if (warningCount > 0) {
    statusColor = 'warning';
    statusText = t('stocks.status.warning');
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title={t('stocks.overview.title')}
        action={
          <>
            <Chip 
              label={statusText}
              color={statusColor}
              size="small"
              sx={{ mr: 1 }}
            />
            <Tooltip title={t('common.refresh')}>
              <IconButton onClick={handleRefresh} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <IconButton 
              aria-label={t('common.more')}
              aria-controls="stock-menu"
              aria-haspopup="true"
              onClick={handleMenuClick}
              size="small"
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="stock-menu"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => handleTimeRangeChange('day')}>{t('timeRange.day')}</MenuItem>
              <MenuItem onClick={() => handleTimeRangeChange('week')}>{t('timeRange.week')}</MenuItem>
              <MenuItem onClick={() => handleTimeRangeChange('month')}>{t('timeRange.month')}</MenuItem>
              <MenuItem onClick={handleMenuClose}>{t('stocks.seeAll')}</MenuItem>
            </Menu>
          </>
        }
      />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              {t('stocks.currentLevels')}
            </Typography>
            {mockStocks.map((stock) => (
              <StockLevelIndicator
                key={stock.id}
                name={stock.name}
                value={stock.currentLevel}
                max={stock.maxLevel}
                unit={stock.unit}
                warningThreshold={stock.warningThreshold}
                criticalThreshold={stock.criticalThreshold}
              />
            ))}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              {t('stocks.consumption')}
            </Typography>
            <Box sx={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={consumptionData}
                  margin={{
                    top: 5,
                    right: 10,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="farine" fill="#8884d8" name={t('ingredients.flour')} />
                  <Bar dataKey="tomates" fill="#82ca9d" name={t('ingredients.tomatoes')} />
                  <Bar dataKey="mozzarella" fill="#ffc658" name={t('ingredients.mozzarella')} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default StockOverview;
