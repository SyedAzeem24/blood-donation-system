import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import styles from './ErrorPages.module.css';

const Unauthorized = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <span className={styles.icon}>🚫</span>
        <h1 className={styles.title}>403</h1>
        <h2 className={styles.subtitle}>Access Denied</h2>
        <p className={styles.message}>
          You don't have permission to access this page.
        </p>
        <Link to="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
