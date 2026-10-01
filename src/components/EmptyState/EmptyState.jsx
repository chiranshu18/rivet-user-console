import styles from './EmptyState.module.scss';

function EmptyState({ message = 'No data to show.' }) {
  return <p className={styles.empty}>{message}</p>;
}

export default EmptyState;
