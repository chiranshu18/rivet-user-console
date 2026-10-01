import { useId } from 'react';
import styles from './SearchInput.module.scss';

function SearchInput({ label, value, onChange, placeholder }) {
  const inputId = useId();

  return (
    <div className={styles.search}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <input
        id={inputId}
        type="search"
        className={styles.input}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
      />
    </div>
  );
}

export default SearchInput;
