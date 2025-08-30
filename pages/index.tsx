import type { NextPage } from "next";
import { useState } from "react";
import Layout from "../components/Layout";
import SearchBar from "../components/SearchBar";
import PersonalizedBlogroll from "../components/PersonalizedBlogroll";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const [showBlogroll, setShowBlogroll] = useState(false);

  return (
    <Layout title="Blogrolly - Your Personal Blog Directory">
      <div className={styles.hero}>
        <h1 className={styles.title}>BlogRolly</h1>
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

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button 
            onClick={() => setShowBlogroll(!showBlogroll)}
            style={{
              background: '#c42142',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            {showBlogroll ? 'Hide' : 'Show'} Blog Recommendations
          </button>
        </div>
      </div>

      {/* Featured Content Section */}
      <div style={{ 
        padding: '3rem 2rem', 
        maxWidth: '1200px', 
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#374151', marginBottom: '1rem' }}>Welcome to BlogRolly</h2>
        <p style={{ color: '#6b7280', fontSize: '1.1rem', marginBottom: '2rem' }}>
          The human way to discover and organize your favorite blogs
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          marginTop: '2rem'
        }}>
          <div style={{
            background: '#f9fafb',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ color: '#c42142', marginBottom: '1rem' }}>Discover Blogs</h3>
            <p style={{ color: '#6b7280' }}>Find new blogs to read based on your interests</p>
          </div>
          
          <div style={{
            background: '#f9fafb',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ color: '#c42142', marginBottom: '1rem' }}>Submit Your Blog</h3>
            <p style={{ color: '#6b7280' }}>Get your blog discovered by new readers</p>
          </div>
          
          <div style={{
            background: '#f9fafb',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ color: '#c42142', marginBottom: '1rem' }}>Join Community</h3>
            <p style={{ color: '#6b7280' }}>Connect with other bloggers and readers</p>
          </div>
        </div>
      </div>

      {/* Conditionally render PersonalizedBlogroll */}
      {showBlogroll && (
        <div style={{ padding: '0 2rem' }}>
          <PersonalizedBlogroll maxItems={6} showHeader={true} />
        </div>
      )}
    </Layout>
  );
};

export default Home;