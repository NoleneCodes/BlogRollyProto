
import type { NextPage } from "next";
import Layout from "../components/Layout";
import styles from "../styles/Home.module.css";

const Auth: NextPage = () => {
  return (
    <Layout title="Sign Up/In - Blogrolly">
      <div className={styles.hero}>
        <h1 className={styles.title}>Sign Up/In</h1>
        <p className={styles.description}>
          Join the Blogrolly community to save and organize your favorite blogs
        </p>
      </div>

      <div className={styles.features}>
        <div className={styles.feature}>
          <h3>💾 Save Favorites</h3>
          <p>Bookmark your favorite blogs for easy access</p>
        </div>
        <div className={styles.feature}>
          <h3>📊 Personal Dashboard</h3>
          <p>Track your reading habits and preferences</p>
        </div>
        <div className={styles.feature}>
          <h3>🤝 Community Features</h3>
          <p>Share recommendations and connect with others</p>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
