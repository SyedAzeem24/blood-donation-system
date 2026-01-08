import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiCheck, FiX, FiMapPin, FiAlertCircle } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { useToast, ToastContainer } from '../../components/common/Toast';
import requestService from '../../services/requestService';
import { getRelativeTime, getStatusColor, getRequestTypeColor } from '../../utils/formatters';
import styles from './Requests.module.css';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toasts, success, error, removeToast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await requestService.getMyRequests();
      setRequests(data);
    } catch (err) {
      error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await requestService.updateRequestStatus(id, status);
      setRequests(prev => prev.map(r => 
        r._id === id ? { ...r, status } : r
      ));
      success(`Request marked as ${status}`);
    } catch (err) {
      error('Failed to update request status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;

    try {
      await requestService.deleteRequest(id);
      setRequests(prev => prev.filter(r => r._id !== id));
      success('Request deleted successfully');
    } catch (err) {
      error('Failed to delete request');
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
          <h1 className={styles.pageTitle}>My Requests</h1>
          <Link to="/create-request">
            <Button>+ New Request</Button>
          </Link>
        </div>

        {requests.length === 0 ? (
          <Card className={styles.emptyCard}>
            <FiAlertCircle className={styles.emptyIcon} />
            <h3>No requests yet</h3>
            <p>Create a request when you need blood.</p>
            <Link to="/create-request">
              <Button>Create Request</Button>
            </Link>
          </Card>
        ) : (
          <div className={styles.requestsList}>
            {requests.map((request) => (
              <Card key={request._id} className={styles.requestCard}>
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
                  <span 
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(request.status) }}
                  >
                    {request.status}
                  </span>
                </div>

                <div className={styles.cardBody}>
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

                {request.status === 'active' && (
                  <div className={styles.cardActions}>
                    <Button 
                      variant="success" 
                      size="small"
                      onClick={() => handleStatusUpdate(request._id, 'fulfilled')}
                    >
                      <FiCheck /> Mark Fulfilled
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="small"
                      onClick={() => handleStatusUpdate(request._id, 'cancelled')}
                    >
                      <FiX /> Cancel
                    </Button>
                    <Button 
                      variant="danger" 
                      size="small"
                      onClick={() => handleDelete(request._id)}
                    >
                      <FiTrash2 /> Delete
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyRequests;
