import { Router } from 'express'
import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

const router = Router()
const GROQ_API_KEY = process.env.GROQ_API_KEY || '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'

console.log('Groq Key exists:', !!GROQ_API_KEY)

if (!GROQ_API_KEY) {
  console.error('GROQ_API_KEY not set!')
}

const callGroq = async (systemPrompt: string, userMessage: string) => {
  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 1024,
      temperature: 0.7,
    },
    {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
    },
  )
  return response.data.choices[0].message.content
}

const SYSTEM_CONTEXT = `You are an AI assistant for FitReach Revivr, a fitness member retention CRM.
Help fitness studio managers identify at-risk members, create campaigns, and improve member retention.

Current studio data:
Total members: 50
High churn risk members: 18
Gold members: 15
Silver members: 20
Basic members: 15
Average engagement score: 52%

Be concise, helpful and actionable.
When drafting messages use motivational fitness tone.`

router.post('/chat', async (req: any, res: any) => {
  try {
    const { message, history = [] } = req.body
    console.log('AI chat called:', message)

    const aiResponse = await callGroq(SYSTEM_CONTEXT, message)

    console.log('Groq response generated')
    res.json({ response: aiResponse, success: true })
  } catch (error: any) {
    console.error('Groq Error:', error.message)
    res.status(500).json({ error: error.message })
  }
})

router.post('/draft-message', async (req: any, res: any) => {
  try {
    const { segmentName, channel, tone, memberCount } = req.body

    const message = await callGroq(
      'You are a fitness marketing expert.',
      `Write a short ${tone || 'motivational'} ${channel || 'WhatsApp'} message for ${memberCount || 'some'} fitness members in the "${segmentName || 'general'}" segment. Use {name} placeholder. Max 160 characters.`,
    )

    res.json({ message })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/segment', async (req: any, res: any) => {
  try {
    const { prompt } = req.body

    const result = await callGroq(
      'You are a data analyst for a fitness CRM. Respond only with valid JSON.',
      `Convert this to member filters: "${prompt}"

Available filters:
churnRisk: HIGH, MEDIUM, LOW
membershipType: GOLD, SILVER, BASIC

Respond ONLY with this JSON format:
{"filters":{"churnRisk":"HIGH"},"insight":"explanation","estimatedCount":18}`,
    )

    try {
      const parsed = JSON.parse(result.replace(/```json|```/g, '').trim())
      res.json(parsed)
    } catch {
      res.json({ filters: {}, insight: result, estimatedCount: 0 })
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router
