import { BlockHeading } from '@meemoo/admin-core-ui/client'
import { Avo } from '@viaa/avo2-types'
import React, { type FC } from 'react'
import { Link } from 'react-router-dom'

import { APP_PATH } from '../../constants.js'
import { buildLink } from '../../shared/helpers/build-link.js'
import {
  type BlockItemComponent,
  ContentTypeNumber,
} from '../collection.types.js'

import './CollectionFragmentTitle.scss'

export interface CollectionFragmentTitleProps extends BlockItemComponent {
  canClickHeading?: boolean
}

export const CollectionFragmentTitle: FC<CollectionFragmentTitleProps> = ({
  block,
  canClickHeading,
}) => {
  const heading = (
    <BlockHeading type="h2" className="c-collection-fragment-title">
      {block?.use_custom_fields || block?.type === Avo.Core.BlockItemType.TEXT
        ? block.custom_title || block?.item_meta?.title
        : (block as Avo.Assignment.Block).original_title ||
          block?.item_meta?.title}
    </BlockHeading>
  )

  if (
    canClickHeading &&
    block &&
    block.type === Avo.Core.BlockItemType.ITEM &&
    block.item_meta?.type_id &&
    [ContentTypeNumber.video, ContentTypeNumber.audio].includes(
      block.item_meta?.type_id,
    )
  ) {
    const link = buildLink(APP_PATH.ITEM_DETAIL.route, {
      id: (block.item_meta as Avo.Item.Item).external_id || '',
    })

    return <Link to={link}>{heading}</Link>
  }

  return heading
}
