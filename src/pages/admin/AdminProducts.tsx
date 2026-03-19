import { useEffect, useState, useMemo, useRef } from 'react';
import { admin, uploadProductImage, Product } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Search, Package, Star, TrendingUp, AlertTriangle, Camera, ImageIcon, Link2, X, Upload } from 'lucide-react';

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
  images: [] as string[]
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
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [urlInput, setUrlInput]           = useState('');
  const [urlMode, setUrlMode]             = useState(false);
  const [uploadingImg, setUploadingImg]   = useState(false);
  const cameraRef  = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

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
      images: p.images
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
        images: form.images,
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

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    setImagePickerOpen(false);
    try {
      const url = await uploadProductImage(file);
      setForm(prev => ({ ...prev, images: [...prev.images, url] }));
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingImg(false);
      e.target.value = '';
    }
  };

  const addUrlImage = () => {
    const url = urlInput.trim();
    if (!url) return;
    setForm(prev => ({ ...prev, images: [...prev.images, url] }));
    setUrlInput('');
    setUrlMode(false);
    setImagePickerOpen(false);
  };

  const removeImage = (idx: number) =>
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));

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
      <Dialog open={dialogOpen} onOpenChange={v => { setDialogOpen(v); if (!v) { setImagePickerOpen(false); setUrlMode(false); setUrlInput(''); } }}>
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

            {/* ── Image Picker ───────────────────────────────────────────── */}
            <div>
              <Label>Product Images</Label>

              {/* Hidden file inputs */}
              <input ref={cameraRef}  type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelected} />
              <input ref={galleryRef} type="file" accept="image/*"                       className="hidden" onChange={handleFileSelected} />

              {/* Image previews */}
              {form.images.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.images.map((url, i) => (
                    <div key={i} className="relative group w-20 h-20 shrink-0">
                      <img src={url} alt="" className="w-full h-full object-cover rounded-lg border border-stone-200" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1 rounded">Main</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add image button */}
              <button
                type="button"
                onClick={() => { setUrlMode(false); setImagePickerOpen(true); }}
                disabled={uploadingImg}
                className="mt-2 w-full border-2 border-dashed border-stone-300 rounded-xl py-4 flex flex-col items-center gap-1.5 text-stone-400 hover:border-stone-400 hover:text-stone-600 transition-colors disabled:opacity-50"
              >
                {uploadingImg ? (
                  <>
                    <Upload className="w-5 h-5 animate-bounce" />
                    <span className="text-sm">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span className="text-sm">Add Image</span>
                  </>
                )}
              </button>

              {/* Image source picker sheet */}
              {imagePickerOpen && (
                <div className="fixed inset-0 z-50 flex items-end" onClick={() => { setImagePickerOpen(false); setUrlMode(false); }}>
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="relative w-full bg-white rounded-t-2xl p-5 space-y-2 shadow-xl" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-stone-900">Choose Image Source</h3>
                      <button onClick={() => { setImagePickerOpen(false); setUrlMode(false); }} className="text-stone-400 hover:text-stone-600">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {urlMode ? (
                      <div className="space-y-3">
                        <Input
                          autoFocus
                          value={urlInput}
                          onChange={e => setUrlInput(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          onKeyDown={e => e.key === 'Enter' && addUrlImage()}
                        />
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1" onClick={() => setUrlMode(false)}>Back</Button>
                          <Button className="flex-1 bg-stone-900 hover:bg-stone-800" onClick={addUrlImage}>Add</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => { cameraRef.current?.click(); }}
                          className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-stone-50 transition-colors text-left"
                        >
                          <div className="w-11 h-11 bg-pink-100 rounded-full flex items-center justify-center shrink-0">
                            <Camera className="w-5 h-5 text-pink-500" />
                          </div>
                          <div>
                            <p className="font-semibold text-stone-900">Take a Photo</p>
                            <p className="text-sm text-stone-400">Open camera to capture</p>
                          </div>
                        </button>

                        <button
                          onClick={() => { galleryRef.current?.click(); }}
                          className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-stone-50 transition-colors text-left"
                        >
                          <div className="w-11 h-11 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                            <ImageIcon className="w-5 h-5 text-purple-500" />
                          </div>
                          <div>
                            <p className="font-semibold text-stone-900">Choose from Gallery</p>
                            <p className="text-sm text-stone-400">Pick from your photos</p>
                          </div>
                        </button>

                        <button
                          onClick={() => setUrlMode(true)}
                          className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-stone-50 transition-colors text-left"
                        >
                          <div className="w-11 h-11 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                            <Link2 className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-semibold text-stone-900">Use Image URL</p>
                            <p className="text-sm text-stone-400">Paste a link to an image</p>
                          </div>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
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
