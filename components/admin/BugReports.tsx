import React, { useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import Image from 'next/image';
import styles from '../../styles/AdminDashboard.module.css';
// import { getAllBugReports, getBugReportById, updateBugReportStatus, BugReport } from '../../lib/bugReportData';
// import { useSession } from 'next-auth/react';

interface BugReport {
  id: string;
  title: string;
  description: string;
  steps_to_reproduce?: string;
  expected_behavior?: string;
  actual_behavior?: string;
  browser?: string;
  operating_system?: string;
  additional_info?: string;
  images?: string[];
  priority: 'high' | 'medium' | 'low';
  reporter: string;
  status: 'open' | 'in-progress' | 'resolved';
  created_at: string;
  updated_at: string;
}
const BugReports = () => {
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in-progress' | 'resolved'>('all');
  const [bugReportsData, setBugReportsData] = useState<BugReport[]>([]);
  const [selectedBugReport, setSelectedBugReport] = useState<BugReport | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const user = useUser();
  const adminEmail = user?.email || 'unknown-admin';

  useEffect(() => {
      async function fetchBugReports() {
        try {
          const res = await fetch('/api/get-bug-reports');
          if (!res.ok) {
            throw new Error(`Failed to fetch bug reports: ${res.status}`);
          }
          const json = await res.json();
          setBugReportsData(json.bugReports || []);
        } catch (error) {
          console.error('Error fetching bug reports:', error);
          setBugReportsData([]);
        }
      }
      fetchBugReports();
  }, []);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedAndFilteredData = () => {
    let filteredData = [...bugReportsData];
    if (priorityFilter !== 'all') {
      filteredData = filteredData.filter(item => item.priority === priorityFilter);
    }
    if (statusFilter !== 'all') {
      filteredData = filteredData.filter(item => item.status === statusFilter);
    }
    if (sortConfig !== null) {
      filteredData.sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof typeof a];
        let bValue: any = b[sortConfig.key as keyof typeof b];
        if (sortConfig.key === 'date') {
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
        }
        if (sortConfig.key === 'priority') {
          const priorityOrder = { 'low': 1, 'medium': 2, 'high': 3 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 0;
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        }
        // fallback to string comparison for strings, arrays, or other types
        return String(aValue).localeCompare(String(bValue)) * (sortConfig.direction === 'asc' ? 1 : -1);
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
      case 'high': return styles.priorityHigh;
      case 'medium': return styles.priorityMedium;
      case 'low': return styles.priorityLow;
      default: return '';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'open': return styles.statusPending;
      case 'in-progress': return styles.statusInProgress;
      case 'resolved': return styles.statusResolved;
      default: return '';
    }
  };

  const handleStatusChange = async (bugId: string, newStatus: 'open' | 'in-progress' | 'resolved') => {
    try {
      const res = await fetch('/api/update-bug-report-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bugId, newStatus, adminEmail })
      });
      const json = await res.json();
      if (json.success) {
        // Refresh bug reports
        const updated = await fetch('/api/get-bug-reports');
        const updatedJson = await updated.json();
        setBugReportsData(updatedJson.bugReports || []);
        alert(`Bug ${bugId} status updated to ${newStatus}`);
      } else {
        alert('Failed to update bug status');
      }
    } catch {
      alert('Failed to update bug status');
    }
  };

  const handleViewBugReport = (bugId: string) => {
    const report = bugReportsData.find(b => b.id === bugId);
    if (report) {
      setSelectedBugReport(report);
      setShowViewModal(true);
    }
  };

  const sortedAndFilteredData = getSortedAndFilteredData();

  return (
    <div className={styles.sectionContent}>
      <div className={styles.sectionHeader}>
        <h2>Bug Reports</h2>
        <p>Manage and respond to user-reported bugs</p>
      </div>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>{sortedAndFilteredData.filter(item => item.status === 'open').length}</h3>
          <p>Open Reports</p>
        </div>
        <div className={styles.statCard}>
          <h3>{sortedAndFilteredData.filter(item => item.priority === 'high').length}</h3>
          <p>High Priority</p>
        </div>
        <div className={styles.statCard}>
          <h3>{sortedAndFilteredData.filter(item => item.status === 'resolved').length}</h3>
          <p>Resolved</p>
        </div>
      </div>
      <div className={styles.tableFilters}>
        <div className={styles.filterGroup}>
          <label htmlFor="priority-filter">Priority:</label>
          <select 
            id="priority-filter"
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value as 'all' | 'high' | 'medium' | 'low')}
            className={styles.filterSelect}
          >
            <option value="all">All Priorities</option>
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
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'open' | 'in-progress' | 'resolved')}
            className={styles.filterSelect}
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <div className={styles.resultsInfo}>
          Showing {sortedAndFilteredData.length} of {bugReportsData.length} reports
        </div>
      </div>
      <div className={styles.tableContainer}>
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} className={styles.sortableHeader}>Bug ID{getSortIcon('id')}</th>
              <th onClick={() => handleSort('title')} className={styles.sortableHeader}>Title{getSortIcon('title')}</th>
              <th onClick={() => handleSort('priority')} className={styles.sortableHeader}>Priority{getSortIcon('priority')}</th>
              <th onClick={() => handleSort('reporter')} className={styles.sortableHeader}>Reporter{getSortIcon('reporter')}</th>
              <th onClick={() => handleSort('status')} className={styles.sortableHeader}>Status{getSortIcon('status')}</th>
              <th onClick={() => handleSort('date')} className={styles.sortableHeader}>Date{getSortIcon('date')}</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredData.map((bug) => (
              <tr key={bug.id}>
                <td><strong>{bug.id}</strong></td>
                <td>{bug.title}</td>
                <td><span className={getPriorityClass(bug.priority)}>{bug.priority.charAt(0).toUpperCase() + bug.priority.slice(1)}</span></td>
                <td>{bug.reporter}</td>
                <td>
                  <select 
                    value={bug.status}
                    onChange={(e) => handleStatusChange(bug.id, e.target.value as 'open' | 'in-progress' | 'resolved')}
                    className={`${styles.statusSelect} ${getStatusClass(bug.status)}`}
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </td>
                <td>{new Date(bug.created_at).toLocaleDateString()}</td>
                <td>
                  <button className={styles.actionButton} onClick={() => handleViewBugReport(bug.id)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sortedAndFilteredData.length === 0 && (
          <div className={styles.emptyState}>
            <h3>No bug reports found</h3>
            <p>No reports match your current filters.</p>
          </div>
        )}
      </div>
      {showViewModal && selectedBugReport && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Bug Report Details - {selectedBugReport.id}</h3>
              <button className={styles.closeButton} aria-label="Close" onClick={() => setShowViewModal(false)}>×</button>
            </div>
            <div className={styles.bugReportDetails}>
              <div className={styles.bugReportHeader}>
                <h4>{selectedBugReport.title}</h4>
                <div className={styles.bugReportBadges}>
                  <span className={`${styles.priorityBadge} ${getPriorityClass(selectedBugReport.priority)}`}>{selectedBugReport.priority.toUpperCase()} PRIORITY</span>
                  <span className={`${styles.statusBadge} ${getStatusClass(selectedBugReport.status)}`}>{selectedBugReport.status.toUpperCase()}</span>
                </div>
              </div>
              <div className={styles.bugReportMeta}>
                <div className={styles.metaItem}><strong>Reporter:</strong> {selectedBugReport.reporter}</div>
                <div className={styles.metaItem}><strong>Submitted:</strong> {new Date(selectedBugReport.created_at).toLocaleString()}</div>
                <div className={styles.metaItem}><strong>Browser:</strong> {selectedBugReport.browser || 'Not specified'}</div>
                <div className={styles.metaItem}><strong>OS:</strong> {selectedBugReport.operating_system || 'Not specified'}</div>
              </div>
              <div className={styles.bugReportSection}><h5>Description</h5><p>{selectedBugReport.description}</p></div>
              {selectedBugReport.steps_to_reproduce && (<div className={styles.bugReportSection}><h5>Steps to Reproduce</h5><pre>{selectedBugReport.steps_to_reproduce}</pre></div>)}
              {selectedBugReport.expected_behavior && (<div className={styles.bugReportSection}><h5>Expected Behavior</h5><p>{selectedBugReport.expected_behavior}</p></div>)}
              {selectedBugReport.actual_behavior && (<div className={styles.bugReportSection}><h5>Actual Behavior</h5><p>{selectedBugReport.actual_behavior}</p></div>)}
              {selectedBugReport.images && selectedBugReport.images.length > 0 && (
                <div className={styles.bugReportSection}>
                  <h5>Screenshots</h5>
                  <div className={styles.bugReportImages}>
                    {selectedBugReport.images.map((image, index) => (
                      <Image
                        key={index}
                        src={image}
                        alt={`Screenshot ${index + 1}`}
                        className={styles.bugReportImage}
                        width={600}
                        height={400}
                        unoptimized
                      />
                    ))}
                  </div>
                </div>
              )}
              {selectedBugReport.images && selectedBugReport.images.length > 0 && (
                <div className={styles.bugReportSection}>
                  <h5>Screenshots</h5>
                  <div className={styles.bugReportImages}>
                    {selectedBugReport.images.map((image, index) => (
                      <Image
                        key={index}
                        src={image}
                        alt={`Screenshot ${index + 1}`}
                        className={styles.bugReportImage}
                        width={600}
                        height={400}
                        style={{ objectFit: 'contain', borderRadius: '8px' }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={() => setShowViewModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BugReports;
