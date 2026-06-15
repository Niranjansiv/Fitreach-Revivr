const express = require('express')
const cors = require('cors')
const axios = require('axios')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 4001
const CALLBACK_URL = process.env.CRM_CALLBACK_URL || 'http://localhost:4000/api/receipts/callback'

app.use(cors())
app.use(express.json())

// ── Channel delivery profiles ─────────────────────────────────────────────────

const CHANNEL_CONFIGS = {
  WHATSAPP: {
    deliveredRate: 0.92, deliveredDelay: [800,  2000],
    openedRate:    0.70, openedDelay:    [2000, 5000],
    clickedRate:   0.35, clickedDelay:   [3000, 7000],
    convertedRate: 0.20, convertedDelay: [5000, 10000],
  },
  SMS: {
    deliveredRate: 0.85, deliveredDelay: [500,  1500],
    openedRate:    0.45, openedDelay:    [1000, 3000],
    clickedRate:   0.20, clickedDelay:   [2000, 5000],
    convertedRate: 0.10, convertedDelay: [4000, 8000],
  },
  EMAIL: {
    deliveredRate: 0.95, deliveredDelay: [1000, 3000],
    openedRate:    0.35, openedDelay:    [3000, 8000],
    clickedRate:   0.25, clickedDelay:   [4000, 9000],
    convertedRate: 0.15, convertedDelay: [6000, 12000],
  },
  PUSH: {
    deliveredRate: 0.80, deliveredDelay: [300,  1000],
    openedRate:    0.55, openedDelay:    [1000, 3000],
    clickedRate:   0.30, clickedDelay:   [2000, 5000],
    convertedRate: 0.12, convertedDelay: [3000, 7000],
  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function wait(min, max) {
  return new Promise((resolve) => setTimeout(resolve, randInt(min, max)))
}

async function postCallback(payload) {
  console.log(`[CHANNEL] ${payload.memberName} | ${payload.channel} | ${payload.status}`)
  try {
    await axios.post(CALLBACK_URL, payload)
  } catch (err) {
    console.error(`[CHANNEL] Callback error for ${payload.memberName}:`, err.message)
  }
}

// ── Delivery simulation ───────────────────────────────────────────────────────

async function simulate(send) {
  const cfg = CHANNEL_CONFIGS[send.channel] || CHANNEL_CONFIGS.EMAIL

  const base = {
    communicationLogId: send.communicationLogId,
    campaignId:         send.campaignId,
    memberId:           send.memberId,
    memberName:         send.memberName,
    channel:            send.channel,
  }

  const cb = (status) =>
    postCallback({ ...base, status, timestamp: new Date().toISOString() })

  if (Math.random() >= cfg.deliveredRate) {
    await wait(2000, 2000)
    await cb('FAILED')
    return
  }

  await wait(...cfg.deliveredDelay)
  await cb('DELIVERED')

  if (Math.random() >= cfg.openedRate) return
  await wait(...cfg.openedDelay)
  await cb('OPENED')

  if (Math.random() >= cfg.clickedRate) return
  await wait(...cfg.clickedDelay)
  await cb('CLICKED')

  if (Math.random() >= cfg.convertedRate) return
  await wait(...cfg.convertedDelay)
  await cb('CONVERTED')
}

// ── Routes ────────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'FitReach Channel Service' })
})

app.post('/send', (req, res) => {
  const payload = req.body

  res.json({ success: true, message: 'Queued' })

  simulate(payload).catch((err) =>
    console.error(`[CHANNEL] Simulation error for ${payload.memberName}:`, err)
  )
})

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () =>
  console.log(`FitReach Channel Service running on port ${PORT}`)
)
