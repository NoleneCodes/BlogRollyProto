
import React, { useState } from 'react';
import BugReportModal from './BugReportModal';

interface BugReportButtonProps {
  buttonText?: string;
  className?: string;
  onReportSubmitted?: (reportId: string) => void;
}

const BugReportButton: React.FC<BugReportButtonProps> = ({ 
  buttonText = "Report a Bug", 
  className = "",
  onReportSubmitted
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmitSuccess = (reportId: string) => {
    console.log(`Bug report ${reportId} submitted successfully`);
    if (onReportSubmitted) {
      onReportSubmitted(reportId);
    }
  };

  return (
    <>
      <button 
        className={className}
        onClick={() => setIsModalOpen(true)}
      >
        {buttonText}
      </button>
      
      <BugReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitSuccess={handleSubmitSuccess}
      />
    </>
  );
};

export default BugReportButton;
