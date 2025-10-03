import React from "react";
import Link from "next/link";
import Layout from "../../components/Layout";
import styles from "../../styles/Home.module.css";

const InvestorPage = () => (
  <Layout title="Investors - BlogRolly">
    <div className={styles.hero}>
      <h1 className={styles.title}>Investors</h1>
      <p className={styles.description}>
        Join us in building the shared infrastructure for the independent web.
      </p>
    </div>
    <div className={styles.missionSection}>
      <h2>Our Vision, Opportunity & Strategy</h2>
      <p><b>The Next Wave of the Creator Economy:</b></p>
      <ul>
        <li><b>Owned</b> — Creators want independence. Instead of building on platforms that can change the rules overnight, they keep full ownership of their sites, content, and audiences.</li>
        <li><b>Trusted</b> — Readers are tired of clickbait and shallow content. Depth, quality, and expertise are what attract and retain loyal audiences.</li>
        <li><b>Networked</b> — Solo creators struggle to grow alone. Collective visibility and shared SEO momentum unlock scalable, compounding growth.</li>
      </ul>
      <p>BlogRolly sits at the intersection of these shifts; giving creators ownership; amplifying trusted content; and turning isolated blogs into a network that grows stronger together.</p>
      <h2>Why Now</h2>
      <p>The creator economy is booming and set to expand to over $500 billion by 2030 yet independent bloggers are underserved.</p>
      <ul>
        <li>30M+ bloggers worldwide run their own sites, many as full/part-time businesses.</li>
        <li>They face rising acquisition costs, SEO battles, and reliance on volatile platforms.</li>
        <li>The old engines of discovery ie blogrolls, organic linking, curated directories — are disappearing.</li>
      </ul>
      <p>BlogRolly revives and modernises these engines, building a self-reinforcing discovery network that scales exponentially.</p>
      <h2>Join the Investor Community</h2>
      <p>Investors get exclusive access to:</p>
      <ul>
        <li>Our private dashboard</li>
        <li>Live performance metrics</li>
        <li>Early investment opportunities</li>
      </ul>
      <div style={{ display: 'flex', gap: '1rem', margin: '1.5rem 0' }}>
        <Link href="/investor/verify" passHref legacyBehavior>
          <a className={styles.brandButton}>Create Account</a>
        </Link>
        <Link href="/investor/dashboard" passHref legacyBehavior>
          <a className={styles.secondaryButton}>Sign In</a>
        </Link>
      </div>
      <h2>How We’ll Win</h2>
      <ul>
        <li>Serve the overlooked — A platform designed specifically for self-hosted and independent bloggers.</li>
        <li>Rebuild lost infrastructure — Organic linking, curated collections, and visibility that rewards quality.</li>
        <li>Fuel monetisation — More visibility means more readers. More readers create more opportunities for creators to monetise through ads, sponsorships, products, or services — on their own terms.</li>
      </ul>
      <h2>Product Roadmap — Building in Public</h2>
      <b>MVP Launch — Sept 2025</b>
      <ul>
        <li>Blogger directory submissions (searchable)</li>
        <li>Reader onboarding + interest-based exploration</li>
        <li>Early engagement tools (save, follow)</li>
        <li>SEO-friendly profiles</li>
      </ul>
      <b>Phase 2 — Oct 2025 –Early 2026</b>
      <ul>
        <li>Blogger and Investor analytics dashboard</li>
        <li>Value-based curated tagging and categories (Blog Collections)</li>
      </ul>
      <b>Vision — Mid 2026 and Beyond</b>
      <ul>
        <li>Dynamic AI-assisted blog collections answering niche search queries</li>
        <li>Monetisation layers for advocates (affiliate programs, partnerships)</li>
        <li>Indie press tools (newsletter syndication, blogger events)</li>
      </ul>
      <p>BlogRolly isn’t just a platform — it’s the connective tissue of the independent web.<br />
      Invest now, and be part of the growth engine that grows stronger with every new voice.<br />
      Together, we can return power to creators.</p>
      <div style={{ margin: '2rem 0' }}>
        <Link href="/investor/verify" passHref legacyBehavior>
          <a className={styles.brandButton}>Create an Investor Account</a>
        </Link>
      </div>
    </div>
  </Layout>
);

export default InvestorPage;
