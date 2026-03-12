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
    if (!open || closing) return
    const firstItem = menuRef.current?.querySelector<HTMLButtonElement>('button[role="menuitem"]:not(:disabled)')
    firstItem?.focus()
  }, [open, closing, coords])

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

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close()
        triggerRef.current?.querySelector('button')?.focus()
        return
      }

      if (!menuRef.current) return

      const menuItems = Array.from(
        menuRef.current.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]:not(:disabled)')
      )
      if (menuItems.length === 0) return

      const currentIndex = menuItems.indexOf(document.activeElement as HTMLButtonElement)

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const next = currentIndex < menuItems.length - 1 ? currentIndex + 1 : 0
        menuItems[next].focus()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        const prev = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1
        menuItems[prev].focus()
      } else if (e.key === 'Home') {
        e.preventDefault()
        menuItems[0].focus()
      } else if (e.key === 'End') {
        e.preventDefault()
        menuItems[menuItems.length - 1].focus()
      }
    }

    const handleScroll = () => close()

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('scroll', handleScroll, true)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleKeyDown)
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
        <button
          type="button"
          onClick={toggle}
          aria-haspopup="menu"
          aria-expanded={open}
          className={styles.triggerButton}
        >
          {trigger}
        </button>
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
