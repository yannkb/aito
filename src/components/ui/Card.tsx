import type { HTMLAttributes, ReactNode } from 'react'
import styles from './Card.module.css'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean
  interactive?: boolean
  noPadding?: boolean
  children: ReactNode
}

export function Card({
  elevated = false,
  interactive = false,
  noPadding = false,
  className,
  children,
  ...props
}: CardProps): React.JSX.Element {
  const classes = [
    styles.card,
    elevated ? styles.elevated : '',
    interactive ? styles.interactive : '',
    noPadding ? styles.noPadding : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}
