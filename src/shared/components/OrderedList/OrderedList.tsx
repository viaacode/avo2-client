import React, { type FC } from 'react'
import './OrderedList.scss'

interface OrderedListProps {
  listItems: string[]
}

export const OrderedList: FC<OrderedListProps> = ({ listItems }) => {
  return (
    <div>
      <ol className="c-ordered-list">
        {listItems.map((item, index) => {
          return (
            <li
              key={`ordered-list-item-${index}`}
              className="c-ordered-list__item"
            >
              <div className="c-ordered-list__indicator">{index + 1}</div>
              {item}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
