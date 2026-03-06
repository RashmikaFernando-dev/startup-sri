import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Project {
  _id: string
  title: string
  description: string
  longDescription?: string
  category: string
  fundingType: 'microloan' | 'equity'
  fundingGoal: number
  currentFunding: number
  interestRate?: number
  equityOffered?: number
  duration?: number
  status: 'pending' | 'approved' | 'rejected' | 'funded' | 'active' | 'completed'
  investors?: { user: string; amount: number }[]
  entrepreneur: {
    _id?: string
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    startupName?: string
  }
  documents?: { businessPlan?: string }
  createdAt: string
}

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  loading: boolean
  error: string | null
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
}

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    fetchProjectsStart: (state) => {
      state.loading = true
      state.error = null
    },
    fetchProjectsSuccess: (state, action: PayloadAction<Project[]>) => {
      state.loading = false
      state.projects = action.payload
    },
    fetchProjectsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    setCurrentProject: (state, action: PayloadAction<Project>) => {
      state.currentProject = action.payload
    },
    clearCurrentProject: (state) => {
      state.currentProject = null
    },
    removeProject: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter(
        (p) => p._id !== action.payload
      )
    },
  },
})

export const {
  fetchProjectsStart,
  fetchProjectsSuccess,
  fetchProjectsFailure,
  setCurrentProject,
  clearCurrentProject,
  removeProject,
} = projectSlice.actions

export default projectSlice.reducer
