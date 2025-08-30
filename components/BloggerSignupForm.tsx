
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/AuthForm.module.css';
import BlogSubmissionForm from './BlogSubmissionForm';
import SurveyPopup from './SurveyPopup';

interface BloggerSignupFormProps {
  onAuthenticated?: (userInfo: UserInfo) => void;
  showProgressBar?: boolean;
}

interface UserInfo {
  id: string;
  name: string;
  roles: string[];
}

interface BloggerFormData {
  firstName: string;
  surname: string;
  email: string;
  dateOfBirth: string;
  password: string;
  confirmPassword: string;
  username: string;
  profilePicture?: File | null;
  bio: string;
  blogUrl: string;
  blogName: string;
  topics: string[];
  monetisationMethods: string[];
  blogPosts: string[];
  agreeToTerms: boolean;
  confirmOwnership: boolean;
  agreeToSurvey: boolean;
}

const BloggerSignupForm: React.FC<BloggerSignupFormProps> = ({ 
  onAuthenticated, 
  showProgressBar = true 
}) => {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  // Blogger form state
  const [bloggerForm, setBloggerForm] = useState<BloggerFormData>({
    firstName: '',
    surname: '',
    email: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
    username: '',
    profilePicture: null,
    bio: '',
    blogUrl: '',
    blogName: '',
    topics: [],
    monetizationMethods: [],
    blogPosts: ['', '', ''],
    agreeToTerms: false,
    confirmOwnership: false,
    agreeToSurvey: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showBlogSubmissionPopup, setShowBlogSubmissionPopup] = useState(false);
  const [submittedBlogs, setSubmittedBlogs] = useState<any[]>([]);
  const [showSurveyPopup, setShowSurveyPopup] = useState(false);
  const [surveyCompleted, setSurveyCompleted] = useState(false);
  const [isPart1Complete, setIsPart1Complete] = useState(false);

  const topicOptions = [
    'Culture & Society', 'Travel', 'Health & Wellness', 'Feminism', 'Tech', 
    'Homesteading', 'Books & Media', 'Money & Work', 'Spirituality', 
    'Creativity', 'Relationships', 'Food', 'Learning', 'Society & Politics', 'Other'
  ];

  const monetizationOptions = [
    'Ads', 'Affiliate Links', 'Products/Services', 'None Yet'
  ];

  // Check if Part 1 is complete
  useEffect(() => {
    const part1Fields = ['firstName', 'surname', 'email', 'dateOfBirth', 'password', 'confirmPassword'];
    const part1Complete = part1Fields.every(field => 
      bloggerForm[field as keyof BloggerFormData] !== ''
    ) && validateAge(bloggerForm.dateOfBirth) && bloggerForm.password === bloggerForm.confirmPassword;
    
    setIsPart1Complete(part1Complete);
  }, [bloggerForm]);

  // Calculate progress for blogger form
  useEffect(() => {
    if (showProgressBar) {
      // Part 1 (required): 6 fields + 3 checkboxes = 9 items (75% of total)
      const part1Fields = ['firstName', 'surname', 'email', 'dateOfBirth', 'password', 'confirmPassword'];
      const filledPart1Fields = part1Fields.filter(field => 
        bloggerForm[field as keyof BloggerFormData] !== ''
      );
      const validPassword = bloggerForm.password === bloggerForm.confirmPassword && bloggerForm.password.length >= 8;
      const validAge = validateAge(bloggerForm.dateOfBirth);
      const part1Score = filledPart1Fields.length === 6 && validPassword && validAge ? 6 : filledPart1Fields.length;
      
      const checkboxes = (bloggerForm.agreeToTerms ? 1 : 0) + (bloggerForm.confirmOwnership ? 1 : 0) + (bloggerForm.agreeToSurvey ? 1 : 0);
      
      // Part 2 & 3 (optional): 3 items (25% of total)
      const optionalFields = ['username', 'blogUrl', 'blogName'];
      const filledOptionalFields = optionalFields.filter(field => 
        bloggerForm[field as keyof BloggerFormData] !== ''
      );
      const topicsProgress = bloggerForm.topics.length > 0 ? 1 : 0;
      const blogsProgress = submittedBlogs.length > 0 ? 1 : 0;
      
      // Weight: Part 1 = 75%, Part 2&3 = 25%
      const part1Progress = (part1Score + checkboxes) / 9 * 75;
      const optionalProgress = (filledOptionalFields.length + topicsProgress + blogsProgress) / 5 * 25;
      
      const totalProgress = part1Progress + optionalProgress;
      setProgress(Math.min(totalProgress, 100));
    }
  }, [bloggerForm, submittedBlogs, showProgressBar]);

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

  const handleBlogSubmission = (blogData: any) => {
    if (submittedBlogs.length < 3) {
      const blogWithBloggerInfo = {
        ...blogData,
        bloggerId: 'temp_' + Date.now(), // In real app, this would be the authenticated user ID
        bloggerDisplayName: bloggerForm.username,
        author: bloggerForm.username
      };
      setSubmittedBlogs(prev => [...prev, blogWithBloggerInfo]);
      setShowBlogSubmissionPopup(false);
    }
  };

  const removeBlog = (index: number) => {
    setSubmittedBlogs(prev => prev.filter((_, i) => i !== index));
  };

  const handleSurveyComplete = (surveyData: any) => {
    setSurveyCompleted(true);
    setBloggerForm(prev => ({ ...prev, agreeToSurvey: true }));
    // TODO: Save survey data to backend
    console.log('Survey completed:', surveyData);
  };

  const handleBloggerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Part 1 validation (required)
    if (!bloggerForm.firstName) newErrors.firstName = 'First name is required';
    if (!bloggerForm.surname) newErrors.surname = 'Surname is required';
    if (!bloggerForm.email) newErrors.email = 'Email is required';
    if (!bloggerForm.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    else if (!validateAge(bloggerForm.dateOfBirth)) newErrors.dateOfBirth = 'You must be 18 or older';
    if (!bloggerForm.password) newErrors.password = 'Password is required';
    else if (bloggerForm.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!bloggerForm.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (bloggerForm.password !== bloggerForm.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    // Part 2 validation (optional, but validate if filled)
    if (bloggerForm.blogUrl && !validateUrl(bloggerForm.blogUrl)) newErrors.blogUrl = 'Please enter a valid URL (https://yourdomain.com)';
    
    // Required checkboxes
    if (!bloggerForm.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
    if (!bloggerForm.confirmOwnership) newErrors.confirmOwnership = 'You must confirm blog ownership';
    if (!bloggerForm.agreeToSurvey || !surveyCompleted) newErrors.agreeToSurvey = 'You must complete the mandatory survey';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // TODO: Implement Supabase integration
    console.log('Blogger form submitted:', bloggerForm);
    alert('Account created successfully! Your profile can be completed from your dashboard.');
  };

  return (
    <div className={styles.authCard}>
      <h2>Join as a Blogger</h2>
      <p>Get your blog discovered by the right readers</p>

      {showProgressBar && (
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
          <small className={styles.hint}>This will be your login email address.</small>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Date of Birth *
          </label>
          <input
            type="date"
            value={bloggerForm.dateOfBirth}
            onChange={(e) => setBloggerForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
            className={styles.textInput}
            required
          />
          {errors.dateOfBirth && <span className={styles.error}>{errors.dateOfBirth}</span>}
          <small className={styles.hint}>We use your age to filter out mature content (must be 18+).</small>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Password *
          </label>
          <input
            type="password"
            value={bloggerForm.password}
            onChange={(e) => setBloggerForm(prev => ({ ...prev, password: e.target.value }))}
            className={styles.textInput}
            minLength={8}
            required
          />
          {errors.password && <span className={styles.error}>{errors.password}</span>}
          <small className={styles.hint}>Must be at least 8 characters long.</small>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Confirm Password *
          </label>
          <input
            type="password"
            value={bloggerForm.confirmPassword}
            onChange={(e) => setBloggerForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
            className={styles.textInput}
            required
          />
          {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword}</span>}
          <small className={styles.hint}>Re-enter your password to confirm.</small>
        </div>

        <div className={styles.sectionTitle}>
          Part 2: Profile Creation
          <span className={styles.optional}>(Optional)</span>
        </div>

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
            Username
            <span className={styles.optional}>(Optional)</span>
          </label>
          <input
            type="text"
            value={bloggerForm.username}
            onChange={(e) => setBloggerForm(prev => ({ ...prev, username: e.target.value }))}
            className={styles.textInput}
            placeholder="Choose your unique username"
          />
          {errors.username && <span className={styles.error}>{errors.username}</span>}
          <small className={styles.hint}>Your unique identifier on the platform. Can be added later.</small>
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
            Blog URL
            <span className={styles.optional}>(Optional)</span>
          </label>
          <input
            type="url"
            value={bloggerForm.blogUrl}
            onChange={(e) => setBloggerForm(prev => ({ ...prev, blogUrl: e.target.value }))}
            className={styles.textInput}
            placeholder="https://yourblog.com"
          />
          {errors.blogUrl && <span className={styles.error}>{errors.blogUrl}</span>}
          <small className={styles.hint}>Must start with https:// (no paths or slugs). Can be added later.</small>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Blog Name
            <span className={styles.optional}>(Optional)</span>
          </label>
          <input
            type="text"
            value={bloggerForm.blogName}
            onChange={(e) => setBloggerForm(prev => ({ ...prev, blogName: e.target.value }))}
            className={styles.textInput}
            placeholder="The name of your blog"
          />
          {errors.blogName && <span className={styles.error}>{errors.blogName}</span>}
          <small className={styles.hint}>Shown in search & on your profile. Can be added later.</small>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Primary Topics / Niche
            <span className={styles.optional}>(Optional)</span>
          </label>
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
          <small className={styles.hint}>Select topics that best describe your blog content. Can be added later.</small>
        </div>

        <div className={styles.sectionTitle}>
          Part 3: Listings
          {!isPart1Complete && (
            <span style={{ 
              fontSize: '0.8rem', 
              color: '#64748b', 
              fontWeight: 'normal',
              marginLeft: '0.5rem'
            }}>
              (Complete Part 1 to unlock)
            </span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Submit Your Best Blog Posts
            <span className={styles.optional}>(Optional)</span>
          </label>
          <small className={styles.hint}>Share up to 3 of your best blog posts that represent your work. These will be featured in your profile. You can also add these later from your dashboard.</small>
          
          {!isPart1Complete ? (
            <div style={{
              padding: '2rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#64748b'
            }}>
              <p>Complete Part 1 (Account Setup) to add blog posts during signup.</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                You can always add blog posts later from your dashboard.
              </p>
            </div>
          ) : (
            <div className={styles.blogListingsContainer}>
              {submittedBlogs.map((blog, index) => (
                <div key={index} className={styles.submittedBlog}>
                  <div className={styles.blogInfo}>
                    <h4>{blog.title}</h4>
                    <p>{blog.description}</p>
                    <a href={blog.postUrl} target="_blank" rel="noopener noreferrer">{blog.postUrl}</a>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeBlog(index)}
                    className={styles.removeBlogButton}
                  >
                    Remove
                  </button>
                </div>
              ))}
              
              {submittedBlogs.length < 3 && (
                <button 
                  type="button" 
                  onClick={() => setShowBlogSubmissionPopup(true)}
                  className={styles.addBlogButton}
                >
                  + Add Blog Post (Optional)
                </button>
              )}
            </div>
          )}
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

        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={bloggerForm.agreeToSurvey}
              onChange={(e) => {
                if (e.target.checked && !surveyCompleted) {
                  setShowSurveyPopup(true);
                } else if (!e.target.checked) {
                  setBloggerForm(prev => ({ ...prev, agreeToSurvey: false }));
                  setSurveyCompleted(false);
                }
              }}
              className={styles.checkbox}
              required
            />
            <span className={styles.checkboxText}>
              I have completed the <button 
                type="button" 
                onClick={() => setShowSurveyPopup(true)}
                className={styles.linkButton}
                style={{ textDecoration: 'underline', padding: '0' }}
              >
                mandatory survey
              </button> to help us understand our blogger community *
              {surveyCompleted && <span style={{ color: '#c42142', marginLeft: '0.5rem' }}>✓ Completed</span>}
            </span>
          </label>
          {errors.agreeToSurvey && <span className={styles.error}>{errors.agreeToSurvey}</span>}
          <small className={styles.hint}>This helps us improve our platform and better serve the blogging community.</small>
        </div>

        <button type="submit" className={styles.submitButton}>
          List My Blog
        </button>
      </form>

      {/* Blog Submission Popup */}
      {showBlogSubmissionPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupContent}>
            <div className={styles.popupHeader}>
              <h3>Add Blog Post</h3>
              <button 
                type="button" 
                onClick={() => setShowBlogSubmissionPopup(false)}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>
            <BlogSubmissionForm 
              onSubmit={handleBlogSubmission} 
              displayName={bloggerForm.username}
              bloggerId="temp_signup"
              isBlogger={true}
              hideGuidelines={true}
              isSignupMode={true}
            />
          </div>
        </div>
      )}

      {/* Survey Popup */}
      <SurveyPopup
        isOpen={showSurveyPopup}
        onClose={() => setShowSurveyPopup(false)}
        onComplete={handleSurveyComplete}
      />
    </div>
  );
};

export default BloggerSignupForm;
