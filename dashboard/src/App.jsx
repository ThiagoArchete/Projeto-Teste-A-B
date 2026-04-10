import { useEffect, useState } from 'react'
import axios from 'axios'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'

function App() {
  const [data, setData] = useState({ pages: [], buttons: [] })
  const [loading, setLoading] = useState(true)

  const formatName = (str) => {
    if (!str) return '';
    return str
      .replace(/^(Tela|Botao)_/, '')
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .trim();
  };

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/dashboard')
      
      const formattedPages = response.data.pages.map(p => ({
        ...p,
        displayName: formatName(p.page_name)
      }));
      
      const formattedButtons = response.data.buttons.map(b => ({
        ...b,
        displayName: formatName(b.button_name)
      }));

      setData({ pages: formattedPages, buttons: formattedButtons })
      setLoading(false)
    } catch (error) {
      console.error("Erro ao buscar dados:", error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 3000) 
    return () => clearInterval(interval)
  }, [])

  const handleClearData = async () => {
    if (window.confirm("Atenção: Isso apagará todos os dados de teste. Deseja continuar?")) {
      try {
        await axios.delete('http://localhost:3000/analytics/clear')
        setData({ pages: [], buttons: [] }) 
      } catch (error) {
        alert("Erro ao limpar os dados.")
      }
    }
  }

  if (loading) return <h2 style={styles.loading}>Carregando métricas do sistema...</h2>

  const totalViews = data.pages.reduce((acc, curr) => acc + curr.views, 0)
  const totalClicks = data.buttons.reduce((acc, curr) => acc + curr.clicks, 0)
  const avgRenderGeneral = data.pages.length > 0 
    ? Math.round(data.pages.reduce((acc, curr) => acc + curr.avg_render_time, 0) / data.pages.length) 
    : 0

  const COLORS = ['#2C3E50', '#E67E22', '#27AE60', '#C0392B', '#8E44AD', '#34495E', '#D35400']

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Dashboard Analítico - Teste A/B</h1>
          <p style={styles.pageSubtitle}>Monitoramento de Conversão e Performance de Aplicação Mobile</p>
        </div>
        <button style={styles.clearButton} onClick={handleClearData}>
          Limpar Dados
        </button>
      </header>

      <div style={styles.kpiContainer}>
        <div style={styles.kpiCard}>
          <p style={styles.kpiTitle}>Total de Visualizações</p>
          <p style={styles.kpiValue}>{totalViews}</p>
        </div>
        <div style={styles.kpiCard}>
          <p style={styles.kpiTitle}>Total de Cliques em Botões</p>
          <p style={styles.kpiValue}>{totalClicks}</p>
        </div>
        <div style={styles.kpiCard}>
          <p style={styles.kpiTitle}>Tempo Médio Geral</p>
          <p style={styles.kpiValue}>{avgRenderGeneral} ms</p>
        </div>
      </div>

      <div style={styles.grid}>
        
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Taxa de Interação por Botão (Conversão)</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={data.buttons} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                {/* Agora usamos o displayName que criamos */}
                <XAxis dataKey="displayName" tick={{fontSize: 11}} angle={-25} textAnchor="end" />
                <YAxis />
                <Tooltip cursor={{fill: '#f5f5f5'}} />
                <Bar dataKey="clicks" fill="#E67E22" name="Volume de Cliques" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Distribuição de Tráfego por Página</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data.pages}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ displayName, percent }) => `${displayName} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="views"
                  nameKey="displayName"
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

        <div style={{...styles.card, gridColumn: '1 / -1'}}>
          <h2 style={styles.cardTitle}>Análise de Performance (Tempo de Renderização em ms)</h2>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={data.pages} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="displayName" type="category" tick={{fontSize: 12}} width={150} />
                <Tooltip cursor={{fill: '#f5f5f5'}} />
                <Bar dataKey="avg_render_time" fill="#2C3E50" name="Tempo Médio (ms)" radius={[0, 4, 4, 0]}>
                  {data.pages.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.avg_render_time > 200 ? '#C0392B' : '#27AE60'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  )
}

const styles = {
  container: { fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", padding: '30px', backgroundColor: '#F8F9FA', minHeight: '100vh', color: '#333' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #E9ECEF', paddingBottom: '20px' },
  pageTitle: { margin: 0, fontSize: '28px', color: '#2C3E50' },
  pageSubtitle: { margin: '5px 0 0 0', color: '#7F8C8D', fontSize: '14px' },
  clearButton: { backgroundColor: '#E74C3C', color: '#FFF', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.3s' },
  loading: { textAlign: 'center', marginTop: '50px', color: '#7F8C8D' },
  kpiContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' },
  kpiCard: { backgroundColor: '#FFF', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: '4px solid #3498DB' },
  kpiTitle: { margin: 0, color: '#7F8C8D', fontSize: '14px', textTransform: 'uppercase', fontWeight: '600' },
  kpiValue: { margin: '10px 0 0 0', fontSize: '32px', fontWeight: 'bold', color: '#2C3E50' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px' },
  card: { backgroundColor: '#FFF', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  cardTitle: { margin: '0 0 20px 0', fontSize: '18px', color: '#2C3E50', fontWeight: '600', borderBottom: '1px solid #E9ECEF', paddingBottom: '10px' },
}

export default App