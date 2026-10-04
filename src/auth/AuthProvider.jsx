import { useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { firebaseAuth, signInClinicUser, signOutClinicUser } from '../lib/auth'
import { AuthContext } from './useAuth'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (nextUser) => {
      setUser(nextUser)
      setAuthLoading(false)
    })

    return unsubscribe
  }, [])

  const value = useMemo(
    () => ({
      user,
      authLoading,
      signIn: signInClinicUser,
      signOut: signOutClinicUser,
    }),
    [user, authLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
