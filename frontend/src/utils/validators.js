// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  return { isValid: true, message: '' };
};

// Password validation
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters' };
  }
  return { isValid: true, message: '' };
};

// Name validation
export const validateName = (name) => {
  if (!name || !name.trim()) {
    return { isValid: false, message: 'Name is required' };
  }
  if (name.trim().length < 2) {
    return { isValid: false, message: 'Name must be at least 2 characters' };
  }
  return { isValid: true, message: '' };
};

// Phone validation
export const validatePhone = (phone) => {
  if (!phone) {
    return { isValid: true, message: '' }; // Phone is optional
  }
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  if (!phoneRegex.test(phone)) {
    return { isValid: false, message: 'Please enter a valid phone number' };
  }
  return { isValid: true, message: '' };
};

// Blood type validation
export const validateBloodType = (bloodType, required = false) => {
  const validTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  if (!bloodType && required) {
    return { isValid: false, message: 'Blood type is required' };
  }
  if (bloodType && !validTypes.includes(bloodType)) {
    return { isValid: false, message: 'Please select a valid blood type' };
  }
  return { isValid: true, message: '' };
};

// Date validation
export const validateDate = (date, isFuture = false) => {
  if (!date) {
    return { isValid: false, message: 'Date is required' };
  }
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (isNaN(selectedDate.getTime())) {
    return { isValid: false, message: 'Please enter a valid date' };
  }
  
  if (isFuture && selectedDate < today) {
    return { isValid: false, message: 'Date cannot be in the past' };
  }
  
  return { isValid: true, message: '' };
};

// Quantity validation
export const validateQuantity = (quantity) => {
  if (!quantity) {
    return { isValid: false, message: 'Quantity is required' };
  }
  const num = parseInt(quantity);
  if (isNaN(num) || num < 1) {
    return { isValid: false, message: 'Quantity must be at least 1' };
  }
  if (num > 10) {
    return { isValid: false, message: 'Quantity cannot exceed 10 units' };
  }
  return { isValid: true, message: '' };
};

// Hospital validation
export const validateHospital = (hospital) => {
  if (!hospital) {
    return { isValid: false, message: 'Hospital is required' };
  }
  return { isValid: true, message: '' };
};

// Request type validation
export const validateRequestType = (type) => {
  if (!type) {
    return { isValid: false, message: 'Request type is required' };
  }
  if (!['normal', 'emergency'].includes(type)) {
    return { isValid: false, message: 'Invalid request type' };
  }
  return { isValid: true, message: '' };
};

// Form validation helper
export const validateForm = (fields) => {
  const errors = {};
  let isValid = true;

  Object.keys(fields).forEach(key => {
    const { validator, value, ...options } = fields[key];
    const result = validator(value, ...Object.values(options));
    if (!result.isValid) {
      errors[key] = result.message;
      isValid = false;
    }
  });

  return { isValid, errors };
};
