
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
        padding: '3rem 1rem',
        backgroundColor: '#f9fafb',
        margin: '2rem 0',
        borderRadius: '12px'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '1.8rem', 
            marginBottom: '1rem',
            color: '#374151',
            textAlign: 'center'
          }}>
            Blogger Account Required
          </h2>
          <p style={{ 
            fontSize: '1.1rem', 
            marginBottom: '2.5rem',
            color: '#6b7280',
            textAlign: 'center',
            lineHeight: '1.6'
          }}>
            To submit a blog post to BlogRolly, you'll need to sign up as a blogger. 
            This helps us keep the content authentic, high quality, and properly credited.
          </p>

          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <button 
              onClick={handleSignInClick}
              style={{
                background: '#c42142',
                color: 'white',
                border: 'none',
                padding: '1rem 2.5rem',
                borderRadius: '8px',
                fontSize: '1.2rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(196, 33, 66, 0.25)',
                minWidth: '250px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#a01835';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(196, 33, 66, 0.35)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#c42142';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(196, 33, 66, 0.25)';
              }}
            >
              Sign Up as Blogger
            </button>
          </div>

          {/* Why Blogger Accounts Only */}
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{
              fontSize: '1.4rem',
              marginBottom: '1.5rem',
              color: '#374151',
              textAlign: 'center'
            }}>
              Why Blogger Accounts Only?
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              textAlign: 'left'
            }}>
              <div>
                <h4 style={{ color: '#c42142', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Content Ownership
                </h4>
                <p style={{ color: '#6b7280', lineHeight: '1.5', margin: 0 }}>
                  Only blog owners can submit their own work
                </p>
              </div>
              <div>
                <h4 style={{ color: '#c42142', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Quality Assurance
                </h4>
                <p style={{ color: '#6b7280', lineHeight: '1.5', margin: 0 }}>
                  Verified bloggers help us keep standards high
                </p>
              </div>
              <div>
                <h4 style={{ color: '#c42142', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Author Attribution
                </h4>
                <p style={{ color: '#6b7280', lineHeight: '1.5', margin: 0 }}>
                  We link directly to your blog and give you full credit
                </p>
              </div>
              <div>
                <h4 style={{ color: '#c42142', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Community Building
                </h4>
                <p style={{ color: '#6b7280', lineHeight: '1.5', margin: 0 }}>
                  Connect with other writers and grow your audience
                </p>
              </div>
            </div>
          </div>

          {/* Why Join */}
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{
              fontSize: '1.4rem',
              marginBottom: '1rem',
              color: '#374151',
              textAlign: 'center'
            }}>
              Why Join?
            </h3>
            <p style={{
              fontSize: '1.1rem',
              color: '#c42142',
              fontWeight: '600',
              textAlign: 'center',
              marginBottom: '1.5rem',
              fontStyle: 'italic'
            }}>
              We're here to amplify indie blogs—not just list them.<br />
              You focus on writing; we'll help bring the readers.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              textAlign: 'left'
            }}>
              <div>
                <h4 style={{ color: '#c42142', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Real Visibility
                </h4>
                <p style={{ color: '#6b7280', lineHeight: '1.5', margin: 0 }}>
                  Get discovered by people who are actually looking for blogs like yours
                </p>
              </div>
              <div>
                <h4 style={{ color: '#c42142', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Human Readers, Not Bots
                </h4>
                <p style={{ color: '#6b7280', lineHeight: '1.5', margin: 0 }}>
                  No fake clicks, just real engagement
                </p>
              </div>
              <div>
                <h4 style={{ color: '#c42142', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Free to Feature
                </h4>
                <p style={{ color: '#6b7280', lineHeight: '1.5', margin: 0 }}>
                  No paywalls, no gimmicks—just submit and shine
                </p>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div>
            <h3 style={{
              fontSize: '1.4rem',
              marginBottom: '1.5rem',
              color: '#374151',
              textAlign: 'center'
            }}>
              How It Works
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              textAlign: 'center'
            }}>
              <div style={{
                padding: '1.5rem',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '2px solid #f3f4f6'
              }}>
                <div style={{
                  backgroundColor: '#c42142',
                  color: 'white',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  margin: '0 auto 1rem auto'
                }}>
                  1
                </div>
                <h4 style={{ color: '#374151', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Create a Blogger Account
                </h4>
                <p style={{ color: '#6b7280', lineHeight: '1.5', margin: 0, fontSize: '0.95rem' }}>
                  Get access to your dashboard and manage submissions
                </p>
              </div>
              <div style={{
                padding: '1.5rem',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '2px solid #f3f4f6'
              }}>
                <div style={{
                  backgroundColor: '#c42142',
                  color: 'white',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  margin: '0 auto 1rem auto'
                }}>
                  2
                </div>
                <h4 style={{ color: '#374151', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Submit a Blog Post
                </h4>
                <p style={{ color: '#6b7280', lineHeight: '1.5', margin: 0, fontSize: '0.95rem' }}>
                  Share a live post from your main blog (not a teaser or redirect)
                </p>
              </div>
              <div style={{
                padding: '1.5rem',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '2px solid #f3f4f6'
              }}>
                <div style={{
                  backgroundColor: '#c42142',
                  color: 'white',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  margin: '0 auto 1rem auto'
                }}>
                  3
                </div>
                <h4 style={{ color: '#374151', fontWeight: '600', marginBottom: '0.5rem' }}>
                  We Review It
                </h4>
                <p style={{ color: '#6b7280', lineHeight: '1.5', margin: 0, fontSize: '0.95rem' }}>
                  A real person checks your post for quality, safety, and working links
                </p>
              </div>
              <div style={{
                padding: '1.5rem',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '2px solid #f3f4f6'
              }}>
                <div style={{
                  backgroundColor: '#c42142',
                  color: 'white',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  margin: '0 auto 1rem auto'
                }}>
                  4
                </div>
                <h4 style={{ color: '#374151', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Get Listed
                </h4>
                <p style={{ color: '#6b7280', lineHeight: '1.5', margin: 0, fontSize: '0.95rem' }}>
                  If approved, your blog appears on the Blogroll where readers can find and follow your work
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Submit;
