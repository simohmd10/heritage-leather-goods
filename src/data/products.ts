import walletImg from "@/assets/product-wallet.jpg";
import bagImg from "@/assets/product-bag.jpg";
import beltImg from "@/assets/product-belt.jpg";
import accessoryImg from "@/assets/product-accessory.jpg";

export interface Product {
  id: string;
  name: string;
  price: number;
  category: "wallets" | "bags" | "belts" | "accessories";
  description: string;
  longDescription: string;
  image: string;
  images: string[];
  featured: boolean;
  bestSeller: boolean;
  personalizable: boolean;
}

export const products: Product[] = [
  {
    id: "classic-bifold",
    name: "Classic Bifold Wallet",
    price: 120,
    category: "wallets",
    description: "Hand-stitched full grain leather bifold with 8 card slots.",
    longDescription: "Crafted from a single piece of vegetable-tanned full grain leather, the Classic Bifold develops a rich patina over time. Eight card slots, two bill compartments, and a hidden pocket for receipts. Hand-stitched with waxed linen thread for lasting durability.",
    image: walletImg,
    images: [walletImg, walletImg, walletImg],
    featured: true,
    bestSeller: true,
    personalizable: true,
  },
  {
    id: "heritage-messenger",
    name: "Heritage Messenger Bag",
    price: 395,
    category: "bags",
    description: "Full grain leather messenger with brass hardware and adjustable strap.",
    longDescription: "The Heritage Messenger is built for daily use and designed to last a lifetime. Full grain Italian leather, solid brass buckles, and a canvas-lined interior with padded laptop compartment. The adjustable shoulder strap ensures comfortable all-day carry.",
    image: bagImg,
    images: [bagImg, bagImg, bagImg],
    featured: true,
    bestSeller: true,
    personalizable: true,
  },
  {
    id: "artisan-belt",
    name: "Artisan Dress Belt",
    price: 85,
    category: "belts",
    description: "Hand-cut leather belt with a solid brass roller buckle.",
    longDescription: "Cut from a single strip of bridle leather and finished with beveled, burnished edges. The solid brass roller buckle is built to withstand years of daily use. Available in sizes 30–44.",
    image: beltImg,
    images: [beltImg, beltImg, beltImg],
    featured: true,
    bestSeller: false,
    personalizable: true,
  },
  {
    id: "leather-keychain",
    name: "Leather Key Organizer",
    price: 45,
    category: "accessories",
    description: "Compact leather key holder with brass hardware.",
    longDescription: "Keep your keys organized and silent. This compact key organizer holds up to six keys between two leather panels secured by brass posts. A thoughtful gift that improves with age.",
    image: accessoryImg,
    images: [accessoryImg, accessoryImg, accessoryImg],
    featured: false,
    bestSeller: true,
    personalizable: true,
  },
  {
    id: "slim-cardholder",
    name: "Slim Card Holder",
    price: 65,
    category: "wallets",
    description: "Minimalist leather card holder for everyday carry.",
    longDescription: "For those who prefer to carry light, the Slim Card Holder holds up to 8 cards and folded bills. Made from the same vegetable-tanned leather as our wallets, it develops character with every use.",
    image: walletImg,
    images: [walletImg, walletImg, walletImg],
    featured: false,
    bestSeller: false,
    personalizable: true,
  },
  {
    id: "weekender-duffle",
    name: "Weekender Duffle",
    price: 550,
    category: "bags",
    description: "Spacious leather duffle bag for short trips.",
    longDescription: "The Weekender Duffle offers generous capacity for a few days away. Full grain leather exterior, cotton twill lining, and a dedicated shoe compartment. Dual carry handles and a removable shoulder strap.",
    image: bagImg,
    images: [bagImg, bagImg, bagImg],
    featured: true,
    bestSeller: false,
    personalizable: false,
  },
];

export const getProduct = (id: string) => products.find((p) => p.id === id);
export const getFeatured = () => products.filter((p) => p.featured);
export const getBestSellers = () => products.filter((p) => p.bestSeller);
export const getByCategory = (cat: string) => products.filter((p) => p.category === cat);
