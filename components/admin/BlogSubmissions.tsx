import React, { useEffect, useState } from 'react';
import styles from '../../styles/AdminDashboard.module.css';

type BlogSubmission = {
  id: string;
  title: string;
  author: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  url: string;
};

const fetchBlogSubmissions = async (): Promise<BlogSubmission[]> => {
  const res = await fetch('/api/blog/get-blog-submissions');
  return res.json();
};

const BlogSubmissions = () => {
  const [submissions, setSubmissions] = useState<BlogSubmission[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchBlogSubmissions()
      .then(data => {
        setSubmissions(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load blog submissions.');
        setLoading(false);
      });
  }, []);

  const filteredSubmissions = statusFilter === 'all'
    ? submissions
    : submissions.filter(sub => sub.status === statusFilter);

  return (
    <div className={styles.sectionContent}>
      <div className={styles.sectionHeader}>
        <h2>Blog Submissions</h2>
        <p>Review and manage submitted blogs</p>
      </div>
      <div className={styles.tableFilters}>
        <label htmlFor="status-filter">Status:</label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as any)}
          className={styles.filterSelect}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loading}><h2>Loading blog submissions...</h2></div>
        ) : error ? (
          <div className={styles.emptyState}><h3>{error}</h3></div>
        ) : (
          <>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th>Submitted At</th>
                  <th>URL</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map(sub => (
                  <tr key={sub.id}>
                    <td>{sub.id}</td>
                    <td>{sub.title}</td>
                    <td>{sub.author}</td>
                    <td>{sub.status}</td>
                    <td>{new Date(sub.submittedAt).toLocaleString()}</td>
                    <td><a href={sub.url} target="_blank" rel="noopener noreferrer">View</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredSubmissions.length === 0 && (
              <div className={styles.emptyState}>
                <h3>No blog submissions found</h3>
                <p>No submissions match your current filters.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BlogSubmissions;
