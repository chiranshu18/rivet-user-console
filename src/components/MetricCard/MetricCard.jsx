import styles from './MetricCard.module.scss';

function MetricCard({ label, value, description }) {
  return (
    <div className={styles.card}>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
      {description && <p className={styles.description}>{description}</p>}
    </div>
  );
}

export default MetricCard;
