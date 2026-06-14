import { create } from 'zustand'

export interface Activity {
  id: string
  memberName: string
  status: string
  channel: string
  campaignId: string
  timestamp: Date
}

export interface ToastItem {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface Store {
  activities: Activity[]
  addActivity: (a: Activity) => void
  clearActivities: () => void
  toasts: ToastItem[]
  addToast: (t: Omit<ToastItem, 'id'>) => void
  removeToast: (id: string) => void
}

export const useStore = create<Store>((set) => ({
  activities: [],
  addActivity: (activity) =>
    set((state) => ({
      activities: [activity, ...state.activities].slice(0, 50),
    })),
  clearActivities: () => set({ activities: [] }),
  toasts: [],
  addToast: (t) =>
    set((state) => ({
      toasts: [...state.toasts, { ...t, id: Date.now().toString() }],
    })),
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))
