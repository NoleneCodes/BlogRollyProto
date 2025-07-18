import type { NextPage } from "next";
import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import InternalBlogCard from "../components/InternalBlogCard";
import { getInternalBlogPosts, InternalBlogPost } from "../lib/internalBlogData";
import styles from "../styles/Home.module.css";
import blogCardStyles from "../styles/BlogCard.module.css";

const Blog: NextPage = () => {
  const [blogPosts, setBlogPosts] = useState<InternalBlogPost[]>([]);

  useEffect(() => {
    const posts = getInternalBlogPosts();
    setBlogPosts(posts);
  }, []);

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

      {blogPosts.length > 0 && (
        <div className={styles.container}>
          <div className={blogCardStyles.blogGrid}>
            {blogPosts.map((post) => (
              <InternalBlogCard
                key={post.id}
                blog={post}
                showAuthor={true}
                showSaveButton={false}
                compact={false}
              />
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Blog;