import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import { BLOOD_TYPES } from '../../utils/constants';
import { validateEmail, validatePassword, validateName } from '../../utils/validators';
import styles from './Auth.module.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: '',
    bloodType: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};
    
    const nameResult = validateName(formData.fullName);
    if (!nameResult.isValid) newErrors.fullName = nameResult.message;
    
    const emailResult = validateEmail(formData.email);
    if (!emailResult.isValid) newErrors.email = emailResult.message;
    
    const passwordResult = validatePassword(formData.password);
    if (!passwordResult.isValid) newErrors.password = passwordResult.message;
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setApiError('');

    try {
      await register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: formData.role,
        bloodType: formData.bloodType,
        phone: formData.phone
      });
      navigate('/dashboard');
    } catch (error) {
      setApiError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <div className={styles.logo}>
            <img src="/blood-drop.svg" alt="Blood Drop" className={styles.logoIcon} />
          </div>
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Join our blood donation community</p>
        </div>

        {apiError && (
          <div className={styles.errorAlert}>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Full Name *</label>
            <div className={styles.inputWrapper}>
              <FiUser className={styles.inputIcon} />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`}
              />
            </div>
            {errors.fullName && <span className={styles.error}>{errors.fullName}</span>}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Email *</label>
            <div className={styles.inputWrapper}>
              <FiMail className={styles.inputIcon} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              />
            </div>
            {errors.email && <span className={styles.error}>{errors.email}</span>}
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Password *</label>
              <div className={styles.inputWrapper}>
                <FiLock className={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && <span className={styles.error}>{errors.password}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Confirm Password *</label>
              <div className={styles.inputWrapper}>
                <FiLock className={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                />
              </div>
              {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword}</span>}
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>I want to register as *</label>
            <div className={styles.roleButtons}>
              <button
                type="button"
                className={`${styles.roleBtn} ${formData.role === 'donor' ? styles.active : ''}`}
                onClick={() => handleChange({ target: { name: 'role', value: 'donor' } })}
              >
                <span className={styles.roleIcon}>🤲</span>
                <span>Donor</span>
              </button>
              <button
                type="button"
                className={`${styles.roleBtn} ${formData.role === 'receiver' ? styles.active : ''}`}
                onClick={() => handleChange({ target: { name: 'role', value: 'receiver' } })}
              >
                <span className={styles.roleIcon}>💉</span>
                <span>Receiver</span>
              </button>
            </div>
            {errors.role && <span className={styles.error}>{errors.role}</span>}
          </div>

          <div className={styles.row}>
            <Select
              label="Blood Type"
              name="bloodType"
              value={formData.bloodType}
              onChange={handleChange}
              options={BLOOD_TYPES}
              placeholder="Select blood type"
            />

            <div className={styles.inputGroup}>
              <label className={styles.label}>Phone</label>
              <div className={styles.inputWrapper}>
                <FiPhone className={styles.inputIcon} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className={styles.input}
                />
              </div>
            </div>
          </div>

          <Button type="submit" fullWidth loading={loading}>
            Create Account
          </Button>
        </form>

        <p className={styles.authFooter}>
          Already have an account?{' '}
          <Link to="/login" className={styles.link}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
