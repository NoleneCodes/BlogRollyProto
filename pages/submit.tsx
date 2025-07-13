
import type { NextPage } from "next";
import { useState } from "react";
import Layout from "../components/Layout";
import BlogSubmissionForm from "../components/BlogSubmissionForm";
import AuthForm from "../components/AuthForm";
import styles from "../styles/Home.module.css";

interface UserInfo {
  id: string;
  name: string;
  roles: string[];
}

const Submit: NextPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const handleAuthenticated = (user: UserInfo) => {
    setIsAuthenticated(true);
    setUserInfo(user);
  };

  const handleFormSubmit = (formData: any) => {
    // Add user info to the form submission
    const submissionData = {
      ...formData,
      submittedBy: {
        userId: userInfo?.id,
        userName: userInfo?.name,
        submittedAt: new Date().toISOString()
      }
    };
    
    // TODO: Integrate with Supabase
    console.log('Form submitted:', submissionData);
    alert('Thanks! Your post is in review and will appear soon.');
  };

  return (
    <Layout title="Submit a Blog - Blogrolly">
      <div className={styles.hero}>
        <h1 className={styles.title}>Submit a Blog</h1>
        <p className={styles.description}>
          Share your favorite blog with the Blogrolly community
        </p>
      </div>

      {!isAuthenticated ? (
        <AuthForm onAuthenticated={handleAuthenticated} />
      ) : (
        <BlogSubmissionForm onSubmit={handleFormSubmit} />
      )}
    </Layout>
  );
};

export default Submit;
