import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";

const categories = ["all", "wallets", "bags", "belts", "accessories"];

const Shop = () => {
  const [searchParams] = useSearchParams();
  const initialCat = searchParams.get("category") || "all";
  const [active, setActive] = useState(initialCat);

  const filtered = active === "all" ? products : products.filter((p) => p.category === active);

  return (
    <Layout>
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">Shop</h1>
            <p className="font-body text-muted-foreground mt-3">Browse our complete collection</p>
          </motion.div>

          <div className="flex justify-center gap-3 flex-wrap mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`font-body text-xs tracking-widest uppercase px-5 py-2 rounded transition-all ${
                  active === cat ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center font-body text-muted-foreground py-20">No products found in this category.</p>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Shop;
