import styles from './MultiSelectFilter.module.scss';

/**
 * Checkbox chips. An empty selection means "no filter".
 * @param {string} label
 * @param {string[]} options
 * @param {string[]} selected
 * @param {(selected: string[]) => void} onChange
 */
function MultiSelectFilter({ label, options, selected, onChange }) {
  const toggle = (option) => {
    onChange(
      selected.includes(option)
        ? selected.filter((value) => value !== option)
        : options.filter((value) => value === option || selected.includes(value))
    );
  };

  return (
    <fieldset className={styles.filter}>
      <legend className={styles.legend}>{label}</legend>
      <div className={styles.options}>
        {options.map((option) => {
          const checked = selected.includes(option);
          return (
            <label key={option} className={checked ? `${styles.chip} ${styles.checked}` : styles.chip}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={checked}
                onChange={() => toggle(option)}
              />
              {option}
            </label>
          );
        })}
        {selected.length > 0 && (
          <button type="button" className={styles.clear} onClick={() => onChange([])}>
            Clear
          </button>
        )}
      </div>
    </fieldset>
  );
}

export default MultiSelectFilter;
