import { type Avo } from '@viaa/avo2-types'

import {
  GET_ASSIGNMENT_GREY,
  GET_ASSIGNMENT_WHITE,
} from '../components/ColorSelect/ColorSelect.const';

export const getBlockColor = (block: Avo.Assignment.Block) => {
  const fallback = ['ZOEK', 'BOUW'].includes(block.type)
    ? GET_ASSIGNMENT_GREY()
    : GET_ASSIGNMENT_WHITE()

  // Note: this condition also makes use of JS's `"" === false` quirk
  return block.color || fallback.value
}
