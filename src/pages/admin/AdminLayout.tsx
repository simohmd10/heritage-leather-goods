import { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { admin } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  MessageSquare, LogOut, Store, Menu, X, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminLayout() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [user, loading, navigate, location]);

  // Fetch pending orders count for badge
  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const load = () => admin.pendingCount().then(setPendingCount).catch(() => {});
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, [user]);

  if (loading || !user || user.role !== 'admin') return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const NAV_ITEMS = [
    { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Products',  to: '/admin/products',  icon: Package },
    { label: 'Orders',    to: '/admin/orders',    icon: ShoppingCart, badge: pendingCount },
    { label: 'Customers', to: '/admin/customers', icon: Users },
    { label: 'Messages',  to: '/admin/messages',  icon: MessageSquare },
  ];

  const isActive = (item: typeof NAV_ITEMS[0]) =>
    item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-stone-900 text-white flex flex-col transition-transform duration-200',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className="p-6 border-b border-stone-700">
          <Link to="/" className="flex items-center gap-2">
            <Store className="w-6 h-6 text-amber-400" />
            <span className="font-playfair text-lg font-bold tracking-wide">Heritage Admin</span>
          </Link>
          <p className="text-xs text-stone-500 mt-1">Management Console</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive(item)
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-400 hover:bg-stone-800 hover:text-white'
              )}
            >
              <span className="flex items-center gap-3">
                <item.icon className="w-5 h-5 shrink-0" />
                {item.label}
              </span>
              {(item.badge ?? 0) > 0 && (
                <span className="min-w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1 font-bold">
                  {item.badge! > 99 ? '99+' : item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Pending alert */}
        {pendingCount > 0 && (
          <div className="mx-3 mb-3 p-3 bg-amber-600/20 border border-amber-600/30 rounded-lg">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-medium">
              <Bell className="w-3.5 h-3.5" />
              {pendingCount} order{pendingCount !== 1 ? 's' : ''} awaiting action
            </div>
          </div>
        )}

        {/* User info */}
        <div className="p-4 border-t border-stone-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-amber-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-stone-400 truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/" className="flex-1 text-center text-xs text-stone-400 hover:text-white py-1.5 rounded-md hover:bg-stone-800 transition-colors">
              View Store
            </Link>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs text-stone-400 hover:text-white py-1.5 rounded-md hover:bg-stone-800 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="flex-1 lg:pl-64 min-w-0">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between lg:hidden">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 rounded-md hover:bg-stone-100">
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <span className="font-playfair font-bold text-stone-900">Heritage Admin</span>
          <Link
            to="/admin/orders?status=pending"
            className="relative p-1.5 rounded-md hover:bg-stone-100 transition-colors"
            title={pendingCount > 0 ? `${pendingCount} pending orders` : 'Orders'}
          >
            <Bell className={`w-5 h-5 ${pendingCount > 0 ? 'text-amber-600' : 'text-stone-400'}`} />
            {pendingCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none">
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            )}
          </Link>
        </div>

        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
