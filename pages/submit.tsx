
import type { NextPage } from "next";
import Layout from "../components/Layout";
import BlogSubmissionForm from "../components/BlogSubmissionForm";
import styles from "../styles/Home.module.css";

const Submit: NextPage = () => {
  const handleFormSubmit = (formData: any) => {
    // TODO: Integrate with Supabase
    console.log('Form submitted:', formData);
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

      <div className={styles.features}>
        <div className={styles.feature}>
          <h3>📝 Easy Submission</h3>
          <p>Quick form to add your blog recommendations</p>
        </div>
        <div className={styles.feature}>
          <h3>✅ Quality Review</h3>
          <p>Our team reviews all submissions for quality</p>
        </div>
        <div className={styles.feature}>
          <h3>🌟 Get Featured</h3>
          <p>Great blogs get featured on our homepage</p>
        </div>
      </div>

      <BlogSubmissionForm onSubmit={handleFormSubmit} />
    </Layout>
  );
};

export default Submit;
