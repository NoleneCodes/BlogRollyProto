
import React, { useState } from 'react';
import { supabaseDB } from '../lib/supabase';
import styles from '../styles/BugReportModal.module.css';

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: (reportId: string) => void;
}

const BugReportModal: React.FC<BugReportModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmitSuccess 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    browser: '',
    operatingSystem: '',
    additionalInfo: ''
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      stepsToReproduce: '',
      expectedBehavior: '',
      actualBehavior: '',
      browser: '',
      operatingSystem: '',
      additionalInfo: ''
    });
    setSelectedImages([]);
    setImagePreviews([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (selectedImages.length + files.length > 3) {
      alert('You can only upload up to 3 images');
      return;
    }

    const validFiles = files.filter(file => {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        alert(`${file.name} is not a supported image format`);
        return false;
      }
      
      if (file.size > maxSize) {
        alert(`${file.name} is too large. Max size is 5MB`);
        return false;
      }
      
      return true;
    });

    setSelectedImages(prev => [...prev, ...validFiles]);
    
    // Create preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title.trim()) {
      alert('Please provide a bug title');
      return;
    }
    
    if (!formData.description.trim()) {
      alert('Please provide a bug description');
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert images to base64 for storage
      const imagePromises = selectedImages.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
      });
      
      const imageBase64Array = await Promise.all(imagePromises);
      
      // Add default reporter email (in a real app, this would come from user session)
      const reportData = {
        ...formData,
        reporter: 'user@example.com', // This should come from authenticated user
        images: imageBase64Array,
        stepsToReproduce: formData.stepsToReproduce,
        expectedBehavior: formData.expectedBehavior,
        actualBehavior: formData.actualBehavior,
        additionalInfo: formData.additionalInfo
      };
      
      // Save bug report to database
      const result = await supabaseDB.createBugReport(reportData);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      console.log('Bug report saved:', result.data);
      
      alert('Bug report submitted successfully! Thank you for helping us improve BlogRolly.');
      
      // Call success callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess(result.data.id);
      }
      
      // Reset form and close modal
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error submitting bug report:', error);
      alert('Failed to submit bug report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Report a Bug</h3>
          <button 
            className={styles.closeButton} 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>
        
        <div className={styles.body}>
          <p className={styles.description}>
            Help us improve BlogRolly by reporting any bugs or issues you encounter. 
            Please provide as much detail as possible.
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>Bug Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Brief description of the issue"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={styles.textarea}
                rows={4}
                placeholder="Describe the bug in detail"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Steps to Reproduce</label>
              <textarea
                name="stepsToReproduce"
                value={formData.stepsToReproduce}
                onChange={handleInputChange}
                className={styles.textarea}
                rows={3}
                placeholder="1. Go to...&#10;2. Click on...&#10;3. See error"
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Expected Behavior</label>
              <input
                type="text"
                name="expectedBehavior"
                value={formData.expectedBehavior}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="What should have happened?"
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Actual Behavior</label>
              <input
                type="text"
                name="actualBehavior"
                value={formData.actualBehavior}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="What actually happened?"
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Browser</label>
              <select
                name="browser"
                value={formData.browser}
                onChange={handleInputChange}
                className={styles.input}
                disabled={isSubmitting}
              >
                <option value="">Select browser</option>
                <option value="chrome">Chrome</option>
                <option value="firefox">Firefox</option>
                <option value="safari">Safari</option>
                <option value="edge">Edge</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Operating System</label>
              <select
                name="operatingSystem"
                value={formData.operatingSystem}
                onChange={handleInputChange}
                className={styles.input}
                disabled={isSubmitting}
              >
                <option value="">Select OS</option>
                <option value="windows">Windows</option>
                <option value="macos">macOS</option>
                <option value="linux">Linux</option>
                <option value="ios">iOS</option>
                <option value="android">Android</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Screenshots</label>
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.gif,.webp"
                multiple
                onChange={handleImageUpload}
                className={styles.fileInput}
                id="bug-report-images"
                disabled={isSubmitting}
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
                      <img src={preview} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className={styles.removeImageButton}
                        disabled={isSubmitting}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Additional Information</label>
              <textarea
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleInputChange}
                className={styles.textarea}
                rows={3}
                placeholder="Any other relevant information..."
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.actions}>
              <button 
                type="button" 
                className={styles.cancelButton} 
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Bug Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BugReportModal;
