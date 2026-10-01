import {
  CalendarIcon,
  BarChartIcon,
  TrendingUpIcon,
  WalletIcon,
  FolderIcon,
  PackageIcon,
  FlameIcon,
} from "../components/AdminIcons";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const API = import.meta.env.VITE_API_URL;

const COLORS = [
  "#c8a04b", "#1e1b4b", "#312e81", "#e0bb6a",
  "#b0455f", "#15803d", "#a16207", "#0ea5e9",
];

function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [salesTrend, setSalesTrend] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ov, st, tp, cat] = await Promise.all([
          axios.get(`${API}/analytics/overview`),
          axios.get(`${API}/analytics/sales-trend`),
          axios.get(`${API}/analytics/top-products`),
          axios.get(`${API}/analytics/categories`),
        ]);
        setOverview(ov.data);
        setSalesTrend(st.data);
        setTopProducts(tp.data);
        setCategories(cat.data);
      } catch (err) {
        console.error(err);
        toast.error("Analytics could not be loaded");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <p className="muted">Loading analytics...</p>;
  if (!overview) return <p className="muted">No data available</p>;

  // Sales Trend Chart Data
  const salesChartData = salesTrend
    ? {
        labels: salesTrend.labels,
        datasets: [
          {
            label: "Revenue (Rs.)",
            data: salesTrend.revenue,
            borderColor: "#c8a04b",
            backgroundColor: "rgba(200, 160, 75, 0.15)",
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: "#c8a04b",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointHoverRadius: 6,
          },
        ],
      }
    : null;

  // Category Chart Data
  const categoryChartData =
    categories.length > 0
      ? {
          labels: categories.map((c) => c.category),
          datasets: [
            {
              label: "Revenue",
              data: categories.map((c) => c.revenue),
              backgroundColor: COLORS.slice(0, categories.length),
              borderWidth: 2,
              borderColor: "#fff",
            },
          ],
        }
      : null;

  // Top Products Chart Data
  const topProductsChartData =
    topProducts.length > 0
      ? {
          labels: topProducts.map((p) =>
            p.name.length > 20 ? p.name.slice(0, 20) + "..." : p.name
          ),
          datasets: [
            {
              label: "Units Sold",
              data: topProducts.map((p) => p.sold),
              backgroundColor: topProducts.map(
                (_, i) => COLORS[i % COLORS.length]
              ),
              borderRadius: 6,
              borderSkipped: false,
            },
          ],
        }
      : null;

  const formatCurrency = (n) =>
    "Rs. " + (n || 0).toLocaleString("en-PK");

  const statusData = [
    { label: "Confirmed", value: overview.statusBreakdown.Confirmed, color: "#0ea5e9" },
    { label: "Shipped", value: overview.statusBreakdown.Shipped, color: "#a16207" },
    { label: "Out for Delivery", value: overview.statusBreakdown["Out for Delivery"], color: "#c8a04b" },
    { label: "Delivered", value: overview.statusBreakdown.Delivered, color: "#15803d" },
    { label: "Cancelled", value: overview.statusBreakdown.Cancelled, color: "#b0455f" },
  ];
  const maxStatus = Math.max(...statusData.map((s) => s.value), 1);

  return (
    <div className="analytics-page">
      {/* Revenue Cards */}
      <div className="analytics-cards">
  <div className="analytics-card">
    <p className="analytics-card-label">Today's Revenue</p>
    <h3 className="analytics-card-value">{formatCurrency(overview.revenue.today)}</h3>
    <div className="analytics-card-icon">
      <CalendarIcon size={32} />
    </div>
  </div>
  <div className="analytics-card">
    <p className="analytics-card-label">This Week</p>
    <h3 className="analytics-card-value">{formatCurrency(overview.revenue.week)}</h3>
    <div className="analytics-card-icon">
      <BarChartIcon size={32} />
    </div>
  </div>
  <div className="analytics-card">
    <p className="analytics-card-label">This Month</p>
    <h3 className="analytics-card-value">{formatCurrency(overview.revenue.month)}</h3>
    <div className="analytics-card-icon">
      <TrendingUpIcon size={32} />
    </div>
  </div>
  <div className="analytics-card highlight">
    <p className="analytics-card-label">Total Revenue</p>
    <h3 className="analytics-card-value">{formatCurrency(overview.revenue.total)}</h3>
    <div className="analytics-card-icon">
      <WalletIcon size={32} />
    </div>
  </div>
</div>
      {/* Quick Stats */}
      <div className="analytics-stats-row">
        <div className="analytics-stat">
          <span className="analytics-stat-value">{overview.counts.orders}</span>
          <span className="analytics-stat-label">Total Orders</span>
        </div>
        <div className="analytics-stat">
          <span className="analytics-stat-value">{overview.counts.products}</span>
          <span className="analytics-stat-label">Products</span>
        </div>
        <div className="analytics-stat">
          <span className="analytics-stat-value">{overview.counts.customers}</span>
          <span className="analytics-stat-label">Customers</span>
        </div>
        <div className="analytics-stat">
          <span className="analytics-stat-value">{overview.counts.reviews}</span>
          <span className="analytics-stat-label">Reviews</span>
        </div>
      </div>

      {/* Sales Trend */}
      <div className="analytics-chart-wide">
        <h3>
  <span className="chart-icon">
    <TrendingUpIcon size={20} />
  </span>
  Sales Trend (Last 30 Days)
</h3>
        {salesChartData ? (
          <div className="chart-wrap">
            <Line
              data={salesChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (ctx) => formatCurrency(ctx.parsed.y),
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (v) => "Rs. " + (v / 1000).toFixed(0) + "k",
                    },
                    grid: { color: "rgba(200, 160, 75, 0.1)" },
                  },
                  x: {
                    grid: { display: false },
                    ticks: { maxTicksLimit: 10 },
                  },
                },
              }}
            />
          </div>
        ) : (
          <p className="muted">No sales data yet</p>
        )}
      </div>

      {/* Two Column Charts */}
      <div className="analytics-grid-2">
        {/* Category */}
        <div className="analytics-chart">
          <h3>
  <span className="chart-icon">
    <FolderIcon size={20} />
  </span>
  Category Performance
</h3>
          {categoryChartData ? (
            <div className="chart-wrap chart-doughnut">
              <Doughnut
                data={categoryChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: { padding: 16, font: { size: 11 } },
                    },
                    tooltip: {
                      callbacks: {
                        label: (ctx) =>
                          `${ctx.label}: ${formatCurrency(ctx.parsed)}`,
                      },
                    },
                  },
                }}
              />
            </div>
          ) : (
            <p className="muted">No category data</p>
          )}
        </div>

        {/* Order Status */}
        <div className="analytics-chart">
          <h3>
  <span className="chart-icon">
    <PackageIcon size={20} />
  </span>
  Order Status Breakdown
</h3>
          <div className="status-bars">
            {statusData.map((s) => (
              <div className="status-row" key={s.label}>
                <div className="status-row-top">
                  <span className="status-label">{s.label}</span>
                  <span className="status-value">{s.value}</span>
                </div>
                <div className="status-bar-bg">
                  <div
                    className="status-bar-fill"
                    style={{
                      width: `${(s.value / maxStatus) * 100}%`,
                      background: s.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="analytics-chart-wide">
        <h3>
  <span className="chart-icon">
    <FlameIcon size={20} />
  </span>
  Top Selling Products
</h3>
        {topProductsChartData ? (
          <div className="chart-wrap chart-bar">
            <Bar
              data={topProductsChartData}
              options={{
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (ctx) => `${ctx.parsed.x} units sold`,
                    },
                  },
                },
                scales: {
                  x: {
                    beginAtZero: true,
                    grid: { color: "rgba(200, 160, 75, 0.1)" },
                  },
                  y: {
                    grid: { display: false },
                    ticks: { font: { size: 11 } },
                  },
                },
              }}
            />
          </div>
        ) : (
          <p className="muted">No products sold yet</p>
        )}
      </div>
    </div>
  );
}

export default AdminAnalyticsPage;