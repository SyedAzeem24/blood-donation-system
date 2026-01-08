import styles from './Card.module.css';

const Card = ({ 
  children, 
  className = '',
  padding = 'medium',
  onClick,
  hoverable = false
}) => {
  const cardClasses = [
    styles.card,
    styles[padding],
    hoverable ? styles.hoverable : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;
