
import type { NextPage } from "next";
import Layout from "../components/Layout";
import styles from "../styles/Home.module.css";

const Blog: NextPage = () => {
  return (
    <Layout title="Our Blog - Blogrolly">
      <div className={styles.hero}>
        <h1 className={styles.title}>Our Blog</h1>
        <p className={styles.description}>
          Insights, updates, and stories from the Blogrolly team
        </p>
      </div>

      <div className={styles.features}>
        <div className={styles.feature}>
          <h3>📝 Latest Posts</h3>
          <p>Stay updated with our newest articles and insights</p>
        </div>
        <div className={styles.feature}>
          <h3>🔍 Industry Trends</h3>
          <p>Deep dives into content discovery and curation trends</p>
        </div>
        <div className={styles.feature}>
          <h3>💭 Behind the Scenes</h3>
          <p>Stories from our development journey and team</p>
        </div>
      </div>
    </Layout>
  );
};

export default Blog;
