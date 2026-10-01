import { useId } from 'react';
import styles from './SearchForm.module.scss';

/** Search that runs on submit (Enter or button), with an inline error message. */
function SearchForm({ label, placeholder, buttonLabel = 'Go', value, onChange, onSubmit, error }) {
  const inputId = useId();
  const errorId = `${inputId}-error`;

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(value);
  };

  return (
    <form role="search" className={styles.form} onSubmit={handleSubmit} noValidate>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <div className={styles.row}>
        <input
          id={inputId}
          type="text"
          className={error ? `${styles.input} ${styles.invalid}` : styles.input}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          autoComplete="off"
        />
        <button type="submit" className={styles.button}>
          {buttonLabel}
        </button>
      </div>
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

export default SearchForm;
