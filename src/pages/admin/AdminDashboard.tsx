import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { admin, AdminStats, Order } from '@/lib/api';
import { toast } from 'sonner';
import {
  DollarSign, ShoppingCart, Package, Users,
  AlertTriangle, Clock, TrendingUp, ArrowRight,
  CalendarDays, Zap, BarChart2, Bell
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { format } from 'date-fns';

// ── Status colours ────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-800',
  confirmed:  'bg-blue-100 text-blue-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped:    'bg-purple-100 text-purple-800',
  delivered:  'bg-green-100 text-green-800',
  cancelled:  'bg-red-100 text-red-800',
};

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  title, value, icon: Icon, colorClass, sub, highlight = false,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-5 transition-shadow hover:shadow-md ${highlight ? 'bg-stone-900 border-stone-700' : 'bg-white border-stone-200'}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm ${highlight ? 'text-stone-400' : 'text-stone-500'}`}>{title}</p>
          <p className={`text-2xl font-bold mt-1 ${highlight ? 'text-white' : 'text-stone-900'}`}>{value}</p>
          {sub && <p className={`text-xs mt-0.5 ${highlight ? 'text-stone-500' : 'text-stone-400'}`}>{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

// ── Custom chart tooltip ──────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-stone-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium text-stone-700 mb-1">{label}</p>
      <p className="text-emerald-600 font-bold">${payload[0]?.value?.toFixed(2)}</p>
      {payload[1] && (
        <p className="text-stone-500">{payload[1].value} order{payload[1].value !== 1 ? 's' : ''}</p>
      )}
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-stone-200 rounded ${className}`} />;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [data, setData]       = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState<7 | 30>(30);

  useEffect(() => {
    admin.stats()
      .then(setData)
      .catch(() => toast.error('Failed to load dashboard stats'))
      .finally(() => setLoading(false));
  }, []);

  // Slice chart data based on selected period
  const chartData = useMemo(() => {
    if (!data) return [];
    return data.revenueByDay.slice(-chartPeriod);
  }, [data, chartPeriod]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (!data) return null;
  const { stats, topProducts, recentOrders } = data;

  const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>
          <p className="text-stone-500 text-sm mt-0.5">
            {format(new Date(), 'EEEE, MMMM d, yyyy')} — Welcome back!
          </p>
        </div>
        {stats.pendingOrders > 0 && (
          <Link
            to="/admin/orders?status=pending"
            className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-2 rounded-lg hover:bg-amber-100 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {stats.pendingOrders} pending order{stats.pendingOrders !== 1 ? 's' : ''} — Review now
          </Link>
        )}
      </div>

      {/* ── Main stats (4 cards) ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={fmt(stats.totalRevenue)}
          icon={DollarSign}
          colorClass="bg-emerald-100 text-emerald-700"
          highlight
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingCart}
          colorClass="bg-blue-100 text-blue-700"
          sub={stats.pendingOrders > 0 ? `${stats.pendingOrders} pending` : 'All processed'}
        />
        <StatCard
          title="Products"
          value={stats.totalProducts}
          icon={Package}
          colorClass="bg-purple-100 text-purple-700"
          sub={stats.lowStockProducts > 0 ? `${stats.lowStockProducts} low stock` : 'All in stock'}
        />
        <StatCard
          title="Customers"
          value={stats.totalCustomers}
          icon={Users}
          colorClass="bg-orange-100 text-orange-700"
        />
      </div>

      {/* ── Period revenue (Today / This Week / This Month) ────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3">Revenue Breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Revenue Today"
            value={fmt(stats.revenueToday)}
            icon={Zap}
            colorClass="bg-emerald-100 text-emerald-700"
            sub={`${stats.ordersToday} order${stats.ordersToday !== 1 ? 's' : ''} today`}
          />
          <StatCard
            title="Revenue This Week"
            value={fmt(stats.revenueThisWeek)}
            icon={TrendingUp}
            colorClass="bg-blue-100 text-blue-700"
            sub={`${stats.ordersThisWeek} order${stats.ordersThisWeek !== 1 ? 's' : ''} this week`}
          />
          <StatCard
            title="Revenue This Month"
            value={fmt(stats.revenueThisMonth)}
            icon={CalendarDays}
            colorClass="bg-violet-100 text-violet-700"
            sub={format(new Date(), 'MMMM yyyy')}
          />
        </div>
      </div>

      {/* ── Alert cards ───────────────────────────────────────────────────── */}
      {(stats.pendingOrders > 0 || stats.lowStockProducts > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats.pendingOrders > 0 && (
            <StatCard
              title="Pending Orders"
              value={stats.pendingOrders}
              icon={Clock}
              colorClass="bg-yellow-100 text-yellow-700"
              sub="Awaiting action"
            />
          )}
          {stats.lowStockProducts > 0 && (
            <StatCard
              title="Low Stock Alert"
              value={stats.lowStockProducts}
              icon={AlertTriangle}
              colorClass="bg-red-100 text-red-700"
              sub="Products ≤ 5 units"
            />
          )}
        </div>
      )}

      {/* ── Revenue chart ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-amber-600" />
            <h2 className="font-semibold text-stone-900">Revenue Chart</h2>
          </div>
          <div className="flex gap-1.5 bg-stone-100 p-1 rounded-lg">
            {([7, 30] as const).map(p => (
              <button
                key={p}
                onClick={() => setChartPeriod(p)}
                className={`px-3 py-1 text-sm rounded-md font-medium transition-all ${
                  chartPeriod === p
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                {p === 7 ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>
        </div>
        {chartData.every(d => d.revenue === 0) ? (
          <div className="h-64 flex items-center justify-center text-stone-400 text-sm">
            No revenue data for this period
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#d97706" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#78716c' }}
                  interval={chartPeriod === 30 ? 4 : 0}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#78716c' }}
                  tickFormatter={v => `$${v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}`}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#d97706"
                  strokeWidth={2.5}
                  fill="url(#gradRevenue)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#d97706' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ── Recent orders + Top products ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
            <h2 className="font-semibold text-stone-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1 font-medium">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-stone-100">
            {recentOrders.length === 0 ? (
              <p className="text-center text-stone-400 py-10 text-sm">No orders yet</p>
            ) : recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between px-5 py-3 hover:bg-stone-50 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-stone-900 truncate">{order.order_number}</p>
                  <p className="text-xs text-stone-400 truncate">
                    {order.customer_name || order.guest_name || order.guest_email || 'Guest'}
                    {' · '}
                    {format(new Date(order.created_at), 'MMM d')}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status] || 'bg-stone-100 text-stone-600'}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <span className="text-sm font-semibold text-stone-900">{fmt(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
            <h2 className="font-semibold text-stone-900">Top Products</h2>
            <Link to="/admin/products" className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1 font-medium">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-stone-100">
            {topProducts.length === 0 ? (
              <p className="text-center text-stone-400 py-10 text-sm">No sales data yet</p>
            ) : topProducts.map((p, i) => (
              <div key={p.product_slug} className="flex items-center justify-between px-5 py-3 hover:bg-stone-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    i === 0 ? 'bg-amber-100 text-amber-700' :
                    i === 1 ? 'bg-stone-200 text-stone-600' :
                    i === 2 ? 'bg-orange-100 text-orange-600' :
                    'bg-stone-100 text-stone-500'
                  }`}>
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-900 truncate">{p.product_name}</p>
                    <p className="text-xs text-stone-400">{p.units_sold} units sold</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-stone-900 shrink-0 ml-2">{fmt(p.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
