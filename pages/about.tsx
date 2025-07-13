
import type { NextPage } from "next";
import Layout from "../components/Layout";
import styles from "../styles/Home.module.css";

const About: NextPage = () => {
  return (
    <Layout title="About - Blogrolly">
      <div className={styles.hero}>
        <h1 className={styles.title}>About Blogrolly</h1>
        <p className={styles.description}>
          Learn more about our mission to help you discover and organize your favorite blogs
        </p>
      </div>

      <div className={styles.features}>
        <div className={styles.feature}>
          <h3>🎯 Our Mission</h3>
          <p>To create the best platform for discovering and organizing blogs</p>
        </div>
        <div className={styles.feature}>
          <h3>👥 Our Team</h3>
          <p>Passionate developers and content enthusiasts</p>
        </div>
        <div className={styles.feature}>
          <h3>🚀 Our Vision</h3>
          <p>Making blog discovery accessible to everyone</p>
        </div>
      </div>
    </Layout>
  );
};

export default About;
