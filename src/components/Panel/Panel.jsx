import styles from './Panel.module.scss';

/** Card container with an optional toolbar row (search, filters) above its content. */
function Panel({ toolbar, children }) {
  return (
    <div className={styles.panel}>
      {toolbar && <div className={styles.toolbar}>{toolbar}</div>}
      {children}
    </div>
  );
}

export default Panel;
