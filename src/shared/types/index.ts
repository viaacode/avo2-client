import { type IconName } from '@viaa/avo2-components'
import { type Avo } from '@viaa/avo2-types'
import { type ReactElement } from 'react'

import { type NewsletterPreferences } from '../services/campaign-monitor-service.js'

export * from './quick-lane.js'

export enum KeyCode {
  Enter = 13,
}

export type NewsletterList = keyof NewsletterPreferences

export type NavigationItemInfo = {
  label: string | ReactElement
  key: string
  location?: string
  exact?: boolean
  target: string
  component?: ReactElement
  icon?: IconName
  subLinks?: NavigationItemInfo[]
  tooltip?: string
}

export type ReactSelectOption<T = any> = {
  label: string
  value: T
}

// Get all possible values from object
export type ValueOf<T> = T[keyof T]

export interface LabeledFormField {
  label?: string
  help?: string
}

export type Positioned = { position: number; created_at: string }

export type UnpublishableItem =
  | (Avo.Item.Item & { replacement_for?: string })
  | null
