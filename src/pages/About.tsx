import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import heroImg from "@/assets/hero-leather.jpg";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const About = () => (
  <Layout>
    <section className="py-16 md:py-24 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div {...fadeUp} className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">Our Story</h1>
          <p className="font-body text-muted-foreground mt-4 max-w-2xl mx-auto">
            A tradition of craftsmanship, passed down through generations
          </p>
        </motion.div>

        <motion.div {...fadeUp} className="rounded overflow-hidden mb-16">
          <img src={heroImg} alt="Our workshop" className="w-full h-64 md:h-96 object-cover" />
        </motion.div>

        <div className="space-y-10">
          <motion.div {...fadeUp}>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">The Beginning</h2>
            <p className="font-body text-muted-foreground leading-relaxed">
              Artisan Leather Co. was founded in 2003 in a small Tuscan workshop by master craftsman Marco Bellini. With little more than a cutting table, a set of hand tools, and decades of knowledge inherited from his father, Marco set out to create leather goods that would stand the test of time. His philosophy was simple: use the finest materials, honor traditional techniques, and never rush the process.
            </p>
          </motion.div>

          <motion.div {...fadeUp}>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">Our Materials</h2>
            <p className="font-body text-muted-foreground leading-relaxed">
              We source our hides exclusively from tanneries that use vegetable-based processes — an ancient method that produces leather with unmatched depth of color and durability. Each hide is carefully inspected for quality before it enters our workshop. We use solid brass hardware, waxed linen thread, and natural edge finishes.
            </p>
          </motion.div>

          <motion.div {...fadeUp}>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">Crafted to Last</h2>
            <p className="font-body text-muted-foreground leading-relaxed">
              Every piece that leaves our workshop is built to be used daily and loved for years. We believe in creating objects that grow more beautiful with age — leather that develops a rich patina, stitching that holds firm, and hardware that only gets better with wear. This is not fast fashion; this is slow, intentional craft.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  </Layout>
);

export default About;
