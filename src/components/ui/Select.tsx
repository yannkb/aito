import { useId } from 'react'
import type { SelectHTMLAttributes } from 'react'
import styles from './Select.module.css'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: SelectOption[]
  placeholder?: string
  error?: string
}

export function Select({
  label,
  options,
  placeholder,
  error,
  required,
  className,
  ...props
}: SelectProps): React.JSX.Element {
  const id = useId()
  const errorId = `${id}-error`

  const wrapperClasses = [
    styles.wrapper,
    error ? styles.error : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={wrapperClasses}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && <span className={styles.required} aria-hidden="true">*</span>}
      </label>
      <div className={styles.selectContainer}>
        <select
          id={id}
          className={styles.select}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className={styles.chevron} aria-hidden="true">
          ▾
        </span>
      </div>
      {error && (
        <span id={errorId} className={styles.errorMessage} role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
