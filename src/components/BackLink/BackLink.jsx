import { Link } from 'react-router-dom';
import styles from './BackLink.module.scss';

function BackLink({ to, children }) {
  return (
    <Link to={to} className={styles.backLink}>
      <span aria-hidden="true">← </span>
      {children}
    </Link>
  );
}

export default BackLink;
