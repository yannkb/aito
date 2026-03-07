import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './IconButton.module.css'

type IconButtonVariant = 'default' | 'danger' | 'primary'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string
  variant?: IconButtonVariant
  rounded?: boolean
  children: ReactNode
}

export function IconButton({
  variant = 'default',
  rounded = false,
  className,
  children,
  ...props
}: IconButtonProps) {
  const classes = [
    styles.iconButton,
    variant !== 'default' ? styles[variant] : '',
    rounded ? styles.rounded : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  )
}
