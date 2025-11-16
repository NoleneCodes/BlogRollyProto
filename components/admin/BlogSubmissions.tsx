import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import styles from '../../styles/AdminDashboard.module.css';

interface BlogSubmission {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  imageDescription?: string;
  category: string;
  tags: string[];
  status: string;
  hasAdultContent: boolean;
  featured: boolean;
  readingTime?: number;
  socialShares?: number;
  views: number;
  clicks: number;
  ctr: number;
  createdAt: string;
  submittedAt?: string;
  reviewedAt?: string;
  liveAt?: string;
  userId: string;
  authorName?: string;
  authorUsername?: string;
  authorAvatar?: string;
  authorVerified?: boolean;
}

interface Statistics {
  totalSubmissions: number;
  pendingReview: number;
  approvedToday: number;
  rejectedToday: number;
  featuredBlogs: number;
  adultContentBlogs: number;
  avgProcessingTime: number;
}

export default function BlogSubmissions() {
  const [submissions, setSubmissions] = useState<BlogSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<Statistics>({
    totalSubmissions: 0,
    pendingReview: 0,
    approvedToday: 0,
    rejectedToday: 0,
    featuredBlogs: 0,
    adultContentBlogs: 0,
    avgProcessingTime: 0
  });

  // Filters and pagination
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    hasAdultContent: 'all',
    featured: 'all',
    search: '',
    dateFrom: '',
    dateTo: ''
  });

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalCount: 0
  });

  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc' as 'asc' | 'desc'
  });

  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchSubmissions();
        fetchStatistics();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchStatistics = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('blog_submissions')
        .select('status, featured, has_adult_content, created_at, reviewed_at')
        .not('deleted_at', 'is', null);

      if (error) throw error;

      const today = new Date().toDateString();
      
      const stats: Statistics = {
        totalSubmissions: data.length,
        pendingReview: data.filter(s => s.status === 'submitted').length,
        approvedToday: data.filter(s => 
          s.status === 'approved' && 
          s.reviewed_at && 
          new Date(s.reviewed_at).toDateString() === today
        ).length,
        rejectedToday: data.filter(s => 
          s.status === 'rejected' && 
          s.reviewed_at && 
          new Date(s.reviewed_at).toDateString() === today
        ).length,
        featuredBlogs: data.filter(s => s.featured).length,
        adultContentBlogs: data.filter(s => s.has_adult_content).length,
        avgProcessingTime: 0 // Calculate if needed
      };

      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  }, []);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('blog_submissions')
        .select(`
          *,
          users:user_id (
            username,
            display_name,
            first_name,
            surname
          ),
          user_profiles:user_id (
            avatar_url
          ),
          blogger_profiles:user_id (
            is_verified
          )
        `)
        .not('deleted_at', 'is', null);

      // Apply filters
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      if (filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      
      if (filters.hasAdultContent !== 'all') {
        query = query.eq('has_adult_content', filters.hasAdultContent === 'true');
      }
      
      if (filters.featured !== 'all') {
        query = query.eq('featured', filters.featured === 'true');
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Apply sorting
      query = query.order(sortConfig.key, { ascending: sortConfig.direction === 'asc' });

      // Apply pagination
      const startIndex = (pagination.page - 1) * pagination.pageSize;
      query = query.range(startIndex, startIndex + pagination.pageSize - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      // Transform data to match interface
      const transformedData: BlogSubmission[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        url: item.url,
        imageUrl: item.image_url,
        imageDescription: item.image_description,
        category: item.category,
        tags: item.tags || [],
        status: item.status,
        hasAdultContent: item.has_adult_content,
        featured: item.featured || false,
        readingTime: item.reading_time,
        socialShares: item.social_shares || 0,
        views: item.views || 0,
        clicks: item.clicks || 0,
        ctr: item.ctr || 0,
        createdAt: item.created_at,
        submittedAt: item.submitted_at,
        reviewedAt: item.reviewed_at,
        liveAt: item.live_at,
        userId: item.user_id,
        authorName: item.users?.display_name || 
                   `${item.users?.first_name || ''} ${item.users?.surname || ''}`.trim() || 
                   item.users?.username || 'Unknown',
        authorUsername: item.users?.username,
        authorAvatar: item.user_profiles?.avatar_url,
        authorVerified: item.blogger_profiles?.is_verified || false
      }));

      setSubmissions(transformedData);
      setPagination(prev => ({ ...prev, totalCount: count || 0 }));
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.pageSize, sortConfig]);

  useEffect(() => {
    fetchSubmissions();
    fetchStatistics();
  }, [fetchSubmissions]);

  const handleBulkAction = async () => {
    if (!bulkAction || selectedSubmissions.length === 0) return;

    try {
      const response = await fetch('/api/admin/bulk-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: bulkAction,
          submissionIds: selectedSubmissions
        })
      });

      if (!response.ok) throw new Error('Bulk action failed');

      const result = await response.json();
      console.log('Bulk action result:', result);

      // Refresh data and clear selections
      fetchSubmissions();
      fetchStatistics();
      setSelectedSubmissions([]);
      setBulkAction('');
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const handleSingleAction = async (submissionId: string, action: string, reason?: string) => {
    try {
      const response = await fetch('/api/admin/submission-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          action,
          reason
        })
      });

      if (!response.ok) throw new Error('Action failed');

      fetchSubmissions();
      fetchStatistics();
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };

  const handleSelectAll = () => {
    if (selectedSubmissions.length === submissions.length) {
      setSelectedSubmissions([]);
    } else {
      setSelectedSubmissions(submissions.map(s => s.id));
    }
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status: string) => {
    const statusMap = {
      'submitted': styles.statusSubmitted,
      'under_review': styles.statusReview,
      'approved': styles.statusApproved,
      'rejected': styles.statusRejected,
      'live': styles.statusLive,
      'draft': styles.statusDraft
    };
    return statusMap[status as keyof typeof statusMap] || styles.statusDefault;
  };

  return (
    <div className={styles.container}>
      {/* Statistics Dashboard */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{statistics.totalSubmissions}</span>
          <span className={styles.statLabel}>Total Submissions</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{statistics.pendingReview}</span>
          <span className={styles.statLabel}>Pending Review</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{statistics.approvedToday}</span>
          <span className={styles.statLabel}>Approved Today</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{statistics.rejectedToday}</span>
          <span className={styles.statLabel}>Rejected Today</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{statistics.featuredBlogs}</span>
          <span className={styles.statLabel}>Featured Blogs</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{statistics.adultContentBlogs}</span>
          <span className={styles.statLabel}>Adult Content</span>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className={styles.filtersContainer}>
        <div className={styles.searchGroup}>
          <input
            type="text"
            placeholder="Search submissions..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <label>Status:</label>
          <select 
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="all">All</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="live">Live</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Featured:</label>
          <select 
            value={filters.featured}
            onChange={(e) => setFilters(prev => ({ ...prev, featured: e.target.value }))}
          >
            <option value="all">All</option>
            <option value="true">Featured</option>
            <option value="false">Not Featured</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Adult Content:</label>
          <select 
            value={filters.hasAdultContent}
            onChange={(e) => setFilters(prev => ({ ...prev, hasAdultContent: e.target.value }))}
          >
            <option value="all">All</option>
            <option value="true">Adult Content</option>
            <option value="false">Safe Content</option>
          </select>
        </div>

        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={`${styles.refreshButton} ${autoRefresh ? styles.autoRefreshActive : ''}`}
        >
          {autoRefresh ? '🔄 Auto' : '🔄'} Refresh
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedSubmissions.length > 0 && (
        <div className={styles.bulkActions}>
          <span>Selected: {selectedSubmissions.length}</span>
          <select 
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className={styles.bulkActionSelect}
          >
            <option value="">Choose action...</option>
            <option value="approve">Approve</option>
            <option value="reject">Reject</option>
            <option value="feature">Feature</option>
            <option value="unfeature">Unfeature</option>
            <option value="archive">Archive</option>
          </select>
          <button
            onClick={handleBulkAction}
            disabled={!bulkAction}
            className={styles.bulkActionButton}
          >
            Apply to {selectedSubmissions.length} items
          </button>
        </div>
      )}

      {/* Submissions Table */}
      <div className={styles.tableContainer}>
        <table className={styles.submissionsTable}>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedSubmissions.length === submissions.length && submissions.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th onClick={() => handleSort('title')} className={styles.sortable}>
                Title {sortConfig.key === 'title' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('category')} className={styles.sortable}>
                Category
              </th>
              <th>Author</th>
              <th onClick={() => handleSort('status')} className={styles.sortable}>
                Status
              </th>
              <th>Metrics</th>
              <th onClick={() => handleSort('createdAt')} className={styles.sortable}>
                Submitted
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className={styles.loading}>Loading submissions...</td>
              </tr>
            ) : submissions.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.noData}>No submissions found</td>
              </tr>
            ) : (
              submissions.map((submission) => (
                <tr 
                  key={submission.id}
                  className={submission.featured ? styles.featuredRow : ''}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedSubmissions.includes(submission.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSubmissions(prev => [...prev, submission.id]);
                        } else {
                          setSelectedSubmissions(prev => prev.filter(id => id !== submission.id));
                        }
                      }}
                    />
                  </td>
                  
                  <td className={styles.titleCell}>
                    <div className={styles.titleContainer}>
                      <strong>{submission.title}</strong>
                      {submission.featured && <span className={styles.featuredBadge}>⭐</span>}
                      {submission.hasAdultContent && <span className={styles.adultBadge}>18+</span>}
                      
                      <div className={styles.titleMeta}>
                        {submission.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className={styles.tag}>{tag}</span>
                        ))}
                        {submission.readingTime && (
                          <span className={styles.readTime}>📖 {submission.readingTime}m</span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className={styles.categoryBadge}>{submission.category}</span>
                  </td>

                  <td className={styles.authorCell}>
                    {submission.authorAvatar && (
                      <img 
                        src={submission.authorAvatar} 
                        alt=""
                        className={styles.authorAvatar}
                      />
                    )}
                    <div>
                      <div className={styles.authorName}>
                        {submission.authorName}
                        {submission.authorVerified && <span className={styles.verifiedBadge}>✓</span>}
                      </div>
                      <div className={styles.authorMeta}>@{submission.authorUsername}</div>
                    </div>
                  </td>

                  <td>
                    <span className={`${styles.statusBadge} ${getStatusBadgeClass(submission.status)}`}>
                      {submission.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td className={styles.statsCell}>
                    <div>👁️ {submission.views.toLocaleString()}</div>
                    <div>🖱️ {submission.clicks.toLocaleString()}</div>
                    <div>📊 {(submission.ctr * 100).toFixed(1)}%</div>
                  </td>

                  <td>{formatDate(submission.createdAt)}</td>

                  <td>
                    <div className={styles.actionButtons}>
                      <a 
                        href={submission.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.viewButton}
                      >
                        View
                      </a>
                      
                      {submission.status === 'submitted' && (
                        <>
                          <button
                            onClick={() => handleSingleAction(submission.id, 'approve')}
                            className={styles.approveButton}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleSingleAction(submission.id, 'reject')}
                            className={styles.rejectButton}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => handleSingleAction(
                          submission.id, 
                          submission.featured ? 'unfeature' : 'feature'
                        )}
                        className={styles.featureButton}
                      >
                        {submission.featured ? 'Unfeature' : 'Feature'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <button
          onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
          disabled={pagination.page === 1}
        >
          Previous
        </button>
        
        <span>
          Page {pagination.page} of {Math.ceil(pagination.totalCount / pagination.pageSize)}
          ({pagination.totalCount} total)
        </span>
        
        <button
          onClick={() => setPagination(prev => ({ 
            ...prev, 
            page: Math.min(Math.ceil(pagination.totalCount / pagination.pageSize), prev.page + 1) 
          }))}
          disabled={pagination.page >= Math.ceil(pagination.totalCount / pagination.pageSize)}
        >
          Next
        </button>
      </div>

      {/* Auto-refresh indicator */}
      {autoRefresh && (
        <div className={styles.autoRefreshIndicator}>
          🔄 Auto-refreshing every 30s
        </div>
      )}
    </div>
  );
}
