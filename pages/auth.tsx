
import type { NextPage } from "next";
import Layout from "../components/Layout";
import AuthForm from "../components/AuthForm";
import styles from "../styles/Home.module.css";

const Auth: NextPage = () => {
  return (
    <Layout title="Sign Up/In - Blogrolly">
      <div className={styles.hero}>
        <h1 className={styles.title}>Sign Up/In</h1>
        <p className={styles.description}>
          Join the Blogrolly community to save and organize your favorite blogs
        </p>
      </div>

      <AuthForm />
    </Layout>
  );
};

export default Auth;
