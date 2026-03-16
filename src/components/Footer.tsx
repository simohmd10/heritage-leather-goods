import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-primary text-primary-foreground">
    <div className="container mx-auto px-4 lg:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <h3 className="font-display text-2xl font-bold mb-4">ARTISAN LEATHER</h3>
          <p className="font-body text-sm leading-relaxed text-primary-foreground/70 max-w-md">
            Handcrafted leather goods made with tradition, quality, and a commitment to timeless design. Every piece tells a story.
          </p>
        </div>
        <div>
          <h4 className="font-body text-xs tracking-widest uppercase mb-4 text-primary-foreground/50">Navigate</h4>
          <div className="flex flex-col gap-2">
            {["/shop", "/about", "/contact"].map((l) => (
              <Link key={l} to={l} className="font-body text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                {l.replace("/", "").charAt(0).toUpperCase() + l.slice(2)}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-body text-xs tracking-widest uppercase mb-4 text-primary-foreground/50">Connect</h4>
          <div className="flex flex-col gap-2 font-body text-sm text-primary-foreground/70">
            <span>hello@artisanleather.co</span>
            <span>+1 (555) 234-5678</span>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 mt-12 pt-8 text-center">
        <p className="font-body text-xs text-primary-foreground/40">
          © {new Date().getFullYear()} Artisan Leather Co. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
