import jsPDF from 'jspdf';
import { formatDate } from './formatters';

export const generateDonationReceipt = (receiptData) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(24);
  doc.setTextColor(220, 38, 38);
  doc.text('Blood Donation Receipt', 105, 25, { align: 'center' });
  
  // Logo/Icon
  doc.setFontSize(40);
  doc.text('🩸', 105, 45, { align: 'center' });
  
  // Receipt ID
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Receipt ID: ${receiptData.receiptId}`, 105, 60, { align: 'center' });
  
  // Divider
  doc.setDrawColor(220, 38, 38);
  doc.setLineWidth(0.5);
  doc.line(20, 70, 190, 70);
  
  // Content
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  
  const startY = 85;
  const lineHeight = 12;
  
  const details = [
    { label: 'Donor Name:', value: receiptData.donorName },
    { label: 'Email:', value: receiptData.donorEmail },
    { label: 'Blood Type:', value: receiptData.bloodType },
    { label: 'Hospital:', value: receiptData.hospital },
    { label: 'Donation Date:', value: formatDate(receiptData.donationDate) },
    { label: 'Quantity:', value: `${receiptData.quantity} unit(s)` },
    { label: 'Receipt Generated:', value: formatDate(new Date()) }
  ];
  
  details.forEach((detail, index) => {
    const y = startY + (index * lineHeight);
    doc.setFont(undefined, 'bold');
    doc.text(detail.label, 30, y);
    doc.setFont(undefined, 'normal');
    doc.text(detail.value, 80, y);
  });
  
  // Thank you message
  doc.setFontSize(16);
  doc.setTextColor(220, 38, 38);
  doc.text('Thank you for saving lives!', 105, startY + (details.length * lineHeight) + 20, { align: 'center' });
  
  // Footer
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Blood Donation Management System', 105, 280, { align: 'center' });
  
  // Save the PDF
  doc.save(`donation-receipt-${receiptData.receiptId}.pdf`);
};

export default generateDonationReceipt;
