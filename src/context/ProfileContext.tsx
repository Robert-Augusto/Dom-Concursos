'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'

interface ProfileContextType {
  profile: Profile | null
  loading: boolean
  isAuthenticated: boolean
  refreshProfile: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  loading: true,
  isAuthenticated: false,
  refreshProfile: async () => {},
})

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const refreshProfile = useCallback(async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setIsAuthenticated(false)
      setProfile(null)
      setLoading(false)
      return
    }

    setIsAuthenticated(true)

    const { data } = await supabase
      .from('profile')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) setProfile(data ?? null)
    setLoading(false)
  }, [])

  useEffect(() => {
    const supabase = createClient()

    void refreshProfile()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        void refreshProfile()
        return
      }

      setProfile(null)
      setIsAuthenticated(false)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [refreshProfile])

  return (
    <ProfileContext.Provider value={{ profile, loading, isAuthenticated, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => useContext(ProfileContext)