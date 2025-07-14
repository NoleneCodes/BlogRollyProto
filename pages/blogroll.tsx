import type { NextPage } from "next";
import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import BlogCard from "../components/BlogCard";
import styles from "../styles/Home.module.css";
import blogCardStyles from "../styles/BlogCard.module.css";

interface BlogPost {
  id: string;
  image?: string;
  title: string;
  author: string;
  authorProfile: string;
  description: string;
  category: string;
  tags: string[];
  postUrl: string;
  dateAdded: string;
  isRead?: boolean;
  isSaved?: boolean;
}

// Mock data - replace with actual API call
const mockBlogs: BlogPost[] = [
  {
    id: '1',
    image: "https://picsum.photos/300/200?random=1",
    title: "The Complete Guide to Building a Sustainable Morning Routine That Actually Works",
    author: "Sarah Johnson",
    authorProfile: "/blogger/sarah-johnson",
    description: "Discover the science-backed strategies for creating a morning routine that sticks. From optimizing your sleep schedule to choosing the right activities, this comprehensive guide covers everything you need to know about starting your day right and maintaining consistency over time.",
    category: "Lifestyle",
    tags: ["Morning Routine", "Productivity", "Self-Care"],
    postUrl: "https://example.com/morning-routine-guide",
    dateAdded: "2024-01-15",
    isRead: false,
    isSaved: false
  },
  {
    id: '2',
    image: "https://picsum.photos/300/200?random=2",
    title: "Mental Health in Tech",
    author: "Alex Chen",
    authorProfile: "/blogger/alex-chen",
    description: "An honest look at burnout, stress, and finding balance in the fast-paced world of technology.",
    category: "Health & Wellness",
    tags: ["Mental Health", "Tech", "Burnout Recovery"],
    postUrl: "https://example.com/mental-health-tech",
    dateAdded: "2024-01-14",
    isRead: true,
    isSaved: true
  },
  {
    id: '3',
    image: "https://picsum.photos/300/200?random=3",
    title: "Cooking Adventures: Simple Recipes for Busy Lives",
    author: "Maria Rodriguez",
    authorProfile: "/blogger/maria-rodriguez",
    description: "Quick and delicious meals that don't compromise on flavor or nutrition.",
    category: "Food & Drink",
    tags: ["Cooking", "Quick Meals", "Healthy Eating"],
    postUrl: "https://example.com/cooking-adventures",
    dateAdded: "2024-01-13",
    isRead: false,
    isSaved: false
  }
];

const Blogroll: NextPage = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>(mockBlogs);
  const [filter, setFilter] = useState<string>("all");

  const toggleSave = (blogId: string) => {
    setBlogs(prev => prev.map(blog => 
      blog.id === blogId ? { ...blog, isSaved: !blog.isSaved } : blog
    ));
  };

  const markAsRead = (blogId: string) => {
    setBlogs(prev => prev.map(blog => 
      blog.id === blogId ? { ...blog, isRead: true } : blog
    ));
  };

  const filteredBlogs = filter === "all" ? blogs : blogs.filter(blog => blog.category === filter);

  return (
    <Layout title="The Blogroll - Blogrolly">
      <div className={styles.hero}>
        <h1 className={styles.title}>The Blogroll</h1>
        <p className={styles.description}>
          Discover amazing blogs curated by our community
        </p>
      </div>

      <div className={blogCardStyles.filterSection}>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className={blogCardStyles.filterSelect}
        >
          <option value="all">All Categories</option>
          <option value="Lifestyle">Lifestyle</option>
          <option value="Health & Wellness">Health & Wellness</option>
          <option value="Food & Drink">Food & Drink</option>
          <option value="Tech & Digital Life">Tech & Digital Life</option>
          <option value="Creative Expression">Creative Expression</option>
        </select>
      </div>

      <div className={blogCardStyles.blogGrid}>
        {filteredBlogs.map((blog) => (
          <BlogCard
            key={blog.id}
            blog={blog}
            onToggleSave={toggleSave}
            onMarkAsRead={markAsRead}
            showAuthor={true}
            showSaveButton={true}
          />
        ))}
      </div>
    </Layout>
  );
};

export default Blogroll;