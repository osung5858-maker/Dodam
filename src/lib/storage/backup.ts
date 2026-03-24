// localStorage 데이터 백업/복원 유틸
const BACKUP_KEYS = [
  'dodam_vaccinations',
  'dodam_feed_sessions',
  'dodam_epds_history',
  'dodam_mood_history',
  'dodam_supplement_history',
  'dodam_letters',
  'dodam_preg_diary',
  'dodam_checkup_records',
  'dodam_preg_tests',
  'dodam_journey_entries',
]

export function backupLocalData() {
  const backup: Record<string, string> = {}
  BACKUP_KEYS.forEach(key => {
    const val = localStorage.getItem(key)
    if (val) backup[key] = val
  })
  backup._timestamp = new Date().toISOString()
  localStorage.setItem('dodam_backup', JSON.stringify(backup))
}

export function restoreLocalData(): boolean {
  const raw = localStorage.getItem('dodam_backup')
  if (!raw) return false
  try {
    const backup = JSON.parse(raw)
    let restored = 0
    BACKUP_KEYS.forEach(key => {
      if (backup[key] && !localStorage.getItem(key)) {
        localStorage.setItem(key, backup[key])
        restored++
      }
    })
    return restored > 0
  } catch { return false }
}

// 매일 자동 백업 (하루 1회)
export function autoBackup() {
  const lastBackup = localStorage.getItem('dodam_last_backup')
  const today = new Date().toISOString().split('T')[0]
  if (lastBackup !== today) {
    backupLocalData()
    localStorage.setItem('dodam_last_backup', today)
  }
}
