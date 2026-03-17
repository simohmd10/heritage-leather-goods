import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Product } from "@/lib/api";

const ProductCard = ({ product }: { product: Product }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5 }}
  >
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="overflow-hidden rounded bg-card aspect-square">
        <img
          src={product.images?.[0] ?? "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800"}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="mt-4">
        <h3 className="font-display text-lg font-medium text-foreground">{product.name}</h3>
        <p className="font-body text-sm text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
        <p className="font-body text-base font-semibold text-accent mt-2">${product.price}</p>
      </div>
    </Link>
  </motion.div>
);

export default ProductCard;
