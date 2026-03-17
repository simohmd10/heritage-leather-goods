import { useEffect, useState, useMemo } from 'react';
import { admin, Product } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Search, Package, Star, TrendingUp, AlertTriangle } from 'lucide-react';

const CATEGORIES = ['wallets', 'bags', 'belts', 'accessories'] as const;

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All',
  wallets: 'Wallets',
  bags: 'Bags',
  belts: 'Belts',
  accessories: 'Accessories',
};

const EMPTY_FORM = {
  slug: '', name: '', description: '', price: '', category: 'wallets',
  stock_count: '100', featured: false, bestseller: false, personalizable: false,
  images: ''
};

export default function AdminProducts() {
  const [products, setProducts]           = useState<Product[]>([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dialogOpen, setDialogOpen]       = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId]           = useState<number | null>(null);
  const [form, setForm]                   = useState(EMPTY_FORM);
  const [saving, setSaving]               = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setProducts(await admin.products());
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => products.filter(p => {
    const matchesSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }), [products, search, categoryFilter]);

  // Category counts
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: products.length };
    for (const cat of CATEGORIES) c[cat] = products.filter(p => p.category === cat).length;
    return c;
  }, [products]);

  const openCreate = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({
      slug: p.slug, name: p.name, description: p.description || '',
      price: String(p.price), category: p.category,
      stock_count: String(p.stock_count),
      featured: p.featured, bestseller: p.bestseller, personalizable: p.personalizable,
      images: p.images.join('\n')
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.slug || !form.name || !form.price || !form.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        slug: form.slug.toLowerCase().replace(/\s+/g, '-'),
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        category: form.category,
        stock_count: parseInt(form.stock_count) || 100,
        featured: form.featured,
        bestseller: form.bestseller,
        personalizable: form.personalizable,
        images: form.images.split('\n').map(s => s.trim()).filter(Boolean),
        in_stock: (parseInt(form.stock_count) || 100) > 0,
      };

      if (editingProduct) {
        const updated = await admin.updateProduct(editingProduct.id, payload);
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? updated : p));
        toast.success('Product updated');
      } else {
        const created = await admin.createProduct(payload);
        setProducts(prev => [created, ...prev]);
        toast.success('Product created');
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await admin.deleteProduct(deleteId);
      setProducts(prev => prev.filter(p => p.id !== deleteId));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    } finally {
      setDeleteId(null);
    }
  };

  const setField = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="space-y-5">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Products</h1>
          <p className="text-stone-500 text-sm">{products.length} products total</p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-stone-900 hover:bg-stone-800">
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            className="pl-9"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {/* Category filter tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {['all', ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-all font-medium ${
                categoryFilter === cat
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
              }`}
            >
              {CATEGORY_LABELS[cat]}
              <span className={`ml-1.5 text-xs ${categoryFilter === cat ? 'text-stone-300' : 'text-stone-400'}`}>
                {counts[cat] ?? 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-stone-400">Loading products...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-400">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50">
                  <th className="text-left px-4 py-3 font-semibold text-stone-600">Product</th>
                  <th className="text-left px-4 py-3 font-semibold text-stone-600 hidden sm:table-cell">Category</th>
                  <th className="text-right px-4 py-3 font-semibold text-stone-600">Price</th>
                  <th className="text-right px-4 py-3 font-semibold text-stone-600 hidden md:table-cell">Stock</th>
                  <th className="text-center px-4 py-3 font-semibold text-stone-600 hidden lg:table-cell">Labels</th>
                  <th className="text-center px-4 py-3 font-semibold text-stone-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-stone-50 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.images[0] ? (
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-11 h-11 rounded-lg object-cover border border-stone-200 shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 bg-stone-100 rounded-lg flex items-center justify-center shrink-0">
                            <Package className="w-5 h-5 text-stone-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-stone-900 truncate">{p.name}</p>
                          <p className="text-xs text-stone-400 truncate">{p.slug}</p>
                          {/* Mobile category + stock */}
                          <div className="flex gap-2 sm:hidden mt-0.5">
                            <span className="text-xs capitalize text-stone-500">{p.category}</span>
                            <span className={`text-xs font-medium ${p.stock_count <= 5 ? 'text-red-500' : 'text-stone-500'}`}>
                              {p.stock_count} in stock
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-stone-600 hidden sm:table-cell">{p.category}</td>
                    <td className="px-4 py-3 text-right font-semibold text-stone-900">${p.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right hidden md:table-cell">
                      <span className={`font-semibold flex items-center justify-end gap-1 ${p.stock_count <= 5 ? 'text-red-600' : 'text-stone-900'}`}>
                        {p.stock_count <= 5 && <AlertTriangle className="w-3.5 h-3.5" />}
                        {p.stock_count}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex justify-center gap-1.5 flex-wrap">
                        {p.featured && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3" />Featured
                          </span>
                        )}
                        {p.bestseller && (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />Bestseller
                          </span>
                        )}
                        {!p.in_stock && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Out of stock</span>
                        )}
                        {p.featured || p.bestseller || !p.in_stock ? null : (
                          <span className="text-xs text-stone-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(p)} className="h-7 w-7 p-0 hover:bg-stone-100">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => setDeleteId(p.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Create / Edit Dialog ─────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Product Name *</Label>
                <Input value={form.name} onChange={setField('name')} placeholder="Classic Bifold Wallet" className="mt-1.5" />
              </div>
              <div>
                <Label>Slug *</Label>
                <Input value={form.slug} onChange={setField('slug')} placeholder="classic-bifold-wallet" className="mt-1.5 font-mono text-xs" />
              </div>
              <div>
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Price ($) *</Label>
                <Input type="number" step="0.01" min="0" value={form.price} onChange={setField('price')} placeholder="99.99" className="mt-1.5" />
              </div>
              <div>
                <Label>Stock Count</Label>
                <Input type="number" min="0" value={form.stock_count} onChange={setField('stock_count')} className="mt-1.5" />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={3}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                placeholder="Product description..."
              />
            </div>

            <div>
              <Label>Image URLs <span className="text-stone-400 font-normal">(one per line)</span></Label>
              <textarea
                value={form.images}
                onChange={e => setForm(p => ({ ...p, images: e.target.value }))}
                rows={3}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                placeholder="https://example.com/image1.jpg"
              />
            </div>

            <div className="border rounded-lg p-3 space-y-3">
              <p className="text-sm font-medium text-stone-700">Product Labels</p>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { key: 'featured',       label: 'Featured',       icon: '⭐' },
                  { key: 'bestseller',     label: 'Bestseller',     icon: '🔥' },
                  { key: 'personalizable', label: 'Personalizable', icon: '✏️' },
                ] as const).map(({ key, label, icon }) => (
                  <div key={key} className="flex items-center gap-2">
                    <Switch
                      checked={form[key] as boolean}
                      onCheckedChange={v => setForm(p => ({ ...p, [key]: v }))}
                    />
                    <Label className="cursor-pointer text-xs">{icon} {label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-stone-900 hover:bg-stone-800">
              {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ───────────────────────────────────────────────────── */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The product will be permanently removed from the catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
