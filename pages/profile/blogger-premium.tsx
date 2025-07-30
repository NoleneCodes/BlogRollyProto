Adding BlogEditForm component and edit functionality to the premium blogger profile, including state management and UI updates.
```

```typescript
import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import BlogCard from '../../components/BlogCard';
import BlogSubmissionForm from '../../components/BlogSubmissionForm';
import BlogEditForm from '../../components/BlogEditForm';
import PremiumUpgradeButton from '../../components/PremiumUpgradeButton';
import styles from '../../styles/BloggerProfilePremium.module.css';

interface BlogSubmission {
  id: string;
  title: string;
  url: string;
  category: string;
  tags: string[];
  submissionDate: string;
  status: 'pending' | 'approved' | 'rejected';
  statusReason?: string;
  views: number;
  clicks: number;
}

const BloggerProfilePremium = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState({
    name: 'Sarah Johnson',
    username: 'sarah_johnson',
    email: 'sarah@mindfulproductivity.com',
    blogName: 'Mindful Productivity',
    blogUrl: 'https://mindfulproductivity.com',
    bio: 'Helping busy professionals find balance and productivity through mindful practices.',
    profilePicture: 'https://picsum.photos/150/150?random=1',
    memberSince: 'January 2024',
    subscriptionType: 'Pro'
  });
  const [mockSubmissions, setMockSubmissions] = useState<BlogSubmission[]>([
    {
      id: '1',
      title: 'The Power of Mindful Breaks',
      url: 'https://mindfulproductivity.com/mindful-breaks',
      category: 'Productivity',
      tags: ['mindfulness', 'productivity', 'balance'],
      submissionDate: '2024-02-01',
      status: 'approved',
      views: 150,
      clicks: 30
    },
    {
      id: '2',
      title: 'Creating a Sustainable Work Routine',
      url: 'https://mindfulproductivity.com/sustainable-routine',
      category: 'Productivity',
      tags: ['work routine', 'sustainability', 'time management'],
      submissionDate: '2024-02-15',
      status: 'approved',
      views: 120,
      clicks: 25
    },
    {
      id: '3',
      title: 'The Art of Saying No: Boundaries at Work',
      url: 'https://mindfulproductivity.com/saying-no-at-work',
      category: 'Career',
      tags: ['boundaries', 'work-life balance', 'communication'],
      submissionDate: '2024-03-01',
      status: 'pending',
      views: 80,
      clicks: 15,
      statusReason: 'Under review for clarity and target audience relevance.'
    },
    {
      id: '4',
      title: 'Mindful Communication Techniques',
      url: 'https://mindfulproductivity.com/mindful-communication',
      category: 'Communication',
      tags: ['mindfulness', 'communication', 'relationships'],
      submissionDate: '2024-03-15',
      status: 'rejected',
      views: 200,
      clicks: 45,
      statusReason: 'Content does not meet our quality standards.'
    }
  ]);

  const categories = [...new Set(mockSubmissions.map(submission => submission.category))];
  const allTags = mockSubmissions.flatMap(submission => submission.tags);
  const tags = [...new Set(allTags)];

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  const toggleSubmissionForm = () => {
    setShowSubmissionForm(!showSubmissionForm);
  };

  const addMockSubmission = (submission: Omit<BlogSubmission, 'id' | 'submissionDate' | 'status' | 'views' | 'clicks'>) => {
    const newSubmission: BlogSubmission = {
      id: Date.now().toString(),
      submissionDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      views: 0,
      clicks: 0,
      ...submission
    };
    setMockSubmissions(prev => [newSubmission, ...prev]);
    setShowSubmissionForm(false);
  };

  const handleDeleteSubmission = (id: string) => {
    setMockSubmissions(prev => prev.filter(submission => submission.id !== id));
  };

  const handleEditBlog = (blogId: string) => {
    setEditingBlog(blogId);
  };

  const saveEditedBlog = (blogId: string, updatedData: any) => {
    setMockSubmissions(prev => 
      prev.map(submission => 
        submission.id === blogId 
          ? { ...submission, ...updatedData }
          : submission
      )
    );
    setEditingBlog(null);
  };

  const cancelEditingBlog = () => {
    setEditingBlog(null);
  };

  return (
    <Layout>
      <div className={styles.premiumProfile}>
        <header className={styles.header}>
          <img src={userInfo.profilePicture} alt="Profile" className={styles.profilePicture} />
          <div className={styles.userInfo}>
            <h1>{userInfo.name}</h1>
            <p className={styles.username}>@{userInfo.username}</p>
            <p>{userInfo.bio}</p>
            <a href={userInfo.blogUrl} target="_blank" rel="noopener noreferrer" className={styles.blogLink}>
              Visit Blog: {userInfo.blogName}
            </a>
          </div>
        </header>

        <nav className={styles.tabs}>
          <button
            className={activeTab === 'overview' ? styles.active : ''}
            onClick={() => handleTabClick('overview')}
          >
            Overview
          </button>
          <button
            className={activeTab === 'myBlogroll' ? styles.active : ''}
            onClick={() => handleTabClick('myBlogroll')}
          >
            My Blogroll
          </button>
          <button
            className={activeTab === 'categories' ? styles.active : ''}
            onClick={() => handleTabClick('categories')}
          >
            Categories
          </button>
          <button
            className={activeTab === 'tags' ? styles.active : ''}
            onClick={() => handleTabClick('tags')}
          >
            Tags
          </button>
        </nav>

        <section className={styles.content}>
          {activeTab === 'overview' && (
            <div className={styles.overview}>
              <h2>Welcome to {userInfo.blogName}!</h2>
              <p>
                Here, you can manage your blog submissions, track their performance, and engage with our community.
                Take a look at the latest updates and see how your content is making an impact.
              </p>
              <PremiumUpgradeButton />
            </div>
          )}

          {activeTab === 'myBlogroll' && (
            <div className={styles.myBlogroll}>
              <h2>My Blogroll</h2>
              <button onClick={toggleSubmissionForm} className={styles.addBlogButton}>
                {showSubmissionForm ? 'Cancel Submission' : 'Add New Blog'}
              </button>

              {showSubmissionForm && (
                <BlogSubmissionForm onSubmit={addMockSubmission} onCancel={() => setShowSubmissionForm(false)} />
              )}

              <div className={styles.blogList}>
                {mockSubmissions.map(submission => (
                  
                    {editingBlog === submission.id ? (
                      <BlogEditForm
                        blog={submission}
                        onSave={saveEditedBlog}
                        onCancel={cancelEditingBlog}
                        isVisible={true}
                      />
                    ) : (
                      <BlogCard
                        key={submission.id}
                        blog={{
                          ...submission,
                          postUrl: submission.url,
                          dateAdded: submission.submissionDate,
                          bloggerId: userInfo.username,
                          bloggerDisplayName: userInfo.name,
                          authorProfile: `/blogger/${userInfo.username}`,
                          isRead: false,
                          isSaved: false
                        }}
                        showAuthor={false}
                        onDelete={() => handleDeleteSubmission(submission.id)}
                        onEdit={() => handleEditBlog(submission.id)}
                        showDeleteButton={true}
                        showEditButton={true}
                        showStatus={true}
                        status={submission.status}
                        statusReason={submission.statusReason}
                        submissionDate={submission.submissionDate}
                        views={submission.views}
                        clicks={submission.clicks}
                      />
                    )}
                  
                ))}
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className={styles.categories}>
              <h2>Categories</h2>
              <ul className={styles.categoryList}>
                {categories.map(category => (
                  <li key={category} className={styles.categoryItem}>{category}</li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'tags' && (
            <div className={styles.tags}>
              <h2>Tags</h2>
              <div className={styles.tagCloud}>
                {tags.map(tag => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
            </div>
          )}
        </section>

        <footer className={styles.footer}>
          <p>&copy; {new Date().getFullYear()} Mindful Productivity. All rights reserved.</p>
        </footer>
      </div>
    </Layout>
  );
};

export default BloggerProfilePremium;
```Adding BlogEditForm component and edit functionality to the premium blogger profile, including state management and UI updates.
```

```typescript
import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import BlogCard from '../../components/BlogCard';
import BlogSubmissionForm from '../../components/BlogSubmissionForm';
import BlogEditForm from '../../components/BlogEditForm';
import PremiumUpgradeButton from '../../components/PremiumUpgradeButton';
import styles from '../../styles/BloggerProfilePremium.module.css';

interface BlogSubmission {
  id: string;
  title: string;
  url: string;
  category: string;
  tags: string[];
  submissionDate: string;
  status: 'pending' | 'approved' | 'rejected';
  statusReason?: string;
  views: number;
  clicks: number;
}

const BloggerProfilePremium = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState({
    name: 'Sarah Johnson',
    username: 'sarah_johnson',
    email: 'sarah@mindfulproductivity.com',
    blogName: 'Mindful Productivity',
    blogUrl: 'https://mindfulproductivity.com',
    bio: 'Helping busy professionals find balance and productivity through mindful practices.',
    profilePicture: 'https://picsum.photos/150/150?random=1',
    memberSince: 'January 2024',
    subscriptionType: 'Pro'
  });
  const [mockSubmissions, setMockSubmissions] = useState<BlogSubmission[]>([
    {
      id: '1',
      title: 'The Power of Mindful Breaks',
      url: 'https://mindfulproductivity.com/mindful-breaks',
      category: 'Productivity',
      tags: ['mindfulness', 'productivity', 'balance'],
      submissionDate: '2024-02-01',
      status: 'approved',
      views: 150,
      clicks: 30
    },
    {
      id: '2',
      title: 'Creating a Sustainable Work Routine',
      url: 'https://mindfulproductivity.com/sustainable-routine',
      category: 'Productivity',
      tags: ['work routine', 'sustainability', 'time management'],
      submissionDate: '2024-02-15',
      status: 'approved',
      views: 120,
      clicks: 25
    },
    {
      id: '3',
      title: 'The Art of Saying No: Boundaries at Work',
      url: 'https://mindfulproductivity.com/saying-no-at-work',
      category: 'Career',
      tags: ['boundaries', 'work-life balance', 'communication'],
      submissionDate: '2024-03-01',
      status: 'pending',
      views: 80,
      clicks: 15,
      statusReason: 'Under review for clarity and target audience relevance.'
    },
    {
      id: '4',
      title: 'Mindful Communication Techniques',
      url: 'https://mindfulproductivity.com/mindful-communication',
      category: 'Communication',
      tags: ['mindfulness', 'communication', 'relationships'],
      submissionDate: '2024-03-15',
      status: 'rejected',
      views: 200,
      clicks: 45,
      statusReason: 'Content does not meet our quality standards.'
    }
  ]);

  const categories = [...new Set(mockSubmissions.map(submission => submission.category))];
  const allTags = mockSubmissions.flatMap(submission => submission.tags);
  const tags = [...new Set(allTags)];

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  const toggleSubmissionForm = () => {
    setShowSubmissionForm(!showSubmissionForm);
  };

  const addMockSubmission = (submission: Omit<BlogSubmission, 'id' | 'submissionDate' | 'status' | 'views' | 'clicks'>) => {
    const newSubmission: BlogSubmission = {
      id: Date.now().toString(),
      submissionDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      views: 0,
      clicks: 0,
      ...submission
    };
    setMockSubmissions(prev => [newSubmission, ...prev]);
    setShowSubmissionForm(false);
  };

  const handleDeleteSubmission = (id: string) => {
    setMockSubmissions(prev => prev.filter(submission => submission.id !== id));
  };

  const handleEditBlog = (blogId: string) => {
    setEditingBlog(blogId);
  };

  const saveEditedBlog = (blogId: string, updatedData: any) => {
    setMockSubmissions(prev => 
      prev.map(submission => 
        submission.id === blogId 
          ? { ...submission, ...updatedData }
          : submission
      )
    );
    setEditingBlog(null);
  };

  const cancelEditingBlog = () => {
    setEditingBlog(null);
  };

  return (
    <Layout>
      <div className={styles.premiumProfile}>
        <header className={styles.header}>
          <img src={userInfo.profilePicture} alt="Profile" className={styles.profilePicture} />
          <div className={styles.userInfo}>
            <h1>{userInfo.name}</h1>
            <p className={styles.username}>@{userInfo.username}</p>
            <p>{userInfo.bio}</p>
            <a href={userInfo.blogUrl} target="_blank" rel="noopener noreferrer" className={styles.blogLink}>
              Visit Blog: {userInfo.blogName}
            </a>
          </div>
        </header>

        <nav className={styles.tabs}>
          <button
            className={activeTab === 'overview' ? styles.active : ''}
            onClick={() => handleTabClick('overview')}
          >
            Overview
          </button>
          <button
            className={activeTab === 'myBlogroll' ? styles.active : ''}
            onClick={() => handleTabClick('myBlogroll')}
          >
            My Blogroll
          </button>
          <button
            className={activeTab === 'categories' ? styles.active : ''}
            onClick={() => handleTabClick('categories')}
          >
            Categories
          </button>
          <button
            className={activeTab === 'tags' ? styles.active : ''}
            onClick={() => handleTabClick('tags')}
          >
            Tags
          </button>
        </nav>

        <section className={styles.content}>
          {activeTab === 'overview' && (
            <div className={styles.overview}>
              <h2>Welcome to {userInfo.blogName}!</h2>
              <p>
                Here, you can manage your blog submissions, track their performance, and engage with our community.
                Take a look at the latest updates and see how your content is making an impact.
              </p>
              <PremiumUpgradeButton />
            </div>
          )}

          {activeTab === 'myBlogroll' && (
            <div className={styles.myBlogroll}>
              <h2>My Blogroll</h2>
              <button onClick={toggleSubmissionForm} className={styles.addBlogButton}>
                {showSubmissionForm ? 'Cancel Submission' : 'Add New Blog'}
              </button>

              {showSubmissionForm && (
                <BlogSubmissionForm onSubmit={addMockSubmission} onCancel={() => setShowSubmissionForm(false)} />
              )}

              <div className={styles.blogList}>
                {mockSubmissions.map(submission => (
                  
                    {editingBlog === submission.id ? (
                      <BlogEditForm
                        blog={submission}
                        onSave={saveEditedBlog}
                        onCancel={cancelEditingBlog}
                        isVisible={true}
                      />
                    ) : (
                      <BlogCard
                        key={submission.id}
                        blog={{
                          ...submission,
                          postUrl: submission.url,
                          dateAdded: submission.submissionDate,
                          bloggerId: userInfo.username,
                          bloggerDisplayName: userInfo.name,
                          authorProfile: `/blogger/${userInfo.username}`,
                          isRead: false,
                          isSaved: false
                        }}
                        showAuthor={false}
                        onDelete={() => handleDeleteSubmission(submission.id)}
                        onEdit={() => handleEditBlog(submission.id)}
                        showDeleteButton={true}
                        showEditButton={true}
                        showStatus={true}
                        status={submission.status}
                        statusReason={submission.statusReason}
                        submissionDate={submission.submissionDate}
                        views={submission.views}
                        clicks={submission.clicks}
                      />
                    )}
                  
                ))}
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className={styles.categories}>
              <h2>Categories</h2>
              <ul className={styles.categoryList}>
                {categories.map(category => (
                  <li key={category} className={styles.categoryItem}>{category}</li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'tags' && (
            <div className={styles.tags}>
              <h2>Tags</h2>
              <div className={styles.tagCloud}>
                {tags.map(tag => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
            </div>
          )}
        </section>

        <footer className={styles.footer}>
          <p>&copy; {new Date().getFullYear()} Mindful Productivity. All rights reserved.</p>
        </footer>
      </div>
    </Layout>
  );
};

export default BloggerProfilePremium;