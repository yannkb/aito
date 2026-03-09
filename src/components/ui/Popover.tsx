import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode, CSSProperties } from 'react'
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
  const [coords, setCoords] = useState<CSSProperties | null>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => {
    setClosing(true)
    setTimeout(() => {
      setOpen(false)
      setClosing(false)
      setCoords(null)
    }, 120)
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

  useLayoutEffect(() => {
    if (!open || closing || !triggerRef.current || !menuRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const menuHeight = menuRef.current.offsetHeight
    const gap = 6

    const spaceBelow = window.innerHeight - triggerRect.bottom
    const fitsBelow = spaceBelow >= menuHeight + gap
    const fitsAbove = triggerRect.top >= menuHeight + gap

    const top = !fitsBelow && fitsAbove
      ? triggerRect.top - menuHeight - gap
      : triggerRect.bottom + gap

    if (align === 'right') {
      setCoords({ top, right: window.innerWidth - triggerRect.right })
    } else {
      setCoords({ top, left: triggerRect.left })
    }
  }, [open, closing, align])

  useEffect(() => {
    if (!open) return

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target
      if (!(target instanceof Node)) return
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return
      }
      close()
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }

    const handleScroll = () => close()

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)
    window.addEventListener('scroll', handleScroll, true)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [open, close])

  const menuClasses = [
    styles.menu,
    closing ? styles.closing : '',
    align === 'right' ? styles.alignRight : styles.alignLeft,
  ]
    .filter(Boolean)
    .join(' ')

  const menuStyle: CSSProperties = coords ?? { opacity: 0, pointerEvents: 'none' }

  return (
    <>
      <div ref={triggerRef} className={styles.wrapper}>
        <div onClick={toggle} role="presentation">
          {trigger}
        </div>
      </div>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            className={menuClasses}
            role="menu"
            style={menuStyle}
          >
            {items.map((item) => {
              const itemClasses = [
                styles.item,
                item.variant === 'danger' ? styles.itemDanger : '',
                item.disabled ? styles.itemDisabled : '',
              ]
                .filter(Boolean)
                .join(' ')

              return (
                <button
                  key={item.label}
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
          </div>,
          document.body
        )}
    </>
  )
}
