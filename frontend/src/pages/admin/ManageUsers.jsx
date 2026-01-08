import { useState, useEffect, useCallback } from 'react';
import { FiTrash2, FiFilter, FiMail, FiPhone, FiDroplet, FiUser } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Loader from '../../components/common/Loader';
import { useToast, ToastContainer } from '../../components/common/Toast';
import adminService from '../../services/adminService';
import { formatDate } from '../../utils/formatters';
import styles from './Admin.module.css';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const { toasts, success, error, removeToast } = useToast();

  const fetchUsers = useCallback(async (pageNum = 1, reset = false) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const data = await adminService.getUsers(pageNum, 10, roleFilter);
      
      if (reset || pageNum === 1) {
        setUsers(data.users);
      } else {
        setUsers(prev => [...prev, ...data.users]);
      }
      
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (err) {
      error('Failed to fetch users');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [roleFilter]);

  useEffect(() => {
    fetchUsers(1, true);
  }, [roleFilter]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This will also delete all their posts and data.`)) {
      return;
    }

    try {
      await adminService.deleteUser(id);
      setUsers(prev => prev.filter(u => u._id !== id));
      success('User deleted successfully');
    } catch (err) {
      error('Failed to delete user');
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchUsers(page + 1);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Loader fullScreen />
      </Layout>
    );
  }

  return (
    <Layout>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className={styles.pageContainer}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Manage Users</h1>
          <div className={styles.filterGroup}>
            <FiFilter />
            <Select
              name="roleFilter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={[
                { value: '', label: 'All Roles' },
                { value: 'donor', label: 'Donors' },
                { value: 'receiver', label: 'Receivers' }
              ]}
            />
          </div>
        </div>

        {users.length === 0 ? (
          <Card className={styles.emptyCard}>
            <FiUser className={styles.emptyIcon} />
            <h3>No users found</h3>
            <p>
              {roleFilter 
                ? `No ${roleFilter}s registered yet.`
                : 'No users registered yet.'
              }
            </p>
          </Card>
        ) : (
          <>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Blood Type</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.userAvatar}>
                            {user.fullName?.charAt(0).toUpperCase()}
                          </div>
                          <span>{user.fullName}</span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`${styles.roleBadge} ${styles[user.role]}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{user.bloodType || '-'}</td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>
                        <Button 
                          variant="danger" 
                          size="small"
                          onClick={() => handleDelete(user._id, user.fullName)}
                        >
                          <FiTrash2 />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className={styles.mobileCards}>
              {users.map((user) => (
                <Card key={user._id} className={styles.userCard}>
                  <div className={styles.userCardHeader}>
                    <div className={styles.userCell}>
                      <div className={styles.userAvatar}>
                        {user.fullName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <strong>{user.fullName}</strong>
                        <span className={`${styles.roleBadge} ${styles[user.role]}`}>
                          {user.role}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="danger" 
                      size="small"
                      onClick={() => handleDelete(user._id, user.fullName)}
                    >
                      <FiTrash2 />
                    </Button>
                  </div>
                  <div className={styles.userCardBody}>
                    <div className={styles.cardInfo}>
                      <FiMail /> {user.email}
                    </div>
                    <div className={styles.cardInfo}>
                      <FiDroplet /> {user.bloodType || 'Not specified'}
                    </div>
                    <div className={styles.cardInfo}>
                      Joined: {formatDate(user.createdAt)}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {hasMore && (
              <div className={styles.loadMoreContainer}>
                <button 
                  className={styles.loadMoreBtn}
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default ManageUsers;
