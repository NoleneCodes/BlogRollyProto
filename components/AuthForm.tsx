
import React, { useState, useEffect } from 'react';
import styles from '../styles/AuthForm.module.css';

interface AuthFormProps {
  onAuthenticated?: (userInfo: UserInfo) => void;
}

interface UserInfo {
  id: string;
  name: string;
  roles: string[];
}

interface ReaderFormData {
  email: string;
  firstName: string;
  surname: string;
  username: string;
  dateOfBirth: string;
  topics: string[];
  otherTopic: string;
  agreeToTerms: boolean;
  subscribeToUpdates: boolean;
}

interface BloggerFormData {
  firstName: string;
  surname: string;
  email: string;
  displayName: string;
  profilePicture?: File | null;
  bio: string;
  blogUrl: string;
  blogName: string;
  topics: string[];
  monetizationMethods: string[];
  blogPosts: string[];
  agreeToTerms: boolean;
  confirmOwnership: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthenticated }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reader' | 'blogger'>('reader');
  const [progress, setProgress] = useState(0);

  // Reader form state
  const [readerForm, setReaderForm] = useState<ReaderFormData>({
    email: '',
    firstName: '',
    surname: '',
    username: '',
    dateOfBirth: '',
    topics: [],
    otherTopic: '',
    agreeToTerms: false,
    subscribeToUpdates: false
  });

  // Blogger form state
  const [bloggerForm, setBloggerForm] = useState<BloggerFormData>({
    firstName: '',
    surname: '',
    email: '',
    displayName: '',
    profilePicture: null,
    bio: '',
    blogUrl: '',
    blogName: '',
    topics: [],
    monetizationMethods: [],
    blogPosts: ['', '', ''],
    agreeToTerms: false,
    confirmOwnership: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showOtherTopic, setShowOtherTopic] = useState(false);

  const topicOptions = [
    'Culture & Society', 'Travel', 'Health & Wellness', 'Feminism', 'Tech', 
    'Homesteading', 'Books & Media', 'Money & Work', 'Spirituality', 
    'Creativity', 'Relationships', 'Food', 'Learning', 'Society & Politics', 'Other'
  ];

  const monetizationOptions = [
    'Ads', 'Affiliate Links', 'Products/Services', 'None Yet'
  ];

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth-check');
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated) {
            const user = {
              id: data.userId,
              name: data.userName,
              roles: data.userRoles ? data.userRoles.split(',') : []
            };
            setUserInfo(user);
            onAuthenticated?.(user);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [onAuthenticated]);

  // Calculate progress for blogger form
  useEffect(() => {
    if (activeTab === 'blogger') {
      const requiredFields = ['firstName', 'surname', 'email', 'displayName', 'bio', 'blogUrl', 'blogName'];
      const filledFields = requiredFields.filter(field => 
        bloggerForm[field as keyof BloggerFormData] !== ''
      );
      const checkboxes = bloggerForm.agreeToTerms && bloggerForm.confirmOwnership ? 1 : 0;
      const topicsProgress = bloggerForm.topics.length > 0 ? 1 : 0;
      const monetizationProgress = bloggerForm.monetizationMethods.length > 0 ? 1 : 0;
      
      const totalProgress = (filledFields.length + checkboxes + topicsProgress + monetizationProgress) / 9 * 100;
      setProgress(totalProgress);
    }
  }, [bloggerForm, activeTab]);

  const validateUrl = (url: string) => {
    const urlRegex = /^https:\/\/[a-zA-Z0-9\-\.]+\.[a-z]{2,}$/;
    return urlRegex.test(url);
  };

  const validateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return false;
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 18;
    }
    
    return age >= 18;
  };

  const handleReaderTopicChange = (topic: string, checked: boolean) => {
    if (topic === 'Other') {
      setShowOtherTopic(checked);
    }
    
    setReaderForm(prev => ({
      ...prev,
      topics: checked 
        ? [...prev.topics, topic]
        : prev.topics.filter(t => t !== topic)
    }));
  };

  const handleBloggerTopicChange = (topic: string, checked: boolean) => {
    setBloggerForm(prev => ({
      ...prev,
      topics: checked 
        ? [...prev.topics, topic]
        : prev.topics.filter(t => t !== topic)
    }));
  };

  const handleMonetizationChange = (method: string, checked: boolean) => {
    setBloggerForm(prev => ({
      ...prev,
      monetizationMethods: checked 
        ? [...prev.monetizationMethods, method]
        : prev.monetizationMethods.filter(m => m !== method)
    }));
  };

  const handleBlogPostChange = (index: number, value: string) => {
    setBloggerForm(prev => ({
      ...prev,
      blogPosts: prev.blogPosts.map((post, i) => i === index ? value : post)
    }));
  };

  const handleReaderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!readerForm.email) newErrors.email = 'Email is required';
    if (!readerForm.firstName) newErrors.firstName = 'First name is required';
    if (!readerForm.surname) newErrors.surname = 'Surname is required';
    if (!readerForm.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    else if (!validateAge(readerForm.dateOfBirth)) newErrors.dateOfBirth = 'You must be 18 or older';
    if (readerForm.topics.length === 0) newErrors.topics = 'Please select at least one topic';
    if (!readerForm.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // TODO: Implement Supabase magic link authentication
    console.log('Reader form submitted:', readerForm);
    alert('Thanks! We\'ll send you a secure sign-in link to your inbox.');
  };

  const handleBloggerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!bloggerForm.firstName) newErrors.firstName = 'First name is required';
    if (!bloggerForm.surname) newErrors.surname = 'Surname is required';
    if (!bloggerForm.email) newErrors.email = 'Email is required';
    if (!bloggerForm.displayName) newErrors.displayName = 'Display name is required';
    if (!bloggerForm.blogUrl) newErrors.blogUrl = 'Blog URL is required';
    else if (!validateUrl(bloggerForm.blogUrl)) newErrors.blogUrl = 'Please enter a valid URL (https://yourdomain.com)';
    if (!bloggerForm.blogName) newErrors.blogName = 'Blog name is required';
    if (!bloggerForm.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
    if (!bloggerForm.confirmOwnership) newErrors.confirmOwnership = 'You must confirm blog ownership';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // TODO: Implement Supabase integration
    console.log('Blogger form submitted:', bloggerForm);
    alert('Thanks! We\'re reviewing your blog. You\'ll be notified when it\'s listed.');
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <h2>Checking authentication...</h2>
        </div>
      </div>
    );
  }

  if (userInfo) {
    return (
      <div className={styles.container}>
        <div className={styles.welcomeMessage}>
          <h2>Welcome, {userInfo.name}!</h2>
          <p>You are authenticated and ready to submit your blog.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.tabContainer}>
        <button 
          className={`${styles.tab} ${activeTab === 'reader' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('reader')}
        >
          I'm a Reader
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'blogger' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('blogger')}
        >
          I'm a Blogger
        </button>
      </div>

      {activeTab === 'reader' ? (
        <div className={styles.authCard}>
          <h2>Join as a Reader</h2>
          <p>Discover amazing blogs tailored to your interests</p>
          
          <form onSubmit={handleReaderSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Email Address *
              </label>
              <input
                type="email"
                value={readerForm.email}
                onChange={(e) => setReaderForm(prev => ({ ...prev, email: e.target.value }))}
                className={styles.textInput}
                required
              />
              {errors.email && <span className={styles.error}>{errors.email}</span>}
              <small className={styles.hint}>We'll send you a secure sign-in link to your inbox.</small>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                First Name *
              </label>
              <input
                type="text"
                value={readerForm.firstName}
                onChange={(e) => setReaderForm(prev => ({ ...prev, firstName: e.target.value }))}
                className={styles.textInput}
                required
              />
              {errors.firstName && <span className={styles.error}>{errors.firstName}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Surname *
              </label>
              <input
                type="text"
                value={readerForm.surname}
                onChange={(e) => setReaderForm(prev => ({ ...prev, surname: e.target.value }))}
                className={styles.textInput}
                required
              />
              {errors.surname && <span className={styles.error}>{errors.surname}</span>}
              <small className={styles.hint}>Your name helps us personalise your experience.</small>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Display Name / Username (optional)
              </label>
              <input
                type="text"
                value={readerForm.username}
                onChange={(e) => setReaderForm(prev => ({ ...prev, username: e.target.value }))}
                className={styles.textInput}
                placeholder="Pick a name readers can see"
              />
              <small className={styles.hint}>Pick a name readers can see (optional).</small>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Date of Birth *
              </label>
              <input
                type="date"
                value={readerForm.dateOfBirth}
                onChange={(e) => setReaderForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                className={styles.textInput}
                required
              />
              {errors.dateOfBirth && <span className={styles.error}>{errors.dateOfBirth}</span>}
              <small className={styles.hint}>We use your age to filter out mature content (must be 18+).</small>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Topics You're Into *</label>
              <div className={styles.checkboxGrid}>
                {topicOptions.map(topic => (
                  <label key={topic} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={readerForm.topics.includes(topic)}
                      onChange={(e) => handleReaderTopicChange(topic, e.target.checked)}
                      className={styles.checkbox}
                    />
                    <span className={styles.checkboxText}>{topic}</span>
                  </label>
                ))}
              </div>
              {errors.topics && <span className={styles.error}>{errors.topics}</span>}
              {showOtherTopic && (
                <textarea
                  value={readerForm.otherTopic}
                  onChange={(e) => setReaderForm(prev => ({ ...prev, otherTopic: e.target.value }))}
                  className={styles.textarea}
                  placeholder="Tell us your niche."
                  rows={3}
                />
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={readerForm.agreeToTerms}
                  onChange={(e) => setReaderForm(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
                  className={styles.checkbox}
                  required
                />
                <span className={styles.checkboxText}>
                  I agree to the <a href="/terms" target="_blank">Terms and Conditions</a> *
                </span>
              </label>
              {errors.agreeToTerms && <span className={styles.error}>{errors.agreeToTerms}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={readerForm.subscribeToUpdates}
                  onChange={(e) => setReaderForm(prev => ({ ...prev, subscribeToUpdates: e.target.checked }))}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>
                  Subscribe to occasional updates on new blog drops
                </span>
              </label>
              <small className={styles.hint}>No spam. Just brilliant blogs you might love.</small>
            </div>

            <button type="submit" className={styles.submitButton}>
              Start Exploring
            </button>
          </form>
        </div>
      ) : (
        <div className={styles.authCard}>
          <h2>Join as a Blogger</h2>
          <p>Get your blog discovered by the right readers</p>
          
          {activeTab === 'blogger' && (
            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className={styles.progressText}>{Math.round(progress)}% Complete</span>
            </div>
          )}

          <form onSubmit={handleBloggerSubmit} className={styles.form}>
            <div className={styles.sectionTitle}>Part 1: Account Setup</div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>
                First Name *
              </label>
              <input
                type="text"
                value={bloggerForm.firstName}
                onChange={(e) => setBloggerForm(prev => ({ ...prev, firstName: e.target.value }))}
                className={styles.textInput}
                required
              />
              {errors.firstName && <span className={styles.error}>{errors.firstName}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Surname *
              </label>
              <input
                type="text"
                value={bloggerForm.surname}
                onChange={(e) => setBloggerForm(prev => ({ ...prev, surname: e.target.value }))}
                className={styles.textInput}
                required
              />
              {errors.surname && <span className={styles.error}>{errors.surname}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Email Address *
              </label>
              <input
                type="email"
                value={bloggerForm.email}
                onChange={(e) => setBloggerForm(prev => ({ ...prev, email: e.target.value }))}
                className={styles.textInput}
                required
              />
              {errors.email && <span className={styles.error}>{errors.email}</span>}
              <small className={styles.hint}>We'll send you a secure sign-in link to your inbox.</small>
            </div>

            <div className={styles.sectionTitle}>Part 2: Profile Creation</div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Profile Picture
                <span className={styles.optional}>(Optional)</span>
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 2 * 1024 * 1024) {
                      setErrors(prev => ({ ...prev, profilePicture: 'Image must be less than 2MB' }));
                      return;
                    }
                    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
                    if (!validTypes.includes(file.type)) {
                      setErrors(prev => ({ ...prev, profilePicture: 'Only JPG, PNG, and WebP files are allowed' }));
                      return;
                    }
                    setBloggerForm(prev => ({ ...prev, profilePicture: file }));
                    setErrors(prev => ({ ...prev, profilePicture: '' }));
                  }
                }}
                className={styles.fileInput}
              />
              {errors.profilePicture && <span className={styles.error}>{errors.profilePicture}</span>}
              <small className={styles.hint}>Max size: 2MB. Formats: JPG, PNG, WebP. Can be added later.</small>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Display Name *
              </label>
              <input
                type="text"
                value={bloggerForm.displayName}
                onChange={(e) => setBloggerForm(prev => ({ ...prev, displayName: e.target.value }))}
                className={styles.textInput}
                required
              />
              {errors.displayName && <span className={styles.error}>{errors.displayName}</span>}
              <small className={styles.hint}>Shown on public profile</small>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Short Bio
                <span className={styles.optional}>(Optional)</span>
              </label>
              <textarea
                value={bloggerForm.bio}
                onChange={(e) => setBloggerForm(prev => ({ ...prev, bio: e.target.value }))}
                className={styles.textarea}
                maxLength={280}
                rows={4}
                placeholder="Tell us who you are in a sentence or two. Can be added later."
              />
              {errors.bio && <span className={styles.error}>{errors.bio}</span>}
              <small className={styles.hint}>{bloggerForm.bio.length}/280 characters. Can be completed later.</small>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Blog URL *
              </label>
              <input
                type="url"
                value={bloggerForm.blogUrl}
                onChange={(e) => setBloggerForm(prev => ({ ...prev, blogUrl: e.target.value }))}
                className={styles.textInput}
                placeholder="https://yourblog.com"
                required
              />
              {errors.blogUrl && <span className={styles.error}>{errors.blogUrl}</span>}
              <small className={styles.hint}>Must start with https:// (no paths or slugs)</small>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Blog Name *
              </label>
              <input
                type="text"
                value={bloggerForm.blogName}
                onChange={(e) => setBloggerForm(prev => ({ ...prev, blogName: e.target.value }))}
                className={styles.textInput}
                required
              />
              {errors.blogName && <span className={styles.error}>{errors.blogName}</span>}
              <small className={styles.hint}>Shown in search & on your profile</small>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Primary Topics / Niche</label>
              <div className={styles.checkboxGrid}>
                {topicOptions.filter(t => t !== 'Other').map(topic => (
                  <label key={topic} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={bloggerForm.topics.includes(topic)}
                      onChange={(e) => handleBloggerTopicChange(topic, e.target.checked)}
                      className={styles.checkbox}
                    />
                    <span className={styles.checkboxText}>{topic}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.sectionTitle}>Part 3: Publishing & Listing</div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Blog Monetization Methods</label>
              <div className={styles.checkboxGrid}>
                {monetizationOptions.map(method => (
                  <label key={method} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={bloggerForm.monetizationMethods.includes(method)}
                      onChange={(e) => handleMonetizationChange(method, e.target.checked)}
                      className={styles.checkbox}
                    />
                    <span className={styles.checkboxText}>{method}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>List 3 Blog Posts (optional)</label>
              <small className={styles.hint}>Share up to 3 blog posts that best represent your work.</small>
              {bloggerForm.blogPosts.map((post, index) => (
                <input
                  key={index}
                  type="url"
                  value={post}
                  onChange={(e) => handleBlogPostChange(index, e.target.value)}
                  className={styles.textInput}
                  placeholder={`Blog Post ${index + 1} URL`}
                />
              ))}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={bloggerForm.agreeToTerms}
                  onChange={(e) => setBloggerForm(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
                  className={styles.checkbox}
                  required
                />
                <span className={styles.checkboxText}>
                  I agree to the <a href="/terms" target="_blank">Terms and Conditions</a> *
                </span>
              </label>
              {errors.agreeToTerms && <span className={styles.error}>{errors.agreeToTerms}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={bloggerForm.confirmOwnership}
                  onChange={(e) => setBloggerForm(prev => ({ ...prev, confirmOwnership: e.target.checked }))}
                  className={styles.checkbox}
                  required
                />
                <span className={styles.checkboxText}>
                  I confirm I own this blog and it is not AI-generated spam *
                </span>
              </label>
              {errors.confirmOwnership && <span className={styles.error}>{errors.confirmOwnership}</span>}
            </div>

            <button type="submit" className={styles.submitButton}>
              List My Blog
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AuthForm;
