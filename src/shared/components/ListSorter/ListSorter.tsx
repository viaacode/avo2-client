import './ListSorter.scss'

import { type ColorOption } from '@meemoo/admin-core-ui/admin'
import { Button, Icon, IconName } from '@viaa/avo2-components'
import { type Avo } from '@viaa/avo2-types'
import { sortBy } from 'es-toolkit'
import { type FC, Fragment, type ReactNode, useMemo } from 'react'

import { NEW_ASSIGNMENT_BLOCK_ID_PREFIX } from '../../../assignment/assignment.const';
import { ColorSelect } from '../ColorSelect/ColorSelect';
import { GET_ASSIGNMENT_COLORS } from '../ColorSelect/ColorSelect.const';

// Types

export interface ListSorterItem {
  id: string | number // Number is deprecated but still used in collection fragment blocks
  onSlice?: (item: ListSorterItem) => void
  onPositionChange?: (item: ListSorterItem, delta: number) => void
  onBackgroundChange?: (item: ListSorterItem, color: string) => void
  position: number
  icon?: IconName
  color?: string
}

export type ListSorterRenderer<T> = (
  item?: T & ListSorterItem,
  i?: number,
) => ReactNode

export interface ListSorterProps<T> {
  actions?: ListSorterRenderer<T>
  items?: (T & ListSorterItem)[]
  content?: ListSorterRenderer<T>
  divider?: (position: number) => ReactNode
  heading?: ListSorterRenderer<T>
  thumbnail?: ListSorterRenderer<T>
}

// Default renderers

export const ListSorterThumbnail: FC<{ item: ListSorterItem }> = ({ item }) => (
  <Icon name={item.icon} />
)

export const ListSorterPosition: FC<{ item: ListSorterItem; i?: number }> = ({
  item,
  i,
}) => {
  const isFirst = useMemo(() => i === 0, [i])
  const isLast = useMemo(() => i === undefined, [i])

  return (
    <>
      {!isFirst && (
        <Button
          type="secondary"
          icon={IconName.chevronUp}
          onClick={() => item.onPositionChange?.(item, -1)}
        />
      )}
      {!isLast && (
        <Button
          type="secondary"
          icon={IconName.chevronDown}
          onClick={() => item.onPositionChange?.(item, 1)}
        />
      )}
    </>
  )
}

export const ListSorterSlice: FC<{ item: ListSorterItem }> = ({ item }) => (
  <Button
    type="secondary"
    icon={IconName.delete}
    onClick={() => item.onSlice?.(item)}
  />
)

export const ListSorterColor: FC<{
  item: ListSorterItem
  options?: ColorOption[]
}> = ({ item, options }) => {
  const colors = options || GET_ASSIGNMENT_COLORS()
  const selected = colors.find(({ value }) => value === item.color)

  return (
    <ColorSelect
      value={selected} // Default set in use-block-list
      options={colors}
      onChange={(option) =>
        item.onBackgroundChange?.(item, (option as ColorOption).value)
      }
    />
  )
}

// Main renderer
type ListSorterType<T = ListSorterItem & any> = FC<ListSorterProps<T>>
const ListSorter: ListSorterType = ({
  items = [],
  thumbnail = ((item) =>
    item && <ListSorterThumbnail item={item} />) as ListSorterRenderer<unknown>,
  heading = () => 'heading',
  divider = () => 'divider',
  actions = (item, index) =>
    item && (
      <>
        <ListSorterPosition item={item} i={index} />
        <ListSorterSlice item={item} />
      </>
    ),
  content = () => 'content',
}) => {
  const emptyId = `${NEW_ASSIGNMENT_BLOCK_ID_PREFIX}empty`

  const renderItem: ListSorterRenderer<unknown> = (
    item?: ListSorterItem,
    i?: number,
  ) =>
    item && (
      <Fragment key={`${item.id}--${i}`}>
        {item.id !== emptyId && (
          <li className="c-list-sorter__item">
            <div className="c-list-sorter__item__header">
              {thumbnail && (
                <div className="c-list-sorter__item__thumbnail">
                  {thumbnail(item, i)}
                </div>
              )}

              {heading && (
                <div className="c-list-sorter__item__heading">
                  {heading(item, i)}
                </div>
              )}

              {actions && (
                <div className="c-list-sorter__item__actions">
                  {actions(item, i)}
                </div>
              )}
            </div>

            {content && (
              <div
                className="c-list-sorter__item__content"
                style={{
                  backgroundColor: item.color,
                }}
              >
                {content(item, i)}
              </div>
            )}
          </li>
        )}

        {divider && (
          <div className="c-list-sorter__divider">
            <hr />
            {divider(item.position + 1)}
            <hr />
          </div>
        )}
      </Fragment>
    )

  return (
    <ul className="c-list-sorter">
      {divider && (
        <div className="c-list-sorter__divider">
          <hr />
          {divider(0)}
          <hr />
        </div>
      )}
      {sortBy(items, ['position']).map((item, i) => {
        const j = items.length === i + 1 ? undefined : i
        return renderItem(item, j)
      })}
    </ul>
  )
}

// TODO: use this pattern for CollectionOrBundle to reduce overhead
export const BlockListSorter =
  ListSorter as ListSorterType<Avo.Core.BlockItemBase>
