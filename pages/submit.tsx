
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import BlogSubmissionForm from "../components/BlogSubmissionForm";
import styles from "../styles/Home.module.css";

interface UserInfo {
  id: string;
  name: string;
  roles: string[];
  displayName?: string;
}

const Submit: NextPage = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth-check');
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated) {
            const user = {
              id: data.userId,
              name: data.userName,
              roles: data.userRoles ? data.userRoles.split(',') : [],
              displayName: data.userName // This would come from user profile in real implementation
            };
            setUserInfo(user);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleSignInClick = () => {
    router.push('/auth?tab=blogger');
  };

  const handleBlogSubmit = (formData: any) => {
    // TODO: Submit to backend with blogger information
    console.log('Blog submitted by blogger:', {
      ...formData,
      bloggerId: userInfo?.id,
      bloggerDisplayName: userInfo?.displayName || userInfo?.name
    });
    alert('Blog submitted successfully! It will be reviewed before being published.');
  };

  if (isLoading) {
    return (
      <Layout title="Submit a Blog - Blogrolly">
        <div className={styles.hero}>
          <h1 className={styles.title}>Loading...</h1>
        </div>
      </Layout>
    );
  }

  // Check if user is authenticated and is a blogger
  const isBlogger = userInfo && (
    userInfo.roles.includes('blogger') || 
    userInfo.roles.includes('admin') ||
    // For demo purposes, consider all authenticated users as potential bloggers
    userInfo.id
  );

  if (userInfo && isBlogger) {
    return (
      <Layout title="Submit a Blog - Blogrolly">
        <div className={styles.hero}>
          <h1 className={styles.title}>Submit a Blog</h1>
          <p className={styles.description}>
            Share your blog post with the Blogrolly community
          </p>
        </div>

        <BlogSubmissionForm 
          onSubmit={handleBlogSubmit}
          displayName={userInfo.displayName || userInfo.name}
          bloggerId={userInfo.id}
          isBlogger={true}
        />
      </Layout>
    );
  }

  return (
    <Layout title="Submit a Blog - Blogrolly">
      <div className={styles.hero}>
        <h1 className={styles.title}>Submit a Blog</h1>
        <p className={styles.description}>
          Share your favourite blog with the Blogrolly community
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
          Blogger Account Required
        </h2>
        <p style={{ 
          fontSize: '1.1rem', 
          marginBottom: '2rem',
          color: '#6b7280',
          maxWidth: '600px',
          margin: '0 auto 2rem auto'
        }}>
          To submit a blog post to Blogrolly, you need to sign up as a blogger. 
          This ensures quality content and allows you to manage your submissions.
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
          Sign Up as Blogger
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
            Why blogger accounts only?
          </h3>
          <ul style={{
            fontSize: '1rem',
            color: '#6b7280',
            lineHeight: '1.6',
            paddingLeft: '1.5rem'
          }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Content ownership:</strong> Only blog owners can submit their own content
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Quality assurance:</strong> Verified bloggers help maintain high content standards
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Author attribution:</strong> Proper credit and links back to the original blogger
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Community building:</strong> Connect with other bloggers and build your audience
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default Submit;
