import React, { useState, useEffect } from 'react';
import styles from '../../styles/AdminDashboard.module.css';
import { getAllSupportRequests, getSupportRequestById, updateSupportRequestStatus, addEmailToThread, SupportRequest } from '../../lib/supportRequestData';

const SupportRequests = () => {
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low' | 'critical'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'responded' | 'closed'>('all');
  const [supportRequestsData, setSupportRequestsData] = useState<SupportRequest[]>([]);
  const [selectedSupportRequest, setSelectedSupportRequest] = useState<SupportRequest | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');

  useEffect(() => {
    const requests = getAllSupportRequests();
    setSupportRequestsData(requests);
  }, []);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedAndFilteredData = () => {
    let filteredData = [...supportRequestsData];
    if (priorityFilter !== 'all') {
      filteredData = filteredData.filter(item => item.priority === priorityFilter);
    }
    if (statusFilter !== 'all') {
      filteredData = filteredData.filter(item => item.status === statusFilter);
    }
    if (sortConfig !== null) {
      filteredData.sort((a, b) => {
        let aValue = a[sortConfig.key as keyof typeof a];
        let bValue = b[sortConfig.key as keyof typeof b];
        if (sortConfig.key === 'date') {
          aValue = a.dateSort;
          bValue = b.dateSort;
        }
        if (sortConfig.key === 'priority') {
          const priorityOrder = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
        }
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return filteredData;
  };

  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return '';
    }
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'critical': return styles.priorityCritical;
      case 'high': return styles.priorityHigh;
      case 'medium': return styles.priorityMedium;
      case 'low': return styles.priorityLow;
      default: return '';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'open': return styles.statusPending;
      case 'responded': return styles.statusInProgress;
      case 'closed': return styles.statusResolved;
      default: return '';
    }
  };

  const handleStatusChange = (requestId: string, newStatus: 'open' | 'responded' | 'closed') => {
    const success = updateSupportRequestStatus(requestId, newStatus);
    if (success) {
      const updatedRequests = getAllSupportRequests();
      setSupportRequestsData(updatedRequests);
      alert(`Support request ${requestId} status updated to ${newStatus}`);
    } else {
      alert('Failed to update request status');
    }
  };

  const handleViewSupportRequest = (requestId: string) => {
    const request = getSupportRequestById(requestId);
    if (request) {
      setSelectedSupportRequest(request);
      setShowViewModal(true);
    }
  };

  const handleRespondToRequest = (requestId: string) => {
    const request = getSupportRequestById(requestId);
    if (request) {
      setSelectedSupportRequest(request);
      setShowResponseModal(true);
    }
  };

  const handleSubmitResponse = () => {
    if (!selectedSupportRequest || !adminResponse.trim()) return;
    const emailSuccess = addEmailToThread(selectedSupportRequest.id, {
      from: 'admin',
      sender: 'support@blogrolly.com',
      content: adminResponse
    });
    if (emailSuccess) {
      const updatedRequests = getAllSupportRequests();
      setSupportRequestsData(updatedRequests);
      setShowResponseModal(false);
      setAdminResponse('');
      alert('Response sent successfully!');
    } else {
      alert('Failed to send response');
    }
  };

  const sortedAndFilteredData = getSortedAndFilteredData();

  return (
    <div className={styles.sectionContent}>
      <div className={styles.sectionHeader}>
        <h2>Support Requests</h2>
        <p>Manage and respond to user support inquiries</p>
      </div>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>{sortedAndFilteredData.filter(item => item.status === 'open').length}</h3>
          <p>Open Requests</p>
        </div>
        <div className={styles.statCard}>
          <h3>{sortedAndFilteredData.filter(item => item.priority === 'high' || item.priority === 'critical').length}</h3>
          <p>High Priority</p>
        </div>
        <div className={styles.statCard}>
          <h3>{sortedAndFilteredData.filter(item => item.status === 'closed').length}</h3>
          <p>Resolved</p>
        </div>
      </div>
      <div className={styles.tableFilters}>
        <div className={styles.filterGroup}>
          <label htmlFor="priority-filter">Priority:</label>
          <select 
            id="priority-filter"
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value as 'all' | 'high' | 'medium' | 'low' | 'critical')}
            className={styles.filterSelect}
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor="status-filter">Status:</label>
          <select 
            id="status-filter"
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'open' | 'responded' | 'closed')}
            className={styles.filterSelect}
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="responded">Responded</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div className={styles.resultsInfo}>
          Showing {sortedAndFilteredData.length} of {supportRequestsData.length} requests
        </div>
      </div>
      <div className={styles.tableContainer}>
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} className={styles.sortableHeader}>Request ID{getSortIcon('id')}</th>
              <th onClick={() => handleSort('subject')} className={styles.sortableHeader}>Subject{getSortIcon('subject')}</th>
              <th onClick={() => handleSort('priority')} className={styles.sortableHeader}>Priority{getSortIcon('priority')}</th>
              <th onClick={() => handleSort('user')} className={styles.sortableHeader}>User{getSortIcon('user')}</th>
              <th onClick={() => handleSort('status')} className={styles.sortableHeader}>Status{getSortIcon('status')}</th>
              <th onClick={() => handleSort('date')} className={styles.sortableHeader}>Date{getSortIcon('date')}</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredData.map((request) => (
              <tr key={request.id}>
                <td><strong>{request.id}</strong></td>
                <td>{request.subject}</td>
                <td><span className={getPriorityClass(request.priority)}>{request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}</span></td>
                <td>{request.user}</td>
                <td>
                  <select 
                    value={request.status}
                    onChange={(e) => handleStatusChange(request.id, e.target.value as 'open' | 'responded' | 'closed')}
                    className={`${styles.statusSelect} ${getStatusClass(request.status)}`}
                  >
                    <option value="open">Open</option>
                    <option value="responded">Responded</option>
                    <option value="closed">Closed</option>
                  </select>
                </td>
                <td>{request.created}</td>
                <td>
                  <div className={styles.supportRequestActions}>
                    <button className={styles.actionButton} onClick={() => handleViewSupportRequest(request.id)}>View</button>
                    <button className={styles.approveButton} onClick={() => handleRespondToRequest(request.id)}>Respond</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sortedAndFilteredData.length === 0 && (
          <div className={styles.emptyState}>
            <h3>No support requests found</h3>
            <p>No requests match your current filters.</p>
          </div>
        )}
      </div>
      {showViewModal && selectedSupportRequest && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Support Request Details - {selectedSupportRequest.id}</h3>
              <button className={styles.closeButton} onClick={() => setShowViewModal(false)}>×</button>
            </div>
            <div className={styles.supportRequestDetails}>
              <div className={styles.supportRequestHeader}>
                <h4>{selectedSupportRequest.subject}</h4>
                <div className={styles.supportRequestBadges}>
                  <span className={`${styles.priorityBadge} ${getPriorityClass(selectedSupportRequest.priority)}`}>{selectedSupportRequest.priority.toUpperCase()} PRIORITY</span>
                  <span className={`${styles.statusBadge} ${getStatusClass(selectedSupportRequest.status)}`}>{selectedSupportRequest.status.toUpperCase()}</span>
                </div>
              </div>
              <div className={styles.supportRequestMeta}>
                <div className={styles.metaItem}><strong>User:</strong> {selectedSupportRequest.user}</div>
                {selectedSupportRequest.email && (<div className={styles.metaItem}><strong>Contact Email:</strong> {selectedSupportRequest.email}</div>)}
                <div className={styles.metaItem}><strong>Submitted:</strong> {new Date(selectedSupportRequest.submittedAt).toLocaleString()}</div>
                <div className={styles.metaItem}><strong>Messages:</strong> {selectedSupportRequest.emailThread?.length || 0}</div>
              </div>
              <div className={styles.supportRequestSection}>
                <h5>Email Conversation</h5>
                <div className={styles.emailThread}>
                  {selectedSupportRequest.emailThread?.map((message, index) => (
                    <div key={message.id} className={`${styles.emailMessage} ${message.from === 'admin' ? styles.adminMessage : styles.userMessage}`}>
                      <div className={styles.messageHeader}>
                        <span className={styles.messageSender}>{message.from === 'admin' ? '🛠️ Support Team' : '👤 User'}: {message.sender}</span>
                        <span className={styles.messageTime}>{new Date(message.timestamp).toLocaleString()}</span>
                      </div>
                      <div className={styles.messageContent}>{message.content}</div>
                    </div>
                  ))}
                </div>
              </div>
              {selectedSupportRequest.emailThread && selectedSupportRequest.emailThread.length > 1 && (
                <div className={styles.supportRequestSection}>
                  <h5>Resolution Analysis</h5>
                  <div className={styles.resolutionAnalysis}>
                    {(() => {
                      const lastMessage = selectedSupportRequest.emailThread[selectedSupportRequest.emailThread.length - 1];
                      const userResponses = selectedSupportRequest.emailThread.filter(msg => msg.from === 'user');
                      const adminResponses = selectedSupportRequest.emailThread.filter(msg => msg.from === 'admin');
                      return (
                        <div className={styles.resolutionDetails}>
                          <p><strong>Admin Responses:</strong> {adminResponses.length}</p>
                          <p><strong>User Responses:</strong> {userResponses.length}</p>
                          <p><strong>Last Message From:</strong> {lastMessage.from === 'admin' ? 'Support Team' : 'User'}</p>
                          <p><strong>Last Activity:</strong> {new Date(lastMessage.timestamp).toLocaleString()}</p>
                          {lastMessage.from === 'user' && adminResponses.length > 0 && (
                            <div className={styles.resolutionSuggestion}>
                              <p>💡 <strong>Suggestion:</strong> User responded after support team. Review their message to determine if:</p>
                              <ul>
                                <li>Issue is resolved (consider closing)</li>
                                <li>Additional assistance needed</li>
                                <li>Follow-up questions remain</li>
                              </ul>
                            </div>
                          )}
                          {lastMessage.from === 'admin' && (
                            <div className={styles.resolutionSuggestion}>
                              <p>⏳ <strong>Status:</strong> Waiting for user response to latest support message.</p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
            <div className={styles.modalActions}>
              <button className={styles.approveButton} onClick={() => { setShowViewModal(false); handleRespondToRequest(selectedSupportRequest.id); }}>Respond to Request</button>
              {selectedSupportRequest.status !== 'closed' && (
                <button className={styles.resolveButton} onClick={() => { if (confirm('Are you sure you want to close this support request? This should only be done when the issue is fully resolved.')) { handleStatusChange(selectedSupportRequest.id, 'closed'); setShowViewModal(false); } }}>Mark as Resolved</button>
              )}
              <button className={styles.cancelButton} onClick={() => setShowViewModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
      {showResponseModal && selectedSupportRequest && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Respond to Support Request - {selectedSupportRequest.id}</h3>
              <button className={styles.closeButton} onClick={() => setShowResponseModal(false)}>×</button>
            </div>
            <div className={styles.responseForm}>
              <div className={styles.supportRequestSection}>
                <h5>Original Request</h5>
                <p><strong>Subject:</strong> {selectedSupportRequest.subject}</p>
                <p><strong>Message:</strong> {selectedSupportRequest.message}</p>
              </div>
              <div className={styles.supportRequestSection}>
                <h5>Your Response</h5>
                <textarea value={adminResponse} onChange={(e) => setAdminResponse(e.target.value)} placeholder="Type your response to the user..." className={styles.responseTextarea} rows={6} />
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.approveButton} onClick={handleSubmitResponse} disabled={!adminResponse.trim()}>Send Response</button>
              <button className={styles.cancelButton} onClick={() => { setShowResponseModal(false); setAdminResponse(''); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportRequests;
