import { useState, useRef, useEffect, useCallback } from 'react'
import { ThemeToggle } from '../components/ThemeToggle'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { useProgram, useProgramDispatch } from '../context/ProgramContext'
import { exportProgram } from '../utils/export'
import { importProgram } from '../utils/import'
import styles from '../styles/settings.module.css'

export default function SettingsComponent() {
  const program = useProgram()
  const dispatch = useProgramDispatch()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messageTimerRef = useRef<number | null>(null)

  const [showImportConfirm, setShowImportConfirm] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const canShare = typeof navigator !== 'undefined' && !!navigator.share

  useEffect(() => {
    return () => {
      if (messageTimerRef.current !== null) {
        clearTimeout(messageTimerRef.current)
      }
    }
  }, [])

  const showTimedSuccess = useCallback((message: string) => {
    if (messageTimerRef.current !== null) clearTimeout(messageTimerRef.current)
    setSuccessMessage(message)
    setErrorMessage(null)
    messageTimerRef.current = window.setTimeout(() => setSuccessMessage(null), 3000)
  }, [])

  const showTimedError = useCallback((message: string) => {
    if (messageTimerRef.current !== null) clearTimeout(messageTimerRef.current)
    setErrorMessage(message)
    setSuccessMessage(null)
    messageTimerRef.current = window.setTimeout(() => setErrorMessage(null), 3000)
  }, [])

  const handleExport = () => {
    try {
      exportProgram(program)
      showTimedSuccess('Program exported successfully!')
    } catch (error) {
      showTimedError(error instanceof Error ? error.message : 'Failed to export program')
    }
  }

  const handleShare = async () => {
    const json = JSON.stringify(program, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const file = new File([blob], 'aito-program.json', { type: 'application/json' })

    try {
      await navigator.share({
        title: 'Aito Training Program',
        text: 'Check out my training program!',
        files: [file],
      })
      showTimedSuccess('Program shared!')
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        showTimedError('Sharing failed. Try exporting instead.')
      }
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPendingFile(file)
      setShowImportConfirm(true)
      setErrorMessage(null)
      setSuccessMessage(null)
    }
    e.target.value = ''
  }

  const handleImportConfirm = async () => {
    if (!pendingFile || importing) return
    setImporting(true)

    try {
      const importedProgram = await importProgram(pendingFile)
      dispatch({ type: 'LOAD_PROGRAM', payload: importedProgram })
      showTimedSuccess('Program imported successfully!')
      setShowImportConfirm(false)
      setPendingFile(null)
    } catch (error) {
      showTimedError(error instanceof Error ? error.message : 'Failed to import program')
      setShowImportConfirm(false)
      setPendingFile(null)
    } finally {
      setImporting(false)
    }
  }

  const handleImportCancel = () => {
    setShowImportConfirm(false)
    setPendingFile(null)
  }

  return (
    <div className={styles.settings}>
      <Card className={styles.section}>
        <h2 className={styles.sectionTitle}>Theme</h2>
        <div className={styles.themeSection}>
          <p className={styles.themeLabel}>
            Choose your preferred theme
          </p>
          <ThemeToggle />
        </div>
      </Card>

      <Card className={styles.section}>
        <h2 className={styles.sectionTitle}>Export Program</h2>
        <div className={styles.exportSection}>
          <p className={styles.description}>
            Download your current training program as a JSON file. This creates
            a backup you can import later or share with others.
          </p>
          <div className={styles.buttonGroup}>
            <Button onClick={handleExport}>Export Program</Button>
            {canShare && (
              <Button variant="secondary" onClick={handleShare}>
                Share
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card className={styles.section}>
        <h2 className={styles.sectionTitle}>Import Program</h2>
        <div className={styles.importSection}>
          <p className={styles.description}>
            Load a training program from a JSON file. This will replace your
            current program with the imported one.
          </p>
          <div className={styles.buttonGroup}>
            <Button variant="secondary" onClick={handleImportClick}>
              Import Program
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className={styles.fileInput}
              aria-label="Select JSON file to import"
            />
          </div>
        </div>
      </Card>

      {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}
      {successMessage && <p className={styles.successText}>{successMessage}</p>}

      <div className={styles.aboutSection}>
        <h2 className={styles.appName}>Aito</h2>
        <p className={styles.appDescription}>
          Ironwood Warrior — Gym × ʻOri Tahiti
        </p>
        <p className={styles.version}>Version {__APP_VERSION__}</p>
      </div>

      <Modal
        open={showImportConfirm}
        onClose={handleImportCancel}
        title="Import Program"
      >
        <p className={styles.modalText}>
          This will replace your current program. Continue?
        </p>
        <div className={styles.modalActions}>
          <Button variant="secondary" onClick={handleImportCancel} disabled={importing}>
            Cancel
          </Button>
          <Button onClick={handleImportConfirm} disabled={importing}>
            {importing ? 'Importing...' : 'Import'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
