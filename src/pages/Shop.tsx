import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { products as productsApi } from "@/lib/api";
import type { Product } from "@/lib/api";

const categories = ["all", "wallets", "bags", "belts", "accessories"];

const Shop = () => {
  const [searchParams] = useSearchParams();
  const initialCat = searchParams.get("category") || "all";
  const [active, setActive] = useState(initialCat);
  const [productList, setProductList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    productsApi
      .list({ category: active === "all" ? undefined : active })
      .then((r) => setProductList(r.products))
      .catch(() => setProductList([]))
      .finally(() => setLoading(false));
  }, [active]);

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

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square rounded bg-muted" />
                  <div className="mt-4 h-5 bg-muted rounded w-3/4" />
                  <div className="mt-2 h-4 bg-muted rounded w-1/2" />
                  <div className="mt-2 h-4 bg-muted rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
              {productList.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {!loading && productList.length === 0 && (
            <p className="text-center font-body text-muted-foreground py-20">No products found in this category.</p>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Shop;
