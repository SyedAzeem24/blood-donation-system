import { useState, useEffect, useCallback } from 'react';
import { FiCalendar, FiMapPin, FiDroplet, FiPhone, FiMail, FiFilter, FiCheck } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Loader from '../../components/common/Loader';
import { useToast, ToastContainer } from '../../components/common/Toast';
import donationService from '../../services/donationService';
import { BLOOD_TYPES } from '../../utils/constants';
import { formatDate, getDaysUntilExpiry, getBadgeColor } from '../../utils/formatters';
import styles from './Donations.module.css';

const AvailableDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [fulfilling, setFulfilling] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [bloodTypeFilter, setBloodTypeFilter] = useState('');
  const { toasts, success, error, removeToast } = useToast();

  const fetchDonations = useCallback(async (pageNum = 1, reset = false) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const data = await donationService.getDonations(pageNum, 10, bloodTypeFilter);
      
      if (reset || pageNum === 1) {
        setDonations(data.donations);
      } else {
        setDonations(prev => [...prev, ...data.donations]);
      }
      
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (err) {
      error('Failed to fetch donations');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [bloodTypeFilter]);

  useEffect(() => {
    fetchDonations(1, true);
  }, [bloodTypeFilter]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchDonations(page + 1);
    }
  };

  const handleFilterChange = (e) => {
    setBloodTypeFilter(e.target.value);
  };

  const handleAcceptDonation = async (donationId) => {
    // Prevent double-clicks
    if (fulfilling) return;
    
    if (!window.confirm('Are you sure you want to accept this donation? This will notify the donor.')) {
      return;
    }

    setFulfilling(donationId);
    try {
      await donationService.fulfillDonation(donationId);
      success('Donation accepted! The donor has been notified.');
      // Remove the donation from the list immediately
      setDonations(prev => prev.filter(d => d._id !== donationId));
    } catch (err) {
      error(err.response?.data?.message || 'Failed to accept donation');
      setFulfilling(null);
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
          <h1 className={styles.pageTitle}>Available Donations</h1>
          <div className={styles.filterGroup}>
            <FiFilter />
            <Select
              name="bloodTypeFilter"
              value={bloodTypeFilter}
              onChange={handleFilterChange}
              options={[{ value: '', label: 'All Blood Types' }, ...BLOOD_TYPES.map(bt => ({ value: bt, label: bt }))]}
              placeholder="Filter by blood type"
            />
          </div>
        </div>

        {donations.length === 0 ? (
          <Card className={styles.emptyCard}>
            <FiDroplet className={styles.emptyIcon} />
            <h3>No donations available</h3>
            <p>
              {bloodTypeFilter 
                ? `No ${bloodTypeFilter} blood donations available at the moment.`
                : 'Check back later for new donations.'
              }
            </p>
          </Card>
        ) : (
          <>
            <div className={styles.donationsList}>
              {donations.map((donation) => (
                <Card key={donation._id} className={styles.donationCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.bloodTypeBadge}>{donation.bloodType}</span>
                    <span 
                      className={styles.badgeLabel}
                      style={{ color: getBadgeColor(donation.donorId?.badge) }}
                    >
                      {donation.donorId?.badge !== 'None' && `🏆 ${donation.donorId?.badge}`}
                    </span>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.donorName}>
                      <strong>{donation.donorId?.fullName}</strong>
                    </div>
                    <div className={styles.cardInfo}>
                      <FiMapPin />
                      <span>{donation.hospital}</span>
                    </div>
                    <div className={styles.cardInfo}>
                      <FiCalendar />
                      <span>Available since: {formatDate(donation.donationDate)}</span>
                    </div>
                    <div className={styles.cardInfo}>
                      <FiDroplet />
                      <span>{donation.quantity} unit(s)</span>
                    </div>
                    <div className={styles.expiryInfo}>
                      Expires in {getDaysUntilExpiry(donation.expiryDate)} days
                    </div>
                  </div>

                  <div className={styles.contactSection}>
                    <h4>Contact Donor</h4>
                    <div className={styles.cardInfo}>
                      <FiMail />
                      <a href={`mailto:${donation.donorId?.email}`}>
                        {donation.donorId?.email}
                      </a>
                    </div>
                    {donation.donorId?.phone && (
                      <div className={styles.cardInfo}>
                        <FiPhone />
                        <a href={`tel:${donation.donorId?.phone}`}>
                          {donation.donorId?.phone}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className={styles.cardActions}>
                    <Button
                      onClick={() => handleAcceptDonation(donation._id)}
                      disabled={fulfilling !== null}
                    >
                      <FiCheck />
                      {fulfilling === donation._id ? 'Accepting...' : 'Accept Donation'}
                    </Button>
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

export default AvailableDonations;
