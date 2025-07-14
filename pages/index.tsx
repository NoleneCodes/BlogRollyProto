import type { NextPage } from "next";
import Layout from "../components/Layout";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  return (
    <Layout title="Blogrolly - Your Personal Blog Directory">
      <div className={styles.hero}>
        <h1 className={styles.title}>Blogrolly</h1>
        <p className={styles.description}>
          Discover and organise your favourite blogs in one place
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
    </Layout>
  );
};

export default Home;
