import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, CreditCard, Truck, Shield } from 'lucide-react';
import Layout from '@/components/Layout';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { orders as ordersApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const STEPS = ['Cart', 'Shipping', 'Payment'];

export default function Checkout() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [shipping, setShipping] = useState({
    firstName: user?.name.split(' ')[0] || '',
    lastName: user?.name.split(' ').slice(1).join(' ') || '',
    address: '', city: '', state: '', zip: '', country: 'United States',
    email: user?.email || '', phone: user?.phone || ''
  });

  const [payment, setPayment] = useState({
    cardName: '', cardNumber: '', expiry: '', cvv: ''
  });

  const subtotal = totalPrice;
  const shippingCost = subtotal >= 250 ? 0 : 15;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = subtotal + shippingCost + tax;

  const setS = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setShipping(prev => ({ ...prev, [field]: e.target.value }));

  const setP = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setPayment(prev => ({ ...prev, [field]: e.target.value }));

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    try {
      const order = await ordersApi.create({
        items: items.map(item => ({
          productId: item.product.id,
          productSlug: item.product.slug,
          name: item.product.name,
          quantity: item.quantity,
          engraving: item.engraving || undefined,
        })),
        shippingAddress: {
          firstName: shipping.firstName,
          lastName: shipping.lastName,
          address: shipping.address,
          city: shipping.city,
          state: shipping.state,
          zip: shipping.zip,
          country: shipping.country,
        },
        guestEmail: !user ? shipping.email : undefined,
        guestName: !user ? `${shipping.firstName} ${shipping.lastName}` : undefined,
        paymentMethod: 'card',
      });

      clearCart();
      toast.success(`Order ${order.order_number} placed successfully!`);
      navigate(`/order-success?order=${order.order_number}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <section className="py-32 px-4 text-center">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
          <h1 className="font-display text-3xl font-bold text-foreground mb-4">Your Cart is Empty</h1>
          <p className="font-body text-muted-foreground mb-8">Discover our handcrafted leather goods</p>
          <Link to="/shop" className="inline-block bg-primary text-primary-foreground font-body text-sm tracking-widest uppercase px-8 py-3 rounded hover:bg-primary/90 transition-colors">
            Shop Now
          </Link>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <h1 className="font-display text-4xl font-bold text-foreground mb-8">Checkout</h1>

          {/* Steps */}
          <div className="flex items-center gap-3 mb-10">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  i <= step ? 'bg-primary text-white' : 'bg-stone-200 text-stone-500'
                }`}>{i + 1}</div>
                <span className={`text-sm font-medium ${i <= step ? 'text-stone-900' : 'text-stone-400'}`}>{s}</span>
                {i < STEPS.length - 1 && <div className={`w-12 h-0.5 ${i < step ? 'bg-primary' : 'bg-stone-200'}`} />}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Steps Content */}
            <div className="lg:col-span-2 space-y-6">

              {/* Step 0: Cart */}
              {step === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {items.map(item => (
                    <div key={`${item.product.id}-${item.engraving}`} className="flex gap-4 bg-card rounded-lg p-4 border border-border">
                      <Link to={`/product/${item.product.slug}`} className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={item.product.images?.[0] ?? ''} alt={item.product.name} className="w-full h-full object-cover" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-base font-semibold text-foreground">{item.product.name}</h3>
                        {item.engraving && (
                          <p className="text-xs text-accent mt-0.5">Engraving: "{item.engraving}"</p>
                        )}
                        <p className="text-accent font-semibold mt-1">${item.product.price}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center border border-border rounded">
                            <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1.5 text-muted-foreground hover:text-foreground">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 text-sm">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1.5 text-muted-foreground hover:text-foreground">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button onClick={() => removeItem(item.product.id as number)} className="text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="font-semibold self-center">${(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                  <Button className="w-full" size="lg" onClick={() => setStep(1)}>
                    Continue to Shipping
                  </Button>
                </motion.div>
              )}

              {/* Step 1: Shipping */}
              {step === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-lg border border-border p-6">
                  <h2 className="font-display text-xl font-semibold mb-5">Shipping Information</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {!user && (
                      <>
                        <div className="col-span-2">
                          <Label>Email Address</Label>
                          <Input type="email" value={shipping.email} onChange={setS('email')} className="mt-1.5" required />
                        </div>
                      </>
                    )}
                    <div>
                      <Label>First Name</Label>
                      <Input value={shipping.firstName} onChange={setS('firstName')} className="mt-1.5" required />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input value={shipping.lastName} onChange={setS('lastName')} className="mt-1.5" required />
                    </div>
                    <div className="col-span-2">
                      <Label>Street Address</Label>
                      <Input value={shipping.address} onChange={setS('address')} className="mt-1.5" placeholder="123 Main Street" required />
                    </div>
                    <div>
                      <Label>City</Label>
                      <Input value={shipping.city} onChange={setS('city')} className="mt-1.5" required />
                    </div>
                    <div>
                      <Label>State</Label>
                      <Input value={shipping.state} onChange={setS('state')} className="mt-1.5" required />
                    </div>
                    <div>
                      <Label>ZIP Code</Label>
                      <Input value={shipping.zip} onChange={setS('zip')} className="mt-1.5" required />
                    </div>
                    <div>
                      <Label>Country</Label>
                      <Input value={shipping.country} onChange={setS('country')} className="mt-1.5" />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
                    <Button className="flex-1"
                      onClick={() => {
                        if (!shipping.firstName || !shipping.address || !shipping.city || !shipping.zip) {
                          toast.error('Please fill in all shipping fields');
                          return;
                        }
                        if (!user && !shipping.email) {
                          toast.error('Please provide your email address');
                          return;
                        }
                        setStep(2);
                      }}
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-lg border border-border p-6">
                  <h2 className="font-display text-xl font-semibold mb-2">Payment Details</h2>
                  <p className="text-sm text-muted-foreground mb-5 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-green-600" />
                    Your payment info is secure and encrypted
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label>Name on Card</Label>
                      <Input value={payment.cardName} onChange={setP('cardName')} className="mt-1.5" placeholder="John Doe" />
                    </div>
                    <div className="col-span-2">
                      <Label>Card Number</Label>
                      <Input
                        value={payment.cardNumber}
                        onChange={e => setPayment(p => ({ ...p, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim() }))}
                        className="mt-1.5 font-mono"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </div>
                    <div>
                      <Label>Expiry Date</Label>
                      <Input
                        value={payment.expiry}
                        onChange={e => {
                          let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                          if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
                          setPayment(p => ({ ...p, expiry: v }));
                        }}
                        className="mt-1.5"
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <Label>CVV</Label>
                      <Input
                        type="password"
                        value={payment.cvv}
                        onChange={e => setPayment(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                        className="mt-1.5"
                        placeholder="•••"
                        maxLength={4}
                      />
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                    <strong>Demo Mode:</strong> No real payment will be processed. Click "Place Order" to simulate checkout.
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                    <Button className="flex-1 gap-2" size="lg" onClick={handlePlaceOrder} disabled={submitting}>
                      <CreditCard className="w-4 h-4" />
                      {submitting ? 'Placing Order...' : `Place Order — $${total.toFixed(2)}`}
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg border border-border p-5 sticky top-24">
                <h2 className="font-display text-lg font-semibold mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4">
                  {items.map(item => (
                    <div key={`${item.product.id}-${item.engraving}`} className="flex justify-between text-sm">
                      <span className="text-muted-foreground truncate pr-2">
                        {item.product.name} × {item.quantity}
                      </span>
                      <span className="font-medium shrink-0">${(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-3 space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className={shippingCost === 0 ? 'text-green-600 font-medium' : ''}>
                      {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax (8%)</span><span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-foreground text-base border-t border-border pt-2">
                    <span>Total</span><span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border space-y-2.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-primary shrink-0" />
                    {shippingCost === 0 ? 'Free shipping on this order' : 'Free shipping on orders over $250'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary shrink-0" />
                    30-day return policy
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
