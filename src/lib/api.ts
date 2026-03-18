import { supabase } from './supabase';

// ─── HELPERS ────────────────────────────────────────────────────────────────
function raise(error: { message: string } | null | string): never {
  throw new Error(typeof error === 'string' ? error : error?.message ?? 'Unknown error');
}

// ─── AUTH ────────────────────────────────────────────────────────────────────
export const auth = {
  register: async (body: { name: string; email: string; password: string; phone?: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
      options: { data: { name: body.name, phone: body.phone ?? null } },
    });
    if (error) raise(error);
    if (!data.user) raise('Registration failed — please try again');
    const profile = await auth.me();
    return { user: profile };
  },

  login: async (body: { email: string; password: string }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });
    if (error) raise(error);
    const profile = await auth.me();
    return { user: profile };
  },

  me: async (): Promise<User> => {
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) raise('Not authenticated');

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileErr) raise(profileErr);
    return {
      id: user.id,
      email: user.email!,
      name: profile.name,
      phone: profile.phone ?? undefined,
      role: profile.role,
      created_at: profile.created_at,
    };
  },

  updateProfile: async (body: { name: string; phone?: string }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) raise('Not authenticated');

    const { error } = await supabase
      .from('profiles')
      .update({ name: body.name, phone: body.phone ?? null })
      .eq('id', user.id);
    if (error) raise(error);

    return auth.me();
  },

  changePassword: async (body: { currentPassword: string; newPassword: string }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) raise('Not authenticated');

    const { error: loginErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: body.currentPassword,
    });
    if (loginErr) raise('Current password is incorrect');

    const { error } = await supabase.auth.updateUser({ password: body.newPassword });
    if (error) raise(error);
    return { message: 'Password updated successfully' };
  },
};

// ─── PRODUCTS ────────────────────────────────────────────────────────────────
export const products = {
  list: async (params?: {
    category?: string;
    featured?: boolean;
    bestseller?: boolean;
    search?: string;
    limit?: number;
  }): Promise<{ products: Product[]; total: number }> => {
    let q = supabase.from('products').select('*', { count: 'exact' });

    if (params?.category && params.category !== 'all') q = q.eq('category', params.category);
    if (params?.featured)    q = q.eq('featured', true);
    if (params?.bestseller)  q = q.eq('bestseller', true);
    if (params?.search)      q = q.ilike('name', `%${params.search}%`);
    if (params?.limit)       q = q.limit(params.limit);

    q = q.order('featured', { ascending: false }).order('bestseller', { ascending: false });

    const { data, error, count } = await q;
    if (error) raise(error);
    return { products: data as Product[], total: count ?? data?.length ?? 0 };
  },

  get: async (slug: string): Promise<Product & { reviews: Review[]; avgRating: number; reviewCount: number }> => {
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) raise(error);

    const { data: reviews } = await supabase
      .from('reviews')
      .select('*, profiles(name)')
      .eq('product_id', product.id)
      .order('created_at', { ascending: false });

    const formattedReviews: Review[] = (reviews ?? []).map((r: any) => ({
      ...r,
      user_name: r.profiles?.name ?? 'Customer',
    }));

    const avgRating = formattedReviews.length
      ? formattedReviews.reduce((s, r) => s + r.rating, 0) / formattedReviews.length
      : 0;

    return {
      ...product,
      reviews: formattedReviews,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: formattedReviews.length,
    };
  },

  related: async (id: string | number): Promise<Product[]> => {
    const { data: product } = await supabase.from('products').select('category').eq('id', id).single();
    if (!product) return [];

    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('category', product.category)
      .neq('id', id)
      .limit(4);
    return data ?? [];
  },

  addReview: async (id: number, body: { rating: number; title?: string; body?: string }): Promise<Review> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) raise('You must be logged in to leave a review');

    const { data, error } = await supabase
      .from('reviews')
      .insert({ product_id: id, user_id: user.id, ...body })
      .select('*, profiles(name)')
      .single();
    if (error) raise(error);
    return { ...data, user_name: (data as any).profiles?.name ?? 'Customer' };
  },
};

// ─── ORDERS ──────────────────────────────────────────────────────────────────
export const orders = {
  create: async (payload: CreateOrderPayload): Promise<Order> => {
    const { data: { user } } = await supabase.auth.getUser();

    const items = payload.items.map(item => ({
      slug: item.productSlug ?? item.slug ?? '',
      id:   item.productId ?? item.id ?? null,
      quantity: item.quantity,
      engraving: item.engraving ?? '',
    }));

    const { data, error } = await supabase.rpc('create_order', {
      p_user_id:        user?.id ?? null,
      p_guest_email:    user ? null : (payload.guestEmail ?? null),
      p_guest_name:     user ? null : (payload.guestName ?? null),
      p_items:          items,
      p_shipping_addr:  payload.shippingAddress,
      p_payment_method: payload.paymentMethod ?? 'card',
      p_notes:          payload.notes ?? null,
    });

    if (error) raise(error);
    return orders.get(data.order_number);
  },

  list: async (): Promise<Order[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) raise('Not authenticated');

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) raise(error);
    return (data ?? []).map(formatOrder);
  },

  get: async (id: string | number): Promise<Order> => {
    const field = typeof id === 'string' && id.startsWith('HLG-') ? 'order_number' : 'id';
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq(field, id)
      .single();
    if (error) raise(error);
    return formatOrder(data);
  },
};

function formatOrder(o: any): Order {
  return {
    ...o,
    shipping_address: typeof o.shipping_address === 'string'
      ? JSON.parse(o.shipping_address)
      : o.shipping_address,
    items: o.order_items ?? [],
  };
}

// ─── WISHLIST ────────────────────────────────────────────────────────────────
export const wishlist = {
  list: async (): Promise<WishlistItem[]> => {
    const { data, error } = await supabase
      .from('wishlist')
      .select('id, created_at, products(*)')
      .order('created_at', { ascending: false });
    if (error) raise(error);
    return (data ?? []).map((w: any) => ({ id: w.id, created_at: w.created_at, ...w.products }));
  },

  add: async (productId: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) raise('Not authenticated');
    const { error } = await supabase.from('wishlist').insert({ user_id: user.id, product_id: productId });
    if (error) raise(error);
    return { message: 'Added to wishlist' };
  },

  remove: async (productId: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) raise('Not authenticated');
    await supabase.from('wishlist').delete().eq('user_id', user.id).eq('product_id', productId);
    return { message: 'Removed from wishlist' };
  },
};

// ─── CONTACT ─────────────────────────────────────────────────────────────────
export const contact = {
  send: async (body: { name: string; email: string; subject?: string; message: string }) => {
    const { error } = await supabase.from('contact_messages').insert(body);
    if (error) raise(error);
    return { message: 'Message sent successfully. We will get back to you within 24 hours.' };
  },
};

// ─── ADMIN ───────────────────────────────────────────────────────────────────
export const admin = {
  /** Lightweight pending orders count — used for nav badge */
  pendingCount: async (): Promise<number> => {
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    return count ?? 0;
  },

  stats: async (): Promise<AdminStats> => {
    const [
      { data: ordersData,   error: ordersErr   },
      { data: productsData, error: productsErr  },
      { count: customerCount, error: customersErr },
    ] = await Promise.all([
      supabase.from('orders').select('total, status, payment_status, created_at'),
      supabase.from('products').select('stock_count'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    ]);

    if (ordersErr)   raise(ordersErr);
    if (productsErr) raise(productsErr);
    if (customersErr) raise(customersErr);

    const allOrders = ordersData ?? [];
    const allProducts = productsData ?? [];
    const validOrders = allOrders.filter(o => o.payment_status !== 'failed');

    // ── Period boundaries ────────────────────────────────────────────────────
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 6);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalRevenue      = validOrders.reduce((s, o) => s + o.total, 0);
    const pendingOrders     = allOrders.filter(o => o.status === 'pending').length;
    const lowStockProducts  = allProducts.filter(p => p.stock_count <= 5).length;
    const revenueToday      = validOrders.filter(o => new Date(o.created_at) >= todayStart).reduce((s, o) => s + o.total, 0);
    const revenueThisWeek   = validOrders.filter(o => new Date(o.created_at) >= weekStart).reduce((s, o) => s + o.total, 0);
    const revenueThisMonth  = validOrders.filter(o => new Date(o.created_at) >= monthStart).reduce((s, o) => s + o.total, 0);
    const ordersToday       = allOrders.filter(o => new Date(o.created_at) >= todayStart).length;
    const ordersThisWeek    = allOrders.filter(o => new Date(o.created_at) >= weekStart).length;

    // ── Daily revenue — last 30 days ─────────────────────────────────────────
    const dayMap: Record<string, { revenue: number; orders: number }> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(todayStart);
      d.setDate(d.getDate() - i);
      dayMap[d.toISOString().slice(0, 10)] = { revenue: 0, orders: 0 };
    }
    for (const o of validOrders) {
      const key = o.created_at.slice(0, 10);
      if (dayMap[key]) {
        dayMap[key].revenue += o.total;
        dayMap[key].orders  += 1;
      }
    }
    const revenueByDay = Object.entries(dayMap).map(([date, v]) => ({
      date,
      label: new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      ...v,
    }));

    // ── Recent orders ────────────────────────────────────────────────────────
    const { data: recentRaw, error: recentErr } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
      .limit(5);
    if (recentErr) raise(recentErr);

    const recentOrders: Order[] = (recentRaw ?? []).map((o: any) => formatOrder(o));

    // ── Top products ─────────────────────────────────────────────────────────
    const { data: itemsRaw } = await supabase
      .from('order_items')
      .select('product_id, product_name, product_slug, price, quantity');

    const productMap: Record<string, { product_name: string; product_slug: string; units_sold: number; revenue: number }> = {};
    for (const item of (itemsRaw ?? [])) {
      const key = String(item.product_id);
      if (!productMap[key]) productMap[key] = { product_name: item.product_name, product_slug: item.product_slug, units_sold: 0, revenue: 0 };
      productMap[key].units_sold += item.quantity;
      productMap[key].revenue    += item.price * item.quantity;
    }
    const topProducts = Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      stats: {
        totalRevenue,
        totalOrders: allOrders.length,
        totalProducts: allProducts.length,
        totalCustomers: customerCount ?? 0,
        pendingOrders,
        lowStockProducts,
        revenueToday,
        revenueThisWeek,
        revenueThisMonth,
        ordersToday,
        ordersThisWeek,
      },
      revenueByDay,
      topProducts,
      recentOrders,
    };
  },

  orders: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }) => {
    const page  = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const from  = (page - 1) * limit;

    let q = supabase
      .from('orders')
      .select('*, order_items(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (params?.status)   q = q.eq('status', params.status);
    if (params?.dateFrom) q = q.gte('created_at', params.dateFrom);
    if (params?.dateTo)   q = q.lte('created_at', params.dateTo + 'T23:59:59');
    if (params?.search) {
      q = q.or(
        `order_number.ilike.%${params.search}%,guest_name.ilike.%${params.search}%,guest_email.ilike.%${params.search}%`
      );
    }

    const { data, error, count } = await q;
    if (error) raise(error);

    return {
      orders: (data ?? []).map((o: any) => formatOrder(o)) as Order[],
      total: count ?? 0,
      page,
      limit,
    };
  },

  updateOrder: async (id: number, body: { status?: string; payment_status?: string }): Promise<Order> => {
    const { data, error } = await supabase
      .from('orders')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, order_items(*)')
      .single();
    if (error) raise(error);
    return formatOrder(data);
  },

  products: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) raise(error);
    return data ?? [];
  },

  createProduct: async (body: Partial<Product>): Promise<Product> => {
    const { data, error } = await supabase
      .from('products')
      .insert(body)
      .select()
      .single();
    if (error) raise(error);
    return data;
  },

  updateProduct: async (id: number, body: Partial<Product>): Promise<Product> => {
    const { data, error } = await supabase
      .from('products')
      .update(body)
      .eq('id', id)
      .select()
      .single();
    if (error) raise(error);
    return data;
  },

  deleteProduct: async (id: number) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) raise(error);
    return { message: 'Product deleted' };
  },

  customers: async (params?: { page?: number; search?: string; sortBy?: 'newest' | 'orders' | 'spent' }) => {
    const page  = params?.page ?? 1;
    const limit = 20;
    const from  = (page - 1) * limit;

    let q = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .eq('role', 'customer')
      .range(from, from + limit - 1);

    if (params?.search) q = q.ilike('name', `%${params.search}%`);

    // Default sort by newest; other sorts happen client-side after joining order data
    q = q.order('created_at', { ascending: false });

    const { data, error, count } = await q;
    if (error) raise(error);

    const customers: Customer[] = await Promise.all(
      (data ?? []).map(async (profile: any) => {
        const { data: orderData } = await supabase
          .from('orders')
          .select('total')
          .eq('user_id', profile.id);
        const order_count = orderData?.length ?? 0;
        const total_spent = (orderData ?? []).reduce((s: number, o: any) => s + o.total, 0);
        return { ...profile, order_count, total_spent };
      })
    );

    // Client-side sort
    if (params?.sortBy === 'orders') customers.sort((a, b) => b.order_count - a.order_count);
    if (params?.sortBy === 'spent')  customers.sort((a, b) => b.total_spent - a.total_spent);

    return { customers, total: count ?? 0 };
  },

  messages: async (): Promise<ContactMessage[]> => {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) raise(error);
    return data ?? [];
  },

  updateMessage: async (id: number, status: string) => {
    const { error } = await supabase.from('contact_messages').update({ status }).eq('id', id);
    if (error) raise(error);
    return { message: 'Updated' };
  },
};

// ─── CSV EXPORT UTILITY ───────────────────────────────────────────────────────
export function exportOrdersToCSV(orderList: Order[]) {
  const headers = [
    'Order Number', 'Customer', 'Email', 'Date', 'Status',
    'Payment', 'Subtotal', 'Shipping', 'Tax', 'Total',
    'City', 'Address', 'Items'
  ];

  const rows = orderList.map(o => {
    const addr = o.shipping_address ?? {};
    const customerName = o.customer_name || o.guest_name || 'Guest';
    const email = o.guest_email ?? '';
    const city  = addr.city ?? '';
    const address = [addr.address, addr.state, addr.zip, addr.country].filter(Boolean).join(', ');
    const items = (o.items ?? []).map(i => `${i.product_name}×${i.quantity}`).join(' | ');

    return [
      o.order_number,
      customerName,
      email,
      new Date(o.created_at).toLocaleDateString('en-US'),
      o.status,
      o.payment_status,
      o.subtotal.toFixed(2),
      o.shipping.toFixed(2),
      o.tax.toFixed(2),
      o.total.toFixed(2),
      city,
      address,
      items,
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── TYPES ───────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  phone?: string;
  created_at: string;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  in_stock: boolean;
  stock_count: number;
  featured: boolean;
  bestseller: boolean;
  personalizable: boolean;
  created_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  user_id?: string;
  guest_email?: string;
  guest_name?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shipping_address: ShippingAddress;
  payment_method: string;
  payment_status: string;
  notes?: string;
  created_at: string;
  items: OrderItem[];
  customer_name?: string;
}

export interface OrderItem {
  id: number;
  product_id?: number;
  product_name: string;
  product_slug?: string;
  price: number;
  quantity: number;
  engraving?: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
}

export interface CreateOrderPayload {
  items: Array<{
    productId?: number;
    id?: number;
    productSlug?: string;
    slug?: string;
    name: string;
    quantity: number;
    engraving?: string;
  }>;
  shippingAddress: ShippingAddress;
  guestEmail?: string;
  guestName?: string;
  notes?: string;
  paymentMethod?: string;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: string;
  user_name: string;
  rating: number;
  title?: string;
  body?: string;
  created_at: string;
}

export interface WishlistItem {
  id: number;
  product_id: number;
  slug: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  in_stock: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  order_count: number;
  total_spent: number;
  created_at: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  created_at: string;
}

export interface AdminStats {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    pendingOrders: number;
    lowStockProducts: number;
    revenueToday: number;
    revenueThisWeek: number;
    revenueThisMonth: number;
    ordersToday: number;
    ordersThisWeek: number;
  };
  revenueByDay: Array<{ date: string; label: string; revenue: number; orders: number }>;
  topProducts: Array<{ product_name: string; product_slug: string; units_sold: number; revenue: number }>;
  recentOrders: Order[];
}

// Legacy exports
export const getToken = () => null;
export const setToken = (_t: string) => {};
export const removeToken = () => {};
