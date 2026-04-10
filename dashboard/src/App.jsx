import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'

function App() {
  const [data, setData] = useState({ pages: [], buttons: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/dashboard')
        setData(response.data)
        setLoading(false)
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 3000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <h2 style={styles.loading}>Carregando métricas... ☕</h2>

  const COLORS = ['#3E2723', '#D2691E', '#2E8B57', '#B22222']

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>📊 Dashboard Teste A/B - CaféExpress</h1>
        <p>Monitoramento de Métricas de Performance e Engajamento</p>
      </header>

      <div style={styles.grid}>

        <div style={styles.card}>
          <h2>👆 Botões Mais Clicados (Conversão)</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={data.buttons} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="button_name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="clicks" fill="#D2691E" name="Quantidade de Cliques" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={styles.card}>
          <h2>👁️ Páginas Mais Acessadas</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data.pages}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="views"
                >
                  {data.pages.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ ...styles.card, gridColumn: '1 / -1' }}>
          <h2>⏱️ Performance (Tempo de Renderização)</h2>
          <p style={{ marginBottom: 15, color: '#666' }}>Páginas com maior tempo médio de renderização (em milissegundos).</p>

          <table style={styles.table}>
            <thead>
              <tr style={styles.tr}>
                <th style={styles.th}>Página</th>
                <th style={styles.th}>Total de Visitas</th>
                <th style={styles.th}>Tempo Médio (ms)</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.pages.map((page, index) => (
                <tr key={index} style={styles.tr}>
                  <td style={styles.td}><strong>{page.page_name}</strong></td>
                  <td style={styles.td}>{page.views}</td>
                  <td style={styles.td}>{Math.round(page.avg_render_time)} ms</td>
                  <td style={styles.td}>
                    {page.avg_render_time > 200 ? '⚠️ Pesada' : '✅ Rápida'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}

const styles = {
  container: { fontFamily: 'sans-serif', padding: '20px', backgroundColor: '#f0f2f5', minHeight: '100vh' },
  header: { textAlign: 'center', marginBottom: '30px', color: '#333' },
  loading: { textAlign: 'center', marginTop: '50px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', maxWidth: '1200px', margin: '0 auto' },
  card: { backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #ddd', backgroundColor: '#fafafa' },
  td: { padding: '12px', borderBottom: '1px solid #eee' },
  tr: { hover: { backgroundColor: '#f5f5f5' } }
}

export default App