import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import Layout from "@/components/Layout";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const Checkout = () => {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();

  const handleCheckout = () => {
    toast.success("Order placed successfully! Thank you for your purchase.");
    clearCart();
  };

  if (items.length === 0) {
    return (
      <Layout>
        <section className="py-32 px-4 text-center">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
          <h1 className="font-display text-3xl font-bold text-foreground mb-4">Your Cart is Empty</h1>
          <p className="font-body text-muted-foreground mb-8">Discover our handcrafted leather goods</p>
          <Link
            to="/shop"
            className="inline-block bg-primary text-primary-foreground font-body text-sm tracking-widest uppercase px-8 py-3 rounded hover:bg-primary/90 transition-colors"
          >
            Shop Now
          </Link>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl font-bold text-foreground mb-10">
            Your Cart
          </motion.h1>

          <div className="space-y-6">
            {items.map((item) => (
              <motion.div
                key={item.product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 md:gap-6 bg-card rounded p-4 md:p-6"
              >
                <Link to={`/product/${item.product.id}`} className="w-24 h-24 md:w-32 md:h-32 rounded overflow-hidden flex-shrink-0">
                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg font-semibold text-foreground">{item.product.name}</h3>
                  {item.engraving && (
                    <p className="font-body text-xs text-accent mt-1">Engraving: {item.engraving}</p>
                  )}
                  <p className="font-body text-accent font-semibold mt-2">${item.product.price}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-border rounded">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-2 text-muted-foreground hover:text-foreground">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 font-body text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-2 text-muted-foreground hover:text-foreground">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.product.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="font-body font-semibold text-foreground self-center">
                  ${item.product.price * item.quantity}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 bg-card rounded p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <span className="font-body text-lg text-foreground">Total</span>
              <span className="font-display text-2xl font-bold text-foreground">${totalPrice}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-primary text-primary-foreground font-body text-sm tracking-widest uppercase py-4 rounded hover:bg-primary/90 transition-colors"
            >
              Place Order
            </button>
            <p className="font-body text-xs text-muted-foreground text-center mt-4">
              Free shipping on all orders. 30-day return policy.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Checkout;
