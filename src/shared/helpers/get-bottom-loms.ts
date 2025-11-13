import { type Avo } from '@viaa/avo2-types'
import { sortBy } from 'es-toolkit'

import { groupLoms } from './lom';

export const getBottomLoms = (loms: Avo.Lom.LomField[]) => {
  // Group loms to split the incoming loms in levels and degrees
  const groupedLoms = groupLoms(loms)
  const parentIdsOfDegrees = groupedLoms.educationDegree.map(
    (lom) => lom.broader,
  )
  // Filter out the education levels which have a child education degree
  const childlessLevels = groupedLoms.educationLevel.filter(
    (level) => !parentIdsOfDegrees.includes(level.id),
  )

  return sortBy(
    [...groupedLoms.educationDegree, ...childlessLevels],
    [(lom) => lom.label.toLocaleLowerCase()],
  )
}
