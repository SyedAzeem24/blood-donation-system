import { useState, useEffect, useCallback } from 'react';
import { FiMapPin, FiPhone, FiMail, FiFilter, FiAlertCircle } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Select from '../../components/common/Select';
import Loader from '../../components/common/Loader';
import { useToast, ToastContainer } from '../../components/common/Toast';
import requestService from '../../services/requestService';
import { BLOOD_TYPES } from '../../utils/constants';
import { getRelativeTime, getRequestTypeColor } from '../../utils/formatters';
import styles from './Requests.module.css';

const BloodRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [bloodTypeFilter, setBloodTypeFilter] = useState('');
  const [requestTypeFilter, setRequestTypeFilter] = useState('');
  const { toasts, error, removeToast } = useToast();

  const fetchRequests = useCallback(async (pageNum = 1, reset = false) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const data = await requestService.getRequests(
        pageNum, 
        10, 
        bloodTypeFilter, 
        requestTypeFilter
      );
      
      if (reset || pageNum === 1) {
        setRequests(data.requests);
      } else {
        setRequests(prev => [...prev, ...data.requests]);
      }
      
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (err) {
      error('Failed to fetch blood requests');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [bloodTypeFilter, requestTypeFilter]);

  useEffect(() => {
    fetchRequests(1, true);
  }, [bloodTypeFilter, requestTypeFilter]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchRequests(page + 1);
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
          <h1 className={styles.pageTitle}>Blood Requests</h1>
          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <FiFilter />
              <Select
                name="bloodTypeFilter"
                value={bloodTypeFilter}
                onChange={(e) => setBloodTypeFilter(e.target.value)}
                options={[{ value: '', label: 'All Blood Types' }, ...BLOOD_TYPES.map(bt => ({ value: bt, label: bt }))]}
              />
            </div>
            <Select
              name="requestTypeFilter"
              value={requestTypeFilter}
              onChange={(e) => setRequestTypeFilter(e.target.value)}
              options={[
                { value: '', label: 'All Types' },
                { value: 'emergency', label: '🚨 Emergency' },
                { value: 'normal', label: 'Normal' }
              ]}
            />
          </div>
        </div>

        {requests.length === 0 ? (
          <Card className={styles.emptyCard}>
            <FiAlertCircle className={styles.emptyIcon} />
            <h3>No blood requests</h3>
            <p>
              {bloodTypeFilter || requestTypeFilter
                ? 'No requests match your filters.'
                : 'There are no active blood requests at the moment.'
              }
            </p>
          </Card>
        ) : (
          <>
            <div className={styles.requestsList}>
              {requests.map((request) => (
                <Card 
                  key={request._id} 
                  className={`${styles.requestCard} ${request.requestType === 'emergency' ? styles.emergencyCard : ''}`}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.headerLeft}>
                      <span className={styles.bloodTypeBadge}>{request.bloodType}</span>
                      <span 
                        className={styles.requestTypeBadge}
                        style={{ backgroundColor: getRequestTypeColor(request.requestType) }}
                      >
                        {request.requestType === 'emergency' && '🚨 '}
                        {request.requestType}
                      </span>
                    </div>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.receiverName}>
                      <strong>{request.receiverId?.fullName}</strong>
                    </div>
                    <div className={styles.cardInfo}>
                      <FiMapPin />
                      <span>{request.hospital}</span>
                    </div>
                    {request.notes && (
                      <p className={styles.notes}>{request.notes}</p>
                    )}
                    <span className={styles.timeAgo}>
                      Posted {getRelativeTime(request.createdAt)}
                    </span>
                  </div>

                  <div className={styles.contactSection}>
                    <h4>Contact Receiver</h4>
                    <div className={styles.cardInfo}>
                      <FiMail />
                      <a href={`mailto:${request.receiverId?.email}`}>
                        {request.receiverId?.email}
                      </a>
                    </div>
                    {request.receiverId?.phone && (
                      <div className={styles.cardInfo}>
                        <FiPhone />
                        <a href={`tel:${request.receiverId?.phone}`}>
                          {request.receiverId?.phone}
                        </a>
                      </div>
                    )}
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

export default BloodRequests;
