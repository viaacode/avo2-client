import { TagList, type TagOption } from '@viaa/avo2-components'
import { type Avo } from '@viaa/avo2-types'
import React, { type MouseEvent, type ReactNode } from 'react'

export function stringsToTagList(
  labelsOrObjs: string[] | any[],
  propOrLabelSelectFunc: string | ((obj: any) => string) | null = null,
  onTagClicked?: (tagId: string | number, clickEvent: MouseEvent) => void,
  onTagClosed?: (tagId: string | number, clickEvent: MouseEvent) => void,
): ReactNode {
  if (!labelsOrObjs || !labelsOrObjs.length) {
    return null
  }
  return (
    <TagList
      tags={(labelsOrObjs as any[]).map(
        (labelOrObj: string | any): TagOption => {
          let label: string
          if (typeof propOrLabelSelectFunc === 'string') {
            label = labelOrObj[propOrLabelSelectFunc]
          } else if (propOrLabelSelectFunc) {
            label = propOrLabelSelectFunc(labelOrObj)
          } else {
            label = labelOrObj
          }
          return {
            label,
            id: label,
          }
        },
      )}
      closable={!!onTagClosed}
      onTagClicked={onTagClicked}
      onTagClosed={(tagId, evt) => onTagClosed?.(tagId, evt)}
      swatches={false}
    />
  )
}

export function lomsToTagList(
  labelsOrObjs: Avo.Lom.LomField[] | any[],
  onTagClicked?: (tagId: string | number, clickEvent: MouseEvent) => void,
  onTagClosed?: (tagId: string | number, clickEvent: MouseEvent) => void,
): ReactNode {
  if (!labelsOrObjs || !labelsOrObjs.length) {
    return null
  }
  return (
    <TagList
      tags={(labelsOrObjs as any[]).map(
        (lomEntry: Avo.Lom.LomField): TagOption => {
          return {
            label: lomEntry.label,
            id: lomEntry.id,
          }
        },
      )}
      closable={!!onTagClosed}
      onTagClicked={onTagClicked}
      onTagClosed={(tagId, evt) => onTagClosed?.(tagId, evt)}
      swatches={false}
    />
  )
}
