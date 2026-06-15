import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://fitreach-revivr-backend.onrender.com/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const getMembers = (filters?: any) =>
  api.get('/members', { params: filters })

export const getMemberById = (id: string) =>
  api.get(`/members/${id}`)

export const getAtRiskMembers = () =>
  api.get('/members/at-risk')

export const getDashboardStats = () =>
  api.get('/members/stats')

export const getSegments = () =>
  api.get('/segments')

export const createSegment = (data: any) =>
  api.post('/segments', data)

export const getCampaigns = () =>
  api.get('/campaigns')

export const createCampaign = (data: any) =>
  api.post('/campaigns', data)

export const launchCampaign = (id: string) =>
  api.post(`/campaigns/${id}/send`)

export const getCampaignById = (id: string) =>
  api.get(`/campaigns/${id}`)

export const sendAIChat = (message: string, history: any[]) =>
  api.post('/ai/chat', { message, history })

export const draftMessage = (data: any) =>
  api.post('/ai/draft-message', data)

export const buildAISegment = (prompt: string) =>
  api.post('/ai/segment', { prompt })

export default api
