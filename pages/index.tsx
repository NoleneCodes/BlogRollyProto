import type { NextPage } from "next";
import Layout from "../components/Layout";
import SearchBar from "../components/SearchBar";
import PersonalizedBlogroll from "../components/PersonalizedBlogroll";
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
          <SearchBar 
            placeholder="Search blogs, topics, or authors..."
            showAdvancedFilters={false}
            className={styles.heroSearchBar}
          />
        </div>
      </div>

      {/* Personalized Blog Recommendations */}
      <PersonalizedBlogroll maxItems={6} showHeader={true} />
    </Layout>
  );
};

export default Home;
