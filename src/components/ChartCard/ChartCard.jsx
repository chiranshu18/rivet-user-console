import styles from './ChartCard.module.scss';

function ChartCard({ title, description, className, children }) {
  return (
    <section className={className ? `${styles.card} ${className}` : styles.card}>
      <header className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {description && <p className={styles.description}>{description}</p>}
      </header>
      <div className={styles.body}>{children}</div>
    </section>
  );
}

export default ChartCard;
