import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Investment {
  id: string
  projectId: string
  amount: number
  type: 'loan' | 'equity'
  status: 'pending' | 'completed' | 'cancelled'
  createdAt: string
}

interface InvestmentState {
  investments: Investment[]
  loading: boolean
  error: string | null
}

const initialState: InvestmentState = {
  investments: [],
  loading: false,
  error: null,
}

const investmentSlice = createSlice({
  name: 'investment',
  initialState,
  reducers: {
    fetchInvestmentsStart: (state) => {
      state.loading = true
      state.error = null
    },
    fetchInvestmentsSuccess: (state, action: PayloadAction<Investment[]>) => {
      state.loading = false
      state.investments = action.payload
    },
    fetchInvestmentsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    addInvestment: (state, action: PayloadAction<Investment>) => {
      state.investments.push(action.payload)
    },
  },
})

export const {
  fetchInvestmentsStart,
  fetchInvestmentsSuccess,
  fetchInvestmentsFailure,
  addInvestment,
} = investmentSlice.actions

export default investmentSlice.reducer
