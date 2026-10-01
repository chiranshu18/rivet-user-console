import styles from './Loader.module.scss';

function Loader({ message = 'Loading…' }) {
  return (
    <div className={styles.loader} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

export default Loader;
