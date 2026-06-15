import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(__dirname, '../.env') })

console.log('ENV loaded from:', path.resolve(__dirname, '../.env'))
console.log('GROQ exists:', !!process.env.GROQ_API_KEY)

import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { PrismaClient } from '@prisma/client'

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: { origin: '*' }
})

export { io }

const prisma = new PrismaClient()
export { prisma }

app.use((req: any, res: any, next: any) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

app.use(express.json())

app.get('/health', (_req: any, res: any) => {
  res.json({
    status: 'ok',
    service: 'FitReach Revivr Backend',
    apiKey: !!process.env.ANTHROPIC_API_KEY,
  })
})

import membersRouter from './routes/members'
import segmentsRouter from './routes/segments'
import campaignsRouter from './routes/campaigns'
import aiRouter from './routes/ai'
import receiptsRouter from './routes/receipts'

app.use('/api/members', membersRouter)
app.use('/api/segments', segmentsRouter)
app.use('/api/campaigns', campaignsRouter)
app.use('/api/ai', aiRouter)
app.use('/api/receipts', receiptsRouter)

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)
})

const PORT = process.env.PORT || 4000

server.listen(PORT, () => {
  console.log(`FitReach Revivr Backend running on port ${PORT}`)
  console.log('API Key:', !!process.env.ANTHROPIC_API_KEY)
  console.log('Database URL:', !!process.env.DATABASE_URL)
})

setInterval(async () => {
  try {
    const response = await fetch(
      'https://fitreach-revivr.onrender.com/health'
    )
    console.log('Keep alive ping:', response.status)
  } catch (error) {
    console.log('Ping failed:', error)
  }
}, 14 * 60 * 1000) // ping every 14 minutes
