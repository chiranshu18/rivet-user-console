import { useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Header/Header';
import styles from './Layout.module.scss';

function Layout() {
  const mainRef = useRef(null);

  // Focus <main> directly instead of following "#main", so the URL is not changed.
  const skipToMain = (event) => {
    event.preventDefault();
    mainRef.current?.focus();
  };

  return (
    <div className={styles.layout}>
      <a href="#main" className={styles.skipLink} onClick={skipToMain}>
        Skip to main content
      </a>
      <Header />
      <main id="main" ref={mainRef} tabIndex={-1} className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
