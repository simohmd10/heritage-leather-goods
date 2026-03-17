import { useEffect, useState, useCallback } from 'react';
import { admin, Customer } from '@/lib/api';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, Mail, Phone, ShoppingBag, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

type SortOption = 'newest' | 'orders' | 'spent';

const SORT_LABELS: Record<SortOption, string> = {
  newest: 'Newest First',
  orders: 'Most Orders',
  spent:  'Most Spent',
};

const LIMIT = 20;

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [sortBy, setSortBy]       = useState<SortOption>('newest');
  const [page, setPage]           = useState(1);

  const load = useCallback(async (searchVal = search, pageVal = page, sortVal = sortBy) => {
    setLoading(true);
    try {
      const data = await admin.customers({ page: pageVal, search: searchVal || undefined, sortBy: sortVal });
      setCustomers(data.customers);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [search, page, sortBy]);

  useEffect(() => { load(); }, [page, sortBy]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); load(search, 1, sortBy); }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const totalPages = Math.ceil(total / LIMIT);

  // Summary stats
  const totalRevenue   = customers.reduce((s, c) => s + c.total_spent, 0);
  const totalOrdersAll = customers.reduce((s, c) => s + c.order_count, 0);
  const avgOrderValue  = totalOrdersAll > 0 ? totalRevenue / totalOrdersAll : 0;

  return (
    <div className="space-y-5">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Customers</h1>
          <p className="text-stone-500 text-sm">{total} registered customers</p>
        </div>
        {/* Quick stats */}
        <div className="flex gap-4 text-sm text-right">
          <div>
            <p className="text-stone-400 text-xs">Page Revenue</p>
            <p className="font-semibold text-stone-900">${totalRevenue.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-stone-400 text-xs">Avg Order Value</p>
            <p className="font-semibold text-stone-900">${avgOrderValue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            className="pl-9"
            placeholder="Search by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={sortBy} onValueChange={v => { setSortBy(v as SortOption); setPage(1); }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(SORT_LABELS) as SortOption[]).map(k => (
              <SelectItem key={k} value={k}>{SORT_LABELS[k]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-stone-400">Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-400">No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50">
                  <th className="text-left px-4 py-3 font-semibold text-stone-600">Customer</th>
                  <th className="text-left px-4 py-3 font-semibold text-stone-600 hidden md:table-cell">Contact</th>
                  <th className="text-center px-4 py-3 font-semibold text-stone-600">Orders</th>
                  <th className="text-right px-4 py-3 font-semibold text-stone-600">Total Spent</th>
                  <th className="text-right px-4 py-3 font-semibold text-stone-600 hidden lg:table-cell">Avg. Order</th>
                  <th className="text-left px-4 py-3 font-semibold text-stone-600 hidden xl:table-cell">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {customers.map((c, i) => {
                  const avgOrder = c.order_count > 0 ? c.total_spent / c.order_count : 0;
                  const isTopCustomer = sortBy === 'spent' && i < 3 && c.total_spent > 0;
                  return (
                    <tr key={c.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                            isTopCustomer ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-600'
                          }`}>
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-stone-900 truncate flex items-center gap-1.5">
                              {c.name}
                              {isTopCustomer && (
                                <TrendingUp className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              )}
                            </p>
                            {/* Mobile contact info */}
                            <p className="text-xs text-stone-400 truncate flex items-center gap-1 md:hidden">
                              <Mail className="w-3 h-3 shrink-0" />
                              {c.email || '—'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="space-y-0.5">
                          {c.email && (
                            <p className="text-stone-600 text-xs flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              <span className="truncate max-w-48">{c.email}</span>
                            </p>
                          )}
                          {c.phone && (
                            <p className="text-stone-500 text-xs flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              {c.phone}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 font-semibold px-2.5 py-0.5 rounded-full text-xs ${
                          c.order_count === 0 ? 'text-stone-400 bg-stone-100' :
                          c.order_count >= 5  ? 'text-emerald-700 bg-emerald-100' :
                          'text-stone-700 bg-stone-100'
                        }`}>
                          <ShoppingBag className="w-3 h-3" />
                          {c.order_count}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-bold ${c.total_spent >= 500 ? 'text-amber-700' : 'text-stone-900'}`}>
                          ${c.total_spent.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-stone-500 hidden lg:table-cell">
                        {c.order_count > 0 ? `$${avgOrder.toFixed(2)}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-stone-400 text-xs hidden xl:table-cell">
                        {format(new Date(c.created_at), 'MMM d, yyyy')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-4 py-3 border-t border-stone-100 bg-stone-50">
            <p className="text-sm text-stone-500">
              Page {page} of {totalPages} · {total} customers
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setPage(p => p - 1)} disabled={page === 1}>Previous</Button>
              <Button size="sm" variant="outline" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
