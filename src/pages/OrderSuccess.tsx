import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { orders as ordersApi, Order } from '@/lib/api';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (orderNumber) {
      ordersApi.get(orderNumber).then(setOrder).catch(() => {});
    }
  }, [orderNumber]);

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center py-16 px-4">
      <div className="max-w-lg w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="font-playfair text-3xl font-bold text-stone-900 mb-3">Order Confirmed!</h1>
        {orderNumber && (
          <p className="text-stone-500 mb-6">
            Order <span className="font-semibold text-stone-900">{orderNumber}</span> has been placed successfully.
          </p>
        )}
        <p className="text-stone-500 mb-8 text-sm leading-relaxed">
          Thank you for your purchase. We'll send you a confirmation email and start crafting your order right away.
          Each piece is handcrafted with care and will be ready to ship within 3–5 business days.
        </p>

        {order && (
          <div className="bg-white rounded-xl border border-stone-200 p-5 mb-8 text-left">
            <h2 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              Order Details
            </h2>
            <div className="space-y-2 text-sm">
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between text-stone-600">
                  <span>
                    {item.product_name} × {item.quantity}
                    {item.engraving && <span className="text-stone-400"> — "{item.engraving}"</span>}
                  </span>
                  <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="pt-2 mt-2 border-t border-stone-100 flex justify-between font-semibold text-stone-900">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
            {order.shipping_address && (
              <div className="mt-3 pt-3 border-t border-stone-100 text-xs text-stone-500">
                <strong className="text-stone-700">Shipping to:</strong><br />
                {order.shipping_address.firstName} {order.shipping_address.lastName},
                {' '}{order.shipping_address.address}, {order.shipping_address.city}
              </div>
            )}
            <div className="mt-3 text-xs text-stone-400">
              Placed on {format(new Date(order.created_at), 'MMMM d, yyyy')}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/"><Home className="w-4 h-4" />Back to Home</Link>
          </Button>
          <Button asChild className="gap-2">
            <Link to="/shop">Continue Shopping <ArrowRight className="w-4 h-4" /></Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
