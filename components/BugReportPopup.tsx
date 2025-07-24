interface BugReportPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const BugReportPopup: React.FC<BugReportPopupProps> = ({ isOpen, onClose }) => {
  return (
    <div>
      {/* Add your bug report form here */}
      <p>This is a bug report popup.</p>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default BugReportPopup;