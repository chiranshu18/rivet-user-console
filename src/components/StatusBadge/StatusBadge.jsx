import styles from './StatusBadge.module.scss';

const STATUS_CLASS = {
  New: styles.new,
  Returning: styles.returning,
  Deleted: styles.deleted,
};

function StatusBadge({ status }) {
  return <span className={`${styles.badge} ${STATUS_CLASS[status] ?? ''}`}>{status}</span>;
}

export default StatusBadge;
