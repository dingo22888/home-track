export type Role = "owner" | "admin" | "member"
export type ConsumerType = "electricity" | "water" | "gas" | "custom"

export interface Profile {
  id: string
  display_name: string | null
  email: string | null
  created_at: string
  updated_at: string
}

export interface Household {
  id: string
  name: string
  address: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Membership {
  id: string
  user_id: string
  household_id: string
  role: Role
  created_at: string
  // Joined fields
  household?: Household
  profile?: Profile
}

export interface Consumer {
  id: string
  household_id: string
  name: string
  type: ConsumerType
  unit: string
  location: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  // Joined / computed
  latest_reading?: Reading | null
}

export interface Reading {
  id: string
  consumer_id: string
  value: number
  reading_date: string
  notes: string | null
  created_by: string | null
  created_at: string
  // Joined
  consumer?: Consumer
  created_by_profile?: Profile
}
