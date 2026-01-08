import { useState, useEffect, useCallback } from 'react';
import { FiBell, FiCheck, FiTrash2, FiDroplet, FiHeart } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { useToast, ToastContainer } from '../../components/common/Toast';
import notificationService from '../../services/notificationService';
import { getRelativeTime } from '../../utils/formatters';
import styles from './Notifications.module.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { toasts, success, error, removeToast } = useToast();

  const fetchNotifications = useCallback(async (pageNum = 1) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const data = await notificationService.getNotifications(pageNum, 20);
      
      if (pageNum === 1) {
        setNotifications(data.notifications);
      } else {
        setNotifications(prev => [...prev, ...data.notifications]);
      }
      
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (err) {
      error('Failed to fetch notifications');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(1);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
    } catch (err) {
      error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      success('All notifications marked as read');
    } catch (err) {
      error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      success('Notification deleted');
    } catch (err) {
      error('Failed to delete notification');
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete all notifications?')) return;

    try {
      await notificationService.deleteAllNotifications();
      setNotifications([]);
      success('All notifications deleted');
    } catch (err) {
      error('Failed to delete notifications');
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchNotifications(page + 1);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
          <div>
            <h1 className={styles.pageTitle}>Notifications</h1>
            {unreadCount > 0 && (
              <span className={styles.unreadCount}>{unreadCount} unread</span>
            )}
          </div>
          {notifications.length > 0 && (
            <div className={styles.headerActions}>
              <Button variant="secondary" size="small" onClick={handleMarkAllAsRead}>
                <FiCheck /> Mark all read
              </Button>
              <Button variant="danger" size="small" onClick={handleDeleteAll}>
                <FiTrash2 /> Delete all
              </Button>
            </div>
          )}
        </div>

        {notifications.length === 0 ? (
          <Card className={styles.emptyCard}>
            <FiBell className={styles.emptyIcon} />
            <h3>No notifications</h3>
            <p>You're all caught up!</p>
          </Card>
        ) : (
          <>
            <div className={styles.notificationsList}>
              {notifications.map((notification) => (
                <Card 
                  key={notification._id} 
                  className={`${styles.notificationCard} ${!notification.isRead ? styles.unread : ''}`}
                >
                  <div className={styles.notificationIcon}>
                    {notification.type === 'new_donation' ? (
                      <FiDroplet className={styles.iconDonation} />
                    ) : (
                      <FiHeart className={styles.iconRequest} />
                    )}
                  </div>
                  <div className={styles.notificationContent}>
                    <p className={styles.message}>{notification.message}</p>
                    <span className={styles.time}>
                      {getRelativeTime(notification.createdAt)}
                    </span>
                  </div>
                  <div className={styles.notificationActions}>
                    {!notification.isRead && (
                      <button 
                        className={styles.actionBtn}
                        onClick={() => handleMarkAsRead(notification._id)}
                        title="Mark as read"
                      >
                        <FiCheck />
                      </button>
                    )}
                    <button 
                      className={styles.actionBtn}
                      onClick={() => handleDelete(notification._id)}
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
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

export default Notifications;
