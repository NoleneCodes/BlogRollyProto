import type { NextPage } from "next";
import Layout from "../components/Layout";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  return (
    <Layout title="Blogrolly - Your Personal Blog Directory">
      <div className={styles.hero}>
        <h1 className={styles.title}>Blogrolly</h1>
        <p className={styles.description}>
          Discover and organize your favorite blogs in one place
        </p>
        
        <div className={styles.searchSection}>
          <div className={styles.searchContainer}>
            <input 
              type="text" 
              placeholder="Search blogs, topics, or authors..." 
              className={styles.searchInput}
            />
            <button className={styles.searchButton}>Search</button>
            <button className={styles.aiSearchButton}>Ask Rolly</button>
          </div>
        </div>
      </div>

      <div className={styles.features}>
        <div className={styles.feature}>
          <h3>📚 Organize</h3>
          <p>Keep all your favorite blogs organized in one place</p>
        </div>
        <div className={styles.feature}>
          <h3>🔍 Discover</h3>
          <p>Find new blogs and content creators to follow</p>
        </div>
        <div className={styles.feature}>
          <h3>📱 Mobile Ready</h3>
          <p>Access your blog collection anywhere, anytime</p>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
