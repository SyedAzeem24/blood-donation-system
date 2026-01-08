import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiBell, FiUser, FiLogOut, FiSun, FiMoon } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import notificationService from '../../services/notificationService';
import styles from './Navbar.module.css';

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const data = await notificationService.getUnreadCount();
        setUnreadCount(data.unreadCount);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    if (user) {
      fetchUnreadCount();
      // Refresh every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Administrator',
      donor: 'Donor',
      receiver: 'Receiver'
    };
    return labels[role] || role;
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={toggleSidebar}>
          {isSidebarOpen ? <FiX /> : <FiMenu />}
        </button>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>🩸</span>
          <span className={styles.logoText}>BloodDonate</span>
        </Link>
      </div>

      <div className={styles.right}>
        <button className={styles.themeBtn} onClick={toggleTheme} title="Toggle theme">
          {isDarkMode ? <FiSun /> : <FiMoon />}
        </button>

        <Link to="/notifications" className={styles.notificationBtn}>
          <FiBell />
          {unreadCount > 0 && (
            <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </Link>

        <div className={styles.userMenu}>
          <button 
            className={styles.userBtn}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <FiUser />
            <span className={styles.userName}>{user?.fullName}</span>
          </button>

          {showDropdown && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                <p className={styles.dropdownName}>{user?.fullName}</p>
                <p className={styles.dropdownRole}>{getRoleLabel(user?.role)}</p>
              </div>
              <hr className={styles.divider} />
              <Link 
                to="/profile" 
                className={styles.dropdownItem}
                onClick={() => setShowDropdown(false)}
              >
                <FiUser /> Profile
              </Link>
              <button className={styles.dropdownItem} onClick={handleLogout}>
                <FiLogOut /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
