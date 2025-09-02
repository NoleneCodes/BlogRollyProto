import React, { useState } from 'react';
import styles from '../styles/ReaderProfile.module.css';

interface FeedbackPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackPopup: React.FC<FeedbackPopupProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    feedbackType: '',
    subject: '',
    message: '',
    email: ''
  });

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.feedbackType.trim()) {
      alert('Please select a feedback type');
      return;
    }
    
    if (!formData.message.trim()) {
      alert('Please provide your feedback message');
      return;
    }

    // TODO: Submit feedback to backend
    console.log('Feedback submitted:', formData);
    alert('Thank you for your feedback! We appreciate you helping us improve BlogRolly.');
    
    // Reset form
    setFormData({
      feedbackType: '',
      subject: '',
      message: '',
      email: ''
    });
    onClose();
  };

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContent}>
        <div className={styles.popupHeader}>
          <h3>Send Feedback</h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.popupBody}>
          <p className={styles.popupDescription}>
            We&apos;d love to hear from you! Your feedback helps us improve BlogRolly and create a better experience for everyone.
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>Feedback Type *</label>
              <select
                name="feedbackType"
                value={formData.feedbackType}
                onChange={handleInputChange}
                className={styles.input}
                required
              >
                <option value="">Select feedback type</option>
                <option value="feature-request">Feature Request</option>
                <option value="improvement">Improvement Suggestion</option>
                <option value="user-experience">User Experience</option>
                <option value="content">Content & Discovery</option>
                <option value="general">General Feedback</option>
                <option value="compliment">Compliment</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Subject (Optional)</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Brief summary of your feedback"
                maxLength={100}
              />
              <small className={styles.hint}>{formData.subject.length}/100 characters</small>
            </div>

            <div className={styles.formGroup}>
              <label>Your Feedback *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                className={styles.textarea}
                rows={6}
                placeholder="Share your thoughts, suggestions, or ideas with us..."
                required
                maxLength={1000}
              />
              <small className={styles.hint}>{formData.message.length}/1000 characters</small>
            </div>

            <div className={styles.formGroup}>
              <label>Email (Optional)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="your@email.com"
              />
              <small className={styles.hint}>
                Provide your email if you&apos;d like us to follow up on your feedback
              </small>
            </div>

            <div className={styles.popupActions}>
              <button type="button" className={styles.cancelButton} onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className={styles.saveButton}>
                Send Feedback
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPopup;
