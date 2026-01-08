import { NavLink } from 'react-router-dom';
import { 
  FiHome, 
  FiDroplet, 
  FiHeart, 
  FiClock, 
  FiUsers, 
  FiSettings,
  FiPlusCircle,
  FiList,
  FiFileText
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const getDonorLinks = () => [
    { to: '/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { to: '/create-donation', icon: <FiPlusCircle />, label: 'Create Donation' },
    { to: '/my-donations', icon: <FiList />, label: 'My Donations' },
    { to: '/donation-history', icon: <FiClock />, label: 'Donation History' },
    { to: '/blood-requests', icon: <FiHeart />, label: 'Blood Requests' },
    { to: '/profile', icon: <FiSettings />, label: 'Profile' }
  ];

  const getReceiverLinks = () => [
    { to: '/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { to: '/create-request', icon: <FiPlusCircle />, label: 'Create Request' },
    { to: '/my-requests', icon: <FiList />, label: 'My Requests' },
    { to: '/available-donations', icon: <FiDroplet />, label: 'Available Donations' },
    { to: '/profile', icon: <FiSettings />, label: 'Profile' }
  ];

  const getAdminLinks = () => [
    { to: '/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { to: '/admin/users', icon: <FiUsers />, label: 'Manage Users' },
    { to: '/admin/posts', icon: <FiFileText />, label: 'Manage Posts' },
    { to: '/profile', icon: <FiSettings />, label: 'Profile' }
  ];

  const getLinks = () => {
    switch (user?.role) {
      case 'donor':
        return getDonorLinks();
      case 'receiver':
        return getReceiverLinks();
      case 'admin':
        return getAdminLinks();
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className={styles.overlay} onClick={onClose} />}
      
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <nav className={styles.nav}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => 
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
              onClick={onClose}
            >
              <span className={styles.icon}>{link.icon}</span>
              <span className={styles.label}>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.footer}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
            <div className={styles.userDetails}>
              <p className={styles.userName}>{user?.fullName}</p>
              <p className={styles.userRole}>{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
