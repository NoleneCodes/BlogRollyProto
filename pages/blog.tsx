import type { NextPage } from "next";
import Layout from "../components/Layout";
import styles from "../styles/Home.module.css";

const Blog: NextPage = () => {
  return (
    <Layout title="Our Blog - BlogRolly">
      <div className={styles.hero}>
        <h1 className={styles.title}>Our Blog</h1>
        <p className={styles.description}>
          Insights, updates, and stories from the BlogRolly team
        </p>

        <div className={styles.cta}>
          <a href="/auth" className={styles.primaryButton}>Join us</a>
        </div>
      </div>

      <div className={styles.missionSection}>
        <p>Hey, welcome to the BlogRolly blog 👋</p>
        <p>We're sharing our journey, the ups, the pivots, and everything in between as we build a space for independent bloggers to get seen, heard, and supported.</p>
        <p>Think of this as our behind-the-scenes notebook, shared out loud.</p>
        <p>Thanks for being here.</p>
      </div>
    </Layout>
  );
};

export default Blog;