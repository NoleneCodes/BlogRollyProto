import type { NextPage } from "next";
import Layout from "../components/Layout";
import AuthForm from "../components/AuthForm";
import styles from "../styles/Home.module.css";

const Auth: NextPage = () => {
  return (
    <Layout 
      title="Sign Up/In - BlogRolly"
      description="Join the BlogRolly community to discover, save and organize your favorite independent blogs. Connect with creators and readers who value quality content."
      canonical="https://blogrolly.com/auth"
    >
      <div className={styles.pageWrapper}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Join BlogRolly</h1>
          <p className={styles.description}>
            Discover and connect with independent voices across the web
          </p>
        </div>

        <div className={styles.contentSection}>
            <div className={styles.authFormContainer}>
              <AuthForm />
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;