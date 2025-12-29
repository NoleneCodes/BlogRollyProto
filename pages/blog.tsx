import type { NextPage } from "next";
import Link from "next/link";
import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import InternalBlogCard from "../components/InternalBlogCard";
import { getInternalBlogPosts, InternalBlogPost } from "../lib/internalBlogData";
import styles from "../styles/Blog.module.css";
import blogCardStyles from "../styles/BlogCard.module.css";

const Blog: NextPage = () => {
  const [blogPosts, setBlogPosts] = useState<InternalBlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const posts = await getInternalBlogPosts();
        setBlogPosts(posts);
      } catch (error) {
        console.error('Failed to fetch blog posts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <Layout 
      title="Our Blog - BlogRolly"
      description="The BlogRolly Blog: tips to grow your blog, insights on the creator economy, platform news, and stories from our blogging community."
      canonical="https://blogrolly.com/blog"
    >
      <div className={styles.pageWrapper}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Our Blog</h1>
          <p className={styles.description}>
            Insights, updates, and stories to help you grow as an independent blogger.
          </p>
          <div className={styles.ctaButtonContainer}>
            <Link href="/auth" passHref legacyBehavior>
              <a className={styles.ctaButton}>Join The Movement</a>
            </Link>
          </div>
        </div>

        <div className={styles.contentSection}>
          <div className={styles.welcomeSection}>
            <h2 className={styles.sectionTitle}>Welcome to the Movement</h2>
            
            <div className={styles.introText}>
              <p className={styles.welcomeText}>
                Hey, thanks for stopping by the BlogRolly blog.
              </p>
              <p className={styles.welcomeText}>
                Here, we share the lessons we're learning as we build BlogRolly, along with insights, tips, and stories designed to help you thrive as an indie blogger.
              </p>
            </div>

            <div className={styles.notebookSection}>
              <p className={styles.notebookIntro}>Think of it as an open notebook:</p>
              
              <div className={styles.topicsGrid}>
                <div className={styles.topicItem}>
                  <h4 className={styles.topicHeading}>Behind the Scenes</h4>
                  <p className={styles.topicText}>
                    How we're building BlogRolly and why we're doing it this way.
                  </p>
                </div>
                <div className={styles.topicItem}>
                  <h4 className={styles.topicHeading}>Guides & Insights</h4>
                  <p className={styles.topicText}>
                    Practical ideas and strategies to grow your reach and engage your audience.
                  </p>
                </div>
                <div className={styles.topicItem}>
                  <h4 className={styles.topicHeading}>Community Stories</h4>
                  <p className={styles.topicText}>
                    Highlighting the voices and journeys of bloggers like you.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.communityMessage}>
              <p className={styles.messageText}>
                We're all figuring this out together and by reading, sharing, and adding your voice, you're part of a bigger shift toward an open, connected web.
              </p>
              <p className={styles.messageText}>
                Thanks for being here. Let's grow together.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className={styles.loadingSection}>
              <div className={styles.loadingContainer}>
                <h3 className={styles.loadingTitle}>Loading our latest posts...</h3>
                <p className={styles.loadingText}>Just a moment while we gather our stories.</p>
              </div>
            </div>
          ) : blogPosts.length > 0 ? (
            <div className={styles.postsSection}>
              <h2 className={styles.sectionTitle}>Latest Posts</h2>
              <div className={styles.postsGrid}>
                {blogPosts.map((post) => (
                  <div key={post.id} className={styles.postWrapper}>
                    <InternalBlogCard
                      blog={post}
                      showAuthor={true}
                      showSaveButton={false}
                      compact={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.emptySection}>
              <div className={styles.emptyContainer}>
                <h3 className={styles.emptyTitle}>Coming Soon</h3>
                <p className={styles.emptyText}>
                  We're working on some great content for you. Check back soon for insights, tips, and stories from the independent blogging community.
                </p>
                <div className={styles.emptyCtaContainer}>
                  <Link href="/auth" passHref legacyBehavior>
                    <a className={styles.emptyCtaButton}>Join Our Community</a>
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className={styles.joinSection}>
            <h2 className={styles.sectionTitle}>Ready to Join?</h2>
            <p className={styles.joinDescription}>
              Become part of the movement to reclaim the independent web. Share your voice, discover new blogs, and help build a community that values quality over clicks.
            </p>
            <div className={styles.joinButtonContainer}>
              <Link href="/submit" passHref legacyBehavior>
                <a className={styles.joinButton}>Submit Your Blog</a>
              </Link>
              <Link href="/auth" passHref legacyBehavior>
                <a className={styles.joinButtonSecondary}>Sign Up as Reader</a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Blog;