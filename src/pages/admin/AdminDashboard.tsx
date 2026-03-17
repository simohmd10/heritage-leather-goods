import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { admin, AdminStats, Order } from '@/lib/api';
import { toast } from 'sonner';
import {
  DollarSign, ShoppingCart, Package, Users,
  AlertTriangle, Clock, TrendingUp, ArrowRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

function StatCard({ title, value, icon: Icon, color, sub }: {
  title: string; value: string | number; icon: React.ElementType;
  color: string; sub?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-stone-500">{title}</p>
          <p className="text-2xl font-bold text-stone-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    admin.stats()
      .then(setData)
      .catch(() => toast.error('Failed to load dashboard stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-stone-400">
        Loading dashboard...
      </div>
    );
  }

  if (!data) return null;
  const { stats, revenueByMonth, topProducts, recentOrders } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>
        <p className="text-stone-500 text-sm mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="bg-green-100 text-green-700"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingCart}
          color="bg-blue-100 text-blue-700"
          sub={`${stats.pendingOrders} pending`}
        />
        <StatCard
          title="Products"
          value={stats.totalProducts}
          icon={Package}
          color="bg-purple-100 text-purple-700"
          sub={stats.lowStockProducts > 0 ? `${stats.lowStockProducts} low stock` : 'All in stock'}
        />
        <StatCard
          title="Customers"
          value={stats.totalCustomers}
          icon={Users}
          color="bg-orange-100 text-orange-700"
        />
        {stats.pendingOrders > 0 && (
          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders}
            icon={Clock}
            color="bg-yellow-100 text-yellow-700"
            sub="Awaiting processing"
          />
        )}
        {stats.lowStockProducts > 0 && (
          <StatCard
            title="Low Stock"
            value={stats.lowStockProducts}
            icon={AlertTriangle}
            color="bg-red-100 text-red-700"
            sub="Need restocking"
          />
        )}
      </div>

      {/* Revenue chart */}
      {revenueByMonth.length > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-stone-900">Revenue (Last 6 months)</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueByMonth}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5A4433" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#5A4433" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${v}`} />
                <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, 'Revenue']} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#5A4433"
                  strokeWidth={2}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-stone-100">
            <h2 className="font-semibold text-stone-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-stone-100">
            {recentOrders.length === 0 ? (
              <p className="text-center text-stone-400 py-8 text-sm">No orders yet</p>
            ) : recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-stone-900">{order.order_number}</p>
                  <p className="text-xs text-stone-400">
                    {order.customer_name || order.guest_name || order.guest_email || 'Guest'}
                    {' · '}
                    {format(new Date(order.created_at), 'MMM d')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] || 'bg-stone-100 text-stone-600'}`}>
                    {order.status}
                  </span>
                  <span className="text-sm font-medium">${order.total.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-stone-100">
            <h2 className="font-semibold text-stone-900">Top Products</h2>
            <Link to="/admin/products" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-stone-100">
            {topProducts.length === 0 ? (
              <p className="text-center text-stone-400 py-8 text-sm">No sales data yet</p>
            ) : topProducts.map((p, i) => (
              <div key={p.product_slug} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-stone-100 rounded-full flex items-center justify-center text-xs text-stone-500 font-medium">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-stone-900">{p.product_name}</p>
                    <p className="text-xs text-stone-400">{p.units_sold} units sold</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-stone-900">${p.revenue.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
