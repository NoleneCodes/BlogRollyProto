import type { NextPage } from "next";
import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import SearchBar from "../components/SearchBar";
import PersonalizedBlogroll from "../components/PersonalizedBlogroll";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const [showBlogroll, setShowBlogroll] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Layout 
        title="Discover Amazing Blogs - Blogrolly"
        description="Find and discover high-quality blogs curated by our community. Join thousands of readers exploring the best content on the web."
      >
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>
              Discover Amazing Blogs
            </h1>
            <p className={styles.description}>
              Find high-quality content from passionate creators
            </p>
            <SearchBar />
          </div>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          Loading...
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      title="Discover Amazing Blogs - Blogrolly"
      description="Find and discover high-quality blogs curated by our community. Join thousands of readers exploring the best content on the web."
    >
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            Discover Amazing Blogs
          </h1>
          <p className={styles.description}>
            Find high-quality content from passionate creators
          </p>
          <SearchBar />
        </div>
      </div>

      {/* Conditionally render PersonalizedBlogroll */}
      {showBlogroll && mounted && (
        <div style={{ padding: '0 2rem' }}>
          <PersonalizedBlogroll maxItems={6} showHeader={true} />
        </div>
      )}
    </Layout>
  );
};

export default Home;