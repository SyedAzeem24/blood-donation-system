import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { useToast, ToastContainer } from '../../components/common/Toast';
import userService from '../../services/userService';
import donationService from '../../services/donationService';
import { BLOOD_TYPES, HOSPITALS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import styles from './Donations.module.css';

const CreateDonation = () => {
  const navigate = useNavigate();
  const { toasts, success, error, removeToast } = useToast();
  
  const [formData, setFormData] = useState({
    bloodType: '',
    hospital: '',
    donationDate: '',
    quantity: 1
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [eligibility, setEligibility] = useState(null);
  const [checkingEligibility, setCheckingEligibility] = useState(true);

  useEffect(() => {
    checkEligibility();
  }, []);

  const checkEligibility = async () => {
    try {
      const data = await userService.checkEligibility();
      setEligibility(data);
    } catch (err) {
      error('Failed to check eligibility');
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.bloodType) newErrors.bloodType = 'Blood type is required';
    if (!formData.hospital) newErrors.hospital = 'Hospital is required';
    if (!formData.donationDate) newErrors.donationDate = 'Donation date is required';
    if (!formData.quantity || formData.quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await donationService.createDonation(formData);
      success('Donation posted successfully!');
      setTimeout(() => {
        navigate('/my-donations');
      }, 1500);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create donation');
    } finally {
      setLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <Layout>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className={styles.pageContainer}>
        <h1 className={styles.pageTitle}>Create Donation</h1>
        
        {checkingEligibility ? (
          <Card>
            <p>Checking eligibility...</p>
          </Card>
        ) : !eligibility?.eligible ? (
          <Card className={styles.warningCard}>
            <h3>⚠️ Not Eligible to Donate</h3>
            <p>{eligibility?.message}</p>
            {eligibility?.nextEligibleDate && (
              <p>
                <strong>Next eligible date:</strong> {formatDate(eligibility.nextEligibleDate)}
              </p>
            )}
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </Card>
        ) : (
          <Card>
            <form onSubmit={handleSubmit} className={styles.form}>
              <Select
                label="Blood Type"
                name="bloodType"
                value={formData.bloodType}
                onChange={handleChange}
                options={BLOOD_TYPES}
                placeholder="Select your blood type"
                error={errors.bloodType}
                required
              />

              <Select
                label="Hospital"
                name="hospital"
                value={formData.hospital}
                onChange={handleChange}
                options={HOSPITALS}
                placeholder="Select a hospital"
                error={errors.hospital}
                required
              />

              <Input
                type="date"
                label="Donation Date"
                name="donationDate"
                value={formData.donationDate}
                onChange={handleChange}
                error={errors.donationDate}
                required
              />

              <Input
                type="number"
                label="Quantity (units)"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Enter quantity"
                error={errors.quantity}
                required
              />

              <div className={styles.info}>
                <p>📌 Your donation will be visible to receivers for 7 days.</p>
                <p>📌 You can delete your donation post anytime.</p>
              </div>

              <div className={styles.actions}>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={loading}>
                  Post Donation
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default CreateDonation;
