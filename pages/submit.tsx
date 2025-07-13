
import type { NextPage } from "next";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import styles from "../styles/Home.module.css";

const Submit: NextPage = () => {
  const router = useRouter();

  const handleSignInClick = () => {
    router.push('/auth');
  };

  return (
    <Layout title="Submit a Blog - Blogrolly">
      <div className={styles.hero}>
        <h1 className={styles.title}>Submit a Blog</h1>
        <p className={styles.description}>
          Share your favorite blog with the Blogrolly community
        </p>
      </div>

      <div className={styles.features}>
        <div className={styles.feature}>
          <h3>📝 Share Your Blog</h3>
          <p>Submit your blog to be featured in our community directory</p>
        </div>
        <div className={styles.feature}>
          <h3>🌟 Get Discovered</h3>
          <p>Connect with readers who are passionate about your content</p>
        </div>
        <div className={styles.feature}>
          <h3>📈 Grow Your Audience</h3>
          <p>Reach new readers and expand your blog's influence</p>
        </div>
      </div>

      <div style={{ 
        textAlign: 'center', 
        padding: '3rem 1rem',
        backgroundColor: '#f9fafb',
        margin: '2rem 0',
        borderRadius: '12px'
      }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          marginBottom: '1rem',
          color: '#374151'
        }}>
          Ready to Submit Your Blog?
        </h2>
        <p style={{ 
          fontSize: '1.1rem', 
          marginBottom: '2rem',
          color: '#6b7280',
          maxWidth: '600px',
          margin: '0 auto 2rem auto'
        }}>
          To submit your blog to Blogrolly, you'll need to sign in or create an account. 
          This helps us maintain a quality community and allows you to manage your submissions.
        </p>
        <button 
          onClick={handleSignInClick}
          style={{
            background: '#c42142',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(196, 33, 66, 0.2)',
            minWidth: '200px'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#a01835';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(196, 33, 66, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#c42142';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(196, 33, 66, 0.2)';
          }}
        >
          Sign In to Submit
        </button>
      </div>
    </Layout>
  );
};

export default Submit;
