import '@/styles/globals.css'
import { useEffect } from 'react'
import type { AppProps } from 'next/app'
import { Provider } from 'react-redux'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { store } from '@/redux/store'
import { restoreSession } from '@/redux/slices/authSlice'
import theme from '@/styles/theme'

function AppWithRedux({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Rehydrate Redux auth state from localStorage on every page load
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        store.dispatch(restoreSession({ user, token }))
      } catch {
        // corrupted storage – leave state as unauthenticated
      }
    }
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default function App(props: AppProps) {
  return (
    <Provider store={store}>
      <AppWithRedux {...props} />
    </Provider>
  )
}
