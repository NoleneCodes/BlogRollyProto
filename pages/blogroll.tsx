
import type { NextPage } from "next";
import Layout from "../components/Layout";
import styles from "../styles/Home.module.css";

const Blogroll: NextPage = () => {
  return (
    <Layout title="The Blogroll - Blogrolly">
      <div className={styles.hero}>
        <h1 className={styles.title}>The Blogroll</h1>
        <p className={styles.description}>
          Discover amazing blogs curated by our community
        </p>
      </div>

      <div className={styles.features}>
        <div className={styles.feature}>
          <h3>🎯 Featured Blogs</h3>
          <p>Hand-picked blogs from various categories</p>
        </div>
        <div className={styles.feature}>
          <h3>🔥 Trending Now</h3>
          <p>Most popular blogs this week</p>
        </div>
        <div className={styles.feature}>
          <h3>🆕 Latest Additions</h3>
          <p>Recently added blogs to explore</p>
        </div>
      </div>
    </Layout>
  );
};

export default Blogroll;
