import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import BlogSubmissionForm from "../components/BlogSubmissionForm";
import styles from "../styles/Submit.module.css";

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
              displayName: data.userName
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
    console.log('Blog submitted by blogger:', {
      ...formData,
      bloggerId: userInfo?.id,
      bloggerDisplayName: userInfo?.displayName || userInfo?.name
    });
    alert('Blog submitted successfully! It will be reviewed before being published.');
  };

  if (isLoading) {
    return (
      <Layout 
        title="Submit a Blog - Blogrolly"
        description="Submit your blog to BlogRolly and grow your audience. Add your blog, share your story, and connect with readers who are searching for new voices."
        canonical="https://blogrolly.com/submit"
      >
        <div className={styles.loadingContainer}>
          <h1 className={styles.loadingTitle}>Loading...</h1>
        </div>
      </Layout>
    );
  }

  // Check if user is authenticated and is a blogger
  const isBlogger = userInfo && (
    userInfo.roles.includes('blogger') || 
    userInfo.roles.includes('admin') ||
    userInfo.id
  );

  if (userInfo && isBlogger) {
    return (
      <Layout title="Submit a Blog - Blogrolly" canonical="https://blogrolly.com/submit">
        <div className={styles.hero}>
          <h1 className={styles.title}>Submit a Blog</h1>
          <p className={styles.description}>
            Share your blog post with the Blogrolly community
          </p>
        </div>

        <div className={styles.formContainer}>
          <BlogSubmissionForm 
            onSubmit={handleBlogSubmit}
            displayName={userInfo.displayName || userInfo.name}
            bloggerId={userInfo.id}
            isBlogger={true}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Submit a Blog - Blogrolly" canonical="https://blogrolly.com/submit">
      <div className={styles.hero}>
        <h1 className={styles.title}>Submit a Blog</h1>
        <p className={styles.description}>
          Share your blog with the Blogrolly community
        </p>
      </div>

      <div className={styles.authRequiredSection}>
        <div className={styles.authContent}>
          <h2 className={styles.authTitle}>
            Blogger Account Required
          </h2>
          <p className={styles.authDescription}>
            To submit a blog post to BlogRolly, you&apos;ll need to sign up as a blogger. 
            This helps us keep the content authentic, high quality, and properly credited.
          </p>

          <div className={styles.signInButtonContainer}>
            <button 
              onClick={() => router.push('/auth')}
              className={styles.signInButton}
            >
              Sign in as Blogger
            </button>
          </div>

          {/* Why Blogger Accounts Only */}
          <div className={styles.reasonsSection}>
            <h3 className={styles.reasonsTitle}>
              Why Blogger Accounts Only?
            </h3>
            <div className={styles.reasonsGrid}>
              <div className={styles.reasonItem}>
                <h4 className={styles.reasonHeading}>
                  Content Ownership
                </h4>
                <p className={styles.reasonText}>
                  Only blog owners can submit their own work
                </p>
              </div>
              <div className={styles.reasonItem}>
                <h4 className={styles.reasonHeading}>
                  Quality Assurance
                </h4>
                <p className={styles.reasonText}>
                  Verified bloggers help us keep standards high
                </p>
              </div>
              <div className={styles.reasonItem}>
                <h4 className={styles.reasonHeading}>
                  Author Attribution
                </h4>
                <p className={styles.reasonText}>
                  We link directly to your blog and give you full credit
                </p>
              </div>
              <div className={styles.reasonItem}>
                <h4 className={styles.reasonHeading}>
                  Community Building
                </h4>
                <p className={styles.reasonText}>
                  Connect with other writers and grow your audience
                </p>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className={styles.processSection}>
            <h3 className={styles.processTitle}>
              How It Works
            </h3>
            <div className={styles.processGrid}>
              <div className={styles.processStep}>
                <div className={styles.stepNumber}>1</div>
                <h4 className={styles.stepTitle}>
                  Create a Blogger Account
                </h4>
                <p className={styles.stepText}>
                  Get access to your dashboard and manage submissions
                </p>
              </div>
              <div className={styles.processStep}>
                <div className={styles.stepNumber}>2</div>
                <h4 className={styles.stepTitle}>
                  Submit a Blog Post
                </h4>
                <p className={styles.stepText}>
                  Share a live post from your main blog (not a teaser or redirect)
                </p>
              </div>
              <div className={styles.processStep}>
                <div className={styles.stepNumber}>3</div>
                <h4 className={styles.stepTitle}>
                  We Review It
                </h4>
                <p className={styles.stepText}>
                  A real person checks your post for quality, safety, and working links
                </p>
              </div>
              <div className={styles.processStep}>
                <div className={styles.stepNumber}>4</div>
                <h4 className={styles.stepTitle}>
                  Get Listed
                </h4>
                <p className={styles.stepText}>
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