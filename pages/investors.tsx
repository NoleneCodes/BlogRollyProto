
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

      <div className={styles.features}>
        <div className={styles.feature}>
          <h3>📈 Growth</h3>
          <p>Rapid user adoption and engagement metrics</p>
        </div>
        <div className={styles.feature}>
          <h3>💡 Innovation</h3>
          <p>Cutting-edge AI-powered content discovery</p>
        </div>
        <div className={styles.feature}>
          <h3>🌍 Market</h3>
          <p>Expanding into global content curation market</p>
        </div>
      </div>
    </Layout>
  );
};

export default Investors;
