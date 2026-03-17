const BASE_URL = '/api';

function getToken(): string | null {
  return localStorage.getItem('hlg_token');
}

function setToken(token: string): void {
  localStorage.setItem('hlg_token', token);
}

function removeToken(): void {
  localStorage.removeItem('hlg_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data as T;
}

// Auth
export const auth = {
  register: (body: { name: string; email: string; password: string; phone?: string }) =>
    request<{ token: string; user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  me: () => request<User>('/auth/me'),

  updateProfile: (body: { name: string; phone?: string }) =>
    request<User>('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),

  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    request<{ message: string }>('/auth/change-password', { method: 'PUT', body: JSON.stringify(body) }),
};

// Products
export const products = {
  list: (params?: { category?: string; featured?: boolean; bestseller?: boolean; search?: string; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.category) qs.set('category', params.category);
    if (params?.featured) qs.set('featured', 'true');
    if (params?.bestseller) qs.set('bestseller', 'true');
    if (params?.search) qs.set('search', params.search);
    if (params?.limit) qs.set('limit', String(params.limit));
    return request<{ products: Product[]; total: number }>(`/products?${qs}`);
  },

  get: (slug: string) =>
    request<Product & { reviews: Review[]; avgRating: number; reviewCount: number }>(`/products/${slug}`),

  related: (id: string | number) =>
    request<Product[]>(`/products/${id}/related`),

  addReview: (id: number, body: { rating: number; title?: string; body?: string }) =>
    request<Review>(`/products/${id}/reviews`, { method: 'POST', body: JSON.stringify(body) }),
};

// Orders
export const orders = {
  create: (body: CreateOrderPayload) =>
    request<Order>('/orders', { method: 'POST', body: JSON.stringify(body) }),

  list: () => request<Order[]>('/orders'),

  get: (id: string | number) => request<Order>(`/orders/${id}`),
};

// Wishlist
export const wishlist = {
  list: () => request<WishlistItem[]>('/wishlist'),
  add: (productId: number) => request<{ message: string }>(`/wishlist/${productId}`, { method: 'POST' }),
  remove: (productId: number) => request<{ message: string }>(`/wishlist/${productId}`, { method: 'DELETE' }),
};

// Contact
export const contact = {
  send: (body: { name: string; email: string; subject?: string; message: string }) =>
    request<{ message: string }>('/contact', { method: 'POST', body: JSON.stringify(body) }),
};

// Admin
export const admin = {
  stats: () => request<AdminStats>('/admin/stats'),

  orders: (params?: { status?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    return request<{ orders: Order[]; total: number }>(`/admin/orders?${qs}`);
  },

  updateOrder: (id: number, body: { status?: string; payment_status?: string }) =>
    request<Order>(`/admin/orders/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  products: () => request<Product[]>('/admin/products'),

  createProduct: (body: Partial<Product>) =>
    request<Product>('/admin/products', { method: 'POST', body: JSON.stringify(body) }),

  updateProduct: (id: number, body: Partial<Product>) =>
    request<Product>(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  deleteProduct: (id: number) =>
    request<{ message: string }>(`/admin/products/${id}`, { method: 'DELETE' }),

  customers: (params?: { page?: number; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.search) qs.set('search', params.search);
    return request<{ customers: Customer[]; total: number }>(`/admin/customers?${qs}`);
  },

  messages: () => request<ContactMessage[]>('/admin/messages'),
  updateMessage: (id: number, status: string) =>
    request<{ message: string }>(`/admin/messages/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

export { getToken, setToken, removeToken };

// Types
export interface User {
  id: number;
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
  user_id?: number;
  guest_email?: string;
  guest_name?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
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
  user_id: number;
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
  id: number;
  name: string;
  email: string;
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
  };
  revenueByMonth: Array<{ month: string; revenue: number; orders: number }>;
  topProducts: Array<{ product_name: string; product_slug: string; units_sold: number; revenue: number }>;
  recentOrders: Order[];
}
