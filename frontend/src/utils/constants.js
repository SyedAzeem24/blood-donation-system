// Hospital List
export const HOSPITALS = [
  "Shifa International Hospital, Islamabad",
  "Pakistan Institute of Medical Sciences (PIMS), Islamabad",
  "Aga Khan University Hospital, Karachi",
  "Jinnah Hospital, Lahore",
  "Lahore General Hospital, Lahore",
  "Combined Military Hospital (CMH), Rawalpindi",
  "Holy Family Hospital, Rawalpindi",
  "Services Hospital, Lahore",
  "Mayo Hospital, Lahore",
  "Civil Hospital, Karachi"
];

// Blood Types
export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Badge Requirements
export const BADGES = {
  'None': 0,
  'First Donation': 1,
  'Life Saver': 5,
  'Hero Donor': 10,
  'Platinum Donor': 20
};

// Blood Compatibility Chart
export const BLOOD_COMPATIBILITY = {
  'O-': { canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], canReceiveFrom: ['O-'] },
  'O+': { canDonateTo: ['A+', 'B+', 'AB+', 'O+'], canReceiveFrom: ['O+', 'O-'] },
  'A-': { canDonateTo: ['A+', 'A-', 'AB+', 'AB-'], canReceiveFrom: ['A-', 'O-'] },
  'A+': { canDonateTo: ['A+', 'AB+'], canReceiveFrom: ['A+', 'A-', 'O+', 'O-'] },
  'B-': { canDonateTo: ['B+', 'B-', 'AB+', 'AB-'], canReceiveFrom: ['B-', 'O-'] },
  'B+': { canDonateTo: ['B+', 'AB+'], canReceiveFrom: ['B+', 'B-', 'O+', 'O-'] },
  'AB-': { canDonateTo: ['AB+', 'AB-'], canReceiveFrom: ['A-', 'B-', 'AB-', 'O-'] },
  'AB+': { canDonateTo: ['AB+'], canReceiveFrom: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] }
};

// Request Types
export const REQUEST_TYPES = ['normal', 'emergency'];

// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
