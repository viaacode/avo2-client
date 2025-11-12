import { type Avo, PermissionName } from '@viaa/avo2-types'

import { PermissionService } from '../../authentication/helpers/permission-service.js'
import { type CheckboxOption } from '../components/CheckboxDropdownModal/CheckboxDropdownModal.js'
import {
  type QuickLaneType,
  QuickLaneTypeEnum,
} from '../components/QuickLaneContent/QuickLaneContent.types.js'

import { tText } from './translate-text.js'

export const isOrganisational = (commonUser?: Avo.User.CommonUser): boolean => {
  return PermissionService.hasAtLeastOnePerm(commonUser, [
    PermissionName.VIEW_OWN_ORGANISATION_QUICK_LANE_OVERVIEW,
  ])
}

export const isPersonal = (commonUser?: Avo.User.CommonUser): boolean => {
  return PermissionService.hasAtLeastOnePerm(commonUser, [
    PermissionName.VIEW_PERSONAL_QUICK_LANE_OVERVIEW,
  ])
}

export const getTypeOptions = (): CheckboxOption[] => {
  const translations: Record<QuickLaneType, string> = {
    ['ITEM']: tText('workspace/views/quick-lane-overview___item'),
    ['COLLECTIE']: tText('workspace/views/quick-lane-overview___collectie'),
  }

  const options: QuickLaneTypeEnum[] = [
    QuickLaneTypeEnum.ITEM,
    QuickLaneTypeEnum.COLLECTION,
  ]

  return options.map((label) => {
    return {
      checked: false,
      id: label,
      label: translations[label] || '',
    }
  })
}
