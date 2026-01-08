import { format, formatDistanceToNow, addDays, differenceInDays, isAfter } from 'date-fns';

// Format date to readable string
export const formatDate = (date) => {
  if (!date) return 'N/A';
  return format(new Date(date), 'MMM dd, yyyy');
};

// Format date with time
export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
};

// Get relative time (e.g., "2 hours ago")
export const getRelativeTime = (date) => {
  if (!date) return 'N/A';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

// Calculate expiry date (7 days from donation)
export const calculateExpiryDate = (donationDate) => {
  return addDays(new Date(donationDate), 7);
};

// Check if donation is expired
export const isDonationExpired = (expiryDate) => {
  return isAfter(new Date(), new Date(expiryDate));
};

// Get days remaining until expiry
export const getDaysUntilExpiry = (expiryDate) => {
  const days = differenceInDays(new Date(expiryDate), new Date());
  return days > 0 ? days : 0;
};

// Calculate next eligible donation date (90 days from last donation)
export const getNextEligibleDate = (lastDonationDate) => {
  if (!lastDonationDate) return null;
  return addDays(new Date(lastDonationDate), 90);
};

// Check if donor is eligible
export const isDonorEligible = (lastDonationDate) => {
  if (!lastDonationDate) return true;
  const nextEligible = getNextEligibleDate(lastDonationDate);
  return isAfter(new Date(), nextEligible);
};

// Get days until eligible
export const getDaysUntilEligible = (lastDonationDate) => {
  if (!lastDonationDate) return 0;
  const nextEligible = getNextEligibleDate(lastDonationDate);
  const days = differenceInDays(nextEligible, new Date());
  return days > 0 ? days : 0;
};

// Format phone number
export const formatPhone = (phone) => {
  if (!phone) return 'N/A';
  return phone;
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Get badge color
export const getBadgeColor = (badge) => {
  const colors = {
    'None': '#9ca3af',
    'First Donation': '#10b981',
    'Life Saver': '#3b82f6',
    'Hero Donor': '#8b5cf6',
    'Platinum Donor': '#f59e0b'
  };
  return colors[badge] || colors['None'];
};

// Get request type color
export const getRequestTypeColor = (type) => {
  return type === 'emergency' ? '#dc2626' : '#3b82f6';
};

// Get status color
export const getStatusColor = (status) => {
  const colors = {
    'available': '#10b981',
    'active': '#10b981',
    'expired': '#9ca3af',
    'fulfilled': '#3b82f6',
    'cancelled': '#dc2626',
    'completed': '#3b82f6'
  };
  return colors[status] || '#9ca3af';
};
