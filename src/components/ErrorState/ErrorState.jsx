import styles from './ErrorState.module.scss';

function ErrorState({ title = 'Something went wrong', message }) {
  return (
    <div className={styles.error} role="alert">
      <p className={styles.title}>{title}</p>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}

export default ErrorState;
