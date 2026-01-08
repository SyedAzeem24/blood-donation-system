import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiFileText, FiCalendar, FiMapPin, FiDroplet } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { useToast, ToastContainer } from '../../components/common/Toast';
import donationService from '../../services/donationService';
import { formatDate, getDaysUntilExpiry, getStatusColor } from '../../utils/formatters';
import { generateDonationReceipt } from '../../utils/pdfGenerator';
import styles from './Donations.module.css';

const MyDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toasts, success, error, removeToast } = useToast();

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const data = await donationService.getMyDonations();
      setDonations(data);
    } catch (err) {
      error('Failed to fetch donations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this donation?')) return;

    try {
      await donationService.deleteDonation(id);
      setDonations(prev => prev.filter(d => d._id !== id));
      success('Donation deleted successfully');
    } catch (err) {
      error('Failed to delete donation');
    }
  };

  const handleDownloadReceipt = async (id) => {
    try {
      const receiptData = await donationService.getReceiptData(id);
      generateDonationReceipt(receiptData);
      success('Receipt downloaded!');
    } catch (err) {
      error('Failed to generate receipt');
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
          <h1 className={styles.pageTitle}>My Donations</h1>
          <Link to="/create-donation">
            <Button>+ New Donation</Button>
          </Link>
        </div>

        {donations.length === 0 ? (
          <Card className={styles.emptyCard}>
            <FiDroplet className={styles.emptyIcon} />
            <h3>No donations yet</h3>
            <p>Start your journey by creating your first donation post.</p>
            <Link to="/create-donation">
              <Button>Create Donation</Button>
            </Link>
          </Card>
        ) : (
          <div className={styles.donationsList}>
            {donations.map((donation) => (
              <Card key={donation._id} className={styles.donationCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.bloodTypeBadge}>{donation.bloodType}</span>
                  <span 
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(donation.status) }}
                  >
                    {donation.status}
                  </span>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.cardInfo}>
                    <FiMapPin />
                    <span>{donation.hospital}</span>
                  </div>
                  <div className={styles.cardInfo}>
                    <FiCalendar />
                    <span>Donated on: {formatDate(donation.donationDate)}</span>
                  </div>
                  <div className={styles.cardInfo}>
                    <FiDroplet />
                    <span>{donation.quantity} unit(s)</span>
                  </div>
                  {donation.status === 'available' && (
                    <div className={styles.expiryInfo}>
                      Expires in {getDaysUntilExpiry(donation.expiryDate)} days
                    </div>
                  )}
                </div>

                <div className={styles.cardActions}>
                  <Button 
                    variant="secondary" 
                    size="small"
                    onClick={() => handleDownloadReceipt(donation._id)}
                  >
                    <FiFileText /> Receipt
                  </Button>
                  {donation.status === 'available' && (
                    <Button 
                      variant="danger" 
                      size="small"
                      onClick={() => handleDelete(donation._id)}
                    >
                      <FiTrash2 /> Delete
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyDonations;
