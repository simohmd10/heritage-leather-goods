import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { admin, Order, exportOrdersToCSV } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, RefreshCw, Download, Phone, MapPin, Calendar, X } from 'lucide-react';
import { format } from 'date-fns';

const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;
const FILTER_STATUSES = ['all', ...ORDER_STATUSES];

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed:  'bg-blue-100 text-blue-800 border-blue-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  shipped:    'bg-purple-100 text-purple-800 border-purple-200',
  delivered:  'bg-green-100 text-green-800 border-green-200',
  cancelled:  'bg-red-100 text-red-800 border-red-200',
};

const STATUS_LABELS: Record<string, string> = {
  pending:   'Pending',
  confirmed: 'Confirmed',
  shipped:   'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const LIMIT = 15;

export default function AdminOrders() {
  const location = useLocation();

  const [orders, setOrders]               = useState<Order[]>([]);
  const [total, setTotal]                 = useState(0);
  const [loading, setLoading]             = useState(true);
  const [statusFilter, setStatusFilter]   = useState(() => new URLSearchParams(location.search).get('status') ?? 'all');
  const [search, setSearch]               = useState('');
  const [dateFrom, setDateFrom]           = useState('');
  const [dateTo, setDateTo]               = useState('');
  const [page, setPage]                   = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [exporting, setExporting]         = useState(false);

  // ── Sync status filter when URL changes (e.g. bell click while already on this page)
  useEffect(() => {
    const urlStatus = new URLSearchParams(location.search).get('status') ?? 'all';
    setStatusFilter(prev => {
      if (prev !== urlStatus) {
        setPage(1);
        return urlStatus;
      }
      return prev;
    });
  }, [location.search]);

  const load = async (overrideSearch?: string) => {
    setLoading(true);
    try {
      const data = await admin.orders({
        status:   statusFilter !== 'all' ? statusFilter : undefined,
        dateFrom: dateFrom || undefined,
        dateTo:   dateTo   || undefined,
        search:   (overrideSearch ?? search) || undefined,
        page,
        limit: LIMIT,
      });
      setOrders(data.orders);
      setTotal(data.total);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter, page, dateFrom, dateTo]);

  const handleUpdateStatus = async (orderId: number, status: string) => {
    try {
      const updated = await admin.updateOrder(orderId, { status });
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      if (selectedOrder?.id === orderId) setSelectedOrder(updated);
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      // Fetch all orders matching current filters for CSV (no pagination)
      const allPages: Order[] = [];
      let p = 1;
      while (true) {
        const data = await admin.orders({
          status:   statusFilter !== 'all' ? statusFilter : undefined,
          dateFrom: dateFrom || undefined,
          dateTo:   dateTo   || undefined,
          page: p,
          limit: 100,
        });
        allPages.push(...data.orders);
        if (allPages.length >= data.total || data.orders.length === 0) break;
        p++;
      }
      exportOrdersToCSV(allPages);
      toast.success(`Exported ${allPages.length} orders to CSV`);
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  // Debounced search — triggers server-side reload
  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); load(search); }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const clearFilters = () => {
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    setSearch('');
    setPage(1);
  };

  const hasActiveFilters = statusFilter !== 'all' || dateFrom || dateTo || search;

  // Results come from server — phone search still done client-side (not in DB query)
  const filtered = search
    ? orders.filter(o => {
        const q = search.toLowerCase();
        return (
          o.order_number.toLowerCase().includes(q) ||
          (o.customer_name ?? '').toLowerCase().includes(q) ||
          (o.guest_name   ?? '').toLowerCase().includes(q) ||
          (o.guest_email  ?? '').toLowerCase().includes(q) ||
          (o.shipping_address?.phone ?? '').includes(q)
        );
      })
    : orders;

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-5">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Orders</h1>
          <p className="text-stone-500 text-sm">{total} total orders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setPage(1); load(search); }} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={exporting} className="gap-2">
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-3">
        {/* Search + Date range */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <Input
              className="pl-9"
              placeholder="Search by name, order #, phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-stone-400 shrink-0" />
            <Input
              type="date"
              value={dateFrom}
              onChange={e => { setDateFrom(e.target.value); setPage(1); }}
              className="w-36 text-sm"
            />
            <span className="text-stone-400 text-sm">to</span>
            <Input
              type="date"
              value={dateTo}
              onChange={e => { setDateTo(e.target.value); setPage(1); }}
              className="w-36 text-sm"
            />
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} className="gap-1.5 text-stone-500">
              <X className="w-3.5 h-3.5" />
              Clear
            </Button>
          )}
        </div>

        {/* Status tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {FILTER_STATUSES.map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-all font-medium ${
                statusFilter === s
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
              }`}
            >
              {s === 'all' ? 'All Orders' : STATUS_LABELS[s] ?? s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-stone-400">Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <ShoppingCartEmpty />
            <p className="mt-3 text-sm">No orders found</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="mt-2 text-amber-600 text-sm underline">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50">
                  <th className="text-left px-4 py-3 font-semibold text-stone-600">Order</th>
                  <th className="text-left px-4 py-3 font-semibold text-stone-600">Customer</th>
                  <th className="text-left px-4 py-3 font-semibold text-stone-600 hidden md:table-cell">City</th>
                  <th className="text-left px-4 py-3 font-semibold text-stone-600 hidden lg:table-cell">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-stone-600">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-stone-600">Total</th>
                  <th className="text-center px-4 py-3 font-semibold text-stone-600">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map(order => (
                  <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-stone-900">{order.order_number}</p>
                      <p className="text-xs text-stone-400 lg:hidden">{format(new Date(order.created_at), 'MMM d, yyyy')}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-stone-900 font-medium">
                        {order.customer_name || order.guest_name || order.guest_email || 'Guest'}
                      </p>
                      {order.shipping_address?.phone && (
                        <p className="text-xs text-stone-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {order.shipping_address.phone}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-stone-500 hidden md:table-cell">
                      {order.shipping_address?.city || '—'}
                    </td>
                    <td className="px-4 py-3 text-stone-500 hidden lg:table-cell">
                      {format(new Date(order.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <Select value={order.status} onValueChange={v => handleUpdateStatus(order.id, v)}>
                        <SelectTrigger className={`w-32 h-7 text-xs border font-medium ${STATUS_COLORS[order.status] || ''}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ORDER_STATUSES.map(s => (
                            <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-stone-900">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button size="sm" variant="ghost" onClick={() => setSelectedOrder(order)} className="h-7 w-7 p-0">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-4 py-3 border-t border-stone-100 bg-stone-50">
            <p className="text-sm text-stone-500">
              Page {page} of {totalPages} · {total} orders
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setPage(1)} disabled={page === 1}>First</Button>
              <Button size="sm" variant="outline" onClick={() => setPage(p => p - 1)} disabled={page === 1}>Prev</Button>
              <Button size="sm" variant="outline" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>Next</Button>
              <Button size="sm" variant="outline" onClick={() => setPage(totalPages)} disabled={page >= totalPages}>Last</Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Order Detail Modal ───────────────────────────────────────────────── */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{selectedOrder.order_number}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_COLORS[selectedOrder.status] || 'bg-stone-100'}`}>
                  {STATUS_LABELS[selectedOrder.status] ?? selectedOrder.status}
                </span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-sm">
              {/* Customer info */}
              <div className="grid grid-cols-2 gap-3 bg-stone-50 rounded-lg p-3">
                <div>
                  <p className="text-stone-500 text-xs mb-0.5">Customer</p>
                  <p className="font-medium">{selectedOrder.customer_name || selectedOrder.guest_name || selectedOrder.guest_email || 'Guest'}</p>
                </div>
                <div>
                  <p className="text-stone-500 text-xs mb-0.5">Date</p>
                  <p className="font-medium">{format(new Date(selectedOrder.created_at), 'MMM d, yyyy HH:mm')}</p>
                </div>
                {selectedOrder.shipping_address?.phone && (
                  <div>
                    <p className="text-stone-500 text-xs mb-0.5">Phone</p>
                    <p className="font-medium flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      {selectedOrder.shipping_address.phone}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-stone-500 text-xs mb-0.5">Payment</p>
                  <p className="font-medium capitalize">{selectedOrder.payment_status}</p>
                </div>
              </div>

              {/* Shipping address */}
              {selectedOrder.shipping_address && (
                <div className="border rounded-lg p-3">
                  <p className="font-semibold mb-2 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-stone-400" />
                    Shipping Address
                  </p>
                  <p className="text-stone-600 leading-relaxed">
                    {selectedOrder.shipping_address.firstName} {selectedOrder.shipping_address.lastName}<br />
                    {selectedOrder.shipping_address.address}<br />
                    {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.zip}<br />
                    {selectedOrder.shipping_address.country}
                  </p>
                </div>
              )}

              {/* Items */}
              <div className="border rounded-lg overflow-hidden">
                <p className="font-semibold px-3 py-2 bg-stone-50 border-b">
                  Items ({selectedOrder.items?.length ?? 0})
                </p>
                <div className="divide-y">
                  {selectedOrder.items?.map(item => (
                    <div key={item.id} className="flex justify-between items-start px-3 py-2.5">
                      <div>
                        <p className="font-medium text-stone-900">{item.product_name}</p>
                        <p className="text-xs text-stone-400">
                          ${item.price.toFixed(2)} × {item.quantity}
                          {item.engraving && <span className="ml-1 italic">· "{item.engraving}"</span>}
                        </p>
                      </div>
                      <span className="font-semibold text-stone-900">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-stone-50 rounded-lg p-3 space-y-1.5">
                <div className="flex justify-between text-stone-500">
                  <span>Subtotal</span><span>${selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Shipping</span>
                  <span>{selectedOrder.shipping === 0 ? <Badge variant="outline" className="text-green-600 border-green-200">Free</Badge> : `$${selectedOrder.shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Tax</span><span>${selectedOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-stone-900 pt-1.5 border-t text-base">
                  <span>Total</span><span>${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Update status */}
              <div>
                <p className="text-stone-500 text-xs mb-1.5">Update Status</p>
                <Select value={selectedOrder.status} onValueChange={v => handleUpdateStatus(selectedOrder.id, v)}>
                  <SelectTrigger className={`border font-medium ${STATUS_COLORS[selectedOrder.status] || ''}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map(s => (
                      <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function ShoppingCartEmpty() {
  return (
    <svg className="w-12 h-12 mx-auto text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2 5h12M9 21a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z" />
    </svg>
  );
}
