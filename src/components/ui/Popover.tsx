import { useState, useEffect, useRef, useCallback } from 'react'
import type { ReactNode } from 'react'
import styles from './Popover.module.css'

interface PopoverItem {
  icon: ReactNode
  label: string
  onClick: () => void
  variant?: 'default' | 'danger'
  disabled?: boolean
}

interface PopoverProps {
  items: PopoverItem[]
  trigger: ReactNode
  align?: 'left' | 'right'
}

export function Popover({ items, trigger, align = 'right' }: PopoverProps) {
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => {
    setClosing(true)
    const timer = setTimeout(() => {
      setOpen(false)
      setClosing(false)
    }, 120)
    return () => clearTimeout(timer)
  }, [])

  const toggle = () => {
    if (open) {
      close()
    } else {
      setOpen(true)
      setClosing(false)
    }
  }

  const handleItemClick = (item: PopoverItem) => {
    if (item.disabled) return
    item.onClick()
    close()
  }

  useEffect(() => {
    if (!open) return

    const handleOutsideClick = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        close()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close()
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, close])

  const menuClasses = [
    styles.menu,
    closing ? styles.closing : '',
    align === 'right' ? styles.alignRight : styles.alignLeft,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <div onClick={toggle} role="presentation">
        {trigger}
      </div>
      {open && (
        <div className={menuClasses} role="menu">
          {items.map((item, index) => {
            const itemClasses = [
              styles.item,
              item.variant === 'danger' ? styles.itemDanger : '',
              item.disabled ? styles.itemDisabled : '',
            ]
              .filter(Boolean)
              .join(' ')

            return (
              <button
                key={index}
                type="button"
                className={itemClasses}
                role="menuitem"
                disabled={item.disabled}
                aria-disabled={item.disabled}
                onClick={() => handleItemClick(item)}
              >
                <span className={styles.icon}>{item.icon}</span>
                <span className={styles.label}>{item.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
