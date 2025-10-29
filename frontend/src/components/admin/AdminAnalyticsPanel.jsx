
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Chart from '../../utils/chart';
import jsPDF from 'jspdf';

function getColor(type, value) {
  if (type === 'usuarios') return value > 100 ? 'green' : value > 20 ? 'yellow' : 'red';
  if (type === 'ventas') return value > 1000 ? 'green' : value > 200 ? 'yellow' : 'red';
  if (type === 'ticketMedio') return value > 50 ? 'green' : value > 20 ? 'yellow' : 'red';
  if (type === 'ingresos') return value > 5000 ? 'green' : value > 1000 ? 'yellow' : 'red';
  if (type === 'gastos') return value < 1000 ? 'green' : value < 3000 ? 'yellow' : 'red';
  return 'gray';
}

const emoji = {
  usuarios: '🧑‍🤝‍🧑',
  nuevos: '✨',
  suscriptores: '📧',
  activos: '✅',
  ventas: '💸',
  ticket: '🎟️',
  producto: '📦',
  mes: '📅',
  ingresos: '💰',
  gastos: '💸',
  objetivo: '🎯',
  crecimiento: '📈',
  lectura: '🔮',
  alerta: '🚨',
  exportar: '📤',
  cpu: '🖥️',
  ram: '🧠',
  api: '🤖',
  log: '📋',
};

export default function AdminAnalyticsPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serverLog, setServerLog] = useState([]);
  const [systemStats, setSystemStats] = useState({ cpu: 0, ram: 0 });
  const [openaiStats, setOpenaiStats] = useState({ calls: 0, cost: 0 });
  const chartRef = useRef();

  useEffect(() => {
      axios.get('https://nebulosamagica.com/api/admin/analytics')
      .then(res => {
        setData(res.data.analytics);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
      // Obtener log del servidor y stats del sistema
      axios.get('https://nebulosamagica.com/api/admin/server-log').then(res => setServerLog(res.data.log || []));
      axios.get('https://nebulosamagica.com/api/admin/system-stats').then(res => setSystemStats(res.data.stats || { cpu: 0, ram: 0 }));
      axios.get('https://nebulosamagica.com/api/admin/openai-stats').then(res => setOpenaiStats(res.data.stats || { calls: 0, cost: 0 }));
  }, []);

  useEffect(() => {
    if (data && chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.crecimiento.ventas.map(v => v.month),
          datasets: [
            {
              label: 'Ventas (€)',
              data: data.crecimiento.ventas.map(v => Number(v.total)),
              borderColor: '#4caf50',
              backgroundColor: 'rgba(76,175,80,0.1)',
              fill: true,
            },
            {
              label: 'Pedidos',
              data: data.crecimiento.ventas.map(v => v.orders),
              borderColor: '#2196f3',
              backgroundColor: 'rgba(33,150,243,0.1)',
              fill: true,
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Evolución de ventas y pedidos' }
          }
        }
      });
    }
  }, [data]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Analíticas y métricas del negocio', 10, 10);
    if (data) {
      doc.text(`Usuarios: ${data.usuarios.total}`, 10, 20);
      doc.text(`Suscriptores: ${data.suscriptores.total}`, 10, 30);
      doc.text(`Ventas totales: €${data.ecommerce.ventas?.toFixed(2)}`, 10, 40);
      doc.text(`Ingresos: €${data.ingresos?.toFixed(2)}`, 10, 50);
      doc.text(`Gastos: €${data.gastos?.toFixed(2)}`, 10, 60);
      doc.text(`Lecturas: ${data.lecturas.total}`, 10, 70);
    }
    doc.save('analiticas-nebulosa.pdf');
  };

  if (loading) return <div className="admin-panel-loading">Cargando métricas...</div>;
  if (error) return <div className="admin-panel-error">{emoji.alerta} Error: {error}</div>;
  if (!data) return <div className="admin-panel-empty">No hay datos.</div>;

  // Alertas automáticas
  const alerts = [];
  if (systemStats.cpu > 85) alerts.push(`${emoji.alerta} CPU alta (${systemStats.cpu}%)`);
  if (systemStats.ram > 6000) alerts.push(`${emoji.alerta} RAM alta (${systemStats.ram} MB)`);
  if (openaiStats.cost > 100) alerts.push(`${emoji.alerta} Gasto OpenAI elevado ($${openaiStats.cost?.toFixed(2)})`);
  if (serverLog.some(l => l.toLowerCase().includes('error') || l.toLowerCase().includes('critical'))) alerts.push(`${emoji.alerta} Error crítico en log del servidor`);

  return (
    <div className="admin-analytics-panel">
      <h2>{emoji.crecimiento} Analíticas y métricas del negocio</h2>
      {alerts.length > 0 && (
        <div className="admin-alerts">
          {alerts.map((a, i) => (
            <div key={i} className="alert-msg">{a}</div>
          ))}
        </div>
      )}
      <button className="export-btn" onClick={handleExportPDF}>{emoji.exportar} Exportar PDF</button>
      <div className="stats-grid">
        {/* ...tarjetas visuales como antes... */}
        <div className={`stat-card ${getColor('usuarios', data.usuarios.total)}`}>
          <span className="stat-emoji">{emoji.usuarios}</span>
          <div className="stat-title">Usuarios</div>
          <div className="stat-value">{data.usuarios.total}</div>
          <div className="stat-desc">{emoji.nuevos} Nuevos este mes: <b>{data.usuarios.nuevosEsteMes}</b></div>
        </div>
        <div className={`stat-card ${getColor('suscriptores', data.suscriptores.total)}`}>
          <span className="stat-emoji">{emoji.suscriptores}</span>
          <div className="stat-title">Suscriptores</div>
          <div className="stat-value">{data.suscriptores.total}</div>
          <div className="stat-desc">{emoji.activos} Activos: <b>{data.suscriptores.activos}</b></div>
        </div>
        <div className={`stat-card ${getColor('ventas', data.ecommerce.ventas)}`}>
          <span className="stat-emoji">{emoji.ventas}</span>
          <div className="stat-title">Ventas totales</div>
          <div className="stat-value">€{data.ecommerce.ventas?.toFixed(2)}</div>
          <div className="stat-desc">Pedidos: <b>{data.ecommerce.pedidos}</b></div>
        </div>
        <div className={`stat-card ${getColor('ticketMedio', data.ecommerce.ticketMedio)}`}>
          <span className="stat-emoji">{emoji.ticket}</span>
          <div className="stat-title">Ticket medio</div>
          <div className="stat-value">€{data.ecommerce.ticketMedio?.toFixed(2)}</div>
        </div>
        {/* ...más tarjetas como antes... */}
        <div className={`stat-card gray`}>
          <span className="stat-emoji">{emoji.producto}</span>
          <div className="stat-title">Top productos</div>
          <ul className="stat-list">
            {Array.isArray(data.ecommerce.productosTop) && data.ecommerce.productosTop.map(p => (
              <li key={p.product.id}>{p.product.name} <b>({p.quantity} ventas)</b></li>
            ))}
          </ul>
        </div>
        <div className={`stat-card gray`}>
          <span className="stat-emoji">{emoji.mes}</span>
          <div className="stat-title">Ventas por mes</div>
          <canvas ref={chartRef} width={320} height={120} style={{marginBottom:8}}></canvas>
          <ul className="stat-list">
            {Array.isArray(data.ecommerce.ventasPorMes) && data.ecommerce.ventasPorMes.map(m => (
              <li key={m.month}>{m.month}: €{Number(m.total).toFixed(2)} ({m.orders} pedidos)</li>
            ))}
          </ul>
        </div>
        <div className={`stat-card ${getColor('ingresos', data.ingresos)}`}>
          <span className="stat-emoji">{emoji.ingresos}</span>
          <div className="stat-title">Ingresos</div>
          <div className="stat-value">€{data.ingresos?.toFixed(2)}</div>
        </div>
        <div className={`stat-card ${getColor('gastos', data.gastos)}`}>
          <span className="stat-emoji">{emoji.gastos}</span>
          <div className="stat-title">Gastos</div>
          <div className="stat-value">€{data.gastos?.toFixed(2)}</div>
        </div>
        <div className={`stat-card gray`}>
          <span className="stat-emoji">{emoji.objetivo}</span>
          <div className="stat-title">Objetivos</div>
          <ul className="stat-list">
            {Array.isArray(data.objetivos) && data.objetivos.map(obj => (
              <li key={obj.id}>{obj.clave}: <b>{obj.valor}</b> ({obj.periodo})</li>
            ))}
          </ul>
        </div>
        <div className={`stat-card gray`}>
          <span className="stat-emoji">{emoji.crecimiento}</span>
          <div className="stat-title">Crecimiento</div>
          <div className="stat-subtitle">Usuarios</div>
          <ul className="stat-list">
            {Array.isArray(data.crecimiento?.usuarios) && data.crecimiento.usuarios.map(u => (
              <li key={u.month}>{u.month}: <b>{u.users}</b></li>
            ))}
          </ul>
          <div className="stat-subtitle">Ventas</div>
          <ul className="stat-list">
            {Array.isArray(data.crecimiento?.ventas) && data.crecimiento.ventas.map(v => (
              <li key={v.month}>{v.month}: €{Number(v.total).toFixed(2)} ({v.orders} pedidos)</li>
            ))}
          </ul>
          <div className="stat-subtitle">Ingresos</div>
          <ul className="stat-list">
            {Array.isArray(data.crecimiento?.ingresos) && data.crecimiento.ingresos.map(i => (
              <li key={i.month}>{i.month}: €{Number(i.total).toFixed(2)}</li>
            ))}
          </ul>
        </div>
        <div className={`stat-card gray`}>
          <span className="stat-emoji">{emoji.lectura}</span>
          <div className="stat-title">Lecturas</div>
          <div className="stat-value">{data.lecturas.total}</div>
          {/* Resumen semanal con comparativa */}
          {data.lecturas.semanal && (
            <div className="stat-desc">
              <b>Semana actual:</b> {data.lecturas.semanal.actual} <br/>
              <b>Semana anterior:</b> {data.lecturas.semanal.anterior} <br/>
              <b>Dif:</b> {(() => {
                const diff = data.lecturas.semanal.actual - data.lecturas.semanal.anterior;
                const pct = data.lecturas.semanal.anterior === 0 ? 0 : (diff / data.lecturas.semanal.anterior) * 100;
                return `${diff >= 0 ? '▲' : '▼'} ${Math.abs(diff)} (${pct.toFixed(1)}%)`;
              })()}
            </div>
          )}
          <div className="stat-subtitle">Por mes</div>
          <ul className="stat-list">
            {Array.isArray(data.lecturas?.porMes) && data.lecturas.porMes.map(l => (
              <li key={l.month}>{l.month}: {l.readings}</li>
            ))}
          </ul>
        </div>
        {/* --- Recursos del sistema y log --- */}
        <div className={`stat-card ${getColor('cpu', systemStats.cpu)}`}>
          <span className="stat-emoji">{emoji.cpu}</span>
          <div className="stat-title">CPU</div>
          <div className="stat-value">{systemStats.cpu}%</div>
        </div>
        <div className={`stat-card ${getColor('ram', systemStats.ram)}`}>
          <span className="stat-emoji">{emoji.ram}</span>
          <div className="stat-title">RAM</div>
          <div className="stat-value">{systemStats.ram} MB</div>
        </div>
        <div className={`stat-card gray`}>
          <span className="stat-emoji">{emoji.api}</span>
          <div className="stat-title">OpenAI/ChatGPT</div>
          <div className="stat-value">{openaiStats.calls} llamadas</div>
          <div className="stat-desc">Gasto estimado: ${openaiStats.cost?.toFixed(2)}</div>
        </div>
        <div className={`stat-card gray`}>
          <span className="stat-emoji">{emoji.log}</span>
          <div className="stat-title">Log del servidor</div>
          <ul className="stat-list">
            {serverLog.slice(0,8).map((l,i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
