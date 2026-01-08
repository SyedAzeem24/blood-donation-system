import { useState } from 'react';
import { FiUser, FiMail, FiPhone, FiDroplet, FiAward, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useToast, ToastContainer } from '../../components/common/Toast';
import userService from '../../services/userService';
import { BLOOD_TYPES } from '../../utils/constants';
import { formatDate, getBadgeColor } from '../../utils/formatters';
import styles from './Profile.module.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { toasts, success, error, removeToast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    bloodType: user?.bloodType || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      const response = await userService.updateProfile(formData);
      updateUser(response.user);
      success('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      bloodType: user?.bloodType || ''
    });
    setIsEditing(false);
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Administrator',
      donor: 'Blood Donor',
      receiver: 'Blood Receiver'
    };
    return labels[role] || role;
  };

  return (
    <Layout>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className={styles.pageContainer}>
        <h1 className={styles.pageTitle}>My Profile</h1>

        <div className={styles.profileGrid}>
          {/* Profile Card */}
          <Card className={styles.profileCard}>
            <div className={styles.avatar}>
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
            <h2 className={styles.userName}>{user?.fullName}</h2>
            <p className={styles.userRole}>{getRoleLabel(user?.role)}</p>
            
            {user?.role === 'donor' && (
              <div 
                className={styles.badgeDisplay}
                style={{ backgroundColor: getBadgeColor(user?.badge) }}
              >
                <FiAward /> {user?.badge || 'None'}
              </div>
            )}
          </Card>

          {/* Profile Details */}
          <Card className={styles.detailsCard}>
            {isEditing ? (
              <form onSubmit={handleSubmit} className={styles.form}>
                <Input
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
                
                <Select
                  label="Blood Type"
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  options={BLOOD_TYPES}
                  placeholder="Select blood type"
                />
                
                <Input
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />

                <div className={styles.formActions}>
                  <Button type="button" variant="secondary" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={loading}>
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <div className={styles.detailsHeader}>
                  <h3>Account Information</h3>
                  <Button variant="outline" size="small" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                </div>

                <div className={styles.detailsList}>
                  <div className={styles.detailItem}>
                    <FiUser className={styles.detailIcon} />
                    <div>
                      <span className={styles.detailLabel}>Full Name</span>
                      <span className={styles.detailValue}>{user?.fullName}</span>
                    </div>
                  </div>

                  <div className={styles.detailItem}>
                    <FiMail className={styles.detailIcon} />
                    <div>
                      <span className={styles.detailLabel}>Email</span>
                      <span className={styles.detailValue}>{user?.email}</span>
                    </div>
                  </div>

                  <div className={styles.detailItem}>
                    <FiPhone className={styles.detailIcon} />
                    <div>
                      <span className={styles.detailLabel}>Phone</span>
                      <span className={styles.detailValue}>
                        {user?.phone || 'Not provided'}
                      </span>
                    </div>
                  </div>

                  <div className={styles.detailItem}>
                    <FiDroplet className={styles.detailIcon} />
                    <div>
                      <span className={styles.detailLabel}>Blood Type</span>
                      <span className={styles.detailValue}>
                        {user?.bloodType || 'Not specified'}
                      </span>
                    </div>
                  </div>

                  <div className={styles.detailItem}>
                    <FiCalendar className={styles.detailIcon} />
                    <div>
                      <span className={styles.detailLabel}>Member Since</span>
                      <span className={styles.detailValue}>
                        {formatDate(user?.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </Card>

          {/* Donor Stats */}
          {user?.role === 'donor' && (
            <Card className={styles.statsCard}>
              <h3>Donation Statistics</h3>
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>{user?.donationCount || 0}</span>
                  <span className={styles.statLabel}>Total Donations</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>
                    {user?.lastDonation ? formatDate(user.lastDonation) : 'Never'}
                  </span>
                  <span className={styles.statLabel}>Last Donation</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
