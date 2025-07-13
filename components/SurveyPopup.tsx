
import React, { useState } from 'react';
import styles from '../styles/AuthForm.module.css';

interface SurveyPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (surveyData: SurveyData) => void;
}

interface SurveyData {
  bloggerExperience: string;
  primaryGoal: string;
  audienceSize: string;
  contentFrequency: string;
  discoveryMethods: string[];
  challengesFaced: string;
  platformsUsed: string[];
  monetizationInterest: string;
  currentMonetizationMethods?: string[];
  communityInterest: string;
  additionalFeatures: string;
  feedback: string;
}

const SurveyPopup: React.FC<SurveyPopupProps> = ({ isOpen, onClose, onComplete }) => {
  const [surveyData, setSurveyData] = useState<SurveyData>({
    bloggerExperience: '',
    primaryGoal: '',
    audienceSize: '',
    contentFrequency: '',
    discoveryMethods: [],
    challengesFaced: '',
    platformsUsed: [],
    monetizationInterest: '',
    currentMonetizationMethods: [],
    communityInterest: '',
    additionalFeatures: '',
    feedback: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCheckboxChange = (field: 'discoveryMethods' | 'platformsUsed' | 'currentMonetizationMethods', value: string, checked: boolean) => {
    setSurveyData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field] || []), value]
        : (prev[field] || []).filter(item => item !== value)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validate required fields
    if (!surveyData.bloggerExperience) newErrors.bloggerExperience = 'Please select your blogging experience';
    if (!surveyData.primaryGoal) newErrors.primaryGoal = 'Please select your primary goal';
    if (!surveyData.audienceSize) newErrors.audienceSize = 'Please select your audience size';
    if (!surveyData.contentFrequency) newErrors.contentFrequency = 'Please select your posting frequency';
    if (surveyData.discoveryMethods.length === 0) newErrors.discoveryMethods = 'Please select at least one discovery method';
    if (!surveyData.challengesFaced) newErrors.challengesFaced = 'Please describe your main challenge';
    if (!surveyData.monetizationInterest) newErrors.monetizationInterest = 'Please select your monetization interest';
    if (surveyData.monetizationInterest === 'already-monetizing' && (!surveyData.currentMonetizationMethods || surveyData.currentMonetizationMethods.length === 0)) {
      newErrors.currentMonetizationMethods = 'Please select at least one monetization method';
    }
    if (!surveyData.communityInterest) newErrors.communityInterest = 'Please select your community interest';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onComplete(surveyData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContent} style={{ maxWidth: '800px', maxHeight: '90vh' }}>
        <div className={styles.popupHeader}>
          <h3>Blogger Community Survey</h3>
          <button 
            type="button" 
            onClick={onClose}
            className={styles.closeButton}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} style={{ padding: '2rem' }}>
          <p style={{ color: '#6b7280', marginBottom: '2rem', lineHeight: '1.6' }}>
            Help us understand our blogging community better! This survey takes 3-5 minutes and helps us improve our platform for bloggers like you.
          </p>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              How long have you been blogging? *
            </label>
            <select
              value={surveyData.bloggerExperience}
              onChange={(e) => setSurveyData(prev => ({ ...prev, bloggerExperience: e.target.value }))}
              className={styles.textInput}
              required
            >
              <option value="">Select experience level</option>
              <option value="0-6months">0-6 months</option>
              <option value="6months-1year">6 months - 1 year</option>
              <option value="1-2years">1-2 years</option>
              <option value="2-5years">2-5 years</option>
              <option value="5plus">5+ years</option>
            </select>
            {errors.bloggerExperience && <span className={styles.error}>{errors.bloggerExperience}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              What's your primary goal with blogging? *
            </label>
            <select
              value={surveyData.primaryGoal}
              onChange={(e) => setSurveyData(prev => ({ ...prev, primaryGoal: e.target.value }))}
              className={styles.textInput}
              required
            >
              <option value="">Select primary goal</option>
              <option value="personal-expression">Personal expression/journaling</option>
              <option value="build-audience">Build an audience</option>
              <option value="monetize">Monetize my content</option>
              <option value="business-marketing">Business/marketing</option>
              <option value="share-expertise">Share expertise/teach</option>
              <option value="creative-outlet">Creative outlet</option>
              <option value="networking">Networking/community building</option>
            </select>
            {errors.primaryGoal && <span className={styles.error}>{errors.primaryGoal}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              What's your approximate monthly audience size? *
            </label>
            <select
              value={surveyData.audienceSize}
              onChange={(e) => setSurveyData(prev => ({ ...prev, audienceSize: e.target.value }))}
              className={styles.textInput}
              required
            >
              <option value="">Select audience size</option>
              <option value="0-100">0-100 visitors</option>
              <option value="100-1000">100-1,000 visitors</option>
              <option value="1000-5000">1,000-5,000 visitors</option>
              <option value="5000-10000">5,000-10,000 visitors</option>
              <option value="10000-50000">10,000-50,000 visitors</option>
              <option value="50000plus">50,000+ visitors</option>
            </select>
            {errors.audienceSize && <span className={styles.error}>{errors.audienceSize}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              How often do you publish new content? *
            </label>
            <select
              value={surveyData.contentFrequency}
              onChange={(e) => setSurveyData(prev => ({ ...prev, contentFrequency: e.target.value }))}
              className={styles.textInput}
              required
            >
              <option value="">Select posting frequency</option>
              <option value="daily">Daily</option>
              <option value="few-times-week">Few times a week</option>
              <option value="weekly">Weekly</option>
              <option value="bi-weekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
              <option value="sporadic">Sporadic/when inspired</option>
            </select>
            {errors.contentFrequency && <span className={styles.error}>{errors.contentFrequency}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              How do readers currently discover your blog? * (Select all that apply)
            </label>
            <div className={styles.checkboxGrid}>
              {[
                'Search engines (Google, etc.)',
                'Social media (Twitter, Instagram, etc.)',
                'Word of mouth/referrals',
                'Other blog directories',
                'Email newsletter',
                'Podcast mentions',
                'Online communities/forums',
                'Direct traffic (bookmarks)',
                'Guest posting',
                'Not sure/struggling with discovery'
              ].map(method => (
                <label key={method} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={surveyData.discoveryMethods.includes(method)}
                    onChange={(e) => handleCheckboxChange('discoveryMethods', method, e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxText}>{method}</span>
                </label>
              ))}
            </div>
            {errors.discoveryMethods && <span className={styles.error}>{errors.discoveryMethods}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              What's your biggest challenge as a blogger? *
            </label>
            <textarea
              value={surveyData.challengesFaced}
              onChange={(e) => setSurveyData(prev => ({ ...prev, challengesFaced: e.target.value }))}
              className={styles.textarea}
              rows={3}
              placeholder="e.g., finding readers, consistent posting, monetization, etc."
              maxLength={500}
              required
            />
            {errors.challengesFaced && <span className={styles.error}>{errors.challengesFaced}</span>}
            <small className={styles.hint}>{surveyData.challengesFaced.length}/500 characters</small>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Which platforms do you use to promote your blog? (Select all that apply)
            </label>
            <div className={styles.checkboxGrid}>
              {[
                'Twitter/X',
                'Instagram',
                'Facebook',
                'LinkedIn',
                'Pinterest',
                'TikTok',
                'YouTube',
                'Reddit',
                'Discord',
                'Email newsletter',
                'None currently'
              ].map(platform => (
                <label key={platform} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={surveyData.platformsUsed.includes(platform)}
                    onChange={(e) => handleCheckboxChange('platformsUsed', platform, e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxText}>{platform}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Are you interested in monetizing your blog? *
            </label>
            <select
              value={surveyData.monetizationInterest}
              onChange={(e) => setSurveyData(prev => ({ ...prev, monetizationInterest: e.target.value }))}
              className={styles.textInput}
              required
            >
              <option value="">Select interest level</option>
              <option value="very-interested">Very interested</option>
              <option value="somewhat-interested">Somewhat interested</option>
              <option value="not-sure">Not sure</option>
              <option value="not-interested">Not interested</option>
              <option value="already-monetizing">Already monetizing</option>
            </select>
            {errors.monetizationInterest && <span className={styles.error}>{errors.monetizationInterest}</span>}
          </div>

          {surveyData.monetizationInterest === 'already-monetizing' && (
            <div className={styles.formGroup}>
              <label className={styles.label}>
                How do you currently monetize your blog? * (Select all that apply)
              </label>
              <div className={styles.checkboxGrid}>
                {[
                  'Display advertising (Google AdSense, etc.)',
                  'Affiliate marketing',
                  'Sponsored posts/brand partnerships',
                  'Digital products (courses, ebooks, etc.)',
                  'Physical products',
                  'Subscription/membership content',
                  'Email newsletter monetization',
                  'Consulting/coaching services',
                  'Speaking engagements',
                  'Freelance writing from blog exposure',
                  'Donations/tips',
                  'Other'
                ].map(method => (
                  <label key={method} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={surveyData.currentMonetizationMethods?.includes(method) || false}
                      onChange={(e) => handleCheckboxChange('currentMonetizationMethods', method, e.target.checked)}
                      className={styles.checkbox}
                    />
                    <span className={styles.checkboxText}>{method}</span>
                  </label>
                ))}
              </div>
              {errors.currentMonetizationMethods && <span className={styles.error}>{errors.currentMonetizationMethods}</span>}
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>
              How important is connecting with other bloggers to you? *
            </label>
            <select
              value={surveyData.communityInterest}
              onChange={(e) => setSurveyData(prev => ({ ...prev, communityInterest: e.target.value }))}
              className={styles.textInput}
              required
            >
              <option value="">Select importance level</option>
              <option value="very-important">Very important</option>
              <option value="somewhat-important">Somewhat important</option>
              <option value="neutral">Neutral</option>
              <option value="not-very-important">Not very important</option>
              <option value="prefer-solo">Prefer working solo</option>
            </select>
            {errors.communityInterest && <span className={styles.error}>{errors.communityInterest}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              What features would you like to see in a blog directory platform?
              <span className={styles.optional}>(Optional)</span>
            </label>
            <textarea
              value={surveyData.additionalFeatures}
              onChange={(e) => setSurveyData(prev => ({ ...prev, additionalFeatures: e.target.value }))}
              className={styles.textarea}
              rows={3}
              placeholder="e.g., analytics, collaboration tools, monetization support, etc."
              maxLength={500}
            />
            <small className={styles.hint}>{surveyData.additionalFeatures.length}/500 characters</small>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Any additional feedback or suggestions?
              <span className={styles.optional}>(Optional)</span>
            </label>
            <textarea
              value={surveyData.feedback}
              onChange={(e) => setSurveyData(prev => ({ ...prev, feedback: e.target.value }))}
              className={styles.textarea}
              rows={3}
              placeholder="Share any thoughts about blogging or what you'd like to see from Blogrolly"
              maxLength={500}
            />
            <small className={styles.hint}>{surveyData.feedback.length}/500 characters</small>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button type="button" onClick={onClose} className={styles.linkButton}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              Complete Survey
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SurveyPopup;
