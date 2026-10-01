import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.scss';

function NotFoundPage() {
  return (
    <section className={styles.notFound}>
      <p className={styles.code}>404</p>
      <h1>Page not found</h1>
      <p className={styles.message}>The page you are looking for does not exist.</p>
      <Link to="/users">Go to Users</Link>
    </section>
  );
}

export default NotFoundPage;
