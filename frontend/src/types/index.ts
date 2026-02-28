export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'entrepreneur' | 'investor' | 'admin'
  phoneNumber?: string
  nic?: string
  isVerified: boolean
  isActive: boolean
  creditScore?: number
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  entrepreneur: {
    id: string
    name: string
    email: string
  }
  title: string
  description: string
  category: string
  fundingType: 'microloan' | 'equity'
  fundingGoal: number
  currentFunding: number
  interestRate?: number
  equityOffered?: number
  duration?: number
  status: 'pending' | 'approved' | 'rejected' | 'funded' | 'active' | 'completed'
  investors: {
    user: string
    amount: number
    type: 'loan' | 'equity'
    date: string
  }[]
  createdAt: string
  updatedAt: string
}

export interface Investment {
  id: string
  investor: string
  project: string | Project
  amount: number
  type: 'loan' | 'equity'
  status: 'pending' | 'completed' | 'cancelled' | 'refunded'
  paymentIntentId?: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  success: boolean
  token: string
  user: User
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
