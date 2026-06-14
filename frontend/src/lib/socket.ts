import { useEffect } from 'react'
import { io } from 'socket.io-client'
import { useStore } from '../store/useStore'

export const socket = io('http://localhost:4000', { autoConnect: true })

export function useSocket() {
  const addActivity = useStore((s) => s.addActivity)

  useEffect(() => {
    const handleUpdate = (data: {
      memberName: string
      status: string
      channel: string
      campaignId: string
    }) => {
      addActivity({
        id: Date.now().toString(),
        memberName: data.memberName,
        status: data.status,
        channel: data.channel,
        campaignId: data.campaignId,
        timestamp: new Date(),
      })
    }

    socket.on('callback_update', handleUpdate)
    return () => { socket.off('callback_update', handleUpdate) }
  }, [addActivity])
}
