import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import TextArea from '../../components/common/TextArea';
import { useToast, ToastContainer } from '../../components/common/Toast';
import requestService from '../../services/requestService';
import { BLOOD_TYPES, HOSPITALS } from '../../utils/constants';
import styles from './Requests.module.css';

const CreateRequest = () => {
  const navigate = useNavigate();
  const { toasts, success, error, removeToast } = useToast();
  
  const [formData, setFormData] = useState({
    bloodType: '',
    hospital: '',
    requestType: 'normal',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.bloodType) newErrors.bloodType = 'Blood type is required';
    if (!formData.hospital) newErrors.hospital = 'Hospital is required';
    if (!formData.requestType) newErrors.requestType = 'Request type is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await requestService.createRequest(formData);
      success('Blood request posted successfully!');
      setTimeout(() => {
        navigate('/my-requests');
      }, 1500);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className={styles.pageContainer}>
        <h1 className={styles.pageTitle}>Create Blood Request</h1>
        
        <Card>
          <form onSubmit={handleSubmit} className={styles.form}>
            <Select
              label="Blood Type Needed"
              name="bloodType"
              value={formData.bloodType}
              onChange={handleChange}
              options={BLOOD_TYPES}
              placeholder="Select blood type"
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

            <div className={styles.requestTypeGroup}>
              <label className={styles.label}>Request Type *</label>
              <div className={styles.requestTypeButtons}>
                <button
                  type="button"
                  className={`${styles.typeBtn} ${formData.requestType === 'normal' ? styles.active : ''}`}
                  onClick={() => handleChange({ target: { name: 'requestType', value: 'normal' } })}
                >
                  <span className={styles.typeIcon}>📋</span>
                  <span className={styles.typeLabel}>Normal</span>
                  <span className={styles.typeDesc}>Standard request</span>
                </button>
                <button
                  type="button"
                  className={`${styles.typeBtn} ${styles.emergency} ${formData.requestType === 'emergency' ? styles.active : ''}`}
                  onClick={() => handleChange({ target: { name: 'requestType', value: 'emergency' } })}
                >
                  <span className={styles.typeIcon}>🚨</span>
                  <span className={styles.typeLabel}>Emergency</span>
                  <span className={styles.typeDesc}>Urgent need</span>
                </button>
              </div>
              {errors.requestType && <span className={styles.error}>{errors.requestType}</span>}
            </div>

            <TextArea
              label="Additional Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional information for donors (optional)"
              rows={3}
            />

            <div className={styles.info}>
              <p>📌 Your request will be visible to all donors.</p>
              <p>📌 Emergency requests are shown first and highlighted.</p>
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
                Post Request
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default CreateRequest;
