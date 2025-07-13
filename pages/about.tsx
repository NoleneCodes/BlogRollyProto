
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

      <div className={styles.pronunciationCard}>
        <h3>Pronunciation: Blog-Roll-Lee</h3>
        <div className={styles.definition}>
          <strong>Definition:</strong><br />
          Blogroll – A list of hyperlinks to blogs or websites.
        </div>
      </div>
    </Layout>
  );
};

export default About;
