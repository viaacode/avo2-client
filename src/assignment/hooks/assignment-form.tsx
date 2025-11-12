import { type Avo } from '@viaa/avo2-types'
import { type Dispatch, type SetStateAction, useState } from 'react'

import { ASSIGNMENT_FORM_DEFAULT } from '../assignment.const.js'

// Avoid circular references in type while using the react-hook-form library
export interface AssignmentFields {
  id: string
  title: string
  description: string
  lom_learning_resource_type: Avo.Assignment.Type[] | null
  answer_url?: string | null
  available_at?: string | null // ISO date string
  deadline_at?: string | null // ISO date string
  owner_profile_id: string
  is_deleted: boolean
  is_collaborative: boolean
  created_at: string // ISO date string
  updated_at: string // ISO date string
  view_count?: {
    count: number
  }
  is_public?: boolean
  published_at?: string
  updated_by_profile_id?: string | null
  last_user_edit_at?: string | null
  blocks?: Avo.Assignment.Block[]
  labels?: { assignment_label: Avo.Assignment.Label }[]
  share_type?: Avo.Share.ShareWithColleagueType // Only available when fetching assignments from the assignments_v2_overview table
  education_level_id?: string
  color?: string
}

export type useAssignmentFormState = [
  AssignmentFields,
  Dispatch<SetStateAction<Partial<AssignmentFields> | undefined>>,
]

export function useAssignmentForm(
  initial?: AssignmentFields,
  state?: useAssignmentFormState,
): [
  Partial<AssignmentFields> | undefined,
  Dispatch<SetStateAction<Partial<AssignmentFields> | undefined>>,
  Partial<AssignmentFields> | undefined,
] {
  // Data
  const [defaultValues] = useState<Partial<AssignmentFields> | undefined>(
    initial || ASSIGNMENT_FORM_DEFAULT(),
  )
  const [assignment, setAssignment] = useState<
    Partial<AssignmentFields> | undefined
  >(defaultValues)

  // Return the existing stateful value and dispatcher if present
  if (state) {
    return [state[0], state[1], defaultValues]
  }
  return [assignment, setAssignment, defaultValues]
}
