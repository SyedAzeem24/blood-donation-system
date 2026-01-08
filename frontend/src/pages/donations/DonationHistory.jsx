import { useState, useEffect, useCallback } from 'react';
import { FiCalendar, FiMapPin, FiDroplet, FiClock } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import { useToast, ToastContainer } from '../../components/common/Toast';
import donationService from '../../services/donationService';
import { formatDate, getStatusColor } from '../../utils/formatters';
import styles from './Donations.module.css';

const DonationHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { toasts, error, removeToast } = useToast();

  const fetchHistory = useCallback(async (pageNum = 1) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const data = await donationService.getDonationHistory(pageNum, 10);
      
      if (pageNum === 1) {
        setHistory(data.history);
      } else {
        setHistory(prev => [...prev, ...data.history]);
      }
      
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (err) {
      error('Failed to fetch donation history');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(1);
  }, []);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchHistory(page + 1);
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
        <h1 className={styles.pageTitle}>Donation History</h1>

        {history.length === 0 ? (
          <Card className={styles.emptyCard}>
            <FiClock className={styles.emptyIcon} />
            <h3>No donation history</h3>
            <p>Your completed and expired donations will appear here.</p>
          </Card>
        ) : (
          <>
            <div className={styles.donationsList}>
              {history.map((item) => (
                <Card key={item._id} className={styles.donationCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.bloodTypeBadge}>{item.bloodType}</span>
                    <span 
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(item.status) }}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.cardInfo}>
                      <FiMapPin />
                      <span>{item.hospital}</span>
                    </div>
                    <div className={styles.cardInfo}>
                      <FiCalendar />
                      <span>Donated on: {formatDate(item.donationDate)}</span>
                    </div>
                    <div className={styles.cardInfo}>
                      <FiDroplet />
                      <span>{item.quantity} unit(s)</span>
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

export default DonationHistory;
