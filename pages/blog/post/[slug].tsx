import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import { FC } from 'react';
import Layout from '../../../components/Layout';
import { getInternalBlogPostBySlug, getAllInternalBlogPosts, InternalBlogPost } from '../../../lib/internalBlogData';
import styles from '../../../styles/Home.module.css';
import Link from "next/link";
import Image from 'next/image';

interface BlogPostPageProps {
  post: InternalBlogPost | null;
}
const BlogPostPage: FC<BlogPostPageProps> = ({ post }) => {
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
              The blog post you&apos;re looking for doesn&apos;t exist.
            </p>
            <div className={styles.cta}>
              <Link href="/blog" className={styles.primaryButton}>
                Back to Blog
              </Link>
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
              <Link href="/blog" passHref legacyBehavior>
                <a className={styles.breadcrumbLink}>Blog</a>
              </Link>
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
            <div className={styles.blogImage}>
              <Image 
                src={post.imageUrl} 
                alt={post.imageDescription || post.title} 
                width={800}
                height={400}
                style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', margin: '1rem 0' }}
              />
            </div>
          )}

          <div className={styles.blogPostContent}>
            <p>{post.description}</p>
            {post.content && (
              <div 
                className={styles.blogContent}
                dangerouslySetInnerHTML={{ 
                  __html: post.content.replace(
                    /!\[([^\]]*)\]\(([^)]+)\)/g, 
                    '<img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 8px; margin: 1rem 0;" />'
                  )
                }} 
              />
            )}
          </div>

          <div className={styles.blogPostFooter}>
            <div className={styles.blogPostCategory}>
              Category: <span>{post.category}</span>
            </div>
            <div className={styles.blogPostActions}>
              <Link href="/blog" passHref legacyBehavior>
                <a className={styles.backToBlogButton}>&larr; Back to Blog</a>
              </Link>
            </div>
          </div>
        </article>
      </div>
    </Layout>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {

  const posts = await getAllInternalBlogPosts();
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
  const post = await getInternalBlogPostBySlug(slug);

  // If no post found, return 404
  if (!post) {
    return { notFound: true };
  }

  return {
    props: {
      post: {
        ...post,
        imageUrl: post.imageUrl ?? null, // fixes the serialization error
        imageDescription: post.imageDescription ?? null,
        readTime: post.readTime ?? null,
      },
    },
  };
};

export default BlogPostPage;