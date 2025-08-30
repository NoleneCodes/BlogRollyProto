
import { GetStaticProps, GetStaticPaths, NextPage } from 'next';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import { getInternalBlogPostBySlug, getAllInternalBlogPosts, InternalBlogPost } from '../../../lib/internalBlogData';
import styles from '../../../styles/Home.module.css';

interface BlogPostPageProps {
  post: InternalBlogPost | null;
}

const BlogPostPage: NextPage<BlogPostPageProps> = ({ post }) => {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  if (!post) {
    return (
      <Layout title="Post Not Found - BlogRolly">
        <div className={styles.container}>
          <div className={styles.hero}>
            <h1 className={styles.title}>Post Not Found</h1>
            <p className={styles.description}>
              The blog post you're looking for doesn't exist.
            </p>
            <div className={styles.cta}>
              <a href="/blog" className={styles.primaryButton}>
                Back to Blog
              </a>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Layout title={`${post.title} - BlogRolly`}>
      <div className={styles.container}>
        <article className={styles.blogPost}>
          <div className={styles.blogPostHeader}>
            <div className={styles.breadcrumb}>
              <a href="/blog" className={styles.breadcrumbLink}>Blog</a>
              <span className={styles.breadcrumbSeparator}>/</span>
              <span className={styles.breadcrumbCurrent}>{post.title}</span>
            </div>
            
            <h1 className={styles.blogPostTitle}>{post.title}</h1>
            
            <div className={styles.blogPostMeta}>
              <span className={styles.blogPostAuthor}>
                By {post.bloggerDisplayName || post.author}
              </span>
              <span className={styles.blogPostDate}>
                {formatDate(post.publishDate)}
              </span>
              {post.readTime && (
                <span className={styles.blogPostReadTime}>
                  • {post.readTime}
                </span>
              )}
            </div>

            <div className={styles.blogPostTags}>
              {post.tags.map((tag, index) => (
                <span key={index} className={styles.blogPostTag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {post.imageUrl && (
            <div className={styles.blogPostImage}>
              <img src={post.imageUrl} alt={post.title} />
            </div>
          )}

          <div className={styles.blogPostContent}>
            <p>{post.description}</p>
            {post.content && (
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            )}
          </div>

          <div className={styles.blogPostFooter}>
            <div className={styles.blogPostCategory}>
              Category: <span>{post.category}</span>
            </div>
            <div className={styles.blogPostActions}>
              <a href="/blog" className={styles.backToBlogButton}>
                ← Back to Blog
              </a>
            </div>
          </div>
        </article>
      </div>
    </Layout>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = getAllInternalBlogPosts();
  const paths = posts.map((post) => ({
    params: { slug: post.slug },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<BlogPostPageProps> = async ({ params }) => {
  const slug = params?.slug as string;
  const post = getInternalBlogPostBySlug(slug);

  return {
    props: {
      post,
    },
  };
};

export default BlogPostPage;
