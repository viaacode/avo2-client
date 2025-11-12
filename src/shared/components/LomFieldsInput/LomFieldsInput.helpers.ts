import { type SelectOption, type TagInfo } from '@viaa/avo2-components'
import { type Avo } from '@viaa/avo2-types'
import { capitalize, compact, isNil } from 'es-toolkit'

export const mapLomFieldsToOptions = (
  lomFields: Avo.Lom.LomField[],
): SelectOption<any>[] => {
  return (lomFields || []).map(
    (lomField) =>
      ({
        value: lomField.id,
        label: capitalize(lomField.label),
      }) as SelectOption<any>,
  )
}

export const mapOptionsToLomFields = (
  options: TagInfo[],
  originalLoms: Avo.Lom.LomField[],
): Avo.Lom.LomField[] => {
  return compact(
    (options || []).map((option) => {
      return originalLoms.find(
        (lom) => lom.id === option.value,
      ) as Avo.Lom.LomField
    }),
  )
}

export const getParentEducationLevel = (
  loms: Avo.Lom.LomField[],
  allLoms: Avo.Lom.LomField[],
): Avo.Lom.LomField[] => {
  return compact(
    loms.map((lom) => {
      if (isNil(lom.broader)) {
        return null
      }

      let foundParent: Avo.Lom.LomField | undefined = (allLoms || []).find(
        (edu) => edu.id === lom.broader,
      )

      while (!isNil(foundParent?.broader)) {
        foundParent = (allLoms || []).find(
          (edu) => edu.id === foundParent?.broader,
        )
      }

      return foundParent
    }),
  )
}
