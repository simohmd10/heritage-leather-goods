import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Minus } from "lucide-react";
import Layout from "@/components/Layout";
import { getProduct } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const ProductDetail = () => {
  const { id } = useParams();
  const product = getProduct(id || "");
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [engrave, setEngrave] = useState(false);
  const [initials, setInitials] = useState("");
  const [selectedImg, setSelectedImg] = useState(0);

  if (!product) {
    return (
      <Layout>
        <div className="py-32 text-center">
          <h1 className="font-display text-2xl text-foreground">Product not found</h1>
          <Link to="/shop" className="font-body text-accent mt-4 inline-block">Back to Shop</Link>
        </div>
      </Layout>
    );
  }

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) {
      addItem(product, engrave ? initials : undefined);
    }
    toast.success(`${product.name} added to cart`);
  };

  return (
    <Layout>
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto">
          <Link to="/shop" className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Gallery */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <div className="overflow-hidden rounded bg-card aspect-square mb-4">
                <img src={product.images[selectedImg]} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(i)}
                    className={`w-20 h-20 rounded overflow-hidden border-2 transition-colors ${
                      selectedImg === i ? "border-accent" : "border-transparent"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Details */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="lg:sticky lg:top-24 lg:self-start">
              <p className="font-body text-xs tracking-widest uppercase text-accent mb-2">{product.category}</p>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">{product.name}</h1>
              <p className="font-display text-2xl font-semibold text-accent mt-4">${product.price}</p>
              <p className="font-body text-muted-foreground leading-relaxed mt-6">{product.longDescription}</p>

              {/* Personalization */}
              {product.personalizable && (
                <div className="mt-8 border-t border-border pt-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => setEngrave(!engrave)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${engrave ? "bg-accent" : "bg-muted"}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-background shadow transition-transform ${engrave ? "translate-x-5" : "translate-x-0.5"}`} />
                    </div>
                    <span className="font-body text-sm text-foreground">Add Engraving</span>
                  </label>
                  {engrave && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-4">
                      <input
                        type="text"
                        maxLength={4}
                        value={initials}
                        onChange={(e) => setInitials(e.target.value.toUpperCase())}
                        placeholder="Your initials (max 4)"
                        className="w-full bg-card border border-border rounded px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </motion.div>
                  )}
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="mt-8 flex items-center gap-4">
                <div className="flex items-center border border-border rounded">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 text-muted-foreground hover:text-foreground">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 font-body text-sm">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="p-3 text-muted-foreground hover:text-foreground">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={handleAdd}
                  className="flex-1 bg-primary text-primary-foreground font-body text-sm tracking-widest uppercase py-3 rounded hover:bg-primary/90 transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ProductDetail;
