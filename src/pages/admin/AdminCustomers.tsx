import { useEffect, useState } from 'react';
import { admin, Customer } from '@/lib/api';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Users, Search, Mail } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  const load = async () => {
    setLoading(true);
    try {
      const data = await admin.customers({ page, search: search || undefined });
      setCustomers(data.customers);
      setTotal(data.total);
    } catch { toast.error('Failed to load customers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Customers</h1>
        <p className="text-stone-500 text-sm">{total} registered customers</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input className="pl-9" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button type="submit" variant="outline">Search</Button>
      </form>

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
                  <th className="text-left px-4 py-3 font-medium text-stone-600">Customer</th>
                  <th className="text-left px-4 py-3 font-medium text-stone-600">Phone</th>
                  <th className="text-center px-4 py-3 font-medium text-stone-600">Orders</th>
                  <th className="text-right px-4 py-3 font-medium text-stone-600">Total Spent</th>
                  <th className="text-left px-4 py-3 font-medium text-stone-600">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-stone-900">{c.name}</p>
                          <p className="text-xs text-stone-400 flex items-center gap-1">
                            <Mail className="w-3 h-3" />{c.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-stone-600">{c.phone || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-medium ${c.order_count > 0 ? 'text-stone-900' : 'text-stone-400'}`}>
                        {c.order_count}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-stone-900">
                      ${c.total_spent.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-stone-500 text-xs">
                      {format(new Date(c.created_at), 'MMM d, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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
    </div>
  );
}
