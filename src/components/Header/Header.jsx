import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.scss';

const NAV_ITEMS = [
  { to: '/users', label: 'Users', matches: (path) => path === '/users' || path.startsWith('/user/') },
  { to: '/analytics', label: 'Analytics', matches: (path) => path.startsWith('/analytics') },
];

function Header() {
  const { pathname } = useLocation();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/users" className={styles.brand}>
          User Console
        </Link>
        <nav aria-label="Main navigation">
          <ul className={styles.nav}>
            {NAV_ITEMS.map(({ to, label, matches }) => {
              const isActive = matches(pathname);
              return (
                <li key={to}>
                  <Link
                    to={to}
                    className={isActive ? `${styles.link} ${styles.active}` : styles.link}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
