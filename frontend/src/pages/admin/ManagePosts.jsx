import { useState, useEffect } from 'react';
import { FiTrash2, FiDroplet, FiHeart, FiMapPin, FiCalendar } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { useToast, ToastContainer } from '../../components/common/Toast';
import adminService from '../../services/adminService';
import { formatDate, getStatusColor, getRequestTypeColor } from '../../utils/formatters';
import styles from './Admin.module.css';

const ManagePosts = () => {
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('donations');
  const { toasts, success, error, removeToast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllPosts();
      setDonations(data.donations);
      setRequests(data.requests);
    } catch (err) {
      error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDonation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this donation?')) return;

    try {
      await adminService.deletePost('donation', id);
      setDonations(prev => prev.filter(d => d._id !== id));
      success('Donation deleted successfully');
    } catch (err) {
      error('Failed to delete donation');
    }
  };

  const handleDeleteRequest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;

    try {
      await adminService.deletePost('request', id);
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
        <h1 className={styles.pageTitle}>Manage Posts</h1>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'donations' ? styles.active : ''}`}
            onClick={() => setActiveTab('donations')}
          >
            <FiDroplet /> Donations ({donations.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'requests' ? styles.active : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <FiHeart /> Requests ({requests.length})
          </button>
        </div>

        {activeTab === 'donations' && (
          <div className={styles.postsList}>
            {donations.length === 0 ? (
              <Card className={styles.emptyCard}>
                <FiDroplet className={styles.emptyIcon} />
                <h3>No donations</h3>
                <p>No donation posts yet.</p>
              </Card>
            ) : (
              donations.map((donation) => (
                <Card key={donation._id} className={styles.postCard}>
                  <div className={styles.postHeader}>
                    <div className={styles.headerLeft}>
                      <span className={styles.bloodTypeBadge}>{donation.bloodType}</span>
                      <span 
                        className={styles.statusBadge}
                        style={{ backgroundColor: getStatusColor(donation.status) }}
                      >
                        {donation.status}
                      </span>
                    </div>
                    <Button 
                      variant="danger" 
                      size="small"
                      onClick={() => handleDeleteDonation(donation._id)}
                    >
                      <FiTrash2 /> Delete
                    </Button>
                  </div>
                  <div className={styles.postBody}>
                    <p className={styles.donorName}>
                      <strong>Donor:</strong> {donation.donorId?.fullName} ({donation.donorId?.email})
                    </p>
                    <div className={styles.cardInfo}>
                      <FiMapPin /> {donation.hospital}
                    </div>
                    <div className={styles.cardInfo}>
                      <FiCalendar /> {formatDate(donation.donationDate)}
                    </div>
                    <div className={styles.cardInfo}>
                      <FiDroplet /> {donation.quantity} unit(s)
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className={styles.postsList}>
            {requests.length === 0 ? (
              <Card className={styles.emptyCard}>
                <FiHeart className={styles.emptyIcon} />
                <h3>No requests</h3>
                <p>No blood request posts yet.</p>
              </Card>
            ) : (
              requests.map((request) => (
                <Card 
                  key={request._id} 
                  className={`${styles.postCard} ${request.requestType === 'emergency' ? styles.emergencyCard : ''}`}
                >
                  <div className={styles.postHeader}>
                    <div className={styles.headerLeft}>
                      <span className={styles.bloodTypeBadge}>{request.bloodType}</span>
                      <span 
                        className={styles.typeBadge}
                        style={{ backgroundColor: getRequestTypeColor(request.requestType) }}
                      >
                        {request.requestType === 'emergency' && '🚨 '}
                        {request.requestType}
                      </span>
                      <span 
                        className={styles.statusBadge}
                        style={{ backgroundColor: getStatusColor(request.status) }}
                      >
                        {request.status}
                      </span>
                    </div>
                    <Button 
                      variant="danger" 
                      size="small"
                      onClick={() => handleDeleteRequest(request._id)}
                    >
                      <FiTrash2 /> Delete
                    </Button>
                  </div>
                  <div className={styles.postBody}>
                    <p className={styles.donorName}>
                      <strong>Receiver:</strong> {request.receiverId?.fullName} ({request.receiverId?.email})
                    </p>
                    <div className={styles.cardInfo}>
                      <FiMapPin /> {request.hospital}
                    </div>
                    {request.notes && (
                      <p className={styles.notes}>{request.notes}</p>
                    )}
                    <span className={styles.date}>
                      Posted: {formatDate(request.createdAt)}
                    </span>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ManagePosts;
