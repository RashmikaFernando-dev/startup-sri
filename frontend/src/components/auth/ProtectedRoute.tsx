import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

interface ProtectedRouteProps {
  children: React.ReactNode
  /** Redirect target when no token found. Defaults to '/auth/login' */
  redirectTo?: string
}

/**
 * Wraps a page to guard against unauthenticated access.
 * Redirects to `redirectTo` (default: /auth/login) if no token is found in localStorage.
 * Returns null while checking so the page doesn't flash before redirecting.
 */
export default function ProtectedRoute({ children, redirectTo = '/auth/login' }: ProtectedRouteProps) {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push(redirectTo)
    } else {
      setChecked(true)
    }
  }, [])

  if (!checked) return null
  return <>{children}</>
}
