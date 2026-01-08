import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiDroplet, FiHeart, FiClock, FiAward, FiAlertCircle, FiPlusCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import userService from '../../services/userService';
import donationService from '../../services/donationService';
import requestService from '../../services/requestService';
import adminService from '../../services/adminService';
import { formatDate, getDaysUntilEligible, getBadgeColor } from '../../utils/formatters';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [recentItems, setRecentItems] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [user?.role]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (user?.role === 'donor') {
        const [eligibilityData, userStats, donations] = await Promise.all([
          userService.checkEligibility(),
          userService.getStats(),
          donationService.getMyDonations()
        ]);
        setEligibility(eligibilityData);
        setStats(userStats);
        setRecentItems(donations.slice(0, 5));
      } else if (user?.role === 'receiver') {
        const [requestsData, donationsData] = await Promise.all([
          requestService.getMyRequests(),
          donationService.getDonations(1, 5)
        ]);
        setRecentItems(requestsData.slice(0, 5));
        setStats({
          activeRequests: requestsData.filter(r => r.status === 'active').length,
          fulfilledRequests: requestsData.filter(r => r.status === 'fulfilled').length,
          availableDonations: donationsData.totalDonations
        });
      } else if (user?.role === 'admin') {
        const adminStats = await adminService.getStats();
        setStats(adminStats);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
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
      <div className={styles.dashboard}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>
              Welcome back, {user?.fullName?.split(' ')[0]}!
            </h1>
            <p className={styles.subtitle}>
              {user?.role === 'donor' && "Ready to save lives today?"}
              {user?.role === 'receiver' && "Find the blood you need"}
              {user?.role === 'admin' && "Manage your blood donation system"}
            </p>
          </div>
          {user?.role === 'donor' && (
            <Link to="/create-donation">
              <Button>
                <FiPlusCircle /> New Donation
              </Button>
            </Link>
          )}
          {user?.role === 'receiver' && (
            <Link to="/create-request">
              <Button>
                <FiPlusCircle /> New Request
              </Button>
            </Link>
          )}
        </header>

        {/* Donor Dashboard */}
        {user?.role === 'donor' && (
          <>
            {/* Eligibility Card */}
            <Card className={`${styles.eligibilityCard} ${eligibility?.eligible ? styles.eligible : styles.notEligible}`}>
              <div className={styles.eligibilityContent}>
                <div className={styles.eligibilityIcon}>
                  {eligibility?.eligible ? <FiDroplet /> : <FiClock />}
                </div>
                <div className={styles.eligibilityInfo}>
                  <h3>{eligibility?.eligible ? 'You are eligible to donate!' : 'Not yet eligible'}</h3>
                  <p>
                    {eligibility?.eligible 
                      ? 'Your next donation can help save up to 3 lives.'
                      : `${eligibility?.daysRemaining} days remaining until you can donate again.`
                    }
                  </p>
                </div>
              </div>
            </Card>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
              <Card className={styles.statCard}>
                <div className={styles.statIcon} style={{ backgroundColor: '#fef3c7' }}>
                  <FiAward style={{ color: '#f59e0b' }} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statLabel}>Current Badge</span>
                  <span className={styles.statValue} style={{ color: getBadgeColor(stats?.badge) }}>
                    {stats?.badge || 'None'}
                  </span>
                </div>
              </Card>

              <Card className={styles.statCard}>
                <div className={styles.statIcon} style={{ backgroundColor: '#dcfce7' }}>
                  <FiDroplet style={{ color: '#10b981' }} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statLabel}>Total Donations</span>
                  <span className={styles.statValue}>{stats?.donationCount || 0}</span>
                </div>
              </Card>

              <Card className={styles.statCard}>
                <div className={styles.statIcon} style={{ backgroundColor: '#dbeafe' }}>
                  <FiClock style={{ color: '#3b82f6' }} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statLabel}>Last Donation</span>
                  <span className={styles.statValue}>
                    {stats?.lastDonation ? formatDate(stats.lastDonation) : 'Never'}
                  </span>
                </div>
              </Card>
            </div>
          </>
        )}

        {/* Receiver Dashboard */}
        {user?.role === 'receiver' && (
          <div className={styles.statsGrid}>
            <Card className={styles.statCard}>
              <div className={styles.statIcon} style={{ backgroundColor: '#dcfce7' }}>
                <FiHeart style={{ color: '#10b981' }} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Active Requests</span>
                <span className={styles.statValue}>{stats?.activeRequests || 0}</span>
              </div>
            </Card>

            <Card className={styles.statCard}>
              <div className={styles.statIcon} style={{ backgroundColor: '#dbeafe' }}>
                <FiDroplet style={{ color: '#3b82f6' }} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Fulfilled Requests</span>
                <span className={styles.statValue}>{stats?.fulfilledRequests || 0}</span>
              </div>
            </Card>

            <Card className={styles.statCard}>
              <div className={styles.statIcon} style={{ backgroundColor: '#fef3c7' }}>
                <FiDroplet style={{ color: '#f59e0b' }} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Available Donations</span>
                <span className={styles.statValue}>{stats?.availableDonations || 0}</span>
              </div>
            </Card>
          </div>
        )}

        {/* Admin Dashboard */}
        {user?.role === 'admin' && (
          <>
            <div className={styles.statsGrid}>
              <Card className={styles.statCard}>
                <div className={styles.statIcon} style={{ backgroundColor: '#dbeafe' }}>
                  <FiDroplet style={{ color: '#3b82f6' }} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statLabel}>Total Donors</span>
                  <span className={styles.statValue}>{stats?.totalDonors || 0}</span>
                </div>
              </Card>

              <Card className={styles.statCard}>
                <div className={styles.statIcon} style={{ backgroundColor: '#dcfce7' }}>
                  <FiHeart style={{ color: '#10b981' }} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statLabel}>Total Receivers</span>
                  <span className={styles.statValue}>{stats?.totalReceivers || 0}</span>
                </div>
              </Card>

              <Card className={styles.statCard}>
                <div className={styles.statIcon} style={{ backgroundColor: '#fef3c7' }}>
                  <FiDroplet style={{ color: '#f59e0b' }} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statLabel}>Active Donations</span>
                  <span className={styles.statValue}>{stats?.activeDonations || 0}</span>
                </div>
              </Card>

              <Card className={styles.statCard}>
                <div className={styles.statIcon} style={{ backgroundColor: '#fee2e2' }}>
                  <FiAlertCircle style={{ color: '#dc2626' }} />
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statLabel}>Emergency Requests</span>
                  <span className={styles.statValue}>{stats?.emergencyRequests || 0}</span>
                </div>
              </Card>
            </div>

            {/* Blood Type Distribution */}
            {stats?.bloodTypeStats && stats.bloodTypeStats.length > 0 && (
              <Card className={styles.chartCard}>
                <h3 className={styles.sectionTitle}>Blood Type Distribution</h3>
                <div className={styles.bloodTypeGrid}>
                  {stats.bloodTypeStats.map((item) => (
                    <div key={item._id} className={styles.bloodTypeItem}>
                      <span className={styles.bloodType}>{item._id}</span>
                      <span className={styles.bloodCount}>{item.count} units</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}

        {/* Quick Actions */}
        <Card className={styles.quickActions}>
          <h3 className={styles.sectionTitle}>Quick Actions</h3>
          <div className={styles.actionsGrid}>
            {user?.role === 'donor' && (
              <>
                <Link to="/create-donation" className={styles.actionCard}>
                  <FiPlusCircle className={styles.actionIcon} />
                  <span>Create Donation</span>
                </Link>
                <Link to="/blood-requests" className={styles.actionCard}>
                  <FiHeart className={styles.actionIcon} />
                  <span>View Requests</span>
                </Link>
                <Link to="/donation-history" className={styles.actionCard}>
                  <FiClock className={styles.actionIcon} />
                  <span>View History</span>
                </Link>
              </>
            )}
            {user?.role === 'receiver' && (
              <>
                <Link to="/create-request" className={styles.actionCard}>
                  <FiPlusCircle className={styles.actionIcon} />
                  <span>Create Request</span>
                </Link>
                <Link to="/available-donations" className={styles.actionCard}>
                  <FiDroplet className={styles.actionIcon} />
                  <span>Find Donations</span>
                </Link>
                <Link to="/my-requests" className={styles.actionCard}>
                  <FiHeart className={styles.actionIcon} />
                  <span>My Requests</span>
                </Link>
              </>
            )}
            {user?.role === 'admin' && (
              <>
                <Link to="/admin/users" className={styles.actionCard}>
                  <FiHeart className={styles.actionIcon} />
                  <span>Manage Users</span>
                </Link>
                <Link to="/admin/posts" className={styles.actionCard}>
                  <FiDroplet className={styles.actionIcon} />
                  <span>Manage Posts</span>
                </Link>
              </>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
