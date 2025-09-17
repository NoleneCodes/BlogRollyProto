import type { NextPage } from "next";
import Link from "next/link";
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
          Insights, updates, and stories to help you grow as an independent blogger.
        </p>
        <div className={styles.cta}>
          <Link href="/auth" passHref legacyBehavior>
            <a className={styles.brandButton}>Join The Movement</a>
          </Link>
        </div>
      </div>

      <div className={styles.missionSection}>
        <h2>Welcome to the Movement</h2>
        <p>Hey,  thanks for stopping by the BlogRolly blog.</p>
        <p>Here, we share the lessons we’re learning as we build BlogRolly, along with insights, tips, and stories designed to help you thrive as an indie blogger.</p>
        <p>Think of it as an open notebook:</p>
        <ul>
          <li>Behind the Scenes — how we’re building BlogRolly and why</li>
          <li>Guides & Insights — practical ideas to grow your reach</li>
          <li>Community Stories — highlighting the voices and journeys of bloggers like you</li>
        </ul>
        <p>We’re all figuring this out together and by reading, sharing, and adding your voice, you’re part of a bigger shift toward an open, connected web.</p>
        <p>Thanks for being here. Let’s grow together.</p>
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