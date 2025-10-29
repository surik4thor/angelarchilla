import React, { useMemo } from 'react';
import '../styles/DreamAnalytics.css';

const DreamAnalytics = ({ dreams = [] }) => {
  // Calcular estadísticas de los sueños
  const analytics = useMemo(() => {
    if (!dreams || dreams.length === 0) {
      return {
        totalDreams: 0,
        dreamsThisMonth: 0,
        dreamsLastMonth: 0,
        mostCommonFeelings: [],
        dreamsByMonth: [],
        feelingTrends: {},
        averageDreamsPerWeek: 0
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Contar sueños por mes
    const dreamsThisMonth = dreams.filter(dream => {
      const dreamDate = new Date(dream.date || dream.createdAt);
      return dreamDate.getMonth() === currentMonth && dreamDate.getFullYear() === currentYear;
    }).length;

    const dreamsLastMonth = dreams.filter(dream => {
      const dreamDate = new Date(dream.date || dream.createdAt);
      return dreamDate.getMonth() === lastMonth && dreamDate.getFullYear() === lastMonthYear;
    }).length;

    // Analizar sentimientos más comunes
    const feelingCounts = {};
    dreams.forEach(dream => {
      if (dream.feelings && Array.isArray(dream.feelings)) {
        dream.feelings.forEach(feeling => {
          feelingCounts[feeling] = (feelingCounts[feeling] || 0) + 1;
        });
      }
    });

    const mostCommonFeelings = Object.entries(feelingCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([feeling, count]) => ({ feeling, count }));

    // Sueños por mes (últimos 6 meses)
    const dreamsByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(currentYear, currentMonth - i, 1);
      const monthDreams = dreams.filter(dream => {
        const dreamDate = new Date(dream.date || dream.createdAt);
        return dreamDate.getMonth() === targetDate.getMonth() && 
               dreamDate.getFullYear() === targetDate.getFullYear();
      }).length;

      dreamsByMonth.push({
        month: targetDate.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
        count: monthDreams
      });
    }

    // Tendencias de sentimientos (últimos 3 meses)
    const feelingTrends = {};
    const last3Months = ['actual', 'anterior', 'antes'];
    
    last3Months.forEach((period, index) => {
      const targetMonth = currentMonth - index;
      const targetYear = targetMonth < 0 ? currentYear - 1 : currentYear;
      const normalizedMonth = targetMonth < 0 ? targetMonth + 12 : targetMonth;
      
      const monthDreams = dreams.filter(dream => {
        const dreamDate = new Date(dream.date || dream.createdAt);
        return dreamDate.getMonth() === normalizedMonth && 
               dreamDate.getFullYear() === targetYear;
      });

      const monthFeelings = {};
      monthDreams.forEach(dream => {
        if (dream.feelings && Array.isArray(dream.feelings)) {
          dream.feelings.forEach(feeling => {
            monthFeelings[feeling] = (monthFeelings[feeling] || 0) + 1;
          });
        }
      });

      feelingTrends[period] = monthFeelings;
    });

    // Promedio de sueños por semana (últimos 2 meses)
    const twoMonthsAgo = new Date(currentYear, currentMonth - 2, 1);
    const recentDreams = dreams.filter(dream => {
      const dreamDate = new Date(dream.date || dream.createdAt);
      return dreamDate >= twoMonthsAgo;
    });
    
    const weeksPassed = Math.ceil((now - twoMonthsAgo) / (1000 * 60 * 60 * 24 * 7));
    const averageDreamsPerWeek = weeksPassed > 0 ? (recentDreams.length / weeksPassed).toFixed(1) : 0;

    return {
      totalDreams: dreams.length,
      dreamsThisMonth,
      dreamsLastMonth,
      mostCommonFeelings,
      dreamsByMonth,
      feelingTrends,
      averageDreamsPerWeek: parseFloat(averageDreamsPerWeek)
    };
  }, [dreams]);

  const getFeelingEmoji = (feeling) => {
    const emojiMap = {
      'calma': '🕯️',
      'tristeza': '😢',
      'alegria': '😊',
      'miedo': '😰',
      'preocupacion': '😟',
      'otros': '💭',
      'ansiedad': '😰',
      'amor': '❤️',
      'confusion': '😕',
      'esperanza': '🌟'
    };
    return emojiMap[feeling.toLowerCase()] || '💫';
  };

  const getMonthTrend = () => {
    const { dreamsThisMonth, dreamsLastMonth } = analytics;
    if (dreamsLastMonth === 0) return { trend: 'neutral', percentage: 0 };
    
    const change = ((dreamsThisMonth - dreamsLastMonth) / dreamsLastMonth) * 100;
    if (change > 10) return { trend: 'up', percentage: Math.round(change) };
    if (change < -10) return { trend: 'down', percentage: Math.round(Math.abs(change)) };
    return { trend: 'neutral', percentage: Math.round(Math.abs(change)) };
  };

  const monthTrend = getMonthTrend();

  if (analytics.totalDreams === 0) {
    return (
      <div className="dream-analytics">
        <div className="analytics-header">
          <h3>📊 Análisis de Patrones de Sueños</h3>
        </div>
        <div className="no-dreams-message">
          <div className="empty-state">
            <span className="empty-icon">🌙</span>
            <h4>Aún no tienes sueños registrados</h4>
            <p>Comienza a registrar tus sueños para descubrir patrones fascinantes sobre tu mundo onírico.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dream-analytics">
      <div className="analytics-header">
        <h3>📊 Análisis de Patrones de Sueños</h3>
        <span className="total-dreams">{analytics.totalDreams} sueños registrados</span>
      </div>

      {/* Métricas principales */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">🌙</div>
          <div className="metric-content">
            <div className="metric-value">{analytics.dreamsThisMonth}</div>
            <div className="metric-label">Este mes</div>
            {monthTrend.trend !== 'neutral' && (
              <div className={`metric-trend ${monthTrend.trend}`}>
                {monthTrend.trend === 'up' ? '↗️' : '↘️'} {monthTrend.percentage}%
              </div>
            )}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📈</div>
          <div className="metric-content">
            <div className="metric-value">{analytics.averageDreamsPerWeek}</div>
            <div className="metric-label">Promedio semanal</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">💭</div>
          <div className="metric-content">
            <div className="metric-value">{analytics.mostCommonFeelings[0]?.count || 0}</div>
            <div className="metric-label">Sentimiento principal</div>
            {analytics.mostCommonFeelings[0] && (
              <div className="metric-detail">
                {getFeelingEmoji(analytics.mostCommonFeelings[0].feeling)} {analytics.mostCommonFeelings[0].feeling}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gráfico de sueños por mes */}
      <div className="chart-section">
        <h4>📅 Actividad Onírica (Últimos 6 meses)</h4>
        <div className="bar-chart">
          {analytics.dreamsByMonth.map((monthData, index) => {
            const maxCount = Math.max(...analytics.dreamsByMonth.map(d => d.count));
            const height = maxCount > 0 ? (monthData.count / maxCount) * 100 : 0;
            
            return (
              <div key={index} className="bar-container">
                <div className="bar-value">{monthData.count}</div>
                <div 
                  className="bar" 
                  style={{ height: `${Math.max(height, 5)}%` }}
                  title={`${monthData.month}: ${monthData.count} sueños`}
                ></div>
                <div className="bar-label">{monthData.month}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sentimientos más frecuentes */}
      <div className="feelings-section">
        <h4>💫 Sentimientos Más Frecuentes</h4>
        <div className="feelings-list">
          {analytics.mostCommonFeelings.map((feelingData, index) => {
            const percentage = ((feelingData.count / analytics.totalDreams) * 100).toFixed(1);
            
            return (
              <div key={index} className="feeling-item">
                <div className="feeling-info">
                  <span className="feeling-emoji">{getFeelingEmoji(feelingData.feeling)}</span>
                  <span className="feeling-name">{feelingData.feeling}</span>
                </div>
                <div className="feeling-stats">
                  <div className="feeling-bar">
                    <div 
                      className="feeling-fill" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="feeling-percentage">{percentage}%</span>
                  <span className="feeling-count">({feelingData.count})</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights automáticos */}
      <div className="insights-section">
        <h4>🔍 Insights de tus Sueños</h4>
        <div className="insights-list">
          {analytics.averageDreamsPerWeek > 2 && (
            <div className="insight active-dreamer">
              <span className="insight-icon">⭐</span>
              <span>Eres un soñador muy activo, recordando {analytics.averageDreamsPerWeek} sueños por semana en promedio.</span>
            </div>
          )}
          
          {analytics.mostCommonFeelings[0] && analytics.mostCommonFeelings[0].count > analytics.totalDreams * 0.4 && (
            <div className="insight dominant-feeling">
              <span className="insight-icon">🎭</span>
              <span>El sentimiento "{analytics.mostCommonFeelings[0].feeling}" domina tus sueños ({((analytics.mostCommonFeelings[0].count / analytics.totalDreams) * 100).toFixed(0)}%).</span>
            </div>
          )}
          
          {monthTrend.trend === 'up' && monthTrend.percentage > 20 && (
            <div className="insight trend-up">
              <span className="insight-icon">📈</span>
              <span>Tu actividad onírica ha aumentado significativamente este mes (+{monthTrend.percentage}%).</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DreamAnalytics;