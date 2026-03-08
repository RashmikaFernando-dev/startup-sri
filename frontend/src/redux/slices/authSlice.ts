import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'entrepreneur' | 'investor' | 'admin'
  isVerified: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true
      state.error = null
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.loading = false
      state.isAuthenticated = true
      state.user = action.payload.user
      state.token = action.payload.token
      state.error = null
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.loading = false
      state.error = null
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
    },
    restoreSession: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      state.loading = false
    },
  },
})

export const { loginStart, loginSuccess, loginFailure, logout, updateUser, restoreSession } = authSlice.actions
export default authSlice.reducer
