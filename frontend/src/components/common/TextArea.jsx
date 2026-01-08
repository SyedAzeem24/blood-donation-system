import styles from './TextArea.module.css';

const TextArea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  rows = 4,
  className = ''
}) => {
  return (
    <div className={`${styles.textareaGroup} ${className}`}>
      {label && (
        <label className={styles.label} htmlFor={name}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`${styles.textarea} ${error ? styles.textareaError : ''}`}
      />
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
};

export default TextArea;
