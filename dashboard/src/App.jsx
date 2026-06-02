import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

const API_URL = 'http://localhost:3000';

function App() {
  const [data, setData] = useState({
    pages: [],
    buttons: [],
    summary: {
      total_orders: 0,
      total_revenue: 0,
      avg_ticket: 0,
      avg_quantity: 0,
      best_product: 'Nenhum',
      top_size: 'Nenhum',
      top_delivery: 'Nenhum',
    },
    ordersByProduct: [],
    ordersBySize: [],
    ordersByDeliveryType: [],
    revenueByProduct: [],
    ordersByCategory: [],
    recentOrders: [],
  });

  const [loading, setLoading] = useState(true);

  const COLORS = [
    '#2C3E50',
    '#E67E22',
    '#27AE60',
    '#C0392B',
    '#8E44AD',
    '#34495E',
    '#D35400',
    '#16A085',
  ];

  const formatName = (str) => {
    if (!str) return '';

    return str
      .replace(/^(Tela|Botao)_/, '')
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .trim();
  };

  const formatCurrency = (value) => {
    const numberValue = Number(value) || 0;

    return numberValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatNumber = (value) => {
    const numberValue = Number(value) || 0;
    return numberValue.toFixed(1);
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard`);

      const formattedPages = (response.data.pages || []).map((page) => ({
        ...page,
        views: Number(page.views) || 0,
        avg_render_time: Math.round(Number(page.avg_render_time) || 0),
        displayName: formatName(page.page_name),
      }));

      const formattedButtons = (response.data.buttons || []).map((button) => ({
        ...button,
        clicks: Number(button.clicks) || 0,
        displayName: formatName(button.button_name),
      }));

      const formattedOrdersByProduct = (response.data.ordersByProduct || []).map((item) => ({
        ...item,
        orders: Number(item.orders) || 0,
        quantity: Number(item.quantity) || 0,
        revenue: Number(item.revenue) || 0,
        displayName: item.product_name,
      }));

      const formattedOrdersBySize = (response.data.ordersBySize || []).map((item) => ({
        ...item,
        orders: Number(item.orders) || 0,
        quantity: Number(item.quantity) || 0,
        revenue: Number(item.revenue) || 0,
        displayName: `Tamanho ${item.size}`,
      }));

      const formattedOrdersByDeliveryType = (response.data.ordersByDeliveryType || []).map((item) => ({
        ...item,
        orders: Number(item.orders) || 0,
        quantity: Number(item.quantity) || 0,
        revenue: Number(item.revenue) || 0,
        displayName: item.delivery_type,
      }));

      const formattedRevenueByProduct = (response.data.revenueByProduct || []).map((item) => ({
        ...item,
        revenue: Number(item.revenue) || 0,
        displayName: item.product_name,
      }));

      const formattedOrdersByCategory = (response.data.ordersByCategory || []).map((item) => ({
        ...item,
        orders: Number(item.orders) || 0,
        quantity: Number(item.quantity) || 0,
        revenue: Number(item.revenue) || 0,
        displayName: item.category,
      }));

      const formattedRecentOrders = (response.data.recentOrders || []).map((item) => ({
        ...item,
        total: Number(item.total) || 0,
        unit_price: Number(item.unit_price) || 0,
      }));

      setData({
        pages: formattedPages,
        buttons: formattedButtons,
        summary: response.data.summary || {
          total_orders: 0,
          total_revenue: 0,
          avg_ticket: 0,
          avg_quantity: 0,
          best_product: 'Nenhum',
          top_size: 'Nenhum',
          top_delivery: 'Nenhum',
        },
        ordersByProduct: formattedOrdersByProduct,
        ordersBySize: formattedOrdersBySize,
        ordersByDeliveryType: formattedOrdersByDeliveryType,
        revenueByProduct: formattedRevenueByProduct,
        ordersByCategory: formattedOrdersByCategory,
        recentOrders: formattedRecentOrders,
      });

      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleClearData = async () => {
    if (window.confirm('Atenção: isso apagará todos os dados de teste. Deseja continuar?')) {
      try {
        await axios.delete(`${API_URL}/analytics/clear`);

        setData({
          pages: [],
          buttons: [],
          summary: {
            total_orders: 0,
            total_revenue: 0,
            avg_ticket: 0,
            avg_quantity: 0,
            best_product: 'Nenhum',
            top_size: 'Nenhum',
            top_delivery: 'Nenhum',
          },
          ordersByProduct: [],
          ordersBySize: [],
          ordersByDeliveryType: [],
          revenueByProduct: [],
          ordersByCategory: [],
          recentOrders: [],
        });
      } catch (error) {
        alert('Erro ao limpar os dados.');
      }
    }
  };

  if (loading) {
    return <h2 style={styles.loading}>Carregando métricas do sistema...</h2>;
  }

  const totalViews = data.pages.reduce((acc, curr) => acc + curr.views, 0);
  const totalClicks = data.buttons.reduce((acc, curr) => acc + curr.clicks, 0);

  const avgRenderGeneral =
    data.pages.length > 0
      ? Math.round(
          data.pages.reduce((acc, curr) => acc + curr.avg_render_time, 0) /
            data.pages.length
        )
      : 0;

  const getPageViews = (pageName) => {
    const page = data.pages.find((item) => item.page_name === pageName);
    return page ? page.views : 0;
  };

  const getButtonClicksContains = (text) => {
    return data.buttons
      .filter((item) => item.button_name.includes(text))
      .reduce((acc, item) => acc + item.clicks, 0);
  };

  const funnelData = [
    {
      step: 'Bem-vindo',
      value: getPageViews('Tela_Bem_Vindo'),
    },
    {
      step: 'Catálogo',
      value: getPageViews('Tela_Catalogo_Menu'),
    },
    {
      step: 'Detalhes',
      value: getPageViews('Tela_Detalhes_Produto'),
    },
    {
      step: 'Carrinho',
      value: getPageViews('Tela_Carrinho_Checkout'),
    },
    {
      step: 'Finalização',
      value:
        Number(data.summary.total_orders) ||
        getButtonClicksContains('Botao_Finalizar_Checkout'),
    },
  ];

  const hasOrders = Number(data.summary.total_orders) > 0;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Dashboard Analítico - Teste A/B</h1>
          <p style={styles.pageSubtitle}>
            Monitoramento de Conversão, Pedidos e Performance da Aplicação Mobile
          </p>
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
          <p style={styles.kpiTitle}>Total de Cliques</p>
          <p style={styles.kpiValue}>{totalClicks}</p>
        </div>

        <div style={styles.kpiCard}>
          <p style={styles.kpiTitle}>Tempo Médio Geral</p>
          <p style={styles.kpiValue}>{avgRenderGeneral} ms</p>
        </div>

        <div style={styles.kpiCardGreen}>
          <p style={styles.kpiTitle}>Pedidos Finalizados</p>
          <p style={styles.kpiValue}>{data.summary.total_orders}</p>
        </div>

        <div style={styles.kpiCardGreen}>
          <p style={styles.kpiTitle}>Receita Simulada</p>
          <p style={styles.kpiValue}>
            {formatCurrency(data.summary.total_revenue)}
          </p>
        </div>

        <div style={styles.kpiCardOrange}>
          <p style={styles.kpiTitle}>Ticket Médio</p>
          <p style={styles.kpiValue}>
            {formatCurrency(data.summary.avg_ticket)}
          </p>
        </div>

        <div style={styles.kpiCardPurple}>
          <p style={styles.kpiTitle}>Produto Mais Vendido</p>
          <p style={styles.kpiSmallValue}>{data.summary.best_product}</p>
        </div>

        <div style={styles.kpiCardPurple}>
          <p style={styles.kpiTitle}>Tamanho Mais Escolhido</p>
          <p style={styles.kpiSmallValue}>{data.summary.top_size}</p>
        </div>
      </div>

      {!hasOrders && (
        <div style={styles.warningBox}>
          <strong>Aviso:</strong> ainda não existem pedidos registrados. Finalize um pedido no app
          mobile para os gráficos de receita, tamanho e entrega aparecerem.
        </div>
      )}

      <div style={styles.grid}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Interações por Botão</h2>

          <div style={styles.chartBox}>
            <ResponsiveContainer>
              <BarChart
                data={data.buttons}
                margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="displayName"
                  tick={{ fontSize: 11 }}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis />
                <Tooltip cursor={{ fill: '#f5f5f5' }} />
                <Bar
                  dataKey="clicks"
                  fill="#E67E22"
                  name="Volume de Cliques"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Distribuição de Tráfego por Página</h2>

          <div style={styles.chartBox}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data.pages}
                  cx="50%"
                  cy="50%"
                  labelLine
                  label={({ displayName, percent }) =>
                    `${displayName} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="views"
                  nameKey="displayName"
                >
                  {data.pages.map((entry, index) => (
                    <Cell
                      key={`page-cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Funil de Conversão</h2>

          <div style={styles.chartBox}>
            <ResponsiveContainer>
              <BarChart
                data={funnelData}
                margin={{ top: 20, right: 30, left: 0, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="step" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="#3498DB"
                  name="Usuários/Eventos"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Pedidos por Produto</h2>

          <div style={styles.chartBox}>
            <ResponsiveContainer>
              <BarChart
                data={data.ordersByProduct}
                margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="displayName"
                  tick={{ fontSize: 11 }}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="quantity"
                  fill="#27AE60"
                  name="Quantidade Vendida"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Tamanhos Mais Escolhidos</h2>

          <div style={styles.chartBox}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data.ordersBySize}
                  cx="50%"
                  cy="50%"
                  labelLine
                  label={({ size, percent }) =>
                    `${size} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="orders"
                  nameKey="size"
                >
                  {data.ordersBySize.map((entry, index) => (
                    <Cell
                      key={`size-cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Retirada vs Entrega</h2>

          <div style={styles.chartBox}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data.ordersByDeliveryType}
                  cx="50%"
                  cy="50%"
                  labelLine
                  label={({ delivery_type, percent }) =>
                    `${delivery_type} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="orders"
                  nameKey="delivery_type"
                >
                  {data.ordersByDeliveryType.map((entry, index) => (
                    <Cell
                      key={`delivery-cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Receita por Produto</h2>

          <div style={styles.chartBox}>
            <ResponsiveContainer>
              <BarChart
                data={data.revenueByProduct}
                margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="displayName"
                  tick={{ fontSize: 11 }}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar
                  dataKey="revenue"
                  fill="#8E44AD"
                  name="Receita"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Pedidos por Categoria</h2>

          <div style={styles.chartBox}>
            <ResponsiveContainer>
              <BarChart
                data={data.ordersByCategory}
                margin={{ top: 20, right: 30, left: 0, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="displayName" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="orders"
                  fill="#D35400"
                  name="Pedidos"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ ...styles.card, gridColumn: '1 / -1' }}>
          <h2 style={styles.cardTitle}>
            Análise de Performance - Tempo de Renderização em ms
          </h2>

          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart
                data={data.pages}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis
                  dataKey="displayName"
                  type="category"
                  tick={{ fontSize: 12 }}
                  width={150}
                />
                <Tooltip cursor={{ fill: '#f5f5f5' }} />
                <Bar
                  dataKey="avg_render_time"
                  name="Tempo Médio (ms)"
                  radius={[0, 4, 4, 0]}
                >
                  {data.pages.map((entry, index) => (
                    <Cell
                      key={`performance-cell-${index}`}
                      fill={entry.avg_render_time > 200 ? '#C0392B' : '#27AE60'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ ...styles.card, gridColumn: '1 / -1' }}>
          <h2 style={styles.cardTitle}>Últimos Pedidos</h2>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Produto</th>
                  <th style={styles.th}>Categoria</th>
                  <th style={styles.th}>Tamanho</th>
                  <th style={styles.th}>Qtd.</th>
                  <th style={styles.th}>Tipo</th>
                  <th style={styles.th}>Total</th>
                  <th style={styles.th}>Data</th>
                </tr>
              </thead>

              <tbody>
                {data.recentOrders.length === 0 ? (
                  <tr>
                    <td style={styles.emptyTd} colSpan="7">
                      Nenhum pedido registrado ainda.
                    </td>
                  </tr>
                ) : (
                  data.recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td style={styles.td}>{order.product_name}</td>
                      <td style={styles.td}>{order.category}</td>
                      <td style={styles.td}>{order.size}</td>
                      <td style={styles.td}>{order.quantity}</td>
                      <td style={styles.td}>{order.delivery_type}</td>
                      <td style={styles.td}>{formatCurrency(order.total)}</td>
                      <td style={styles.td}>{order.created_at}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    padding: '30px',
    backgroundColor: '#F8F9FA',
    minHeight: '100vh',
    color: '#333',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    borderBottom: '2px solid #E9ECEF',
    paddingBottom: '20px',
    gap: '20px',
  },

  pageTitle: {
    margin: 0,
    fontSize: '28px',
    color: '#2C3E50',
  },

  pageSubtitle: {
    margin: '5px 0 0 0',
    color: '#7F8C8D',
    fontSize: '14px',
  },

  clearButton: {
    backgroundColor: '#E74C3C',
    color: '#FFF',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },

  loading: {
    textAlign: 'center',
    marginTop: '50px',
    color: '#7F8C8D',
  },

  kpiContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },

  kpiCard: {
    backgroundColor: '#FFF',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    borderLeft: '4px solid #3498DB',
  },

  kpiCardGreen: {
    backgroundColor: '#FFF',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    borderLeft: '4px solid #27AE60',
  },

  kpiCardOrange: {
    backgroundColor: '#FFF',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    borderLeft: '4px solid #E67E22',
  },

  kpiCardPurple: {
    backgroundColor: '#FFF',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    borderLeft: '4px solid #8E44AD',
  },

  kpiTitle: {
    margin: 0,
    color: '#7F8C8D',
    fontSize: '13px',
    textTransform: 'uppercase',
    fontWeight: '700',
  },

  kpiValue: {
    margin: '10px 0 0 0',
    fontSize: '30px',
    fontWeight: 'bold',
    color: '#2C3E50',
  },

  kpiSmallValue: {
    margin: '10px 0 0 0',
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#2C3E50',
  },

  warningBox: {
    backgroundColor: '#FFF3CD',
    color: '#856404',
    padding: '15px 20px',
    borderRadius: '8px',
    marginBottom: '25px',
    border: '1px solid #FFEEBA',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
    gap: '20px',
  },

  card: {
    backgroundColor: '#FFF',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },

  cardTitle: {
    margin: '0 0 20px 0',
    fontSize: '18px',
    color: '#2C3E50',
    fontWeight: '700',
    borderBottom: '1px solid #E9ECEF',
    paddingBottom: '10px',
  },

  chartBox: {
    width: '100%',
    height: 320,
  },

  tableWrapper: {
    overflowX: 'auto',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },

  th: {
    backgroundColor: '#F1F3F5',
    color: '#2C3E50',
    textAlign: 'left',
    padding: '12px',
    borderBottom: '1px solid #DEE2E6',
  },

  td: {
    padding: '12px',
    borderBottom: '1px solid #E9ECEF',
    color: '#495057',
  },

  emptyTd: {
    padding: '20px',
    textAlign: 'center',
    color: '#7F8C8D',
  },
};

export default App;