import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../hooks/useAdmin.jsx';

export default function CashflowManager() {
  const {
    loading,
    error,
    setError,
    getCashflowStats,
    getIncomeData,
    getExpenseData,
    addExpense,
    updateExpense,
    deleteExpense
  } = useAdmin();

  const [activeTab, setActiveTab] = useState('overview');
  const [period, setPeriod] = useState('month');
  const [stats, setStats] = useState({});
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    recurring: false,
    notes: ''
  });

  const expenseCategories = [
    { value: 'hosting', label: 'Hosting & Dominio', icon: '🖥️' },
    { value: 'advertising', label: 'Publicidad', icon: '📢' },
    { value: 'software', label: 'Software & Licencias', icon: '💳' },
    { value: 'content', label: 'Contenido & Marketing', icon: '🎁' },
    { value: 'other', label: 'Otros Gastos', icon: '💶' }
  ];

  useEffect(() => {
    loadCashflowData();
  }, [period]);

  useEffect(() => {
    if (activeTab === 'income' || activeTab === 'expenses') {
      loadDetailedData();
    }
  }, [activeTab, dateRange]);

  const loadCashflowData = async () => {
    try {
      const statsData = await getCashflowStats(period);
      setStats(statsData || {});
    } catch (err) {
      console.error('Error loading cashflow stats:', err);
    }
  };

  const loadDetailedData = async () => {
    try {
      if (activeTab === 'income') {
        const incomeResponse = await getIncomeData(1, 50, dateRange);
        setIncomeData(incomeResponse.income || []);
      } else if (activeTab === 'expenses') {
        const expenseResponse = await getExpenseData(1, 50, dateRange);
        setExpenseData(expenseResponse.expenses || []);
      }
    } catch (err) {
      console.error('Error loading detailed data:', err);
    }
  };

  const handleAddExpense = () => {
    setEditingExpense(null);
    setExpenseForm({
      description: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      recurring: false,
      notes: ''
    });
    setShowExpenseForm(true);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      description: expense.description || '',
      amount: expense.amount || '',
      category: expense.category || '',
      date: expense.date?.split('T')[0] || new Date().toISOString().split('T')[0],
      recurring: expense.recurring || false,
      notes: expense.notes || ''
    });
    setShowExpenseForm(true);
  };

  const handleSaveExpense = async () => {
    try {
      const expenseData = {
        ...expenseForm,
        amount: parseFloat(expenseForm.amount) * 100 // Convert to cents
      };

      if (editingExpense) {
        await updateExpense(editingExpense.id, expenseData);
      } else {
        await addExpense(expenseData);
      }

      setShowExpenseForm(false);
      await loadDetailedData();
      await loadCashflowData();
    } catch (err) {
      console.error('Error saving expense:', err);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
      return;
    }

    try {
      await deleteExpense(expenseId);
      await loadDetailedData();
      await loadCashflowData();
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount / 100); // Amount is in cents
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category) => {
    const categoryConfig = expenseCategories.find(cat => cat.value === category);
    return categoryConfig ? categoryConfig.icon : '💶';
  };

  const getCategoryLabel = (category) => {
    const categoryConfig = expenseCategories.find(cat => cat.value === category);
    return categoryConfig ? categoryConfig.label : category;
  };

  const calculateProfitMargin = () => {
    const revenue = stats.totalRevenue || 0;
    const expenses = stats.totalExpenses || 0;
    if (revenue === 0) return 0;
    return ((revenue - expenses) / revenue * 100).toFixed(1);
  };

  return (
    <div className="cashflow-manager">
      <div className="cashflow-header">
        <h2>Cashflow y Finanzas</h2>
        <div className="cashflow-controls">
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="period-selector"
          >
            <option value="week">Esta Semana</option>
            <option value="month">Este Mes</option>
            <option value="quarter">Este Trimestre</option>
            <option value="year">Este Año</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="admin-alert admin-alert-error">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className="cashflow-tabs">
        <button 
          className={`cashflow-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span role="img" aria-label="Resumen" style={{fontSize:'1.1em',marginRight:'0.3em'}}>📈</span>
          Resumen
        </button>
        <button 
          className={`cashflow-tab ${activeTab === 'income' ? 'active' : ''}`}
          onClick={() => setActiveTab('income')}
        >
          <span role="img" aria-label="Ingresos" style={{fontSize:'1.1em',marginRight:'0.3em'}}>⬆️</span>
          Ingresos
        </button>
        <button 
          className={`cashflow-tab ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          <span role="img" aria-label="Gastos" style={{fontSize:'1.1em',marginRight:'0.3em'}}>⬇️</span>
          Gastos
        </button>
      </div>

      <div className="cashflow-content">
        {activeTab === 'overview' && (
          <div className="cashflow-overview">
            <div className="financial-summary">
              <div className="summary-card revenue">
                <div className="summary-header">
                  <span role="img" aria-label="Ingresos">⬆️</span>
                  <h3>Ingresos Totales</h3>
                </div>
                <div className="summary-amount positive">
                  {formatCurrency(stats.totalRevenue || 0)}
                </div>
                <div className="summary-change">
                  <span role="img" aria-label="Sube" style={{fontSize:'1.2em'}}>⬆️</span>
                  +{stats.revenueGrowth || 0}% vs período anterior
                </div>
              </div>

              <div className="summary-card expenses">
                <div className="summary-header">
                  <span role="img" aria-label="Gastos">⬇️</span>
                  <h3>Gastos Totales</h3>
                </div>
                <div className="summary-amount negative">
                  -{formatCurrency(stats.totalExpenses || 0)}
                </div>
                <div className="summary-change">
                  <span role="img" aria-label="Baja" style={{fontSize:'1.2em'}}>⬇️</span>
                  +{stats.expenseGrowth || 0}% vs período anterior
                </div>
              </div>

              <div className="summary-card profit">
                <div className="summary-header">
                  <span role="img" aria-label="Beneficio">💶</span>
                  <h3>Beneficio Neto</h3>
                </div>
                <div className={`summary-amount ${(stats.totalRevenue || 0) - (stats.totalExpenses || 0) >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency((stats.totalRevenue || 0) - (stats.totalExpenses || 0))}
                </div>
                <div className="summary-change">
                  <span role="img" aria-label="Margen">📈</span>
                  {calculateProfitMargin()}% margen
                </div>
              </div>
            </div>

            <div className="cashflow-charts">
              <div className="chart-section">
                <h3>Flujo de Caja Mensual</h3>
                <div className="chart-container">
                  <div className="chart-placeholder">
                    <div className="chart-bars">
                      {stats.monthlyData?.map((data, index) => (
                        <div key={index} className="month-bar">
                          <div 
                            className="income-bar" 
                            style={{ height: `${(data.income / Math.max(...stats.monthlyData.map(d => d.income))) * 100}%` }}
                          ></div>
                          <div 
                            className="expense-bar" 
                            style={{ height: `${(data.expenses / Math.max(...stats.monthlyData.map(d => d.expenses))) * 100}%` }}
                          ></div>
                          <span className="month-label">{data.month}</span>
                        </div>
                      )) || Array.from({ length: 12 }, (_, i) => (
                        <div key={i} className="month-bar">
                          <div className="income-bar" style={{ height: `${Math.random() * 100}%` }}></div>
                          <div className="expense-bar" style={{ height: `${Math.random() * 80}%` }}></div>
                          <span className="month-label">{new Date(0, i).toLocaleDateString('es-ES', { month: 'short' })}</span>
                        </div>
                      ))}
                    </div>
                    <div className="chart-legend">
                      <div className="legend-item">
                        <div className="legend-color income"></div>
                        <span>Ingresos</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-color expenses"></div>
                        <span>Gastos</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="expenses-breakdown">
                <h3>Distribución de Gastos</h3>
                <div className="expense-categories">
                  {stats.expensesByCategory?.map(category => (
                    <div key={category.name} className="category-item">
                      <div className="category-info">
                        <span role="img" aria-label={getCategoryLabel(category.name)}>{getCategoryIcon(category.name)}</span>
                        <span className="category-name">{getCategoryLabel(category.name)}</span>
                      </div>
                      <div className="category-amount">
                        {formatCurrency(category.amount)}
                      </div>
                      <div className="category-bar">
                        <div 
                          className="category-fill"
                          style={{ width: `${(category.amount / (stats.totalExpenses || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )) || expenseCategories.map(category => (
                    <div key={category.value} className="category-item">
                      <div className="category-info">
                        <span role="img" aria-label={category.label}>{category.icon}</span>
                        <span className="category-name">{category.label}</span>
                      </div>
                      <div className="category-amount">
                        {formatCurrency(Math.random() * 50000)}
                      </div>
                      <div className="category-bar">
                        <div 
                          className="category-fill"
                          style={{ width: `${Math.random() * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'income' && (
          <div className="income-section">
            <div className="income-header">
              <h3>Historial de Ingresos</h3>
              <div className="date-range-picker">
                <span role="img" aria-label="Fecha">📅</span>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                />
                <span>hasta</span>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                />
              </div>
            </div>

            <div className="income-table-container">
              <table className="cashflow-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Descripción</th>
                    <th>Fuente</th>
                    <th>Cantidad</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {incomeData.map(income => (
                    <tr key={income.id}>
                      <td>{formatDate(income.date)}</td>
                      <td>{income.description}</td>
                      <td>
                        <span className="source-badge">
                          <span role="img" aria-label="Fuente">🛒</span>
                          {income.source || 'Stripe'}
                        </span>
                      </td>
                      <td className="amount positive">
                        +{formatCurrency(income.amount)}
                      </td>
                      <td>
                        <span className="status-badge success">
                          Confirmado
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="expenses-section">
            <div className="expenses-header">
              <h3>Gestión de Gastos</h3>
              <div className="expenses-controls">
                <div className="date-range-picker">
                  <span role="img" aria-label="Fecha">📅</span>
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  />
                  <span>hasta</span>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  />
                </div>
                <button onClick={handleAddExpense} className="add-expense-btn">
                  <span role="img" aria-label="Nuevo">➕</span>
                  Nuevo Gasto
                </button>
              </div>
            </div>

            {showExpenseForm && (
              <div className="expense-form-overlay">
                <div className="expense-form">
                  <div className="form-header">
                    <h3>{editingExpense ? 'Editar Gasto' : 'Nuevo Gasto'}</h3>
                    <button onClick={() => setShowExpenseForm(false)} className="close-btn">
                      <span role="img" aria-label="Cancelar">❌</span>
                    </button>
                  </div>

                  <div className="form-content">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Descripción *</label>
                        <input
                          type="text"
                          value={expenseForm.description}
                          onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Descripción del gasto"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Cantidad *</label>
                        <div className="amount-input">
                          <span role="img" aria-label="Euro">💶</span>
                          <input
                            type="number"
                            step="0.01"
                            value={expenseForm.amount}
                            onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                            placeholder="0.00"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Categoría</label>
                        <select
                          value={expenseForm.category}
                          onChange={(e) => setExpenseForm(prev => ({ ...prev, category: e.target.value }))}
                        >
                          <option value="">Seleccionar categoría</option>
                          {expenseCategories.map(category => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Fecha</label>
                        <input
                          type="date"
                          value={expenseForm.date}
                          onChange={(e) => setExpenseForm(prev => ({ ...prev, date: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Notas</label>
                      <textarea
                        value={expenseForm.notes}
                        onChange={(e) => setExpenseForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Notas adicionales..."
                        rows="3"
                      />
                    </div>

                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={expenseForm.recurring}
                          onChange={(e) => setExpenseForm(prev => ({ ...prev, recurring: e.target.checked }))}
                        />
                        <span>Gasto recurrente</span>
                      </label>
                    </div>

                    <div className="form-actions">
                      <button onClick={handleSaveExpense} disabled={loading} className="save-btn">
                        {loading ? (
                          <span role="img" aria-label="Cargando" className="spinner-emoji">⏳</span>
                        ) : (
                          <span role="img" aria-label="Guardar">💾</span>
                        )}
                        Guardar
                      </button>
                      <button onClick={() => setShowExpenseForm(false)} className="cancel-btn">
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="expenses-table-container">
              <table className="cashflow-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Descripción</th>
                    <th>Categoría</th>
                    <th>Cantidad</th>
                    <th>Recurrente</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {expenseData.map(expense => (
                    <tr key={expense.id}>
                      <td>{formatDate(expense.date)}</td>
                      <td>
                        <div className="expense-description">
                          <span className="description">{expense.description}</span>
                          {expense.notes && (
                            <span className="notes">{expense.notes}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="category-badge">
                          <span role="img" aria-label={getCategoryLabel(expense.category)}>{getCategoryIcon(expense.category)}</span>
                          {getCategoryLabel(expense.category)}
                        </span>
                      </td>
                      <td className="amount negative">
                        -{formatCurrency(expense.amount)}
                      </td>
                      <td>
                        {expense.recurring ? (
                          <span className="recurring-badge">Sí</span>
                        ) : (
                          <span className="one-time-badge">No</span>
                        )}
                      </td>
                      <td>
                        <div className="expense-actions">
                          <button
                            onClick={() => handleEditExpense(expense)}
                            className="action-btn edit"
                          >
                            <span role="img" aria-label="Editar">✏️</span>
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="action-btn delete"
                          >
                            <span role="img" aria-label="Eliminar">🗑️</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}