
import type { NextPage } from "next";
import Layout from "../components/Layout";
import styles from "../styles/Home.module.css";

const Blog: NextPage = () => {
  return (
    <Layout title="Our Blog - Blogrolly">
      <div className={styles.hero}>
        <h1 className={styles.title}>Our Blog</h1>
        <p className={styles.description}>
          Insights, updates, and stories from the Blogrolly team
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
      </div>

      <div className={styles.missionSection}>
        <h2>Latest Posts</h2>
        <p>
          Welcome to the BlogRolly blog! Here we share insights about the indie blogging ecosystem, 
          platform updates, and stories from our community of writers and readers.
        </p>
        
        <div className={styles.feature}>
          <h3>Coming Soon</h3>
          <p>
            We're working on bringing you regular content about blogging, discovery, 
            and building authentic online communities. Stay tuned for our first posts!
          </p>
        </div>
      </div>

      <div className={styles.whySection}>
        <h2>What You'll Find Here</h2>
        <ul className={styles.featureList}>
          <li>• Platform updates and new features</li>
          <li>• Interviews with indie bloggers</li>
          <li>• Tips for growing your blog audience</li>
          <li>• Industry insights and trends</li>
          <li>• Community spotlights and success stories</li>
        </ul>
        
        <div className={styles.submitCta}>
          <a href="/submit" className={styles.submitButton}>Submit Your Blog</a>
        </div>
      </div>
    </Layout>
  );
};

export default Blog;
