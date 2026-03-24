import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'dodam-offline'
const STORE_NAME = 'pending-events'

let dbPromise: Promise<IDBPDatabase> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        }
      },
    })
  }
  return dbPromise
}

export interface PendingEvent {
  id: string
  child_id: string
  recorder_id: string
  type: string
  start_ts: string
  end_ts?: string
  amount_ml?: number
  tags?: Record<string, unknown>
  source: string
  synced?: boolean
  created_at?: string
}

export async function savePendingEvent(event: PendingEvent) {
  const db = await getDB()
  await db.put(STORE_NAME, event)
}

export async function getPendingEvents(): Promise<PendingEvent[]> {
  const db = await getDB()
  return db.getAll(STORE_NAME)
}

export async function removePendingEvent(id: string) {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}

export async function clearPendingEvents() {
  const db = await getDB()
  await db.clear(STORE_NAME)
}

export async function getPendingCount(): Promise<number> {
  const db = await getDB()
  return db.count(STORE_NAME)
}

// 동기화 완료된 이벤트 제거
export async function clearSyncedEvents() {
  const db = await getDB()
  const all = await db.getAll(STORE_NAME)
  for (const evt of all) {
    if ((evt as any).synced) await db.delete(STORE_NAME, evt.id)
  }
}
