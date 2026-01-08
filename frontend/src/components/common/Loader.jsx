import styles from './Loader.module.css';

const Loader = ({ size = 'medium', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className={styles.fullScreen}>
        <div className={`${styles.loader} ${styles[size]}`}>
          <div className={styles.drop}></div>
        </div>
        <p className={styles.text}>Loading...</p>
      </div>
    );
  }

  return (
    <div className={`${styles.loader} ${styles[size]}`}>
      <div className={styles.drop}></div>
    </div>
  );
};

export default Loader;
