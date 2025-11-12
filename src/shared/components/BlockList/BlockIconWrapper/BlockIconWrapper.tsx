import { Container, Icon } from '@viaa/avo2-components'
import { type Avo } from '@viaa/avo2-types'
import React, { type FC } from 'react'

import { type ContentTypeNumber } from '../../../../collection/collection.types.js'

import './BlockIconWrapper.scss'
import { BLOCK_TYPE_TO_ICON_NAME } from './BlockIconWrapper.consts.js'
import { getBlockType } from './BlockIconWrapper.helpers.js'

interface BlockIconWrapperProps {
  backgroundColor?: string
  key: string | number // Needs to be defined where you use the component
  type: Avo.Core.BlockItemType
  type_id?: ContentTypeNumber
  children: React.ReactNode
}

export const BlockIconWrapper: FC<BlockIconWrapperProps> = ({
  backgroundColor = '#fff',
  type,
  type_id,
  children,
}) => {
  return (
    <div
      className="u-p-0 c-block-list__item"
      style={{ backgroundColor, '--block-background': backgroundColor }}
    >
      <Container mode="horizontal">
        <div className="u-padding-top-l u-padding-bottom-l">
          <div className="c-icon-bar">
            <div className="c-icon-bar__sidebar">
              <Icon
                name={BLOCK_TYPE_TO_ICON_NAME[getBlockType(type, type_id)]}
              />
            </div>
            <div className="c-icon-bar__content">{children}</div>
          </div>
        </div>
      </Container>
    </div>
  )
}
