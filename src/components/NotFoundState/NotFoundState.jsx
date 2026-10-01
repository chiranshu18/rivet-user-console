import { Link } from 'react-router-dom';
import styles from './NotFoundState.module.scss';

function NotFoundState({ code, title, message, linkTo = '/users', linkLabel = 'Go to Users' }) {
  return (
    <div className={styles.notFound}>
      {code && <p className={styles.code}>{code}</p>}
      <h1>{title}</h1>
      {message && <p className={styles.message}>{message}</p>}
      <Link to={linkTo}>{linkLabel}</Link>
    </div>
  );
}

export default NotFoundState;
