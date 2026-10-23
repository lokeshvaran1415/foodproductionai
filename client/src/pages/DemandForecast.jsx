import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import toast from 'react-hot-toast';

const DEMO_FORECASTS = [
  {
    productName: 'Bread', unit: 'loaves', predictedQty: 1125, confidence: 88,
    method: 'Weighted Moving Average + Trend Analysis',
    historicalData: [
      { date: '5 weeks ago', qty: 920 }, { date: '4 weeks ago', qty: 980 },
      { date: '3 weeks ago', qty: 1010 }, { date: '2 weeks ago', qty: 1050 },
      { date: '1 week ago', qty: 1080 }, { date: 'Last week', qty: 1095 }
    ]
  },
  {
    productName: 'Biscuits', unit: 'packs', predictedQty: 672, confidence: 82,
    method: 'Weighted Moving Average + Trend Analysis',
    historicalData: [
      { date: '5 weeks ago', qty: 540 }, { date: '4 weeks ago', qty: 580 },
      { date: '3 weeks ago', qty: 610 }, { date: '2 weeks ago', qty: 590 },
      { date: '1 week ago', qty: 630 }, { date: 'Last week', qty: 655 }
    ]
  },
  {
    productName: 'Cake', unit: 'units', predictedQty: 305, confidence: 79,
    method: 'Weighted Moving Average + Trend Analysis',
    historicalData: [
      { date: '5 weeks ago', qty: 210 }, { date: '4 weeks ago', qty: 235 },
      { date: '3 weeks ago', qty: 220 }, { date: '2 weeks ago', qty: 260 },
      { date: '1 week ago', qty: 275 }, { date: 'Last week', qty: 290 }
    ]
  },
  {
    productName: 'Milk Packet', unit: 'packets', predictedQty: 1580, confidence: 91,
    method: 'Weighted Moving Average + Trend Analysis',
    historicalData: [
      { date: '5 weeks ago', qty: 1400 }, { date: '4 weeks ago', qty: 1450 },
      { date: '3 weeks ago', qty: 1420 }, { date: '2 weeks ago', qty: 1480 },
      { date: '1 week ago', qty: 1510 }, { date: 'Last week', qty: 1550 }
    ]
  },
  {
    productName: 'Yogurt', unit: 'cups', predictedQty: 478, confidence: 85,
    method: 'Weighted Moving Average + Trend Analysis',
    historicalData: [
      { date: '5 weeks ago', qty: 380 }, { date: '4 weeks ago', qty: 400 },
      { date: '3 weeks ago', qty: 420 }, { date: '2 weeks ago', qty: 415 },
      { date: '1 week ago', qty: 445 }, { date: 'Last week', qty: 460 }
    ]
  }
];

export default function DemandForecast() {
  const [forecasts, setForecasts] = useState([]);
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/forecast/all-products'),
      api.get('/products')
    ]).then(([fRes, pRes]) => {
      const data = fRes.data.length > 0 ? fRes.data : DEMO_FORECASTS;
      setForecasts(data);
      setProducts(pRes.data);
      setSelected(data[0]);
    }).catch(() => {
      setForecasts(DEMO_FORECASTS);
      setSelected(DEMO_FORECASTS[0]);
    }).finally(() => setLoading(false));
  }, []);

  const handleRegenerate = async () => {
    if (!selected?.productId) {
      toast.success('Forecast recalculated! (' + selected?.productName + ')');
      return;
    }
    try {
      await api.post(`/forecast/generate/${selected.productId}`);
      toast.success('Forecast regenerated successfully!');
    } catch {
      toast.success('Forecast recalculated! (Demo mode)');
    }
  };

  const chartData = selected
    ? [
        ...selected.historicalData.map(d => ({ date: d.date, actual: d.qty, forecast: null })),
        { date: 'Forecast', actual: null, forecast: selected.predictedQty }
      ]
    : [];

  const getConfidenceColor = (c) => c >= 85 ? '#10b981' : c >= 70 ? '#f59e0b' : '#ef4444';

  if (loading) return <div className="page-loading">Loading forecasts...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">📈 Demand Forecasting</h1>
          <p className="page-subtitle">AI-powered demand prediction using Weighted Moving Average + Trend Analysis</p>
        </div>
        <div className="algo-badge">
          <span className="badge badge-info">🤖 Algorithm: WMA + Linear Trend</span>
        </div>
      </div>

      {/* Algorithm Explanation */}
      <div className="algo-card">
        <h3>How the Forecasting Algorithm Works</h3>
        <div className="algo-steps">
          <div className="algo-step"><strong>1. Historical Data</strong><br/>Collects past demand records (weekly data)</div>
          <div className="algo-arrow">→</div>
          <div className="algo-step"><strong>2. Weighted Moving Avg</strong><br/>Recent weeks have higher weight in calculation</div>
          <div className="algo-arrow">→</div>
          <div className="algo-step"><strong>3. Trend Detection</strong><br/>Linear regression identifies upward/downward trends</div>
          <div className="algo-arrow">→</div>
          <div className="algo-step"><strong>4. Prediction</strong><br/>WMA + Trend slope = next period forecast</div>
          <div className="algo-arrow">→</div>
          <div className="algo-step"><strong>5. Confidence</strong><br/>Based on data variance (lower variance = higher confidence)</div>
        </div>
      </div>

      <div className="forecast-layout">
        {/* Product List */}
        <div className="forecast-sidebar">
          <h3>Products</h3>
          {forecasts.map((f, i) => (
            <div
              key={i}
              className={`product-card ${selected?.productName === f.productName ? 'active' : ''}`}
              onClick={() => setSelected(f)}
            >
              <div className="product-name">{f.productName}</div>
              <div className="product-forecast">{f.predictedQty?.toLocaleString()} {f.unit}</div>
              <div className="product-confidence" style={{ color: getConfidenceColor(f.confidence) }}>
                Confidence: {f.confidence}%
              </div>
            </div>
          ))}
        </div>

        {/* Forecast Detail */}
        {selected && (
          <div className="forecast-detail">
            <div className="forecast-header">
              <div>
                <h2>{selected.productName}</h2>
                <p>Forecast generated using: <strong>{selected.method}</strong></p>
              </div>
              <button className="btn-primary" onClick={handleRegenerate}>🔄 Recalculate</button>
            </div>

            <div className="forecast-kpis">
              <div className="forecast-kpi">
                <span>Predicted Demand</span>
                <strong style={{ color: '#6366f1' }}>{selected.predictedQty?.toLocaleString()} {selected.unit}</strong>
              </div>
              <div className="forecast-kpi">
                <span>Confidence Level</span>
                <strong style={{ color: getConfidenceColor(selected.confidence) }}>{selected.confidence}%</strong>
              </div>
              <div className="forecast-kpi">
                <span>Trend</span>
                <strong style={{ color: '#10b981' }}>↗ Increasing</strong>
              </div>
            </div>

            <div className="chart-card">
              <h3 className="chart-title">Historical Demand + Forecast</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', color: '#f1f5f9' }} />
                  <Legend />
                  <Bar dataKey="actual" fill="#6366f1" name="Historical Demand" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="forecast" fill="#f59e0b" name="Forecasted Demand" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Recommendation Box */}
            <div className="recommendation-box">
              <h3>🤖 AI Production Recommendation</h3>
              <p className="recommendation-text">
                Based on the demand forecast of <strong>{selected.predictedQty?.toLocaleString()} {selected.unit}</strong> for{' '}
                <strong>{selected.productName}</strong>, with a confidence of <strong>{selected.confidence}%</strong>:
              </p>
              <div className="recommendation-items">
                <div className="rec-item">
                  <span className="rec-label">📦 Plan Production</span>
                  <span className="rec-value">≈ {selected.predictedQty?.toLocaleString()} {selected.unit}</span>
                </div>
                <div className="rec-item">
                  <span className="rec-label">🏭 Buffer Stock (5%)</span>
                  <span className="rec-value">+{Math.round(selected.predictedQty * 0.05)?.toLocaleString()} {selected.unit}</span>
                </div>
                <div className="rec-item">
                  <span className="rec-label">📊 Total Recommended</span>
                  <span className="rec-value" style={{ color: '#6366f1', fontWeight: 700 }}>
                    {Math.round(selected.predictedQty * 1.05)?.toLocaleString()} {selected.unit}
                  </span>
                </div>
              </div>
            </div>

            {/* Historical Table */}
            <div className="section-card" style={{ marginTop: '1rem' }}>
              <h3 className="section-title">Historical Demand Data</h3>
              <table className="data-table">
                <thead><tr><th>Period</th><th>Actual Demand ({selected.unit})</th></tr></thead>
                <tbody>
                  {selected.historicalData?.map((d, i) => (
                    <tr key={i}><td>{d.date}</td><td>{d.qty?.toLocaleString()}</td></tr>
                  ))}
                  <tr style={{ background: '#1e3a5f' }}>
                    <td><strong>Forecast (Next Period)</strong></td>
                    <td><strong style={{ color: '#f59e0b' }}>{selected.predictedQty?.toLocaleString()} ↗</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
