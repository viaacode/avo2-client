import { sortBy } from 'es-toolkit'

import { type Positioned } from '../../shared/types/index';
import { setBlockPositionToIndex } from '../assignment.helper';

export function insertMultipleAtPosition(
  list: Positioned[],
  ...items: Positioned[]
): Positioned[] {
  const sortedList = sortBy(list, ['position'])

  sortedList.splice(items[0].position, 0, ...items)

  return setBlockPositionToIndex(sortedList)
}
