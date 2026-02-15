"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import { createClient } from "@/lib/supabase/client"
import type { Household, Membership } from "@/lib/types"

interface HouseholdContextValue {
  households: Household[]
  memberships: Membership[]
  activeHousehold: Household | null
  setActiveHouseholdId: (id: string) => void
  loading: boolean
  refresh: () => Promise<void>
}

const HouseholdContext = createContext<HouseholdContextValue | undefined>(
  undefined
)

const ACTIVE_HOUSEHOLD_KEY = "hometrack-active-household"

export function HouseholdProvider({ children }: { children: ReactNode }) {
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [activeHouseholdId, setActiveHouseholdIdState] = useState<
    string | null
  >(null)
  const [loading, setLoading] = useState(true)

  const fetchMemberships = useCallback(async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setMemberships([])
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("memberships")
      .select("*, household:households(*)")
      .eq("user_id", user.id)

    if (error) {
      console.error("Failed to fetch memberships:", error)
      setMemberships([])
    } else {
      setMemberships(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchMemberships()
  }, [fetchMemberships])

  // Restore active household from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(ACTIVE_HOUSEHOLD_KEY)
      if (stored) {
        setActiveHouseholdIdState(stored)
      }
    }
  }, [])

  // Auto-select first household if none selected
  useEffect(() => {
    if (!loading && memberships.length > 0 && !activeHouseholdId) {
      const firstId = memberships[0].household_id
      setActiveHouseholdIdState(firstId)
      localStorage.setItem(ACTIVE_HOUSEHOLD_KEY, firstId)
    }
  }, [loading, memberships, activeHouseholdId])

  function setActiveHouseholdId(id: string) {
    setActiveHouseholdIdState(id)
    localStorage.setItem(ACTIVE_HOUSEHOLD_KEY, id)
  }

  const households = memberships
    .map((m) => m.household)
    .filter(Boolean) as Household[]

  const activeHousehold =
    households.find((h) => h.id === activeHouseholdId) || null

  return (
    <HouseholdContext.Provider
      value={{
        households,
        memberships,
        activeHousehold,
        setActiveHouseholdId,
        loading,
        refresh: fetchMemberships,
      }}
    >
      {children}
    </HouseholdContext.Provider>
  )
}

export function useHousehold() {
  const ctx = useContext(HouseholdContext)
  if (!ctx) {
    throw new Error("useHousehold must be used within a HouseholdProvider")
  }
  return ctx
}
