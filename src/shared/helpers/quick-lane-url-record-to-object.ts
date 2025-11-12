import { AssignmentLayout } from '../../assignment/assignment.types.js'
import {
  type QuickLaneUrlObject,
  type QuickLaneUrlRecord,
} from '../types/index.js'

export const quickLaneUrlRecordToObject = (record: QuickLaneUrlRecord) => {
  const mapped = { ...record } as unknown as QuickLaneUrlObject

  switch (record.view_mode) {
    case 'full':
      mapped.view_mode = AssignmentLayout.PlayerAndText
      break

    case 'without_description':
      mapped.view_mode = AssignmentLayout.OnlyPlayer
      break

    default:
      break
  }

  return mapped
}
