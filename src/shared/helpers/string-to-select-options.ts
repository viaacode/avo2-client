import { type TagInfo } from '@viaa/avo2-components'
import { type Avo } from '@viaa/avo2-types'

export function lomToTagInfo(lomEntry: Avo.Lom.LomField): TagInfo {
  return {
    label: lomEntry.label,
    value: lomEntry.id,
  }
}
