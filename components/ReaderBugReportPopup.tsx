
import React, { useState } from 'react';
import styles from '../styles/ReaderProfile.module.css';

interface ReaderBugReportPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReaderBugReportPopup: React.FC<ReaderBugReportPopupProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    bugType: '',
    description: '',
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    browserInfo: '',
    additionalInfo: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const bugTypes = [
    'Profile not loading correctly',
    'Saved blogs not displaying',
    'Following list issues',
    'Reading history problems',
    'Settings not saving',
    'Search functionality',
    'Navigation issues',
    'Performance/slow loading',
    'Visual/display problems',
    'Other'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length + uploadedImages.length > 3) {
      alert('Maximum 3 images allowed');
      return;
    }

    setUploadedImages(prev => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bugType || !formData.description) {
      alert('Please fill in the bug type and description fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert images to base64 for storage
      const imageData = await Promise.all(
        uploadedImages.map(async (file) => {
          return new Promise<{name: string, data: string, type: string}>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({
                name: file.name,
                data: reader.result as string,
                type: file.type
              });
            };
            reader.readAsDataURL(file);
          });
        })
      );

      const response = await fetch('/api/submit-bug-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          reportedBy: 'reader', // Specify this is from reader profile
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          attachments: imageData
        }),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          onClose();
          setSubmitSuccess(false);
          setFormData({
            bugType: '',
            description: '',
            stepsToReproduce: '',
            expectedBehavior: '',
            actualBehavior: '',
            browserInfo: '',
            additionalInfo: ''
          });
          setUploadedImages([]);
          setImagePreviews([]);
        }, 2000);
      } else {
        alert('Failed to submit bug report. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting bug report:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (submitSuccess) {
    return (
      <div className={styles.popupOverlay}>
        <div className={styles.popupContent} style={{ maxWidth: '500px', textAlign: 'center' }}>
          <div className={styles.successMessage}>
            <h3 style={{ color: '#10b981', marginBottom: '1rem' }}>✅ Bug Report Submitted!</h3>
            <p>Thank you for helping us improve BlogRolly. We'll review your report and work on a fix.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContent} style={{ maxWidth: '700px', maxHeight: '90vh' }}>
        <div className={styles.popupHeader}>
          <h3>Report a Bug</h3>
          <button 
            className={styles.closeButton}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
          <p style={{ 
            color: '#6b7280', 
            marginBottom: '2rem', 
            lineHeight: '1.6'
          }}>
            Found something that's not working right? Help us fix it by providing details about the issue.
          </p>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              What type of bug did you encounter? *
            </label>
            <select
              value={formData.bugType}
              onChange={(e) => handleInputChange('bugType', e.target.value)}
              className={styles.input}
              required
            >
              <option value="">Select bug type</option>
              {bugTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Describe the bug *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={styles.textarea}
              rows={4}
              placeholder="Please describe what went wrong..."
              maxLength={1000}
              required
            />
            <small className={styles.hint}>{formData.description.length}/1000 characters</small>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Steps to reproduce the bug
            </label>
            <textarea
              value={formData.stepsToReproduce}
              onChange={(e) => handleInputChange('stepsToReproduce', e.target.value)}
              className={styles.textarea}
              rows={3}
              placeholder="1. Go to... 2. Click on... 3. See error..."
              maxLength={500}
            />
            <small className={styles.hint}>{formData.stepsToReproduce.length}/500 characters</small>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              What did you expect to happen?
            </label>
            <textarea
              value={formData.expectedBehavior}
              onChange={(e) => handleInputChange('expectedBehavior', e.target.value)}
              className={styles.textarea}
              rows={2}
              placeholder="What should have happened instead?"
              maxLength={300}
            />
            <small className={styles.hint}>{formData.expectedBehavior.length}/300 characters</small>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              What actually happened?
            </label>
            <textarea
              value={formData.actualBehavior}
              onChange={(e) => handleInputChange('actualBehavior', e.target.value)}
              className={styles.textarea}
              rows={2}
              placeholder="What actually occurred?"
              maxLength={300}
            />
            <small className={styles.hint}>{formData.actualBehavior.length}/300 characters</small>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Browser & Device Info
            </label>
            <input
              type="text"
              value={formData.browserInfo}
              onChange={(e) => handleInputChange('browserInfo', e.target.value)}
              className={styles.input}
              placeholder="e.g., Chrome on Mac, Mobile Safari on iPhone, etc."
              maxLength={100}
            />
            <small className={styles.hint}>{formData.browserInfo.length}/100 characters</small>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Additional Information
            </label>
            <textarea
              value={formData.additionalInfo}
              onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
              className={styles.textarea}
              rows={2}
              placeholder="Any error messages or other helpful details..."
              maxLength={500}
            />
            <small className={styles.hint}>{formData.additionalInfo.length}/500 characters</small>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Screenshots & Images
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className={styles.fileInput}
              id="bug-report-images"
            />
            <label htmlFor="bug-report-images" className={styles.uploadButton}>
              Upload Screenshots
            </label>
            <small className={styles.hint}>
              Upload up to 3 images (max 5MB each). Supported: PNG, JPG, GIF, WebP
            </small>
            
            {imagePreviews.length > 0 && (
              <div className={styles.imagePreviewContainer}>
                {imagePreviews.map((preview, index) => (
                  <div key={index} className={styles.imagePreview}>
                    <img src={preview} alt={`Screenshot ${index + 1}`} />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className={styles.removeImageButton}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button 
              type="button" 
              onClick={onClose}
              className={styles.cancelButton}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.saveButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Bug Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReaderBugReportPopup;
