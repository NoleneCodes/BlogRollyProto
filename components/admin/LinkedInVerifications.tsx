import React, { useState, useEffect } from 'react';
import styles from '../../styles/AdminDashboard.module.css';

// Local type
export type LinkedInVerification = {
  id: string;
  bloggerName: string;
  linkedinUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  dateSort: number;
  email: string; // Added email field for mock data
};

const fetchVerifications = async (): Promise<LinkedInVerification[]> => {
  const res = await fetch('/api/investor/get-linkedin-verifications');
  return res.json();
};

import { supabase } from '../../lib/supabase';

const updateVerificationStatus = async (id: string, status: 'pending' | 'approved' | 'rejected') => {
  // Get admin user id from supabase session
  let admin_user_id = null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    admin_user_id = session?.user?.id || null;
  } catch {}
  await fetch('/api/investor/update-linkedin-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status, admin_user_id })
  });
};

const sendLinkedInVerificationResult = async (email: string, name: string, approved: boolean, rejectionReason?: string) => {
  await fetch('/api/investor/send-linkedin-result', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name, approved, rejectionReason })
  });
};

const LinkedInVerifications = () => {
  const [verifications, setVerifications] = useState<LinkedInVerification[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [pendingRejectId, setPendingRejectId] = useState<string | null>(null);
  const [dateView, setDateView] = useState<'1month' | '3month' | 'all'>('all');

  useEffect(() => {
    fetchVerifications()
      .then(data => setVerifications(Array.isArray(data) ? data : []))
      .catch(() => setVerifications([]));
  }, []);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filter by dateView
  const filterByDateView = (data: LinkedInVerification[]) => {
    if (dateView === 'all') return data;
    const now = new Date();
    let cutoff: Date;
    if (dateView === '1month') {
      cutoff = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    } else {
      cutoff = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    }
    return data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= cutoff;
    });
  };

  const getSortedAndFilteredData = () => {
    let filteredData = [...verifications];
    filteredData = filterByDateView(filteredData);
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

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending': return styles.statusPending;
      case 'approved': return styles.statusApproved;
      case 'rejected': return styles.statusRejected;
      default: return '';
    }
  };

  const handleStatusChange = async (verificationId: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    const verification = verifications.find(v => v.id === verificationId);
    if (!verification) return;
    if (newStatus === 'rejected') {
      setPendingRejectId(verificationId);
      setShowRejectModal(true);
      return;
    }
    await updateVerificationStatus(verificationId, newStatus);
    if (newStatus === 'approved') {
      await sendLinkedInVerificationResult(
        verification.email,
        verification.bloggerName,
        true
      );
    }
    fetchVerifications().then(setVerifications);
  };

  const handleRejectSubmit = async () => {
    if (pendingRejectId) {
      const verification = verifications.find(v => v.id === pendingRejectId);
      if (!verification) return;
      await updateVerificationStatus(pendingRejectId, 'rejected');
      await sendLinkedInVerificationResult(
        verification.email,
        verification.bloggerName,
        false,
        rejectReason
      );
      fetchVerifications().then(setVerifications);
      setShowRejectModal(false);
      setRejectReason('');
      setPendingRejectId(null);
    }
  };

  const sortedAndFilteredData = getSortedAndFilteredData();

  return (
    <div className={styles.sectionContent}>
      <div className={styles.sectionHeader}>
        <h2>LinkedIn Verifications</h2>
        <p>Review and approve LinkedIn profile verifications for bloggers</p>
      </div>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}><h3>{sortedAndFilteredData.filter(item => item.status === 'pending').length}</h3><p>Pending</p></div>
        <div className={styles.statCard}><h3>{sortedAndFilteredData.filter(item => item.status === 'approved').length}</h3><p>Approved</p></div>
        <div className={styles.statCard}><h3>{sortedAndFilteredData.filter(item => item.status === 'rejected').length}</h3><p>Rejected</p></div>
      </div>
      <div className={styles.tableFilters}>
        <div className={styles.filterGroup}>
          <label htmlFor="status-filter">Status:</label>
          <select 
            id="status-filter"
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'approved' | 'rejected')}
            className={styles.filterSelect}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor="date-view">Date Range:</label>
          <select
            id="date-view"
            value={dateView}
            onChange={e => setDateView(e.target.value as '1month' | '3month' | 'all')}
            className={styles.filterSelect}
          >
            <option value="1month">Last 1 Month</option>
            <option value="3month">Last 3 Months</option>
            <option value="all">All Time</option>
          </select>
        </div>
        <div className={styles.resultsInfo}>
          Showing {sortedAndFilteredData.length} of {verifications.length} verifications
        </div>
      </div>
      <div className={styles.tableContainer}>
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} className={styles.sortableHeader}>ID{getSortIcon('id')}</th>
              <th onClick={() => handleSort('bloggerName')} className={styles.sortableHeader}>Blogger{getSortIcon('bloggerName')}</th>
              <th onClick={() => handleSort('linkedinUrl')} className={styles.sortableHeader}>LinkedIn URL{getSortIcon('linkedinUrl')}</th>
              <th onClick={() => handleSort('status')} className={styles.sortableHeader}>Status{getSortIcon('status')}</th>
              <th onClick={() => handleSort('date')} className={styles.sortableHeader}>Date{getSortIcon('date')}</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredData.map((verification) => (
              <tr key={verification.id}>
                <td><strong>{verification.id}</strong></td>
                <td>{verification.bloggerName}</td>
                <td><a href={verification.linkedinUrl} target="_blank" rel="noopener noreferrer">{verification.linkedinUrl}</a></td>
                <td>
                  <select 
                    value={verification.status}
                    onChange={(e) => handleStatusChange(verification.id, e.target.value as 'pending' | 'approved' | 'rejected')}
                    className={`${styles.statusSelect} ${getStatusClass(verification.status)}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
                <td>{verification.date}</td>
                <td>
                  <button className={styles.actionButton} onClick={() => window.open(verification.linkedinUrl, '_blank')}>View Profile</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sortedAndFilteredData.length === 0 && (
          <div className={styles.emptyState}>
            <h3>No LinkedIn verifications found</h3>
            <p>No verifications match your current filters.</p>
          </div>
        )}
      </div>
      {showRejectModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Reject LinkedIn Verification</h3>
              <button className={styles.closeButton} aria-label="Close" onClick={() => { setShowRejectModal(false); setRejectReason(''); setPendingRejectId(null); }}>×</button>
            </div>
            <div className={styles.modalBody}>
              <label htmlFor="reject-reason">Reason for rejection:</label>
              <textarea
                id="reject-reason"
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                rows={4}
                className={styles.responseTextarea}
              />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.resolveButton} onClick={handleRejectSubmit} disabled={!rejectReason.trim()}>Submit Rejection</button>
              <button className={styles.cancelButton} onClick={() => { setShowRejectModal(false); setRejectReason(''); setPendingRejectId(null); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkedInVerifications;
