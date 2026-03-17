import { useEffect, useState } from 'react';
import { admin, Order } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

const STATUSES = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  shipped: 'bg-purple-100 text-purple-800 border-purple-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const LIMIT = 15;

  const load = async () => {
    setLoading(true);
    try {
      const data = await admin.orders({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page, limit: LIMIT
      });
      setOrders(data.orders);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter, page]);

  const handleUpdateStatus = async (orderId: number, status: string) => {
    try {
      const updated = await admin.updateOrder(orderId, { status });
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      if (selectedOrder?.id === orderId) setSelectedOrder(updated);
      toast.success('Order status updated');
    } catch {
      toast.error('Failed to update order');
    }
  };

  const filtered = orders.filter(o =>
    !search ||
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    (o.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.guest_email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Orders</h1>
          <p className="text-stone-500 text-sm">{total} total orders</p>
        </div>
        <Button variant="outline" onClick={load} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            className="pl-9"
            placeholder="Search orders..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                statusFilter === s
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-stone-400">Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-stone-400">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50">
                  <th className="text-left px-4 py-3 font-medium text-stone-600">Order</th>
                  <th className="text-left px-4 py-3 font-medium text-stone-600">Customer</th>
                  <th className="text-left px-4 py-3 font-medium text-stone-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-stone-600">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-stone-600">Total</th>
                  <th className="text-center px-4 py-3 font-medium text-stone-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map(order => (
                  <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-stone-900">{order.order_number}</td>
                    <td className="px-4 py-3 text-stone-600">
                      {order.customer_name || order.guest_name || order.guest_email || 'Guest'}
                    </td>
                    <td className="px-4 py-3 text-stone-500">
                      {format(new Date(order.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={order.status}
                        onValueChange={v => handleUpdateStatus(order.id, v)}
                      >
                        <SelectTrigger className={`w-36 h-7 text-xs border ${STATUS_COLORS[order.status] || ''}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.filter(s => s !== 'all').map(s => (
                            <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">${order.total.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <Button size="sm" variant="ghost" onClick={() => setSelectedOrder(order)}>
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
        {total > LIMIT && (
          <div className="flex justify-between items-center px-4 py-3 border-t border-stone-100">
            <p className="text-sm text-stone-500">Page {page} of {Math.ceil(total / LIMIT)}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setPage(p => p - 1)} disabled={page === 1}>Previous</Button>
              <Button size="sm" variant="outline" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / LIMIT)}>Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Order {selectedOrder.order_number}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-stone-500">Customer</p>
                  <p className="font-medium">{selectedOrder.customer_name || selectedOrder.guest_name || selectedOrder.guest_email || 'Guest'}</p>
                </div>
                <div><p className="text-stone-500">Date</p>
                  <p className="font-medium">{format(new Date(selectedOrder.created_at), 'MMM d, yyyy')}</p>
                </div>
                <div><p className="text-stone-500">Status</p>
                  <span className={`inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[selectedOrder.status] || 'bg-stone-100'}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div><p className="text-stone-500">Payment</p>
                  <p className="font-medium capitalize">{selectedOrder.payment_status}</p>
                </div>
              </div>

              <div className="border-t pt-3">
                <p className="font-medium mb-2">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map(item => (
                    <div key={item.id} className="flex justify-between">
                      <span>
                        {item.product_name} × {item.quantity}
                        {item.engraving && <span className="text-stone-400"> — "{item.engraving}"</span>}
                      </span>
                      <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-3 space-y-1">
                <div className="flex justify-between text-stone-500">
                  <span>Subtotal</span><span>${selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Shipping</span>
                  <span>{selectedOrder.shipping === 0 ? 'Free' : `$${selectedOrder.shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Tax</span><span>${selectedOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-stone-900 pt-1 border-t">
                  <span>Total</span><span>${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {selectedOrder.shipping_address && (
                <div className="border-t pt-3">
                  <p className="font-medium mb-1">Shipping Address</p>
                  <p className="text-stone-600">
                    {selectedOrder.shipping_address.firstName} {selectedOrder.shipping_address.lastName}<br />
                    {selectedOrder.shipping_address.address}<br />
                    {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.zip}<br />
                    {selectedOrder.shipping_address.country}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
