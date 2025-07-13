
import type { NextPage } from "next";
import Layout from "../components/Layout";
import styles from "../styles/Home.module.css";

const Investors: NextPage = () => {
  return (
    <Layout title="Investors - Blogrolly">
      <div className={styles.hero}>
        <h1 className={styles.title}>Investors</h1>
        <p className={styles.description}>
          Join us in revolutionizing how people discover and organize content
        </p>
      </div>

      <div className={styles.missionSection}>
        <h2>Explore Our Vision, Opportunity & Strategy</h2>
        <p>BlogRolly is building the future of independent content discovery—one that puts power back in the hands of creators.</p>
        <p>We believe the next wave of the creator economy won't be algorithmic.</p>
        <p>It will be owned, authentic, and connected—just like the early web intended.</p>
        <p>We're not just rebuilding a tool.</p>
        <p><strong>We're rebuilding a culture.</strong></p>
        <p>BlogRolly is the next-generation blogroll our 'Y' is to become a platform that helps self-hosted bloggers grow, monetise, and build loyal readerships without relying on social feeds or SEO games.</p>
        
        <h3>How we'll win:</h3>
        <ul className={styles.featureList}>
          <li>• By serving the overlooked: 30M+ independent bloggers building businesses from scratch</li>
          <li>• By reviving lost discovery habits: organic linking, curated ecosystems, value-based visibility</li>
          <li>• By supporting modern, monetisation-friendly infrastructure for indie writers</li>
        </ul>
      </div>

      <div className={styles.founderSection}>
        <h2>Founder Bio – Why Me, Why Now</h2>
        <p>Hi, I'm Nolene Dube, the founder of BlogRolly.</p>
        <p>As a researcher, and solo builder, I've lived the silence that fell over the open web. I've seen incredible creators publish great content—only for it to disappear into the void.</p>
        <p>I started BlogRolly because I believe in digital sovereignty and the power of long-form thought. I want to make the web feel interconnected again not just performative and feed-based.</p>
        <p>With a background in [briefly list highlights, e.g. regulatory systems, content strategy, tech upskilling], I've bootstrapped the MVP with no outside funding and designed a product informed by both cultural insight and user empathy.</p>
        <p><strong>I'm building BlogRolly not to go viral but to last.</strong></p>
      </div>

      <div className={styles.roadmapSection}>
        <h2>Product Roadmap – Building in Public</h2>
        
        <div className={styles.roadmapPhase}>
          <h3>🚀 MVP Launch – Aug 2025</h3>
          <ul className={styles.featureList}>
            <li>• Blogger directory submissions (curated, searchable)</li>
            <li>• Reader onboarding + interest-based exploration</li>
            <li>• Early engagement tools (save, follow, feedback)</li>
            <li>• SEO-friendly profiles</li>
            <li>• Community waitlist + email capture</li>
          </ul>
        </div>

        <div className={styles.roadmapPhase}>
          <h3>📈 Phase 2 – Sept–Dec 2025</h3>
          <ul className={styles.featureList}>
            <li>• Blogger analytics dashboard</li>
            <li>• Value-based curated tagging and categories (Blog bundling)</li>
          </ul>
        </div>

        <div className={styles.roadmapPhase}>
          <h3>🧭 Vision – 2026 and beyond</h3>
          <ul className={styles.featureList}>
            <li>• AI-assisted categorisation of indie blogs</li>
            <li>• Monetisation layers for advocates (Affiliate Programs)</li>
            <li>• Indie press tools (newsletter/blog bundling)</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default Investors;
