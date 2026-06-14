export interface Visit {
  id: string
  memberId: string
  date: string
  classType: string
  trainer: string
}

export interface Member {
  id: string
  name: string
  email: string
  phone: string
  membershipType: 'GOLD' | 'SILVER' | 'BASIC'
  joinDate: string
  lastVisit: string | null
  engagementScore: number
  churnRisk: 'LOW' | 'MEDIUM' | 'HIGH'
  favoriteClass: string | null
  totalVisits: number
  avatarColor: string
  createdAt: string
  visits?: Visit[]
  logs?: CommunicationLog[]
}

export interface Segment {
  id: string
  name: string
  description: string
  rules: Record<string, unknown>
  memberCount: number
  createdAt: string
  _count?: { campaigns: number }
}

export interface Campaign {
  id: string
  name: string
  segmentId: string
  segment?: Segment
  message: string
  channel: 'WHATSAPP' | 'SMS' | 'EMAIL' | 'PUSH'
  status: 'DRAFT' | 'RUNNING' | 'COMPLETED'
  totalSent: number
  totalDelivered: number
  totalOpened: number
  totalClicked: number
  totalConverted: number
  totalFailed: number
  createdAt: string
  logs?: CommunicationLog[]
}

export interface CommunicationLog {
  id: string
  campaignId: string
  memberId: string
  member?: Member
  campaign?: Campaign
  status: 'SENT' | 'DELIVERED' | 'OPENED' | 'CLICKED' | 'CONVERTED' | 'FAILED'
  sentAt: string
  deliveredAt: string | null
  openedAt: string | null
  clickedAt: string | null
  convertedAt: string | null
}

export interface DashboardStats {
  totalMembers: number
  atRisk: number
  goldMembers: number
  silverMembers: number
  basicMembers: number
  highRisk: number
  mediumRisk: number
  lowRisk: number
  avgEngagement: number
}
