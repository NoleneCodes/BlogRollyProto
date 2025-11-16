import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../lib/supabase';
import styles from '../styles/BlogCard.module.css';

interface BlogCardProps {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  imageDescription?: string;
  category: string;
  tags: string[];
  views?: number;
  clicks?: number;
  ctr?: number;
  createdAt: string;
  liveAt?: string;
  authorName?: string;
  authorUsername?: string;
  authorAvatar?: string;
  blogName?: string;
  authorBlogUrl?: string;
  isVerified?: boolean;
  featured?: boolean;
  socialShares?: number;
  readingTime?: number;
  hasAdultContent?: boolean;
  onRead?: (blogId: string) => void;
  isRead?: boolean;
}

export default function BlogCard({
  id,
  title,
  description,
  url,
  imageUrl,
  imageDescription,
  category,
  tags,
  views = 0,
  clicks = 0,
  ctr = 0,
  createdAt,
  liveAt,
  authorName,
  authorUsername,
  authorAvatar,
  blogName,
  authorBlogUrl,
  isVerified = false,
  featured = false,
  socialShares = 0,
  readingTime,
  hasAdultContent = false,
  onRead,
  isRead = false
}: BlogCardProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleClick = async () => {
    setIsClicking(true);
    
    try {
      // Track blog click for analytics
      await fetch('/api/analytics/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blogId: id })
      });

      // Mark as read if callback provided
      if (onRead) {
        onRead(id);
      }

      // Open blog in new window
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error tracking click:', error);
      // Still open the blog even if tracking fails
      window.open(url, '_blank');
    } finally {
      setIsClicking(false);
    }
  };

  const handleShare = async (platform: string) => {
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    };

    // Track social share
    try {
      await fetch('/api/analytics/track-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blogId: id, platform })
      });
    } catch (error) {
      console.error('Error tracking share:', error);
    }

    // Open share window
    if (shareUrls[platform as keyof typeof shareUrls]) {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
    }

    setShowShareMenu(false);
  };

  const handleRemoveRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch('/api/reading-history', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blogId: id })
      });
      
      if (onRead) {
        onRead(id);
      }
    } catch (error) {
      console.error('Error removing from reading history:', error);
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      if (isSaved) {
        // Remove from saved
        await fetch('/api/reader/saved', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ blogId: id })
        });
        setIsSaved(false);
      } else {
        // Add to saved
        await fetch('/api/reader/saved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ blogId: id })
        });
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error bookmarking:', error);
    }
  };

  return (
    <div className={`${styles.blogCard} ${featured ? styles.featuredCard : ''} ${isClicking ? styles.clicking : ''}`}>
      {/* Image Section with Badges */}
      <div className={styles.imageContainer}>
        {imageUrl && !imageError ? (
          <Image
            src={imageUrl}
            alt={imageDescription || title}
            width={400}
            height={250}
            className={styles.blogImage}
            onError={() => setImageError(true)}
            unoptimized={imageUrl.startsWith('http')}
          />
        ) : (
          <div className={styles.placeholderImage}>
            <svg 
              width="100%" 
              height="100%" 
              viewBox="0 0 400 250" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id={`grad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#e0e0e0', stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: '#f5f5f5', stopOpacity: 1}} />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill={`url(#grad-${id})`}/>
              <text 
                x="50%" 
                y="45%" 
                dominantBaseline="middle" 
                textAnchor="middle" 
                fontFamily="Arial, sans-serif" 
                fontSize="20" 
                fill="#999"
              >
                BlogRolly
              </text>
              <text 
                x="50%" 
                y="58%" 
                dominantBaseline="middle" 
                textAnchor="middle" 
                fontFamily="Arial, sans-serif" 
                fontSize="14" 
                fill="#bbb"
              >
                No Image Available
              </text>
            </svg>
          </div>
        )}
        
        {/* Category Badge (top left) */}
        <div className={styles.categoryBadge}>
          {category}
        </div>

        {/* Read Badge (top right) */}
        <div className={styles.readBadge}>
          Read
        </div>

        {/* Additional Status Badges */}
        {featured && (
          <div className={styles.featuredBadge}>
            ⭐ Featured
          </div>
        )}

        {hasAdultContent && (
          <div className={styles.adultBadge}>
            18+
          </div>
        )}

        {isRead && (
          <div className={styles.isReadBadge}>
            ✓ Read
            <button
              onClick={handleRemoveRead}
              className={styles.removeReadButton}
              title="Remove from reading history"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className={styles.content}>
        {/* Title */}
        <h3 className={styles.title}>{title}</h3>
        
        {/* Author Name */}
        <div className={styles.authorSection}>
          {authorBlogUrl ? (
            <Link href={`/blogger/${authorUsername}`} className={styles.authorLink}>
              {blogName || authorName}
              {isVerified && <span className={styles.verifiedBadge}>✓</span>}
            </Link>
          ) : (
            <span className={styles.authorName}>
              {authorName || 'Anonymous'}
              {isVerified && <span className={styles.verifiedBadge}>✓</span>}
            </span>
          )}
        </div>

        {/* Description */}
        <p className={styles.description}>{description}</p>

        {/* Tags */}
        {tags && Array.isArray(tags) && tags.length > 0 && (
          <div className={styles.tags}>
            {tags.slice(0, 3).map((tag, index) => (
              <span key={index} className={styles.tag}>
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className={styles.moreTagsIndicator}>
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button
            onClick={handleClick}
            className={styles.readMoreButton}
            disabled={isClicking}
          >
            {isClicking ? 'Opening...' : 'Read More'}
          </button>
          
          <button 
            className={`${styles.bookmarkButton} ${isSaved ? styles.bookmarked : ''}`}
            onClick={handleBookmark}
            aria-label="Bookmark this post"
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill={isSaved ? 'currentColor' : 'none'}
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Close share menu when clicking outside */}
      {showShareMenu && (
        <div 
          className={styles.shareOverlay}
          onClick={() => setShowShareMenu(false)}
        />
      )}
    </div>
  );
}