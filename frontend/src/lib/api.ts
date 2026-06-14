import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  timeout: 10000,
})

// Members
export const getMembers = (filters?: {
  search?: string
  membershipType?: string
  churnRisk?: string
}) => api.get('/members', { params: filters })

export const getMemberById = (id: string) => api.get(`/members/${id}`)
export const getAtRiskMembers = () => api.get('/members/at-risk')
export const getDashboardStats = () => api.get('/members/stats')

// Segments
export const getSegments = () => api.get('/segments')
export const createSegment = (data: { name: string; description: string; rules: Record<string, unknown> }) =>
  api.post('/segments', data)

// Campaigns
export const getCampaigns = () => api.get('/campaigns')
export const createCampaign = (data: {
  name: string
  segmentId: string
  message: string
  channel: string
}) => api.post('/campaigns', data)
export const launchCampaign = (id: string) => api.post(`/campaigns/${id}/send`)
export const getCampaignById = (id: string) => api.get(`/campaigns/${id}`)

// AI
export const sendAIChat = (
  message: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
) => api.post('/ai/chat', { message, history })

export const draftMessage = (data: {
  segmentName: string
  channel: string
  tone: string
  memberCount: number
}) => api.post('/ai/draft-message', data)

export const buildAISegment = (prompt: string) => api.post('/ai/segment', { prompt })
