import { createContext, useContext } from 'react'

// The auth context lives in its own module (not in AuthProvider.jsx) so that the
// component module exports only the `AuthProvider` component. Mixing a component
// export with a hook export in one file breaks React Fast Refresh and is reported
// by `react-refresh/only-export-components`.
export const AuthContext = createContext(null)

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}