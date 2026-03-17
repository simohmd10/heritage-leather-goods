import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import heroImg from "@/assets/hero-leather.jpg";
import walletImg from "@/assets/product-wallet.jpg";
import bagImg from "@/assets/product-bag.jpg";
import beltImg from "@/assets/product-belt.jpg";
import accessoryImg from "@/assets/product-accessory.jpg";
import ProductCard from "@/components/ProductCard";
import { products as productsApi } from "@/lib/api";
import type { Product } from "@/lib/api";
import Layout from "@/components/Layout";

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7 },
};

const categories = [
  { name: "Wallets", image: walletImg, slug: "wallets" },
  { name: "Bags", image: bagImg, slug: "bags" },
  { name: "Belts", image: beltImg, slug: "belts" },
  { name: "Accessories", image: accessoryImg, slug: "accessories" },
];

const testimonials = [
  { name: "James R.", text: "The quality is extraordinary. My bifold wallet has developed the most beautiful patina after six months.", rating: 5 },
  { name: "Sarah M.", text: "I bought the messenger bag as a gift. The craftsmanship is evident in every stitch. Absolutely worth every penny.", rating: 5 },
  { name: "David L.", text: "Finally, a belt that doesn't fall apart after a year. This is buy-it-for-life quality.", rating: 5 },
];

const Index = () => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);

  useEffect(() => {
    productsApi.list({ featured: true, limit: 6 }).then((r) => setFeatured(r.products)).catch(() => {});
    productsApi.list({ bestseller: true, limit: 6 }).then((r) => setBestSellers(r.products)).catch(() => {});
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[90vh] md:h-screen overflow-hidden">
        <img src={heroImg} alt="Premium handmade leather goods" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/30 to-transparent" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground max-w-4xl leading-tight"
          >
            Premium Handmade Leather Goods
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="font-body text-base md:text-lg text-primary-foreground/80 mt-6 max-w-xl"
          >
            Authentic leather products crafted with quality and tradition
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Link
              to="/shop"
              className="mt-8 inline-flex items-center gap-2 border-2 border-primary-foreground/80 text-primary-foreground px-8 py-3 font-body text-sm tracking-widest uppercase hover:bg-primary-foreground hover:text-primary transition-all duration-300 rounded"
            >
              Shop Collection <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="py-20 md:py-28 px-4">
          <div className="container mx-auto">
            <motion.div {...fadeUp} className="text-center mb-14">
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground">Featured Collection</h2>
              <p className="font-body text-muted-foreground mt-3">Curated pieces that define our craft</p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="py-20 bg-card px-4">
        <div className="container mx-auto">
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground">Shop by Category</h2>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link to={`/shop?category=${cat.slug}`} className="group relative block overflow-hidden rounded aspect-[3/4]">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                    <h3 className="font-display text-lg md:text-xl font-semibold text-primary-foreground">{cat.name}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="py-20 md:py-28 px-4">
          <div className="container mx-auto">
            <motion.div {...fadeUp} className="text-center mb-14">
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground">Best Sellers</h2>
              <p className="font-body text-muted-foreground mt-3">Our most loved pieces</p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
              {bestSellers.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Brand Story */}
      <section className="py-20 bg-card px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div {...fadeUp}>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-6">Our Story</h2>
            <p className="font-body text-muted-foreground leading-relaxed text-base md:text-lg">
              Born in a small workshop in Tuscany, Artisan Leather Co. has spent over two decades perfecting the art of leather craft. We source only the finest vegetable-tanned hides and work them by hand using techniques passed down through generations. Every cut, stitch, and edge is finished with intention — because we believe everyday objects deserve extraordinary care.
            </p>
            <Link to="/about" className="inline-flex items-center gap-2 mt-8 font-body text-sm tracking-widest uppercase text-accent hover:text-foreground transition-colors">
              Learn More <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28 px-4">
        <div className="container mx-auto">
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground">What Our Customers Say</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="bg-card rounded p-8"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="font-body text-sm text-muted-foreground leading-relaxed italic">"{t.text}"</p>
                <p className="font-body text-sm font-semibold text-foreground mt-4">— {t.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
