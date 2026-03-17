import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { orders as ordersApi, auth as authApi, Order } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Package, User, Lock, LogOut, ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function Account() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    ordersApi.list()
      .then(setMyOrders)
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoadingOrders(false));
  }, [user, navigate]);

  useEffect(() => {
    if (user) setProfileForm({ name: user.name, phone: user.phone || '' });
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await authApi.updateProfile({ name: profileForm.name, phone: profileForm.phone || undefined });
      await refreshUser();
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setSavingPassword(true);
    try {
      await authApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Signed out successfully');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-playfair text-3xl font-bold text-stone-900">My Account</h1>
            <p className="text-stone-500 mt-1">Welcome back, {user.name}</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="orders">
          <TabsList className="mb-6">
            <TabsTrigger value="orders" className="gap-2">
              <Package className="w-4 h-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Lock className="w-4 h-4" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Orders */}
          <TabsContent value="orders">
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
              <div className="p-6 border-b border-stone-100">
                <h2 className="font-semibold text-lg text-stone-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  Order History
                </h2>
              </div>
              {loadingOrders ? (
                <div className="p-12 text-center text-stone-400">Loading orders...</div>
              ) : myOrders.length === 0 ? (
                <div className="p-12 text-center">
                  <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <p className="text-stone-500">No orders yet</p>
                  <Button variant="link" onClick={() => navigate('/shop')} className="mt-2">Start shopping</Button>
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {myOrders.map(order => (
                    <div key={order.id} className="p-6">
                      <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                        <div>
                          <p className="font-semibold text-stone-900">{order.order_number}</p>
                          <p className="text-sm text-stone-500">
                            {format(new Date(order.created_at), 'MMMM d, yyyy')}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-stone-100 text-stone-600'}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                          <span className="font-semibold text-stone-900">${order.total.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {order.items.map(item => (
                          <div key={item.id} className="flex justify-between text-sm text-stone-600">
                            <span>
                              {item.product_name} × {item.quantity}
                              {item.engraving && <span className="text-stone-400"> — Engraving: "{item.engraving}"</span>}
                            </span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Profile */}
          <TabsContent value="profile">
            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <h2 className="font-semibold text-lg text-stone-900 mb-6">Personal Information</h2>
              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={profileForm.name}
                    onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                    className="mt-1.5"
                    required
                  />
                </div>
                <div>
                  <Label>Email Address</Label>
                  <Input value={user.email} disabled className="mt-1.5 bg-stone-50" />
                  <p className="text-xs text-stone-400 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    type="tel"
                    value={profileForm.phone}
                    onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                    className="mt-1.5"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div>
                  <Label>Member Since</Label>
                  <Input
                    value={format(new Date(user.created_at), 'MMMM d, yyyy')}
                    disabled
                    className="mt-1.5 bg-stone-50"
                  />
                </div>
                <Button type="submit" disabled={savingProfile}>
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </div>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security">
            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <h2 className="font-semibold text-lg text-stone-900 mb-6">Change Password</h2>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div>
                  <Label>Current Password</Label>
                  <Input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                    className="mt-1.5"
                    required
                  />
                </div>
                <div>
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                    className="mt-1.5"
                    placeholder="Min. 6 characters"
                    required
                  />
                </div>
                <div>
                  <Label>Confirm New Password</Label>
                  <Input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                    className="mt-1.5"
                    required
                  />
                </div>
                <Button type="submit" disabled={savingPassword}>
                  {savingPassword ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
