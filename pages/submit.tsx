
import type { NextPage } from "next";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import styles from "../styles/Home.module.css";

const Submit: NextPage = () => {
  const router = useRouter();

  const handleSignInClick = () => {
    router.push('/auth?tab=blogger');
  };

  return (
    <Layout title="Submit a Blog - Blogrolly">
      <div className={styles.hero}>
        <h1 className={styles.title}>Submit a Blog</h1>
        <p className={styles.description}>
          Share your favorite blog with the Blogrolly community
        </p>
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
        
        <div style={{
          marginTop: '2rem',
          textAlign: 'left',
          maxWidth: '600px',
          margin: '2rem auto 0 auto'
        }}>
          <h3 style={{
            fontSize: '1.2rem',
            marginBottom: '1rem',
            color: '#374151',
            textAlign: 'center'
          }}>
            Why do I need to sign in?
          </h3>
          <ul style={{
            fontSize: '1rem',
            color: '#6b7280',
            lineHeight: '1.6',
            paddingLeft: '1.5rem'
          }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Quality control:</strong> We verify all submissions to maintain a high-quality directory
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Spam prevention:</strong> Account verification helps us keep the platform free from spam and low-quality content
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Manage your submissions:</strong> Track and edit your blog submissions from your dashboard
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Community features:</strong> Connect with other bloggers and readers in our community
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Ownership verification:</strong> We ensure only blog owners can submit their content
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default Submit;
