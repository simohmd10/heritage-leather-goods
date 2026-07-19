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

// Legacy exports
export const getToken = () => null;
export const setToken = (_t: string) => {};
export const removeToken = () => {};
